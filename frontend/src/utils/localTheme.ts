const LOCAL_THEME_KEY = 'pelagica-local-theme';

export const LOCAL_THEME_PELAGICA_DEFAULT = '___PELAGICA_DEFAULT___';
export const LOCAL_THEME_SERVER_DEFAULT = '___SERVER_DEFAULT___';

export function saveLocalTheme(themeId: string) {
    localStorage.setItem(LOCAL_THEME_KEY, themeId);
}

export function getLocalTheme(): string | null {
    return localStorage.getItem(LOCAL_THEME_KEY);
}

export function clearLocalTheme() {
    localStorage.removeItem(LOCAL_THEME_KEY);
}
