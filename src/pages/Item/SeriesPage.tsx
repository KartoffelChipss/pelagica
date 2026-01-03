import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSeasons } from '@/hooks/api/useSeasons';
import { getPrimaryImageUrl, getThumbUrl } from '@/utils/images';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { ImageOff, Play, Star } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEpisodes } from '@/hooks/api/useEpisodes';
import SectionScroller from '@/components/SectionScroller';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { ticksToReadableTime } from '@/utils/timeConversion';
import PeopleRow from './PeopleRow';
import BaseMediaPage from './BaseMediaPage';
import DescriptionItem from './DescriptionItem';

const EpisodesRow = memo(
    ({
        seasonId,
        title,
        seasonsLoading,
    }: {
        seasonId: string;
        title?: React.ReactNode;
        seasonsLoading?: boolean;
    }) => {
        const navigate = useNavigate();
        const { t } = useTranslation('item');
        const { data: episodes, isLoading, error } = useEpisodes(seasonId);
        const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

        const handleImageError = useCallback((itemId: string) => {
            setImageErrors((prev) => ({ ...prev, [itemId]: true }));
        }, []);

        if (isLoading || seasonsLoading) {
            return (
                <SectionScroller
                    title={title}
                    items={Array.from({ length: 10 }, (_, i) => (
                        <div
                            key={i}
                            className="group min-w-48 lg:min-w-64 2xl:min-w-80 animate-pulse"
                        >
                            <Skeleton className="w-full aspect-video rounded-md" />
                            <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
                        </div>
                    ))}
                />
            );
        }

        if (error) {
            return <p>Error loading episodes: {(error as Error).message}</p>;
        }

        return (
            <SectionScroller
                title={title}
                items={
                    episodes?.map((item) => {
                        const watched = item.UserData?.PlaybackPositionTicks ?? 0;
                        const runtime = item.RunTimeTicks ?? 0;
                        const progress =
                            item.UserData?.PlayCount &&
                            item.UserData?.PlayCount >= 1 &&
                            watched <= 0
                                ? 100
                                : runtime > 0
                                  ? (watched / runtime) * 100
                                  : 0;

                        return (
                            <Link
                                to={`/item/${item.Id}`}
                                key={item.Id}
                                className="group min-w-48 lg:min-w-64 2xl:min-w-80"
                            >
                                <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                    {imageErrors[item.Id!] ? (
                                        <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                                            <ImageOff className="w-12 h-12 text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <img
                                                src={
                                                    item.SeriesId
                                                        ? getPrimaryImageUrl(item.Id!, {
                                                              width: 416,
                                                          })
                                                        : getThumbUrl(item.Id!, {
                                                              width: 416,
                                                          })
                                                }
                                                alt={item.Name || t('no_title')}
                                                className="w-full h-full object-cover rounded-md group-hover:opacity-75 group-hover:scale-105 transition-opacity transition-transform duration-300 ease-out will-change-transform"
                                                onError={() => handleImageError(item.Id!)}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div
                                                    className="bg-black/60 rounded-full p-4 cursor-pointer hover:bg-black/75"
                                                    role="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(`/play/${item.Id}`);
                                                    }}
                                                >
                                                    <Play className="w-6 h-6 text-white fill-white" />
                                                </div>
                                            </div>
                                            {item.RunTimeTicks && (
                                                <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                                                    {ticksToReadableTime(item.RunTimeTicks)}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    {progress > 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                            <div
                                                style={{ width: `${progress}%` }}
                                                className="h-full bg-blue-500 transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-md line-clamp-1 text-ellipsis break-all">
                                    {item.Name || t('no_title')}
                                </p>
                                <p className="mt-1 text-sm line-clamp-2 text-ellipsis break-all text-muted-foreground">
                                    {item.Overview}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {item.IndexNumber !== undefined && (
                                        <Badge variant={'outline'}>
                                            S{item.ParentIndexNumber} E{item.IndexNumber}
                                        </Badge>
                                    )}
                                    {item.CommunityRating !== undefined && (
                                        <Badge variant={'outline'}>
                                            <Star size={14} />
                                            {item.CommunityRating?.toFixed(1)}
                                        </Badge>
                                    )}
                                    {item.PremiereDate && (
                                        <Badge variant={'outline'}>
                                            {new Date(item.PremiereDate).toLocaleDateString(
                                                undefined,
                                                {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                }
                                            )}
                                        </Badge>
                                    )}
                                </div>
                            </Link>
                        );
                    }) || []
                }
            />
        );
    }
);

EpisodesRow.displayName = 'EpisodesRow';

interface SeriesPageProps {
    item: BaseItemDto;
}

const SeriesPage = ({ item }: SeriesPageProps) => {
    const { t } = useTranslation('item');
    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
    const { data: seasons, isLoading, error } = useSeasons(item.Id || '');

    const effectiveSelectedSeason =
        selectedSeason ||
        (seasons && seasons.length > 0
            ? seasons.find((s) => s.IndexNumber === 1)?.Id || seasons[0]?.Id || ''
            : '');

    const firstSeasonId =
        seasons && seasons.length > 0
            ? seasons.find((s) => s.IndexNumber === 1)?.Id || seasons[0]?.Id
            : undefined;
    const { data: firstSeasonEpisodes } = useEpisodes(firstSeasonId);

    const episodeToContinue =
        firstSeasonEpisodes?.find(
            (ep) => !ep.UserData?.Played || (ep.UserData?.PlaybackPositionTicks ?? 0) > 0
        ) || firstSeasonEpisodes?.[0];

    const writers =
        item.People?.filter((person) => person.Type === 'Writer').filter((person) => person.Name) ||
        [];
    const directors =
        item.People?.filter((person) => person.Type === 'Director').filter(
            (person) => person.Name
        ) || [];
    const studios = item.Studios?.filter((studio) => studio.Name) || [];

    return (
        <BaseMediaPage item={item}>
            <div className="flex flex-col md:flex-row gap-6 max-w-7xl">
                <div className="relative w-60 min-w-60 h-90 sm:w-72 sm:min-w-72 sm:h-108 hidden sm:block">
                    <img
                        src={getPrimaryImageUrl(item.Id || '')}
                        alt={item.Name + ' Primary'}
                        className="object-cover rounded-md w-full h-full"
                    />
                    <Skeleton className="absolute inset-0 w-full h-full rounded-md -z-1" />
                </div>
                <div className="flex flex-col gap-3">
                    <h2 className="text-4xl sm:text-5xl font-bold mt-2">{item.Name}</h2>
                    <div className="flex flex-wrap gap-2">
                        {item.ProductionYear && (
                            <Badge variant={'outline'}>{item.ProductionYear}</Badge>
                        )}
                        {item.CommunityRating && (
                            <Badge variant={'outline'}>
                                <Star size={14} />
                                {item.CommunityRating?.toFixed(1)}
                            </Badge>
                        )}
                        {item.OfficialRating && (
                            <Badge variant={'outline'}>{item.OfficialRating}</Badge>
                        )}
                    </div>
                    {episodeToContinue ? (
                        <Button className="w-fit mt-1" asChild>
                            <Link to={`/item/${episodeToContinue.Id}`}>
                                <Play />
                                {episodeToContinue.UserData?.PlaybackPositionTicks
                                    ? t('continue_episode', {
                                          season: episodeToContinue.ParentIndexNumber,
                                          episode: episodeToContinue.IndexNumber,
                                      })
                                    : t('play_episode', {
                                          season: episodeToContinue.ParentIndexNumber,
                                          episode: episodeToContinue.IndexNumber,
                                      })}
                            </Link>
                        </Button>
                    ) : (
                        <Button className="w-fit mt-1" disabled>
                            <Play />
                            {t('loading')}
                        </Button>
                    )}
                    <p>{item.Overview}</p>
                    <DescriptionItem
                        label={t('genres')}
                        items={
                            item.Genres?.map((genre) => ({
                                link: null,
                                name: genre,
                            })) || []
                        }
                    />
                    <DescriptionItem
                        label={t('writers')}
                        items={writers.map((person) => ({
                            link: `/item/${person.Id}`,
                            name: person.Name!,
                        }))}
                    />
                    <DescriptionItem
                        label={t('directors')}
                        items={directors.map((person) => ({
                            link: `/item/${person.Id}`,
                            name: person.Name!,
                        }))}
                    />
                    <DescriptionItem
                        label={t('studios')}
                        items={studios.map((studio) => ({
                            link: null,
                            name: studio.Name!,
                        }))}
                    />
                </div>
            </div>
            <div>
                <EpisodesRow
                    title={
                        <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-bold">{t('episodes')}</h3>
                            <Select
                                value={effectiveSelectedSeason || ''}
                                onValueChange={(value) => setSelectedSeason(value || null)}
                                disabled={isLoading || !seasons || seasons.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('select_season')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {seasons?.map((season) => (
                                        <SelectItem
                                            key={season.Id}
                                            value={season.Id || ''}
                                            onSelect={() => setSelectedSeason(season.Id || null)}
                                        >
                                            {season.Name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    }
                    seasonsLoading={isLoading}
                    seasonId={effectiveSelectedSeason}
                />
                {error && <p>Error loading seasons: {(error as Error).message}</p>}
            </div>
            <div>
                <PeopleRow
                    title={<h3 className="text-3xl font-bold">{t('cast_and_crew')}</h3>}
                    people={item.People || []}
                    loading={isLoading}
                />
            </div>
        </BaseMediaPage>
    );
};

export default SeriesPage;
