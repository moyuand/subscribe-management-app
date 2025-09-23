import { create } from 'zustand';

interface FilterState {
  search: string;
  dynasty: string;
  category: string;
  openStatus: string;
  setSearch: (value: string) => void;
  setDynasty: (value: string) => void;
  setCategory: (value: string) => void;
  setOpenStatus: (value: string) => void;
  reset: () => void;
}

const initialState = {
  search: '',
  dynasty: '全部',
  category: '全部',
  openStatus: '全部',
};

export const useFilters = create<FilterState>((set) => ({
  ...initialState,
  setSearch: (value) => set({ search: value }),
  setDynasty: (value) => set({ dynasty: value }),
  setCategory: (value) => set({ category: value }),
  setOpenStatus: (value) => set({ openStatus: value }),
  reset: () => set(initialState),
}));
