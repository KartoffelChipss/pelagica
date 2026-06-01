import { useEffect, useState } from 'react';
import { extractImagePalette, type ImagePalette } from '@/utils/extractImagePalette';

export function useImagePalette(imageUrl: string | undefined, enabled = true) {
    const active = enabled && !!imageUrl;
    const [palette, setPalette] = useState<ImagePalette | null>(null);

    useEffect(() => {
        if (!active) return;

        let cancelled = false;

        extractImagePalette(imageUrl!).then((result) => {
            if (!cancelled) setPalette(result);
        });

        return () => {
            cancelled = true;
        };
    }, [active, imageUrl]);

    return active ? palette : null;
}
