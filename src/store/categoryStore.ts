import { create } from 'zustand';

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface CategoryState {
  categories: Category[];
  addCategory: (c: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, c: Partial<Omit<Category, 'id' | 'createdAt'>>) => void;
  deleteCategory: (id: string) => void;
}

const seed: Category[] = [
  { id: 'cat1', name: 'Raw Materials',  description: 'Base materials used in production',        createdAt: '2024-01-01' },
  { id: 'cat2', name: 'Components',     description: 'Sub-assemblies and electronic parts',       createdAt: '2024-01-01' },
  { id: 'cat3', name: 'Machinery',      description: 'Heavy equipment and industrial machines',   createdAt: '2024-01-01' },
  { id: 'cat4', name: 'Consumables',    description: 'Items consumed during operations',          createdAt: '2024-01-01' },
  { id: 'cat5', name: 'Finished Goods', description: 'Products ready for sale or dispatch',       createdAt: '2024-01-01' },
];

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: seed,

  addCategory: (c) =>
    set(s => ({
      categories: [
        ...s.categories,
        { ...c, id: String(Date.now()), createdAt: new Date().toISOString().split('T')[0] },
      ],
    })),

  updateCategory: (id, c) =>
    set(s => ({
      categories: s.categories.map(cat => cat.id === id ? { ...cat, ...c } : cat),
    })),

  deleteCategory: (id) =>
    set(s => ({ categories: s.categories.filter(c => c.id !== id) })),
}));
