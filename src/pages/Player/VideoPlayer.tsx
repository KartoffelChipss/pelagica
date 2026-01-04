import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type VideoJsPlayer = ReturnType<typeof videojs>;

interface VideoPlayerProps {
    src: string;
    poster?: string;
    onReady?: (player: VideoJsPlayer) => void;
}

const VideoPlayer = ({ src, poster, onReady }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<VideoJsPlayer | null>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        const player = videojs(videoRef.current, {
            controls: false,
            autoplay: true,
            preload: 'auto',
            poster: poster,
            responsive: false,
            fluid: false,
            html5: {
                nativeControlsForTouch: true,
                hls: { overrideNative: true },
            },
        });

        playerRef.current = player;

        player.ready(() => {
            onReady?.(player);
        });

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [onReady, poster]);

    useEffect(() => {
        if (playerRef.current && src) {
            playerRef.current.src({
                src,
                type: 'application/x-mpegURL',
            });
        }
    }, [src]);

    return (
        <div
            className="w-full h-full overflow-hidden"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <video
                ref={videoRef}
                className="video-js vjs-default-skin"
                data-testid="video-player"
                style={{ maxWidth: '100%', maxHeight: '100%', width: '100%', height: '100%' }}
            >
                <track kind="captions" srcLang="en" label="English" />
            </video>
        </div>
    );
};

export default VideoPlayer;
