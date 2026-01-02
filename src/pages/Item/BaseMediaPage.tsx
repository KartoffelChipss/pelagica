import { usePageBackground } from '@/hooks/usePageBackground';
import { getBackdropUrl, getLogoUrl } from '@/utils/images';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { useEffect } from 'react';

interface BaseMediaPageProps {
    item: BaseItemDto;
    children?: React.ReactNode;
}

const BaseMediaPage = ({ item, children }: BaseMediaPageProps) => {
    const { setBackground } = usePageBackground();

    useEffect(() => {
        if (item.BackdropImageTags && item.BackdropImageTags.length > 0) {
            setBackground(
                <div className="fixed top-0 left-0 w-full h-full -z-20 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={getBackdropUrl(item.Id || '')}
                            alt={item.Name + ' Backdrop'}
                            className="w-full h-full object-cover blur-3xl scale-110 opacity-40"
                        />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-b from-background/80 via-background/50 to-background" />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
                </div>
            );
        }

        return () => {
            setBackground(null);
        };
    }, [item, setBackground]);

    return (
        <div className="relative h-full w-full">
            <div className="absolute top-0 left-0 h-3/4 w-full -z-10">
                <img
                    className="h-full w-full object-cover rounded-md border border-border"
                    src={getBackdropUrl(item.Id || '')}
                    alt={item.Name + ' Backdrop'}
                />
                <div className="absolute bottom-0 left-0 h-full w-full px-4 bg-linear-to-t from-background to-transparent rounded-md" />
            </div>
            <div className="h-2/5 flex items-center justify-center">
                <img
                    src={getLogoUrl(item.Id || '')}
                    alt={item.Name + ' Logo'}
                    className="relative mx-auto px-4 h-32 object-contain"
                />
            </div>
            <div className="relative z-10 p-2 sm:p-4">
                <div className="bg-background/30 backdrop-blur-md p-4 sm:p-8 rounded-md w-full flex flex-col gap-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BaseMediaPage;
