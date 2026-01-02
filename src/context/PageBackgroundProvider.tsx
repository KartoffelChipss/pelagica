import { useState, type ReactNode } from 'react';
import { PageBackgroundContext } from './pageBackgroundContext';

export const PageBackgroundProvider = ({ children }: { children: ReactNode }) => {
    const [background, setBackground] = useState<ReactNode | null>(null);

    return (
        <PageBackgroundContext.Provider value={{ background, setBackground }}>
            {children}
        </PageBackgroundContext.Provider>
    );
};

export default PageBackgroundProvider;
