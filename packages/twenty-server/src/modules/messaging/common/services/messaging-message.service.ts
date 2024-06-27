import { Injectable, Logger } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessageRepository } from 'src/modules/messaging/common/repositories/message.repository';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { GmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message';
import { MessagingMessageThreadService } from 'src/modules/messaging/common/services/messaging-message-thread.service';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

@Injectable()
export class MessagingMessageService {
  private readonly logger = new Logger(MessagingMessageService.name);

  constructor(
    @InjectWorkspaceRepository(MessageChannelMessageAssociationWorkspaceEntity)
    private readonly messageChannelMessageAssociationRepository: WorkspaceRepository<MessageChannelMessageAssociationWorkspaceEntity>,
    @InjectObjectMetadataRepository(MessageWorkspaceEntity)
    private readonly messageRepository: MessageRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly messageThreadService: MessagingMessageThreadService,
  ) {}

  public async saveMessagesWithinTransaction(
    messages: GmailMessage[],
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    gmailMessageChannelId: string,
    workspaceId: string,
    transactionManager: EntityManager,
  ): Promise<Map<string, string>> {
    const messageExternalIdsAndIdsMap = new Map<string, string>();

    for (const message of messages) {
      const existingMessageChannelMessageAssociationsCount =
        await this.messageChannelMessageAssociationRepository.count(
          {
            where: {
              messageExternalId: message.externalId,
              messageChannel: {
                id: gmailMessageChannelId,
              },
            },
          },
          transactionManager,
        );

      if (existingMessageChannelMessageAssociationsCount > 0) {
        continue;
      }

      // TODO: This does not handle all thread merging use cases and might create orphan threads.
      const savedOrExistingMessageThreadId =
        await this.messageThreadService.saveMessageThreadOrReturnExistingMessageThread(
          message.headerMessageId,
          message.messageThreadExternalId,
          workspaceId,
          transactionManager,
        );

      const savedOrExistingMessageId =
        await this.saveMessageOrReturnExistingMessage(
          message,
          savedOrExistingMessageThreadId,
          connectedAccount,
          workspaceId,
          transactionManager,
        );

      messageExternalIdsAndIdsMap.set(
        message.externalId,
        savedOrExistingMessageId,
      );

      await this.messageChannelMessageAssociationRepository.insert(
        {
          messageChannel: {
            id: gmailMessageChannelId,
          },
          message: {
            id: savedOrExistingMessageId,
          },
          messageExternalId: message.externalId,
          messageThread: {
            id: savedOrExistingMessageThreadId,
          },
          messageThreadExternalId: message.messageThreadExternalId,
        },
        transactionManager,
      );
    }

    return messageExternalIdsAndIdsMap;
  }

  public async saveMessages(
    messages: GmailMessage[],
    workspaceDataSource: DataSource,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    gmailMessageChannelId: string,
    workspaceId: string,
  ): Promise<Map<string, string>> {
    const messageExternalIdsAndIdsMap = new Map<string, string>();

    try {
      let keepImporting = true;

      for (const message of messages) {
        if (!keepImporting) {
          break;
        }

        await workspaceDataSource?.transaction(
          async (manager: EntityManager) => {
            const gmailMessageChannel =
              await this.messageChannelRepository.getByIds(
                [gmailMessageChannelId],
                workspaceId,
                manager,
              );

            if (gmailMessageChannel.length === 0) {
              this.logger.error(
                `No message channel found for connected account ${connectedAccount.id} in workspace ${workspaceId} in saveMessages`,
              );

              keepImporting = false;

              return;
            }

            const existingMessageChannelMessageAssociationsCount =
              await this.messageChannelMessageAssociationRepository.count(
                {
                  where: {
                    messageExternalId: message.externalId,
                    messageChannel: {
                      id: gmailMessageChannelId,
                    },
                  },
                },
                manager,
              );

            if (existingMessageChannelMessageAssociationsCount > 0) {
              return;
            }

            // TODO: This does not handle all thread merging use cases and might create orphan threads.
            const savedOrExistingMessageThreadId =
              await this.messageThreadService.saveMessageThreadOrReturnExistingMessageThread(
                message.headerMessageId,
                message.messageThreadExternalId,
                workspaceId,
                manager,
              );

            const savedOrExistingMessageId =
              await this.saveMessageOrReturnExistingMessage(
                message,
                savedOrExistingMessageThreadId,
                connectedAccount,
                workspaceId,
                manager,
              );

            messageExternalIdsAndIdsMap.set(
              message.externalId,
              savedOrExistingMessageId,
            );

            await this.messageChannelMessageAssociationRepository.insert(
              {
                messageChannel: {
                  id: gmailMessageChannelId,
                },
                message: {
                  id: savedOrExistingMessageId,
                },
                messageExternalId: message.externalId,
                messageThread: {
                  id: savedOrExistingMessageThreadId,
                },
                messageThreadExternalId: message.messageThreadExternalId,
              },
              manager,
            );
          },
        );
      }
    } catch (error) {
      throw new Error(
        `Error saving connected account ${connectedAccount.id} messages to workspace ${workspaceId}: ${error.message}`,
      );
    }

    return messageExternalIdsAndIdsMap;
  }

  private async saveMessageOrReturnExistingMessage(
    message: GmailMessage,
    messageThreadId: string,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    workspaceId: string,
    manager: EntityManager,
  ): Promise<string> {
    const existingMessage =
      await this.messageRepository.getFirstOrNullByHeaderMessageId(
        message.headerMessageId,
        workspaceId,
      );
    const existingMessageId = existingMessage?.id;

    if (existingMessageId) {
      return Promise.resolve(existingMessageId);
    }

    const newMessageId = v4();

    const messageDirection =
      connectedAccount.handle === message.fromHandle ? 'outgoing' : 'incoming';

    const receivedAt = new Date(parseInt(message.internalDate));

    await this.messageRepository.insert(
      newMessageId,
      message.headerMessageId,
      message.subject,
      receivedAt,
      messageDirection,
      messageThreadId,
      message.text,
      workspaceId,
      manager,
    );

    return Promise.resolve(newMessageId);
  }
}
