import { getApi } from '@/api/getApi';
import SectionScroller from '@/components/SectionScroller';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { SectionItemsConfig } from '@/hooks/api/useConfig';
import { useRowItems } from '@/hooks/api/useRowItems';
import { getImageApi } from '@jellyfin/sdk/lib/utils/api/image-api';
import { Link } from 'react-router';
import { useMemo } from 'react';

interface ItemsRowProps {
    title?: string;
    allLink?: string;
    items?: SectionItemsConfig;
}

const ItemsRow = ({ title, allLink, items }: ItemsRowProps) => {
    const { data: recentItems } = useRowItems(items);

    const posterUrls = useMemo(() => {
        if (!recentItems) return {};
        const imageApi = getImageApi(getApi());
        return recentItems.reduce(
            (acc, item) => {
                acc[item.Id!] = imageApi.getItemImageUrl({ Id: item.Id }) || '';
                return acc;
            },
            {} as Record<string, string>
        );
    }, [recentItems]);

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
                                          src={`${posterUrls[item.Id!]}?maxWidth=416&maxHeight=640&quality=85`}
                                          alt={item.Name || 'No Title'}
                                          className="min-w-36 lg:min-w-44 2xl:min-w-52 w-36 lg:w-44 2xl:w-52 min-h-54 lg:min-h-64 2xl:min-h-80 h-54 lg:h-64 2xl:h-80 object-cover rounded-md group-hover:opacity-75 transition-all group-hover:scale-105 z-10"
                                          loading="lazy"
                                      />
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
                              <div key={index} className="w-36 lg:w-44 2xl:w-52">
                                  <Skeleton className="w-36 h-54 lg:w-44 lg:h-64 2xl:w-52 2xl:h-80 rounded-md mb-2" />
                                  <Skeleton className="w-32 lg:w-40 2xl:w-48 h-4 mb-1" />
                                  <Skeleton className="w-20 lg:w-24 2xl:w-28 h-3" />
                              </div>
                          ))
                }
            />
        </div>
    );
};

export default ItemsRow;
