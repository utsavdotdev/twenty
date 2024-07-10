import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { flowWorker } from 'src/workflow-worker/activepieces/worker/src';

@Injectable()
export class WorkflowWorkerService implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    flowWorker.init('<fake token>');
    flowWorker.start();
  }

  onModuleDestroy() {
    flowWorker.close();
  }
}
