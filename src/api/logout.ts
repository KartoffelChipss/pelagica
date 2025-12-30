// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logout(api: any) {
    await api.logout();
    localStorage.removeItem('jf_token');
    localStorage.removeItem('jf_user');
    localStorage.removeItem('jf_server');
}
