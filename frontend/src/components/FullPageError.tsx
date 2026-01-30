import { TriangleAlert } from 'lucide-react';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from './ui/empty';

const FullPageError = ({
    title,
    message,
    content,
}: {
    title?: string;
    message?: string;
    content?: React.ReactNode;
}) => {
    return (
        <div className="flex h-dvh w-full flex-col items-center justify-center gap-3">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <TriangleAlert />
                    </EmptyMedia>
                    <EmptyTitle>{title ?? 'Error'}</EmptyTitle>
                    {message && <EmptyDescription>{message}</EmptyDescription>}
                </EmptyHeader>
                {content && <EmptyContent>{content}</EmptyContent>}
            </Empty>
        </div>
    );
};

export default FullPageError;
