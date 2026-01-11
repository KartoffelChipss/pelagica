import {
    Bolt,
    ChartLine,
    ChevronsUpDown,
    Check,
    ExternalLink,
    Globe,
    Laptop,
    LogOut,
    Moon,
    Sun,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUser } from '@/hooks/api/useCurrentUser';
import { useNavigate } from 'react-router';
import { logout } from '@/api/logout';
import { getApi } from '@/api/getApi';
import { useTheme } from './theme-provider';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@/hooks/api/useConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useUpdateUserConfiguration } from '@/hooks/api/playbackPreferences/useUpdateUserConfiguration';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { iso6392 } from 'iso-639-2';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Label } from '@radix-ui/react-dropdown-menu';
import { getUserProfileImageUrl } from '@/utils/jellyfinUrls';

const FlagIcon = ({ countryCode }: { countryCode: string }) => {
    const flagUrl = `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
    return (
        <img src={flagUrl} className="inline h-4 w-6 object-cover" alt={`${countryCode} Flag`} />
    );
};

const LanguageCombobox = ({
    onSelect,
    selected,
    open,
    onOpenChange,
}: {
    onSelect: (code: string) => void;
    selected: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    const { t } = useTranslation('sidebar');
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded="false"
                    className="w-full justify-between"
                >
                    {iso6392.find(
                        (lang) => lang.iso6392T === selected || lang.iso6392B === selected
                    )
                        ? `${
                              iso6392.find(
                                  (lang) => lang.iso6392T === selected || lang.iso6392B === selected
                              )!.name
                          } (${selected})`
                        : t('select_language')}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-70 max-w-full p-0">
                <Command>
                    <CommandInput placeholder="Search language..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                            {iso6392
                                .slice()
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((lang) => {
                                    const code = lang.iso6392T || lang.iso6392B;

                                    return (
                                        <CommandItem
                                            key={code}
                                            value={lang.name}
                                            onSelect={() => onSelect(code)}
                                        >
                                            {lang.name} ({code})
                                            <Check
                                                className={cn(
                                                    'ml-auto',
                                                    selected === code ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                        </CommandItem>
                                    );
                                })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export function NavUser() {
    const { t } = useTranslation('sidebar');
    const navigate = useNavigate();
    const { isMobile } = useSidebar();
    const { theme, setTheme } = useTheme();
    const { data: user } = useCurrentUser();
    const { config } = useConfig();
    const updateUserConfiguration = useUpdateUserConfiguration();
    const [audioLanguageOpen, setAudioLanguageOpen] = useState(false);
    const [subtitleLanguageOpen, setSubtitleLanguageOpen] = useState(false);

    if (!user?.Id) return null;

    const profileImageUrl = getUserProfileImageUrl(user.Id);
    const userName = user?.Name || t('unknown_user');

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={profileImageUrl}
                                    alt={userName + ' profile image'}
                                />
                                <AvatarFallback className="rounded-lg">
                                    {userName
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-md leading-tight">
                                <span className="truncate font-medium">{userName}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={profileImageUrl}
                                        alt={userName + ' profile image'}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {userName
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-md leading-tight">
                                    <span className="truncate font-medium">{userName}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        {config && config.streamystatsUrl && config.showStreamystatsButton && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    asChild
                                    onClick={() => {
                                        window.open(config.streamystatsUrl, '_blank');
                                    }}
                                >
                                    <div>
                                        <ChartLine className="text-muted-foreground" />
                                        Streamystats
                                        <ExternalLink className="ml-auto inline size-4 text-muted-foreground" />
                                    </div>
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                    {theme === 'light' ? (
                                        <Sun className="text-muted-foreground" />
                                    ) : theme === 'dark' ? (
                                        <Moon className="text-muted-foreground" />
                                    ) : (
                                        <Laptop className="text-muted-foreground" />
                                    )}
                                    {t('theme')}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side={isMobile ? 'bottom' : 'right'}
                                align="start"
                                sideOffset={4}
                            >
                                <DropdownMenuItem onClick={() => setTheme('light')}>
                                    <Sun className="text-muted-foreground" />
                                    {t('light')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('dark')}>
                                    <Moon className="text-muted-foreground" />
                                    {t('dark')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('system')}>
                                    <Laptop className="text-muted-foreground" />
                                    {t('system')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                    <Globe className="text-muted-foreground" />
                                    {t('language')}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side={isMobile ? 'bottom' : 'right'}
                                align="start"
                                sideOffset={4}
                            >
                                <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
                                    <FlagIcon countryCode="us" />
                                    English
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => i18n.changeLanguage('de')}>
                                    <FlagIcon countryCode="de" />
                                    Deutsch
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => i18n.changeLanguage('pt')}>
                                    <FlagIcon countryCode="pt" />
                                    Português
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => i18n.changeLanguage('ja')}>
                                    <FlagIcon countryCode="jp" />
                                    日本語
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Dialog>
                            <DialogTrigger asChild>
                                <SidebarMenuButton>
                                    <Bolt className="text-muted-foreground" />
                                    {t('preferences')}
                                </SidebarMenuButton>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t('preferences')}</DialogTitle>
                                </DialogHeader>
                                <div>
                                    <Label className="mb-2 text-sm font-medium">
                                        {t('audio_language_preference')}
                                    </Label>
                                    <LanguageCombobox
                                        selected={user.Configuration?.AudioLanguagePreference || ''}
                                        onSelect={(code) => {
                                            updateUserConfiguration.mutate({
                                                userId: user.Id!,
                                                playbackPreferences: {
                                                    AudioLanguagePreference: code,
                                                },
                                            });
                                            setAudioLanguageOpen(false);
                                        }}
                                        open={audioLanguageOpen}
                                        onOpenChange={setAudioLanguageOpen}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 text-sm font-medium">
                                        {t('subtitle_language_preference')}
                                    </Label>
                                    <LanguageCombobox
                                        selected={
                                            user.Configuration?.SubtitleLanguagePreference || ''
                                        }
                                        onSelect={(code) => {
                                            updateUserConfiguration.mutate({
                                                userId: user.Id!,
                                                playbackPreferences: {
                                                    SubtitleLanguagePreference: code,
                                                },
                                            });
                                            setSubtitleLanguageOpen(false);
                                        }}
                                        open={subtitleLanguageOpen}
                                        onOpenChange={setSubtitleLanguageOpen}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                        <DropdownMenuItem
                            onClick={() => {
                                logout(getApi());
                                navigate('/login', { replace: true });
                            }}
                        >
                            <LogOut />
                            {t('logout')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
