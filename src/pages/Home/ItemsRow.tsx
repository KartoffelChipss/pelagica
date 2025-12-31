import { getApi } from '@/api/getApi';
import SectionScroller from '@/components/SectionScroller';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { SectionItemsConfig } from '@/hooks/api/useConfig';
import { useRowItems } from '@/hooks/api/useRowItems';
import { getImageApi } from '@jellyfin/sdk/lib/utils/api/image-api';
import { Play } from 'lucide-react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router';

interface ItemsRowProps {
    title?: string;
    allLink?: string;
    items?: SectionItemsConfig;
}

const ItemsRow = ({ title, allLink, items }: ItemsRowProps) => {
    const navigate = useNavigate();
    const { data: recentItems } = useRowItems(items);

    function getPosterUrl(itemId: string) {
        const imageApi = getImageApi(getApi());

        return imageApi.getItemImageUrl({
            Id: itemId,
        });
    }

    return (
        <div>
            <SectionScroller
                className="max-w-full"
                title={title}
                additionalButtons={
                    <>
                        {allLink && (
                            <Button variant={'outline'} asChild>
                                <Link to={allLink}>View All</Link>
                            </Button>
                        )}
                    </>
                }
                items={
                    recentItems
                        ? recentItems.map((item) => (
                              <Link to={`/item/${item.Id}`} key={item.Id}>
                                  <div className="relative w-36 h-54 lg:w-44 lg:h-64 2xl:w-52 2xl:h-80 overflow-hidden rounded-md group">
                                      <img
                                          key={item.Id}
                                          src={getPosterUrl(item.Id ?? '')}
                                          alt={item.Name || 'No Title'}
                                          className="min-w-36 lg:min-w-44 2xl:min-w-52 w-36 lg:w-44 2xl:w-52 min-h-54 lg:min-h-64 2xl:min-h-80 h-54 lg:h-64 2xl:h-80 object-cover rounded-md group-hover:opacity-75 transition-all group-hover:scale-105 z-10"
                                          loading="lazy"
                                      />
                                      <Button
                                          variant="secondary"
                                          className="absolute inset-0 m-auto flex items-center justify-center opacity-0 group-hover:opacity-100 transform transition-all group-hover:scale-110 w-10 h-10 rounded-full hover:bg-secondary"
                                          onClick={() => navigate(`/item/${item.Id}/play`)}
                                      >
                                          <Play size={16} />
                                      </Button>
                                      <Skeleton className="absolute bottom-0 left-0 right-0 h-54 lg:h-64 2xl:h-80 -z-1" />
                                  </div>
                                  <p className="mt-2 text-sm line-clamp-1 text-ellipsis break-all max-w-36 lg:max-w-44 2xl:max-w-52">
                                      {item.Name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                      {item.PremiereDate
                                          ? new Date(item.PremiereDate).getFullYear()
                                          : 'Unknown Year'}
                                  </p>
                              </Link>
                          ))
                        : Array.from({ length: 5 }).map((_, index) => (
                              <div key={index} className="w-36">
                                  <Skeleton className="w-36 h-54 rounded-md mb-2" />
                                  <Skeleton className="w-32 h-4 mb-1" />
                                  <Skeleton className="w-20 h-3" />
                              </div>
                          ))
                }
            />
        </div>
    );
};

export default ItemsRow;
