import {
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

const formatTime = (timeTicks: number) => {
    const timeSeconds = timeTicks / 10000000;
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = Math.floor(timeSeconds % 60)
        .toString()
        .padStart(2, '0');
    return `${minutes}:${seconds}`;
};

const MusicPlayerBar = () => {
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
    if (!currentTrack) return null;

    const currentTimeSeconds = currentTime / 10000000;
    const durationSeconds = duration / 10000000;

    return (
        <div className="p-1 sticky bottom-0">
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
