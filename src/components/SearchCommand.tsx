import { useEffect, useMemo, useState, useTransition } from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { useSearch } from '@/context/SearchContext';
import { useSearchItems } from '@/hooks/api/useSearchItems';
import { useNavigate } from 'react-router';
import { getImageApi } from '@jellyfin/sdk/lib/utils/api/image-api';
import { getApi } from '@/api/getApi';
import { Skeleton } from './ui/skeleton';
import { Dot } from 'lucide-react';

export const SearchCommand = () => {
    const { isOpen, closeSearch } = useSearch();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [, startTransition] = useTransition();
    const { data: results, isLoading, error } = useSearchItems(debouncedQuery);

    useEffect(() => {
        const handler = setTimeout(() => {
            startTransition(() => {
                setDebouncedQuery(query);
            });
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    useEffect(() => {
        if (!isOpen) {
            startTransition(() => {
                setQuery('');
            });
        }
    }, [isOpen]);

    const posterUrls = useMemo(() => {
        if (!results) return {};
        const imageApi = getImageApi(getApi());
        return results.reduce(
            (acc, item) => {
                acc[item.Id!] = imageApi.getItemImageUrl({ Id: item.Id }) || '';
                return acc;
            },
            {} as Record<string, string>
        );
    }, [results]);

    return (
        <CommandDialog
            open={isOpen}
            onOpenChange={closeSearch}
            title="Search Media"
            description="Search for movies, shows, and other media items"
            shouldFilter={false}
        >
            <CommandInput placeholder="Search media..." value={query} onValueChange={setQuery} />
            <CommandList>
                {error ? (
                    <div className="px-4 py-8 text-center text-sm text-destructive">
                        Error: {error.message || 'Failed to search'}
                    </div>
                ) : !query ? (
                    <CommandEmpty>Start typing to search...</CommandEmpty>
                ) : isLoading ? (
                    <>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 rounded-md">
                                <Skeleton className="w-12 h-18 rounded-md shrink-0" />
                                <div className="flex flex-col justify-start min-w-0 flex-1 gap-2">
                                    <Skeleton className="h-4 w-3/4 rounded" />
                                    <Skeleton className="h-3 w-1/2 rounded" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : results && results.length > 0 ? (
                    <>
                        {results.map((item) => (
                            <CommandItem
                                key={item.Id}
                                value={item.Name!}
                                onSelect={() => {
                                    navigate(`/item/${item.Id}`);
                                    closeSearch();
                                }}
                            >
                                <div className="flex items-start gap-3 w-full">
                                    <div className="relative w-12 h-18 overflow-hidden rounded-md shrink-0">
                                        <img
                                            src={`${posterUrls[item.Id!]}?maxWidth=96&maxHeight=144&quality=85`}
                                            alt={item.Name || ''}
                                            className="w-full h-full object-cover rounded-md"
                                            loading="lazy"
                                        />
                                        <Skeleton className="absolute bottom-0 left-0 right-0 top-0 -z-1" />
                                    </div>
                                    <div className="flex flex-col justify-start min-w-0 flex-1">
                                        <p className="text-md font-medium line-clamp-2 text-ellipsis break-all">
                                            {item.Name || ''}
                                        </p>
                                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                            <span>{item.Type}</span>
                                            <Dot />
                                            <span>{item.ProductionYear}</span>
                                        </div>
                                    </div>
                                </div>
                            </CommandItem>
                        ))}
                    </>
                ) : (
                    <CommandEmpty>No results found</CommandEmpty>
                )}
            </CommandList>
        </CommandDialog>
    );
};
