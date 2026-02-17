import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DefinitionsService } from '../src/definitions/definitions.service';
import { YamlParserService } from '../src/definitions/yaml-parser.service';
import { PrismaService } from '../src/prisma/prisma.service';

const validYaml = `
nodes:
  - code: START
    label: Début
    type: START
    mandatory: true
  - code: ACTION1
    label: Action 1
    type: ACTION
    assignee_role: PPM
  - code: END
    label: Fin
    type: END
transitions:
  - from: START
    to: ACTION1
    action: DEMARRER
    label: Démarrer
  - from: ACTION1
    to: END
    action: VALIDER
    label: Valider
`;

describe('DefinitionsService', () => {
  let service: DefinitionsService;
  let prisma: Record<string, any>;

  const mockDefinition = {
    id: 'def-1',
    name: 'Test Workflow',
    entityType: 'DAC',
    procedureType: 'APPEL_OFFRES_OUVERT',
    organisationId: null,
    yamlContent: validYaml,
    isActive: true,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      workflowDefinition: {
        findMany: jest.fn().mockResolvedValue([mockDefinition]),
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockDefinition),
        update: jest.fn().mockResolvedValue(mockDefinition),
        delete: jest.fn().mockResolvedValue(mockDefinition),
      },
      workflowNode: {
        create: jest.fn().mockImplementation(({ data }) => ({
          id: `node-${data.code}`,
          ...data,
        })),
        deleteMany: jest.fn(),
      },
      workflowTransition: {
        create: jest.fn().mockImplementation(({ data }) => ({
          id: `trans-${data.action}`,
          ...data,
        })),
        deleteMany: jest.fn(),
      },
      workflowInstance: {
        count: jest.fn().mockResolvedValue(0),
      },
      $transaction: jest.fn().mockImplementation((fn) => fn(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DefinitionsService,
        YamlParserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DefinitionsService>(DefinitionsService);
  });

  describe('findAll', () => {
    it('devrait retourner les définitions paginées', async () => {
      prisma.workflowDefinition.findMany.mockResolvedValue([mockDefinition]);
      prisma.workflowDefinition.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(prisma.workflowDefinition.findMany).toHaveBeenCalled();
      expect(prisma.workflowDefinition.count).toHaveBeenCalled();
    });

    it('devrait filtrer par entityType', async () => {
      await service.findAll({ entityType: 'DAC' });

      expect(prisma.workflowDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entityType: 'DAC' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('devrait retourner une définition avec ses nœuds et transitions', async () => {
      prisma.workflowDefinition.findUnique.mockResolvedValue({
        ...mockDefinition,
        nodes: [],
        transitions: [],
      });

      const result = await service.findOne('def-1');
      expect(result.id).toBe('def-1');
    });

    it('devrait lever NotFoundException si non trouvé', async () => {
      prisma.workflowDefinition.findUnique.mockResolvedValue(null);

      await expect(service.findOne('inexistant')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('devrait créer une définition à partir du YAML', async () => {
      // Mock findUniqueOrThrow for the final return
      prisma.workflowDefinition.findUniqueOrThrow = jest.fn().mockResolvedValue({
        ...mockDefinition,
        nodes: [],
        transitions: [],
      });

      const result = await service.create({
        name: 'Test Workflow',
        entityType: 'DAC',
        yamlContent: validYaml,
      });

      expect(result).toBeDefined();
      expect(prisma.workflowDefinition.create).toHaveBeenCalled();
      // 3 nodes: START, ACTION1, END
      expect(prisma.workflowNode.create).toHaveBeenCalledTimes(3);
      // 2 transitions
      expect(prisma.workflowTransition.create).toHaveBeenCalledTimes(2);
    });

    it('devrait incrémenter la version si une définition active existe', async () => {
      prisma.workflowDefinition.findFirst.mockResolvedValue({
        ...mockDefinition,
        version: 2,
      });
      prisma.workflowDefinition.findUniqueOrThrow = jest.fn().mockResolvedValue({
        ...mockDefinition,
        version: 3,
        nodes: [],
        transitions: [],
      });

      await service.create({
        name: 'Test v3',
        entityType: 'DAC',
        yamlContent: validYaml,
      });

      expect(prisma.workflowDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: 3 }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('devrait supprimer une définition sans instances actives', async () => {
      prisma.workflowDefinition.findUnique.mockResolvedValue({
        ...mockDefinition,
        nodes: [],
        transitions: [],
      });
      prisma.workflowInstance.count.mockResolvedValue(0);

      const result = await service.remove('def-1');
      expect(result.message).toContain('supprimée');
    });

    it('devrait refuser la suppression si des instances actives existent', async () => {
      prisma.workflowDefinition.findUnique.mockResolvedValue({
        ...mockDefinition,
        nodes: [],
        transitions: [],
      });
      prisma.workflowInstance.count.mockResolvedValue(3);

      await expect(service.remove('def-1')).rejects.toThrow(ConflictException);
    });
  });
});
