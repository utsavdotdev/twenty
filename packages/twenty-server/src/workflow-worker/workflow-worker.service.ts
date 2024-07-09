import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { isNil } from 'src/workflow-worker/shared';
import { ApQueueJob } from 'src/workflow-worker/shared/lib/job';
import { JobData } from 'src/workflow-worker/shared/lib/job/job-data';

// TODO: make customizable
// const WORKER_CONCURRENCY = 10;
const WORKER_CONCURRENCY = 1;

export enum QueueName {
  WEBHOOK = 'webhookJobs',
  ONE_TIME = 'oneTimeJobs',
  SCHEDULED = 'repeatableJobs',
}

function rejectedPromiseHandler(promise: Promise<unknown>) {
  promise.catch((error) => {
    // FIXME: use real logger
    console.error(error);
  });
}

@Injectable()
export class WorkflowWorkerService implements OnModuleInit, OnModuleDestroy {
  private closed = false;
  private heartbeatInterval: NodeJS.Timeout;

  onModuleInit() {
    this.init();

    this.start();
  }

  onModuleDestroy() {
    this.closed = true;
    clearTimeout(this.heartbeatInterval);
  }

  init() {
    this.closed = false;
    this.heartbeatInterval = setInterval(() => {
      // FIXME
      //   rejectedPromiseHandler(workerApiService(workerToken).heartbeat());
      console.log("I'm still breathing");
    }, 15000);
  }

  start() {
    for (const queueName of Object.values(QueueName)) {
      for (let i = 0; i < WORKER_CONCURRENCY; i++) {
        rejectedPromiseHandler(this.run(queueName));
      }
    }
  }

  async run<T extends QueueName>(queueName: T): Promise<void> {
    while (!this.closed) {
      let engineToken: string | undefined;

      try {
        // TODO: take the job from somewhere
        // Why not using a queue to get jobs?
        // const job: ApQueueJob = await workerApiService(workerToken).poll(queueName);

        await new Promise((resolve) => setTimeout(resolve, 10_000));

        const job: ApQueueJob = {} as any;

        console.log('processing job', job);

        if (isNil(job)) {
          continue;
        }
        const { data, engineToken: jobEngineToken } = job;

        engineToken = jobEngineToken;
        await this.consumeJob(queueName, data, engineToken);

        // FIXME: implement the status update
        // await engineApiService(engineToken).updateJobStatus({
        //   status: JobStatus.COMPLETED,
        //   queueName,
        // });
      } catch (e) {
        // FIXME: report errors
        // FIXME: update job status (set to error)
        // exceptionHandler.handle(e);
        // if (engineToken) {
        //   rejectedPromiseHandler(
        //     engineApiService(engineToken).updateJobStatus({
        //       status: JobStatus.FAILED,
        //       queueName,
        //       message: (e as Error)?.message ?? 'Unknown error',
        //     }),
        //   );
        // }
      }
    }
  }

  async consumeJob(
    queueName: QueueName,
    jobData: JobData,
    engineToken: string,
  ): Promise<void> {
    switch (queueName) {
      case QueueName.ONE_TIME:
        // await flowJobExecutor.executeFlow(
        //   jobData as OneTimeJobData,
        //   engineToken,
        // );
        break;
      case QueueName.SCHEDULED:
        // await repeatingJobExecutor.executeRepeatingJob({
        //   data: jobData as RepeatingJobData,
        //   engineToken,
        //   workerToken,
        // });
        break;
      case QueueName.WEBHOOK: {
        // await webhookExecutor.consumeWebhook(
        //   jobData as WebhookJobData,
        //   engineToken,
        //   workerToken,
        // );
        break;
      }
    }
  }
}
