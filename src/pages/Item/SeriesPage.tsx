import { Button } from '@/components/ui/button';
import { useSeasons } from '@/hooks/api/useSeasons';
import { getPrimaryImageUrl } from '@/utils/jellyfinUrls';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEpisodes } from '@/hooks/api/useEpisodes';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import PeopleRow from './PeopleRow';
import BaseMediaPage from './BaseMediaPage';
import DescriptionItem from './DescriptionItem';
import MoreLikeThisRow from './MoreLikeThisRow';
import { type AppConfig } from '@/hooks/api/useConfig';
import DetailBadges from './DetailBadges';
import EpisodesDisplay from './EpisodesDisplay';
import FavoriteButton from '../../components/FavoriteButton';
import WatchListButton from '../../components/WatchlistButton';

interface SeriesPageProps {
    item: BaseItemDto;
    config: AppConfig;
}

const SeriesPage = ({ item, config }: SeriesPageProps) => {
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
        <BaseMediaPage itemId={item.Id || ''} name={item.Name || ''}>
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
                    <DetailBadges item={item} appConfig={config} />
                    <div className="mt-1 flex items-center gap-2">
                        {episodeToContinue ? (
                            <Button className="w-fit" asChild>
                                <Link to={`/play/${episodeToContinue.Id}`}>
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
                            <Button className="w-fit" disabled>
                                <Play />
                                {t('loading')}
                            </Button>
                        )}
                        <FavoriteButton
                            item={item}
                            showFavoriteButton={
                                item.Type && config.itemPage?.favoriteButton?.includes(item.Type)
                            }
                        />
                        <WatchListButton
                            item={item}
                            showWatchlistButton={config.itemPage?.showWatchlistButton}
                        />
                    </div>
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
                <EpisodesDisplay
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
                    episodeDisplay={config.itemPage?.episodeDisplay || 'row'}
                />
                {error && <p>Error loading seasons: {(error as Error).message}</p>}
            </div>
            <PeopleRow
                title={<h3 className="text-3xl font-bold">{t('cast_and_crew')}</h3>}
                people={item.People || []}
                loading={isLoading}
            />
            <MoreLikeThisRow
                title={<h3 className="text-3xl font-bold">{t('more_like_this')}</h3>}
                itemId={item.Id || ''}
            />
        </BaseMediaPage>
    );
};

export default SeriesPage;
