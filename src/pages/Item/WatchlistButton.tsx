import { Button } from '@/components/ui/button';
import { useLike } from '@/hooks/api/useLike';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { Bookmark } from 'lucide-react';

interface WatchlistButtonProps {
    item: BaseItemDto;
    showWatchlistButton: boolean | undefined;
}

const WatchListButton = ({ item, showWatchlistButton }: WatchlistButtonProps) => {
    const { isLiked, toggleLike, isLoading } = useLike(item.Id);

    if (showWatchlistButton === false) return null;

    return (
        <Button
            variant={'outline'}
            size={'icon-lg'}
            onClick={() => toggleLike(!isLiked)}
            disabled={isLoading}
        >
            <Bookmark fill={isLiked ? 'currentColor' : 'none'} />
        </Button>
    );
};

export default WatchListButton;
