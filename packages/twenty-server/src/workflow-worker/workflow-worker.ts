import { NestFactory } from '@nestjs/core';

import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { LoggerService } from 'src/engine/integrations/logger/logger.service';
import { shouldFilterException } from 'src/engine/utils/global-exception-handler.util';
import { WorkflowWorkerModule } from 'src/workflow-worker/workflow-worker.module';

async function bootstrap() {
  console.log('in worker code');

  let exceptionHandlerService: ExceptionHandlerService | undefined;
  let loggerService: LoggerService | undefined;

  try {
    const app = await NestFactory.createApplicationContext(
      WorkflowWorkerModule,
      {
        bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
      },
    );

    loggerService = app.get(LoggerService);
    exceptionHandlerService = app.get(ExceptionHandlerService);

    // Inject our logger
    app.useLogger(loggerService!);
  } catch (err) {
    loggerService?.error(err?.message, err?.name);

    if (!shouldFilterException(err)) {
      exceptionHandlerService?.captureExceptions([err]);
    }

    throw err;
  }
}
bootstrap();
