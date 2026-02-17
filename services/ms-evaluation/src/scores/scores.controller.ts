import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';

@ApiTags('Scores d\'evaluation')
@ApiBearerAuth()
@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  @ApiOperation({ summary: 'Attribuer un score a une soumission' })
  create(@Body() dto: CreateScoreDto) {
    return this.scoresService.create(dto);
  }

  @Get('sessions/:sessionId/scores')
  @ApiOperation({ summary: 'Liste des scores d\'une session d\'evaluation' })
  findBySession(@Param('sessionId') sessionId: string) {
    return this.scoresService.findBySession(sessionId);
  }

  @Get('submissions/:submissionId/scores')
  @ApiOperation({ summary: 'Liste des scores d\'une soumission' })
  findBySubmission(@Param('submissionId') submissionId: string) {
    return this.scoresService.findBySubmission(submissionId);
  }
}
