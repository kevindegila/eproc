import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(
    dacId: string,
    file: Express.Multer.File,
    uploadedBy: string,
    category?: string,
  ) {
    const dac = await this.prisma.dAC.findUnique({ where: { id: dacId } });

    if (!dac) {
      throw new NotFoundException('Dossier d\'Appel a Concurrence non trouve');
    }

    if (dac.status !== 'BROUILLON' && dac.status !== 'PUBLIE') {
      throw new BadRequestException(
        'Les documents ne peuvent etre ajoutes qu\'aux DAC en statut BROUILLON ou PUBLIE',
      );
    }

    return this.prisma.dACDocument.create({
      data: {
        dacId,
        name: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        category: category || null,
        uploadedBy,
      },
    });
  }

  async findByDac(dacId: string) {
    const dac = await this.prisma.dAC.findUnique({ where: { id: dacId } });

    if (!dac) {
      throw new NotFoundException('Dossier d\'Appel a Concurrence non trouve');
    }

    return this.prisma.dACDocument.findMany({
      where: { dacId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const document = await this.prisma.dACDocument.findUnique({
      where: { id },
      include: { dac: true },
    });

    if (!document) {
      throw new NotFoundException('Document non trouve');
    }

    if (document.dac.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Les documents ne peuvent etre supprimes que des DAC en statut BROUILLON',
      );
    }

    await this.prisma.dACDocument.delete({ where: { id } });
    return { message: 'Document supprime avec succes' };
  }
}
