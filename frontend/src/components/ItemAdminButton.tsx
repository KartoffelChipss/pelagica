import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { EllipsisVertical, Image, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from '@/hooks/api/useCurrentUser';
import { useRef } from 'react';
import ManageImageButton from './ManageImageButton';
import RefreshItemMetadataButton from './RefreshItemMetadataButton';
import MediaDeleteButton from './MediaDeleteButton';

const ItemAdminButton = ({ item }: { item: BaseItemDto }) => {
    const { t } = useTranslation('item');
    const { data: currentUser } = useCurrentUser();
    const manageImagesTriggerRef = useRef<HTMLButtonElement>(null);
    const refreshMetadataTriggerRef = useRef<HTMLButtonElement>(null);
    const deleteTriggerRef = useRef<HTMLButtonElement>(null);

    if (currentUser?.Policy?.IsAdministrator !== true) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={'outline'} size={'icon'}>
                        <EllipsisVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={'end'}>
                    <DropdownMenuItem
                        onClick={() => {
                            setTimeout(() => manageImagesTriggerRef.current?.click(), 0);
                        }}
                    >
                        <Image />
                        {t('manage_images')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setTimeout(() => refreshMetadataTriggerRef.current?.click(), 0);
                        }}
                    >
                        <RotateCcw />
                        {t('refreshMetadata')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setTimeout(() => deleteTriggerRef.current?.click(), 0);
                        }}
                    >
                        <Trash2 />
                        {t('deleteItem')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div style={{ display: 'none' }}>
                <ManageImageButton item={item} trigger={<button ref={manageImagesTriggerRef} />} />
                <RefreshItemMetadataButton
                    item={item}
                    trigger={<button ref={refreshMetadataTriggerRef} />}
                />
                <MediaDeleteButton item={item} trigger={<button ref={deleteTriggerRef} />} />
            </div>
        </>
    );
};

export default ItemAdminButton;
