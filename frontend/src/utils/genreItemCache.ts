import type { GenreItem } from '@/hooks/api/genres/useGenresWithItems';

const STORAGE_KEY = 'genreItemCache';

type ItemMap = Record<string, GenreItem>;

function getStoredItems(): ItemMap {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function saveStoredItems(map: ItemMap) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getCachedGenreItem(genreId: string): GenreItem | undefined {
    const map = getStoredItems();
    return map[genreId];
}

export function setCachedGenreItem(genreId: string, item: GenreItem) {
    const map = getStoredItems();
    map[genreId] = item;
    saveStoredItems(map);
}
