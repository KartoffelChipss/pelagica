import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    ArrowLeft,
    PictureInPicture2,
    AudioLines,
    SkipForward,
    Subtitles,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router';
import type {
    BaseItemDto,
    MediaSegmentDto,
    MediaSegmentType,
} from '@jellyfin/sdk/lib/generated-client/models';
import { Slider } from '../../components/ui/slider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatPlayTime, ticksToSeconds } from '@/utils/timeConversion';
import { useTranslation } from 'react-i18next';
import { usePlayerKeyboardControls } from '@/hooks/usePlayerKeyboardControls';

interface PlayerControlsProps {
    item: BaseItemDto;
    player: ReturnType<typeof import('video.js').default> | null;
    audioTrackIndex: number | null;
    onAudioTrackChange: (index: number) => void;
    subtitleTrackIndex: number | null;
    onSubtitleTrackChange: (index: number | null) => void;
    onFullscreen?: () => void;
    mediaSegments?: MediaSegmentDto[];
}

const PlayerControls = ({
    item,
    player,
    audioTrackIndex,
    onAudioTrackChange,
    subtitleTrackIndex,
    onSubtitleTrackChange,
    onFullscreen,
    mediaSegments,
}: PlayerControlsProps) => {
    const { t } = useTranslation('player');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [bufferedTime, setBufferedTime] = useState(0);
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem('playerVolume');
        return saved ? parseFloat(saved) : 1;
    });
    const [isMuted, setIsMuted] = useState(false);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverPosition, setHoverPosition] = useState<number>(0);
    const [showControls, setShowControls] = useState(true);
    const [isPiP, setIsPiP] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetHideTimeout = () => {
        setShowControls(true);
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    const handleMouseMove = () => {
        resetHideTimeout();
    };

    const handleMouseLeave = () => {
        setShowControls(false);
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }
    };

    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('playerVolume', volume.toString());
    }, [volume]);

    useEffect(() => {
        if (!player) return;

        player.volume(volume);

        const updatePlayState = () => setIsPlaying(!player.paused());
        const updateTime = () => setCurrentTime(player.currentTime() || 0);
        const updateDuration = () => setDuration(player.duration() || 0);
        const updateMuted = () => setIsMuted(player.muted() || false);
        const updateBuffered = () => {
            const buffered = player.buffered();
            if (buffered && buffered.length > 0) {
                setBufferedTime(buffered.end(buffered.length - 1));
            }
        };

        // PiP event listeners
        const videoEl = player.el()?.querySelector('video');
        const handleEnterPiP = () => setIsPiP(true);
        const handleLeavePiP = () => setIsPiP(false);
        if (videoEl) {
            videoEl.addEventListener('enterpictureinpicture', handleEnterPiP);
            videoEl.addEventListener('leavepictureinpicture', handleLeavePiP);
        }

        player.on('play', updatePlayState);
        player.on('pause', updatePlayState);
        player.on('timeupdate', updateTime);
        player.on('timeupdate', updateBuffered);
        player.on('loadedmetadata', updateDuration);
        player.on('progress', updateBuffered);
        player.on('volumechange', updateMuted);

        return () => {
            player.off('play', updatePlayState);
            player.off('pause', updatePlayState);
            player.off('timeupdate', updateTime);
            player.off('timeupdate', updateBuffered);
            player.off('loadedmetadata', updateDuration);
            player.off('progress', updateBuffered);
            player.off('volumechange', updateMuted);

            if (videoEl) {
                videoEl.removeEventListener('enterpictureinpicture', handleEnterPiP);
                videoEl.removeEventListener('leavepictureinpicture', handleLeavePiP);
            }
        };
    }, [player, volume]);

    const togglePlay = useCallback(() => {
        if (!player) return;
        if (player.paused()) {
            player.play();
        } else {
            player.pause();
        }
    }, [player]);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!player || !progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        player.currentTime(percentage * duration);
    };

    const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        setHoverTime(percentage * duration);
        setHoverPosition(x);
    };

    const handleProgressLeave = () => {
        setHoverTime(null);
    };

    const togglePiP = useCallback(async () => {
        if (!player) return;
        const videoEl = player.el()?.querySelector('video');
        if (!videoEl) return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled) {
                await videoEl.requestPictureInPicture();
            }
        } catch (error) {
            console.error('Error toggling PiP:', error);
        }
    }, [player]);

    const handleVolumeChange = (values: number[]) => {
        if (!player || values.length === 0) return;
        const newVolume = values[0];
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) player.muted(false);
        if (newVolume === 0 && !isMuted) player.muted(true);
        player.volume(newVolume);
    };

    const toggleMute = useCallback(() => {
        if (!player) return;
        player.muted(!isMuted);
    }, [player, isMuted]);

    const toggleFullscreen = useCallback(() => {
        onFullscreen?.();
    }, [onFullscreen]);

    const handleAudioTrackChange = (value: string) => {
        const index = parseInt(value, 10);
        onAudioTrackChange(index);
    };

    const handleSubtitleTrackChange = (value: string) => {
        if (value === 'off') {
            onSubtitleTrackChange(null);
        } else {
            const index = parseInt(value, 10);
            onSubtitleTrackChange(index);
        }
    };

    const getMediaSegment = (type: MediaSegmentType) => {
        if (!mediaSegments || mediaSegments.length === 0) return null;
        return mediaSegments.find((segment) => segment.Type === type) || null;
    };

    const handleSkipSegment = (type: MediaSegmentType) => {
        if (!player) return;
        const segment = getMediaSegment(type);
        if (segment?.EndTicks) {
            const endSeconds = ticksToSeconds(segment.EndTicks);
            player.currentTime(endSeconds);
        }
    };

    const handleSeekBackward = useCallback(() => {
        if (!player) return;
        const newTime = Math.max(0, (player.currentTime() || 0) - 10);
        player.currentTime(newTime);
    }, [player]);

    const handleSeekForward = useCallback(() => {
        if (!player) return;
        const newTime = Math.min(duration, (player.currentTime() || 0) + 10);
        player.currentTime(newTime);
    }, [player, duration]);

    usePlayerKeyboardControls({
        togglePlay,
        toggleMute,
        toggleFullscreen,
        togglePiP,
        handleSeekBackward,
        handleSeekForward,
    });

    const introSegment = getMediaSegment('Intro');
    const showSkipIntroButton =
        introSegment &&
        introSegment.StartTicks != null &&
        introSegment.EndTicks != null &&
        currentTime > ticksToSeconds(introSegment.StartTicks) &&
        currentTime < ticksToSeconds(introSegment.EndTicks);

    const outtroSegment = getMediaSegment('Outro');
    const showSkipOutroButton =
        outtroSegment &&
        outtroSegment.StartTicks != null &&
        outtroSegment.EndTicks != null &&
        currentTime > ticksToSeconds(outtroSegment.StartTicks) &&
        currentTime < ticksToSeconds(outtroSegment.EndTicks);

    const clampedCurrentTime = duration > 0 ? Math.min(currentTime, duration) : currentTime;
    const progressPercentage = Math.min(
        100,
        duration > 0 ? (clampedCurrentTime / duration) * 100 : 0
    );
    const bufferedPercentage = Math.min(100, duration > 0 ? (bufferedTime / duration) * 100 : 0);

    const title =
        item.Type === 'Episode'
            ? `${item.SeriesName} - S${item.ParentIndexNumber}E${item.IndexNumber} - ${item.Name}`
            : item.Name;

    const audioStreams = item.MediaStreams?.filter((s) => s.Type === 'Audio') || [];
    const subtitleStreams = item.MediaStreams?.filter((s) => s.Type === 'Subtitle') || [];

    return (
        <>
            <div
                className="absolute top-0 left-0 w-full p-4 bg-linear-to-b from-black/80 to-transparent z-20 text-gray-200 text-lg flex items-center gap-2 transition-opacity duration-300"
                style={{
                    opacity: showControls ? 1 : 0,
                    pointerEvents: showControls ? 'auto' : 'none',
                }}
                onMouseMove={handleMouseMove}
            >
                <Button variant="ghost" asChild>
                    <Link to={`/item/${item.Id}`}>
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1>{title}</h1>
            </div>
            <div
                className={`absolute inset-0 z-10 p-4 ${showControls ? '' : 'cursor-none'}`}
                onClick={togglePlay}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />
            <div className="absolute bottom-28 right-8 z-30 flex gap-2">
                {showSkipIntroButton && (
                    <Button
                        variant={'default'}
                        onClick={() => handleSkipSegment('Intro')}
                        className="cursor-pointer"
                        title={t('skipIntro')}
                    >
                        <SkipForward />
                        {t('skipIntro')}
                    </Button>
                )}
                {showSkipOutroButton && (
                    <Button
                        variant={'default'}
                        onClick={() => handleSkipSegment('Outro')}
                        className="cursor-pointer"
                        title={t('skipOutro')}
                    >
                        <SkipForward />
                        {t('skipOutro')}
                    </Button>
                )}
            </div>
            <div
                className="absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black/80 to-transparent p-4 transition-opacity duration-300"
                style={{
                    opacity: showControls ? 1 : 0,
                    pointerEvents: showControls ? 'auto' : 'none',
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Progress bar */}
                <div
                    ref={progressRef}
                    className="w-full h-3 rounded cursor-pointer mb-4 transition-all relative"
                    onClick={handleProgressClick}
                    onMouseMove={handleProgressHover}
                    onMouseLeave={handleProgressLeave}
                >
                    {/* Actually visible bar that's smaller for better asthetics */}
                    <div className="absolute top-1 left-0 w-full h-1 bg-gray-600 rounded pointer-events-none z-0" />
                    {/* buffered progress */}
                    <div
                        className="absolute top-1 left-0 h-1 bg-gray-500 rounded pointer-events-none z-5"
                        style={{ width: `${bufferedPercentage}%` }}
                    />
                    {/** Bar that shows the hovered time */}
                    <div
                        className="absolute top-1 left-0 h-1 bg-white/20 rounded pointer-events-none z-10"
                        style={{
                            width: hoverTime !== null ? `${(hoverTime / duration) * 100}%` : '0%',
                        }}
                    />
                    {/* current progress */}
                    <div
                        className="absolute top-1 left-0 h-1 bg-blue-500 rounded pointer-events-none z-15"
                        style={{ width: `${progressPercentage}%` }}
                    />
                    {/* Hover preview */}
                    {hoverTime !== null && (
                        <div
                            className="absolute bottom-4 -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded text-sm pointer-events-none z-40"
                            style={{ left: `${hoverPosition}px` }}
                        >
                            <div className="text-center">{formatPlayTime(hoverTime)}</div>
                            <img
                                src={`/Items/${item.Id}/Trickplay/320/${Math.floor(hoverTime)}.jpg`}
                                alt="Preview"
                                className="w-40 h-auto rounded mt-1"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between text-white gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant={'ghost'}
                            size={'icon-lg'}
                            onClick={togglePlay}
                            className="cursor-pointer"
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </Button>
                        <div className="text-sm">
                            {formatPlayTime(clampedCurrentTime)} / {formatPlayTime(duration)}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {subtitleStreams.length > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant={'ghost'}
                                            size={'icon-lg'}
                                            className="cursor-pointer"
                                        >
                                            <Subtitles />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>{t('subtitles')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup
                                            value={subtitleTrackIndex?.toString() || 'off'}
                                            onValueChange={handleSubtitleTrackChange}
                                        >
                                            <DropdownMenuRadioItem value="off">
                                                {t('off')}
                                            </DropdownMenuRadioItem>
                                            {subtitleStreams.map((stream, index) => (
                                                <DropdownMenuRadioItem
                                                    key={index}
                                                    value={index.toString()}
                                                >
                                                    {stream.DisplayTitle ||
                                                        stream.Language ||
                                                        'Unknown'}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            {audioStreams.length > 1 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant={'ghost'}
                                            size={'icon-lg'}
                                            className="cursor-pointer"
                                        >
                                            <AudioLines />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>{t('audioTracks')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup
                                            value={audioTrackIndex?.toString() || ''}
                                            onValueChange={handleAudioTrackChange}
                                        >
                                            {audioStreams.map((stream, index) => (
                                                <DropdownMenuRadioItem
                                                    key={index}
                                                    value={stream.Index!.toString()}
                                                >
                                                    {stream.Language || 'Unknown Language'} -{' '}
                                                    {stream.Codec}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            <Button
                                variant={'ghost'}
                                size={'icon-lg'}
                                onClick={toggleMute}
                                className="cursor-pointer"
                            >
                                {isMuted ? <VolumeX /> : <Volume2 />}
                            </Button>
                            <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                value={isMuted ? [0] : [volume]}
                                onValueChange={handleVolumeChange}
                                className="w-25 cursor-pointer"
                            />
                        </div>
                        {document.pictureInPictureEnabled && (
                            <Button
                                variant={'ghost'}
                                size={'icon-lg'}
                                onClick={togglePiP}
                                className="cursor-pointer"
                                title="Picture in Picture"
                            >
                                <PictureInPicture2
                                    size={20}
                                    className={isPiP ? 'text-blue-500' : ''}
                                />
                            </Button>
                        )}
                        <Button
                            variant={'ghost'}
                            size={'icon-lg'}
                            onClick={toggleFullscreen}
                            className="cursor-pointer"
                        >
                            <Maximize size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlayerControls;
