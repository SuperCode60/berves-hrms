import { useQuery } from '@tanstack/react-query';
import { Users, Clock, Calendar, DollarSign, UserMinus, Timer, UserCog } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { StatCard }        from '../../components/common/StatCard';
import { PageHeader }      from '../../components/layout/PageHeader';
import { Avatar }          from '../../components/common/Avatar';
import { Badge }           from '../../components/common/Badge';
import { HRDashboardPage } from './HRDashboardPage';
import { useAuth }         from '../../hooks/useAuth';
import { useNavigate }     from 'react-router-dom';
import { fCurrency, fDate } from '../../utils';
import api from '../../lib/axios';

const C = ['#0d9488','#2563eb','#d97706','#dc2626','#7c3aed','#059669'];
const TIP = { contentStyle: { fontFamily:'var(--ff-body)', borderRadius:8, border:'1px solid var(--border)', fontSize:12 } };

const EmptyState = ({ msg }) => (
  <div className="py-10 text-center text-sm" style={{ color:'var(--ink-faint)' }}>{msg}</div>
);

/* ── General / Admin dashboard ─────────────────────────────────────────── */
const GeneralDashboard = () => {
  const { user, canViewPayroll, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: stats,   isLoading } = useQuery({ queryKey:['dashboard-stats'],            queryFn:() => api.get('/dashboard/stats').then(r=>r.data.data) });
  const { data: activity            } = useQuery({ queryKey:['dashboard-activity'],         queryFn:() => api.get('/dashboard/activity').then(r=>r.data.data) });
  const { data: chart               } = useQuery({ queryKey:['dashboard-attendance-chart'], queryFn:() => api.get('/dashboard/attendance-chart').then(r=>r.data.data) });
  const { data: recent              } = useQuery({ queryKey:['dashboard-recent-employees'], queryFn:() => api.get('/dashboard/recent-employees').then(r=>r.data.data) });

  const greeting = () => { const h = new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; };

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle={`${fDate(new Date().toISOString())} · Berves Engineering HRMS`}
        actions={isAdmin && (
          <button onClick={() => navigate('/dashboard/hr')} className="btn-secondary btn-sm">
            <UserCog size={14} /> HR Analytics
          </button>
        )}
      />

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Employees" value={stats?.total_employees ?? '—'} icon={Users}
          iconColor="var(--teal)" iconBg="var(--teal-bg)" loading={isLoading}
          change={stats?.employee_change} changeLabel="vs last month" />
        <StatCard label="Present Today" value={stats?.present_today ?? '—'} icon={Clock}
          iconColor="var(--emerald)" iconBg="var(--emerald-bg)" loading={isLoading} />
        <StatCard label="Absent Today" value={stats?.absent_today ?? '—'} icon={UserMinus}
          iconColor="var(--red)" iconBg="var(--red-bg)" loading={isLoading} />
        {canViewPayroll
          ? <StatCard label="Payroll This Month" value={fCurrency(stats?.payroll_total)} icon={DollarSign}
              iconColor="var(--blue)" iconBg="var(--blue-bg)" loading={isLoading} />
          : <StatCard label="Pending Leave" value={stats?.pending_leave ?? '—'} icon={Calendar}
              iconColor="var(--amber)" iconBg="var(--amber-bg)" loading={isLoading} />
        }
      </div>

      {/* ── Attendance chart + Department pie ───────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="card xl:col-span-2">
          <div className="card-header">
            <h3 className="font-semibold" style={{ color:'var(--ink)' }}>Attendance — Last 7 Days</h3>
            {stats?.late_today > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:'var(--amber-bg)', color:'var(--amber)' }}>
                <Timer size={10} className="inline mr-1" />{stats.late_today} late today
              </span>
            )}
          </div>
          <div className="card-body pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chart || []} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-lo)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize:12, fill:'var(--ink-soft)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:12, fill:'var(--ink-soft)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...TIP} />
                <Legend iconSize={8} iconType="square" wrapperStyle={{ fontSize:12, paddingTop:8 }} />
                <Bar dataKey="present" fill="#0d9488" radius={[3,3,0,0]} name="Present" />
                <Bar dataKey="late"    fill="#d97706" radius={[3,3,0,0]} name="Late"    />
                <Bar dataKey="absent"  fill="#e2e8f0" radius={[3,3,0,0]} name="Absent"  />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="font-semibold" style={{ color:'var(--ink)' }}>By Department</h3></div>
          <div className="card-body pt-0">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={stats?.by_department || []} dataKey="count" nameKey="name"
                  cx="50%" cy="50%" outerRadius={70} paddingAngle={2}>
                  {(stats?.by_department || []).map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                </Pie>
                <Tooltip {...TIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-1">
              {(stats?.by_department || []).slice(0, 5).map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: C[i % C.length] }} />
                    <span className="truncate max-w-[120px]" style={{ color:'var(--ink-soft)' }}>{d.name}</span>
                  </div>
                  <span className="font-semibold" style={{ color:'var(--ink)' }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Pending approvals + Recent hires ────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold" style={{ color:'var(--ink)' }}>Pending Approvals</h3>
            {stats?.pending_leave > 0 && (
              <span className="badge badge-yellow">{stats.pending_leave}</span>
            )}
          </div>
          <div className="divide-y" style={{ borderColor:'var(--border-lo)' }}>
            {!(stats?.pending_approvals?.length)
              ? <EmptyState msg="No pending approvals" />
              : stats.pending_approvals.map((item, i) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color:'var(--ink)' }}>{item.employee_name}</p>
                    <p className="text-xs" style={{ color:'var(--ink-soft)' }}>{item.type} · {fDate(item.created_at)}</p>
                  </div>
                  <Badge status={item.status} />
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="font-semibold" style={{ color:'var(--ink)' }}>Recent Hires</h3></div>
          <div className="divide-y" style={{ borderColor:'var(--border-lo)' }}>
            {!(recent?.length)
              ? <EmptyState msg="No recent hires" />
              : recent.map((e, i) => (
                <div key={i} className="px-6 py-3 flex items-center gap-3">
                  <Avatar name={e.name} photo={e.profile_photo} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color:'var(--ink)' }}>{e.name}</p>
                    <p className="text-xs truncate" style={{ color:'var(--ink-soft)' }}>{e.department || '—'}</p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color:'var(--ink-faint)' }}>{fDate(e.hire_date)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ── Recent activity ──────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header"><h3 className="font-semibold" style={{ color:'var(--ink)' }}>Recent Activity</h3></div>
        <div className="divide-y" style={{ borderColor:'var(--border-lo)' }}>
          {!(activity?.length)
            ? <EmptyState msg="No recent activity" />
            : activity.slice(0, 6).map((item, i) => (
              <div key={i} className="px-6 py-3 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background:'var(--teal)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color:'var(--ink)' }}>{item.user}</p>
                  <p className="text-xs" style={{ color:'var(--ink-soft)' }}>{item.action}</p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color:'var(--ink-faint)' }}>{item.timestamp}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

/* ── Role router ────────────────────────────────────────────────────────── */
export const DashboardPage = () => {
  const { isHR } = useAuth();
  return isHR ? <HRDashboardPage /> : <GeneralDashboard />;
};
