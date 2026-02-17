import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SharedAuthModule, JwtAuthGuard } from '@eproc/shared-utils';
import { PrismaModule } from './prisma/prisma.module';
import { ContractsModule } from './contracts/contracts.module';
import { SignaturesModule } from './signatures/signatures.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    SharedAuthModule.register(),
    PrismaModule,
    ContractsModule,
    SignaturesModule,
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
