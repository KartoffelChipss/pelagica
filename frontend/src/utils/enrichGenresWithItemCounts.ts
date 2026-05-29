import { getApi } from '@/api/getApi';
import type { BaseItemDto, BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';

const countCache = new Map<string, number>();

function cacheKey(genreId: string, includeItemTypes: BaseItemKind[], parentId?: string | null) {
    return `${genreId}:${parentId ?? 'global'}:${includeItemTypes.slice().sort().join(',')}`;
}

export async function enrichGenresWithItemCounts(
    genres: BaseItemDto[],
    includeItemTypes: BaseItemKind[],
    parentId?: string | null
): Promise<BaseItemDto[]> {
    if (genres.length === 0) return genres;

    const api = getApi();
    const itemsApi = getItemsApi(api);

    return Promise.all(
        genres.map(async (genre) => {
            if (!genre.Id) return genre;

            const key = cacheKey(genre.Id, includeItemTypes, parentId);
            const cached = countCache.get(key);
            if (cached !== undefined) {
                return { ...genre, ChildCount: cached };
            }

            try {
                const response = await itemsApi.getItems({
                    limit: 1,
                    genreIds: [genre.Id],
                    includeItemTypes,
                    recursive: true,
                    excludeItemTypes: ['CollectionFolder'],
                    ...(parentId ? { parentId } : {}),
                });

                const count = response.data?.TotalRecordCount ?? 0;
                countCache.set(key, count);
                return { ...genre, ChildCount: count };
            } catch {
                return genre;
            }
        })
    );
}
