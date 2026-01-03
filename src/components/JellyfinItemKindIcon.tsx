import type { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import { Clapperboard, Folder, MonitorPlay } from 'lucide-react';

const JellyfinItemKindIcon = ({ kind }: { kind: BaseItemKind | undefined }) => {
    switch (kind) {
        case 'Movie':
            return <Clapperboard />;
        case 'Series':
            return <MonitorPlay />;
        default:
            return <Folder />;
    }
};

export default JellyfinItemKindIcon;
