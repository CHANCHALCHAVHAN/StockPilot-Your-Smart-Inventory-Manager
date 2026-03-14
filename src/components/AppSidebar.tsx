import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  Truck,
  SlidersHorizontal,
  History,
  Settings,
  MapPin,
  UserCircle,
  LogOut,
  Warehouse,
  ChevronDown,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

const operationItems = [
  { title: "Receipts", url: "/receipts", icon: ArrowDownToLine },
  { title: "Delivery Orders", url: "/deliveries", icon: Truck },
  { title: "Inventory Adjustment", url: "/adjustments", icon: SlidersHorizontal },
];

const otherItems = [
  { title: "Products", url: "/products", icon: Package },
  { title: "Move History", url: "/history", icon: History },
];

const settingsItems = [
  { title: "Warehouse", url: "/settings/warehouse", icon: Warehouse },
  { title: "Locations", url: "/settings/locations", icon: MapPin },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);
  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderItems = (items: typeof mainItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end
            className="hover:bg-accent hover:text-accent-foreground text-sidebar-foreground"
            activeClassName="bg-sidebar-accent text-primary font-medium red-glow"
          >
            <item.icon className="mr-2 h-4 w-4" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-sm bg-primary flex items-center justify-center">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-mono font-bold text-sm tracking-wider text-foreground">
              CORE<span className="text-primary">INVENTORY</span>
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(mainItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible defaultOpen={operationItems.some(i => currentPath.startsWith(i.url))}>
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-foreground">
                {!collapsed && "Operations"}
                {!collapsed && <ChevronDown className="h-3 w-3" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderItems(operationItems)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(otherItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible defaultOpen={currentPath.startsWith('/settings')}>
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-foreground">
                {!collapsed && "Settings"}
                {!collapsed && <ChevronDown className="h-3 w-3" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderItems(settingsItems)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4 border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/profile"
                className="hover:bg-accent text-sidebar-foreground"
                activeClassName="bg-sidebar-accent text-primary"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                {!collapsed && <span>Profile</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="hover:bg-accent text-sidebar-foreground hover:text-primary cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
