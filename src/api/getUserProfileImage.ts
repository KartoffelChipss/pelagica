import { getAccessToken, getServerUrl } from '@/utils/localstorageCredentials';

export function getUserProfileImage(userId: string): string {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '';

        const url = new URL(server);
        url.pathname = `/Users/${userId}/Images/Primary`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);

        return url.toString();
    } catch {
        return '';
    }
}
