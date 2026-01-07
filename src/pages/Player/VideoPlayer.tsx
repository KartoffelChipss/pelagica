import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type VideoJsPlayer = ReturnType<typeof videojs>;

export interface SubtitleTrack {
    src: string;
    srclang: string;
    label: string;
    default?: boolean;
}

interface VideoPlayerProps {
    src: string;
    poster?: string;
    startTicks: number;
    subtitles?: SubtitleTrack[];
    onReady?: (player: VideoJsPlayer) => void;
}

const VideoPlayer = ({ src, poster, startTicks, subtitles, onReady }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<VideoJsPlayer | null>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        const player = videojs(videoRef.current, {
            controls: false,
            autoplay: false,
            preload: 'auto',
            poster: poster,
            responsive: false,
            fluid: false,
            html5: {
                nativeControlsForTouch: true,
                hls: { overrideNative: true },
                nativeTextTracks: false, // Force video.js to render text tracks
            },
        });

        playerRef.current = player;

        player.ready(() => {
            onReady?.(player);
            const startSeconds = startTicks / 10000000;
            player.currentTime(startSeconds);
            player.play()?.catch((error) => {
                console.error('Error attempting to play:', error);
            });
        });

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [onReady, poster, startTicks]);

    useEffect(() => {
        if (playerRef.current && src) {
            const prevPos = playerRef.current.currentTime();
            playerRef.current.pause();
            playerRef.current.src({
                src,
                type: 'application/x-mpegURL',
            });
            playerRef.current.load();
            playerRef.current.currentTime(prevPos);
            playerRef.current.play()?.catch((error) => {
                console.error('Error attempting to play after source change:', error);
            });
        }
    }, [src]);

    useEffect(() => {
        if (!playerRef.current) return;

        const player = playerRef.current;

        const addSubtitles = () => {
            const tracks = player.remoteTextTracks();
            while (tracks.tracks_.length > 0) {
                const track = tracks.tracks_[0];
                if (track) player.removeRemoteTextTrack(track);
            }

            if (subtitles && subtitles.length > 0) {
                subtitles.forEach((subtitle) => {
                    player.addRemoteTextTrack(
                        {
                            kind: 'subtitles',
                            src: subtitle.src,
                            srclang: subtitle.srclang,
                            label: subtitle.label,
                            default: subtitle.default,
                        },
                        false // Don't add to DOM manually
                    );
                });
            }
        };

        addSubtitles();
    }, [subtitles, src]);

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
