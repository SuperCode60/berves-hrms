import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download } from 'lucide-react';
import { payrollApi }  from '../../api/payroll';
import { PageHeader }  from '../../components/layout/PageHeader';
import { DataTable }   from '../../components/common/Table';
import { Badge }       from '../../components/common/Badge';
import { Avatar }      from '../../components/common/Avatar';
import { fCurrency, fDate, downloadBlob } from '../../utils';
import { swError }     from '../../lib/swal';

export const PayrollPeriodPage = () => {
  const { periodId } = useParams();
  const navigate = useNavigate();

  const { data:period } = useQuery({
    queryKey: ['payroll-period', periodId],
    queryFn:  () => payrollApi.periods({ id: periodId }).then(r => r.data.data?.[0]),
  });
  const { data, isLoading } = useQuery({
    queryKey: ['payroll-runs', periodId],
    queryFn:  () => payrollApi.runs(periodId).then(r => r.data),
  });

  const handlePayslip = async (runId, name) => {
    try {
      const res = await payrollApi.payslip(runId);
      downloadBlob(res.data, 'payslip-'+name+'.pdf');
    } catch { swError('Failed to download payslip.'); }
  };

  const columns = [
    { key:'employee', label:'Employee', render:(_, row) => (
      <div className="flex items-center gap-3">
        <Avatar name={`${row.employee?.first_name} ${row.employee?.last_name}`} size="sm" />
        <div>
          <p className="font-semibold text-sm" style={{ color:'var(--ink)' }}>{row.employee?.first_name} {row.employee?.last_name}</p>
          <p className="text-xs" style={{ color:'var(--ink-faint)' }}>{row.employee?.employee_number}</p>
        </div>
      </div>
    )},
    { key:'basic_salary',     label:'Basic',      render: v => fCurrency(v) },
    { key:'total_allowances', label:'Allowances', render: v => fCurrency(v) },
    { key:'overtime_pay',     label:'Overtime',   render: v => fCurrency(v) },
    { key:'gross_pay',        label:'Gross',      render: v => <span className="font-semibold">{fCurrency(v)}</span> },
    { key:'total_deductions', label:'Deductions', render: v => <span style={{ color:'var(--red)' }}>-{fCurrency(v)}</span> },
    { key:'net_pay',          label:'Net Pay',    render: v => <span className="font-bold" style={{ color:'var(--emerald)' }}>{fCurrency(v)}</span> },
    { key:'payment_status',   label:'Status',     render: v => <Badge status={v} /> },
    { key:'actions', label:'', render:(_, row) => (
      <button onClick={() => handlePayslip(row.id, row.employee?.last_name)} className="btn-ghost btn-sm">
        <Download size={12} /> Payslip
      </button>
    )},
  ];

  const totals = data?.data?.reduce((acc, r) => ({
    gross: acc.gross + Number(r.gross_pay),
    net:   acc.net   + Number(r.net_pay),
    deductions: acc.deductions + Number(r.total_deductions),
  }), { gross:0, net:0, deductions:0 });

  return (
    <div>
      <PageHeader title={period?.period_name || 'Payroll Period'} subtitle={fDate(period?.start_date)+' – '+fDate(period?.end_date)}
        actions={<button onClick={() => navigate(-1)} className="btn-secondary btn-sm"><ArrowLeft size={14} /> Back</button>}
      />
      {totals && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[['Total Gross', fCurrency(totals.gross), 'var(--blue-bg)', 'var(--blue)'],
            ['Total Deductions', fCurrency(totals.deductions), 'var(--red-bg)', 'var(--red)'],
            ['Total Net Pay', fCurrency(totals.net), 'var(--emerald-bg)', 'var(--emerald)'],
          ].map(([l,v,bg,color]) => (
            <div key={l} className="card p-4" style={{ background:bg }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color, opacity:.8 }}>{l}</p>
              <p className="text-xl font-bold" style={{ color }}>{v}</p>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <DataTable columns={columns} data={data?.data} loading={isLoading} emptyMessage="No runs in this period." />
      </div>
    </div>
  );
};
