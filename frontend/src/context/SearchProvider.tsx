import { useState, type ReactNode } from 'react';
import { SearchContext } from './SearchContext';

export const SearchProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <SearchContext.Provider
            value={{
                isOpen,
                openSearch: () => setIsOpen(true),
                closeSearch: () => setIsOpen(false),
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};
