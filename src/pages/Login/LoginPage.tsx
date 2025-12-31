import { useState } from 'react';
import Page from '../Page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import { Server, TriangleAlert, User } from 'lucide-react';
import { jellyfin } from '@/api/jellyfinClient';
import { useLogin } from '@/hooks/api/useLogin';
import { Spinner } from '@/components/ui/spinner';
import { useNavigate } from 'react-router';

const LoginPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'server' | 'login'>('server');

    const [checkingServer, setCheckingServer] = useState(false);
    const [serverCheckError, setServerCheckError] = useState<string | null>(null);

    const login = useLogin();
    const [loggingIn, setLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const onSubmitServer = async (e: React.FormEvent) => {
        setCheckingServer(true);

        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const serverInput = form.querySelector('#server-address') as HTMLInputElement;
        const serverAddress = serverInput?.value?.trim();

        if (!serverAddress) {
            setServerCheckError('Please enter a server address.');
            setCheckingServer(false);
            return;
        }

        const servers = await jellyfin.discovery.getRecommendedServerCandidates(serverAddress);
        const best = jellyfin.discovery.findBestServer(servers);

        if (!best) {
            setServerCheckError('Could not find a Jellyfin server at that address.');
            setCheckingServer(false);
            return;
        }

        console.log('Found server:', best.address);

        localStorage.setItem('jf_server', best.address);
        setStep('login');
        setServerCheckError(null);
        setCheckingServer(false);
    };

    const onSubmitLogin = async (e: React.FormEvent) => {
        setLoggingIn(true);

        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const usernameInput = form.querySelector('#username') as HTMLInputElement;
        const passwordInput = form.querySelector('#password') as HTMLInputElement;
        const username = usernameInput?.value?.trim();
        const password = passwordInput?.value?.trim();

        if (!username || !password) {
            setLoginError('Please enter both username and password.');
            setLoggingIn(false);
            return;
        }

        try {
            await login.mutateAsync({
                server: localStorage.getItem('jf_server') || '',
                username,
                password,
            });
            setLoginError(null);
            setLoggingIn(false);

            console.log('Login successful');
            navigate('/', { replace: true });
        } catch (error) {
            setLoginError('Login failed. Please check your credentials and try again.');
            setLoggingIn(false);
            console.error('Login error:', error);
        } finally {
            setLoggingIn(false);
        }
    };

    return (
        <Page
            title="Login"
            className="flex items-center justify-center min-h-screen w-full"
            sidebar={false}
        >
            {step === 'server' && (
                <Card className="max-w-md w-full mx-auto mt-10">
                    <CardHeader className="flex flex-col items-center">
                        <div className="mb-1 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Server size={24} className="text-gray-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Connect to Jellyfin</CardTitle>
                        <CardDescription>Please enter the address of your server.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmitServer}>
                            <Label htmlFor="server-address" className="mb-2 block font-medium">
                                Server Address
                            </Label>
                            <Input
                                id="server-address"
                                type="text"
                                placeholder="jellyfin.example.com"
                                className="w-full"
                                autoCapitalize="none"
                                autoCorrect="off"
                                inputMode="url"
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                You don't need to include "http://" or "https://".
                            </p>
                            {serverCheckError && (
                                <p className="mt-2 text-sm text-destructive flex items-center gap-2">
                                    <TriangleAlert size={16} />
                                    {serverCheckError}
                                </p>
                            )}
                            <Button className="w-full mt-4" type="submit" disabled={checkingServer}>
                                {checkingServer ? (
                                    <>
                                        <Spinner />
                                        Connecting...
                                    </>
                                ) : (
                                    'Connect to Server'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
            {step === 'login' && (
                <Card className="max-w-md w-full mx-auto mt-10">
                    <CardHeader className="flex flex-col items-center">
                        <div className="mb-1 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={24} className="text-gray-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Login to Jellyfin</CardTitle>
                        <CardDescription>Please enter your credentials.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmitLogin}>
                            <Label htmlFor="username" className="mb-2 block font-medium">
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Username"
                                className="mb-4 w-full"
                            />
                            <Label htmlFor="password" className="mb-2 block font-medium">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                className="w-full"
                            />
                            {loginError && (
                                <p className="mt-4 text-sm text-destructive flex items-center gap-2">
                                    <TriangleAlert size={16} />
                                    {loginError}
                                </p>
                            )}
                            <Button className="mt-4 w-full" type="submit" disabled={loggingIn}>
                                {loggingIn ? (
                                    <>
                                        <Spinner />
                                        Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </Button>
                            <Button
                                variant="link"
                                className="w-full mt-2"
                                onClick={() => setStep('server')}
                            >
                                Back to Server Address
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </Page>
    );
};

export default LoginPage;
