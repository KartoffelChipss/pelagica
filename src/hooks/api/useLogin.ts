import { useMutation } from '@tanstack/react-query';
import { createApi } from '../../api/jellyfinClient';
import { getUserApi } from '@jellyfin/sdk/lib/utils/api/user-api';

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

            localStorage.setItem('jf_server', server);
            localStorage.setItem('jf_token', accessToken);
            localStorage.setItem('jf_user', userId);

            return { api, user: res.data.User };
        },
    });
}
