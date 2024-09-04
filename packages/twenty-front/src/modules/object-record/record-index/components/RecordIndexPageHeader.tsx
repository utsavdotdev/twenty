import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined, useIcons } from 'twenty-ui';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageFavoriteButton } from '@/ui/layout/page/PageFavoriteButton';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';
import { ViewType } from '@/views/types/ViewType';
import { capitalize } from '~/utils/string/capitalize';

type RecordIndexPageHeaderProps = {
  createRecord: () => void;
};

export const RecordIndexPageHeader = ({
  createRecord,
}: RecordIndexPageHeaderProps) => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { getIcon } = useIcons();
  const Icon = getIcon(
    findObjectMetadataItemByNamePlural(objectNamePlural)?.icon,
  );

  const recordIndexViewType = useRecoilValue(recordIndexViewTypeState);

  const canAddRecord =
    recordIndexViewType === ViewType.Table && !objectMetadataItem?.isRemote;

  const pageHeaderTitle =
    objectMetadataItem?.labelPlural ?? capitalize(objectNamePlural);

  const { favorites, createFavoriteObjectMetadata, deleteFavorite } =
    useFavorites();

  const currentFavorite = favorites?.find(
    (favorite) => favorite.objectMetadataId === objectMetadataItem?.id,
  );

  const isFavorite = isDefined(currentFavorite);

  const onFavoriteButtonClick = () => {
    currentFavorite
      ? deleteFavorite(currentFavorite.id)
      : createFavoriteObjectMetadata(objectMetadataItem?.id);
  };

  return (
    <PageHeader title={pageHeaderTitle} Icon={Icon}>
      <PageHotkeysEffect onAddButtonClick={createRecord} />
      {canAddRecord && (
        <PageFavoriteButton
          isFavorite={isFavorite}
          onClick={onFavoriteButtonClick}
        />
      )}
      {canAddRecord && <PageAddButton onClick={createRecord} />}
    </PageHeader>
  );
};
