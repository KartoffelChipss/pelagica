import { ChevronsUpDown, Laptop, LogOut, Moon, Sun } from 'lucide-react';
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
import { getUserProfileImage } from '@/api/getUserProfileImage';
import { useNavigate } from 'react-router';
import { logout } from '@/api/logout';
import { getApi } from '@/api/getApi';
import { useTheme } from './theme-provider';

export function NavUser() {
    const navigate = useNavigate();
    const { isMobile } = useSidebar();
    const { theme, setTheme } = useTheme();
    const { data: user } = useCurrentUser();

    if (!user?.Id) return null;

    const profileImageUrl = getUserProfileImage(user.Id);
    const userName = user?.Name || 'Unknown User';

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
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-md leading-tight">
                                    <span className="truncate font-medium">{userName}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
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
                                    Switch Theme
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
                                    Light
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('dark')}>
                                    <Moon className="text-muted-foreground" />
                                    Dark
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('system')}>
                                    <Laptop className="text-muted-foreground" />
                                    System
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenuItem
                            onClick={() => {
                                logout(getApi());
                                navigate('/login', { replace: true });
                            }}
                        >
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
