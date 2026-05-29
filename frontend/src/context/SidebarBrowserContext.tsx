'use client';

import * as React from 'react';
import type { BrowserMediaCategory } from '@/utils/sidebarLibraryNavigation';

export type SidebarBrowseCategory = BrowserMediaCategory | 'all';

const STORAGE_KEY = 'pelagica_sidebar_browse_category';

function parseStoredCategory(value: string): SidebarBrowseCategory | null {
    if (value === 'music' || value === 'series' || value === 'movie') return value;
    if (value === 'all') return 'movie';
    return null;
}

function readStoredCategory(): SidebarBrowseCategory {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = parseStoredCategory(stored);
            if (parsed) return parsed;
        }
    } catch {
        // ignore
    }
    return 'movie';
}

type SidebarBrowserContextValue = {
    category: SidebarBrowseCategory;
    setCategory: (category: SidebarBrowseCategory) => void;
};

const SidebarBrowserContext = React.createContext<SidebarBrowserContextValue | null>(null);

export function SidebarBrowserProvider({ children }: { children: React.ReactNode }) {
    const [category, setCategoryState] = React.useState<SidebarBrowseCategory>(readStoredCategory);

    const setCategory = React.useCallback((next: SidebarBrowseCategory) => {
        setCategoryState(next);
        try {
            sessionStorage.setItem(STORAGE_KEY, next);
        } catch {
            // ignore
        }
    }, []);

    const value = React.useMemo(() => ({ category, setCategory }), [category, setCategory]);

    return (
        <SidebarBrowserContext.Provider value={value}>{children}</SidebarBrowserContext.Provider>
    );
}

export function useSidebarBrowser() {
    const context = React.useContext(SidebarBrowserContext);
    if (!context) {
        throw new Error('useSidebarBrowser must be used within SidebarBrowserProvider.');
    }
    return context;
}
