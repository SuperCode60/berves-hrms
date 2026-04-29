import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Eye, ChevronRight, Printer } from 'lucide-react';
import { payrollApi }  from '../../api/payroll';
import { PageHeader }  from '../../components/layout/PageHeader';
import { Avatar }      from '../../components/common/Avatar';
import { useAuth }     from '../../hooks/useAuth';
import { fCurrency, fDate, downloadBlob } from '../../utils';
import { swError, swLoading, swClose, swSuccess } from '../../lib/swal';

const StatBox = ({ label, value, bg, color }) => (
  <div className="card p-4" style={{ background: bg }}>
    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color, opacity: 0.75 }}>{label}</p>
    <p className="text-xl font-bold" style={{ color }}>{value}</p>
  </div>
);

export const PayslipsPage = () => {
  const { user } = useAuth();
  const [selectedRun, setSelectedRun] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-payslips'],
    queryFn:  () => payrollApi.myPayslips({ per_page: 50 }).then(r => r.data),
  });

  const payslips    = data?.data || [];
  const latestGross = payslips[0] ? Number(payslips[0].gross_pay) : 0;
  const latestNet   = payslips[0] ? Number(payslips[0].net_pay)   : 0;
  const totalEarned = payslips.reduce((s, r) => s + Number(r.net_pay || 0), 0);

  const handleDownload = async (runId, name, period) => {
    swLoading('Generating payslip…');
    try {
      const res = await payrollApi.payslip(runId);
      swClose();

      const contentType = res.headers?.['content-type'] || '';

      // If server returned HTML (DomPDF fallback), open in new tab for print-to-PDF
      if (contentType.includes('text/html')) {
        const blob = new Blob([res.data], { type: 'text/html' });
        const url  = URL.createObjectURL(blob);
        const win  = window.open(url, '_blank');
        if (!win) {
          swError('Popup blocked — allow popups for this site to view payslips.');
          return;
        }
        swSuccess('Payslip opened — use Print > Save as PDF to download.');
        return;
      }

      // Normal PDF blob download
      downloadBlob(res.data, `payslip-${name}-${period}.pdf`);
      swSuccess('Payslip downloaded!');
    } catch {
      swClose();
      swError('Failed to generate payslip. Please try again.');
    }
  };

  return (
    <div>
      <PageHeader title="My Payslips" subtitle="View and download your payslip history" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatBox label="Latest Gross"   value={fCurrency(latestGross)} bg="var(--blue-bg)"    color="var(--blue)" />
        <StatBox label="Latest Net Pay" value={fCurrency(latestNet)}   bg="var(--emerald-bg)" color="var(--emerald)" />
        <StatBox label="YTD Net Pay"    value={fCurrency(totalEarned)} bg="var(--teal-bg)"    color="var(--teal)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Payslip History</h3>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
                style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
            </div>
          ) : payslips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--ink-faint)' }}>
              <FileText size={36} />
              <p className="text-sm">No payslips available yet.</p>
              <p className="text-xs">Payslips are generated after each payroll run.</p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--border-lo)' }}>
              {payslips.map(run => (
                <li key={run.id}>
                  <button onClick={() => setSelectedRun(run)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors"
                    style={{ background: selectedRun?.id === run.id ? 'var(--teal-bg)' : '' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: selectedRun?.id === run.id ? 'var(--teal)' : 'var(--canvas)' }}>
                      <FileText size={16} style={{ color: selectedRun?.id === run.id ? '#fff' : 'var(--ink-soft)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
                        {run.period?.period_name || '—'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ink-faint)' }}>
                        {fDate(run.period?.start_date)} – {fDate(run.period?.end_date)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--emerald)' }}>{fCurrency(run.net_pay)}</p>
                      <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>net</p>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--ink-faint)', flexShrink: 0 }} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {!selectedRun ? (
            <div className="card flex flex-col items-center justify-center py-20 gap-4" style={{ color: 'var(--ink-faint)' }}>
              <Eye size={42} strokeWidth={1.2} />
              <p className="text-sm">Select a payslip to preview</p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              {/* Payslip header */}
              <div className="px-6 py-5 flex items-start justify-between border-b"
                style={{ borderColor: 'var(--border)', background: 'var(--sidebar-bg)' }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--teal-lt)' }}>Payslip</p>
                  <h2 className="text-lg font-bold text-white">{selectedRun.period?.period_name}</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>
                    {fDate(selectedRun.period?.start_date)} – {fDate(selectedRun.period?.end_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(
                      selectedRun.id,
                      `${selectedRun.employee?.first_name}-${selectedRun.employee?.last_name}`,
                      selectedRun.period?.period_name
                    )}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    style={{ background: 'var(--teal)', color: '#fff' }}>
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>

              {/* Employee info */}
              <div className="px-6 py-4 flex items-center gap-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <Avatar name={`${selectedRun.employee?.first_name} ${selectedRun.employee?.last_name}`} size="lg" />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--ink)' }}>
                    {selectedRun.employee?.first_name} {selectedRun.employee?.last_name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                    {selectedRun.employee?.job_title?.name || '—'} · {selectedRun.employee?.department?.name || '—'}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--ink-faint)' }}>
                    {selectedRun.employee?.employee_number}
                  </p>
                </div>
              </div>

              {/* Pay breakdown */}
              <div className="px-6 py-5 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--ink-soft)' }}>Earnings</p>
                  <table className="w-full">
                    <tbody>
                      {[['Basic Salary', selectedRun.basic_salary], ['Allowances', selectedRun.total_allowances], ['Overtime Pay', selectedRun.overtime_pay]]
                        .map(([l, v]) => (
                          <tr key={l}>
                            <td className="py-1.5 text-sm" style={{ color: 'var(--ink-soft)' }}>{l}</td>
                            <td className="py-1.5 text-sm font-semibold text-right" style={{ color: 'var(--ink)' }}>{fCurrency(v)}</td>
                          </tr>
                        ))}
                      <tr style={{ borderTop: '2px solid var(--border)' }}>
                        <td className="pt-3 text-sm font-bold" style={{ color: 'var(--ink)' }}>Gross Pay</td>
                        <td className="pt-3 text-sm font-bold text-right" style={{ color: 'var(--blue)' }}>{fCurrency(selectedRun.gross_pay)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--ink-soft)' }}>Deductions</p>
                  <table className="w-full">
                    <tbody>
                      {[['Income Tax (PAYE)', selectedRun.tax_amount], ['SSNIT (5.5%)', selectedRun.ssnit_employee], ['Loan Deduction', selectedRun.loan_deduction]]
                        .filter(([, v]) => Number(v) > 0)
                        .map(([l, v]) => (
                          <tr key={l}>
                            <td className="py-1.5 text-sm" style={{ color: 'var(--ink-soft)' }}>{l}</td>
                            <td className="py-1.5 text-sm font-semibold text-right" style={{ color: 'var(--red)' }}>-{fCurrency(v)}</td>
                          </tr>
                        ))}
                      <tr style={{ borderTop: '2px solid var(--border)' }}>
                        <td className="pt-3 text-sm font-bold" style={{ color: 'var(--ink)' }}>Total Deductions</td>
                        <td className="pt-3 text-sm font-bold text-right" style={{ color: 'var(--red)' }}>-{fCurrency(selectedRun.total_deductions)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: 'var(--emerald-bg)', border: '1px solid var(--emerald)' }}>
                  <p className="font-bold text-sm" style={{ color: 'var(--emerald)' }}>NET PAY</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--emerald)' }}>{fCurrency(selectedRun.net_pay)}</p>
                </div>

                <p className="text-xs text-center" style={{ color: 'var(--ink-faint)' }}>
                  This is a computer-generated payslip. No signature required.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
