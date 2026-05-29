import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getPrimaryImageUrl } from '@/utils/jellyfinUrls';

export function getItemTypeLabel(type?: string | null): string {
    switch (type) {
        case 'MusicAlbum':
            return 'Album';
        case 'MusicArtist':
            return 'Artist';
        case 'Playlist':
            return 'Playlist';
        case 'Genre':
            return 'Genre';
        case 'Series':
            return 'Series';
        case 'Movie':
            return 'Movie';
        case 'BoxSet':
            return 'Box Set';
        default:
            return type ?? 'Item';
    }
}

export function getItemSubtitle(item: BaseItemDto): string {
    if (item.Type === 'MusicAlbum' && item.AlbumArtist) {
        return item.AlbumArtist;
    }
    if (item.Type === 'Genre') {
        if (item.ChildCount != null) {
            if (item.ChildCount === 0) return 'No items';
            return item.ChildCount === 1 ? '1 item' : `${item.ChildCount} items`;
        }
        return 'Genre';
    }
    if (item.Type === 'Playlist' && item.ChildCount != null) {
        return `${item.ChildCount} tracks`;
    }
    if (item.PremiereDate) {
        return String(new Date(item.PremiereDate).getFullYear());
    }
    if (item.ProductionYear) {
        return String(item.ProductionYear);
    }
    return getItemTypeLabel(item.Type);
}

export function getSidebarPosterUrl(item: BaseItemDto): string {
    const isSquare =
        item.Type === 'MusicAlbum' ||
        item.Type === 'MusicArtist' ||
        item.Type === 'Playlist' ||
        item.Type === 'Genre';
    return getPrimaryImageUrl(
        item.Id!,
        isSquare ? { height: 112, width: 112 } : { height: 168, width: 112 },
        item.ImageTags?.Primary
    );
}
