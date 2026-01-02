import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/api/getApi';
import { getSearchApi } from '@jellyfin/sdk/lib/utils/api/search-api';
import type { SearchHint } from '@jellyfin/sdk/lib/generated-client/models';

export interface SearchQueryResult {
    data: SearchHint[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
}

export function useSearchItems(searchTerm: string): SearchQueryResult {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['searchItems', searchTerm],
        queryFn: async (): Promise<SearchHint[]> => {
            try {
                const api = getApi();
                const searchApi = getSearchApi(api);
                const response = await searchApi.getSearchHints({
                    searchTerm: searchTerm.trim(),
                    limit: 50,
                    includeItemTypes: ['Movie', 'Series'],
                });

                const hints = response?.data?.SearchHints;
                if (!Array.isArray(hints)) {
                    console.warn('Search hints is not an array:', hints);
                    return [];
                }
                console.log('Search hints:', hints);
                return hints;
            } catch (err) {
                console.error('Search error:', err);
                throw err;
            }
        },
        enabled: searchTerm.trim().length > 0,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 1,
    });

    return {
        data: Array.isArray(data) ? data : [],
        isLoading: isLoading && searchTerm.trim().length > 0,
        isError,
        error: error as Error | null,
    };
}
