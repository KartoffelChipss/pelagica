import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { useGenreItemsScoped } from '@/hooks/api/genres/useGenreItems';
import { useConfig } from '@/hooks/api/useConfig';
import WatchedStateBadge from '@/components/WatchedStateBadge';
import ItemsListPage from './ItemsListPage';

interface GenrePageProps {
    item: BaseItemDto;
}

const GenrePage = ({ item }: GenrePageProps) => {
    const { config } = useConfig();

    return (
        <ItemsListPage
            item={item}
            useItems={useGenreItemsScoped}
            renderItemOverlay={(child) => (
                <WatchedStateBadge item={child} show={config?.watchedStateBadgeGenre || false} />
            )}
        />
    );
};

export default GenrePage;
