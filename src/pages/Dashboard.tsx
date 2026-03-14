import { useInventoryStore } from "@/store/inventoryStore";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Package, AlertTriangle, ArrowDownToLine, Truck, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LOW_STOCK_THRESHOLD = 10;

const Dashboard = () => {
  const { products, operations } = useInventoryStore();
  const today = new Date().toISOString().split('T')[0];

  const totalProducts = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD);
  const receipts = operations.filter(o => o.type === 'IN');
  const deliveries = operations.filter(o => o.type === 'OUT');

  const pendingReceipts = receipts.filter(o => o.status !== 'Done' && o.status !== 'Cancelled');
  const pendingDeliveries = deliveries.filter(o => o.status !== 'Done' && o.status !== 'Cancelled');

  const lateReceipts = pendingReceipts.filter(o => o.scheduledDate < today);
  const waitingReceipts = pendingReceipts.filter(o => o.status === 'Waiting');
  const lateDeliveries = pendingDeliveries.filter(o => o.scheduledDate < today);
  const waitingDeliveries = pendingDeliveries.filter(o => o.status === 'Waiting');

  const scheduledTransfers = operations.filter(o => o.status !== 'Done' && o.status !== 'Cancelled' && o.scheduledDate > today).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Stock" value={totalProducts.toLocaleString()} icon={Package} />
        <KPICard title="Low Stock Items" value={lowStock.length} icon={AlertTriangle} alert={lowStock.length > 0} />
        <KPICard title="Pending Receipts" value={pendingReceipts.length} icon={ArrowDownToLine} />
        <KPICard title="Pending Deliveries" value={pendingDeliveries.length} icon={Truck} />
        <KPICard title="Scheduled Transfers" value={scheduledTransfers} icon={ArrowLeftRight} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-primary" /> Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{pendingReceipts.length} to receive</span>
                <StatusBadge status="Ready" />
              </div>
              <div className="flex justify-between">
                <span className="text-primary">{lateReceipts.length} late</span>
                <StatusBadge status="Waiting" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{waitingReceipts.length} waiting</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{receipts.length} operations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{pendingDeliveries.length} to deliver</span>
                <StatusBadge status="Ready" />
              </div>
              <div className="flex justify-between">
                <span className="text-primary">{lateDeliveries.length} late</span>
                <StatusBadge status="Waiting" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{waitingDeliveries.length} waiting</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{deliveries.length} operations</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="bg-card border-primary/30 red-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-primary flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 animate-pulse-red" /> Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {lowStock.map(p => (
                <div key={p.id} className="flex justify-between items-center p-2 rounded-sm border border-border">
                  <div>
                    <p className="text-sm font-mono">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                  </div>
                  <span className="text-primary font-mono font-bold text-sm">{p.stock}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
