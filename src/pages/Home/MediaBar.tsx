import { Badge } from '@/components/ui/badge';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { useMediaBarItems } from '@/hooks/api/useMediaBarItems';

function getBackdropUrl(itemId: string) {
    try {
        const server = localStorage.getItem('jf_server');
        const token = localStorage.getItem('jf_token');

        if (!server || !token) return '/default-backdrop.jpg';

        const url = new URL(server);
        url.pathname = `/Items/${itemId}/Images/Backdrop/0`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);

        return url.toString();
    } catch {
        return '/default-backdrop.jpg';
    }
}

function getLogoUrl(itemId: string) {
    try {
        const server = localStorage.getItem('jf_server');
        const token = localStorage.getItem('jf_token');

        if (!server || !token) return '';

        const url = new URL(server);
        url.pathname = `/Items/${itemId}/Images/Logo`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);

        return url.toString();
    } catch {
        return '';
    }
}

function ticksToReadableTime(ticks: number): string {
    const totalSeconds = Math.floor(ticks / 10000000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        if (minutes === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

function getEndsAt(durationTicks: number): Date {
    const durationMs = durationTicks / 10000;
    return new Date(new Date().getTime() + durationMs);
}

interface MediaBarProps {
    className?: string;
    size?: 'small' | 'medium' | 'large';
}

const MediaBar = ({ className, size = 'medium' }: MediaBarProps) => {
    const { data: mediabarItems, isLoading, isError } = useMediaBarItems();

    console.log('MediaBar Items:', mediabarItems);

    const outerSize =
        size === 'small'
            ? 'min-h-60 sm:min-h-80'
            : size === 'large'
              ? 'min-h-80 sm:min-h-130 lg:min-h-180'
              : 'min-h-100 sm:min-h-130';

    const logoSize =
        size === 'small'
            ? 'max-h-15'
            : size === 'large'
              ? 'max-h-40 sm:max-h-60'
              : 'max-h-30 sm:max-h-50';

    return (
        <Carousel
            className={className}
            opts={{
                loop: true,
            }}
        >
            <CarouselContent>
                {isLoading && <p>Loading media bar...</p>}
                {isError && <p>Error loading media bar.</p>}
                {mediabarItems &&
                    mediabarItems.map((item) => (
                        <CarouselItem key={item.Id}>
                            <div
                                className={`rounded-md bg-cover bg-center flex flex-col items-start justify-end gap-4 overflow-hidden relative min-h-130 ${outerSize}`}
                                style={{
                                    backgroundImage: `url('${getBackdropUrl(item.Id!)}')`,
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/70 to-transparent pointer-events-none max-w-5xl" />
                                <div className="flex flex-col items-start gap-4 max-w-2xl px-6 sm:px-16 py-6 rounded relative z-10">
                                    {getLogoUrl(item.Id!) ? (
                                        <img
                                            src={getLogoUrl(item.Id!)}
                                            alt={item.Name || 'Item Logo'}
                                            className={`${logoSize} h-full object-contain`}
                                        />
                                    ) : (
                                        <h2 className="text-2xl sm:text-4xl font-bold">
                                            {item.Name}
                                        </h2>
                                    )}
                                    {item.GenreItems && item.GenreItems.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {item.GenreItems.map((genre) => (
                                                <Badge variant={'outline'} key={genre.Id}>
                                                    {genre.Name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        {item.PremiereDate && (
                                            <span>{new Date(item.PremiereDate).getFullYear()}</span>
                                        )}
                                        {item.Type === 'Series' && item.ChildCount && (
                                            <span>
                                                {item.ChildCount} season
                                                {item.ChildCount !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {item.Type === 'Series' && item.RecursiveItemCount && (
                                            <span>
                                                {item.RecursiveItemCount} episode
                                                {item.RecursiveItemCount !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {item.RunTimeTicks && item.RunTimeTicks > 0 && (
                                            <>
                                                <span>
                                                    {ticksToReadableTime(item.RunTimeTicks)}
                                                </span>
                                                <span>
                                                    Ends at{' '}
                                                    {getEndsAt(
                                                        item.RunTimeTicks!
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm line-clamp-2 text-muted-foreground">
                                        {item.Overview}
                                    </p>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
        </Carousel>
    );
};

export default MediaBar;
