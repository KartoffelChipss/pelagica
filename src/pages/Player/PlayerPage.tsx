/* eslint-disable @typescript-eslint/no-explicit-any */
import { useItem } from '@/hooks/api/useItem';
import { useReportPlaybackProgress } from '@/hooks/api/usePlaybackProgress';
import { usePlaybackStart } from '@/hooks/api/usePlaybackStart';
import { usePlaybackStop } from '@/hooks/api/usePlaybackStop';
import { useParams } from 'react-router';
import VideoPlayer, { type SubtitleTrack } from '@/pages/Player/VideoPlayer';
import PlayerControls from '@/pages/Player/PlayerControls';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getPrimaryImageUrl, getVideoStreamUrl, getSubtitleUrl } from '@/utils/jellyfinUrls';
import { generateRandomId } from '@/utils/idGenerator';
import { useMediaSegments } from '@/hooks/api/useMediaSegments';
import { useNextItem } from '@/hooks/api/useNextItem';
import { getUserId } from '@/utils/localstorageCredentials';

const PLAYBACK_PROGRESS_REPORT_MIN_PLAYTIME_SECONDS = 5;
const PLAYBACK_PROGRESS_REPORT_INTERVAL_MS = 5000;

export type VideoJsPlayer = ReturnType<typeof import('video.js').default>;

const PlayerPage = () => {
    const params = useParams<{ itemId: string }>();
    const itemId = params.itemId;
    const [player, setPlayer] = useState<VideoJsPlayer | null>(null);
    const [audioTrackIndex, setAudioTrackIndex] = useState<number>(1);
    const [subtitleTrackIndex, setSubtitleTrackIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressReportingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastPositionRef = useRef<number>(0);
    const [playSessionId, setPlaySessionId] = useState<string>(generateRandomId());
    const isAudioSwitchRef = useRef(false);

    const { data: item, isLoading, error } = useItem(itemId, true);
    const {
        data: nextItem,
        isLoading: isLoadingNextItem,
        error: nextItemError,
    } = useNextItem(item, getUserId());
    const {
        data: mediaSegments,
        isLoading: isLoadingMediaSegments,
        error: mediaSegmentsError,
    } = useMediaSegments(itemId);
    const { reportProgress } = useReportPlaybackProgress();
    const { startPlayback } = usePlaybackStart();
    const { stopPlayback } = usePlaybackStop();

    // Reset everything when navigating to a new item
    useEffect(() => {
        queueMicrotask(() => {
            setPlayer(null);
            setSubtitleTrackIndex(null);
            setAudioTrackIndex(1);
            setPlaySessionId(generateRandomId());
        });
    }, [itemId]);

    const posterUrl = useMemo(() => {
        if (!item?.Id) return undefined;
        return getPrimaryImageUrl(item?.Id);
    }, [item?.Id]);

    const startTicks = item?.UserData?.PlaybackPositionTicks || 0;

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
        startPlayback({ itemId, positionTicks: startTicks });

        const reportPlayerProgress = () => {
            if (!player || player.isDisposed?.()) return;

            try {
                const currentTime = player.currentTime() || 0;
                if (currentTime <= PLAYBACK_PROGRESS_REPORT_MIN_PLAYTIME_SECONDS) return;
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
        };

        // Report playback progress every X seconds
        reportPlayerProgress();
        progressReportingIntervalRef.current = setInterval(
            reportPlayerProgress,
            PLAYBACK_PROGRESS_REPORT_INTERVAL_MS
        );

        return () => {
            // Clear interval first
            if (progressReportingIntervalRef.current) {
                clearInterval(progressReportingIntervalRef.current);
            }

            // Here we need the last know position since the player might be already in the shadow realm
            stopPlayback({ itemId, positionTicks: lastPositionRef.current });
        };
    }, [itemId, player, reportProgress, startPlayback, startTicks, stopPlayback]);

    useEffect(() => {
        lastPositionRef.current = startTicks;
    }, [startTicks]);

    const handleAudioTrackChange = (index: number) => {
        isAudioSwitchRef.current = true;
        setPlaySessionId(generateRandomId());
        setAudioTrackIndex(index);
    };

    const handleSubtitleTrackChange = (index: number | null) => {
        setSubtitleTrackIndex(index);

        if (!player) return;

        const tracks = player.textTracks();
        for (let i = 0; i < tracks.tracks_.length; i++) {
            const track = tracks.tracks_[i];
            if (index === null) {
                track.mode = 'disabled';
            } else if (i === index) {
                track.mode = 'showing';
            } else {
                track.mode = 'disabled';
            }
        }
    };

    const subtitleTracks = useMemo(() => {
        if (!item?.Id || !item?.MediaStreams) return [];

        const subtitles = item.MediaStreams.filter((s) => s.Type === 'Subtitle');

        return subtitles.map(
            (subtitle): SubtitleTrack => ({
                src: getSubtitleUrl(item.Id!, item.Id!, subtitle.Index || 0),
                srclang: subtitle.Language || 'unknown',
                label: subtitle.DisplayTitle || subtitle.Language || `Subtitle ${subtitle.Index}`,
                default: subtitle.IsDefault || false,
            })
        );
    }, [item]);

    if (isLoading || isLoadingMediaSegments || isLoadingNextItem) {
        return <p>Loading...</p>;
    }

    if (error || mediaSegmentsError || nextItemError) {
        return (
            <p>
                Error loading item:{' '}
                {error?.message || mediaSegmentsError?.message || nextItemError?.message}
            </p>
        );
    }

    if (!item) {
        return <p>Item not found</p>;
    }

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-black flex overflow-hidden">
            <VideoPlayer
                key={itemId}
                src={getVideoStreamUrl(itemId!, {
                    audioStreamIndex: audioTrackIndex,
                    playSessionId: playSessionId,
                })}
                poster={posterUrl}
                onReady={setPlayer}
                startTicks={item.UserData?.PlaybackPositionTicks || 0}
                subtitles={subtitleTracks}
                isAudioSwitchRef={isAudioSwitchRef}
            />
            <PlayerControls
                item={item}
                player={player}
                audioTrackIndex={audioTrackIndex}
                onAudioTrackChange={handleAudioTrackChange}
                subtitleTrackIndex={subtitleTrackIndex}
                onSubtitleTrackChange={handleSubtitleTrackChange}
                onFullscreen={handleFullscreen}
                mediaSegments={mediaSegments}
                nextItem={nextItem}
                srcUrl={getVideoStreamUrl(itemId!, {
                    audioStreamIndex: audioTrackIndex,
                    playSessionId: playSessionId,
                })}
                containerRef={containerRef}
            />
        </div>
    );
};

export default PlayerPage;
