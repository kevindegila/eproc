import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

const STATUS_TRANSITIONS: Record<string, { action: string; target: string; dateField?: string }> = {
  sign: { action: 'signer', target: 'EN_SIGNATURE' },
  approve: { action: 'approuver', target: 'APPROUVE', dateField: 'approvalDate' },
  notify: { action: 'notifier', target: 'NOTIFIE', dateField: 'notificationDate' },
  start: { action: 'demarrer', target: 'EN_COURS' },
  terminate: { action: 'terminer', target: 'TERMINE' },
  cancel: { action: 'resilier', target: 'RESILIE' },
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  BROUILLON: ['EN_SIGNATURE', 'RESILIE'],
  EN_SIGNATURE: ['SIGNE', 'RESILIE'],
  SIGNE: ['APPROUVE', 'RESILIE'],
  APPROUVE: ['NOTIFIE', 'RESILIE'],
  NOTIFIE: ['EN_COURS', 'RESILIE'],
  EN_COURS: ['TERMINE', 'RESILIE'],
  TERMINE: [],
  RESILIE: [],
};

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    organizationId?: string;
    operatorId?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.operatorId) {
      where.operatorId = query.operatorId;
    }

    if (query.search) {
      where.OR = [
        { reference: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
        { operatorName: { contains: query.search, mode: 'insensitive' } },
        { dacReference: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        skip,
        take: limit,
        include: { signatures: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return buildPaginatedResponse(contracts, total, page, limit);
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { signatures: { orderBy: { signedAt: 'asc' } } },
    });

    if (!contract) {
      throw new NotFoundException('Contrat non trouve');
    }

    return contract;
  }

  async create(dto: CreateContractDto, userId: string) {
    const existing = await this.prisma.contract.findUnique({
      where: { reference: dto.reference },
    });

    if (existing) {
      throw new ConflictException('Un contrat avec cette reference existe deja');
    }

    const contract = await this.prisma.contract.create({
      data: {
        reference: dto.reference,
        dacId: dto.dacId,
        dacReference: dto.dacReference,
        title: dto.title,
        operatorId: dto.operatorId,
        operatorName: dto.operatorName,
        organizationId: dto.organizationId,
        amount: dto.amount,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        createdBy: userId,
      },
      include: { signatures: true },
    });

    return contract;
  }

  async update(id: string, dto: UpdateContractDto) {
    const contract = await this.findOne(id);

    if (contract.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seul un contrat en statut BROUILLON peut etre modifie',
      );
    }

    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.operatorId !== undefined && { operatorId: dto.operatorId }),
        ...(dto.operatorName !== undefined && { operatorName: dto.operatorName }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      },
      include: { signatures: true },
    });

    return updated;
  }

  async remove(id: string) {
    const contract = await this.findOne(id);

    if (contract.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seul un contrat en statut BROUILLON peut etre supprime',
      );
    }

    await this.prisma.contract.delete({ where: { id } });
    return { message: 'Contrat supprime avec succes' };
  }

  async changeStatus(id: string, action: string) {
    const transition = STATUS_TRANSITIONS[action];
    if (!transition) {
      throw new BadRequestException(`Action '${action}' inconnue`);
    }

    const contract = await this.findOne(id);

    const allowed = ALLOWED_TRANSITIONS[contract.status] || [];
    if (!allowed.includes(transition.target)) {
      throw new BadRequestException(
        `Impossible de ${transition.action} un contrat en statut ${contract.status}. ` +
        `Transitions autorisees depuis ${contract.status}: ${allowed.join(', ') || 'aucune'}`,
      );
    }

    const updateData: Record<string, unknown> = {
      status: transition.target,
    };

    if (transition.dateField) {
      updateData[transition.dateField] = new Date();
    }

    // Set signatureDate when entering EN_SIGNATURE
    if (transition.target === 'EN_SIGNATURE') {
      updateData.signatureDate = new Date();
    }

    const updated = await this.prisma.contract.update({
      where: { id },
      data: updateData,
      include: { signatures: true },
    });

    return updated;
  }

  async sign(id: string) {
    return this.changeStatus(id, 'sign');
  }

  async approve(id: string) {
    return this.changeStatus(id, 'approve');
  }

  async notify(id: string) {
    return this.changeStatus(id, 'notify');
  }

  async start(id: string) {
    return this.changeStatus(id, 'start');
  }

  async terminate(id: string) {
    return this.changeStatus(id, 'terminate');
  }

  async cancel(id: string) {
    return this.changeStatus(id, 'cancel');
  }
}
