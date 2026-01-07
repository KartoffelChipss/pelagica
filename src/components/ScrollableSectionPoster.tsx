import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { Link } from 'react-router';
import { Skeleton } from './ui/skeleton';
import { getPrimaryImageUrl } from '@/utils/jellyfinUrls';

interface ScrollableSectionPosterProps {
    item?: BaseItemDto;
    posterUrl?: string;
    children?: React.ReactNode;
    itemName?: string;
    itemId?: string;
    className?: string;
}

const ScrollableSectionPoster = ({
    item,
    posterUrl,
    children,
    itemName,
    itemId,
    className,
}: ScrollableSectionPosterProps) => {
    return (
        <Link to={`/item/${itemId || item?.Id}`} key={itemId || item?.Id} className={className}>
            <div className="relative w-36 h-54 lg:w-44 lg:h-64 2xl:w-52 2xl:h-80 overflow-hidden rounded-md group">
                <img
                    key={itemId || item?.Id}
                    src={posterUrl ? posterUrl : getPrimaryImageUrl(itemId || item?.Id || '')}
                    alt={itemName || item?.Name || ''}
                    className="min-w-36 lg:min-w-44 2xl:min-w-52 w-36 lg:w-44 2xl:w-52 min-h-54 lg:min-h-64 2xl:min-h-80 h-54 lg:h-64 2xl:h-80 object-cover rounded-md group-hover:opacity-75 transition-all group-hover:scale-105 z-10"
                    loading="lazy"
                />
                <Skeleton className="absolute bottom-0 left-0 right-0 h-54 lg:h-64 2xl:h-80 -z-1" />
            </div>
            <p className="mt-2 text-sm line-clamp-1 text-ellipsis break-all max-w-36 lg:max-w-44 2xl:max-w-52">
                {itemName || item?.Name || ''}
            </p>
            {children}
        </Link>
    );
};

export default ScrollableSectionPoster;
