import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';
import HomePage from './pages/Home/HomePage.tsx';
import LoginPage from './pages/Login/LoginPage.tsx';

import './index.css';
import './i18n.ts';
import LibraryPage from './pages/Library/LibraryPage.tsx';
import { SearchProvider } from './context/SearchProvider.tsx';
import { SearchCommand } from './components/SearchCommand.tsx';
import { KeyboardShortcuts } from './components/KeyboardShortcuts.tsx';
import ItemPage from './pages/Item/ItemPage.tsx';
import NotFoundPage from './pages/NotFound/NotFoundPage.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <SearchProvider>
                <BrowserRouter>
                    <KeyboardShortcuts />
                    <SearchCommand />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/library" element={<LibraryPage />} />
                        <Route path="/item/:itemId" element={<ItemPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </BrowserRouter>
            </SearchProvider>
        </ThemeProvider>
    </QueryClientProvider>
);
