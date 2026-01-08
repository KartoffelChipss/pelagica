import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Page from '../Page';
import { useUserViews } from '@/hooks/api/useMediaFolders';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useLibraryItems } from '@/hooks/api/useLibraryItems';
import { Link, useSearchParams } from 'react-router';
import { getImageApi } from '@jellyfin/sdk/lib/utils/api/image-api';
import { getApi } from '@/api/getApi';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    ArrowDownWideNarrow,
    ArrowUpNarrowWideIcon,
    Calendar,
    CalendarPlus,
    CaseSensitive,
    Clock,
    FolderOpen,
    Star,
} from 'lucide-react';
import JellyfinLibraryIcon from '@/components/JellyfinLibraryIcon';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type {
    CollectionType,
    ItemSortBy,
    SortOrder,
} from '@jellyfin/sdk/lib/generated-client/models';
import { ButtonGroup } from '@/components/ui/button-group';

const SUPPORTED_COLLECTION_TYPES: CollectionType[] = ['movies', 'tvshows'];
const ITEM_ROWS = 5;

function getColumnCount(width: number): number {
    if (width >= 1536) return 9; // 2xl
    if (width >= 1280) return 7; // xl
    if (width >= 1024) return 5; // lg
    if (width >= 768) return 4; // md
    if (width >= 640) return 3; // sm
    return 2;
}

