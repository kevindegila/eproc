import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SharedAuthModule, JwtAuthGuard } from '@eproc/shared-utils';
import { PrismaModule } from './prisma/prisma.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { FilesModule } from './files/files.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    SharedAuthModule.register(),
    PrismaModule,
    SubmissionsModule,
    FilesModule,
    ReceiptsModule,
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
