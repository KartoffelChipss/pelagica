import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Home, Library, Search } from 'lucide-react';
import { Link } from 'react-router';
import { NavUser } from './NavUser';
import { Avatar, AvatarFallback } from './ui/avatar';

const AppSidebar = () => {
    return (
        <Sidebar variant="floating" collapsible="icon" className="z-5">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuButton size="lg" className="cursor-default">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarFallback className="rounded-lg">{'PE'}</AvatarFallback>
                        </Avatar>
                        Pelagica
                    </SidebarMenuButton>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link to={'/'}>
                                        <Home />
                                        Home
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link to={'/library'}>
                                        <Library />
                                        Library
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link to={'/search'}>
                                        <Search />
                                        Search
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
