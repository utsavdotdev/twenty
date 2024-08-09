import { useResetRecoilState } from 'recoil';
import { settingsServerlessFunctionInputState } from '@/settings/developers/serverless-functions/states/settingsServerlessFunctionInputState';
import { settingsServerlessFunctionOutputState } from '@/settings/developers/serverless-functions/states/settingsServerlessFunctionOutputState';
import { settingsServerlessFunctionCodeEditorOutputParamsState } from '@/settings/developers/serverless-functions/states/settingsServerlessFunctionCodeEditorOutputParamsState';

export const ResetServerlessFunctionStatesEffect = () => {
  const resetSettingsServerlessFunctionInput = useResetRecoilState(
    settingsServerlessFunctionInputState,
  );
  const resetSettingsServerlessFunctionOutput = useResetRecoilState(
    settingsServerlessFunctionOutputState,
  );
  const resetSettingsServerlessFunctionCodeEditorOutputParamsState =
    useResetRecoilState(settingsServerlessFunctionCodeEditorOutputParamsState);

  resetSettingsServerlessFunctionInput();
  resetSettingsServerlessFunctionOutput();
  resetSettingsServerlessFunctionCodeEditorOutputParamsState();
  return <></>;
};
