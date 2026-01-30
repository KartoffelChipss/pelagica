import { Loader2 } from 'lucide-react';

const FullPageLoader = ({ message }: { message?: string }) => {
    return (
        <div className="flex h-dvh w-full flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
};

export default FullPageLoader;
