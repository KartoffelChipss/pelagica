import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';

export function useMediaBarItems(libraryId?: string | null) {
    return useQuery({
        queryKey: ['mediaBarItems', libraryId],
        queryFn: async () => {
            const api = getApi();
            const itemsApi = getItemsApi(api);
            const response = await itemsApi.getItems({
                parentId: libraryId || undefined,
                sortBy: ['Random'],
                limit: 10,
                recursive: true,
                includeItemTypes: ['Movie', 'Series'],
                fields: ['Genres', 'Overview', 'ChildCount', 'RecursiveItemCount'],
            });
            return response.data.Items;
        },
    });
}
