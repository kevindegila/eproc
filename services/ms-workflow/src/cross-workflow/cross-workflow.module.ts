import { Module } from '@nestjs/common';
import { EngineModule } from '../engine/engine.module';
import { CrossWorkflowController } from './cross-workflow.controller';
import { CrossWorkflowService } from './cross-workflow.service';

@Module({
  imports: [EngineModule],
  controllers: [CrossWorkflowController],
  providers: [CrossWorkflowService],
  exports: [CrossWorkflowService],
})
export class CrossWorkflowModule {}
