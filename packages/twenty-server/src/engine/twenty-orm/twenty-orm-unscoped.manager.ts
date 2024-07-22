import { Injectable, Type } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

@Injectable()
export class TwentyORMUnscopedManager {
  constructor(
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    entityClass: Type<T>,
  ): Promise<WorkspaceRepository<T>>;

  async getRepositoryForWorkspace(
    workspaceId: string,
    objectMetadataName: string,
  ): Promise<WorkspaceRepository<CustomWorkspaceEntity>>;

  async getRepositoryForWorkspace<T extends ObjectLiteral>(
    workspaceId: string,
    entityClassOrobjectMetadataName: Type<T> | string,
  ): Promise<
    WorkspaceRepository<T> | WorkspaceRepository<CustomWorkspaceEntity>
  > {
    let objectMetadataName: string;

    if (typeof entityClassOrobjectMetadataName === 'string') {
      objectMetadataName = entityClassOrobjectMetadataName;
    } else {
      objectMetadataName = convertClassNameToObjectMetadataName(
        entityClassOrobjectMetadataName.name,
      );
    }

    const workspaceDataSource =
      await this.workspaceDataSourceFactory.create(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    return workspaceDataSource.getRepository<T>(objectMetadataName);
  }
}
