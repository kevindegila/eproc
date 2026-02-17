import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

export interface WorkflowKafkaEvent {
  eventType: 'WORKFLOW_STARTED' | 'WORKFLOW_TRANSITIONED' | 'WORKFLOW_COMPLETED' | 'WORKFLOW_CANCELLED' | 'WORKFLOW_SUSPENDED' | 'WORKFLOW_RESUMED' | 'SLA_BREACHED';
  instanceId: string;
  definitionId: string;
  entityType: string;
  entityId: string;
  fromNodeCode?: string;
  toNodeCode?: string;
  action: string;
  actorId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private producer: Producer | null = null;
  private readonly topic = 'eproc.workflow.events';

  async onModuleInit() {
    if (!process.env.KAFKA_BROKERS) {
      this.logger.warn('KAFKA_BROKERS non configuré — événements Kafka désactivés');
      return;
    }

    const kafka = new Kafka({
      clientId: 'ms-workflow',
      brokers: process.env.KAFKA_BROKERS.split(','),
    });

    this.producer = kafka.producer();
    await this.producer.connect();
    this.logger.log('Kafka producer connecté');
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  async emit(event: WorkflowKafkaEvent): Promise<void> {
    if (!this.producer) {
      this.logger.debug('Kafka non connecté, événement ignoré: %s', event.eventType);
      return;
    }

    await this.producer.send({
      topic: this.topic,
      messages: [
        {
          key: event.instanceId,
          value: JSON.stringify(event),
          headers: {
            eventType: event.eventType,
            entityType: event.entityType,
          },
        },
      ],
    });

    this.logger.debug('Événement Kafka émis: %s pour instance %s', event.eventType, event.instanceId);
  }
}
