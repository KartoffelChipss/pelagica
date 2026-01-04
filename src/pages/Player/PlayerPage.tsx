/* eslint-disable @typescript-eslint/no-explicit-any */
import { useItem } from '@/hooks/api/useItem';
import { useParams } from 'react-router';
import VideoPlayer from '@/pages/Player/VideoPlayer';
import PlayerControls from '@/pages/Player/PlayerControls';
import { useMemo, useRef, useState } from 'react';
import { getPrimaryImageUrl, getVideoStreamUrl } from '@/utils/jellyfinUrls';

type VideoJsPlayer = ReturnType<typeof import('video.js').default>;

const PlayerPage = () => {
    const params = useParams<{ itemId: string }>();
    const itemId = params.itemId;
    const [player, setPlayer] = useState<VideoJsPlayer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: item, isLoading, error } = useItem(itemId);

    const videoUrl = useMemo(() => {
        if (!itemId) return '';
        return getVideoStreamUrl(itemId);
    }, [itemId]);

    const posterUrl = useMemo(() => {
        if (!item?.Id) return undefined;
        return getPrimaryImageUrl(item?.Id);
    }, [item?.Id]);

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

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error loading item: {error.message}</p>;
    }

    if (!item) {
        return <p>Item not found</p>;
    }

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-black flex">
            <VideoPlayer src={videoUrl} poster={posterUrl} onReady={setPlayer} />
            <PlayerControls item={item} player={player} onFullscreen={handleFullscreen} />
        </div>
    );
};

export default PlayerPage;
