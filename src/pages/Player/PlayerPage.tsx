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

type VideoJsPlayer = ReturnType<typeof import('video.js').default>;

const PlayerPage = () => {
    const params = useParams<{ itemId: string }>();
    const itemId = params.itemId;
    const [player, setPlayer] = useState<VideoJsPlayer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressReportingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { data: item, isLoading, error } = useItem(itemId);
    const { reportProgress } = useReportPlaybackProgress();
    const { startPlayback } = usePlaybackStart();
    const { stopPlayback } = usePlaybackStop();

    const videoUrl = useMemo(() => {
        if (!itemId) return '';
        return getVideoStreamUrl(itemId);
    }, [itemId]);

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
            const currentTime = player.currentTime() || 0;
            const positionTicks = Math.floor(currentTime * 10000000); // Convert to ticks
            const isPaused = player.paused();

            reportProgress({
                itemId,
                positionTicks,
                isPaused,
            });
        }, 5000);

        return () => {
            // Report playback stopped when unmounting
            const currentTime = player.currentTime() || 0;
            const positionTicks = Math.floor(currentTime * 10000000);
            stopPlayback({ itemId, positionTicks });

            if (progressReportingIntervalRef.current) {
                clearInterval(progressReportingIntervalRef.current);
            }
        };
    }, [itemId, player, reportProgress, startPlayback, stopPlayback]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error loading item: {error.message}</p>;
    }

    if (!item) {
        return <p>Item not found</p>;
    }

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-black flex">
            <VideoPlayer src={videoUrl} poster={posterUrl} onReady={setPlayer} />
            <PlayerControls item={item} player={player} onFullscreen={handleFullscreen} />
        </div>
    );
};

export default PlayerPage;
