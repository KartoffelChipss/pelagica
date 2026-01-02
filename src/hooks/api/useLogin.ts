import { useMutation } from '@tanstack/react-query';
import { createApi } from '../../api/jellyfinClient';
import { getUserApi } from '@jellyfin/sdk/lib/utils/api/user-api';
import { saveCredentials } from '@/utils/localstorageCredentials';

export function useLogin() {
    return useMutation({
        mutationFn: async ({
            server,
            username,
            password,
        }: {
            server: string;
            username: string;
            password: string;
        }) => {
            const api = createApi(server);
            const res = await getUserApi(api).authenticateUserByName({
                authenticateUserByName: {
                    Pw: password,
                    Username: username,
                },
            });

            const accessToken = res.data.AccessToken || '';
            const userId = res.data.User?.Id || '';

            saveCredentials(server, userId, accessToken);

            return { api, user: res.data.User };
        },
    });
}
