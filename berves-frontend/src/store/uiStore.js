import { create } from 'zustand';

const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = stored ?? (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);

export const useUiStore = create((set) => ({
  sidebarOpen:         true,
  mobileSidebarOpen:   false,
  theme:               initialTheme,

  toggleSidebar:       () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen:      (open) => set({ sidebarOpen: open }),
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  closeMobileSidebar:  () => set({ mobileSidebarOpen: false }),

  toggleTheme: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    return { theme: next };
  }),
}));
