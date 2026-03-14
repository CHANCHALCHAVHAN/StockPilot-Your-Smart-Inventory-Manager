import { create } from 'zustand';

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
}

export interface Location {
  id: string;
  name: string;
  warehouseId: string;
  description: string;
}

interface SettingsState {
  warehouses: Warehouse[];
  locations: Location[];
  addWarehouse: (w: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, w: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;
  addLocation: (l: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, l: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  warehouses: [
    { id: 'wh1', name: 'Main Warehouse', shortCode: 'WH', address: '123 Industrial Ave, Factory District' },
    { id: 'wh2', name: 'Secondary Storage', shortCode: 'WH2', address: '456 Storage Blvd, Zone B' },
  ],
  locations: [
    { id: 'loc1', name: 'Stock/A1', warehouseId: 'wh1', description: 'Raw materials section A, rack 1' },
    { id: 'loc2', name: 'Stock/A2', warehouseId: 'wh1', description: 'Raw materials section A, rack 2' },
    { id: 'loc3', name: 'Stock/A3', warehouseId: 'wh1', description: 'Raw materials section A, rack 3' },
    { id: 'loc4', name: 'Stock/B1', warehouseId: 'wh1', description: 'Components section B, rack 1' },
    { id: 'loc5', name: 'Stock/B2', warehouseId: 'wh1', description: 'Components section B, rack 2' },
    { id: 'loc6', name: 'Stock/C1', warehouseId: 'wh1', description: 'Machinery section C, rack 1' },
    { id: 'loc7', name: 'Stock/C2', warehouseId: 'wh1', description: 'Components section C, rack 2' },
    { id: 'loc8', name: 'Stock/D1', warehouseId: 'wh1', description: 'Consumables section D' },
  ],

  addWarehouse: (w) => set(s => ({ warehouses: [...s.warehouses, { ...w, id: String(Date.now()) }] })),
  updateWarehouse: (id, w) => set(s => ({ warehouses: s.warehouses.map(wh => wh.id === id ? { ...wh, ...w } : wh) })),
  deleteWarehouse: (id) => set(s => ({ warehouses: s.warehouses.filter(w => w.id !== id) })),
  addLocation: (l) => set(s => ({ locations: [...s.locations, { ...l, id: String(Date.now()) }] })),
  updateLocation: (id, l) => set(s => ({ locations: s.locations.map(loc => loc.id === id ? { ...loc, ...l } : loc) })),
  deleteLocation: (id) => set(s => ({ locations: s.locations.filter(l => l.id !== id) })),
}));
