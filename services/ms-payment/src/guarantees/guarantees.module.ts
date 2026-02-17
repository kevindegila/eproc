import { Module } from '@nestjs/common';
import { GuaranteesController } from './guarantees.controller';
import { GuaranteesService } from './guarantees.service';

@Module({
  controllers: [GuaranteesController],
  providers: [GuaranteesService],
  exports: [GuaranteesService],
})
export class GuaranteesModule {}
