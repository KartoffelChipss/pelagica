import { Check } from 'lucide-react';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';

interface WatchedStateBadgeProps {
    item?: BaseItemDto;
    show: boolean;
}

/**
 * Displays a badge indicating the watched/unplayed state of an item.
 * Shows an unplayed count for series/boxsets or a checkmark for played items.
 */
const WatchedStateBadge = ({ item, show }: WatchedStateBadgeProps) => {
    if (!show || !item) return null;

    const unplayedItemCount = item?.UserData?.UnplayedItemCount;
    const playedItem = item?.UserData?.Played;
    const shouldShowUnplayedCount =
        (item?.Type === 'Series' || item?.Type === 'BoxSet') &&
        unplayedItemCount !== undefined &&
        !playedItem;

    if (shouldShowUnplayedCount) {
        return (
            <div className="absolute top-1.5 right-1.5 bg-black/70 text-white text-xs font-semibold rounded-full py-1.5 w-8 flex items-center justify-center z-20">
                {unplayedItemCount! > 99 ? '99+' : unplayedItemCount}
            </div>
        );
    }

    if (playedItem) {
        return (
            <div className="absolute top-1.5 right-1.5 bg-green-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center z-20">
                <Check className="w-3 h-3" />
            </div>
        );
    }

    return null;
};

export default WatchedStateBadge;
