import type { AppConfig } from '@/hooks/api/useConfig';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import BaseMediaPage from './BaseMediaPage';
import { useTranslation } from 'react-i18next';
import { getPrimaryImageUrl } from '@/utils/jellyfinUrls';
import DetailBadges from './DetailBadges';
import { useState } from 'react';
import { useSeasons } from '@/hooks/api/useSeasons';
import EpisodesDisplay from './EpisodesDisplay';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import PeopleRow from './PeopleRow';
import { Link } from 'react-router';
import JellyfinItemKindIcon from '@/components/JellyfinItemKindIcon';
import FavoriteButton from '../../components/FavoriteButton';
import { Skeleton } from '@/components/ui/skeleton';

interface EpisodePageProps {
    item: BaseItemDto;
    config: AppConfig;
}

const SeasonPage = ({ item, config }: EpisodePageProps) => {
    const { t } = useTranslation('item');
    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
    const { data: seasons, isLoading: isLoadingSeasons } = useSeasons(item.SeriesId || '');

    const effectiveSelectedSeason =
        selectedSeason ||
        (seasons && seasons.length > 0
            ? seasons.find((s) => s.IndexNumber === item.IndexNumber)?.Id || seasons[0]?.Id || ''
            : '');

    const showFavoriteButton = item.Type && config.itemPage?.favoriteButton?.includes(item.Type);

    return (
        <BaseMediaPage itemId={item.SeriesId || ''} name={item.SeriesName || item.Name || ''}>
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
                    <div className="flex flex-wrap items-center text-sm text-muted-foreground">
                        <Link
                            to={`/item/${item.SeriesId}`}
                            className="hover:underline flex items-center gap-2"
                        >
                            <JellyfinItemKindIcon kind="Series" className="h-4 w-4" />
                            <span className="line-clamp-1 text-ellipsis break-all">
                                {item.SeriesName || t('no_title')}
                            </span>
                        </Link>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold -mt-2">{item.Name}</h2>
                    <DetailBadges item={item} appConfig={config} />
                    {showFavoriteButton && (
                        <div className="mt-1 flex items-center gap-2">
                            <FavoriteButton item={item} showFavoriteButton={showFavoriteButton} />
                        </div>
                    )}
                    <p>{item.Overview}</p>
                </div>
            </div>
            <EpisodesDisplay
                title={
                    <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-bold">{t('episodes')}</h3>
                        <Select
                            value={effectiveSelectedSeason || ''}
                            onValueChange={(value) => setSelectedSeason(value || null)}
                            disabled={isLoadingSeasons || !seasons || seasons.length === 0}
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
                seasonsLoading={isLoadingSeasons}
                seasonId={effectiveSelectedSeason}
                episodeDisplay={config.itemPage?.episodeDisplay || 'row'}
            />
            <PeopleRow
                people={item.People || []}
                title={<h3 className="text-3xl font-bold">{t('cast_and_crew')}</h3>}
            />
        </BaseMediaPage>
    );
};

export default SeasonPage;
