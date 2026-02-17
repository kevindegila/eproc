import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SharedAuthModule, JwtAuthGuard } from '@eproc/shared-utils';
import { PrismaModule } from './prisma/prisma.module';
import { OpeningsModule } from './openings/openings.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { ScoresModule } from './scores/scores.module';
import { AwardsModule } from './awards/awards.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    SharedAuthModule.register(),
    PrismaModule,
    OpeningsModule,
    EvaluationsModule,
    ScoresModule,
    AwardsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
