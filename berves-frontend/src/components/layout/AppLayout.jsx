import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar }  from './Navbar';
import { useUiStore } from '../../store/uiStore';

export const AppLayout = () => {
  const { sidebarOpen, mobileSidebarOpen, closeMobileSidebar } = useUiStore();

  return (
    <div className="min-h-screen" style={{ background: 'var(--canvas)' }}>
      <Sidebar />

      {/* Mobile backdrop — dims content and closes sidebar on tap */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(10,15,30,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={closeMobileSidebar}
        />
      )}

      <Navbar />

      <main
        className="app-main min-h-screen transition-all duration-300"
        style={{
          '--main-pl': sidebarOpen ? 'var(--sidebar-w)' : 'var(--sidebar-w-collapsed)',
          paddingTop: 'var(--topbar-h)',
        }}
      >
        <div className="p-4 sm:p-5 md:p-6 max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
