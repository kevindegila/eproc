import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CrossWorkflowService } from '../src/cross-workflow/cross-workflow.service';
import { EngineService } from '../src/engine/engine.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('CrossWorkflowService', () => {
  let service: CrossWorkflowService;
  let prisma: Record<string, any>;
  let engine: Record<string, any>;

  const mockInstance = {
    id: 'inst-1',
    definitionId: 'def-1',
    entityType: 'DAC',
    entityId: 'entity-1',
    status: 'ACTIVE',
    currentNode: { code: 'ACTION', label: 'Action' },
    definition: { id: 'def-1', name: 'WF Test' },
  };

  beforeEach(async () => {
    prisma = {
      workflowInstance: {
        findUnique: jest.fn().mockResolvedValue(mockInstance),
        findMany: jest.fn().mockResolvedValue([mockInstance]),
      },
    };

    engine = {
      suspend: jest.fn().mockResolvedValue({ ...mockInstance, status: 'SUSPENDED' }),
      resume: jest.fn().mockResolvedValue({ ...mockInstance, status: 'ACTIVE' }),
      cancel: jest.fn().mockResolvedValue({ ...mockInstance, status: 'CANCELLED' }),
      start: jest.fn().mockResolvedValue({ id: 'child-inst-1', status: 'ACTIVE' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrossWorkflowService,
        { provide: PrismaService, useValue: prisma },
        { provide: EngineService, useValue: engine },
      ],
    }).compile();

    service = module.get<CrossWorkflowService>(CrossWorkflowService);
  });

  describe('suspendByEntity', () => {
    it('devrait suspendre toutes les instances actives d\'une entité', async () => {
      const result = await service.suspendByEntity('DAC', 'entity-1', 'user-1', 'Recours');

      expect(result.message).toContain('1 instance(s) suspendue(s)');
      expect(engine.suspend).toHaveBeenCalledWith('inst-1', 'user-1', 'Recours');
    });

    it('devrait lever NotFoundException si aucune instance active', async () => {
      prisma.workflowInstance.findMany.mockResolvedValue([]);

      await expect(
        service.suspendByEntity('DAC', 'entity-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait suspendre plusieurs instances en cascade', async () => {
      prisma.workflowInstance.findMany.mockResolvedValue([
        { ...mockInstance, id: 'inst-1' },
        { ...mockInstance, id: 'inst-2' },
        { ...mockInstance, id: 'inst-3' },
      ]);

      const result = await service.suspendByEntity('DAC', 'entity-1', 'user-1');

      expect(result.message).toContain('3 instance(s) suspendue(s)');
      expect(engine.suspend).toHaveBeenCalledTimes(3);
    });
  });

  describe('resumeByEntity', () => {
    it('devrait reprendre toutes les instances suspendues', async () => {
      prisma.workflowInstance.findMany.mockResolvedValue([
        { ...mockInstance, status: 'SUSPENDED' },
      ]);

      const result = await service.resumeByEntity('DAC', 'entity-1', 'user-1');

      expect(result.message).toContain('1 instance(s) reprise(s)');
      expect(engine.resume).toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si aucune instance suspendue', async () => {
      prisma.workflowInstance.findMany.mockResolvedValue([]);

      await expect(
        service.resumeByEntity('DAC', 'entity-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelByEntity', () => {
    it('devrait annuler toutes les instances actives/suspendues', async () => {
      prisma.workflowInstance.findMany.mockResolvedValue([
        { ...mockInstance, id: 'inst-1', status: 'ACTIVE' },
        { ...mockInstance, id: 'inst-2', status: 'SUSPENDED' },
      ]);

      const result = await service.cancelByEntity('DAC', 'entity-1', 'user-1', 'Annulation');

      expect(result.message).toContain('2 instance(s) annulée(s)');
      expect(engine.cancel).toHaveBeenCalledTimes(2);
    });
  });

  describe('cascadeStart', () => {
    it('devrait démarrer un workflow enfant après complétion du parent', async () => {
      prisma.workflowInstance.findUnique.mockResolvedValue({
        ...mockInstance,
        status: 'COMPLETED',
      });

      const result = await service.cascadeStart(
        'inst-1',
        'CONTRAT',
        'contrat-1',
        'user-1',
        'APPEL_OFFRES_OUVERT',
      );

      expect(result.id).toBe('child-inst-1');
      expect(engine.start).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'CONTRAT',
          entityId: 'contrat-1',
          context: expect.objectContaining({
            parentWorkflowInstanceId: 'inst-1',
          }),
        }),
      );
    });

    it('devrait refuser si le parent n\'est pas COMPLETED', async () => {
      prisma.workflowInstance.findUnique.mockResolvedValue(mockInstance); // status: ACTIVE

      await expect(
        service.cascadeStart('inst-1', 'CONTRAT', 'c-1', 'u-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever NotFoundException si le parent n\'existe pas', async () => {
      prisma.workflowInstance.findUnique.mockResolvedValue(null);

      await expect(
        service.cascadeStart('inexistant', 'CONTRAT', 'c-1', 'u-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEntityWorkflows', () => {
    it('devrait retourner tous les workflows d\'une entité', async () => {
      prisma.workflowInstance.findMany.mockResolvedValue([
        { ...mockInstance, _count: { events: 5 } },
      ]);

      const result = await service.getEntityWorkflows('DAC', 'entity-1');

      expect(result).toHaveLength(1);
      expect(prisma.workflowInstance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entityType: 'DAC', entityId: 'entity-1' },
        }),
      );
    });
  });
});
