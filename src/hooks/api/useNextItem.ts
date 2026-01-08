import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getRetryConfig } from '@/utils/authErrorHandler';

export function useNextItem(
    currentItem: BaseItemDto | null | undefined,
    userId: string | null | undefined
) {
    return useQuery<BaseItemDto | null>({
        queryKey: ['nextItem', currentItem?.Id, userId],
        queryFn: async (): Promise<BaseItemDto | null> => {
            if (!currentItem?.Id || !currentItem?.SeriesId) return null;

            const api = getApi();
            const tvShowsApi = getTvShowsApi(api);

            const response = await tvShowsApi.getEpisodes({
                seriesId: currentItem.SeriesId,
                userId: userId!,
                adjacentTo: currentItem.Id,
                limit: 3,
                fields: ['Overview', 'MediaSources', 'PrimaryImageAspectRatio'],
                enableUserData: true,
                enableImages: true,
            });

            const items = response.data.Items || [];
            const currentItemIndex = items.findIndex((item) => item.Id === currentItem.Id);
            const nextItem = items[currentItemIndex + 1];
            return nextItem || null;
        },
        enabled: !!currentItem?.Id && !!currentItem?.SeriesId && !!userId,
        ...getRetryConfig(),
    });
}
