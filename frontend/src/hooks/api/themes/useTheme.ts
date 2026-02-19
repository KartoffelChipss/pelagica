import { fetchThemeById, type Theme } from '@/api/themes';
import { useQuery } from '@tanstack/react-query';

export function useTheme(id: string) {
    return useQuery<Theme>({
        queryKey: ['themes', id],
        queryFn: async (): Promise<Theme> => {
            return fetchThemeById(id);
        },
    });
}
