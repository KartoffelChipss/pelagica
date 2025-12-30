import AppSidebar from '@/components/AppSidebar';
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
        <SidebarProvider className={`min-h-screen ${containerClassName ?? ''}`} defaultOpen={false}>
            {sidebar && <AppSidebar />}
            <div className="flex flex-1 flex-col h-screen overflow-hidden px-4 py-4">
                {sidebar && (
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        {breadcrumbs}
                    </div>
                )}
                <main className={`flex-1 overflow-auto ${className ?? ''}`}>{children}</main>
            </div>
        </SidebarProvider>
    );
};

export default Page;
