import { Skeleton } from '@/components/ui/skeleton';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import type { TFunction } from 'i18next';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

const LibraryItem = ({
    item,
    posterUrl,
    t,
    posterAspectRatio = '2/3',
    detailLine,
}: {
    item: BaseItemDto;
    posterUrl: string;
    t: TFunction;
    posterAspectRatio?: string;
    detailLine?: React.ReactNode;
}) => {
    const [posterError, setPosterError] = useState(false);

    return (
        <Link to={`/item/${item.Id}`} key={item.Id} className="p-0 m-0">
            <div
                className={`relative w-full aspect-${posterAspectRatio} overflow-hidden rounded-md group`}
            >
                {!posterError ? (
                    <>
                        <img
                            key={item.Id}
                            src={`${posterUrl}?maxWidth=416&maxHeight=640&quality=85`}
                            alt={item.Name || t('library:no_title')}
                            className="w-full h-full object-cover rounded-md group-hover:opacity-75 transition-all group-hover:scale-105 z-10"
                            loading="lazy"
                            onError={() => setPosterError(true)}
                        />
                        <Skeleton className="absolute bottom-0 left-0 right-0 top-0 -z-1" />
                    </>
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                        <ImageOff className="text-4xl text-muted-foreground" />
                    </div>
                )}
            </div>
            <p className="mt-2 text-sm line-clamp-1 text-ellipsis break-all">
                {item.Name || t('library:no_title')}
            </p>
            <div className="flex flex-wrap items-center">
                <span className="text-xs text-muted-foreground mr-3 line-clamp-1">
                    {detailLine}
                </span>
            </div>
        </Link>
    );
};

export default LibraryItem;
