import { getApi } from '@/api/getApi';
import SectionScroller from '@/components/SectionScroller';
import { Button } from '@/components/ui/button';
import { useRecentItems } from '@/hooks/api/useRecentItems';
import { getImageApi } from '@jellyfin/sdk/lib/utils/api/image-api';
import { Play } from 'lucide-react';
import { Link } from 'react-router';

interface LibraryItemsProps {
    libraryId: string;
    libraryName: string;
}

const LibraryItems = ({ libraryId, libraryName }: LibraryItemsProps) => {
    const { data: recentItems } = useRecentItems(libraryId);

    function getPosterUrl(itemId: string) {
        const imageApi = getImageApi(getApi());

        return imageApi.getItemImageUrl({
            Id: itemId,
        });
    }

    return (
        <div>
            {recentItems ? (
                <SectionScroller
                    className="max-w-full"
                    title={'Recently Added in ' + libraryName}
                    additionalButtons={
                        <>
                            <Button variant={'outline'} asChild>
                                <Link to={`/library/${libraryId}`}>View All</Link>
                            </Button>
                        </>
                    }
                    items={recentItems.map((item) => (
                        <Link to={`/item/${item.Id}`} key={item.Id}>
                            <div className="relative w-32 h-48 overflow-hidden rounded-md bg-muted group">
                                <img
                                    key={item.Id}
                                    src={getPosterUrl(item.Id ?? '')}
                                    alt={item.Name || 'No Title'}
                                    className="min-w-32 w-32 min-h-48 h-48 object-cover rounded-md group-hover:opacity-75 transition-all group-hover:scale-105"
                                />
                                <Button
                                    variant="secondary"
                                    className="absolute inset-0 m-auto flex items-center justify-center opacity-0 group-hover:opacity-100 transform transition-all group-hover:scale-110 w-10 h-10 rounded-full hover:bg-secondary"
                                    asChild
                                >
                                    <Link to={`/item/${item.Id}/play`}>
                                        <Play size={16} />
                                    </Link>
                                </Button>
                            </div>
                            <p className="mt-2 text-sm line-clamp-1 text-ellipsis break-all">
                                {item.Name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {item.PremiereDate
                                    ? new Date(item.PremiereDate).getFullYear()
                                    : 'Unknown Year'}
                            </p>
                        </Link>
                    ))}
                />
            ) : (
                <p>Loading recent items...</p>
            )}
        </div>
    );
};

export default LibraryItems;
