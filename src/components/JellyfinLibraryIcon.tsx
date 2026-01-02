import type { CollectionType } from '@jellyfin/sdk/lib/generated-client/models';
import { Clapperboard, Folder, MonitorPlay } from 'lucide-react';

const JellyfinLibraryIcon = ({ libraryType }: { libraryType: CollectionType | undefined }) => {
    switch (libraryType) {
        case 'movies':
            return <Clapperboard />;
        case 'tvshows':
            return <MonitorPlay />;
        default:
            return <Folder />;
    }
};

export default JellyfinLibraryIcon;
