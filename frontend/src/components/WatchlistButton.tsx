import { Button } from '@/components/ui/button';
import { useLike } from '@/hooks/api/useLike';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { Bookmark } from 'lucide-react';

interface WatchlistButtonProps {
    item: BaseItemDto;
    showWatchlistButton?: boolean | undefined;
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg' | null | undefined;
    variant?:
        | 'default'
        | 'link'
        | 'destructive'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | null
        | undefined;
}

const WatchListButton = ({
    item,
    showWatchlistButton,
    size = 'icon',
    variant = 'outline',
}: WatchlistButtonProps) => {
    const { isLiked, toggleLike, isLoading } = useLike(item.Id);

    if (showWatchlistButton === false) return null;

    return (
        <Button
            variant={variant}
            size={size}
            onClick={() => toggleLike(!isLiked)}
            disabled={isLoading}
        >
            <Bookmark fill={isLiked ? 'currentColor' : 'none'} />
        </Button>
    );
};

export default WatchListButton;
