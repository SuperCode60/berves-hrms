import { useQuery } from '@tanstack/react-query';
import {
  Users, UserPlus, AlertTriangle,
  Clock, CalendarCheck, ArrowLeft,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { StatCard }   from '../../components/common/StatCard';
import { PageHeader } from '../../components/layout/PageHeader';
import { Avatar }     from '../../components/common/Avatar';
import { useAuth }    from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { fDate }      from '../../utils';
import api            from '../../lib/axios';

const C = {
  teal:   '#0d9488',
  blue:   '#2563eb',
  amber:  '#d97706',
  red:    '#dc2626',
  violet: '#7c3aed',
  green:  '#059669',
  slate:  '#64748b',
};
const TYPE_COLORS  = { permanent: C.teal,  contract: C.blue,   site_based: C.violet };
const STATUS_COLORS= { active: C.green, on_leave: C.amber, terminated: C.red, suspended: C.slate };
const PIE_COLORS   = [C.teal, C.blue, C.violet, C.amber, C.red, C.green];

const TIP = { contentStyle: { fontFamily:'var(--ff-body)', borderRadius:8, border:'1px solid var(--border)', fontSize:12 } };

const SectionTitle = ({ children }) => (
  <h3 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{children}</h3>
);

const EmptyState = ({ msg = 'Nothing to show' }) => (
  <div className="py-8 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>{msg}</div>
);

const DaysChip = ({ days }) => {
  const color = days <= 7 ? 'var(--red)' : days <= 14 ? 'var(--amber)' : 'var(--ink-soft)';
  return <span className="text-xs font-semibold" style={{ color }}>{days}d left</span>;
};

export const HRDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: hr,    isLoading: hrLoading    } = useQuery({ queryKey:['hr-stats'],    queryFn:() => api.get('/dashboard/hr-stats').then(r=>r.data.data) });
  const { data: trend, isLoading: trendLoading } = useQuery({ queryKey:['leave-trend'], queryFn:() => api.get('/dashboard/leave-trend').then(r=>r.data.data) });
  const { data: chart                           } = useQuery({ queryKey:['dashboard-attendance-chart'], queryFn:() => api.get('/dashboard/attendance-chart').then(r=>r.data.data) });

  const greeting = () => { const h = new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; };

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle={`${fDate(new Date().toISOString())} · HR Analytics Dashboard`}
        actions={isAdmin && (
          <button onClick={() => navigate('/dashboard')} className="btn-secondary btn-sm">
            <ArrowLeft size={14} /> Overview
          </button>
        )}
      />

      {/* ── Stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Employees"    value={hr?.active_employees    ?? '—'} icon={Users}         iconColor={C.teal}  iconBg="var(--teal-bg)"   loading={hrLoading} />
        <StatCard label="On Leave Today"      value={hr?.on_leave_today      ?? '—'} icon={CalendarCheck}  iconColor={C.amber} iconBg="var(--amber-bg)"  loading={hrLoading} />
        <StatCard label="New Hires (month)"   value={hr?.new_this_month      ?? '—'} icon={UserPlus}       iconColor={C.blue}  iconBg="var(--blue-bg)"   loading={hrLoading} />
        <StatCard label="Contracts Expiring"  value={hr?.contracts_expiring  ?? '—'} icon={AlertTriangle}  iconColor={C.red}   iconBg="var(--red-bg)"    loading={hrLoading}
          changeLabel="next 30 days" />
      </div>

      {/* ── Leave trend + Employment type ─────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Area chart – leave trend */}
        <div className="card xl:col-span-2">
          <div className="card-header"><SectionTitle>Leave Requests — Last 6 Months</SectionTitle></div>
          <div className="card-body pt-0">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={trend || []} margin={{ top:10, right:10, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="gApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.teal}  stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={C.teal}  stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.amber} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={C.amber} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.red}   stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={C.red}   stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-lo)" />
                <XAxis dataKey="month" tick={{ fontSize:12, fill:'var(--ink-soft)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:12, fill:'var(--ink-soft)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...TIP} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize:12, paddingTop:8 }} />
                <Area type="monotone" dataKey="approved" stroke={C.teal}  strokeWidth={2} fill="url(#gApproved)" name="Approved" />
                <Area type="monotone" dataKey="pending"  stroke={C.amber} strokeWidth={2} fill="url(#gPending)"  name="Pending"  />
                <Area type="monotone" dataKey="rejected" stroke={C.red}   strokeWidth={2} fill="url(#gRejected)" name="Rejected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut – employment type */}
        <div className="card">
          <div className="card-header"><SectionTitle>Employment Type</SectionTitle></div>
          <div className="card-body pt-0 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={hr?.by_employment_type || []} dataKey="count" nameKey="name"
                  cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {(hr?.by_employment_type || []).map((entry, i) => (
                    <Cell key={i} fill={TYPE_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TIP} formatter={(v, n) => [v, n.replace(/_/g,' ')]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 w-full mt-1">
              {(hr?.by_employment_type || []).map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[t.name] || PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="capitalize" style={{ color:'var(--ink-soft)' }}>{t.name.replace(/_/g,' ')}</span>
                  </div>
                  <span className="font-semibold" style={{ color:'var(--ink)' }}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Attendance this week + Department headcount ────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="card xl:col-span-2">
          <div className="card-header"><SectionTitle>Attendance This Week</SectionTitle></div>
          <div className="card-body pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chart || []} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-lo)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize:12, fill:'var(--ink-soft)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:12, fill:'var(--ink-soft)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...TIP} />
                <Legend iconSize={8} iconType="square" wrapperStyle={{ fontSize:12, paddingTop:8 }} />
                <Bar dataKey="present" fill={C.teal}  radius={[3,3,0,0]} name="Present" />
                <Bar dataKey="late"    fill={C.amber} radius={[3,3,0,0]} name="Late"    />
                <Bar dataKey="absent"  fill="#e2e8f0" radius={[3,3,0,0]} name="Absent"  />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department headcount */}
        <div className="card">
          <div className="card-header"><SectionTitle>Headcount by Dept.</SectionTitle></div>
          <div className="card-body pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart layout="vertical" data={(hr?.by_department || []).slice(0,6)} margin={{ top:0, right:10, left:0, bottom:0 }}>
                <XAxis type="number" tick={{ fontSize:11, fill:'var(--ink-soft)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:'var(--ink-soft)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip {...TIP} />
                <Bar dataKey="count" fill={C.blue} radius={[0,3,3,0]} name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Expiry lists + Recent hires ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Contracts expiring */}
        <div className="card">
          <div className="card-header">
            <SectionTitle>Contracts Expiring (30d)</SectionTitle>
            {hr?.contracts_expiring > 0 && (
              <span className="badge badge-red">{hr.contracts_expiring}</span>
            )}
          </div>
          <div className="divide-y" style={{ borderColor:'var(--border-lo)' }}>
            {!(hr?.contracts_expiring_list?.length)
              ? <EmptyState msg="No contracts expiring soon" />
              : hr.contracts_expiring_list.map((e, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color:'var(--ink)' }}>{e.name}</p>
                    <p className="text-xs" style={{ color:'var(--ink-soft)' }}>{e.department || '—'}</p>
                    <p className="text-xs mt-0.5" style={{ color:'var(--ink-faint)' }}>Ends {fDate(e.contract_end)}</p>
                  </div>
                  <DaysChip days={e.days_remaining} />
                </div>
              ))}
          </div>
        </div>

        {/* Probation ending */}
        <div className="card">
          <div className="card-header">
            <SectionTitle>Probation Ending (30d)</SectionTitle>
            {hr?.probation_ending > 0 && (
              <span className="badge badge-yellow">{hr.probation_ending}</span>
            )}
          </div>
          <div className="divide-y" style={{ borderColor:'var(--border-lo)' }}>
            {!(hr?.probation_ending_list?.length)
              ? <EmptyState msg="No probation periods ending soon" />
              : hr.probation_ending_list.map((e, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color:'var(--ink)' }}>{e.name}</p>
                    <p className="text-xs" style={{ color:'var(--ink-soft)' }}>{e.department || '—'}</p>
                    <p className="text-xs mt-0.5" style={{ color:'var(--ink-faint)' }}>Ends {fDate(e.probation_end)}</p>
                  </div>
                  <DaysChip days={e.days_remaining} />
                </div>
              ))}
          </div>
        </div>

        {/* Recent hires */}
        <div className="card">
          <div className="card-header"><SectionTitle>Recent Hires</SectionTitle></div>
          <div className="divide-y" style={{ borderColor:'var(--border-lo)' }}>
            {!(hr?.recent_hires?.length)
              ? <EmptyState msg="No recent hires" />
              : hr.recent_hires.map((e, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <Avatar name={e.name} photo={e.photo} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color:'var(--ink)' }}>{e.name}</p>
                    <p className="text-xs truncate" style={{ color:'var(--ink-soft)' }}>{e.job_title || e.department || '—'}</p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color:'var(--ink-faint)' }}>{fDate(e.hire_date)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
