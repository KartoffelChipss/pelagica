export function getBackdropUrl(itemId: string) {
    try {
        const server = localStorage.getItem('jf_server');
        const token = localStorage.getItem('jf_token');

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
        const server = localStorage.getItem('jf_server');
        const token = localStorage.getItem('jf_token');

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
