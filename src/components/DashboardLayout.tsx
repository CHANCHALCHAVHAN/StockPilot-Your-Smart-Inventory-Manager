import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useInventoryStore } from "@/store/inventoryStore";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LOW_STOCK_THRESHOLD = 10;

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/warehouse-dashboard": "Warehouse Dashboard",
  "/products": "Products",
  "/receipts": "Receipts",
  "/deliveries": "Delivery Orders",
  "/adjustments": "Inventory Adjustment",
  "/history": "Move History",
  "/settings/warehouse": "Warehouse Settings",
  "/settings/locations": "Location Settings",
  "/profile": "Profile",
};

export function DashboardLayout() {
  const location = useLocation();
  const products = useInventoryStore(s => s.products);
  const lowStockCount = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD).length;
  const title = pageTitles[location.pathname] || "CoreInventory";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <h1 className="text-sm font-mono font-semibold uppercase tracking-wider">{title}</h1>
            </div>
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1 font-mono text-xs animate-pulse-red">
                <AlertTriangle className="h-3 w-3" />
                {lowStockCount} Low Stock
              </Badge>
            )}
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
