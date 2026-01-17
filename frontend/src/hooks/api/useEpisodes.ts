import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getRetryConfig } from '@/utils/authErrorHandler';

export function useEpisodes(seasonId: string | null | undefined) {
    return useQuery<BaseItemDto[]>({
        queryKey: ['episodes', seasonId],
        queryFn: async (): Promise<BaseItemDto[]> => {
            const api = getApi();
            const itemsApi = getItemsApi(api);
            const response = await itemsApi.getItems({
                parentId: seasonId!,
                includeItemTypes: ['Episode'],
                sortBy: ['SortName'],
                sortOrder: ['Ascending'],
                fields: ['Overview', 'MediaSources'],
                enableUserData: true,
            });
            return response.data.Items || [];
        },
        enabled: !!seasonId,
        ...getRetryConfig(),
    });
}
