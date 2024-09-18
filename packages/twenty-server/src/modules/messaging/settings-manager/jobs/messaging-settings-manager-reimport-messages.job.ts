import { Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';

export type MessagingSettingsManagerReimportMessagesJobData = {
  workspaceId: string;
  messageChannelIds: string[];
};

@Processor(MessageQueue.messagingQueue)
export class MessagingSettingsManagerReimportMessagesJob {
  private readonly logger = new Logger(
    MessagingSettingsManagerReimportMessagesJob.name,
  );

  constructor(
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  @Process(MessagingSettingsManagerReimportMessagesJob.name)
  async handle(
    data: MessagingSettingsManagerReimportMessagesJobData,
  ): Promise<void> {
    const { workspaceId, messageChannelIds } = data;

    this.logger.log(
      `Reimporting messages for workspace ${workspaceId} and message channels ${messageChannelIds.join(
        ', ',
      )}`,
    );

    await this.messageChannelSyncStatusService.scheduleFullMessageListFetch(
      messageChannelIds,
    );
  }
}