const LibraryContent = ({
    libraryId,
    pageRef,
    sortBy,
    sortOrder,
}: {
    libraryId: string;
    pageRef: React.RefObject<HTMLDivElement | null>;
    sortBy: ItemSortBy;
    sortOrder: SortOrder;
}) => {
    const { t } = useTranslation(['library', 'common']);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(
        () => getColumnCount(typeof window !== 'undefined' ? window.innerWidth : 640) * ITEM_ROWS
    );

    useEffect(() => {
        const handleResize = () => {
            const newPageSize = getColumnCount(window.innerWidth) * ITEM_ROWS;
            setPageSize(newPageSize);
            setPage(0);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: libraryData, isLoading } = useLibraryItems(libraryId, {
        limit: pageSize,
        startIndex: page * pageSize,
        includeItemTypes: ['Series', 'Movie'],
        sortBy: [sortBy],
        sortOrder,
    });

    useEffect(() => {
        if (pageRef.current && !isLoading && libraryData?.items?.length) {
            pageRef.current.scrollIntoView({ block: 'start' });
        }
    }, [libraryData?.items, isLoading, pageRef]);

    const posterUrls = useMemo(() => {
        if (!libraryData) return {};
        const imageApi = getImageApi(getApi());
        return libraryData.items.reduce(
            (acc, item) => {
                acc[item.Id!] = imageApi.getItemImageUrl({ Id: item.Id }) || '';
                return acc;
            },
            {} as Record<string, string>
        );
    }, [libraryData]);

    const totalPages = libraryData?.totalCount ? Math.ceil(libraryData.totalCount / pageSize) : 0;

    return (
        <div>
            {isLoading && (
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 mt-2">
                    {Array.from({ length: pageSize }).map((_, i) => (
                        <div key={i} className="p-0 m-0">
                            <div className="relative w-full aspect-2/3 overflow-hidden rounded-md">
                                <Skeleton className="w-full h-full" />
                            </div>
                            <Skeleton className="mt-2 h-4 w-3/4" />
                            <Skeleton className="mt-1 h-3 w-1/4" />
                        </div>
                    ))}
                </div>
            )}
            {!isLoading && libraryData && !libraryData.items?.length && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderOpen />
                        </EmptyMedia>
                        <EmptyTitle>{t('library:no_items_title')}</EmptyTitle>
                        <EmptyDescription>{t('library:no_items_description')}</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
            {!isLoading && libraryData && libraryData.items && libraryData.items.length > 0 && (
                <>
                    <div className="w-full gap-4 mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9">
                        {libraryData.items.map((item) => (
                            <Link to={`/item/${item.Id}`} key={item.Id} className="p-0 m-0">
                                <div className="relative w-full aspect-2/3 overflow-hidden rounded-md group">
                                    <img
                                        key={item.Id}
                                        src={`${posterUrls[item.Id!]}?maxWidth=416&maxHeight=640&quality=85`}
                                        alt={item.Name || t('library:no_title')}
                                        className="w-full h-full object-cover rounded-md group-hover:opacity-75 transition-all group-hover:scale-105 z-10"
                                        loading="lazy"
                                    />
                                    <Skeleton className="absolute bottom-0 left-0 right-0 top-0 -z-1" />
                                </div>
                                <p className="mt-2 text-sm line-clamp-1 text-ellipsis break-all">
                                    {item.Name || t('no_title')}
                                </p>
                                <div className="flex flex-wrap items-center mt-1">
                                    {item.PremiereDate && (
                                        <span className="text-xs text-muted-foreground mr-3">
                                            {new Date(item.PremiereDate).getFullYear()}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="my-4 md:mb-0">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        text={t('common:previous')}
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        className={
                                            page === 0
                                                ? 'pointer-events-none opacity-50'
                                                : 'cursor-pointer'
                                        }
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }, (_, i) => {
                                    if (
                                        i === 0 ||
                                        i === totalPages - 1 ||
                                        (i >= page - 1 && i <= page + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    onClick={() => setPage(i)}
                                                    isActive={i === page}
                                                    className="cursor-pointer"
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (
                                        (i === 1 && page > 2) ||
                                        (i === totalPages - 2 && page < totalPages - 3)
                                    ) {
                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}
                                <PaginationItem>
                                    <PaginationNext
                                        text={t('common:next')}
                                        onClick={() =>
                                            setPage((p) => Math.min(totalPages - 1, p + 1))
                                        }
                                        className={
                                            page >= totalPages - 1
                                                ? 'pointer-events-none opacity-50'
                                                : 'cursor-pointer'
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </>
            )}
        </div>
    );
};

const LibraryPage = () => {
    const pageRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation('library');
    const { data: libraries } = useUserViews();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sortBy, setSortBy] = useState<ItemSortBy>('Name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('Ascending');

    const firstLibraryId = libraries?.Items?.[0]?.Id ?? '';
    const libraryIdFromUrl = searchParams.get('library') || '';
    const activeLibraryId =
        libraryIdFromUrl && libraries?.Items?.some((library) => library.Id === libraryIdFromUrl)
            ? libraryIdFromUrl
            : firstLibraryId;

    const handleLibraryChange = (libraryId: string) => {
        setSearchParams({ library: libraryId });
    };

    const libraryItems = libraries?.Items?.filter((library) =>
        SUPPORTED_COLLECTION_TYPES.includes(library.CollectionType!)
    );

    return (
        <Page title={t('title')} requiresAuth>
            <Tabs
                value={activeLibraryId}
                onValueChange={handleLibraryChange}
                className="w-full"
                ref={pageRef}
            >
                <div className="flex items-center justify-between">
                    <TabsList>
                        {libraryItems?.map((library) => (
                            <TabsTrigger key={library.Id} value={library.Id ?? ''}>
                                <JellyfinLibraryIcon libraryType={library.CollectionType} />
                                {library.Name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <ButtonGroup>
                        <Select
                            onValueChange={(value) => setSortBy(value as ItemSortBy)}
                            value={sortBy}
                        >
                            <SelectTrigger size="sm">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Name">
                                    <CaseSensitive />
                                    {t('sort_name')}
                                </SelectItem>
                                <SelectItem value="DateCreated">
                                    <CalendarPlus />
                                    {t('sort_date_added')}
                                </SelectItem>
                                <SelectItem value="PremiereDate">
                                    <Calendar />
                                    {t('sort_premiere_date')}
                                </SelectItem>
                                <SelectItem value="CommunityRating">
                                    <Star />
                                    {t('sort_community_rating')}
                                </SelectItem>
                                <SelectItem value="Runtime">
                                    <Clock />
                                    {t('sort_runtime')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            onValueChange={(value) => setSortOrder(value as SortOrder)}
                            value={sortOrder}
                        >
                            <SelectTrigger size="sm">
                                <SelectValue placeholder="Order" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ascending">
                                    <ArrowUpNarrowWideIcon />
                                    {t('ascending')}
                                </SelectItem>
                                <SelectItem value="Descending">
                                    <ArrowDownWideNarrow />
                                    {t('descending')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </ButtonGroup>
                </div>
                {libraryItems?.map((library) => (
                    <TabsContent key={library.Id} value={library.Id ?? ''}>
                        {library.Id && (
                            <LibraryContent
                                key={`${library.Id}-${sortBy}-${sortOrder}`}
                                libraryId={library.Id}
                                pageRef={pageRef}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                            />
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </Page>
    );
};

export default LibraryPage;
