import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingSettingsManagerReimportMessagesJob } from 'src/modules/messaging/settings-manager/jobs/messaging-settings-manager-reimport-messages.job';

@Injectable()
export class MessagingSettingsManagerMessageChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('messageChannel.updated')
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<MessageChannelWorkspaceEntity>
    >,
  ) {
    const filteredEvents = payload.events.filter((eventPayload) =>
      objectRecordChangedProperties(
        eventPayload.properties.before,
        eventPayload.properties.after,
      ).includes('excludeGroupEmails'),
    );

    const messageChannelsToReimport = filteredEvents
      .filter(
        (eventPayload) =>
          eventPayload.properties.after.excludeGroupEmails === false,
      )
      .map((eventPayload) => eventPayload.properties.after.id);

    if (messageChannelsToReimport.length) {
      await this.messageQueueService.add(
        MessagingSettingsManagerReimportMessagesJob.name,
        {
          workspaceId: payload.workspaceId,
          messageChannelIds: messageChannelsToReimport,
        },
      );
    }
  }
}
