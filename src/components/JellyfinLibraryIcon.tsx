import type { CollectionType } from '@jellyfin/sdk/lib/generated-client/models';
import { Clapperboard, Folder, MonitorPlay, Music } from 'lucide-react';

const JellyfinLibraryIcon = ({ libraryType }: { libraryType: CollectionType | undefined }) => {
    switch (libraryType) {
        case 'movies':
            return <Clapperboard />;
        case 'tvshows':
            return <MonitorPlay />;
        case 'music':
            return <Music />;
        default:
            return <Folder />;
    }
};

export default JellyfinLibraryIcon;
