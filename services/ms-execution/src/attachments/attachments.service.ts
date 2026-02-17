import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(
    executionId: string,
    file: Express.Multer.File,
    category: string,
    userId: string,
  ) {
    const execution = await this.prisma.execution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      throw new NotFoundException('Execution non trouvee');
    }

    return this.prisma.attachment.create({
      data: {
        executionId,
        name: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        category: category || 'DECOMPTE',
        uploadedBy: userId,
      },
    });
  }

  async findByExecution(executionId: string) {
    const execution = await this.prisma.execution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      throw new NotFoundException('Execution non trouvee');
    }

    return this.prisma.attachment.findMany({
      where: { executionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Piece jointe non trouvee');
    }

    await this.prisma.attachment.delete({ where: { id } });
    return { message: 'Piece jointe supprimee avec succes' };
  }
}
