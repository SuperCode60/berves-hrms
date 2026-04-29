import { useState } from 'react';
import { useQuery }   from '@tanstack/react-query';
import { Download, FileText, Sheet, Printer, TrendingUp, Users, Clock, Calendar } from 'lucide-react';
import { reportsApi }  from '../../api/reports';
import { PageHeader }  from '../../components/layout/PageHeader';
import { Avatar }      from '../../components/common/Avatar';
import { fCurrency, fDate, fNumber, fPercent, downloadBlob, exportCsvClient } from '../../utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { swError, swSuccess, swLoading, swClose } from '../../lib/swal';

/* ── chart theme ── */
const CHART_COLORS = ['#0d9488','#2563eb','#7c3aed','#d97706','#dc2626','#059669'];
const ttStyle = {
  fontFamily: 'var(--ff-body)', borderRadius: 10,
  border: '1px solid var(--border)', fontSize: 12,
  background: 'var(--surface)', color: 'var(--ink)',
};
const axTick = { fontSize: 11, fill: 'var(--ink-soft)', fontFamily: 'var(--ff-body)' };

/* ── stat card ── */
const StatCard = ({ label, value, sub, bg, color, icon: Icon }) => (
  <div className="card p-5" style={{ background: bg }}>
    <div className="flex items-start justify-between mb-2">
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color, opacity: 0.7 }}>{label}</p>
      {Icon && <Icon size={16} style={{ color, opacity: 0.5 }} />}
    </div>
    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    {sub && <p className="text-xs mt-1" style={{ color, opacity: 0.6 }}>{sub}</p>}
  </div>
);

/* ── export helpers ── */
const getContentType = (blob) => {
  if (blob?.type?.includes('html'))  return 'html';
  if (blob?.type?.includes('csv'))   return 'csv';
  if (blob?.type?.includes('pdf'))   return 'pdf';
  return 'blob';
};

