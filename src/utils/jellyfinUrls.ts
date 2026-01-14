import { getAccessToken, getServerUrl } from './localstorageCredentials';

export function getAudioStreamUrl(itemId: string, userId?: string) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '';

        const url = new URL(server);
        url.pathname = `/Audio/${itemId}/universal`;
        if (userId) url.searchParams.append('UserId', userId);
        url.searchParams.append('ApiKey', token);
        url.searchParams.append('AudioCodec', 'aac');
        url.searchParams.append(
            'Container',
            'opus,webm|opus,ts|mp3,mp3,aac,m4a|aac,m4b|aac,flac,alac,m4a|alac,m4b|alac,webma,webm|webma,wav,ogg,mp4|opus'
        );
        url.searchParams.append('TranscodingContainer', 'mp4');
        url.searchParams.append('TranscodingProtocol', 'hls');
        url.searchParams.append('StartTimeTicks', '0');
        url.searchParams.append('MaxStreamingBitrate', '150000000');
        url.searchParams.append('EnableRedirection', 'true');
        url.searchParams.append('EnableRemoteMedia', 'false');
        url.searchParams.append('EnableAudioVbrEncoding', 'true');

        // https://jellyfin.jan.run/Audio/7ef9a3411c0387ab625e63ff19e5c71b/universal
        // ?UserId=cffdf3fcb5724b3d8cbd980d3a72cbb8
        // &DeviceId=TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfNykgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzE4LjUgU2FmYXJpLzYwNS4xLjE1fDE3NTYwMjYzOTY4MTI1
        // &MaxStreamingBitrate=150000000
        // &Container=opus%2Cwebm%7Copus%2Cts%7Cmp3%2Cmp3%2Caac%2Cm4a%7Caac%2Cm4b%7Caac%2Cflac%2Calac%2Cm4a%7Calac%2Cm4b%7Calac%2Cwebma%2Cwebm%7Cwebma%2Cwav%2Cogg%2Cmp4%7Copus
        // &TranscodingContainer=mp4
        // &TranscodingProtocol=hls
        // &AudioCodec=aac
        // &ApiKey=d0b80ecc697e4b7994fb790e65a09667
        // &PlaySessionId=1768386958787
        // &StartTimeTicks=0
        // &EnableRedirection=true
        // &EnableRemoteMedia=false
        // &EnableAudioVbrEncoding=true

        return url.toString();
    } catch {
        return '';
    }
}

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

export function getVideoStreamUrl(
    itemId: string,
    options: {
        playSessionId?: string;
        audioStreamIndex?: number;
    }
) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '';

        const url = new URL(server);
        url.pathname = `/videos/${itemId}/master.m3u8`;
        url.searchParams.append('MediaSourceId', itemId);
        url.searchParams.append('ApiKey', token);
        url.searchParams.append('VideoCodec', 'av1,hevc,h264,vp9');
        url.searchParams.append('AudioCodec', 'aac');
        url.searchParams.append('SegmentContainer', 'mp4');
        url.searchParams.append('MinSegments', '2');
        url.searchParams.append('BreakOnNonKeyFrames', 'true');
        url.searchParams.append('RequireAvc', 'false');
        if (options.playSessionId !== undefined)
            url.searchParams.append('PlaySessionId', options.playSessionId);
        if (options.audioStreamIndex !== undefined) {
            url.searchParams.append('AudioStreamIndex', options.audioStreamIndex.toString());
        }

        return url.toString();
    } catch {
        return '';
    }

    // https://jellyfin.jan.run/videos/12110497-4502-30bc-50b6-aa9b56f85e13/master.m3u8?
    // &DeviceId=TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfNykgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzE4LjUgU2FmYXJpLzYwNS4xLjE1fDE3NTYwMjYzOTY4MTI1
    // &MediaSourceId=12110497450230bc50b6aa9b56f85e13
    // &VideoCodec=av1,hevc,h264,vp9
    // &AudioCodec=aac
    // &AudioStreamIndex=1
    // &VideoBitrate=139872000
    // &AudioBitrate=128000
    // &AudioSampleRate=44100
    // &MaxFramerate=23.976025
    // &SegmentContainer=mp4
    // &MinSegments=2
    // &BreakOnNonKeyFrames=True
    // &PlaySessionId=20b1c85b8d494d25bdc420f9d91955bc
    // &ApiKey=XXX
    // &TranscodingMaxAudioChannels=6
    // &RequireAvc=false
    // &EnableAudioVbrEncoding=true
    // &Tag=e0bf36a4068922681907bddf213fcbfb
    // &SubtitleMethod=Encode
    // &hevc-level=150
    // &hevc-videobitdepth=10
    // &hevc-profile=main10
    // &hevc-audiochannels=2
    // &aac-profile=lc
    // &av1-profile=main
    // &av1-rangetype=SDR,HDR10,HDR10Plus,HLG,DOVI,DOVIWithHDR10,DOVIWithHLG,DOVIWithSDR,DOVIWithHDR10Plus
    // &av1-level=17
    // &vp9-rangetype=SDR,HDR10,HDR10Plus,HLG
    // &hevc-rangetype=SDR,HDR10,HDR10Plus,HLG,DOVI,DOVIWithHDR10,DOVIWithHLG,DOVIWithSDR,DOVIWithHDR10Plus
    // &hevc-deinterlace=true
    // &hevc-codectag=hvc1,dvh1
    // &h264-profile=high,main,baseline,constrainedbaseline
    // &h264-rangetype=SDR
    // &h264-level=52
    // &h264-deinterlace=true
    // &TranscodeReasons=ContainerNotSupported,VideoCodecTagNotSupported
}

export function getSubtitleUrl(
    itemId: string,
    mediaSourceId: string,
    subtitleStreamIndex: number,
    format: 'vtt' | 'srt' = 'vtt'
) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '';

        const url = new URL(server);
        url.pathname = `/Videos/${itemId}/${mediaSourceId}/Subtitles/${subtitleStreamIndex}/0/Stream.${format}`;
        url.searchParams.append('api_key', token);

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

export function getTrickplayImageUrl(itemId: string, width: number, imageIndex: number) {
    try {
        const server = getServerUrl();
        const token = getAccessToken();

        if (!server || !token) return '';

        const url = new URL(server);
        url.pathname = `/Videos/${itemId}/Trickplay/${width}/${imageIndex}.jpg`;
        url.searchParams.append('ApiKey', token);
        url.searchParams.append('MediaSourceId', itemId);

        return url.toString();
    } catch {
        return '';
    }
}

export function getUserProfileImageUrl(userId: string): string {
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
