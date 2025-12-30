import { createApi } from './jellyfinClient';

export function getApi() {
    const server = localStorage.getItem('jf_server');
    const token = localStorage.getItem('jf_token');

    if (!server || !token) throw new Error('Not authenticated');

    return createApi(server, token);
}
