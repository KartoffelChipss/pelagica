import { useEffect, useMemo, useState, useTransition } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSearch } from '@/context/SearchContext';
import { useSearchItems } from '@/hooks/api/useSearchItems';
import { Link } from 'react-router';
import { Description, DialogTitle } from '@radix-ui/react-dialog';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import { SearchIcon, XIcon } from 'lucide-react';
import { getImageApi } from '@jellyfin/sdk/lib/utils/api/image-api';
import { getApi } from '@/api/getApi';
import { Skeleton } from './ui/skeleton';

export const SearchCommand = () => {
    const { isOpen, closeSearch } = useSearch();
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
        <Dialog open={isOpen} onOpenChange={closeSearch}>
            <DialogTitle className="sr-only">Search Media</DialogTitle>
            <Description className="sr-only">
                Use the input field to search for media items.
            </Description>
            <DialogContent showCloseButton={false} className="overflow-hidden p-4">
                <div className="flex flex-col gap-4">
                    <InputGroup className="shadow-lg">
                        <InputGroupInput
                            placeholder="Search media..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <InputGroupAddon>
                            <SearchIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton onClick={() => setQuery('')}>
                                <XIcon />
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                    <div className="max-h-120 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground [&::-webkit-scrollbar-thumb]:rounded-full">
                        {error ? (
                            <div className="px-4 py-8 text-center text-sm text-red-500">
                                Error: {error.message || 'Failed to search'}
                            </div>
                        ) : results && results.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4">
                                {results.map((item) => {
                                    return (
                                        <Link
                                            to={`/item/${item.Id}`}
                                            key={item.Id}
                                            className="p-0 m-0"
                                        >
                                            <div className="relative w-full aspect-2/3 overflow-hidden rounded-md group">
                                                <img
                                                    key={item.Id}
                                                    src={`${posterUrls[item.Id!]}?maxWidth=416&maxHeight=640&quality=85`}
                                                    alt={item.Name || ''}
                                                    className="w-full h-full object-cover rounded-md group-hover:opacity-75 transition-all group-hover:scale-105 z-10"
                                                    loading="lazy"
                                                />
                                                <Skeleton className="absolute bottom-0 left-0 right-0 top-0 -z-1" />
                                            </div>
                                            <p className="mt-2 text-sm line-clamp-1 text-ellipsis break-all">
                                                {item.Name || ''}
                                            </p>
                                            <div className="flex flex-wrap items-center mt-1">
                                                <span className="text-xs text-muted-foreground mr-3">
                                                    {item.Type}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : isLoading ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Searching...
                            </div>
                        ) : query ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                No results found
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Start typing to search...
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
