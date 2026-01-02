import { getAccessToken, getServerUrl } from './localstorageCredentials';

export function getBackdropUrl(itemId: string) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '/default-backdrop.jpg';

        const url = new URL(server);
        url.pathname = `/Items/${itemId}/Images/Backdrop/0`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);

        return url.toString();
    } catch {
        return '/default-backdrop.jpg';
    }
}

export function getLogoUrl(itemId: string) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '';

        const url = new URL(server);
        url.pathname = `/Items/${itemId}/Images/Logo`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);

        return url.toString();
    } catch {
        return '';
    }
}

export function getThumbUrl(itemId: string) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '/default-thumb.jpg';

        const url = new URL(server);
        url.pathname = `/Items/${itemId}/Images/Thumb`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);

        return url.toString();
    } catch {
        return '/default-thumb.jpg';
    }
}

export function getPrimaryImageUrl(itemId: string) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '/default-thumb.jpg';

        const url = new URL(server);
        url.pathname = `/Items/${itemId}/Images/Primary/0`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);

        return url.toString();
    } catch {
        return '/default-thumb.jpg';
    }
}
