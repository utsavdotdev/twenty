import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageThreadRepository } from 'src/modules/messaging/common/repositories/message-thread.repository';
import { MessageRepository } from 'src/modules/messaging/common/repositories/message.repository';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

@Injectable()
export class MessagingMessageThreadService {
  constructor(
    @InjectWorkspaceRepository(MessageChannelMessageAssociationWorkspaceEntity)
    private readonly messageChannelMessageAssociationRepository: WorkspaceRepository<MessageChannelMessageAssociationWorkspaceEntity>,
    @InjectObjectMetadataRepository(MessageWorkspaceEntity)
    private readonly messageRepository: MessageRepository,
    @InjectObjectMetadataRepository(MessageThreadWorkspaceEntity)
    private readonly messageThreadRepository: MessageThreadRepository,
  ) {}

  public async saveMessageThreadOrReturnExistingMessageThread(
    headerMessageId: string,
    messageThreadExternalId: string,
    workspaceId: string,
    manager: EntityManager,
  ) {
    // Check if message thread already exists via threadExternalId
    const existingMessageChannelMessageAssociationByMessageThreadExternalId =
      await this.messageChannelMessageAssociationRepository.findOneBy({
        messageExternalId: messageThreadExternalId,
      });

    const existingMessageThread =
      existingMessageChannelMessageAssociationByMessageThreadExternalId
        ?.messageThread?.id;

    if (existingMessageThread) {
      return existingMessageThread;
    }

    // Check if message thread already exists via existing message headerMessageId
    const existingMessageWithSameHeaderMessageId =
      await this.messageRepository.getFirstOrNullByHeaderMessageId(
        headerMessageId,
        workspaceId,
        manager,
      );

    if (existingMessageWithSameHeaderMessageId) {
      return existingMessageWithSameHeaderMessageId.messageThreadId;
    }

    // If message thread does not exist, create new message thread
    const newMessageThreadId = v4();

    await this.messageThreadRepository.insert(
      newMessageThreadId,
      workspaceId,
      manager,
    );

    return newMessageThreadId;
  }
}
