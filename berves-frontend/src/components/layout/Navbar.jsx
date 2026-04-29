import { Bell, LogOut, User, Settings, ChevronDown, Menu, Check, CheckCheck, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth }           from '../../hooks/useAuth';
import { useUiStore }        from '../../store/uiStore';
import { authApi }           from '../../api/auth';
import { notificationsApi }  from '../../api/notifications';
import { Avatar }            from '../common/Avatar';
import { swConfirm, swSuccess } from '../../lib/swal';
import { fRelative }         from '../../utils';

// ── Notification type dot colour ───────────────────────────────────────────
const DOT = {
  general:'#2563eb', leave:'#059669', payslip:'#0d9488',
  overtime:'#7c3aed', certification:'#d97706', safety:'#dc2626',
};
const dotColor = (type) => DOT[type] || DOT.general;

// ── Notifications dropdown panel ───────────────────────────────────────────
const NotifPanel = ({ onViewAll, onClose }) => {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notif-panel'],
    queryFn:  () => notificationsApi.list({ per_page: 8 }).then(r => r.data),
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess:  () => { qc.invalidateQueries(['notif-panel']); qc.invalidateQueries(['notif-count']); },
  });

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess:  () => { qc.invalidateQueries(['notif-panel']); qc.invalidateQueries(['notif-count']); },
  });

  const items = data?.data || [];
  const unread = items.filter(n => !n.read_at).length;

  return (
    <div className="dropdown" style={{ width: 360, maxHeight: 480, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border-lo)' }}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Notifications</span>
          {unread > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--red)' }}>
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={() => markAll.mutate()} className="text-xs font-medium flex items-center gap-1"
            style={{ color: 'var(--teal)' }}>
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={28} className="mx-auto mb-2" style={{ color: 'var(--ink-faint)' }} />
            <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>No notifications</p>
          </div>
        ) : (
          items.map(n => (
            <div key={n.id}
              className="notif-item flex items-start gap-3 px-4 py-3 border-b group cursor-default"
              style={{ borderColor: 'var(--border-lo)', background: n.read_at ? 'transparent' : 'rgba(13,148,136,.04)' }}>
              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: n.read_at ? 'var(--border)' : dotColor(n.type) }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: n.read_at ? 'var(--ink-soft)' : 'var(--ink)' }}>{n.title}</p>
                <p className="text-xs mt-0.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{n.body}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>{fRelative(n.created_at)}</p>
              </div>
              {!n.read_at && (
                <button onClick={() => markRead.mutate(n.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all flex-shrink-0"
                  style={{ color: 'var(--teal)' }} title="Mark read">
                  <Check size={13} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t flex-shrink-0" style={{ borderColor: 'var(--border-lo)' }}>
        <button onClick={() => { onViewAll(); onClose(); }}
          className="notif-footer w-full text-center text-xs font-semibold py-3"
          style={{ color: 'var(--teal)' }}>
          View all notifications →
        </button>
      </div>
    </div>
  );
};

// ── Main Navbar ────────────────────────────────────────────────────────────
export const Navbar = () => {
  const { user, logout }                                                    = useAuth();
  const { sidebarOpen, toggleSidebar, toggleMobileSidebar, theme, toggleTheme } = useUiStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const dropRef  = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Unread badge count — polling every 30s
  const { data: countData } = useQuery({
    queryKey: ['notif-count'],
    queryFn:  () => notificationsApi.unreadCount().then(r => r.data),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const unreadCount = countData?.data?.count ?? 0;

  useEffect(() => {
    const h = (e) => {
      if (!dropRef.current?.contains(e.target))  setDropdownOpen(false);
      if (!notifRef.current?.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    const result = await swConfirm({ title: 'Sign out?', text: 'You will be returned to the login screen.', confirmText: 'Sign out' });
    if (!result.isConfirmed) return;
    try { await authApi.logout(); } catch {}
    logout();
    swSuccess('Signed out successfully');
    navigate('/login');
  };

  return (
    <header
      className="app-navbar fixed top-0 right-0 z-30 flex items-center px-4 sm:px-5 gap-3 transition-all duration-300"
      style={{
        '--nav-left': sidebarOpen ? 'var(--sidebar-w)' : 'var(--sidebar-w-collapsed)',
        height: 'var(--topbar-h)',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}>

      {/* Mobile hamburger — opens drawer sidebar */}
      <button onClick={toggleMobileSidebar} className="lg:hidden p-2 rounded-lg transition-colors flex-shrink-0"
        style={{ color: 'var(--ink-soft)' }}
        onMouseOver={e => e.currentTarget.style.background = 'var(--canvas)'}
        onMouseOut={e  => e.currentTarget.style.background = ''}>
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      {/* ── Theme toggle ───────────────────────────────────────────── */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg transition-colors"
        style={{ color: 'var(--ink-soft)' }}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onMouseOver={e => e.currentTarget.style.background = 'var(--canvas)'}
        onMouseOut={e  => e.currentTarget.style.background = ''}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* ── Notifications bell ─────────────────────────────────────── */}
      <div className="relative" ref={notifRef}>
        <button onClick={() => setNotifOpen(v => !v)}
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: 'var(--ink-soft)' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--canvas)'}
          onMouseOut={e  => e.currentTarget.style.background = ''}>
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: 'var(--red)', fontSize: '9px', lineHeight: 1 }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="notif-panel-wrap absolute right-0 top-full mt-2" style={{ zIndex: 50 }}>
            <NotifPanel onViewAll={() => navigate('/notifications')} onClose={() => setNotifOpen(false)} />
          </div>
        )}
      </div>

      {/* ── User menu ────────────────────────────────────────────────── */}
      <div className="relative" ref={dropRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 p-1.5 rounded-lg transition-colors"
          onMouseOver={e => e.currentTarget.style.background = 'var(--canvas)'}
          onMouseOut={e  => e.currentTarget.style.background = ''}>
          <Avatar name={user?.name} photo={user?.profile_photo} size="sm" />
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--ink)' }}>{user?.name}</p>
            <p className="text-xs capitalize leading-tight" style={{ color: 'var(--ink-soft)' }}>{user?.role?.replace(/_/g, ' ')}</p>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--ink-faint)' }} />
        </button>

        {dropdownOpen && (
          <div className="dropdown">
            <button onClick={() => { setDropdownOpen(false); navigate('/notifications'); }} className="dropdown-item w-full">
              <Bell size={15} /> Notifications
              {unreadCount > 0 && (
                <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--red)' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => { setDropdownOpen(false); navigate('/settings'); }} className="dropdown-item w-full">
              <Settings size={15} /> Settings
            </button>
            <hr className="my-1" style={{ borderColor: 'var(--border-lo)' }} />
            <button onClick={handleLogout} className="dropdown-item w-full" style={{ color: 'var(--red)' }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
