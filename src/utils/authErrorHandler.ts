export function isAuthError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        return status === 401 || status === 403;
    }
    return false;
}

export function clearAuthAndRedirect() {
    localStorage.removeItem('jf_token');
    localStorage.removeItem('jf_user');
    localStorage.removeItem('jf_server');

    window.location.href = '/login';
}

export function getRetryConfig() {
    return {
        retry: (failureCount: number, error: unknown) => {
            if (isAuthError(error)) {
                clearAuthAndRedirect();
                return false;
            }
            return failureCount < 3;
        },
    };
}
