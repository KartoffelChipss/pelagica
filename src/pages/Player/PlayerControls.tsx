import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { Slider } from '../../components/ui/slider';

interface PlayerControlsProps {
    item: BaseItemDto;
    player: ReturnType<typeof import('video.js').default> | null;
    onFullscreen?: () => void;
}

const PlayerControls = ({ item, player, onFullscreen }: PlayerControlsProps) => {
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
        };
    }, [player, volume]);

    const togglePlay = () => {
        if (!player) return;
        if (player.paused()) {
            player.play();
        } else {
            player.pause();
        }
    };

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

    const handleVolumeChange = (values: number[]) => {
        if (!player || values.length === 0) return;
        const newVolume = values[0];
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) player.muted(false);
        if (newVolume === 0 && !isMuted) player.muted(true);
        player.volume(newVolume);
    };

    const toggleMute = () => {
        if (!player) return;
        player.muted(!isMuted);
    };

    const toggleFullscreen = () => {
        onFullscreen?.();
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPercentage = duration > 0 ? (bufferedTime / duration) * 100 : 0;

    return (
        <>
            <div
                className="absolute top-4 left-4 z-20 text-gray-200 text-lg flex items-center gap-2 transition-opacity duration-300"
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
                <h1>
                    {item.SeriesName} - S{item.ParentIndexNumber}E{item.IndexNumber} - {item.Name}
                </h1>
            </div>
            <div
                className={`absolute inset-0 z-10 p-4 ${showControls ? '' : 'cursor-none'}`}
                onClick={togglePlay}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />
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
                            className="absolute bottom-4 -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded text-sm pointer-events-none"
                            style={{ left: `${hoverPosition}px` }}
                        >
                            <div className="text-center">{formatTime(hoverTime)}</div>
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
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
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
