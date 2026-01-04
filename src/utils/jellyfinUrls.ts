import { getAccessToken, getServerUrl } from './localstorageCredentials';

export function getBackdropUrl(itemId: string, size?: { width?: number; height?: number }) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '/default-backdrop.jpg';

        const url = new URL(server);
        url.pathname = `/Items/${itemId}/Images/Backdrop/0`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);
        if (size?.width) {
            url.searchParams.append('width', size.width.toString());
        }
        if (size?.height) {
            url.searchParams.append('height', size.height.toString());
        }

        return url.toString();
    } catch {
        return '/default-backdrop.jpg';
    }
}

export function getLogoUrl(itemId: string, size?: { width?: number; height?: number }) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '';

        const url = new URL(server);
        url.pathname = `/Items/${itemId}/Images/Logo`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);
        if (size?.width) {
            url.searchParams.append('width', size.width.toString());
        }
        if (size?.height) {
            url.searchParams.append('height', size.height.toString());
        }

        return url.toString();
    } catch {
        return '';
    }
}

export function getThumbUrl(itemId: string, size?: { width?: number; height?: number }) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '/default-thumb.jpg';

        const url = new URL(server);
        url.pathname = `/Items/${itemId}/Images/Thumb`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);
        if (size?.width) {
            url.searchParams.append('width', size.width.toString());
        }
        if (size?.height) {
            url.searchParams.append('height', size.height.toString());
        }

        return url.toString();
    } catch {
        return '/default-thumb.jpg';
    }
}

export function getVideoStreamUrl(itemId: string) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '';

        const url = new URL(server);
        url.pathname = `/videos/${itemId}/master.m3u8`;
        url.searchParams.append('mediaSourceId', itemId);
        url.searchParams.append('api_key', token);
        url.searchParams.append('videoCodec', 'av1,hevc,h264,vp9');
        url.searchParams.append('audioCodec', 'aac');
        url.searchParams.append('segmentContainer', 'mp4');
        url.searchParams.append('minSegments', '2');
        url.searchParams.append('breakOnNonKeyFrames', 'true');
        url.searchParams.append('requireAvc', 'false');

        return url.toString();
    } catch {
        return '';
    }
}

export function getPrimaryImageUrl(itemId: string, size?: { width?: number; height?: number }) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '/default-thumb.jpg';

        const url = new URL(server);
        url.pathname = `/Items/${itemId}/Images/Primary/0`;
        url.searchParams.append('tag', 'v1');
        url.searchParams.append('quality', '90');
        url.searchParams.append('token', token);
        if (size?.width) {
            url.searchParams.append('width', size.width.toString());
        }
        if (size?.height) {
            url.searchParams.append('height', size.height.toString());
        }

        return url.toString();
    } catch {
        return '/default-thumb.jpg';
    }
}
