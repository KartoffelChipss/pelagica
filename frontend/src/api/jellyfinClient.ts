import { Jellyfin } from '@jellyfin/sdk';
import { VERSION } from '../utils/version';
import { getDeviceId } from '@/utils/deviceId';

export const jellyfin = new Jellyfin({
    clientInfo: { name: 'Pelagica', version: VERSION },
    deviceInfo: { name: 'Web', id: getDeviceId() },
});

export function createApi(server: string, token?: string) {
    return jellyfin.createApi(server, token);
}
