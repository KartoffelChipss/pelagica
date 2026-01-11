import type { AppConfig } from '@/hooks/api/useConfig';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import BaseMediaPage from './BaseMediaPage';
import DetailBadges from './DetailBadges';
import { Skeleton } from '@/components/ui/skeleton';
import { getPrimaryImageUrl } from '@/utils/jellyfinUrls';
import { useState } from 'react';
import { useBoxSetItems } from '@/hooks/api/useBoxSetItems';
import SectionScroller from '@/components/SectionScroller';
import { useTranslation } from 'react-i18next';
import ScrollableSectionPoster from '@/components/ScrollableSectionPoster';

interface BoxSetPageProps {
    item: BaseItemDto;
    config: AppConfig;
}

const BoxSetPage = ({ item, config }: BoxSetPageProps) => {
    const { t } = useTranslation('item');
    const [primaryImageError, setPrimaryImageError] = useState(false);
    const { data: boxSetItems } = useBoxSetItems(item.Id || '');

    return (
        <BaseMediaPage
            itemId={item.Id || ''}
            name={item.Name || ''}
            showLogo={false}
            topPadding={false}
        >
            <div className="flex flex-col md:flex-row gap-6 max-w-7xl">
                {!primaryImageError && item.Id && (
                    <div className="relative w-60 min-w-60 h-90 sm:w-72 sm:min-w-72 sm:h-108 hidden sm:block">
                        <img
                            src={getPrimaryImageUrl(item.Id || '')}
                            alt={item.Name + ' Primary'}
                            className="object-cover rounded-md w-full h-full"
                            onError={() => setPrimaryImageError(true)}
                        />
                        <Skeleton className="absolute inset-0 w-full h-full rounded-md -z-1" />
                    </div>
                )}
                <div className="flex flex-col gap-3">
                    <h2 className="text-4xl sm:text-5xl font-bold mt-2">{item.Name}</h2>
                    <DetailBadges item={item} appConfig={config} />
                    <p>{item.Overview}</p>
                </div>
            </div>
            <SectionScroller
                title={<h3 className="text-3xl font-bold">{t('boxSetItems')}</h3>}
                items={
                    boxSetItems?.map((boxSetItem) => {
                        return (
                            <ScrollableSectionPoster key={boxSetItem.Id} item={boxSetItem}>
                                {boxSetItem.PremiereDate && (
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {new Date(boxSetItem.PremiereDate).getFullYear()}
                                    </span>
                                )}
                            </ScrollableSectionPoster>
                        );
                    }) ||
                    Array.from({ length: 10 }, (_, i) => (
                        <div
                            key={i}
                            className="group min-w-48 lg:min-w-64 2xl:min-w-80 animate-pulse"
                        >
                            <Skeleton className="w-full aspect-video rounded-md" />
                            <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
                        </div>
                    ))
                }
            />
        </BaseMediaPage>
    );
};

export default BoxSetPage;
