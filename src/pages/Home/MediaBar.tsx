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

interface MediaBarProps {
    className?: string;
}

const MediaBar = ({ className }: MediaBarProps) => {
    const { data: mediabarItems, isLoading, isError } = useMediaBarItems();

    console.log('MediaBar Items:', mediabarItems);

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
                                className="rounded-md bg-cover bg-center flex items-end p-16"
                                style={{
                                    backgroundImage: `url('${getBackdropUrl(item.Id!)}')`,
                                }}
                            >
                                <img
                                    src={getLogoUrl(item.Id!)}
                                    alt={item.Name || 'Item Logo'}
                                    className="max-h-20 object-contain"
                                />
                                {item.Genres && item.Genres.length > 0 && (
                                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                        {item.Genres.map((genre) => (
                                            <span
                                                key={genre}
                                                className="bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded"
                                            >
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CarouselItem>
                    ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 " />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 " />
        </Carousel>
    );
};

export default MediaBar;
