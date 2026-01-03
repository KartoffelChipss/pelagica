import type { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models';
import { Clapperboard, Folder, MonitorPlay } from 'lucide-react';

const JellyfinItemKindIcon = ({
    kind,
    className,
}: {
    kind: BaseItemKind | undefined;
    className?: string;
}) => {
    switch (kind) {
        case 'Movie':
            return <Clapperboard className={className} />;
        case 'Series':
            return <MonitorPlay className={className} />;
        default:
            return <Folder className={className} />;
    }
};

export default JellyfinItemKindIcon;
