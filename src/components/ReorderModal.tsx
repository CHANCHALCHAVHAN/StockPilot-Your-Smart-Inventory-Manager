import { useState } from "react";
import { useInventoryStore, Product } from "@/store/inventoryStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReorderModalProps {
  product: Product;
  onClose: () => void;
}

export function ReorderModal({ product, onClose }: ReorderModalProps) {
  const { addOperation, getNextReference } = useInventoryStore();
  const { toast } = useToast();
  const [supplier, setSupplier] = useState("");
  const [quantity, setQuantity] = useState(
    Math.max(product.minStockThreshold - product.stock, product.minStockThreshold)
  );
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  const handleSubmit = () => {
    if (!supplier.trim()) return;
    const ref = getNextReference('IN');
    addOperation({
      reference: ref,
      type: 'IN',
      from: supplier,
      to: 'Main Warehouse',
      contact: supplier,
      responsible: 'System',
      scheduledDate,
      status: 'Draft',
      products: [{ productId: product.id, productName: product.name, quantity }],
    });
    toast({
      title: "Reorder Created",
      description: `${ref} — ${quantity} × ${product.name} from ${supplier}`,
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" /> Reorder Product
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            Creates a Draft receipt for restocking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="p-2 rounded-sm bg-muted space-y-0.5">
            <p className="font-mono text-sm font-semibold">{product.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
            <p className="font-mono text-xs">
              Current stock: <span className="text-primary font-bold">{product.stock}</span>
              {" / "}Min threshold: <span className="font-bold">{product.minStockThreshold}</span>
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-mono uppercase">Supplier</Label>
            <Input
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              placeholder="Supplier name"
              className="font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-mono uppercase">Quantity to Order</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-mono uppercase">Expected Delivery</Label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-mono text-xs">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!supplier.trim()} className="font-mono text-xs uppercase">
            Create Reorder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
