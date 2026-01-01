import AppSidebar from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { type PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router';

interface PageProps {
    title?: string;
    className?: string;
    containerClassName?: string;
    requiresAuth?: boolean;
    sidebar?: boolean;
    breadcrumbs?: React.ReactNode;
    bgItem?: React.ReactNode;
}

const isLoggedIn = () => {
    return Boolean(localStorage.getItem('jf_token'));
};

const Page = ({
    children,
    title,
    className,
    containerClassName,
    requiresAuth = false,
    sidebar = true,
    breadcrumbs,
    bgItem,
}: PropsWithChildren<PageProps>) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (title) document.title = title;
    }, [title]);

    useEffect(() => {
        if (requiresAuth && !isLoggedIn()) {
            navigate('/login', { replace: true });
        }
    }, [requiresAuth, navigate]);

    if (requiresAuth && !isLoggedIn()) {
        return null;
    }

    return (
        <SidebarProvider
            className={`relative min-h-screen ${containerClassName ?? ''}`}
            defaultOpen={false}
        >
            {bgItem}
            {sidebar && <AppSidebar />}
            <div className="relative flex flex-col overflow-x-hidden overflow-y-auto h-[calc(100vh-2rem)] px-4 my-4 z-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground [&::-webkit-scrollbar-thumb]:rounded-full">
                {sidebar && breadcrumbs ? (
                    <div className="flex items-center gap-2 mb-4">
                        <SidebarTrigger />
                        {breadcrumbs}
                    </div>
                ) : (
                    <Button className="mb-4 md:hidden" asChild size={'icon'} variant={'ghost'}>
                        <SidebarTrigger />
                    </Button>
                )}
                <main className={`w-full ${className ?? ''}`}>{children}</main>
            </div>
        </SidebarProvider>
    );
};

export default Page;
