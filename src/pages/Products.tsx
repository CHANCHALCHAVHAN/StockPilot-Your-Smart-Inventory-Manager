import { useState } from "react";
import { useInventoryStore, Product } from "@/store/inventoryStore";
import { useCategoryStore } from "@/store/categoryStore";
import { StockLocationsModal } from "@/components/StockLocationsModal";
import { ReorderModal } from "@/components/ReorderModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, ArrowUpDown, MapPin, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FormState = {
  name: string; sku: string; category: string; unitOfMeasure: string;
  stock: number; location: string; minStockThreshold: number;
  stockLocations: Product['stockLocations'];
};

const emptyForm = (): FormState => ({
  name: '', sku: '', category: '', unitOfMeasure: 'pcs',
  stock: 0, location: '', minStockThreshold: 10, stockLocations: [],
});

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useInventoryStore();
  const { categories } = useCategoryStore();
  const { toast } = useToast();

  const [search,          setSearch]          = useState('');
  const [categoryFilter,  setCategoryFilter]  = useState('all');
  const [reorderFilter,   setReorderFilter]   = useState<'all' | 'reorder'>('all');
  const [sortAsc,         setSortAsc]         = useState(true);
  const [dialogOpen,      setDialogOpen]      = useState(false);
  const [deleteDialogOpen,setDeleteDialogOpen]= useState(false);
  const [editing,         setEditing]         = useState<Product | null>(null);
  const [deletingId,      setDeletingId]      = useState<string | null>(null);
  const [locationProduct, setLocationProduct] = useState<Product | null>(null);
  const [reorderProduct,  setReorderProduct]  = useState<Product | null>(null);
  const [form,            setForm]            = useState<FormState>(emptyForm());

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchCat    = categoryFilter === 'all' || p.category === categoryFilter;
      const matchReorder = reorderFilter === 'all' || p.reorderFlag;
      return matchSearch && matchCat && matchReorder;
    })
    .sort((a, b) => sortAsc ? a.stock - b.stock : b.stock - a.stock);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(), category: categories[0]?.name ?? '' });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, sku: p.sku, category: p.category,
      unitOfMeasure: p.unitOfMeasure, stock: p.stock,
      location: p.location, minStockThreshold: p.minStockThreshold,
      stockLocations: p.stockLocations,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.sku.trim()) return;
    if (editing) {
      updateProduct(editing.id, form);
      toast({ title: 'Product Updated', description: form.name });
    } else {
      addProduct(form);
      toast({ title: 'Product Created', description: form.name });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteProduct(deletingId);
      toast({ title: 'Product Deleted', variant: 'destructive' });
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const reorderCount = products.filter(p => p.reorderFlag).length;

  return (
    <div className="space-y-4">

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap flex-1">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 font-mono text-sm"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px] font-mono text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={reorderFilter} onValueChange={v => setReorderFilter(v as 'all' | 'reorder')}>
            <SelectTrigger className="w-[150px] font-mono text-sm">
              <SelectValue placeholder="Reorder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="reorder">Reorder Needed {reorderCount > 0 ? `(${reorderCount})` : ''}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={openCreate} className="font-mono text-xs uppercase tracking-wider shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="border border-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase">Product</TableHead>
              <TableHead className="font-mono text-xs uppercase">SKU</TableHead>
              <TableHead className="font-mono text-xs uppercase">Category</TableHead>
              <TableHead
                className="font-mono text-xs uppercase cursor-pointer"
                onClick={() => setSortAsc(!sortAsc)}
              >
                <span className="flex items-center gap-1">Stock <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead className="font-mono text-xs uppercase">Min / Reorder</TableHead>
              <TableHead className="font-mono text-xs uppercase">Location</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground font-mono text-sm py-10">
                  No products found
                </TableCell>
              </TableRow>
            )}
            {filtered.map(p => (
              <TableRow key={p.id} className={`border-border ${p.reorderFlag ? 'bg-primary/5' : ''}`}>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    {p.name}
                    {p.reorderFlag && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] font-mono px-1.5 py-0 h-4 uppercase tracking-wide"
                      >
                        Reorder
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                <TableCell className="text-sm">{p.category}</TableCell>
                <TableCell className={`font-mono text-sm font-bold ${p.reorderFlag ? 'text-primary' : ''}`}>
                  {p.stock}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {p.minStockThreshold} {p.unitOfMeasure}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.location}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setLocationProduct(p)}
                      className="h-7 w-7 hover:text-primary"
                      title="Stock by location"
                    >
                      <MapPin className="h-3 w-3" />
                    </Button>
                    {p.reorderFlag && (
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setReorderProduct(p)}
                        className="h-7 w-7 hover:text-primary"
                        title="Create reorder"
                      >
                        <ShoppingCart className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => openEdit(p)}
                      className="h-7 w-7 hover:text-primary"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => { setDeletingId(p.id); setDeleteDialogOpen(true); }}
                      className="h-7 w-7 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Create / Edit Dialog ─────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-wider">
              {editing ? 'Edit Product' : 'New Product'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono">
              Fill in the product details below.
            </DialogDescription>
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
                <SelectTrigger className="font-mono"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-mono uppercase">Unit of Measure</Label>
                <Input value={form.unitOfMeasure} onChange={e => setForm({ ...form, unitOfMeasure: e.target.value })} className="font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-mono uppercase">Initial Stock</Label>
                <Input type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-mono uppercase">Location</Label>
                <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="font-mono" placeholder="WH/Stock/A1" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-mono uppercase">Min Stock Threshold</Label>
                <Input type="number" min={0} value={form.minStockThreshold} onChange={e => setForm({ ...form, minStockThreshold: Number(e.target.value) })} className="font-mono" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-mono text-xs">Cancel</Button>
            <Button onClick={handleSave} className="font-mono text-xs uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-wider">Confirm Delete</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-mono">
              This action cannot be undone. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="font-mono text-xs">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="font-mono text-xs uppercase">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Stock Locations Modal ────────────────────────────────────── */}
      {locationProduct && (
        <StockLocationsModal product={locationProduct} onClose={() => setLocationProduct(null)} />
      )}

      {/* ── Reorder Modal ────────────────────────────────────────────── */}
      {reorderProduct && (
        <ReorderModal product={reorderProduct} onClose={() => setReorderProduct(null)} />
      )}
    </div>
  );
};

export default Products;
