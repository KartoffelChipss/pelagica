import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Page from '../Page';
import { useUserViews } from '@/hooks/api/useMediaFolders';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useLibraryItems } from '@/hooks/api/useLibraryItems';
import { useSearchParams } from 'react-router';
import { getImageApi } from '@jellyfin/sdk/lib/utils/api/image-api';
import { getApi } from '@/api/getApi';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import ItemPagination from '@/components/ItemPagination';
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
import LibraryItem from './LibraryItem';

const SUPPORTED_COLLECTION_TYPES: CollectionType[] = ['movies', 'tvshows', 'boxsets', 'music'];
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
    page,
    onPageChange,
}: {
    libraryId: string;
    pageRef: React.RefObject<HTMLDivElement | null>;
    sortBy: ItemSortBy;
    sortOrder: SortOrder;
    page: number;
    onPageChange: (p: number) => void;
}) => {
    const { t } = useTranslation(['library', 'common']);
    const [pageSize, setPageSize] = useState(
        () => getColumnCount(typeof window !== 'undefined' ? window.innerWidth : 640) * ITEM_ROWS
    );

    useEffect(() => {
        const handleResize = () => {
            const newPageSize = getColumnCount(window.innerWidth) * ITEM_ROWS;
            setPageSize(newPageSize);
            onPageChange(0);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [onPageChange]);

    const { data: libraryData, isLoading } = useLibraryItems(libraryId, {
        limit: pageSize,
        startIndex: page * pageSize,
        includeItemTypes: ['Series', 'Movie', 'BoxSet', 'MusicAlbum'],
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
        <div className="mb-4">
            {isLoading && (
                <div className="w-full gap-4 mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9">
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
                            <LibraryItem
                                key={item.Id}
                                item={item}
                                posterUrl={posterUrls[item.Id!]}
                                t={t}
                                posterAspectRatio={item.Type === 'MusicAlbum' ? 'square' : '2/3'}
                                detailLine={
                                    item.Type === 'MusicAlbum'
                                        ? item.AlbumArtist
                                            ? item.AlbumArtist
                                            : undefined
                                        : item.PremiereDate
                                          ? new Date(item.PremiereDate).getFullYear()
                                          : undefined
                                }
                            />
                        ))}
                    </div>
                    <ItemPagination
                        totalPages={totalPages}
                        currentPage={page}
                        onPageChange={onPageChange}
                    />
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
    const sortByParam = (searchParams.get('sortBy') as ItemSortBy) || 'Name';
    const sortOrderParam = (searchParams.get('sortOrder') as SortOrder) || 'Ascending';
    const [sortBy, setSortBy] = useState<ItemSortBy>(sortByParam);
    const [sortOrder, setSortOrder] = useState<SortOrder>(sortOrderParam);
    const pageParam = parseInt(searchParams.get('page') ?? '0', 10);
    const [page, setPage] = useState<number>(Number.isNaN(pageParam) ? 0 : pageParam);

    const firstLibraryId = libraries?.Items?.[0]?.Id ?? '';
    const libraryIdFromUrl = searchParams.get('library') || '';
    const activeLibraryId =
        libraryIdFromUrl && libraries?.Items?.some((library) => library.Id === libraryIdFromUrl)
            ? libraryIdFromUrl
            : firstLibraryId;

    const handleLibraryChange = (libraryId: string) => {
        setPage(0);
        setSearchParams({
            library: libraryId,
            page: '0',
            sortBy,
            sortOrder,
        });
    };

    const libraryItems = libraries?.Items?.filter((library) =>
        SUPPORTED_COLLECTION_TYPES.includes(library.CollectionType!)
    );

    useEffect(() => {
        setSearchParams({
            library: activeLibraryId,
            page: String(page),
            sortBy,
            sortOrder,
        });
    }, [activeLibraryId, page, sortBy, sortOrder, setSearchParams]);

    return (
        <Page title={t('title')} requiresAuth className="flex-1">
            <Tabs
                value={activeLibraryId}
                onValueChange={handleLibraryChange}
                className="w-full"
                ref={pageRef}
            >
                <div className="flex flex-col sm:items-center sm:justify-between sm:flex-row gap-2">
                    <TabsList className="max-w-full overflow-auto">
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
                {libraryItems?.map((library) => {
                    if (!library.Id) return null;

                    return (
                        <TabsContent key={library.Id} value={library.Id ?? ''}>
                            <LibraryContent
                                key={`${library.Id}-${sortBy}-${sortOrder}`}
                                libraryId={library.Id}
                                pageRef={pageRef}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                page={page}
                                onPageChange={setPage}
                            />
                        </TabsContent>
                    );
                })}
            </Tabs>
        </Page>
    );
};

export default LibraryPage;
