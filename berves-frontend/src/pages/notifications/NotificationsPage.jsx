import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { notificationsApi } from '../../api/notifications';
import { PageHeader }       from '../../components/layout/PageHeader';
import { Button }           from '../../components/common/Button';
import { fRelative }        from '../../utils';
import { swSuccess, swError, swConfirm } from '../../lib/swal';

// ── Notification type config ───────────────────────────────────────────────
const TYPE_CONFIG = {
  general:       { label: 'General',         bg: 'var(--blue-bg)',    color: 'var(--blue)',    dot: '#2563eb' },
  leave:         { label: 'Leave',           bg: 'var(--emerald-bg)', color: 'var(--emerald)', dot: '#059669' },
  payslip:       { label: 'Payslip',         bg: 'var(--teal-bg)',    color: 'var(--teal)',    dot: '#0d9488' },
  overtime:      { label: 'Overtime',        bg: 'var(--violet-bg)',  color: 'var(--violet)',  dot: '#7c3aed' },
  certification: { label: 'Certification',   bg: 'var(--amber-bg)',   color: 'var(--amber)',   dot: '#d97706' },
  safety:        { label: 'Safety',          bg: 'var(--red-bg)',     color: 'var(--red)',     dot: '#dc2626' },
  performance:   { label: 'Performance',     bg: 'var(--orange-bg)',  color: 'var(--orange)',  dot: '#c2410c' },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.general;

// ── Single notification row ────────────────────────────────────────────────
const NotifRow = ({ notif, onMarkRead, onDelete }) => {
  const cfg  = getConfig(notif.type);
  const read = !!notif.read_at;

  return (
    <div className="flex items-start gap-4 p-4 transition-colors rounded-xl group"
      style={{ background: read ? 'transparent' : 'rgba(13,148,136,0.04)', opacity: read ? 0.7 : 1 }}>
      {/* Type indicator dot */}
      <div className="flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full" style={{ background: read ? 'var(--border)' : cfg.dot }} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug" style={{ color: read ? 'var(--ink-soft)' : 'var(--ink)' }}>
            {notif.title}
          </p>
          <span className="text-xs flex-shrink-0" style={{ color: 'var(--ink-faint)' }}>
            {fRelative(notif.created_at)}
          </span>
        </div>
        <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{notif.body}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
          {notif.channel && notif.channel !== 'database' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'var(--canvas)', color: 'var(--ink-faint)' }}>
              via {notif.channel}
            </span>
          )}
        </div>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!read && (
          <button onClick={() => onMarkRead(notif.id)} title="Mark read"
            className="p-1.5 rounded-lg"
            style={{ color: 'var(--teal)' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--canvas)'}
            onMouseOut={e  => e.currentTarget.style.background = ''}>
            <Check size={14} />
          </button>
        )}
        <button onClick={() => onDelete(notif.id)} title="Delete"
          className="p-1.5 rounded-lg"
          style={{ color: 'var(--red)' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--canvas)'}
          onMouseOut={e  => e.currentTarget.style.background = ''}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────
export const NotificationsPage = () => {
  const qc             = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn:  () => notificationsApi.list({
      unread_only: filter === 'unread' ? 1 : undefined,
      per_page: 50,
    }).then(r => r.data),
    refetchInterval: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess:  () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['notif-count']);
    },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess:  () => {
      swSuccess('All notifications marked as read.');
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['notif-count']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess:  () => qc.invalidateQueries(['notifications']),
    onError:    () => swError('Could not delete notification.'),
  });

  const handleDelete = async (id) => {
    const res = await swConfirm({ title: 'Delete this notification?', confirmText: 'Delete', isDanger: true });
    if (res.isConfirmed) deleteMutation.mutate(id);
  };

  const all  = data?.data || [];
  const types = [...new Set(all.map(n => n.type))];

  const filtered = all.filter(n =>
    (typeFilter === 'all' || n.type === typeFilter)
  );

  const unreadCount = all.filter(n => !n.read_at).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
        actions={unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar filters ──────────────────────────────────────────── */}
        <div className="w-full lg:w-56 flex-shrink-0 space-y-2">
          <div className="card p-3">
            <p className="text-xs font-semibold uppercase tracking-wide px-2 mb-2" style={{ color: 'var(--ink-faint)' }}>
              Show
            </p>
            {[['all', 'All', all.length], ['unread', 'Unread', unreadCount]].map(([key, label, count]) => (
              <button key={key} onClick={() => setFilter(key)}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm font-medium transition-colors"
                style={filter === key
                  ? { background: 'var(--teal)', color: '#fff' }
                  : { color: 'var(--ink-soft)' }}>
                <span>{label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: filter === key ? 'rgba(255,255,255,.25)' : 'var(--border-lo)', color: filter === key ? '#fff' : 'var(--ink-faint)' }}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {types.length > 0 && (
            <div className="card p-3">
              <p className="text-xs font-semibold uppercase tracking-wide px-2 mb-2" style={{ color: 'var(--ink-faint)' }}>
                Type
              </p>
              {[['all', 'All Types'], ...types.map(t => [t, getConfig(t).label])].map(([key, label]) => (
                <button key={key} onClick={() => setTypeFilter(key)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={typeFilter === key
                    ? { background: 'var(--teal-bg)', color: 'var(--teal)' }
                    : { color: 'var(--ink-soft)' }}>
                  {key !== 'all' && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getConfig(key).dot }} />
                  )}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Notifications list ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="card divide-y" style={{ divideColor: 'var(--border-lo)' }}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: 'var(--border)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-1/2" style={{ background: 'var(--border)' }} />
                    <div className="h-3 rounded w-3/4" style={{ background: 'var(--border)' }} />
                    <div className="h-3 rounded w-1/4" style={{ background: 'var(--border)' }} />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center">
                <Bell size={36} className="mx-auto mb-3" style={{ color: 'var(--ink-faint)' }} />
                <p className="font-semibold" style={{ color: 'var(--ink-soft)' }}>
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--ink-faint)' }}>
                  {filter === 'unread' ? "You're all caught up!" : 'Notifications will appear here.'}
                </p>
              </div>
            ) : (
              filtered.map(n => (
                <NotifRow
                  key={n.id}
                  notif={n}
                  onMarkRead={(id) => markReadMutation.mutate(id)}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {data?.meta && data.meta.total > data.meta.per_page && (
            <p className="text-center text-sm mt-4" style={{ color: 'var(--ink-faint)' }}>
              Showing {filtered.length} of {data.meta.total} notifications
            </p>
          )}
        </div>
      </div>
    </div>
  );
};