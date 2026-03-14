import { useState } from "react";
import { useInventoryStore, Operation, OperationStatus, OperationProduct } from "@/store/inventoryStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Plus, List, Columns3, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OperationsPageProps {
  type: 'IN' | 'OUT';
}

const OperationsPage = ({ type }: OperationsPageProps) => {
  const { operations, products, addOperation, updateOperationStatus, getNextReference } = useInventoryStore();
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const filtered = operations.filter(o => o.type === type);

  const [form, setForm] = useState({
    from: "", to: "", contact: "", responsible: "", scheduledDate: "",
    products: [] as OperationProduct[],
  });

  const openCreate = () => {
    setForm({ from: "", to: "", contact: "", responsible: "", scheduledDate: "", products: [] });
    setDialogOpen(true);
  };

  const addProductRow = () => {
    setForm(f => ({
      ...f,
      products: [...f.products, { productId: "", productName: "", quantity: 1 }],
    }));
  };

  const updateProductRow = (idx: number, field: string, value: string | number) => {
    setForm(f => {
      const updated = [...f.products];
      if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        updated[idx] = { ...updated[idx], productId: value as string, productName: prod?.name || "" };
      } else {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return { ...f, products: updated };
    });
  };

  const handleSave = () => {
    const ref = getNextReference(type);
    addOperation({
      reference: ref,
      type,
      from: form.from,
      to: form.to,
      contact: form.contact,
      responsible: form.responsible,
      scheduledDate: form.scheduledDate,
      status: 'Draft',
      products: form.products,
    });
    toast({ title: `${type === 'IN' ? 'Receipt' : 'Delivery'} Created`, description: ref });
    setDialogOpen(false);
  };

  const handleValidate = (op: Operation) => {
    if (op.status === 'Draft') {
      updateOperationStatus(op.id, 'Ready');
      toast({ title: "Status Updated", description: `${op.reference} → Ready` });
    } else if (op.status === 'Ready') {
      updateOperationStatus(op.id, 'Done');
      toast({ title: "Validated", description: `${op.reference} → Done. Stock updated.` });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')} className="font-mono text-xs">
            <List className="h-3 w-3 mr-1" /> List
          </Button>
          <Button variant={view === 'kanban' ? 'default' : 'outline'} size="sm" onClick={() => setView('kanban')} className="font-mono text-xs">
            <Columns3 className="h-3 w-3 mr-1" /> Kanban
          </Button>
        </div>
        <Button onClick={openCreate} className="font-mono text-xs uppercase tracking-wider">
          <Plus className="h-4 w-4 mr-1" /> New {type === 'IN' ? 'Receipt' : 'Delivery'}
        </Button>
      </div>

      {view === 'list' ? (
        <div className="border border-border rounded-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs uppercase">Reference</TableHead>
                <TableHead className="font-mono text-xs uppercase">From</TableHead>
                <TableHead className="font-mono text-xs uppercase">To</TableHead>
                <TableHead className="font-mono text-xs uppercase">Contact</TableHead>
                <TableHead className="font-mono text-xs uppercase">Scheduled</TableHead>
                <TableHead className="font-mono text-xs uppercase">Status</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(op => (
                <TableRow key={op.id} className="border-border">
                  <TableCell className="font-mono text-sm font-medium">{op.reference}</TableCell>
                  <TableCell className="text-sm">{op.from}</TableCell>
                  <TableCell className="text-sm">{op.to}</TableCell>
                  <TableCell className="text-sm">{op.contact}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{op.scheduledDate}</TableCell>
                  <TableCell><StatusBadge status={op.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {op.status !== 'Done' && op.status !== 'Cancelled' && (
                        <Button size="sm" onClick={() => handleValidate(op)} className="font-mono text-xs h-7">
                          {op.status === 'Draft' ? 'Ready' : 'Validate'}
                        </Button>
                      )}
                      {op.status !== 'Done' && op.status !== 'Cancelled' && (
                        <Button size="sm" variant="outline" onClick={() => updateOperationStatus(op.id, 'Cancelled')} className="font-mono text-xs h-7">
                          Cancel
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="font-mono text-xs h-7" onClick={() => window.print()}>
                        <Printer className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <KanbanBoard operations={filtered} onStatusChange={updateOperationStatus} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-wider">
              New {type === 'IN' ? 'Receipt' : 'Delivery'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono">
              Reference: {getNextReference(type)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-mono uppercase">{type === 'IN' ? 'Source (Vendor)' : 'From Warehouse'}</Label>
                <Input value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} className="font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-mono uppercase">{type === 'IN' ? 'Destination' : 'Customer'}</Label>
                <Input value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} className="font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-mono uppercase">Contact</Label>
                <Input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-mono uppercase">Responsible</Label>
                <Input value={form.responsible} onChange={e => setForm({ ...form, responsible: e.target.value })} className="font-mono" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Schedule Date</Label>
              <Input type="date" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} className="font-mono" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono uppercase">Products</Label>
                <Button size="sm" variant="outline" onClick={addProductRow} className="font-mono text-xs h-7">
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              {form.products.map((fp, idx) => (
                <div key={idx} className="flex gap-2">
                  <Select value={fp.productId} onValueChange={v => updateProductRow(idx, 'productId', v)}>
                    <SelectTrigger className="font-mono text-xs flex-1"><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" value={fp.quantity} onChange={e => updateProductRow(idx, 'quantity', Number(e.target.value))} className="font-mono w-20" min={1} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-mono text-xs">Cancel</Button>
            <Button onClick={handleSave} className="font-mono text-xs uppercase">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OperationsPage;
