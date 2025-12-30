export function getUserProfileImage(userId: string): string {
    try {
        const server = localStorage.getItem('jf_server');
        const token = localStorage.getItem('jf_token');

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
