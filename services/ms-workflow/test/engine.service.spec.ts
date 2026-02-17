import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { EngineService } from '../src/engine/engine.service';
import { GuardEvaluatorService } from '../src/engine/guard-evaluator.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { KafkaService } from '../src/kafka/kafka.service';

describe('EngineService', () => {
  let service: EngineService;
  let prisma: Record<string, any>;
  let kafka: Record<string, any>;

  const mockStartNode = {
    id: 'node-start',
    code: 'START',
    label: 'Début',
    nodeType: 'START',
    definitionId: 'def-1',
  };

  const mockActionNode = {
    id: 'node-action',
    code: 'REDACTION_DAO',
    label: 'Rédaction DAO',
    nodeType: 'ACTION',
    assigneeRole: 'AGENT_PPM',
    slaHours: 48,
  };

  const mockEndNode = {
    id: 'node-end',
    code: 'END',
    label: 'Fin',
    nodeType: 'END',
  };

  const mockDefinition = {
    id: 'def-1',
    name: 'Test Workflow',
    entityType: 'DAC',
  };

  const mockInstance = {
    id: 'inst-1',
    definitionId: 'def-1',
    entityType: 'DAC',
    entityId: 'entity-1',
    currentNodeId: 'node-action',
    currentNode: mockActionNode,
    definition: mockDefinition,
    status: 'ACTIVE',
    loopCount: 0,
    context: null,
    startedAt: new Date(),
    completedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      workflowDefinition: {
        findFirst: jest.fn().mockResolvedValue(mockDefinition),
      },
      workflowNode: {
        findFirst: jest.fn().mockResolvedValue(mockStartNode),
      },
      workflowTransition: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'trans-1',
          toNode: mockActionNode,
          toNodeId: mockActionNode.id,
        }),
        findMany: jest.fn().mockResolvedValue([{
          id: 'trans-2',
          action: 'VALIDER',
          fromNodeId: 'node-action',
          toNodeId: 'node-end',
          toNode: mockEndNode,
          guardExpression: null,
          requiresComment: false,
          requiresSignature: false,
          requiresAttachment: false,
        }]),
      },
      workflowInstance: {
        findUnique: jest.fn().mockResolvedValue(mockInstance),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([mockInstance]),
        create: jest.fn().mockResolvedValue(mockInstance),
        update: jest.fn().mockResolvedValue(mockInstance),
      },
      workflowEvent: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn().mockImplementation((fn) => fn(prisma)),
    };

    kafka = {
      emit: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngineService,
        GuardEvaluatorService,
        { provide: PrismaService, useValue: prisma },
        { provide: KafkaService, useValue: kafka },
      ],
    }).compile();

    service = module.get<EngineService>(EngineService);
  });

  describe('start', () => {
    it('devrait démarrer un workflow et avancer au premier nœud après START', async () => {
      const result = await service.start({
        entityType: 'DAC',
        entityId: 'entity-1',
        actorId: 'user-1',
      });

      expect(result).toBeDefined();
      expect(prisma.workflowInstance.create).toHaveBeenCalled();
      expect(prisma.workflowEvent.create).toHaveBeenCalled();
      expect(kafka.emit).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'WORKFLOW_STARTED' }),
      );
    });

    it('devrait lever NotFoundException si aucune définition active', async () => {
      prisma.workflowDefinition.findFirst.mockResolvedValue(null);

      await expect(
        service.start({ entityType: 'INCONNU', entityId: 'e-1', actorId: 'u-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever ConflictException si une instance active existe déjà', async () => {
      prisma.workflowInstance.findFirst.mockResolvedValue(mockInstance);

      await expect(
        service.start({ entityType: 'DAC', entityId: 'entity-1', actorId: 'u-1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('transition', () => {
    it('devrait exécuter une transition valide', async () => {
      prisma.workflowInstance.update.mockResolvedValue({
        ...mockInstance,
        currentNodeId: 'node-end',
        currentNode: mockEndNode,
        status: 'COMPLETED',
      });

      const result = await service.transition('inst-1', {
        action: 'VALIDER',
        actorId: 'user-1',
      });

      expect(result).toBeDefined();
      expect(prisma.workflowEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'VALIDER' }),
        }),
      );
      expect(kafka.emit).toHaveBeenCalled();
    });

    it('devrait rejeter une transition sur une instance non-ACTIVE', async () => {
      prisma.workflowInstance.findUnique.mockResolvedValue({
        ...mockInstance,
        status: 'SUSPENDED',
      });

      await expect(
        service.transition('inst-1', { action: 'VALIDER', actorId: 'u-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait rejeter une action inexistante depuis le nœud courant', async () => {
      prisma.workflowTransition.findMany.mockResolvedValue([]);

      await expect(
        service.transition('inst-1', { action: 'ACTION_INEXISTANTE', actorId: 'u-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait exiger un commentaire si requires_comment est true', async () => {
      prisma.workflowTransition.findMany.mockResolvedValue([{
        id: 'trans-3',
        action: 'REJETER',
        toNode: mockActionNode,
        guardExpression: null,
        requiresComment: true,
        requiresSignature: false,
        requiresAttachment: false,
      }]);

      await expect(
        service.transition('inst-1', { action: 'REJETER', actorId: 'u-1' }),
      ).rejects.toThrow('commentaire est requis');
    });

    it('devrait exiger une signature si requires_signature est true', async () => {
      prisma.workflowTransition.findMany.mockResolvedValue([{
        id: 'trans-4',
        action: 'SIGNER',
        toNode: mockEndNode,
        guardExpression: null,
        requiresComment: false,
        requiresSignature: true,
        requiresAttachment: false,
      }]);

      await expect(
        service.transition('inst-1', { action: 'SIGNER', actorId: 'u-1' }),
      ).rejects.toThrow('signature est requise');
    });

    it('devrait exiger une pièce jointe si requires_attachment est true', async () => {
      prisma.workflowTransition.findMany.mockResolvedValue([{
        id: 'trans-5',
        action: 'SOUMETTRE',
        toNode: mockEndNode,
        guardExpression: null,
        requiresComment: false,
        requiresSignature: false,
        requiresAttachment: true,
      }]);

      await expect(
        service.transition('inst-1', { action: 'SOUMETTRE', actorId: 'u-1' }),
      ).rejects.toThrow('pièce jointe est requise');
    });
  });

  describe('suspend', () => {
    it('devrait suspendre une instance ACTIVE', async () => {
      prisma.workflowInstance.update.mockResolvedValue({
        ...mockInstance,
        status: 'SUSPENDED',
      });

      const result = await service.suspend('inst-1', 'user-1', 'Recours déposé');

      expect(result.status).toBe('SUSPENDED');
      expect(kafka.emit).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'WORKFLOW_SUSPENDED' }),
      );
    });

    it('devrait rejeter la suspension d\'une instance non-ACTIVE', async () => {
      prisma.workflowInstance.findUnique.mockResolvedValue({
        ...mockInstance,
        status: 'COMPLETED',
      });

      await expect(service.suspend('inst-1', 'u-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resume', () => {
    it('devrait reprendre une instance SUSPENDED', async () => {
      prisma.workflowInstance.findUnique.mockResolvedValue({
        ...mockInstance,
        status: 'SUSPENDED',
      });
      prisma.workflowInstance.update.mockResolvedValue({
        ...mockInstance,
        status: 'ACTIVE',
      });

      const result = await service.resume('inst-1', 'user-1');

      expect(result.status).toBe('ACTIVE');
      expect(kafka.emit).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'WORKFLOW_RESUMED' }),
      );
    });
  });

  describe('cancel', () => {
    it('devrait annuler une instance ACTIVE', async () => {
      prisma.workflowInstance.update.mockResolvedValue({
        ...mockInstance,
        status: 'CANCELLED',
      });

      const result = await service.cancel('inst-1', 'user-1', 'Annulation du marché');

      expect(result.status).toBe('CANCELLED');
      expect(kafka.emit).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'WORKFLOW_CANCELLED' }),
      );
    });
  });

  describe('getCurrentState', () => {
    it('devrait retourner l\'état courant avec les transitions disponibles', async () => {
      prisma.workflowInstance.findUnique.mockResolvedValue(mockInstance);
      prisma.workflowTransition.findMany.mockResolvedValue([{
        action: 'VALIDER',
        label: 'Valider',
        toNode: { code: 'END', label: 'Fin' },
        requiresComment: false,
        requiresSignature: true,
        requiresAttachment: false,
        guardExpression: null,
      }]);

      const result = await service.getCurrentState('inst-1');

      expect(result.availableTransitions).toHaveLength(1);
      expect(result.availableTransitions[0].action).toBe('VALIDER');
      expect(result.availableTransitions[0].requiresSignature).toBe(true);
    });
  });

  describe('getHistory', () => {
    it('devrait retourner l\'historique ordonné', async () => {
      const events = [
        { id: 'e-1', action: 'WORKFLOW_STARTED', timestamp: new Date('2025-01-01') },
        { id: 'e-2', action: 'VALIDER', timestamp: new Date('2025-01-02') },
      ];
      prisma.workflowEvent.findMany.mockResolvedValue(events);

      const result = await service.getHistory('inst-1');

      expect(result).toHaveLength(2);
      expect(prisma.workflowEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { instanceId: 'inst-1' },
          orderBy: { timestamp: 'asc' },
        }),
      );
    });
  });
});
