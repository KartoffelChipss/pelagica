import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getRetryConfig } from '@/utils/authErrorHandler';

function deduplicateById(items: BaseItemDto[]): BaseItemDto[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        if (!item.Id || seen.has(item.Id)) return false;
        seen.add(item.Id);
        return true;
    });
}

interface ContinueWatchingAndNextUpResult {
    items: BaseItemDto[];
}

export function useContinueWatchingAndNextUp(
    userId: string | null | undefined,
    limit: number = 20,
    accurateSorting: boolean = true
) {
    return useQuery({
        queryKey: ['continueWatchingAndNextUp', userId, limit, accurateSorting],
        queryFn: async (): Promise<ContinueWatchingAndNextUpResult> => {
            const api = getApi();
            const itemsApi = getItemsApi(api);
            const tvShowsApi = getTvShowsApi(api);

            const resumeLimit = limit * 2;

            const [resumeResponse, nextUpResponse] = await Promise.all([
                itemsApi.getResumeItems({
                    userId: userId!,
                    limit: resumeLimit,
                    startIndex: 0,
                    fields: ['PrimaryImageAspectRatio'],
                    includeItemTypes: ['Movie', 'Episode'],
                    enableUserData: true,
                    enableImages: true,
                }),
                tvShowsApi.getNextUp({
                    userId: userId!,
                    limit,
                    startIndex: 0,
                    fields: ['PrimaryImageAspectRatio'],
                    enableUserData: true,
                    enableImages: true,
                }),
            ]);

            const resumeItems = resumeResponse.data.Items || [];
            const nextUpItems = nextUpResponse.data.Items || [];
            const continueWatchingItems = [...resumeItems, ...nextUpItems];
            console.log(
                'Continue Watching & Next Up Items:',
                continueWatchingItems.map((i) => ({
                    id: i.Id,
                    name: i.Name,
                    lastPlayed: i.UserData?.LastPlayedDate,
                }))
            );

            if (accurateSorting) {
                // For episodes without LastPlayedDate, try to infer it from the previous episode
                const itemsNeedingAdjacentData = continueWatchingItems.filter(
                    (item) =>
                        item.Type === 'Episode' &&
                        !item.UserData?.LastPlayedDate &&
                        item.SeriesId &&
                        item.IndexNumber
                );

                const adjacentPromises = itemsNeedingAdjacentData.map((item) =>
                    tvShowsApi
                        .getEpisodes({
                            seriesId: item.SeriesId!,
                            userId: userId!,
                            adjacentTo: item.Id,
                            limit: 3,
                            fields: ['Overview', 'MediaSources', 'PrimaryImageAspectRatio'],
                            enableUserData: true,
                            enableImages: true,
                        })
                        .then((response) => ({ item, response }))
                        .catch(() => null)
                );

                const results = await Promise.all(adjacentPromises);

                results.forEach((result) => {
                    if (!result) return;
                    const { item, response } = result;
                    const items = response.data.Items || [];
                    const currentItemIndex = items.findIndex((ep) => ep.Id === item.Id);
                    const previousEpisode = items[currentItemIndex - 1];

                    if (previousEpisode?.UserData?.LastPlayedDate) {
                        item.UserData = item.UserData || {};
                        item.UserData.LastPlayedDate = previousEpisode.UserData.LastPlayedDate;
                    }
                });
            }

            const sorted = continueWatchingItems.sort((a, b) => {
                const dateA = a.UserData?.LastPlayedDate || a.DateCreated || '';
                const dateB = b.UserData?.LastPlayedDate || b.DateCreated || '';
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });

            const deduplicated = deduplicateById(sorted);

            return { items: deduplicated.slice(0, limit) };
        },
        enabled: !!userId,
        ...getRetryConfig(),
    });
}
