import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  stock: number;
  location: string;
}

export type OperationStatus = 'Draft' | 'Ready' | 'Done' | 'Waiting' | 'Cancelled';

export interface OperationProduct {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Operation {
  id: string;
  reference: string;
  type: 'IN' | 'OUT';
  from: string;
  to: string;
  contact: string;
  responsible: string;
  scheduledDate: string;
  status: OperationStatus;
  products: OperationProduct[];
}

export interface Adjustment {
  id: string;
  productId: string;
  productName: string;
  warehouse: string;
  location: string;
  systemQty: number;
  countedQty: number;
  adjustment: number;
  date: string;
}

export interface MoveRecord {
  id: string;
  reference: string;
  date: string;
  contact: string;
  from: string;
  to: string;
  quantity: number;
  status: OperationStatus;
}

interface InventoryState {
  products: Product[];
  operations: Operation[];
  adjustments: Adjustment[];
  moveHistory: MoveRecord[];
  nextReceiptId: number;
  nextDeliveryId: number;

  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addOperation: (op: Omit<Operation, 'id'>) => void;
  updateOperationStatus: (id: string, status: OperationStatus) => void;

  addAdjustment: (adj: Omit<Adjustment, 'id' | 'adjustment'>) => void;

  getNextReference: (type: 'IN' | 'OUT') => string;
}

const dummyProducts: Product[] = [
  { id: '1', name: 'Steel Beam A36', sku: 'STL-001', category: 'Raw Materials', unitOfMeasure: 'pcs', stock: 245, location: 'WH/Stock/A1' },
  { id: '2', name: 'Copper Wire 2.5mm', sku: 'COP-012', category: 'Raw Materials', unitOfMeasure: 'meters', stock: 1200, location: 'WH/Stock/A2' },
  { id: '3', name: 'Circuit Board v3', sku: 'PCB-003', category: 'Components', unitOfMeasure: 'pcs', stock: 3, location: 'WH/Stock/B1' },
  { id: '4', name: 'Hydraulic Pump HP-50', sku: 'HYD-050', category: 'Machinery', unitOfMeasure: 'units', stock: 8, location: 'WH/Stock/C1' },
  { id: '5', name: 'Aluminum Sheet 2mm', sku: 'ALU-020', category: 'Raw Materials', unitOfMeasure: 'sheets', stock: 67, location: 'WH/Stock/A3' },
  { id: '6', name: 'Servo Motor SM-100', sku: 'SRV-100', category: 'Components', unitOfMeasure: 'units', stock: 2, location: 'WH/Stock/B2' },
  { id: '7', name: 'Industrial Valve IV-25', sku: 'VLV-025', category: 'Components', unitOfMeasure: 'pcs', stock: 45, location: 'WH/Stock/C2' },
  { id: '8', name: 'Rubber Gasket RG-10', sku: 'GAS-010', category: 'Consumables', unitOfMeasure: 'pcs', stock: 500, location: 'WH/Stock/D1' },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const pastDate = (days: number) => fmt(new Date(today.getTime() - days * 86400000));
const futureDate = (days: number) => fmt(new Date(today.getTime() + days * 86400000));

const dummyOperations: Operation[] = [
  { id: 'op1', reference: 'WH/IN/0001', type: 'IN', from: 'SteelCo Supplier', to: 'Main Warehouse', contact: 'John Steel', responsible: 'Admin', scheduledDate: pastDate(2), status: 'Ready', products: [{ productId: '1', productName: 'Steel Beam A36', quantity: 50 }] },
  { id: 'op2', reference: 'WH/IN/0002', type: 'IN', from: 'CopperTech Ltd', to: 'Main Warehouse', contact: 'Sarah Copper', responsible: 'Admin', scheduledDate: futureDate(3), status: 'Draft', products: [{ productId: '2', productName: 'Copper Wire 2.5mm', quantity: 300 }] },
  { id: 'op3', reference: 'WH/IN/0003', type: 'IN', from: 'PCB Factory', to: 'Main Warehouse', contact: 'Mike Boards', responsible: 'Operator', scheduledDate: futureDate(5), status: 'Draft', products: [{ productId: '3', productName: 'Circuit Board v3', quantity: 100 }] },
  { id: 'op4', reference: 'WH/IN/0004', type: 'IN', from: 'Hydra Systems', to: 'Main Warehouse', contact: 'Lisa Pump', responsible: 'Admin', scheduledDate: pastDate(5), status: 'Waiting', products: [{ productId: '4', productName: 'Hydraulic Pump HP-50', quantity: 10 }] },
  { id: 'op5', reference: 'WH/OUT/0001', type: 'OUT', from: 'Main Warehouse', to: 'Azure Interior', contact: 'Azure Interior', responsible: 'Admin', scheduledDate: pastDate(1), status: 'Ready', products: [{ productId: '1', productName: 'Steel Beam A36', quantity: 20 }] },
  { id: 'op6', reference: 'WH/OUT/0002', type: 'OUT', from: 'Main Warehouse', to: 'BuildTech Corp', contact: 'BuildTech Corp', responsible: 'Operator', scheduledDate: futureDate(2), status: 'Draft', products: [{ productId: '5', productName: 'Aluminum Sheet 2mm', quantity: 15 }] },
  { id: 'op7', reference: 'WH/OUT/0003', type: 'OUT', from: 'Main Warehouse', to: 'MechWorks Inc', contact: 'MechWorks Inc', responsible: 'Admin', scheduledDate: futureDate(7), status: 'Draft', products: [{ productId: '7', productName: 'Industrial Valve IV-25', quantity: 10 }] },
  { id: 'op8', reference: 'WH/OUT/0004', type: 'OUT', from: 'Main Warehouse', to: 'PowerGrid Ltd', contact: 'PowerGrid Ltd', responsible: 'Operator', scheduledDate: pastDate(3), status: 'Waiting', products: [{ productId: '6', productName: 'Servo Motor SM-100', quantity: 1 }] },
];

const dummyMoveHistory: MoveRecord[] = [
  { id: 'm1', reference: 'WH/IN/0001', date: pastDate(10), contact: 'John Steel', from: 'SteelCo Supplier', to: 'WH/Stock/A1', quantity: 100, status: 'Done' },
  { id: 'm2', reference: 'WH/OUT/0001', date: pastDate(8), contact: 'Azure Interior', from: 'WH/Stock/A1', to: 'Customer', quantity: 30, status: 'Done' },
  { id: 'm3', reference: 'WH/IN/0002', date: pastDate(5), contact: 'CopperTech Ltd', from: 'CopperTech Ltd', to: 'WH/Stock/A2', quantity: 500, status: 'Done' },
];

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: dummyProducts,
  operations: dummyOperations,
  adjustments: [],
  moveHistory: dummyMoveHistory,
  nextReceiptId: 5,
  nextDeliveryId: 5,

  addProduct: (p) => {
    const id = String(Date.now());
    set(s => ({ products: [...s.products, { ...p, id }] }));
  },

  updateProduct: (id, p) => {
    set(s => ({ products: s.products.map(prod => prod.id === id ? { ...prod, ...p } : prod) }));
  },

  deleteProduct: (id) => {
    set(s => ({ products: s.products.filter(p => p.id !== id) }));
  },

  addOperation: (op) => {
    const id = String(Date.now());
    set(s => {
      const key = op.type === 'IN' ? 'nextReceiptId' : 'nextDeliveryId';
      return { operations: [...s.operations, { ...op, id }], [key]: s[key] + 1 };
    });
  },

  updateOperationStatus: (id, status) => {
    const { operations, products } = get();
    const op = operations.find(o => o.id === id);
    if (!op) return;

    let updatedProducts = [...products];
    if (status === 'Done' && op.status !== 'Done') {
      op.products.forEach(opProd => {
        updatedProducts = updatedProducts.map(p => {
          if (p.id === opProd.productId) {
            return {
              ...p,
              stock: op.type === 'IN' ? p.stock + opProd.quantity : Math.max(0, p.stock - opProd.quantity),
            };
          }
          return p;
        });
      });

      const moveRecords: MoveRecord[] = op.products.map(opProd => ({
        id: String(Date.now() + Math.random()),
        reference: op.reference,
        date: fmt(new Date()),
        contact: op.contact,
        from: op.from,
        to: op.to,
        quantity: opProd.quantity,
        status: 'Done' as OperationStatus,
      }));

      set(s => ({
        operations: s.operations.map(o => o.id === id ? { ...o, status } : o),
        products: updatedProducts,
        moveHistory: [...s.moveHistory, ...moveRecords],
      }));
    } else {
      set(s => ({
        operations: s.operations.map(o => o.id === id ? { ...o, status } : o),
      }));
    }
  },

  addAdjustment: (adj) => {
    const adjustment = adj.countedQty - adj.systemQty;
    const id = String(Date.now());
    set(s => ({
      adjustments: [...s.adjustments, { ...adj, id, adjustment }],
      products: s.products.map(p =>
        p.id === adj.productId ? { ...p, stock: adj.countedQty } : p
      ),
    }));
  },

  getNextReference: (type) => {
    const { nextReceiptId, nextDeliveryId } = get();
    const num = type === 'IN' ? nextReceiptId : nextDeliveryId;
    return `WH/${type}/${String(num).padStart(4, '0')}`;
  },
}));
