/* eslint-disable @typescript-eslint/no-explicit-any */
import { useItem } from '@/hooks/api/useItem';
import { useReportPlaybackProgress } from '@/hooks/api/usePlaybackProgress';
import { usePlaybackStart } from '@/hooks/api/usePlaybackStart';
import { usePlaybackStop } from '@/hooks/api/usePlaybackStop';
import { useParams } from 'react-router';
import VideoPlayer from '@/pages/Player/VideoPlayer';
import PlayerControls from '@/pages/Player/PlayerControls';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getPrimaryImageUrl, getVideoStreamUrl } from '@/utils/jellyfinUrls';
import { generateRandomId } from '@/utils/idGenerator';
import { useMediaSegments } from '@/hooks/api/useMediaSegments';

type VideoJsPlayer = ReturnType<typeof import('video.js').default>;

const PlayerPage = () => {
    const params = useParams<{ itemId: string }>();
    const itemId = params.itemId;
    const [player, setPlayer] = useState<VideoJsPlayer | null>(null);
    const [audioTrackIndex, setAudioTrackIndex] = useState<number>(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressReportingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastPositionRef = useRef<number>(0);
    const [playSessionId, setPlaySessionId] = useState<string>(generateRandomId());

    const { data: item, isLoading, error } = useItem(itemId, true);
    const {
        data: mediaSegments,
        isLoading: isLoadingMediaSegments,
        error: mediaSegmentsError,
    } = useMediaSegments(itemId);
    const { reportProgress } = useReportPlaybackProgress();
    const { startPlayback } = usePlaybackStart();
    const { stopPlayback } = usePlaybackStop();

    const posterUrl = useMemo(() => {
        if (!item?.Id) return undefined;
        return getPrimaryImageUrl(item?.Id);
    }, [item?.Id]);

    const handleFullscreen = () => {
        if (!containerRef.current) return;
        if (containerRef.current.requestFullscreen) {
            containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
            (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) {
            (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
            (containerRef.current as any).msRequestFullscreen();
        }
    };

    useEffect(() => {
        if (!itemId || !player) return;

        // Report playback start
        startPlayback(itemId);

        // Report playback progress every 5 seconds
        progressReportingIntervalRef.current = setInterval(() => {
            if (!player || player.isDisposed?.()) return;

            try {
                const currentTime = player.currentTime() || 0;
                const positionTicks = Math.floor(currentTime * 10000000); // Convert to ticks
                const isPaused = player.paused();

                lastPositionRef.current = positionTicks;

                reportProgress({
                    itemId,
                    positionTicks,
                    isPaused,
                });
            } catch (error) {
                console.error('Error reporting progress:', error);
            }
        }, 5000);

        return () => {
            // Clear interval first
            if (progressReportingIntervalRef.current) {
                clearInterval(progressReportingIntervalRef.current);
            }

            // Here we need the last know position since the player might be already in the shadow realm
            stopPlayback({ itemId, positionTicks: lastPositionRef.current });
        };
    }, [itemId, player, reportProgress, startPlayback, stopPlayback]);

    const handleAudioTrackChange = (index: number) => {
        setPlaySessionId(generateRandomId());
        setAudioTrackIndex(index);
    };

    if (isLoading || isLoadingMediaSegments) {
        return <p>Loading...</p>;
    }

    if (error || mediaSegmentsError) {
        return <p>Error loading item: {error?.message || mediaSegmentsError?.message}</p>;
    }

    if (!item) {
        return <p>Item not found</p>;
    }

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-black flex overflow-hidden">
            <VideoPlayer
                src={getVideoStreamUrl(itemId!, {
                    audioStreamIndex: audioTrackIndex,
                    playSessionId: playSessionId,
                })}
                poster={posterUrl}
                onReady={setPlayer}
                startTicks={item.UserData?.PlaybackPositionTicks || 0}
            />
            <PlayerControls
                item={item}
                player={player}
                audioTrackIndex={audioTrackIndex}
                onAudioTrackChange={handleAudioTrackChange}
                onFullscreen={handleFullscreen}
                mediaSegments={mediaSegments}
            />
        </div>
    );
};

export default PlayerPage;
