import type { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models';
import { useEffect, useState } from 'react';

interface BaseHomeScreenSection {
    /** Whether the section is enabled. Mostly intended for testing purposes */
    enabled: boolean;
    /** The title of the section */
    title?: string;
}

/** Configuration for filtering and sorting items in a section */
export interface SectionItemsConfig {
    /** How to sort the items (e.g. "DateCreated", "Random", "CommunityRating") */
    sortBy?: ItemSortBy[];
    /** Filter items from a specific library by its ID */
    libraryId?: string;
    /** Filter by media types */
    types?: ('Movie' | 'Series')[];
    /** Filter by genre names */
    genres?: string[];
    /** Filter by tag names */
    tags?: string[];
    /** Sort order direction */
    sortOrder?: 'Ascending' | 'Descending';
    /** Maximum number of items to display */
    limit?: number;
}

/** A large carousel banner showcasing featured media with backdrop images */
export interface MediaBarSection extends BaseHomeScreenSection {
    type: 'mediaBar';
    /** Size of the media bar carousel */
    size?: 'small' | 'medium' | 'large';
    /** Configuration for which items to display in the carousel */
    items?: SectionItemsConfig;
}

/** A section showing recently added items */
export interface RecentlyAddedSection extends BaseHomeScreenSection {
    type: 'recentlyAdded';
    /** Maximum number of items to display */
    limit?: number;
}

export type DetailField =
    | 'ReleaseYear'
    | 'ReleaseYearAndMonth'
    | 'ReleaseDate'
    | 'CommunityRating'
    | 'PlayDuration'
    | 'PlayEnd'
    | 'SeasonCount'
    | 'EpisodeCount'
    | 'AgeRating';

/** A generic section displaying a grid of items */
export interface ItemsSection extends BaseHomeScreenSection {
    type: 'items';
    /** Link to show all items in this category */
    allLink?: string;
    /** Configuration for which items to display */
    items?: SectionItemsConfig;
    /** Additional detail fields to include for each item */
    detailFields?: DetailField[];
}

export type ContinueWatchingTitleLine = 'ItemTitle' | 'ParentTitle' | 'ItemTitleWithEpisodeInfo';
export type ContinueWatchingDetailLine =
    | 'ProgressPercentage'
    | 'TimeRemaining'
    | 'EpisodeInfo'
    | 'EndsAt'
    | 'ParentTitle'
    | 'None';

export interface ContinueWatchingSection extends BaseHomeScreenSection {
    type: 'continueWatching';
    titleLine?: ContinueWatchingTitleLine;
    detailLine?: ContinueWatchingDetailLine[];
}

export type HomeScreenSection =
    | MediaBarSection
    | RecentlyAddedSection
    | ItemsSection
    | ContinueWatchingSection;

export type EpisodeDisplay = 'grid' | 'row';

export interface ItemPageSettings {
    /** How to display episodes on series pages */
    episodeDisplay?: EpisodeDisplay;
}

export interface AppConfig {
    /** Optional server address to automatically choose */
    serverAddress?: string;
    itemPage?: ItemPageSettings;
    /** Sections to display on the home screen, in order */
    homeScreenSections?: HomeScreenSection[];
}

const DEFAULT_ITEM_PAGE_SETTINGS: ItemPageSettings = {
    episodeDisplay: 'row',
};

const DEFAULT_CONFIG: AppConfig = {
    homeScreenSections: [
        { type: 'mediaBar', enabled: true, size: 'medium' },
        { type: 'continueWatching', enabled: true },
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
                        itemPage: {
                            ...DEFAULT_ITEM_PAGE_SETTINGS,
                            ...data.itemPage,
                        },
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
