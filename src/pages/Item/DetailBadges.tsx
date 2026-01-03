import { Badge } from '@/components/ui/badge';
import type { AppConfig, DetailBadge } from '@/hooks/api/useConfig';
import { getEndsAt, ticksToReadableTime } from '@/utils/timeConversion';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import type { TFunction } from 'i18next';
import { Star } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

function getDetailBadge(
    item: BaseItemDto,
    detailBadgeType: DetailBadge,
    t: TFunction
): React.ReactNode | null {
    switch (detailBadgeType) {
        case 'ReleaseYear':
            return item.PremiereDate ? new Date(item.PremiereDate).getFullYear().toString() : null;
        case 'ReleaseYearAndMonth':
            return item.PremiereDate
                ? new Date(item.PremiereDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                  })
                : null;
        case 'ReleaseDate':
            return item.PremiereDate
                ? new Date(item.PremiereDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                  })
                : null;
        case 'CommunityRating':
            return item.CommunityRating ? (
                <div className="flex items-center gap-1">
                    <Star size={14} />
                    {item.CommunityRating.toFixed(1)}
                </div>
            ) : null;
        case 'PlayDuration':
            return item.RunTimeTicks ? ticksToReadableTime(item.RunTimeTicks) : null;
        case 'PlayEnd':
            return item.RunTimeTicks
                ? t('item:ends_at', {
                      date: getEndsAt(item.RunTimeTicks).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                      }),
                  })
                : null;
        case 'SeasonCount':
            console.log('ChildCount:', item.ChildCount);
            return item.ChildCount !== undefined && item.ChildCount !== null
                ? item.ChildCount === 1
                    ? t('item:season_count', { count: item.ChildCount })
                    : t('item:season_count_plural', { count: item.ChildCount })
                : null;
        case 'EpisodeCount':
            return item.RecursiveItemCount !== undefined && item.RecursiveItemCount !== null
                ? item.RecursiveItemCount === 1
                    ? t('item:episode_count', { count: item.RecursiveItemCount })
                    : t('item:episode_count_plural', { count: item.RecursiveItemCount })
                : null;
        case 'AgeRating':
            return item.OfficialRating || null;
        default:
            return '';
    }
}

interface TopDetailsDisplayProps {
    item: BaseItemDto;
    appConfig: AppConfig;
}

const DetailBadges = ({ item, appConfig }: TopDetailsDisplayProps) => {
    const { t } = useTranslation('library');
    const detailBadges = appConfig.itemPage?.detailBadges;
    if (!detailBadges || detailBadges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {detailBadges.map((badgeType) => {
                const badgeContent = getDetailBadge(item, badgeType, t);
                if (badgeContent) {
                    return (
                        <Badge key={badgeType} variant={'outline'}>
                            {badgeContent}
                        </Badge>
                    );
                }
                return null;
            })}
        </div>
    );
};

export default DetailBadges;
