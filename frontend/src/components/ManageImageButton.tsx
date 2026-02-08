import { useCurrentUser } from '@/hooks/api/useCurrentUser';
import { useItemImages, type ItemImage } from '@/hooks/api/images/useItemImages';
import { useDeleteItemImage } from '@/hooks/api/images/useDeleteItemImage';
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Image, Search, Trash2, Upload } from 'lucide-react';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getItemImageUrl } from '@/utils/jellyfinUrls';
import { Card, CardContent } from './ui/card';
import { useTranslation } from 'react-i18next';

const ManageImageButton = ({
    showButton,
    trigger,
    item,
}: {
    showButton?: boolean;
    trigger?: React.ReactNode;
    item?: BaseItemDto;
}) => {
    const { t } = useTranslation('item');
    const [isOpen, setIsOpen] = useState(false);
    const { data: currentUser } = useCurrentUser();
    const { data: images, isLoading, error } = useItemImages(isOpen ? item?.Id : null);
    const { deleteImage, isDeleting } = useDeleteItemImage();

    if (showButton === false) return null;
    if (currentUser?.Policy?.IsAdministrator !== true) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button variant={'outline'} size={'icon'}>
                        <Image />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <div className="space-y-6 no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
                    <h2 className="text-lg font-semibold mb-4">{t('manage_images')}</h2>

                    {isLoading && (
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Card key={`skeleton-${index}`} className="p-0 overflow-hidden">
                                    <CardContent className="p-0 flex flex-col items-center h-full relative bg-muted animate-pulse">
                                        <div className="w-full h-40 bg-muted" />
                                        <div className="bg-secondary w-full flex flex-col items-center justify-center p-2 space-y-2">
                                            <div className="h-4 w-20 bg-muted rounded" />
                                            <div className="h-3 w-24 bg-muted rounded" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                            Failed to load images: {error.message}
                        </div>
                    )}

                    {images && images.length === 0 && !isLoading && (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                            No images found for this item
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {images?.map((image: ItemImage) => (
                            <Card
                                key={`${image.type}-${image.index}`}
                                className="p-0 overflow-hidden"
                            >
                                <CardContent className="p-0 flex flex-col items-center h-full relative">
                                    <img
                                        src={getItemImageUrl(
                                            item!.Id!,
                                            image.type,
                                            image.index,
                                            undefined,
                                            image.tag
                                        )}
                                        alt={`${image.type} ${image.index}`}
                                        className="object-contain max-h-25 my-auto"
                                    />
                                    <div className="bg-secondary w-full flex flex-col items-center justify-center p-2 ">
                                        <p>{image.type}</p>
                                        <p className="text-sm font-light text-muted-foreground">
                                            {image.size?.height} x {image.size?.width}
                                        </p>
                                    </div>
                                    <Button
                                        variant={'secondary'}
                                        size={'icon-sm'}
                                        className="absolute top-2 right-2 hover:bg-secondary"
                                        title={t('delete_image')}
                                        disabled={isDeleting}
                                        onClick={() =>
                                            deleteImage({
                                                itemId: item!.Id!,
                                                imageType: image.type,
                                                imageIndex: image.index,
                                            })
                                        }
                                    >
                                        <Trash2 />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant={'outline'}>
                        <Search />
                        {t('find_images')}
                    </Button>
                    <Button variant={'outline'}>
                        <Upload />
                        {t('upload_new_image')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ManageImageButton;
