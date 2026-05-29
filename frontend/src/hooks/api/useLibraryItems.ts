import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import type {
    BaseItemDto,
    BaseItemKind,
    ItemSortBy,
    SortOrder,
} from '@jellyfin/sdk/lib/generated-client/models';
import { getRetryConfig } from '@/utils/authErrorHandler';

export type UseLibraryItemsOptions = {
    limit?: number;
    startIndex?: number;
    sortBy?: ItemSortBy[];
    sortOrder?: SortOrder;
    includeItemTypes?: BaseItemKind[];
    recursive?: boolean;
    searchTerm?: string;
    genreIds?: string[];
    userId?: string;
};

export interface LibraryItemsResponse {
    items: Array<BaseItemDto>;
    totalCount: number;
}

export function useLibraryItems(
    libraryId?: string | null,
    options?: UseLibraryItemsOptions
): ReturnType<typeof useQuery<LibraryItemsResponse>> {
    return useQuery<LibraryItemsResponse>({
        queryKey: [
            'libraryItems',
            libraryId,
            options?.startIndex,
            options?.limit,
            options?.sortBy,
            options?.sortOrder,
            options?.searchTerm,
            options?.includeItemTypes,
            options?.genreIds,
            options?.userId,
        ],
        queryFn: async (): Promise<LibraryItemsResponse> => {
            const api = getApi();
            const itemsApi = getItemsApi(api);
            const searchTerm = options?.searchTerm?.trim();
            const isPlaylistQuery = options?.includeItemTypes?.includes('Playlist');

            const response = await itemsApi.getItems({
                ...(isPlaylistQuery
                    ? { userId: options?.userId ?? libraryId! }
                    : { parentId: libraryId! }),
                sortBy: options?.sortBy || ['SortName'],
                sortOrder: options?.sortOrder ? [options.sortOrder] : ['Ascending'],
                limit: options?.limit ?? 50,
                startIndex: options?.startIndex ?? 0,
                recursive: options?.recursive ?? true,
                includeItemTypes: options?.includeItemTypes,
                locationTypes: ['FileSystem'],
                ...(searchTerm ? { searchTerm } : {}),
                ...(options?.genreIds?.length ? { genreIds: options.genreIds } : {}),
            });
            return {
                items: response.data.Items || [],
                totalCount: response.data.TotalRecordCount || 0,
            };
        },
        enabled: options?.includeItemTypes?.includes('Playlist')
            ? !!options?.userId
            : !!libraryId,
        ...getRetryConfig(),
    });
}
