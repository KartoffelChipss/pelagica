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

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, '0');
    return `${minutes}:${seconds}`;
};

interface MusicPlayerBarProps {
    itemId: string;
    title: string;
    artist: string;
    shuffle: boolean;
    onShuffleToggle: () => void;
    repeat: boolean;
    onRepeatToggle: () => void;
    isPlaying: boolean;
    onPlayPauseToggle: () => void;
    onSkipNext: () => void;
    onSkipPrevious: () => void;
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
}

const MusicPlayerBar = ({
    itemId,
    title,
    artist,
    shuffle,
    onShuffleToggle,
    repeat,
    onRepeatToggle,
    isPlaying,
    onPlayPauseToggle,
    onSkipNext,
    onSkipPrevious,
    currentTime,
    duration,
    onSeek,
    volume,
    onVolumeChange,
}: MusicPlayerBarProps) => {
    return (
        <div className="p-1 sticky bottom-0">
            <div className="bg-sidebar/90 border-sidebar-border flex justify-between items-center h-full w-full rounded-lg border shadow-sm p-3 backdrop-blur-lg">
                <div className="flex items-center gap-2 flex-1">
                    <img
                        src={getPrimaryImageUrl(itemId, {
                            width: 64,
                            height: 64,
                        })}
                        alt="Album cover"
                        className="rounded-md h-16 w-16 object-cover self-center"
                    />
                    <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-medium">{title}</span>
                        <span className="truncate text-sm font-normal text-muted-foreground">
                            {artist}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`cursor-pointer ${shuffle ? 'text-blue-500' : 'text-muted-foreground'}`}
                            onClick={onShuffleToggle}
                        >
                            <Shuffle />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={onSkipPrevious}
                        >
                            <SkipBack />
                        </Button>
                        <Button variant="default" size="icon-lg" onClick={onPlayPauseToggle}>
                            {isPlaying ? <Pause /> : <Play />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={onSkipNext}
                        >
                            <SkipForward />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`cursor-pointer ${repeat ? 'text-blue-500' : 'text-muted-foreground'}`}
                            onClick={onRepeatToggle}
                        >
                            <Repeat2 />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 w-full text-sm text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <Slider
                            className="flex-1"
                            max={duration}
                            step={1}
                            value={[currentTime]}
                            onValueChange={(value) => onSeek(value[0])}
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
                            if (volume === 0) onVolumeChange(0.5);
                            else onVolumeChange(0);
                        }}
                    >
                        {volume === 0 ? <VolumeX /> : <Volume2 />}
                    </Button>
                    <Slider
                        className="w-32"
                        max={1}
                        step={0.01}
                        value={[volume]}
                        onValueChange={(value) => onVolumeChange(value[0])}
                    />
                    <Button variant="outline" size="icon" className="cursor-pointer ml-2">
                        <XIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayerBar;
