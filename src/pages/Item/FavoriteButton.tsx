import { Button } from '@/components/ui/button';
import { useFavorite } from '@/hooks/api/useFavorite';
import type { BaseItemDto, BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
    item: BaseItemDto;
    favoriteButtonSetting: BaseItemKind[] | undefined;
}

const FavoriteButton = ({ item, favoriteButtonSetting }: FavoriteButtonProps) => {
    const { isFavorite, toggleFavorite, isLoading: isFavoriteLoading } = useFavorite(item.Id);

    if (!item.Type || !favoriteButtonSetting?.includes(item.Type)) return null;

    return (
        <Button
            variant={'outline'}
            size={'icon'}
            onClick={() => toggleFavorite(!isFavorite)}
            disabled={isFavoriteLoading}
        >
            <Heart fill={isFavorite ? 'currentColor' : 'none'} />
        </Button>
    );
};

export default FavoriteButton;
