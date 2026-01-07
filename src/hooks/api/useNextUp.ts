import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getTvShowsApi } from '@jellyfin/sdk/lib/utils/api/tv-shows-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getRetryConfig } from '@/utils/authErrorHandler';

interface NextUpResult {
    items: BaseItemDto[];
}

export function useNextUp(userId: string | null | undefined) {
    return useQuery({
        queryKey: ['nextUp', userId],
        queryFn: async (): Promise<NextUpResult> => {
            const api = getApi();
            const tvShowsApi = getTvShowsApi(api);

            const res = await tvShowsApi.getNextUp({
                userId: userId!,
                limit: 20,
                fields: ['PrimaryImageAspectRatio'],
                enableUserData: true,
                enableImages: true,
            });

            return { items: res.data.Items || [] };
        },
        enabled: !!userId,
        ...getRetryConfig(),
    });
}
