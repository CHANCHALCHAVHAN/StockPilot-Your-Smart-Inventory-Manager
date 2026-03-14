import { useState } from "react";
import { useCategoryStore, Category } from "@/store/categoryStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { toast } = useToast();

  const [dialogOpen,       setDialogOpen]       = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing,          setEditing]          = useState<Category | null>(null);
  const [deletingId,       setDeletingId]       = useState<string | null>(null);
  const [form,             setForm]             = useState({ name: '', description: '' });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateCategory(editing.id, form);
      toast({ title: 'Category Updated', description: form.name });
    } else {
      addCategory(form);
      toast({ title: 'Category Created', description: form.name });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteCategory(deletingId);
      toast({ title: 'Category Deleted', variant: 'destructive' });
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="font-mono text-xs uppercase tracking-wider">
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase">Name</TableHead>
              <TableHead className="font-mono text-xs uppercase">Description</TableHead>
              <TableHead className="font-mono text-xs uppercase">Created</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground font-mono text-sm py-10">
                  No categories yet
                </TableCell>
              </TableRow>
            )}
            {categories.map(c => (
              <TableRow key={c.id} className="border-border">
                <TableCell className="font-mono text-sm font-medium">{c.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.description || '—'}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{c.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => openEdit(c)}
                      className="h-7 w-7 hover:text-primary"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => { setDeletingId(c.id); setDeleteDialogOpen(true); }}
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
              {editing ? 'Edit Category' : 'New Category'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono">
              Categories are used to group products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="font-mono"
                placeholder="e.g. Raw Materials"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Description</Label>
              <Input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="font-mono"
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-mono text-xs">Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()} className="font-mono text-xs uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-wider">Confirm Delete</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-mono">
              Deleting a category does not remove products assigned to it. Are you sure?
            </DialogDescription>
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

export default Categories;
