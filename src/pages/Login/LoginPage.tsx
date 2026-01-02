import { useEffect, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useConfig } from '@/hooks/api/useConfig';

const LoginPage = () => {
    const { config } = useConfig();
    const navigate = useNavigate();
    const { t } = useTranslation('login');
    const [step, setStep] = useState<'server' | 'login'>(
        config?.serverAddress ? 'login' : 'server'
    );

    const [checkingServer, setCheckingServer] = useState(false);
    const [serverCheckError, setServerCheckError] = useState<string | null>(null);

    const login = useLogin();
    const [loggingIn, setLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    useEffect(() => {
        if (config?.serverAddress) {
            if (!config.serverAddress.trim()) return;
            if (
                !config.serverAddress.startsWith('http://') &&
                !config.serverAddress.startsWith('https://')
            ) {
                console.warn(
                    'Ignoring predefined server address: If you specify a server address in config.json, it must include http:// or https://'
                );
                return;
            }
            localStorage.setItem('jf_server', config.serverAddress);
            setStep('login');
            setServerCheckError(null);
        }
    }, [config?.serverAddress]);

    const onSubmitServer = async (e: React.FormEvent) => {
        setCheckingServer(true);

        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const serverInput = form.querySelector('#server-address') as HTMLInputElement;
        const serverAddress = serverInput?.value?.trim();

        if (!serverAddress) {
            setServerCheckError(t('please_enter_server_address'));
            setCheckingServer(false);
            return;
        }

        const servers = await jellyfin.discovery.getRecommendedServerCandidates(serverAddress);
        const best = jellyfin.discovery.findBestServer(servers);

        if (!best) {
            setServerCheckError(t('could_not_find_server'));
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

        if (!username) {
            setLoginError(t('enter_at_least_username'));
            setLoggingIn(false);
            return;
        }

        try {
            console.log('Attempting login for user:', username);
            console.log('Using server:', localStorage.getItem('jf_server') || '');
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
            setLoginError(t('login_failed'));
            setLoggingIn(false);
            console.error('Login error:', error);
        } finally {
            setLoggingIn(false);
        }
    };

    return (
        <Page
            title={t('title')}
            className="flex items-center justify-center h-full w-full"
            sidebar={false}
        >
            {step === 'server' && (
                <Card className="max-w-md w-full mx-auto -translate-y-12">
                    <CardHeader className="flex flex-col items-center">
                        <div className="mb-1 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Server size={24} className="text-gray-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {t('connect_to_jellyfin')}
                        </CardTitle>
                        <CardDescription>{t('enter_server_address')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmitServer}>
                            <Label htmlFor="server-address" className="mb-2 block font-medium">
                                {t('server_address')}
                            </Label>
                            <Input
                                id="server-address"
                                type="text"
                                placeholder="jellyfin.example.com"
                                className="w-full"
                                autoCapitalize="none"
                                autoCorrect="off"
                                inputMode="url"
                                autoFocus
                            />
                            <p className="mt-2 text-xs text-muted-foreground">{t('no_http')}</p>
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
                                        {t('connecting')}
                                    </>
                                ) : (
                                    t('connect')
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
            {step === 'login' && (
                <Card className="max-w-md w-full mx-auto -translate-y-12">
                    <CardHeader className="flex flex-col items-center">
                        <div className="mb-1 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={24} className="text-gray-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {t('login_to_jellyfin')}
                        </CardTitle>
                        <CardDescription>{t('enter_credentials')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmitLogin}>
                            <Label htmlFor="username" className="mb-2 block font-medium">
                                {t('username')}
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder={t('username')}
                                className="mb-4 w-full"
                                autoFocus
                            />
                            <Label htmlFor="password" className="mb-2 block font-medium">
                                {t('password')}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t('password')}
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
                                        {t('logging_in')}
                                    </>
                                ) : (
                                    t('login')
                                )}
                            </Button>
                            <Button
                                variant="link"
                                className="w-full mt-2"
                                onClick={() => setStep('server')}
                            >
                                {t('back_to_server')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </Page>
    );
};

export default LoginPage;
