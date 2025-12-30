import { type PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router';

interface PageProps {
    title?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    requiresAuth?: boolean;
}

const isLoggedIn = () => {
    return Boolean(localStorage.getItem('jf_token'));
};

const Page = ({
    children,
    title,
    header,
    footer,
    className,
    containerClassName,
    requiresAuth = false,
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
        <div className={`flex flex-col min-h-full ${containerClassName ?? ''}`}>
            {header}
            <main className={`flex-1 px-4 ${className ?? ''}`}>{children}</main>
            {footer}
        </div>
    );
};

export default Page;
