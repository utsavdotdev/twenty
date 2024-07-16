import {
  FlowVersion,
  ProjectId,
  TriggerHookType,
} from 'src/workflow-worker/activepieces/shared/src';

import { engineRunner } from '../../engine';
import { webhookUtils } from '../../utils/webhook-utils';

export async function renewWebhook(params: Params): Promise<void> {
  const { flowVersion, projectId, simulate } = params;

  await engineRunner.executeTrigger(params.engineToken, {
    hookType: TriggerHookType.RENEW,
    flowVersion,
    webhookUrl: await webhookUtils.getWebhookUrl({
      flowId: flowVersion.flowId,
      simulate,
    }),
    projectId,
  });
}

type Params = {
  engineToken: string;
  flowVersion: FlowVersion;
  projectId: ProjectId;
  simulate: boolean;
};
