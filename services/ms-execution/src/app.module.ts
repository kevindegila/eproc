import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SharedAuthModule, JwtAuthGuard } from '@eproc/shared-utils';
import { PrismaModule } from './prisma/prisma.module';
import { ExecutionsModule } from './executions/executions.module';
import { ReportsModule } from './reports/reports.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { ReceptionsModule } from './receptions/receptions.module';
import { AmendmentsModule } from './amendments/amendments.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    SharedAuthModule.register(),
    PrismaModule,
    ExecutionsModule,
    ReportsModule,
    AttachmentsModule,
    ReceptionsModule,
    AmendmentsModule,
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
