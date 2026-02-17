import { Module } from '@nestjs/common';
import { EngineController } from './engine.controller';
import { EngineService } from './engine.service';
import { GuardEvaluatorService } from './guard-evaluator.service';

@Module({
  controllers: [EngineController],
  providers: [EngineService, GuardEvaluatorService],
  exports: [EngineService, GuardEvaluatorService],
})
export class EngineModule {}
