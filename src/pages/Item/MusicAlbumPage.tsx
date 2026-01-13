import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getPrimaryImageUrl } from '@/utils/jellyfinUrls';
import { useEffect } from 'react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Link } from 'react-router';
import { ticksToReadableMusicTime, ticksToReadableTime } from '@/utils/timeConversion';
import { Button } from '@/components/ui/button';
import { Play, Shuffle } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import type { AppConfig } from '@/hooks/api/useConfig';
import { useAlbumTracks } from '@/hooks/api/useAlbumTracks';

const MAX_ARTISTS_DISPLAYED = 5;

interface MusicAlbumPageProps {
    item: BaseItemDto;
    config: AppConfig;
}

const MusicAlbumPage = ({ item, config }: MusicAlbumPageProps) => {
    const { setBackground } = usePageBackground();
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
    if (item.ChildCount !== undefined) {
        detailItems.push(`${item.ChildCount} Tracks`);
    }
    if (item.RunTimeTicks !== undefined && item.RunTimeTicks !== null) {
        detailItems.push(ticksToReadableTime(item.RunTimeTicks));
    }

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
                            <span className="text-sm text-muted-foreground">Album</span>
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
                                            +{item.ArtistItems.length - MAX_ARTISTS_DISPLAYED} more
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
                        <Button>
                            <Play />
                            Play
                        </Button>
                        <Button variant={'outline'} size={'icon'}>
                            <Shuffle />
                        </Button>
                        <FavoriteButton
                            item={item}
                            size={'icon'}
                            showFavoriteButton={config.itemPage?.favoriteButton?.includes(
                                item.Type!
                            )}
                        />
                    </div>
                    {isLoadingAlbumTracks && <div>Loading tracks...</div>}
                    {albumTracksError && <div className="text-red-500">Error loading tracks.</div>}
                    {albumTracks && albumTracks.length > 0 && (
                        <div className="flex flex-col gap-0">
                            <div className="flex items-center p-2 px-8 group text-muted-foreground">
                                <span className="text-sm mr-8 font-mono w-4">#</span>
                                <span>Title</span>
                                <span className="text-sm ml-auto">Duration</span>
                            </div>
                            <div className="border-b border-border mb-4" />
                            <div className="flex flex-col gap-1">
                                {albumTracks.map((track) => {
                                    if (!track.IndexNumber) return null;

                                    return (
                                        <div
                                            key={track.Id}
                                            className="flex items-center p-2 px-8 hover:bg-accent/70 rounded-md group cursor-pointer"
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
