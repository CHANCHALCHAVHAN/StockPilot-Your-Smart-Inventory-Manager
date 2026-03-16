import { useState, useMemo } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useCategoryStore } from "@/store/categoryStore";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { ReorderModal } from "@/components/ReorderModal";
import {
  Package, AlertTriangle, ArrowDownToLine, Truck,
  ArrowLeftRight, ShoppingCart, X, RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DocType = 'all' | 'IN' | 'OUT';
type StatusFilter = 'all' | 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled';

const Dashboard = () => {
  const { products, operations } = useInventoryStore();
  const { warehouses } = useSettingsStore();
  const { categories } = useCategoryStore();
  const today = new Date().toISOString().split('T')[0];

  // ── Filters ──────────────────────────────────────────────────────────────
  const [docType,   setDocType]   = useState<DocType>('all');
  const [status,    setStatus]    = useState<StatusFilter>('all');
  const [warehouse, setWarehouse] = useState<string>('all');
  const [category,  setCategory]  = useState<string>('all');

  const resetFilters = () => {
    setDocType('all'); setStatus('all'); setWarehouse('all'); setCategory('all');
  };
  const hasActiveFilter = docType !== 'all' || status !== 'all' || warehouse !== 'all' || category !== 'all';

  // ── Reorder modal ─────────────────────────────────────────────────────────
  const [reorderProduct, setReorderProduct] = useState<typeof products[0] | null>(null);

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredOps = useMemo(() => {
    return operations.filter(op => {
      if (docType !== 'all' && op.type !== docType) return false;
      if (status !== 'all' && op.status !== status) return false;
      if (warehouse !== 'all') {
        const wh = warehouses.find(w => w.id === warehouse);
        if (wh && op.from !== wh.name && op.to !== wh.name) return false;
      }
      if (category !== 'all') {
        const hasCategory = op.products.some(opProd => {
          const prod = products.find(p => p.id === opProd.productId);
          return prod?.category === category;
        });
        if (!hasCategory) return false;
      }
      return true;
    });
  }, [operations, products, warehouses, docType, status, warehouse, category]);

  const filteredProducts = useMemo(() => {
    if (category === 'all') return products;
    return products.filter(p => p.category === category);
  }, [products, category]);

  const totalStock      = filteredProducts.reduce((sum, p) => sum + p.stock, 0);
  const reorderItems    = filteredProducts.filter(p => p.reorderFlag);
  const receipts        = filteredOps.filter(o => o.type === 'IN');
  const deliveries      = filteredOps.filter(o => o.type === 'OUT');
  const pendingReceipts  = receipts.filter(o => o.status !== 'Done' && o.status !== 'Cancelled');
  const pendingDeliveries = deliveries.filter(o => o.status !== 'Done' && o.status !== 'Cancelled');
  const lateReceipts    = pendingReceipts.filter(o => o.scheduledDate < today);
  const lateDeliveries  = pendingDeliveries.filter(o => o.scheduledDate < today);
  const waitingReceipts = pendingReceipts.filter(o => o.status === 'Waiting');
  const waitingDeliveries = pendingDeliveries.filter(o => o.status === 'Waiting');
  const scheduledTransfers = filteredOps.filter(
    o => o.status !== 'Done' && o.status !== 'Cancelled' && o.scheduledDate > today
  ).length;

  return (
    <div className="space-y-5">

      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center p-3 rounded-sm border border-border bg-card">
        <span className="text-xs font-mono uppercase text-muted-foreground mr-1">Filters:</span>

        <Select value={docType} onValueChange={v => setDocType(v as DocType)}>
          <SelectTrigger className="h-7 w-[130px] font-mono text-xs">
            <SelectValue placeholder="Doc Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="IN">Receipts</SelectItem>
            <SelectItem value="OUT">Deliveries</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={v => setStatus(v as StatusFilter)}>
          <SelectTrigger className="h-7 w-[120px] font-mono text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(['Draft','Waiting','Ready','Done','Cancelled'] as StatusFilter[]).map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={warehouse} onValueChange={setWarehouse}>
          <SelectTrigger className="h-7 w-[150px] font-mono text-xs">
            <SelectValue placeholder="Warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            {warehouses.map(w => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-7 w-[150px] font-mono text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilter && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 font-mono text-xs text-muted-foreground hover:text-primary gap-1">
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}

        {hasActiveFilter && (
          <Badge variant="secondary" className="font-mono text-xs ml-auto">
            {filteredOps.length} operations matched
          </Badge>
        )}
      </div>

      {/* ── Reorder Alert Banner ───────────────────────────────────────── */}
      {reorderItems.length > 0 && (
        <div className="rounded-sm border border-primary/40 bg-primary/5 red-glow p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary animate-pulse-red" />
            <span className="text-sm font-mono font-semibold text-primary uppercase tracking-wider">
              Reorder Required — {reorderItems.length} product{reorderItems.length > 1 ? 's' : ''} below threshold
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {reorderItems.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-sm border border-border bg-card"
              >
                <div className="min-w-0">
                  <p className="text-sm font-mono truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-xs font-mono text-primary font-bold">
                      Stock: {p.stock}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      / Min: {p.minStockThreshold}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReorderProduct(p)}
                  className="h-7 font-mono text-xs ml-2 shrink-0 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <ShoppingCart className="h-3 w-3 mr-1" /> Reorder
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Stock"          value={totalStock.toLocaleString()}  icon={Package} />
        <KPICard title="Reorder Needed"       value={reorderItems.length}          icon={AlertTriangle} alert={reorderItems.length > 0} />
        <KPICard title="Pending Receipts"     value={pendingReceipts.length}       icon={ArrowDownToLine} />
        <KPICard title="Pending Deliveries"   value={pendingDeliveries.length}     icon={Truck} />
        <KPICard title="Scheduled Transfers"  value={scheduledTransfers}           icon={ArrowLeftRight} />
      </div>

      {/* ── Receipts & Deliveries Summary ─────────────────────────────── */}
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
                <span className="text-muted-foreground">{receipts.length} total operations</span>
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
                <span className="text-muted-foreground">{deliveries.length} total operations</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Reorder Modal ──────────────────────────────────────────────── */}
      {reorderProduct && (
        <ReorderModal
          product={reorderProduct}
          onClose={() => setReorderProduct(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
