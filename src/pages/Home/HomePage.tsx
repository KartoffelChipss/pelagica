import { useState } from 'react';
import viteLogo from '/vite.svg';
import { Button } from '../../components/ui/button';
import Page from '../Page';
import { logout } from '@/api/logout';
import { getApi } from '@/api/getApi';
import { useNavigate } from 'react-router';
import { useUserViews } from '@/hooks/api/useMediaFolders';
import LibraryItems from './LibraryItems';

const HomePage = () => {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);

    const { data: userViews } = useUserViews();

    return (
        <Page title="Home Page" requiresAuth={true}>
            <div className="flex flex-col items-center justify-center gap-4">
                <img src={viteLogo} className="w-32 h-32" alt="Vite logo" />
                <h1 className="text-2xl font-bold">Welcome to Pelagica!</h1>
                <p className="text-center">
                    <Button onClick={() => setCount((count) => count + 1)}>Count is {count}</Button>
                </p>
                <p className="text-center">
                    Edit <code>src/pages/Home/Home.tsx</code> and save to test HMR
                </p>
                <div>
                    <h2 className="text-xl font-semibold mb-2">User Views:</h2>
                    {userViews && userViews.Items ? (
                        <>
                            {userViews.Items.map((view) => (
                                <>
                                    {view.Id && view.Name && (
                                        <LibraryItems
                                            key={view.Id}
                                            libraryId={view.Id}
                                            libraryName={view.Name}
                                        />
                                    )}
                                </>
                            ))}
                        </>
                    ) : (
                        <p>Loading user views...</p>
                    )}
                </div>
                <Button
                    onClick={() => {
                        logout(getApi());
                        navigate('/login', { replace: true });
                    }}
                >
                    Logout
                </Button>
            </div>
        </Page>
    );
};

export default HomePage;
