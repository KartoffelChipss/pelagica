import { createContext, type ReactNode } from 'react';

export interface PageBackgroundContextType {
    background: ReactNode | null;
    setBackground: (background: ReactNode | null) => void;
}

export const PageBackgroundContext = createContext<PageBackgroundContextType | undefined>(
    undefined
);
