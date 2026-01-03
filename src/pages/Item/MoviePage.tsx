import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import BaseMediaPage from './BaseMediaPage';
import DescriptionItem from './DescriptionItem';
import { Badge } from '@/components/ui/badge';
import { getPrimaryImageUrl } from '@/utils/images';
import { Play, Star } from 'lucide-react';
import PeopleRow from './PeopleRow';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import MoreLikeThisRow from './MoreLikeThisRow';
import type { AppConfig } from '@/hooks/api/useConfig';

interface MoviePageProps {
    item: BaseItemDto;
    config: AppConfig;
}

const MoviePage = ({ item }: MoviePageProps) => {
    const { t } = useTranslation('item');

    const writers =
        item.People?.filter((person) => person.Type === 'Writer').filter((person) => person.Name) ||
        [];
    const directors =
        item.People?.filter((person) => person.Type === 'Director').filter(
            (person) => person.Name
        ) || [];
    const studios = item.Studios?.filter((studio) => studio.Name) || [];

    const isCurrentlyPlaying =
        item.UserData?.PlaybackPositionTicks &&
        item.UserData.PlaybackPositionTicks > 0 &&
        item.RunTimeTicks &&
        item.UserData.PlaybackPositionTicks < item.RunTimeTicks;

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
                    <Button className="w-min">
                        <Play />
                        {isCurrentlyPlaying ? t('resume') : t('play')}
                    </Button>
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
            <PeopleRow
                title={<h3 className="text-3xl font-bold">{t('cast_and_crew')}</h3>}
                people={item.People || []}
            />
            <MoreLikeThisRow
                title={<h3 className="text-3xl font-bold">{t('more_like_this')}</h3>}
                itemId={item.Id || ''}
            />
        </BaseMediaPage>
    );
};

export default MoviePage;
