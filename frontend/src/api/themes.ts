export interface ThemeSummary {
    id: string;
    name: string;
    version: string;
    author: string;
}

export interface Theme {
    name: string;
    author: string;
    description: string;
    version: string;
    colors: Colors;
    radius: string;
    modes: ('light' | 'dark')[];
}

export interface Colors {
    light: Record<string, string>;
    dark: Record<string, string>;
}

export const fetchThemes = async (): Promise<ThemeSummary[]> => {
    const response = await fetch('/api/themes');
    if (!response.ok) {
        throw new Error('Failed to fetch themes');
    }
    return response.json();
};

export const fetchThemeById = async (id: string): Promise<Theme> => {
    const response = await fetch(`/api/themes/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch theme with id: ${id}`);
    }
    return response.json();
};

export const createTheme = async (theme: Theme): Promise<{ id: string }> => {
    const response = await fetch('/api/themes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(theme),
    });
    if (!response.ok) {
        throw new Error('Failed to create theme');
    }
    return response.json();
};

export const deleteTheme = async (id: string): Promise<void> => {
    const response = await fetch(`/api/themes/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Failed to delete theme with id: ${id}`);
    }
};

export const updateTheme = async (id: string, theme: Theme): Promise<void> => {
    const response = await fetch(`/api/themes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(theme),
    });
    if (!response.ok) {
        throw new Error(`Failed to update theme with id: ${id}`);
    }
};
