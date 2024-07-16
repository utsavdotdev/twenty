import {
  ExecutionMode,
  SharedSystemProp,
  system,
} from 'src/workflow-worker/activepieces/server-shared/src';

import { isolateEngineRunner } from './isolate/isolate-engine-runner';
import { threadEngineRunner } from './threads/thread-engine-runner';

const executionMode = system.getOrThrow<ExecutionMode>(
  SharedSystemProp.EXECUTION_MODE,
);

export const engineRunner =
  executionMode === ExecutionMode.UNSANDBOXED
    ? threadEngineRunner
    : isolateEngineRunner;
