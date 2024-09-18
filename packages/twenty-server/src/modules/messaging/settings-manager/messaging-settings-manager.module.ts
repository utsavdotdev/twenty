import { Module } from '@nestjs/common';

import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingSettingsManagerReimportMessagesJob } from 'src/modules/messaging/settings-manager/jobs/messaging-settings-manager-reimport-messages.job';
import { MessagingSettingsManagerMessageChannelListener } from 'src/modules/messaging/settings-manager/listeners/messaging-settings-manager-message-channel.listener';

@Module({
  imports: [MessagingCommonModule],
  providers: [
    MessagingSettingsManagerMessageChannelListener,
    MessagingSettingsManagerReimportMessagesJob,
  ],
  exports: [],
})
export class MessagingSettingsManagerModule {}
