import { Product } from "@/store/inventoryStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin } from "lucide-react";

interface StockLocationsModalProps {
  product: Product;
  onClose: () => void;
}

export function StockLocationsModal({ product, onClose }: StockLocationsModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Stock by Location
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            {product.name} — {product.sku}
          </DialogDescription>
        </DialogHeader>

        <div className="border border-border rounded-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs uppercase">Warehouse</TableHead>
                <TableHead className="font-mono text-xs uppercase">Location</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.stockLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground font-mono text-sm py-6">
                    No location data available
                  </TableCell>
                </TableRow>
              ) : (
                product.stockLocations.map((sl, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell className="font-mono text-sm">{sl.warehouseName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{sl.locationName}</TableCell>
                    <TableCell className="font-mono text-sm font-bold text-right">{sl.quantity}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center pt-1 font-mono text-xs text-muted-foreground">
          <span>{product.stockLocations.length} location{product.stockLocations.length !== 1 ? 's' : ''}</span>
          <span>
            Total: <span className="font-bold text-foreground">{product.stock} {product.unitOfMeasure}</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
