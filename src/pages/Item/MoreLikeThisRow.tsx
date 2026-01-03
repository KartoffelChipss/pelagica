import ScrollableSectionPoster from '@/components/ScrollableSectionPoster';
import SectionScroller from '@/components/SectionScroller';
import { Skeleton } from '@/components/ui/skeleton';
import { useSimilarItems } from '@/hooks/api/useSimilarItems';
import { memo, useMemo } from 'react';
import type React from 'react';

interface MoreLikeThisRowProps {
    title?: React.ReactNode;
    itemId: string;
    isLoading?: boolean;
}

const SKELETON_ITEMS = Array.from({ length: 5 }, (_, index) => (
    <div key={index} className="w-36 lg:w-44 2xl:w-52">
        <Skeleton className="w-36 h-54 lg:w-44 lg:h-64 2xl:w-52 2xl:h-80 rounded-md mb-2" />
        <Skeleton className="w-32 lg:w-40 2xl:w-48 h-4 mb-1" />
        <Skeleton className="w-20 lg:w-24 2xl:w-28 h-3" />
    </div>
));

const MoreLikeThisRow: React.FC<MoreLikeThisRowProps> = memo(({ title, itemId, isLoading }) => {
    const { data: similarItems, isLoading: isLoadingSimilarItems } = useSimilarItems(itemId, 12);

    const itemElements = useMemo(() => {
        if (!similarItems) return [];

        return similarItems.map((item) => (
            <ScrollableSectionPoster key={item.Id} item={item}>
                {item.PremiereDate && (
                    <span className="text-xs text-muted-foreground mt-1">
                        {new Date(item.PremiereDate).getFullYear()}
                    </span>
                )}
            </ScrollableSectionPoster>
        ));
    }, [similarItems]);

    if (isLoading || isLoadingSimilarItems) {
        return <SectionScroller title={title} items={SKELETON_ITEMS} />;
    }

    if (!similarItems || similarItems.length === 0) {
        return null;
    }

    return <SectionScroller title={title} items={itemElements} />;
});

MoreLikeThisRow.displayName = 'MoreLikeThisRow';

export default MoreLikeThisRow;
