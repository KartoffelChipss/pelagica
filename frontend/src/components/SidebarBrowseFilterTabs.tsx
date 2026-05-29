'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BrowserMediaCategory } from '@/utils/sidebarLibraryNavigation';
import {
    getBrowseFiltersForCategory,
    normalizeBrowseFilter,
    type SidebarBrowseFilter,
} from '@/utils/sidebarBrowseFilters';

type SidebarBrowseFilterTabsProps = {
    category: BrowserMediaCategory;
    value: SidebarBrowseFilter;
    onValueChange: (filter: SidebarBrowseFilter) => void;
};

export function SidebarBrowseFilterTabs({
    category,
    value,
    onValueChange,
}: SidebarBrowseFilterTabsProps) {
    const filters = getBrowseFiltersForCategory(category);
    const activeValue = normalizeBrowseFilter(category, value);
    const gridCols = category === 'music' ? 'grid-cols-4' : 'grid-cols-2';

    return (
        <Tabs
            value={activeValue}
            onValueChange={(next) => onValueChange(normalizeBrowseFilter(category, next))}
            className="shrink-0 gap-0"
        >
            <TabsList className={`grid h-auto w-full ${gridCols} gap-0.5 p-1`}>
                {filters.map((filter) => (
                    <TabsTrigger
                        key={filter.value}
                        value={filter.value}
                        className="px-1 py-1 text-[11px] leading-tight"
                    >
                        {filter.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
