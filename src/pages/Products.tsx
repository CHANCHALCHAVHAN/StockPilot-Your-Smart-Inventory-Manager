import { useState } from "react";
import { useInventoryStore, Product } from "@/store/inventoryStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LOW_STOCK_THRESHOLD = 10;
const categories = ["Raw Materials", "Components", "Machinery", "Consumables", "Finished Goods"];

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useInventoryStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", category: "Raw Materials", unitOfMeasure: "pcs", stock: 0, location: "" });

  const filtered = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => sortAsc ? a.stock - b.stock : b.stock - a.stock);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", sku: "", category: "Raw Materials", unitOfMeasure: "pcs", stock: 0, location: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, category: p.category, unitOfMeasure: p.unitOfMeasure, stock: p.stock, location: p.location });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.sku) return;
    if (editing) {
      updateProduct(editing.id, form);
      toast({ title: "Product Updated", description: form.name });
    } else {
      addProduct(form);
      toast({ title: "Product Created", description: form.name });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteProduct(deletingId);
      toast({ title: "Product Deleted", variant: "destructive" });
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 font-mono text-sm" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] font-mono text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="font-mono text-xs uppercase tracking-wider">
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase">Product</TableHead>
              <TableHead className="font-mono text-xs uppercase">SKU</TableHead>
              <TableHead className="font-mono text-xs uppercase">Category</TableHead>
              <TableHead className="font-mono text-xs uppercase cursor-pointer" onClick={() => setSortAsc(!sortAsc)}>
                <span className="flex items-center gap-1">Stock <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead className="font-mono text-xs uppercase">Location</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id} className={`border-border ${p.stock <= LOW_STOCK_THRESHOLD ? 'bg-primary/5' : ''}`}>
                <TableCell className="font-mono text-sm">{p.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                <TableCell className="text-sm">{p.category}</TableCell>
                <TableCell className={`font-mono text-sm font-bold ${p.stock <= LOW_STOCK_THRESHOLD ? 'text-primary' : ''}`}>{p.stock}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.location}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-7 w-7 hover:text-primary">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setDeletingId(p.id); setDeleteDialogOpen(true); }} className="h-7 w-7 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-wider">{editing ? "Edit Product" : "New Product"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono">Fill in the product details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Product Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">SKU</Label>
              <Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="font-mono"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-mono uppercase">Unit</Label>
                <Input value={form.unitOfMeasure} onChange={e => setForm({ ...form, unitOfMeasure: e.target.value })} className="font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-mono uppercase">Initial Stock</Label>
                <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="font-mono" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Location</Label>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="font-mono" placeholder="WH/Stock/A1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-mono text-xs">Cancel</Button>
            <Button onClick={handleSave} className="font-mono text-xs uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-wider">Confirm Delete</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-mono">This action cannot be undone. Are you sure?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="font-mono text-xs">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="font-mono text-xs uppercase">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
