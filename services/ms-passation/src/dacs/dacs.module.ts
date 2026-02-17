import { Module } from '@nestjs/common';
import { DacsController } from './dacs.controller';
import { DacsService } from './dacs.service';

@Module({
  controllers: [DacsController],
  providers: [DacsService],
  exports: [DacsService],
})
export class DacsModule {}
