import type { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import type { BrowserMediaCategory } from '@/utils/sidebarLibraryNavigation';

export type MusicBrowseFilter = 'albums' | 'artists' | 'playlists' | 'genres';
export type VideoBrowseFilter = 'all' | 'genres';

export type SidebarBrowseFilter = MusicBrowseFilter | VideoBrowseFilter;

const MUSIC_FILTERS: MusicBrowseFilter[] = ['albums', 'artists', 'playlists', 'genres'];
const VIDEO_FILTERS: VideoBrowseFilter[] = ['all', 'genres'];

export function getDefaultBrowseFilter(category: BrowserMediaCategory): SidebarBrowseFilter {
    return category === 'music' ? 'albums' : 'all';
}

export function isMusicBrowseFilter(value: string): value is MusicBrowseFilter {
    return (MUSIC_FILTERS as string[]).includes(value);
}

export function isVideoBrowseFilter(value: string): value is VideoBrowseFilter {
    return (VIDEO_FILTERS as string[]).includes(value);
}

export function normalizeBrowseFilter(
    category: BrowserMediaCategory,
    value: string
): SidebarBrowseFilter {
    if (category === 'music' && isMusicBrowseFilter(value)) return value;
    if (category !== 'music' && isVideoBrowseFilter(value)) return value;
    return getDefaultBrowseFilter(category);
}

export function getBrowseFiltersForCategory(
    category: BrowserMediaCategory
): { value: SidebarBrowseFilter; label: string }[] {
    if (category === 'music') {
        return [
            { value: 'albums', label: 'Albums' },
            { value: 'artists', label: 'Artists' },
            { value: 'playlists', label: 'Playlists' },
            { value: 'genres', label: 'Genres' },
        ];
    }
    return [
        { value: 'all', label: 'All' },
        { value: 'genres', label: 'Genres' },
    ];
}

export function isGenresBrowseFilter(filter: SidebarBrowseFilter): filter is 'genres' {
    return filter === 'genres';
}

export function getItemTypesForBrowseFilter(
    category: BrowserMediaCategory,
    filter: SidebarBrowseFilter
): BaseItemKind[] | null {
    if (isGenresBrowseFilter(filter)) return null;

    if (category === 'music') {
        switch (filter as MusicBrowseFilter) {
            case 'albums':
                return ['MusicAlbum'];
            case 'artists':
                return ['MusicArtist'];
            case 'playlists':
                return ['Playlist'];
            default:
                return ['MusicAlbum'];
        }
    }

    switch (category) {
        case 'series':
            return ['Series', 'BoxSet'];
        case 'movie':
            return ['Movie'];
        default:
            return ['Movie'];
    }
}

export function getGenresIncludeItemTypes(category: BrowserMediaCategory): BaseItemKind[] {
    switch (category) {
        case 'music':
            return ['MusicAlbum', 'Audio'];
        case 'series':
            return ['Series'];
        case 'movie':
            return ['Movie'];
        default:
            return ['Movie'];
    }
}
