import { ResetServerlessFunctionStatesEffect } from '~/pages/settings/developers/serverless-functions/ResetServerlessFunctionStatesEffect';
import { SettingsServerlessFunctionDetail } from '~/pages/settings/developers/serverless-functions/SettingsServerlessFunctionDetail';

export const SettingsServerlessFunctionDetailWrapper = () => {
  return (
    <>
      <ResetServerlessFunctionStatesEffect />
      <SettingsServerlessFunctionDetail />
    </>
  );
};
