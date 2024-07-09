import { Module } from '@nestjs/common';

import { IntegrationsModule } from 'src/engine/integrations/integrations.module';
import { WorkflowWorkerService } from 'src/workflow-worker/workflow-worker.service';

@Module({
  imports: [IntegrationsModule],
  providers: [WorkflowWorkerService],
})
export class WorkflowWorkerModule {}
