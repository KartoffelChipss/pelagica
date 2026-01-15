import {
    ChevronDown,
    Pause,
    Play,
    Repeat2,
    Shuffle,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    XIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { getPrimaryImageUrl } from '@/utils/jellyfinUrls';
import { useMusicPlayback } from '@/hooks/useMusicPlayback';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const formatTime = (timeTicks: number) => {
    const timeSeconds = timeTicks / 10000000;
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = Math.floor(timeSeconds % 60)
        .toString()
        .padStart(2, '0');
    return `${minutes}:${seconds}`;
};

const MusicPlayerBar = () => {
    const { t } = useTranslation('player');
    const {
        currentTrack,
        shuffle,
        toggleShuffle,
        repeat,
        setRepeat,
        isPlaying,
        togglePlayPause,
        skipNext,
        skipPrevious,
        currentTime,
        duration,
        seek,
        volume,
        setVolume,
        clearPlayback,
    } = useMusicPlayback();
    const isMobile = useIsMobile();
    const [isExpanded, setIsExpanded] = useState(false);

    if (!currentTrack) return null;

    const currentTimeSeconds = currentTime / 10000000;
    const durationSeconds = duration / 10000000;

    if (isMobile && !isExpanded) {
        return (
            <div className="p-1 sticky bottom-0 z-100">
                <div
                    className="bg-sidebar/90 border-sidebar-border flex justify-between items-center h-full w-full rounded-lg border shadow-sm p-3 backdrop-blur-lg cursor-pointer"
                    onClick={() => setIsExpanded(true)}
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img
                            src={getPrimaryImageUrl(currentTrack.id, {
                                width: 64,
                                height: 64,
                            })}
                            alt="Album cover"
                            className="rounded-md h-12 w-12 object-cover shrink-0"
                        />
                        <div className="grid flex-1 text-left leading-tight min-w-0">
                            <span className="truncate font-medium">{currentTrack.title}</span>
                            <span className="truncate text-sm font-normal text-muted-foreground">
                                {currentTrack.artist}
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePlayPause();
                        }}
                    >
                        {isPlaying ? <Pause /> : <Play />}
                    </Button>
                </div>
            </div>
        );
    }

    if (isMobile && isExpanded) {
        return (
            <div className="fixed inset-0 z-200 bg-background/95 backdrop-blur-lg flex flex-col animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center p-4 border-b">
                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
                        <ChevronDown />
                    </Button>
                    <span className="text-sm font-medium">{t('nowPlaying')}</span>
                    <Button variant="ghost" size="icon" onClick={clearPlayback}>
                        <XIcon />
                    </Button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
                    <img
                        src={getPrimaryImageUrl(currentTrack.id, {
                            width: 400,
                            height: 400,
                        })}
                        alt="Album cover"
                        className="rounded-lg w-full max-w-sm aspect-square object-cover shadow-2xl"
                    />

                    <div className="w-full max-w-sm text-center">
                        <h2 className="text-2xl font-bold truncate">{currentTrack.title}</h2>
                        <p className="text-lg text-muted-foreground truncate">
                            {currentTrack.artist}
                        </p>
                    </div>

                    <div className="w-full max-w-sm space-y-2">
                        <Slider
                            className="w-full"
                            max={durationSeconds}
                            step={0.1}
                            value={[currentTimeSeconds]}
                            onValueChange={(value) => seek(Math.floor(value[0] * 10000000))}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 w-full max-w-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={shuffle ? 'text-blue-500' : 'text-muted-foreground'}
                            onClick={toggleShuffle}
                        >
                            <Shuffle />
                        </Button>
                        <Button variant="ghost" size="icon-lg" onClick={skipPrevious}>
                            <SkipBack className="h-8 w-8" />
                        </Button>
                        <Button variant="default" size="icon-lg" onClick={togglePlayPause}>
                            {isPlaying ? (
                                <Pause className="h-8 w-8" />
                            ) : (
                                <Play className="h-8 w-8" />
                            )}
                        </Button>
                        <Button variant="ghost" size="icon-lg" onClick={skipNext}>
                            <SkipForward className="h-8 w-8" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={repeat ? 'text-blue-500' : 'text-muted-foreground'}
                            onClick={() => setRepeat(!repeat)}
                        >
                            <Repeat2 />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (volume === 0) setVolume(0.5);
                                else setVolume(0);
                            }}
                        >
                            {volume === 0 ? <VolumeX /> : <Volume2 />}
                        </Button>
                        <Slider
                            className="flex-1"
                            max={1}
                            step={0.01}
                            value={[volume]}
                            onValueChange={(value) => setVolume(value[0])}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-1 sticky bottom-0 z-100">
            <div className="bg-sidebar/90 border-sidebar-border flex justify-between items-center h-full w-full rounded-lg border shadow-sm p-3 backdrop-blur-lg">
                <div className="flex items-center gap-2 flex-1">
                    <img
                        src={getPrimaryImageUrl(currentTrack.id, {
                            width: 64,
                            height: 64,
                        })}
                        alt="Album cover"
                        className="rounded-md h-16 w-16 object-cover self-center"
                    />
                    <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-medium">{currentTrack.title}</span>
                        <span className="truncate text-sm font-normal text-muted-foreground">
                            {currentTrack.artist}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`cursor-pointer ${shuffle ? 'text-blue-500' : 'text-muted-foreground'}`}
                            onClick={toggleShuffle}
                        >
                            <Shuffle />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={skipPrevious}
                        >
                            <SkipBack />
                        </Button>
                        <Button variant="default" size="icon-lg" onClick={togglePlayPause}>
                            {isPlaying ? <Pause /> : <Play />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={skipNext}
                        >
                            <SkipForward />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`cursor-pointer ${repeat ? 'text-blue-500' : 'text-muted-foreground'}`}
                            onClick={() => setRepeat(!repeat)}
                        >
                            <Repeat2 />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 w-full text-sm text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <Slider
                            className="flex-1"
                            max={durationSeconds}
                            step={0.1}
                            value={[currentTimeSeconds]}
                            onValueChange={(value) => seek(Math.floor(value[0] * 10000000))}
                        />
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                        onClick={() => {
                            if (volume === 0) setVolume(0.5);
                            else setVolume(0);
                        }}
                    >
                        {volume === 0 ? <VolumeX /> : <Volume2 />}
                    </Button>
                    <Slider
                        className="w-32"
                        max={1}
                        step={0.01}
                        value={[volume]}
                        onValueChange={(value) => setVolume(value[0])}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        className="cursor-pointer ml-2"
                        onClick={clearPlayback}
                    >
                        <XIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayerBar;
