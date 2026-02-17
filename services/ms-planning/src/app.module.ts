import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SharedAuthModule, JwtAuthGuard } from '@eproc/shared-utils';
import { PrismaModule } from './prisma/prisma.module';
import { PlansModule } from './plans/plans.module';
import { EntriesModule } from './entries/entries.module';
import { NoticesModule } from './notices/notices.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    SharedAuthModule.register(),
    PrismaModule,
    PlansModule,
    EntriesModule,
    NoticesModule,
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
