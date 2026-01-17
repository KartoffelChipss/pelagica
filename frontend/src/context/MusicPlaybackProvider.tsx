import { type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import {
    MusicPlaybackContext,
    type MusicPlaybackContextType,
    type MusicPlaybackTrack,
} from './MusicPlaybackContext';
import { getAudioStreamUrl } from '@/utils/jellyfinUrls';
import { usePlaybackStart } from '@/hooks/api/usePlaybackStart';
import { useReportPlaybackProgress } from '@/hooks/api/usePlaybackProgress';
import { usePlaybackStop } from '@/hooks/api/usePlaybackStop';
import { useMediaSession } from '@/hooks/useMediaSession';

const VOLUME_STORAGE_KEY = 'music_volume';
const DEFAULT_VOLUME = 0.5;

const clampVolume = (v: number) => Math.min(1, Math.max(0, v));

export const MusicPlaybackProvider = ({ children }: PropsWithChildren) => {
    const audioRef = useRef<HTMLAudioElement>(new Audio());

    const [currentTrack, setCurrentTrack] = useState<MusicPlaybackTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_VOLUME;

        const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
        const parsed = stored ? Number(stored) : DEFAULT_VOLUME;

        return Number.isFinite(parsed) ? clampVolume(parsed) : DEFAULT_VOLUME;
    });
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const [queue, setQueue] = useState<MusicPlaybackTrack[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const { startPlayback } = usePlaybackStart();
    const { reportProgress } = useReportPlaybackProgress();
    const { stopPlayback } = usePlaybackStop();

    const queueRef = useRef<MusicPlaybackTrack[]>([]);
    const currentIndexRef = useRef(-1);
    const isPlayingRef = useRef(false);
    const currentTimeRef = useRef(0);
    const originalQueueRef = useRef<MusicPlaybackTrack[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progressIntervalRef = useRef<any | null>(null);

    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);
    useEffect(() => {
        currentTimeRef.current = currentTime;
    }, [currentTime]);

    const shuffleArray = useCallback((array: MusicPlaybackTrack[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

    const toggleShuffle = useCallback(() => {
        setShuffle((prev) => {
            if (!prev && queue.length && currentTrack) {
                originalQueueRef.current ||= [...queue];

                const others = queue.filter((_, i) => i !== currentIndex);
                const shuffled = shuffleArray(others);

                const newQueue = [...queue];
                let i = 0;
                for (let idx = 0; idx < newQueue.length; idx++) {
                    if (idx !== currentIndex) newQueue[idx] = shuffled[i++];
                }
                setQueue(newQueue);
            }

            if (prev && originalQueueRef.current.length && currentTrack) {
                const originalIndex = originalQueueRef.current.findIndex(
                    (t) => t.id === currentTrack.id
                );
                setQueue([...originalQueueRef.current]);
                if (originalIndex !== -1) setCurrentIndex(originalIndex);
            }

            return !prev;
        });
    }, [queue, currentIndex, currentTrack, shuffleArray]);

    useEffect(() => {
        audioRef.current.volume = volume;
        localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
    }, [volume]);

    const internalLoadTrack = useCallback(
        (track: MusicPlaybackTrack, autoPlay = false) => {
            if (currentTrack) {
                stopPlayback({
                    itemId: currentTrack.id,
                    positionTicks: currentTimeRef.current,
                });
            }

            const audio = audioRef.current;
            audio.src = getAudioStreamUrl(track.id);
            audio.currentTime = 0;

            setCurrentTrack(track);
            setCurrentTime(0);

            startPlayback({ itemId: track.id, positionTicks: 0 });

            if (autoPlay) {
                audio.play().catch(console.error);
            }
        },
        [currentTrack, startPlayback, stopPlayback]
    );

    useEffect(() => {
        const audio = audioRef.current;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onTimeUpdate = () => setCurrentTime(Math.floor(audio.currentTime * 10_000_000));
        const onLoaded = () => setDuration(Math.floor(audio.duration * 10_000_000));

        const onEnded = () => {
            if (repeat) {
                audio.currentTime = 0;
                audio.play();
                return;
            }

            const nextIndex = currentIndexRef.current + 1;
            if (nextIndex < queueRef.current.length) {
                setCurrentIndex(nextIndex);
                internalLoadTrack(queueRef.current[nextIndex], true);
            }
        };

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('ended', onEnded);
        };
    }, [repeat, internalLoadTrack]);

    useEffect(() => {
        if (!currentTrack || !isPlaying) return;

        progressIntervalRef.current = setInterval(() => {
            reportProgress({
                itemId: currentTrack.id,
                positionTicks: currentTimeRef.current,
                isPaused: false,
            });
        }, 10_000);

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        };
    }, [currentTrack, isPlaying, reportProgress]);

    const play = useCallback(async () => {
        await audioRef.current.play();
    }, []);

    const pause = useCallback(() => {
        audioRef.current.pause();
        if (currentTrack) {
            reportProgress({
                itemId: currentTrack.id,
                positionTicks: currentTimeRef.current,
                isPaused: true,
            });
        }
    }, [currentTrack, reportProgress]);

    const togglePlayPause = useCallback(() => {
        if (isPlayingRef.current) pause();
        else play();
    }, [play, pause]);

    const seek = useCallback((ticks: number) => {
        audioRef.current.currentTime = ticks / 10_000_000;
    }, []);

    const skipNext = useCallback(() => {
        const next = currentIndexRef.current + 1;
        if (next < queueRef.current.length) {
            setCurrentIndex(next);
            internalLoadTrack(queueRef.current[next], isPlayingRef.current);
        } else if (repeat && queueRef.current.length) {
            setCurrentIndex(0);
            internalLoadTrack(queueRef.current[0], isPlayingRef.current);
        }
    }, [repeat, internalLoadTrack]);

    const skipPrevious = useCallback(() => {
        if (currentTimeRef.current > 30_000_000) {
            audioRef.current.currentTime = 0;
            return;
        }

        const prev = currentIndexRef.current - 1;
        if (prev >= 0) {
            setCurrentIndex(prev);
            internalLoadTrack(queueRef.current[prev], isPlayingRef.current);
        } else if (repeat && queueRef.current.length) {
            const last = queueRef.current.length - 1;
            setCurrentIndex(last);
            internalLoadTrack(queueRef.current[last], isPlayingRef.current);
        }
    }, [repeat, internalLoadTrack]);

    const loadTrack = useCallback(
        (track: MusicPlaybackTrack, autoPlay = false) => {
            internalLoadTrack(track, autoPlay);
        },
        [internalLoadTrack]
    );

    const loadQueue = useCallback(
        (tracks: MusicPlaybackTrack[], startIndex = 0, autoPlay = false) => {
            originalQueueRef.current = [...tracks];

            let finalQueue = tracks;
            let index = startIndex;

            if (shuffle) {
                const start = tracks[startIndex];
                const rest = shuffleArray(tracks.filter((_, i) => i !== startIndex));
                finalQueue = [start, ...rest];
                index = 0;
            }

            setQueue(finalQueue);
            setCurrentIndex(index);
            internalLoadTrack(finalQueue[index], autoPlay);
        },
        [shuffle, shuffleArray, internalLoadTrack]
    );

    const clearPlayback = useCallback(() => {
        if (currentTrack) {
            stopPlayback({
                itemId: currentTrack.id,
                positionTicks: currentTime,
            });
        }

        const audio = audioRef.current;
        audio.pause();
        audio.src = '';

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        setCurrentTrack(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setQueue([]);
        setCurrentIndex(-1);
        originalQueueRef.current = [];
    }, [currentTrack, currentTime, stopPlayback]);

    useMediaSession({
        track: currentTrack,
        isPlaying,
        currentTimeTicks: currentTime,
        durationTicks: duration,
        play,
        pause,
        seek,
        skipNext,
        skipPrevious,
    });

    const value: MusicPlaybackContextType = {
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        volume,
        setVolume,
        shuffle,
        toggleShuffle,
        repeat,
        setRepeat,
        queue,
        setQueue,
        currentIndex,
        play,
        pause,
        togglePlayPause,
        seek,
        skipNext,
        skipPrevious,
        clearPlayback,
        loadTrack,
        loadQueue,
    };

    return <MusicPlaybackContext.Provider value={value}>{children}</MusicPlaybackContext.Provider>;
};
