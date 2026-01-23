import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getGenresApi } from '@jellyfin/sdk/lib/utils/api/genres-api';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getRetryConfig } from '@/utils/authErrorHandler';
import { getGenreTint } from '@/utils/genreTint';
import { getCachedGenreItem, setCachedGenreItem } from '@/utils/genreItemCache';

export interface GenreItem {
    Id?: string;
    Name?: string;
}

export interface GenreWithItem {
    name: string;
    id: string;
    tint: string;
    item?: GenreItem;
}

export function useGenresWithItems() {
    return useQuery<GenreWithItem[]>({
        queryKey: ['genres-with-random-item'],
        queryFn: async () => {
            const api = getApi();
            const genresApi = getGenresApi(api);
            const itemsApi = getItemsApi(api);

            const genresResponse = await genresApi.getGenres({
                limit: 50,
                sortBy: ['Name'],
                sortOrder: ['Ascending'],
                includeItemTypes: ['Movie', 'Series'],
            });

            const genres = (genresResponse?.data?.Items ?? []) as BaseItemDto[];

            return Promise.all(
                genres
                    .filter((g) => g.Id && g.Name)
                    .map(async (genre) => {
                        const tint = getGenreTint(genre.Id!);

                        const cachedItem = getCachedGenreItem(genre.Id!);

                        if (cachedItem?.Id) {
                            return {
                                name: genre.Name!,
                                id: genre.Id!,
                                tint,
                                item: cachedItem,
                            };
                        }

                        try {
                            const itemsResponse = await itemsApi.getItems({
                                limit: 1,
                                genreIds: [genre.Id!],
                                includeItemTypes: ['Movie', 'Series'],
                                recursive: true,
                                excludeItemTypes: ['CollectionFolder'],
                                sortBy: ['Random'],
                            });

                            const item = itemsResponse.data?.Items?.[0];

                            if (item?.Id) {
                                const storedItem = {
                                    Id: item.Id || undefined,
                                    Name: item.Name || undefined,
                                };

                                setCachedGenreItem(genre.Id!, storedItem);

                                return {
                                    name: genre.Name!,
                                    id: genre.Id!,
                                    tint,
                                    item: storedItem,
                                };
                            }

                            return {
                                name: genre.Name!,
                                id: genre.Id!,
                                tint,
                            };
                        } catch {
                            return {
                                name: genre.Name!,
                                id: genre.Id!,
                                tint,
                            };
                        }
                    })
            );
        },
        ...getRetryConfig(),
    });
}
