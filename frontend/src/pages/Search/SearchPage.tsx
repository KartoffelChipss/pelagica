import { memo, useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'react-router';
import Page from '../Page';
import { useSearchItems } from '@/hooks/api/useSearchItems';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import {
    CircleQuestionMark,
    Clapperboard,
    LayoutGrid,
    Music,
    SearchIcon,
    TriangleAlert,
    XIcon,
} from 'lucide-react';
import { ButtonGroup } from '@/components/ui/button-group';
import MovieTvGrid from './MovieTvGrid';
import MusicGrid from './MusicGrid';
import PeopleGrid from './PeopleGrid';
import EpisodesGrid from './EpisodesGrid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';

const ITEM_TYPE_GROUPS = {
    episodes: ['Episode'] as BaseItemKind[],
    moviesTv: ['Movie', 'Series'] as BaseItemKind[],
    music: ['MusicAlbum'] as BaseItemKind[],
    people: ['Person'] as BaseItemKind[],
} as const;

const LoadingSkeleton = memo(() => (
    <div className="space-y-8 mt-4">
        {[1, 2].map((section) => (
            <div key={section}>
                <Skeleton className="h-7 w-40 mb-4" />
                <div className="w-full gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
                        <div key={item} className="space-y-2">
                            <Skeleton className="aspect-2/3 w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
));

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '');
    const [typeFilter, setTypeFilter] = useState<'all' | 'movies-tv' | 'music'>(
        (searchParams.get('type') as 'all' | 'movies-tv' | 'music') || 'movies-tv'
    );
    const [, startTransition] = useTransition();
    const itemTypes: BaseItemKind[] | undefined =
        typeFilter === 'all'
            ? ['MusicAlbum', 'Movie', 'Series', 'Episode', 'Person']
            : typeFilter === 'music'
              ? ['MusicAlbum']
              : ['Movie', 'Series'];
    const {
        data: results,
        isLoading,
        error,
    } = useSearchItems(debouncedQuery, { itemTypes, limit: 50 });

    useEffect(() => {
        const handler = setTimeout(() => {
            startTransition(() => {
                setDebouncedQuery(query);
                const params = new URLSearchParams();
                if (query) params.set('q', query);
                params.set('type', typeFilter);
                setSearchParams(params, { replace: true });
            });
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [query, typeFilter, setSearchParams]);

    return (
        <Page title="Search">
            <ButtonGroup className="w-full mt-0.5">
                <InputGroup className="grow">
                    <InputGroupAddon>
                        <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <InputGroupAddon hidden={!query} align={'inline-end'}>
                        <Button variant={'ghost'} size={'icon-sm'} onClick={() => setQuery('')}>
                            <XIcon />
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
                <Select
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
                >
                    <SelectTrigger className="min-w-40">
                        <SelectValue placeholder="Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            <LayoutGrid />
                            All
                        </SelectItem>
                        <SelectItem value="movies-tv">
                            <Clapperboard />
                            Movies / TV
                        </SelectItem>
                        <SelectItem value="music">
                            <Music />
                            Music
                        </SelectItem>
                    </SelectContent>
                </Select>
            </ButtonGroup>
            {isLoading && <LoadingSkeleton />}
            {error && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <TriangleAlert />
                        </EmptyMedia>
                        <EmptyTitle>Unexpected Error</EmptyTitle>
                        <EmptyDescription>An error occurred while searching.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
            {!isLoading && !error && results && results.length === 0 && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CircleQuestionMark />
                        </EmptyMedia>
                        <EmptyTitle>No Results</EmptyTitle>
                        <EmptyDescription>No items matched your search.</EmptyDescription>
                        <EmptyContent>
                            <Button variant={'link'} onClick={() => setQuery('')}>
                                Clear Search
                            </Button>
                        </EmptyContent>
                    </EmptyHeader>
                </Empty>
            )}
            {results &&
                Object.keys(ITEM_TYPE_GROUPS).map((groupKey) => {
                    const groupItemTypes =
                        ITEM_TYPE_GROUPS[groupKey as keyof typeof ITEM_TYPE_GROUPS];
                    if (
                        typeFilter !== 'all' &&
                        ((typeFilter === 'music' && groupKey !== 'music') ||
                            (typeFilter === 'movies-tv' && groupKey === 'music'))
                    ) {
                        return null;
                    }

                    const groupResults = results.filter((item) =>
                        groupItemTypes.includes(item.Type as BaseItemKind)
                    );
                    if (groupResults.length === 0) return null;

                    if (groupKey === 'moviesTv') {
                        return (
                            <div key={groupKey} className="mt-4">
                                <h2 className="text-xl font-semibold mb-2">Movies & TV</h2>
                                <MovieTvGrid items={groupResults} />
                            </div>
                        );
                    }

                    if (groupKey === 'music') {
                        return (
                            <div key={groupKey} className="mt-4">
                                <h2 className="text-xl font-semibold mb-2">Music</h2>
                                <MusicGrid items={groupResults} />
                            </div>
                        );
                    }

                    if (groupKey === 'people') {
                        return (
                            <div key={groupKey} className="mt-4">
                                <h2 className="text-xl font-semibold mb-2">People</h2>
                                <PeopleGrid items={groupResults} />
                            </div>
                        );
                    }

                    if (groupKey === 'episodes') {
                        return (
                            <div key={groupKey} className="mt-4">
                                <h2 className="text-xl font-semibold mb-2">Episodes</h2>
                                <EpisodesGrid items={groupResults} />
                            </div>
                        );
                    }

                    return null;
                })}
        </Page>
    );
};

export default SearchPage;
