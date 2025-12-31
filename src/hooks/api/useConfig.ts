import type { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models';
import { useEffect, useState } from 'react';

interface BaseHomeScreenSection {
    enabled: boolean;
    title?: string;
}

export interface SectionItemsConfig {
    sortBy?: ItemSortBy[];
    libraryId?: string;
    types?: ('Movie' | 'Series')[];
    genres?: string[];
    tags?: string[];
    sortOrder?: 'Ascending' | 'Descending';
    limit?: number;
}

export interface MediaBarSection extends BaseHomeScreenSection {
    type: 'mediaBar';
    size?: 'small' | 'medium' | 'large';
    items?: SectionItemsConfig;
}

export interface RecentlyAddedSection extends BaseHomeScreenSection {
    type: 'recentlyAdded';
}

export type HomeScreenSection = MediaBarSection | RecentlyAddedSection;

export interface AppConfig {
    homeScreenSections?: HomeScreenSection[];
}

const DEFAULT_CONFIG: AppConfig = {
    homeScreenSections: [
        { type: 'mediaBar', enabled: true, title: 'Featured', size: 'medium' },
        { type: 'recentlyAdded', enabled: true, title: 'Recently Added' },
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
