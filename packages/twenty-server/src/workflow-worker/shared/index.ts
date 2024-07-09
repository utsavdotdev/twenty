export enum ExecutionType {
  BEGIN = 'BEGIN',
  RESUME = 'RESUME',
}

export enum ProgressUpdateType {
  WEBHOOK_RESPONSE = 'WEBHOOK_RESPONSE',
  TEST_FLOW = 'TEST_FLOW',
  NONE = 'NONE',
}

export enum RunEnvironment {
  PRODUCTION = 'PRODUCTION',
  TESTING = 'TESTING',
}

export enum TriggerType {
  EMPTY = 'EMPTY',
  PIECE = 'PIECE_TRIGGER',
}

export function isNil<T>(
  value: T | null | undefined,
): value is null | undefined {
  return value === null || value === undefined;
}
