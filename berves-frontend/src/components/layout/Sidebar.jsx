import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Users, DollarSign, Clock, Calendar, UserPlus,
  GraduationCap, Target, Shield, Settings, BarChart2, ChevronLeft,
  HardHat, FileText, Timer, CreditCard, Bell, Layers, MapPin, UserCog,
} from 'lucide-react';
import { useAuth }    from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';
import { useQuery }   from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';

const NAV = [
  { to: '/dashboard',        label: 'Dashboard',       icon: LayoutDashboard, roles: [], end: true },
  { to: '/dashboard/hr',    label: 'HR Analytics',    icon: UserCog,         roles: ['admin','hr'], sub: true },
  { to: '/employees',        label: 'Employees',        icon: Users,           roles: ['admin','hr','manager'], end: true },
  { to: '/employees/departments', label: 'Departments', icon: Layers, roles: ['admin','hr'], sub: true },
  { to: '/employees/sites',       label: 'Sites',       icon: MapPin,  roles: ['admin','hr'], sub: true },

  // ── Payroll group ────────────────────────────────────────────────────────
  { to: '/payroll',          label: 'Payroll',          icon: DollarSign,      roles: ['admin','hr','payroll_officer'] },
  { to: '/payroll/overtime', label: 'Overtime',         icon: Timer,           roles: ['admin','hr','payroll_officer'] },
  { to: '/payroll/loans',    label: 'Loans',            icon: CreditCard,      roles: ['admin','hr','payroll_officer'] },
  { to: '/payslips',         label: 'My Payslips',      icon: FileText,        roles: [] }, // every role sees their own

  // ── Other modules ────────────────────────────────────────────────────────
  { to: '/attendance',       label: 'Attendance',       icon: Clock,           roles: [] },
  { to: '/leave',            label: 'Leave & Off-Days', icon: Calendar,        roles: [] },
  { to: '/recruitment',      label: 'Recruitment',      icon: UserPlus,        roles: ['admin','hr'] },
  { to: '/training',         label: 'Training & Certs', icon: GraduationCap,   roles: [] },
  { to: '/performance',      label: 'Performance',      icon: Target,          roles: [] },
  { to: '/safety',           label: 'Health & Safety',  icon: Shield,          roles: [] },
  { to: '/reports',          label: 'Reports',          icon: BarChart2,       roles: ['admin','hr','payroll_officer'] },
  { to: '/notifications',    label: 'Notifications',    icon: Bell,            roles: [] },
  { to: '/settings',         label: 'Settings',         icon: Settings,        roles: ['admin'] },
];

// Separator groups — keys that start a new visual section
const SECTION_BREAKS = new Set(['/attendance', '/reports', '/notifications', '/settings']);

export const Sidebar = () => {
  const { user, hasRole }                                            = useAuth();
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useUiStore();

  const { data: countData } = useQuery({
    queryKey: ['notif-count'],
    queryFn:  () => notificationsApi.unreadCount().then(r => r.data),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const unreadCount = countData?.data?.count ?? 0;

  const visible = NAV.filter(n => n.roles.length === 0 || hasRole(n.roles));

  return (
    <aside
      className="app-sidebar fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300"
      data-open={mobileSidebarOpen}
      style={{
        width:       sidebarOpen ? 'var(--sidebar-w)' : 'var(--sidebar-w-collapsed)',
        background:  'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}>

      {/* ── Logo ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{ height: 'var(--topbar-h)', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--teal)' }}>
          <HardHat size={16} color="#fff" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate" style={{ color: 'var(--sidebar-text)' }}>Berves Eng.</p>
            <p className="text-xs truncate" style={{ color: 'var(--sidebar-text-muted)' }}>HRMS v2.0</p>
          </div>
        )}
        {/* Desktop: collapse toggle */}
        <button onClick={toggleSidebar}
          className="hidden lg:flex p-1.5 rounded-lg flex-shrink-0 transition-all"
          style={{ color: 'var(--sidebar-text-muted)' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
          onMouseOut={e  => e.currentTarget.style.background = ''}>
          <ChevronLeft size={16} style={{ transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform .3s' }} />
        </button>
        {/* Mobile: close drawer */}
        <button onClick={closeMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg flex-shrink-0 transition-all"
          style={{ color: 'var(--sidebar-text-muted)' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
          onMouseOut={e  => e.currentTarget.style.background = ''}>
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visible.map(({ to, label, icon: Icon, end, sub }) => {
          const isNotif = to === '/notifications';
          return (
            <div key={to}>
              {SECTION_BREAKS.has(to) && (
                <div className="mx-2 my-2" style={{ borderTop: '1px solid var(--sidebar-border)' }} />
              )}
              <NavLink to={to} end={!!end}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-all',
                  sub ? 'px-3 py-2 ml-3' : 'px-3 py-2.5',
                  isActive ? 'sidebar-link-active' : 'sidebar-link'
                )}>
                <div className="relative flex-shrink-0">
                  <Icon size={sub ? 15 : 18} />
                  {isNotif && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: 'var(--red)', fontSize: '8px', lineHeight: 1 }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <span className="truncate flex-1">{label}</span>
                )}
                {sidebarOpen && isNotif && unreadCount > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white ml-auto"
                    style={{ background: 'var(--red)', fontSize: '9px' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* ── User footer ─────────────────────────────────────────────────── */}
      {sidebarOpen && user && (
        <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'var(--teal)' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--sidebar-text)' }}>{user.name}</p>
              <p className="text-xs capitalize truncate" style={{ color: 'var(--sidebar-text-muted)' }}>{user.role?.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
