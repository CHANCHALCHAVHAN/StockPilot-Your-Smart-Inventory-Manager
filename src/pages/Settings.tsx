import { useState } from "react";
import { useSettingsStore, Warehouse, Location } from "@/store/settingsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

const Settings = () => {
  const { warehouses, locations, addWarehouse, updateWarehouse, deleteWarehouse, addLocation, updateLocation, deleteLocation } = useSettingsStore();
  const { toast } = useToast();
  const loc = useLocation();
  const defaultTab = loc.pathname.includes("locations") ? "locations" : "warehouses";

  const [whDialogOpen, setWhDialogOpen] = useState(false);
  const [locDialogOpen, setLocDialogOpen] = useState(false);
  const [editingWh, setEditingWh] = useState<Warehouse | null>(null);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [whForm, setWhForm] = useState({ name: "", shortCode: "", address: "" });
  const [locForm, setLocForm] = useState({ name: "", warehouseId: "", description: "" });

  const openWhCreate = () => { setEditingWh(null); setWhForm({ name: "", shortCode: "", address: "" }); setWhDialogOpen(true); };
  const openWhEdit = (w: Warehouse) => { setEditingWh(w); setWhForm({ name: w.name, shortCode: w.shortCode, address: w.address }); setWhDialogOpen(true); };
  const openLocCreate = () => { setEditingLoc(null); setLocForm({ name: "", warehouseId: warehouses[0]?.id || "", description: "" }); setLocDialogOpen(true); };
  const openLocEdit = (l: Location) => { setEditingLoc(l); setLocForm({ name: l.name, warehouseId: l.warehouseId, description: l.description }); setLocDialogOpen(true); };

  const saveWh = () => {
    if (editingWh) { updateWarehouse(editingWh.id, whForm); toast({ title: "Warehouse Updated" }); }
    else { addWarehouse(whForm); toast({ title: "Warehouse Created" }); }
    setWhDialogOpen(false);
  };

  const saveLoc = () => {
    if (editingLoc) { updateLocation(editingLoc.id, locForm); toast({ title: "Location Updated" }); }
    else { addLocation(locForm); toast({ title: "Location Created" }); }
    setLocDialogOpen(false);
  };

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="bg-secondary">
        <TabsTrigger value="warehouses" className="font-mono text-xs uppercase">Warehouses</TabsTrigger>
        <TabsTrigger value="locations" className="font-mono text-xs uppercase">Locations</TabsTrigger>
      </TabsList>

      <TabsContent value="warehouses" className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={openWhCreate} className="font-mono text-xs uppercase tracking-wider">
            <Plus className="h-4 w-4 mr-1" /> Add Warehouse
          </Button>
        </div>
        <div className="border border-border rounded-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs uppercase">Name</TableHead>
                <TableHead className="font-mono text-xs uppercase">Code</TableHead>
                <TableHead className="font-mono text-xs uppercase">Address</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map(w => (
                <TableRow key={w.id} className="border-border">
                  <TableCell className="font-mono text-sm">{w.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{w.shortCode}</TableCell>
                  <TableCell className="text-sm">{w.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openWhEdit(w)} className="h-7 w-7 hover:text-primary"><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { deleteWarehouse(w.id); toast({ title: "Deleted", variant: "destructive" }); }} className="h-7 w-7 hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="locations" className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={openLocCreate} className="font-mono text-xs uppercase tracking-wider">
            <Plus className="h-4 w-4 mr-1" /> Add Location
          </Button>
        </div>
        <div className="border border-border rounded-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs uppercase">Name</TableHead>
                <TableHead className="font-mono text-xs uppercase">Warehouse</TableHead>
                <TableHead className="font-mono text-xs uppercase">Description</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map(l => (
                <TableRow key={l.id} className="border-border">
                  <TableCell className="font-mono text-sm">{l.name}</TableCell>
                  <TableCell className="text-sm">{warehouses.find(w => w.id === l.warehouseId)?.name || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openLocEdit(l)} className="h-7 w-7 hover:text-primary"><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { deleteLocation(l.id); toast({ title: "Deleted", variant: "destructive" }); }} className="h-7 w-7 hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <Dialog open={whDialogOpen} onOpenChange={setWhDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-wider">{editingWh ? "Edit Warehouse" : "New Warehouse"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono">Configure warehouse details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs font-mono uppercase">Name</Label><Input value={whForm.name} onChange={e => setWhForm({ ...whForm, name: e.target.value })} className="font-mono" /></div>
            <div className="space-y-1"><Label className="text-xs font-mono uppercase">Short Code</Label><Input value={whForm.shortCode} onChange={e => setWhForm({ ...whForm, shortCode: e.target.value })} className="font-mono" /></div>
            <div className="space-y-1"><Label className="text-xs font-mono uppercase">Address</Label><Input value={whForm.address} onChange={e => setWhForm({ ...whForm, address: e.target.value })} className="font-mono" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhDialogOpen(false)} className="font-mono text-xs">Cancel</Button>
            <Button onClick={saveWh} className="font-mono text-xs uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={locDialogOpen} onOpenChange={setLocDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-wider">{editingLoc ? "Edit Location" : "New Location"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono">Configure location details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs font-mono uppercase">Name</Label><Input value={locForm.name} onChange={e => setLocForm({ ...locForm, name: e.target.value })} className="font-mono" /></div>
            <div className="space-y-1">
              <Label className="text-xs font-mono uppercase">Warehouse</Label>
              <Select value={locForm.warehouseId} onValueChange={v => setLocForm({ ...locForm, warehouseId: v })}>
                <SelectTrigger className="font-mono"><SelectValue /></SelectTrigger>
                <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs font-mono uppercase">Description</Label><Input value={locForm.description} onChange={e => setLocForm({ ...locForm, description: e.target.value })} className="font-mono" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocDialogOpen(false)} className="font-mono text-xs">Cancel</Button>
            <Button onClick={saveLoc} className="font-mono text-xs uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

export default Settings;
