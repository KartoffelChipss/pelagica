import { getApi } from '@/api/getApi';
import { useMutation } from '@tanstack/react-query';
import { getPlaystateApi } from '@jellyfin/sdk/lib/utils/api/playstate-api';
import { useCurrentSessionId } from './useCurrentSessionId';

export function usePlaybackStart() {
    const { data: sessionId } = useCurrentSessionId();

    const { mutate: startPlayback, isPending } = useMutation({
        mutationFn: async (itemId: string) => {
            if (!itemId) throw new Error('Item ID is required');
            if (!sessionId) throw new Error('Session ID is required');

            const api = getApi();
            const playstateApi = getPlaystateApi(api);

            await playstateApi.reportPlaybackStart({
                playbackStartInfo: {
                    ItemId: itemId,
                    SessionId: sessionId,
                    PositionTicks: 0,
                },
            });

            console.log(`Started playback for item ${itemId} in session ${sessionId}`);

            return itemId;
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        meta: {
            silentFail: true,
        },
    });

    return { startPlayback, isStarting: isPending };
}
