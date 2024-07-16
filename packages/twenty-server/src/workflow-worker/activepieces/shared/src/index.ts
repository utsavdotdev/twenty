export * from './lib/app-connection/app-connection';
export * from './lib/app-connection/dto/read-app-connection-request';
export * from './lib/app-connection/dto/upsert-app-connection-request';
export * from './lib/authentication/dto/authentication-response';
export { SignInRequest } from './lib/authentication/dto/sign-in-request';
export { SignUpRequest } from './lib/authentication/dto/sign-up-request';
export {
  EnginePrincipal,
  Principal,
  WorkerPrincipal,
} from './lib/authentication/model/principal';
export * from './lib/authentication/model/principal-type';
export { ExecuteCodeRequest } from './lib/code/dto/code-request';
export * from './lib/common';
export * from './lib/common/activepieces-error';
export * from './lib/common/base-model';
export { apId, ApId, secureApId } from './lib/common/id-generator';
export { Cursor, SeekPage } from './lib/common/seek-page';
export * from './lib/common/telemetry';
export { GenerateCodeRequest, GenerateCodeResponse } from './lib/copilot';
export * from './lib/engine';
export * from './lib/federated-authn';
export * from './lib/file';
export * from './lib/flag/flag';
export * from './lib/flow-run/dto/list-flow-runs-request';
export * from './lib/flow-run/execution/execution-output';
export * from './lib/flow-run/execution/flow-execution';
export {
  DelayPauseMetadata,
  FlowError,
  FlowRunResponse,
  FlowRunStatus,
  isFlowStateTerminal,
  PauseMetadata,
  PauseType,
  StopResponse,
  WebhookPauseMetadata,
} from './lib/flow-run/execution/flow-execution';
export * from './lib/flow-run/execution/step-output';
export { StepOutputStatus } from './lib/flow-run/execution/step-output';
export {
  FlowRetryPayload,
  FlowRetryStrategy,
  FlowRun,
  FlowRunId,
  RunEnvironment,
} from './lib/flow-run/flow-run';
export {
  RetryFlowRequestBody,
  TestFlowRunRequestBody,
} from './lib/flow-run/test-flow-run-request';
export * from './lib/flows';
export * from './lib/flows/actions/action';
export * from './lib/flows/dto/count-flows-request';
export * from './lib/flows/dto/create-flow-request';
export * from './lib/flows/dto/flow-template-request';
export * from './lib/flows/dto/list-flows-request';
export { Flow, FlowId } from './lib/flows/flow';
export * from './lib/flows/flow-helper';
export * from './lib/flows/flow-operations';
export {
  FlowVersion,
  FlowVersionId,
  FlowVersionMetadata,
  FlowVersionState,
} from './lib/flows/flow-version';
export * from './lib/flows/folders/folder';
export * from './lib/flows/folders/folder-requests';
export * from './lib/flows/sample-data';
export * from './lib/flows/step-run';
export * from './lib/flows/trigger-events/trigger-event';
export * from './lib/flows/trigger-events/trigger-events-dto';
export {
  AUTHENTICATION_PROPERTY_NAME,
  EmptyTrigger,
  PieceTrigger,
  PieceTriggerSettings,
  Trigger,
  TriggerType,
} from './lib/flows/triggers/trigger';
export { FileResponseInterface } from './lib/forms';
export * from './lib/invitations';
export * from './lib/license-keys';
export * from './lib/pieces';
export * from './lib/platform';
export * from './lib/project';
export * from './lib/store-entry/dto/store-entry-request';
export {
  STORE_KEY_MAX_LENGTH,
  StoreEntry,
  StoreEntryId,
} from './lib/store-entry/store-entry';
export * from './lib/support-url';
export * from './lib/tag';
export * from './lib/user';
export * from './lib/webhook';
export * from './lib/websocket';
export * from './lib/workers';

// Look at https://github.com/sinclairzx81/typebox/issues/350
import { TypeSystem } from '@sinclair/typebox/system';

// @ts-expect-error to fix
TypeSystem.ExactOptionalPropertyTypes = false;
