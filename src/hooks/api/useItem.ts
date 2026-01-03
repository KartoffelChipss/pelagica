import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getRetryConfig } from '@/utils/authErrorHandler';

export function useItem(itemId: string | null | undefined) {
    return useQuery<BaseItemDto>({
        queryKey: ['item', itemId],
        queryFn: async (): Promise<BaseItemDto> => {
            const api = getApi();
            const itemsApi = getItemsApi(api);
            const response = await itemsApi.getItems({
                ids: [itemId!],
                fields: [
                    'Overview',
                    'Genres',
                    'People',
                    'Studios',
                    'ChildCount',
                    'RecursiveItemCount',
                ],
            });
            const item = response.data.Items?.[0];
            if (!item) {
                throw new Error(`Item not found: ${itemId}`);
            }
            return item;
        },
        enabled: !!itemId,
        ...getRetryConfig(),
    });
}
