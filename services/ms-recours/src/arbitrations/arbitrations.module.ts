import { Module } from '@nestjs/common';
import { ArbitrationsController } from './arbitrations.controller';
import { ArbitrationsService } from './arbitrations.service';

@Module({
  controllers: [ArbitrationsController],
  providers: [ArbitrationsService],
  exports: [ArbitrationsService],
})
export class ArbitrationsModule {}
