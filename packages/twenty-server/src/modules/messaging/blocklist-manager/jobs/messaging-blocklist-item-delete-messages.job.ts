import { Logger } from '@nestjs/common';

import { And, Any, Equal, ILike, Not } from 'typeorm';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

export type BlocklistItemDeleteMessagesJobData = {
  workspaceId: string;
  blocklistItemId: string;
};

@Processor(MessageQueue.messagingQueue)
export class BlocklistItemDeleteMessagesJob {
  private readonly logger = new Logger(BlocklistItemDeleteMessagesJob.name);

  constructor(
    @InjectWorkspaceRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: WorkspaceRepository<MessageChannelWorkspaceEntity>,
    @InjectWorkspaceRepository(MessageChannelMessageAssociationWorkspaceEntity)
    private readonly messageChannelMessageAssociationRepository: WorkspaceRepository<MessageChannelMessageAssociationWorkspaceEntity>,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly threadCleanerService: MessagingMessageCleanerService,
  ) {}

  @Process(BlocklistItemDeleteMessagesJob.name)
  async handle(data: BlocklistItemDeleteMessagesJobData): Promise<void> {
    const { workspaceId, blocklistItemId } = data;

    const blocklistItem = await this.blocklistRepository.getById(
      blocklistItemId,
      workspaceId,
    );

    if (!blocklistItem) {
      this.logger.log(
        `Blocklist item with id ${blocklistItemId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const { handle, workspaceMemberId } = blocklistItem;

    this.logger.log(
      `Deleting messages from ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
    );

    if (!workspaceMemberId) {
      throw new Error(
        `Workspace member ID is not defined for blocklist item ${blocklistItemId} in workspace ${workspaceId}`,
      );
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: {
        connectedAccount: {
          accountOwner: {
            id: workspaceMemberId,
          },
        },
      },
      relations: ['connectedAccount'],
    });

    const messageChannelIds = messageChannels.map(({ id }) => id);

    const rolesToDelete: ('from' | 'to')[] = ['from', 'to'];

    for (const messageChannelId of messageChannelIds) {
      const isHandleDomain = handle.startsWith('@');

      const messageChannel = await this.messageChannelRepository.findOneBy({
        id: messageChannelId,
      });

      if (!messageChannel) {
        throw new Error(
          `Message channel with id ${messageChannelId} not found`,
        );
      }

      await this.messageChannelMessageAssociationRepository.delete({
        message: {
          messageParticipants: {
            handle: And(
              Not(messageChannel.handle),
              isHandleDomain ? ILike(`%${handle}%`) : Equal(handle),
            ),
            role: Any(rolesToDelete),
          },
          messageChannelMessageAssociations: {
            messageChannel: {
              id: messageChannelId,
            },
          },
        },
      });
    }

    await this.threadCleanerService.cleanWorkspaceThreads(workspaceId);

    this.logger.log(
      `Deleted messages from handle ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
    );
  }
}
