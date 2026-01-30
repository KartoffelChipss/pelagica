import { clearCredentials } from '@/utils/localstorageCredentials';
import { clearDeviceId } from '@/utils/deviceId';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logout(api: any) {
    clearCredentials();
    clearDeviceId();
    await api.logout();
}
