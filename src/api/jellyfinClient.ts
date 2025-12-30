import { Jellyfin } from '@jellyfin/sdk';
import { VERSION } from '../utils/version';

export const jellyfin = new Jellyfin({
    clientInfo: { name: 'Pelagica', version: VERSION },
    deviceInfo: { name: 'Web', id: 'pelagica-web' },
});

export function createApi(server: string, token?: string) {
    return jellyfin.createApi(server, token);
}
