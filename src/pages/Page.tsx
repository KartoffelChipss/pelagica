import AppSidebar from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { type PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCurrentUser } from '@/hooks/api/useCurrentUser';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getServerUrl } from '@/utils/localstorageCredentials';

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

function serverUrlToDomain(url: string) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname;
    } catch {
        return url;
    }
}

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
    const { isLoading, isError } = useCurrentUser();
    const serverUrl = getServerUrl();
    const serverDomain = serverUrl ? serverUrlToDomain(serverUrl) : null;

    useEffect(() => {
        if (title) document.title = title;
    }, [title]);

    useEffect(() => {
        if (requiresAuth && !isLoggedIn()) {
            navigate('/login', { replace: true });
        }
    }, [requiresAuth, navigate]);

    // show loading while checking auth on protected pages
    if (requiresAuth && isLoading) return null;

    // if auth check failed and we're on a protected page, don't render
    if (requiresAuth && isError) return null;

    if (requiresAuth && !isLoggedIn()) return null;

    return (
        <SidebarProvider
            className={`relative min-h-dvh h-dvh ${containerClassName ?? ''}`}
            defaultOpen={false}
        >
            {bgItem}
            {sidebar && <AppSidebar />}
            <div className="relative w-full flex flex-col overflow-x-hidden overflow-y-auto h-dvh md:h-[calc(100dvh-2rem)] px-4 my-0 md:my-4 z-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground [&::-webkit-scrollbar-thumb]:rounded-full">
                {sidebar && breadcrumbs ? (
                    <div className="flex items-center gap-2 mb-4">
                        <SidebarTrigger />
                        {breadcrumbs}
                    </div>
                ) : (
                    <div className="flex items-center justify-between py-4 md:hidden">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="rounded-lg">{'PE'}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">Pelagica</span>
                                {serverDomain && (
                                    <span className="truncate text-xs font-normal text-muted-foreground">
                                        {serverDomain}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button asChild size={'icon'} variant={'ghost'}>
                            <SidebarTrigger />
                        </Button>
                    </div>
                )}
                <main className={`w-full ${className ?? ''}`}>{children}</main>
            </div>
        </SidebarProvider>
    );
};

export default Page;
