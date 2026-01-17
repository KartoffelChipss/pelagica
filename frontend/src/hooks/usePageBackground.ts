import { useContext } from 'react';
import { PageBackgroundContext } from '@/context/pageBackgroundContext';

export const usePageBackground = () => {
    const context = useContext(PageBackgroundContext);
    if (context === undefined) {
        throw new Error('usePageBackground must be used within a PageBackgroundProvider');
    }
    return context;
};
