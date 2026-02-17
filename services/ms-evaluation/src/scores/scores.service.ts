import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';

@Injectable()
export class ScoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScoreDto) {
    // Verifier que la session existe
    const session = await this.prisma.evaluationSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session d\'evaluation non trouvee');
    }

    if (session.status === 'TERMINEE') {
      throw new NotFoundException('Impossible d\'ajouter un score a une session terminee');
    }

    return this.prisma.evaluationScore.create({
      data: dto,
    });
  }

  async findBySession(sessionId: string) {
    // Verifier que la session existe
    const session = await this.prisma.evaluationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session d\'evaluation non trouvee');
    }

    const scores = await this.prisma.evaluationScore.findMany({
      where: { sessionId },
      orderBy: [{ operatorName: 'asc' }, { criterion: 'asc' }],
    });

    return {
      session,
      scores,
      total: scores.length,
    };
  }

  async findBySubmission(submissionId: string) {
    const scores = await this.prisma.evaluationScore.findMany({
      where: { submissionId },
      include: { session: true },
      orderBy: [{ createdAt: 'desc' }],
    });

    if (scores.length === 0) {
      throw new NotFoundException('Aucun score trouve pour cette soumission');
    }

    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const totalMaxScore = scores.reduce((sum, s) => sum + s.maxScore, 0);

    return {
      submissionId,
      operatorName: scores[0].operatorName,
      scores,
      summary: {
        totalScore,
        totalMaxScore,
        percentage: totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 10000) / 100 : 0,
      },
    };
  }
}
