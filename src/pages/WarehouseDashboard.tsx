import { useInventoryStore } from "@/store/inventoryStore";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeftRight, ArrowDownToLine, Truck, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WarehouseDashboard = () => {
  const { operations } = useInventoryStore();
  const today = new Date().toISOString().split("T")[0];

  const pending = operations.filter(o => o.status !== "Done" && o.status !== "Cancelled");
  const transfers = pending.filter(o => o.scheduledDate > today);
  const receipts  = operations.filter(o => o.type === "IN"  && o.status !== "Done" && o.status !== "Cancelled");
  const deliveries = operations.filter(o => o.type === "OUT" && o.status !== "Done" && o.status !== "Cancelled");
  const lateOps   = pending.filter(o => o.scheduledDate < today);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Pending Receipts"   value={receipts.length}   icon={ArrowDownToLine} />
        <KPICard title="Pending Deliveries" value={deliveries.length} icon={Truck} />
        <KPICard title="Scheduled Transfers" value={transfers.length} icon={ArrowLeftRight} />
        <KPICard title="Late Operations"    value={lateOps.length}    icon={SlidersHorizontal} alert={lateOps.length > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-primary" /> Pending Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receipts.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono">No pending receipts.</p>
            ) : (
              <div className="space-y-2">
                {receipts.slice(0, 5).map(op => (
                  <div key={op.id} className="flex justify-between items-center text-sm font-mono">
                    <span className="text-muted-foreground">{op.reference}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{op.scheduledDate}</span>
                      <StatusBadge status={op.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Pending Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deliveries.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono">No pending deliveries.</p>
            ) : (
              <div className="space-y-2">
                {deliveries.slice(0, 5).map(op => (
                  <div key={op.id} className="flex justify-between items-center text-sm font-mono">
                    <span className="text-muted-foreground">{op.reference}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{op.scheduledDate}</span>
                      <StatusBadge status={op.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
