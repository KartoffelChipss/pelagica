import { CircleQuestionMark } from 'lucide-react';
import Page from '../Page';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

const NotFoundPage = () => {
    return (
        <Page title="404 - Not Found" className="min-h-full flex items-center justify-center">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <CircleQuestionMark />
                    </EmptyMedia>
                    <EmptyTitle>Page Not Found</EmptyTitle>
                    <EmptyDescription>This page does not exist.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button asChild>
                        <Link to="/">Go to Home Page</Link>
                    </Button>
                </EmptyContent>
            </Empty>
        </Page>
    );
};

export default NotFoundPage;
