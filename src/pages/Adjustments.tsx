import { useState } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Adjustments = () => {
  const { products, adjustments, addAdjustment } = useInventoryStore();
  const { warehouses, locations } = useSettingsStore();
  const { toast } = useToast();

  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [countedQty, setCountedQty] = useState(0);

  const selectedProduct = products.find(p => p.id === productId);
  const adjustment = selectedProduct ? countedQty - selectedProduct.stock : 0;

  const handleApply = () => {
    if (!selectedProduct || !warehouseId) return;
    const wh = warehouses.find(w => w.id === warehouseId);
    const loc = locations.find(l => l.id === locationId);
    addAdjustment({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      warehouse: wh?.name || "",
      location: loc?.name || "",
      systemQty: selectedProduct.stock,
      countedQty,
      date: new Date().toISOString().split('T')[0],
    });
    toast({ title: "Adjustment Applied", description: `${selectedProduct.name}: ${adjustment > 0 ? '+' : ''}${adjustment}` });
    setProductId("");
    setCountedQty(0);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider">New Adjustment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="font-mono text-sm"><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Warehouse</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger className="font-mono text-sm"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Location</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger className="font-mono text-sm"><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {locations.filter(l => l.warehouseId === warehouseId).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">System Quantity</Label>
              <Input value={selectedProduct?.stock ?? "-"} readOnly className="font-mono bg-muted" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Counted Quantity</Label>
              <Input type="number" value={countedQty} onChange={e => setCountedQty(Number(e.target.value))} className="font-mono" min={0} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Adjustment</Label>
              <div className={`h-10 flex items-center px-3 rounded-sm border border-border font-mono font-bold ${adjustment > 0 ? 'text-emerald-400' : adjustment < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {selectedProduct ? (adjustment > 0 ? `+${adjustment}` : adjustment) : "-"}
              </div>
            </div>
          </div>

          <Button onClick={handleApply} disabled={!selectedProduct || !warehouseId} className="font-mono text-xs uppercase tracking-wider">
            Apply Adjustment
          </Button>
        </CardContent>
      </Card>

      <div className="border border-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase">Date</TableHead>
              <TableHead className="font-mono text-xs uppercase">Product</TableHead>
              <TableHead className="font-mono text-xs uppercase">Warehouse</TableHead>
              <TableHead className="font-mono text-xs uppercase">Location</TableHead>
              <TableHead className="font-mono text-xs uppercase">System Qty</TableHead>
              <TableHead className="font-mono text-xs uppercase">Counted</TableHead>
              <TableHead className="font-mono text-xs uppercase">Adjustment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map(adj => (
              <TableRow key={adj.id} className="border-border">
                <TableCell className="font-mono text-xs">{adj.date}</TableCell>
                <TableCell className="font-mono text-sm">{adj.productName}</TableCell>
                <TableCell className="text-sm">{adj.warehouse}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{adj.location}</TableCell>
                <TableCell className="font-mono text-sm">{adj.systemQty}</TableCell>
                <TableCell className="font-mono text-sm">{adj.countedQty}</TableCell>
                <TableCell className={`font-mono text-sm font-bold ${adj.adjustment > 0 ? 'text-emerald-400' : adj.adjustment < 0 ? 'text-primary' : ''}`}>
                  {adj.adjustment > 0 ? `+${adj.adjustment}` : adj.adjustment}
                </TableCell>
              </TableRow>
            ))}
            {adjustments.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground font-mono text-sm py-8">No adjustments recorded</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Adjustments;