/* ══════════════════════════════════════════════════════════ */
export const ReportsPage = () => {
  const [tab,   setTab]   = useState('payroll');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  /* ── data queries ── */
  const payrollQ    = useQuery({ queryKey: ['report-payroll',    month], enabled: tab === 'payroll',    queryFn: () => reportsApi.payrollSummary({ month }).then(r => r.data.data) });
  const attendanceQ = useQuery({ queryKey: ['report-attendance', month], enabled: tab === 'attendance', queryFn: () => reportsApi.attendanceSummary({ month }).then(r => r.data.data) });
  const leaveQ      = useQuery({ queryKey: ['report-leave',      month], enabled: tab === 'leave',      queryFn: () => reportsApi.leaveReport({ month }).then(r => r.data.data) });
  const overtimeQ   = useQuery({ queryKey: ['report-overtime',   month], enabled: tab === 'overtime',   queryFn: () => reportsApi.overtimeReport({ month }).then(r => r.data.data) });
  const headcountQ  = useQuery({ queryKey: ['report-headcount'],          enabled: tab === 'headcount',  queryFn: () => reportsApi.headcountReport().then(r => r.data.data) });

  /* ── export: server PDF/CSV with client-side fallback ── */
  const handleExport = async (format) => {
    const label = format === 'pdf' ? 'PDF' : format === 'csv' ? 'CSV' : 'Excel';
    swLoading(`Generating ${label}…`);
    try {
      let res;
      if (format === 'pdf')   res = await reportsApi.exportPdf(tab, { month });
      else if (format === 'csv') res = await reportsApi.exportCsv(tab, { month });
      else                       res = await reportsApi.exportExcel(tab, { month });

      swClose();

      const blobType = getContentType(res.data);

      // If server returned printable HTML (DomPDF not installed), open in new tab
      if (blobType === 'html') {
        const url  = URL.createObjectURL(res.data);
        const win  = window.open(url, '_blank');
        if (!win) { swError('Popup blocked — allow popups for this site and try again.'); return; }
        win.addEventListener('load', () => {
          setTimeout(() => { try { win.print(); } catch {} }, 500);
        });
        swSuccess('Print dialog opening — use "Save as PDF" to export.');
        return;
      }

      // Normal blob download
      const ext = format === 'pdf' ? 'pdf' : 'csv';
      downloadBlob(res.data, `${tab}-report-${month}.${ext}`);
      swSuccess(`${label} downloaded!`);
    } catch (err) {
      swClose();
      // Client-side CSV fallback when server fails entirely
      if (format === 'csv' || format === 'excel') {
        handleClientCsv();
      } else {
        swError(err?.response?.data?.message || 'Export failed. Try CSV instead.');
      }
    }
  };

  /* ── pure client-side CSV (always available, zero server dependency) ── */
  const handleClientCsv = () => {
    try {
      let rows = [];
      if (tab === 'payroll' && payrollQ.data) {
        rows = [
          ['Employee', 'Employee No.', 'Department', 'Basic (GHS)', 'Allowances (GHS)',
           'Overtime (GHS)', 'Gross (GHS)', 'Deductions (GHS)', 'Net Pay (GHS)', 'Status'],
          ...(payrollQ.data.runs || []).map(r => [
            r.name, r.employee_number, r.department,
            r.basic_salary, r.total_allowances, r.overtime_pay,
            r.gross_pay, r.total_deductions, r.net_pay, r.payment_status,
          ]),
          [],
          ['TOTAL','','','','','', payrollQ.data.total_gross,
           payrollQ.data.total_deductions, payrollQ.data.total_net, ''],
        ];
      } else if (tab === 'attendance' && attendanceQ.data) {
        rows = [
          ['Date','Present','Absent','Late','Rate (%)'],
          ...(attendanceQ.data.trend || []).map(r => [r.date, r.present, r.absent ?? 0, r.late ?? 0, r.rate]),
        ];
      } else if (tab === 'leave' && leaveQ.data) {
        rows = [
          ['Employee','Department','Leave Type','Start','End','Days','Status'],
          ...(leaveQ.data.detail || []).map(r => [r.employee, r.department, r.type, r.start_date, r.end_date, r.days, r.status]),
        ];
      } else if (tab === 'overtime' && overtimeQ.data) {
        rows = [
          ['Employee','Dept','Date','Day Type','Hours','Rate×','Amount (GHS)','Approved'],
          ...(overtimeQ.data.records || []).map(r => [
            r.employee, r.department, r.date, r.day_type,
            r.hours, r.rate_multiplier, r.amount, r.approved_by ? 'Yes' : 'No',
          ]),
          [],['TOTAL','','','', overtimeQ.data.total_hours, '', overtimeQ.data.total_amount,''],
        ];
      } else if (tab === 'headcount' && headcountQ.data) {
        rows = [
          ['Category','Value'],
          ['Total Employees', headcountQ.data.total],
          ['Active', headcountQ.data.active],
          [],
          ['Department','Count'],
          ...(headcountQ.data.by_dept || []).map(d => [d.name, d.count]),
        ];
      } else {
        swError('No data loaded for this tab. Select the tab first, wait for data, then export.');
        return;
      }
      exportCsvClient(rows, `${tab}-report-${month}.csv`);
      swSuccess('CSV exported from browser!');
    } catch {
      swError('Export failed.');
    }
  };

  /* ── print ── */
  const handlePrint = () => window.print();

  /* ── loading spinner ── */
  const Spinner = () => (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
        style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
    </div>
  );

  const TABS = [
    { key: 'payroll',    label: 'Payroll',    icon: TrendingUp },
    { key: 'attendance', label: 'Attendance', icon: Clock },
    { key: 'leave',      label: 'Leave',      icon: Calendar },
    { key: 'overtime',   label: 'Overtime',   icon: Clock },
    { key: 'headcount',  label: 'Headcount',  icon: Users },
  ];

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate, visualise, and export payroll, attendance and HR reports"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="btn-secondary btn-sm flex items-center gap-1.5">
              <Printer size={13} /> Print
            </button>
            <button onClick={() => handleExport('csv')}
              className="btn-secondary btn-sm flex items-center gap-1.5">
              <Sheet size={13} /> CSV
            </button>
            <button onClick={() => handleExport('excel')}
              className="btn-secondary btn-sm flex items-center gap-1.5">
              <Download size={13} /> Excel
            </button>
            <button onClick={() => handleExport('pdf')}
              className="btn-primary btn-sm flex items-center gap-1.5">
              <FileText size={13} /> PDF
            </button>
          </div>
        }
      />

      {/* ── Tabs + month picker ── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex flex-1 border-b" style={{ borderColor: 'var(--border)' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={tab === key
                ? { borderColor: 'var(--teal)', color: 'var(--teal)' }
                : { borderColor: 'transparent', color: 'var(--ink-soft)' }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <label className="text-xs font-semibold uppercase" style={{ color: 'var(--ink-soft)' }}>Period</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="input text-sm" style={{ width: 150 }} />
        </div>
      </div>

      {/* ══ PAYROLL ══ */}
      {tab === 'payroll' && (
        payrollQ.isLoading ? <Spinner /> : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Gross"      value={fCurrency(payrollQ.data?.total_gross)}      bg="var(--blue-bg)"    color="var(--blue)"    icon={TrendingUp} />
              <StatCard label="Total Deductions" value={fCurrency(payrollQ.data?.total_deductions)} bg="var(--red-bg)"     color="var(--red)"     icon={Download} />
              <StatCard label="Total Net Pay"    value={fCurrency(payrollQ.data?.total_net)}        bg="var(--emerald-bg)" color="var(--emerald)" icon={TrendingUp} />
              <StatCard label="Employees Paid"   value={fNumber(payrollQ.data?.employee_count)}     bg="var(--teal-bg)"    color="var(--teal)"    icon={Users} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card p-5">
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>Net Pay by Department</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={payrollQ.data?.by_department || []} margin={{ left: 10 }}>
                    <XAxis dataKey="name" tick={axTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axTick} axisLine={false} tickLine={false}
                      tickFormatter={v => 'GHS ' + (v / 1000).toFixed(0) + 'k'} />
                    <Tooltip contentStyle={ttStyle} formatter={v => fCurrency(v)} />
                    <Bar dataKey="net_pay" name="Net Pay" fill="var(--teal)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>Gross vs. Deductions</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={payrollQ.data?.by_department || []} margin={{ left: 10 }}>
                    <XAxis dataKey="name" tick={axTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axTick} axisLine={false} tickLine={false}
                      tickFormatter={v => 'GHS ' + (v / 1000).toFixed(0) + 'k'} />
                    <Tooltip contentStyle={ttStyle} formatter={v => fCurrency(v)} />
                    <Bar dataKey="gross_pay"  name="Gross"      fill="var(--blue)"    radius={[5,5,0,0]} />
                    <Bar dataKey="deductions" name="Deductions" fill="var(--red)"     radius={[5,5,0,0]} />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--ff-body)' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detail table */}
            {(payrollQ.data?.runs || []).length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Employee Detail</h3>
                </div>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th><th>Department</th>
                        <th className="text-right">Basic</th><th className="text-right">Allowances</th>
                        <th className="text-right">OT</th><th className="text-right">Gross</th>
                        <th className="text-right">Deductions</th><th className="text-right">Net Pay</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollQ.data.runs.map((r, i) => (
                        <tr key={i}>
                          <td className="font-medium">{r.name}</td>
                          <td className="text-xs" style={{ color: 'var(--ink-soft)' }}>{r.department}</td>
                          <td className="text-right">{fCurrency(r.basic_salary)}</td>
                          <td className="text-right">{fCurrency(r.total_allowances)}</td>
                          <td className="text-right">{fCurrency(r.overtime_pay)}</td>
                          <td className="text-right font-semibold">{fCurrency(r.gross_pay)}</td>
                          <td className="text-right" style={{ color: 'var(--red)' }}>-{fCurrency(r.total_deductions)}</td>
                          <td className="text-right font-bold" style={{ color: 'var(--emerald)' }}>{fCurrency(r.net_pay)}</td>
                          <td><span className={`badge badge-${r.payment_status === 'paid' ? 'green' : 'yellow'}`}>{r.payment_status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: 'var(--canvas)', borderTop: '2px solid var(--border)' }}>
                        <td colSpan={5} className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--ink)' }}>TOTAL</td>
                        <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: 'var(--blue)' }}>{fCurrency(payrollQ.data.total_gross)}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: 'var(--red)' }}>-{fCurrency(payrollQ.data.total_deductions)}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: 'var(--emerald)' }}>{fCurrency(payrollQ.data.total_net)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* ══ ATTENDANCE ══ */}
      {tab === 'attendance' && (
        attendanceQ.isLoading ? <Spinner /> : (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Working Days" value={attendanceQ.data?.working_days || 0} bg="var(--blue-bg)"    color="var(--blue)"    icon={Calendar} />
              <StatCard label="Avg Rate"     value={fPercent(attendanceQ.data?.avg_rate)} bg="var(--emerald-bg)" color="var(--emerald)" icon={TrendingUp} />
              <StatCard label="Late Arrivals"value={attendanceQ.data?.total_late || 0}    bg="var(--amber-bg)"   color="var(--amber)"   icon={Clock} />
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>Daily Attendance Rate</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={attendanceQ.data?.trend || []} margin={{ left: 10 }}>
                  <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false}
                    interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={axTick} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={ttStyle} formatter={v => `${v}%`} />
                  <Line type="monotone" dataKey="rate" name="Attendance %" stroke="var(--teal)"
                    strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>Present vs Absent</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={attendanceQ.data?.trend || []} margin={{ left: 10 }}>
                  <XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false}
                    interval="preserveStartEnd" />
                  <YAxis tick={axTick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={ttStyle} />
                  <Bar dataKey="present" name="Present" fill="var(--emerald)" radius={[3,3,0,0]} stackId="a" />
                  <Bar dataKey="absent"  name="Absent"  fill="var(--red)"     radius={[3,3,0,0]} stackId="a" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {(attendanceQ.data?.by_department || []).length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>By Department</h3>
                </div>
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>Department</th><th className="text-right">Expected</th><th className="text-right">Present</th><th className="text-right">Absent</th><th className="text-right">Rate</th></tr></thead>
                    <tbody>
                      {attendanceQ.data.by_department.map((d, i) => (
                        <tr key={i}>
                          <td className="font-medium">{d.name}</td>
                          <td className="text-right">{d.total}</td>
                          <td className="text-right" style={{ color: 'var(--emerald)' }}>{d.present}</td>
                          <td className="text-right" style={{ color: 'var(--red)' }}>{d.absent}</td>
                          <td className="text-right font-semibold">{d.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* ══ LEAVE ══ */}
      {tab === 'leave' && (
        leaveQ.isLoading ? <Spinner /> : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Total Days"     value={leaveQ.data?.total_days || 0}     bg="var(--violet-bg)"  color="var(--violet)" icon={Calendar} />
              <StatCard label="Total Requests" value={leaveQ.data?.total_requests || 0} bg="var(--blue-bg)"    color="var(--blue)"   icon={Users} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card p-5">
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>Days by Leave Type</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={leaveQ.data?.by_type || []} margin={{ left: 10 }}>
                    <XAxis dataKey="type" tick={axTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axTick} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={ttStyle} />
                    <Bar dataKey="days" name="Days" fill="var(--violet)" radius={[5,5,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>Requests Distribution</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={leaveQ.data?.by_type || []} cx="50%" cy="50%" outerRadius={90}
                      dataKey="count" nameKey="type" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      labelLine={false}>
                      {(leaveQ.data?.by_type || []).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={ttStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {(leaveQ.data?.detail || []).length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Leave Records</h3>
                </div>
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>Employee</th><th>Department</th><th>Type</th><th>Start</th><th>End</th><th className="text-right">Days</th><th>Status</th></tr></thead>
                    <tbody>
                      {leaveQ.data.detail.map((r, i) => (
                        <tr key={i}>
                          <td className="font-medium">{r.employee}</td>
                          <td className="text-xs" style={{ color: 'var(--ink-soft)' }}>{r.department}</td>
                          <td>{r.type}</td>
                          <td>{r.start_date}</td>
                          <td>{r.end_date}</td>
                          <td className="text-right font-semibold">{r.days}</td>
                          <td><span className={`badge badge-${r.status === 'approved' ? 'green' : 'yellow'}`}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* ══ OVERTIME ══ */}
      {tab === 'overtime' && (
        overtimeQ.isLoading ? <Spinner /> : (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Records"      value={overtimeQ.data?.total_records || 0}           bg="var(--amber-bg)"   color="var(--amber)"   icon={Clock} />
              <StatCard label="Total Hours"  value={`${Number(overtimeQ.data?.total_hours || 0).toFixed(1)}h`} bg="var(--blue-bg)"    color="var(--blue)"    icon={Clock} />
              <StatCard label="Total Amount" value={fCurrency(overtimeQ.data?.total_amount)}      bg="var(--emerald-bg)" color="var(--emerald)" icon={TrendingUp} />
            </div>

            {(overtimeQ.data?.records || []).length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Overtime Records</h3>
                </div>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr><th>Employee</th><th>Department</th><th>Date</th><th>Type</th>
                          <th className="text-right">Hours</th><th className="text-right">Rate×</th>
                          <th className="text-right">Amount</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {overtimeQ.data.records.map((r, i) => (
                        <tr key={i}>
                          <td className="font-medium">{r.employee}</td>
                          <td className="text-xs" style={{ color: 'var(--ink-soft)' }}>{r.department}</td>
                          <td>{r.date}</td>
                          <td className="capitalize text-xs">{r.day_type?.replace(/_/g,' ')}</td>
                          <td className="text-right font-mono">{r.hours}h</td>
                          <td className="text-right font-mono">{r.rate_multiplier}×</td>
                          <td className="text-right font-semibold" style={{ color: 'var(--emerald)' }}>{fCurrency(r.amount)}</td>
                          <td>{r.approved_by ? <span className="badge badge-green">Approved</span> : <span className="badge badge-yellow">Pending</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: 'var(--canvas)', borderTop: '2px solid var(--border)' }}>
                        <td colSpan={4} className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--ink)' }}>TOTAL</td>
                        <td className="px-4 py-3 text-right text-sm font-bold">{Number(overtimeQ.data.total_hours).toFixed(1)}h</td>
                        <td />
                        <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: 'var(--emerald)' }}>{fCurrency(overtimeQ.data.total_amount)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* ══ HEADCOUNT ══ */}
      {tab === 'headcount' && (
        headcountQ.isLoading ? <Spinner /> : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Total Employees" value={fNumber(headcountQ.data?.total)}  bg="var(--blue-bg)"    color="var(--blue)"    icon={Users} />
              <StatCard label="Active"           value={fNumber(headcountQ.data?.active)} bg="var(--emerald-bg)" color="var(--emerald)" icon={Users} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card p-5">
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>By Department</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={headcountQ.data?.by_dept || []} layout="vertical" margin={{ left: 80 }}>
                    <XAxis type="number" tick={axTick} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={axTick} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={ttStyle} />
                    <Bar dataKey="count" name="Employees" fill="var(--blue)" radius={[0,5,5,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>By Site</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={headcountQ.data?.by_site || []} cx="50%" cy="50%"
                      outerRadius={90} dataKey="count" nameKey="name"
                      label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}
                      labelLine={false}>
                      {(headcountQ.data?.by_site || []).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={ttStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status breakdown table */}
            {headcountQ.data?.by_status && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>By Employment Status</h3>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border-lo)' }}>
                  {Object.entries(headcountQ.data.by_status).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between px-5 py-3">
                      <span className={`badge badge-${status === 'active' ? 'green' : status === 'terminated' ? 'red' : 'gray'} capitalize`}>
                        {status.replace(/_/g,' ')}
                      </span>
                      <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
