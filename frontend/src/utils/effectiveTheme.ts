import type { Theme } from '@/components/theme-provider';

export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
    return theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
        : theme;
}
