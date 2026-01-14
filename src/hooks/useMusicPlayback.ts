import { useContext } from 'react';
import {
    MusicPlaybackContext,
    type MusicPlaybackContextType,
} from '@/context/MusicPlaybackContext';

export const useMusicPlayback = (): MusicPlaybackContextType => {
    const context = useContext(MusicPlaybackContext);
    if (context === undefined) {
        throw new Error('usePlayback must be used within a MusicPlaybackProvider');
    }
    return context;
};
