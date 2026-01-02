import { createContext, useContext } from 'react';

interface SearchContextType {
    isOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) throw new Error('useSearch must be used within SearchProvider');
    return context;
};
