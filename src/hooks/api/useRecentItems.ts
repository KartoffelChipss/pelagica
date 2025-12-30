import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';

export function useRecentItems(libraryId?: string | null) {
    return useQuery({
        queryKey: ['recentItems', libraryId],
        queryFn: async () => {
            const api = getApi();
            const userViewsApi = getItemsApi(api);
            const response = await userViewsApi.getItems({
                parentId: libraryId!,
                sortBy: ['DateCreated'],
                sortOrder: ['Descending'],
                limit: 15,
                recursive: true,
                includeItemTypes: ['Movie', 'Series'],
            });
            return response.data.Items;
        },
        enabled: !!libraryId,
    });
}
