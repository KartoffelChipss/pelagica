import { useEffect, useState } from 'react';

export interface HomeScreenSection {
    type: 'mediaBar' | 'recentlyAdded';
    enabled: boolean;
    label?: string;
}

export interface AppConfig {
    homeScreenSections?: HomeScreenSection[];
}

const DEFAULT_CONFIG: AppConfig = {
    homeScreenSections: [
        { type: 'mediaBar', enabled: true, label: 'Featured' },
        { type: 'recentlyAdded', enabled: true, label: 'Recently Added' },
    ],
};

export const useConfig = () => {
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await fetch('/config.json');
                if (!response.ok) {
                    console.warn('Config file not found, using default configuration');
                    setConfig(DEFAULT_CONFIG);
                } else {
                    const data: AppConfig = await response.json();
                    // Merge with defaults to ensure all required fields exist
                    setConfig({
                        ...DEFAULT_CONFIG,
                        ...data,
                    });
                }
            } catch (err) {
                console.warn('Failed to load config file, using default configuration', err);
                setConfig(DEFAULT_CONFIG);
                setError(err instanceof Error ? err.message : 'Failed to load config');
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);

    return { config, loading, error };
};
