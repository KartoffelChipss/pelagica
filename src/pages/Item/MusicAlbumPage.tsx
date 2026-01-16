import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getPrimaryImageUrl } from '@/utils/jellyfinUrls';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Link } from 'react-router';
import { ticksToReadableMusicTime, ticksToReadableTime } from '@/utils/timeConversion';
import { Button } from '@/components/ui/button';
import { EllipsisVertical, Info, ListMusic, Play } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppConfig } from '@/hooks/api/useConfig';
import { useAlbumTracks } from '@/hooks/api/useAlbumTracks';
import { useMusicPlayback } from '@/hooks/useMusicPlayback';
import { useTranslation } from 'react-i18next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import MediaInfoDialog from './MediaInfoDialog';
import type { TFunction } from 'i18next';
import { usePlaylists } from '@/hooks/api/playlist/usePlaylists';
import { useAddToPlaylist } from '@/hooks/api/playlist/useAddToPlaylist';
import { useRemoveFromPlaylist } from '@/hooks/api/playlist/useRemoveFromPlaylist';
import { useCurrentUser } from '@/hooks/api/useCurrentUser';
import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePlaylistPresence } from '@/hooks/api/playlist/usePlaylistPresence';

const MAX_ARTISTS_DISPLAYED = 5;

const SongDropDown = ({ track, t }: { track: BaseItemDto; t: TFunction }) => {
    const { data: currentUser } = useCurrentUser();
    const { data: playlists, isLoading: isLoadingPlaylists } = usePlaylists(currentUser?.Id);
    const playlistIds = useMemo(
        () => playlists?.map((p) => p.Id!).filter(Boolean) || [],
        [playlists]
    );
    const {
        data: presence,
        isLoading: isCheckingPlaylists,
        refetch,
    } = usePlaylistPresence(track.Id, playlistIds, currentUser?.Id);
    const addToPlaylist = useAddToPlaylist();
    const removeFromPlaylist = useRemoveFromPlaylist();
    const queryClient = useQueryClient();
    const [localPresence, setLocalPresence] = useState(presence || {});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (presence) setLocalPresence(presence);
    }, [presence]);

    const handlePlaylistToggle = async (playlistId: string) => {
        if (!track.Id) return;

        const currentState = localPresence[playlistId]?.present || false;
        setLoadingStates((prev) => ({ ...prev, [playlistId]: true }));

        try {
            if (currentState) {
                const playlistItemId = localPresence[playlistId]?.playlistItemId;
                if (playlistItemId) {
                    await removeFromPlaylist.mutateAsync({
                        playlistId,
                        entryIds: [playlistItemId],
                    });
                    setLocalPresence((prev) => ({
                        ...prev,
                        [playlistId]: { present: false, playlistItemId: null },
                    }));
                }
            } else {
                await addToPlaylist.mutateAsync({
                    playlistId,
                    itemIds: [track.Id],
                    userId: currentUser?.Id,
                });
                setLocalPresence((prev) => ({
                    ...prev,
                    [playlistId]: {
                        present: true,
                        playlistItemId: prev[playlistId]?.playlistItemId || null,
                    },
                }));
            }
            await queryClient.invalidateQueries({ queryKey: ['playlistPresence', track.Id] });
            refetch();
        } catch (error) {
            console.error('Error toggling playlist:', error);
        } finally {
            setLoadingStates((prev) => ({ ...prev, [playlistId]: false }));
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={'outline'} size={'icon-sm'} onClick={(e) => e.stopPropagation()}>
                    <EllipsisVertical />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <ListMusic /> {t('add_to_playlist')}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {(isLoadingPlaylists || isCheckingPlaylists) && (
                            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                        )}
                        {!isLoadingPlaylists && playlists && playlists.length === 0 && (
                            <DropdownMenuItem disabled>No playlists found</DropdownMenuItem>
                        )}
                        {!isCheckingPlaylists &&
                            playlists?.map((playlist) => (
                                <DropdownMenuCheckboxItem
                                    key={playlist.Id}
                                    checked={localPresence[playlist.Id!]?.present || false}
                                    disabled={loadingStates[playlist.Id!]}
                                    onCheckedChange={() => handlePlaylistToggle(playlist.Id!)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {playlist.Name}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <MediaInfoDialog
                    streams={track.MediaStreams || []}
                    trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Info /> {t('mediaInfo')}
                        </DropdownMenuItem>
                    }
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

interface MusicAlbumPageProps {
    item: BaseItemDto;
    config: AppConfig;
}

const MusicAlbumPage = ({ item, config }: MusicAlbumPageProps) => {
    const { t } = useTranslation('item');
    const { setBackground } = usePageBackground();
    const { loadQueue } = useMusicPlayback();
    const {
        data: albumTracks,
        isLoading: isLoadingAlbumTracks,
        error: albumTracksError,
    } = useAlbumTracks(item.Id);

    useEffect(() => {
        setBackground(
            <div className="fixed top-0 left-0 w-full h-full -z-20 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={getPrimaryImageUrl(item.Id || '')}
                        alt={item.Name + ' Backdrop'}
                        className="w-full h-full object-cover blur-3xl scale-110 opacity-40"
                    />
                </div>
                <div className="absolute inset-0 bg-linear-to-b from-background/80 via-background/50 to-background" />
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
            </div>
        );

        return () => {
            setBackground(null);
        };
    }, [item.Id, item.Name, setBackground]);

    const detailItems: string[] = [];
    if (item.PremiereDate) {
        const year = new Date(item.PremiereDate).getFullYear();
        detailItems.push(year.toString());
    }
    if (item.ChildCount !== undefined && item.ChildCount !== null) {
        detailItems.push(
            t(`tracks_count${item.ChildCount > 1 ? '_plural' : ''}`, { count: item.ChildCount })
        );
    }
    if (item.RunTimeTicks !== undefined && item.RunTimeTicks !== null) {
        detailItems.push(ticksToReadableTime(item.RunTimeTicks));
    }

    const handlePlayAlbum = () => {
        if (albumTracks && albumTracks.length > 0) {
            const trackQueue = albumTracks.map((track) => ({
                id: track.Id || '',
                title: track.Name || '',
                artist: track.ArtistItems?.[0]?.Name || item.ArtistItems?.[0]?.Name || 'Unknown',
                albumId: item.Id || '',
                albumName: item.Name || '',
            }));
            loadQueue(trackQueue, 0, true);
        }
    };

    const handleTrackClick = (_: BaseItemDto, index: number) => {
        if (albumTracks && albumTracks.length > 0) {
            const trackQueue = albumTracks.map((t) => ({
                id: t.Id || '',
                title: t.Name || '',
                artist: t.ArtistItems?.[0]?.Name || item.ArtistItems?.[0]?.Name || 'Unknown',
                albumId: item.Id || '',
                albumName: item.Name || '',
            }));
            loadQueue(trackQueue, index, true);
        }
    };

    return (
        <div className="relative h-full w-full">
            <div className={`relative z-10`}>
                <div
                    className={`bg-background/30 backdrop-blur-md p-4 sm:p-8 rounded-md w-full flex flex-col gap-4`}
                >
                    <div className="flex justify-start items-end-safe gap-4 w-full">
                        <img
                            src={getPrimaryImageUrl(item.Id!)}
                            alt={item.Name + ' Cover'}
                            className="relative w-32 h-32 object-contain rounded-md"
                        />
                        <div className="flex flex-col gap-0">
                            <span className="text-sm text-muted-foreground">{t('album')}</span>
                            <h1 className="text-3xl font-bold">{item.Name}</h1>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {item.ArtistItems &&
                                    item.ArtistItems.slice(0, MAX_ARTISTS_DISPLAYED).map(
                                        (artist) => (
                                            <Link
                                                key={artist.Id}
                                                to={`/item/${artist.Id}`}
                                                className="bg-accent/20 rounded-full text-sm"
                                            >
                                                {artist.Name}
                                            </Link>
                                        )
                                    )}
                                {item.ArtistItems &&
                                    item.ArtistItems.length > MAX_ARTISTS_DISPLAYED && (
                                        <span className="text-sm text-muted-foreground">
                                            {t('more_artists', {
                                                count:
                                                    item.ArtistItems.length - MAX_ARTISTS_DISPLAYED,
                                            })}
                                        </span>
                                    )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {detailItems.join(' • ')}
                            </div>
                        </div>
                    </div>
                    {/* <p className="text-sm text-muted-foreground line-clamp-2">{item.Overview}</p> */}
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handlePlayAlbum}>
                            <Play />
                            {t('play')}
                        </Button>
                        <FavoriteButton
                            item={item}
                            size={'icon'}
                            showFavoriteButton={config.itemPage?.favoriteButton?.includes(
                                item.Type!
                            )}
                        />
                    </div>
                    {isLoadingAlbumTracks && (
                        <div className="flex flex-col gap-0">
                            <div className="flex items-center p-2 px-8 group text-muted-foreground">
                                <span className="text-sm mr-8 font-mono w-4">#</span>
                                <span>{t('title')}</span>
                                <span className="text-sm ml-auto">{t('duration')}</span>
                            </div>
                            <div className="border-b border-border mb-4" />
                            <div className="flex flex-col gap-3">
                                {[...Array(3)].map((_, index) => (
                                    <Skeleton key={index} className="h-15 w-full rounded-xl" />
                                ))}
                            </div>
                        </div>
                    )}
                    {albumTracksError && (
                        <div className="text-red-500">{t('error_loading_tracks')}</div>
                    )}
                    {albumTracks && albumTracks.length > 0 && (
                        <div className="flex flex-col gap-0">
                            <div className="flex items-center p-2 px-8 group text-muted-foreground">
                                <span className="text-sm mr-8 font-mono w-4">#</span>
                                <span>{t('title')}</span>
                                <span className="text-sm ml-auto">{t('duration')}</span>
                                <Button variant="ghost" size="icon-sm" className="ml-4 invisible">
                                    <EllipsisVertical />
                                </Button>
                            </div>
                            <div className="border-b border-border mb-4" />
                            <div className="flex flex-col gap-1">
                                {albumTracks.map((track, index) => {
                                    if (!track.IndexNumber) return null;

                                    return (
                                        <div
                                            key={track.Id}
                                            className="flex items-center p-2 px-8 hover:bg-accent/70 rounded-md group cursor-pointer"
                                            onClick={() => handleTrackClick(track, index)}
                                        >
                                            {track.IndexNumber !== undefined && (
                                                <span className="text-sm text-muted-foreground mr-8 font-mono w-4">
                                                    <span className="group-hover:hidden">
                                                        {track.IndexNumber}
                                                    </span>
                                                    <span className="hidden group-hover:inline-block">
                                                        ▶︎
                                                    </span>
                                                </span>
                                            )}
                                            <div className="flex flex-col">
                                                <span>{track.Name}</span>
                                                {track.ArtistItems &&
                                                    track.ArtistItems.length > 0 && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {track.ArtistItems.map(
                                                                (artist) => artist.Name
                                                            ).join(', ')}
                                                        </span>
                                                    )}
                                            </div>
                                            {track.RunTimeTicks !== undefined &&
                                                track.RunTimeTicks !== null && (
                                                    <span className="text-sm text-muted-foreground ml-auto">
                                                        {ticksToReadableMusicTime(
                                                            track.RunTimeTicks
                                                        )}
                                                    </span>
                                                )}
                                            <div
                                                className="ml-4"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <SongDropDown track={track} t={t} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MusicAlbumPage;
