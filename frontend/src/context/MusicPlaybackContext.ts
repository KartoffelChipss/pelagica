import { createContext } from 'react';

export interface MusicPlaybackTrack {
    id: string;
    title: string;
    artist: string;
    albumId: string;
    albumName: string;
}

export interface MusicPlaybackContextType {
    currentTrack: MusicPlaybackTrack | null;
    setCurrentTrack: (track: MusicPlaybackTrack | null) => void;

    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;

    currentTime: number;
    setCurrentTime: (time: number) => void;
    duration: number;
    setDuration: (duration: number) => void;

    volume: number;
    setVolume: (volume: number) => void;
    shuffle: boolean;
    toggleShuffle: () => void;
    repeat: boolean;
    setRepeat: (repeat: boolean) => void;

    queue: MusicPlaybackTrack[];
    setQueue: (queue: MusicPlaybackTrack[]) => void;
    currentIndex: number;

    play: () => void;
    pause: () => void;
    togglePlayPause: () => void;
    seek: (time: number) => void;
    skipNext: () => void;
    skipPrevious: () => void;
    clearPlayback: () => void;
    loadTrack: (track: MusicPlaybackTrack, autoPlay?: boolean) => void;
    loadQueue: (tracks: MusicPlaybackTrack[], startIndex?: number, autoPlay?: boolean) => void;
}

export const MusicPlaybackContext = createContext<MusicPlaybackContextType | undefined>(undefined);
