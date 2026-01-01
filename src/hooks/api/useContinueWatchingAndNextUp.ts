import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';

interface ContinueWatchingAndNextUpResult {
    items: BaseItemDto[];
}

export function useContinueWatchingAndNextUp(userId: string | null | undefined) {
    return useQuery({
        queryKey: ['continueWatchingAndNextUp', userId],
        queryFn: async (): Promise<ContinueWatchingAndNextUpResult> => {
            const api = getApi();
            const itemsApi = getItemsApi(api);
            const tvShowsApi = getTvShowsApi(api);

            const [continueWatchingResponse, nextUpResponse] = await Promise.all([
                itemsApi.getResumeItems({
                    userId: userId!,
                    limit: 10,
                    fields: ['PrimaryImageAspectRatio'],
                    mediaTypes: ['Video'],
                    enableUserData: true,
                    enableImages: true,
                }),
                tvShowsApi.getNextUp({
                    userId: userId!,
                    limit: 10,
                    fields: ['PrimaryImageAspectRatio'],
                    enableUserData: true,
                    enableImages: true,
                }),
            ]);

            const allItems = [
                ...(continueWatchingResponse.data.Items || []),
                ...(nextUpResponse.data.Items || []),
            ];

            // filter out duplicates based on item ID
            const uniqueItemsMap: Record<string, BaseItemDto> = {};
            allItems
                .filter((item): item is BaseItemDto => item !== undefined)
                .filter((item) => item.Id !== undefined && item.Id !== null)
                .forEach((item) => {
                    uniqueItemsMap[item.Id!] = item;
                });
            const uniqueItems = Object.values(uniqueItemsMap);

            // sort by LastPlayedDate descending
            const sortedItems = uniqueItems.sort((a, b) => {
                const dateA = a.UserData?.LastPlayedDate
                    ? new Date(a.UserData.LastPlayedDate).getTime()
                    : 0;
                const dateB = b.UserData?.LastPlayedDate
                    ? new Date(b.UserData.LastPlayedDate).getTime()
                    : 0;
                return dateB - dateA;
            });

            return {
                items: sortedItems,
            };
        },
        enabled: !!userId,
    });
}
