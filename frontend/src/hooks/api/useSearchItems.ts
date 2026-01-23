import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/api/getApi';
import { getSearchApi } from '@jellyfin/sdk/lib/utils/api/search-api';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import type { BaseItemDto, BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import { getRetryConfig } from '@/utils/authErrorHandler';

interface UseSearchItemsOptions {
    itemTypes?: BaseItemKind[];
    limit?: number;
}

export function useSearchItems(searchTerm: string, options?: UseSearchItemsOptions) {
    const normalizedItemTypes =
        options?.itemTypes && options.itemTypes.length ? [...options.itemTypes] : undefined;
    const itemTypesKey = normalizedItemTypes ? [...normalizedItemTypes].sort() : 'all';

    const limit = options?.limit ?? 15;

    return useQuery<BaseItemDto[]>({
        queryKey: ['searchItems', searchTerm, itemTypesKey, limit],
        queryFn: async (): Promise<BaseItemDto[]> => {
            try {
                const api = getApi();
                const searchApi = getSearchApi(api);
                const response = await searchApi.getSearchHints({
                    searchTerm: searchTerm.trim(),
                    limit,
                    includeItemTypes: normalizedItemTypes,
                });

                const hints = response?.data?.SearchHints;
                if (!Array.isArray(hints) || hints.length === 0) {
                    return [];
                }

                const itemIds = hints.map((hint) => hint.Id).filter(Boolean) as string[];
                if (itemIds.length === 0) {
                    return [];
                }

                const itemsApi = getItemsApi(api);
                const itemsResponse = await itemsApi.getItems({
                    ids: itemIds,
                    fields: ['Overview', 'ParentId'],
                });

                return itemsResponse.data.Items || [];
            } catch (err) {
                console.error('Search error:', err);
                throw err;
            }
        },
        enabled: searchTerm.trim().length > 0,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        ...getRetryConfig(),
    });
}
