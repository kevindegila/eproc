import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(
    submissionId: string,
    file: Express.Multer.File,
    category: string = 'TECHNIQUE',
  ) {
    // Verifier que la soumission existe
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Soumission non trouvee');
    }

    return this.prisma.submissionFile.create({
      data: {
        submissionId,
        name: file.originalname,
        filePath: file.path || `/uploads/submissions/${submissionId}/${file.originalname}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        category,
      },
    });
  }

  async findBySubmission(submissionId: string) {
    // Verifier que la soumission existe
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Soumission non trouvee');
    }

    return this.prisma.submissionFile.findMany({
      where: { submissionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const file = await this.prisma.submissionFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('Fichier non trouve');
    }

    await this.prisma.submissionFile.delete({ where: { id } });
    return { message: 'Fichier supprime avec succes' };
  }
}
