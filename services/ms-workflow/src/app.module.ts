import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedAuthModule, JwtAuthGuard } from '@eproc/shared-utils';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { DefinitionsModule } from './definitions/definitions.module';
import { EngineModule } from './engine/engine.module';
import { TimerModule } from './timer/timer.module';
import { CrossWorkflowModule } from './cross-workflow/cross-workflow.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    SharedAuthModule.register(),
    ScheduleModule.forRoot(),
    PrismaModule,
    KafkaModule,
    HealthModule,
    DefinitionsModule,
    EngineModule,
    TimerModule,
    CrossWorkflowModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
