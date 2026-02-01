import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { EllipsisVertical, RotateCcw, Trash2 } from 'lucide-react';
import MediaDeleteButton from './MediaDeleteButton';
import RefreshItemMetadataButton from './RefreshItemMetadataButton';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from '@/hooks/api/useCurrentUser';

const ItemAdminButton = ({ item }: { item: BaseItemDto }) => {
    const { t } = useTranslation('item');
    const { data: currentUser } = useCurrentUser();

    if (currentUser?.Policy?.IsAdministrator !== true) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={'outline'} size={'icon'}>
                    <EllipsisVertical />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={'end'}>
                <RefreshItemMetadataButton
                    item={item}
                    trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <RotateCcw />
                            {t('refreshMetadata')}
                        </DropdownMenuItem>
                    }
                />
                <MediaDeleteButton
                    item={item}
                    trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 />
                            {t('deleteItem')}
                        </DropdownMenuItem>
                    }
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ItemAdminButton;
