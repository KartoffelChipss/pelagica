import { Skeleton } from '@/components/ui/skeleton';
import { useGenresWithItems, type GenreWithItem } from '@/hooks/api/useGenresWithItems';
import { getPrimaryImageUrl } from '@/utils/jellyfinUrls';
import { ImageOff } from 'lucide-react';
import { memo, useState } from 'react';
import { Link } from 'react-router';

const GenreItem = ({ genreWithItem }: { genreWithItem: GenreWithItem }) => {
    const [posterError, setPosterError] = useState(false);
    const posterUrl = getPrimaryImageUrl(genreWithItem.item?.Id || '');
    const posterAspectRatio = '2/3';

    return (
        <Link to={`/item/${genreWithItem.id}`} key={genreWithItem.id} className="p-0 m-0">
            <div
                className={`relative w-full aspect-${posterAspectRatio} overflow-hidden rounded-md group`}
            >
                {!posterError ? (
                    <>
                        <img
                            src={`${posterUrl}?maxWidth=416&maxHeight=640&quality=85`}
                            alt={genreWithItem.item?.Name || 'No Title'}
                            className="block w-full h-full object-cover rounded-md transition-all group-hover:scale-105 group-hover:opacity-75 grayscale"
                            loading="lazy"
                            onError={() => setPosterError(true)}
                        />
                        <Skeleton className="absolute inset-0 -z-10" />
                    </>
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                        <ImageOff className="text-4xl text-muted-foreground" />
                    </div>
                )}

                <div
                    className="absolute inset-0 rounded-md z-10"
                    style={{
                        backgroundColor: genreWithItem.tint,
                        opacity: 0.35,
                    }}
                />

                <div className="absolute inset-0 z-20 rounded-md bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute bottom-2 left-2 right-2 z-30">
                    <p className="text-sm font-semibold text-gray-300 drop-shadow line-clamp-2">
                        {genreWithItem.name}
                    </p>
                </div>
            </div>
        </Link>
    );
};

const GenreSkeletonLoader = memo(() => (
    <div className="w-full gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9">
        {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="relative w-full aspect-2/3 rounded-md">
                <Skeleton className="w-full h-full rounded-md" />
            </div>
        ))}
    </div>
));

const EmptySearchPage = () => {
    const { data: genres, isLoading, error } = useGenresWithItems();

    return (
        <div className="mt-4 w-full">
            {isLoading && <GenreSkeletonLoader />}
            {error && <span>Error loading genres.</span>}
            {!isLoading && !error && genres && (
                <div className="w-full gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9">
                    {genres.map((genre) => (
                        <GenreItem key={genre.id} genreWithItem={genre} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmptySearchPage;
