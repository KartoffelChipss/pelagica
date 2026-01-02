import { getAccessToken, getServerUrl } from '@/utils/localstorageCredentials';
import { createApi } from './jellyfinClient';

export function getApi() {
    const server = getServerUrl();
    const token = getAccessToken();

    if (!server || !token) throw new Error('Not authenticated');

    return createApi(server, token);
}
