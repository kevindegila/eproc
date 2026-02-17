import { Test, TestingModule } from '@nestjs/testing';
import { TimerService } from '../src/timer/timer.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { KafkaService } from '../src/kafka/kafka.service';

describe('TimerService', () => {
  let service: TimerService;
  let prisma: Record<string, any>;
  let kafka: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      workflowInstance: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      workflowEvent: {
        create: jest.fn().mockResolvedValue({}),
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };

    kafka = {
      emit: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimerService,
        { provide: PrismaService, useValue: prisma },
        { provide: KafkaService, useValue: kafka },
      ],
    }).compile();

    service = module.get<TimerService>(TimerService);
  });

  describe('checkSlaBreaches', () => {
    it('ne devrait rien faire s\'il n\'y a pas d\'instances avec SLA', async () => {
      prisma.workflowInstance.findMany.mockResolvedValue([]);

      await service.checkSlaBreaches();

      expect(prisma.workflowEvent.create).not.toHaveBeenCalled();
      expect(kafka.emit).not.toHaveBeenCalled();
    });

    it('devrait détecter un dépassement de SLA', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 50); // 50h ago

      prisma.workflowInstance.findMany.mockResolvedValue([{
        id: 'inst-1',
        definitionId: 'def-1',
        entityType: 'DAC',
        entityId: 'entity-1',
        currentNodeId: 'node-1',
        currentNode: { code: 'REDACTION', label: 'Rédaction', slaHours: 48 },
        definition: { id: 'def-1', name: 'WF Test' },
        events: [{ timestamp: pastDate }],
      }]);

      await service.checkSlaBreaches();

      expect(prisma.workflowEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'SLA_BREACHED',
            actorId: 'SYSTEM',
          }),
        }),
      );
      expect(kafka.emit).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'SLA_BREACHED' }),
      );
    });

    it('ne devrait pas créer de doublon de SLA breach', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 50);

      prisma.workflowInstance.findMany.mockResolvedValue([{
        id: 'inst-1',
        definitionId: 'def-1',
        entityType: 'DAC',
        entityId: 'entity-1',
        currentNodeId: 'node-1',
        currentNode: { code: 'REDACTION', label: 'Rédaction', slaHours: 48 },
        definition: { id: 'def-1', name: 'WF Test' },
        events: [{ timestamp: pastDate }],
      }]);

      // Existing breach event
      prisma.workflowEvent.findFirst.mockResolvedValue({ id: 'existing-breach' });

      await service.checkSlaBreaches();

      expect(prisma.workflowEvent.create).not.toHaveBeenCalled();
    });

    it('ne devrait pas alerter si le SLA n\'est pas dépassé', async () => {
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 1); // 1h ago

      prisma.workflowInstance.findMany.mockResolvedValue([{
        id: 'inst-1',
        definitionId: 'def-1',
        entityType: 'DAC',
        entityId: 'entity-1',
        currentNodeId: 'node-1',
        currentNode: { code: 'REDACTION', label: 'Rédaction', slaHours: 48 },
        definition: { id: 'def-1', name: 'WF Test' },
        events: [{ timestamp: recentDate }],
      }]);

      await service.checkSlaBreaches();

      expect(prisma.workflowEvent.create).not.toHaveBeenCalled();
    });
  });

  describe('getSlaStatus', () => {
    it('devrait retourner hasSla: false si pas de SLA', async () => {
      prisma.workflowInstance.findUnique.mockResolvedValue({
        currentNode: { slaHours: null },
        events: [],
      });

      const result = await service.getSlaStatus('inst-1');
      expect(result.hasSla).toBe(false);
    });

    it('devrait retourner le statut SLA avec temps restant', async () => {
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 10);

      prisma.workflowInstance.findUnique.mockResolvedValue({
        currentNode: { code: 'REDACTION', slaHours: 48 },
        events: [{ timestamp: recentDate }],
      });

      const result = await service.getSlaStatus('inst-1');
      expect(result.hasSla).toBe(true);
      expect(result.slaHours).toBe(48);
      expect(result.isBreached).toBe(false);
      expect(result.remainingHours).toBeGreaterThan(0);
    });
  });

  describe('getUpcomingDeadlines', () => {
    it('devrait retourner les deadlines proches triées par urgence', async () => {
      const now = new Date();

      const instance1Event = new Date(now);
      instance1Event.setHours(instance1Event.getHours() - 46); // 2h remaining on 48h SLA

      const instance2Event = new Date(now);
      instance2Event.setHours(instance2Event.getHours() - 20); // 4h remaining on 24h SLA

      prisma.workflowInstance.findMany.mockResolvedValue([
        {
          id: 'inst-1',
          entityType: 'DAC',
          entityId: 'e-1',
          definitionId: 'def-1',
          currentNodeId: 'n-1',
          currentNode: { code: 'REDACTION', label: 'Rédaction', slaHours: 48 },
          definition: { id: 'def-1', name: 'WF1', entityType: 'DAC' },
          events: [{ timestamp: instance1Event }],
        },
        {
          id: 'inst-2',
          entityType: 'DAC',
          entityId: 'e-2',
          definitionId: 'def-1',
          currentNodeId: 'n-2',
          currentNode: { code: 'VALIDATION', label: 'Validation', slaHours: 24 },
          definition: { id: 'def-1', name: 'WF1', entityType: 'DAC' },
          events: [{ timestamp: instance2Event }],
        },
      ]);

      const result = await service.getUpcomingDeadlines(24);

      expect(result).toHaveLength(2);
      // inst-1 has ~2h remaining, inst-2 has ~4h remaining
      expect(result[0].instanceId).toBe('inst-1');
      expect(result[1].instanceId).toBe('inst-2');
    });
  });
});
