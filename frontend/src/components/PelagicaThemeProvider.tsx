import { fetchThemeById } from '@/api/themes';
import { useConfig } from '@/hooks/api/useConfig';
import { applyTheme } from '@/utils/applyTheme';
import { useEffect } from 'react';

const PelagicaThemeLoader = () => {
    const { config } = useConfig();

    useEffect(() => {
        let mounted = true;

        async function loadTheme() {
            if (!config?.serverThemeId) return;

            const theme = await fetchThemeById(config.serverThemeId);
            if (!mounted || !theme) return;

            applyTheme(theme);
        }

        loadTheme();

        return () => {
            mounted = false;
        };
    }, [config?.serverThemeId]);

    return null;
};

export default PelagicaThemeLoader;
