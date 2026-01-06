import { useEffect } from 'react';

interface PlayerKeyboardControlsConfig {
    togglePlay: () => void;
    toggleMute: () => void;
    toggleFullscreen: () => void;
    togglePiP: () => void;
    handleSeekBackward: () => void;
    handleSeekForward: () => void;
}

export const usePlayerKeyboardControls = ({
    togglePlay,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    handleSeekBackward,
    handleSeekForward,
}: PlayerKeyboardControlsConfig) => {
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            switch (e.key) {
                case ' ':
                case 'k':
                case 'K':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'm':
                case 'M':
                    toggleMute();
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen();
                    break;
                case 'p':
                case 'P':
                    togglePiP();
                    break;
                case 'ArrowLeft':
                    handleSeekBackward();
                    break;
                case 'ArrowRight':
                    handleSeekForward();
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [
        togglePlay,
        toggleMute,
        toggleFullscreen,
        togglePiP,
        handleSeekBackward,
        handleSeekForward,
    ]);
};
