
import { create } from 'zustand';

interface SidebarStore {
  isOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (isOpen: boolean) => void;
}

export const useSidebar = create<SidebarStore>((set) => ({
  isOpen: false,
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  setSidebar: (isOpen: boolean) => set({ isOpen }),
}));
