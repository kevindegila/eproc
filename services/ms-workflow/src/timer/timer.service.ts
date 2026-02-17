import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class TimerService {
  private readonly logger = new Logger(TimerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Check for SLA breaches every 15 minutes.
   * Finds active instances where current node has sla_hours
   * and the last event timestamp exceeds the deadline.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkSlaBreaches() {
    const now = new Date();

    // Find active instances with SLA-defined current nodes
    const instances = await this.prisma.workflowInstance.findMany({
      where: {
        status: 'ACTIVE',
        currentNode: {
          slaHours: { not: null },
        },
      },
      include: {
        currentNode: true,
        definition: { select: { id: true, name: true } },
        events: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    for (const instance of instances) {
      if (!instance.currentNode?.slaHours) continue;

      const lastEvent = instance.events[0];
      if (!lastEvent) continue;

      const deadline = new Date(lastEvent.timestamp);
      deadline.setHours(deadline.getHours() + instance.currentNode.slaHours);

      if (now > deadline) {
        // Check if we already recorded an SLA breach event for this node
        const existingBreach = await this.prisma.workflowEvent.findFirst({
          where: {
            instanceId: instance.id,
            fromNodeId: instance.currentNodeId,
            action: 'SLA_BREACHED',
          },
        });

        if (existingBreach) continue;

        this.logger.warn(
          'SLA dépassé: instance=%s noeud=%s deadline=%s',
          instance.id,
          instance.currentNode.code,
          deadline.toISOString(),
        );

        // Record SLA breach event (immutable)
        await this.prisma.workflowEvent.create({
          data: {
            instanceId: instance.id,
            fromNodeId: instance.currentNodeId,
            action: 'SLA_BREACHED',
            actorId: 'SYSTEM',
            comment: `SLA de ${instance.currentNode.slaHours}h dépassé sur le nœud "${instance.currentNode.label}"`,
          },
        });

        await this.kafka.emit({
          eventType: 'SLA_BREACHED',
          instanceId: instance.id,
          definitionId: instance.definitionId,
          entityType: instance.entityType,
          entityId: instance.entityId,
          fromNodeCode: instance.currentNode.code,
          action: 'SLA_BREACHED',
          actorId: 'SYSTEM',
          timestamp: now.toISOString(),
          metadata: {
            slaHours: instance.currentNode.slaHours,
            deadline: deadline.toISOString(),
            overdueSince: lastEvent.timestamp.toISOString(),
          },
        });
      }
    }
  }

  /**
   * Get SLA status for a specific instance
   */
  async getSlaStatus(instanceId: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        currentNode: true,
        events: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    if (!instance || !instance.currentNode?.slaHours) {
      return { hasSla: false };
    }

    const lastEvent = instance.events[0];
    if (!lastEvent) {
      return { hasSla: false };
    }

    const deadline = new Date(lastEvent.timestamp);
    deadline.setHours(deadline.getHours() + instance.currentNode.slaHours);

    const now = new Date();
    const remainingMs = deadline.getTime() - now.getTime();
    const remainingHours = Math.round(remainingMs / (1000 * 60 * 60) * 10) / 10;

    return {
      hasSla: true,
      slaHours: instance.currentNode.slaHours,
      deadline: deadline.toISOString(),
      isBreached: now > deadline,
      remainingHours: Math.max(0, remainingHours),
      currentNode: instance.currentNode.code,
    };
  }

  /**
   * Get all instances with upcoming SLA deadlines (within N hours)
   */
  async getUpcomingDeadlines(withinHours: number = 24) {
    const instances = await this.prisma.workflowInstance.findMany({
      where: {
        status: 'ACTIVE',
        currentNode: {
          slaHours: { not: null },
        },
      },
      include: {
        currentNode: true,
        definition: { select: { id: true, name: true, entityType: true } },
        events: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    const now = new Date();
    const results = [];

    for (const instance of instances) {
      if (!instance.currentNode?.slaHours || !instance.events[0]) continue;

      const deadline = new Date(instance.events[0].timestamp);
      deadline.setHours(deadline.getHours() + instance.currentNode.slaHours);

      const remainingMs = deadline.getTime() - now.getTime();
      const remainingHours = remainingMs / (1000 * 60 * 60);

      if (remainingHours <= withinHours) {
        results.push({
          instanceId: instance.id,
          entityType: instance.entityType,
          entityId: instance.entityId,
          definitionName: instance.definition.name,
          currentNode: instance.currentNode.code,
          currentNodeLabel: instance.currentNode.label,
          slaHours: instance.currentNode.slaHours,
          deadline: deadline.toISOString(),
          remainingHours: Math.max(0, Math.round(remainingHours * 10) / 10),
          isBreached: remainingHours < 0,
        });
      }
    }

    return results.sort((a, b) => a.remainingHours - b.remainingHours);
  }
}
