import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, X } from 'lucide-react';
import { payrollApi }   from '../../api/payroll';
import { employeesApi } from '../../api/employees';
import { PageHeader }   from '../../components/layout/PageHeader';
import { DataTable }    from '../../components/common/Table';
import { Modal }        from '../../components/common/Modal';
import { Button }       from '../../components/common/Button';
import { Input }        from '../../components/common/Input';
import { Avatar }       from '../../components/common/Avatar';
import { useModal }     from '../../hooks/useModal';
import { useAuth }      from '../../hooks/useAuth';
import { fCurrency, fDate } from '../../utils';
import { swSuccess, swError, swConfirm } from '../../lib/swal';
import { useForm } from 'react-hook-form';

const LoanStatus = ({ status }) => {
  const map = {
    approved:  ['Approved',  'var(--emerald-bg)', 'var(--emerald)'],
    pending:   ['Pending',   'var(--amber-bg)',   'var(--amber)'],
    rejected:  ['Rejected',  'var(--red-bg)',     'var(--red)'],
    settled:   ['Settled',   'var(--blue-bg)',    'var(--blue)'],
    defaulted: ['Defaulted', 'var(--red-bg)',     'var(--red)'],
    active:    ['Active',    'var(--teal-bg)',    'var(--teal)'],
  };
  const [label, bg, color] = map[status] || [status, 'var(--canvas)', 'var(--ink-soft)'];
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: bg, color }}>{label}</span>;
};

const ScheduleModal = ({ loanId, isOpen, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['repayment-schedule', loanId],
    queryFn:  () => payrollApi.repaymentSchedule(loanId).then(r => r.data),
    enabled:  isOpen && !!loanId,
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Repayment Schedule" size="lg">
      {isLoading ? (
        <div className="p-8 text-center" style={{ color: 'var(--ink-faint)' }}>Loading schedule…</div>
      ) : (
        <div className="overflow-auto max-h-96 p-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['#', 'Due Date', 'Principal', 'Interest', 'Instalment', 'Balance', 'Status'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-faint)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((row, i) => (
                <tr key={i} className="border-b" style={{ borderColor: 'var(--border-lo)' }}>
                  <td className="py-2 px-3" style={{ color: 'var(--ink-faint)' }}>{i + 1}</td>
                  <td className="py-2 px-3">{fDate(row.due_date)}</td>
                  <td className="py-2 px-3">{fCurrency(row.principal)}</td>
                  <td className="py-2 px-3" style={{ color: 'var(--amber)' }}>{fCurrency(row.interest)}</td>
                  <td className="py-2 px-3 font-semibold">{fCurrency(row.instalment)}</td>
                  <td className="py-2 px-3" style={{ color: 'var(--ink-soft)' }}>{fCurrency(row.balance)}</td>
                  <td className="py-2 px-3">
                    <span className="text-xs font-semibold" style={{ color: row.paid ? 'var(--emerald)' : 'var(--ink-faint)' }}>
                      {row.paid ? '✓ Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export const LoansPage = () => {
  const { canRunPayroll, isAdmin, isHR } = useAuth();
  const canManage = canRunPayroll || isAdmin || isHR;
  const qc = useQueryClient();
  const modal = useModal();
  const [tab, setTab]               = useState('all');
  const [scheduleId, setScheduleId] = useState(null);
  const [search, setSearch]         = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: { interest_rate: 0, term_months: 12 } });

  const { data, isLoading } = useQuery({
    queryKey: ['loans', tab],
    queryFn:  () => payrollApi.loans(tab !== 'all' ? { status: tab } : {}).then(r => r.data),
  });
  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn:  () => employeesApi.list({ per_page: 500 }).then(r => r.data),
    enabled:  canManage,
  });

  const createMutation = useMutation({
    mutationFn: payrollApi.createLoan,
    onSuccess:  () => { swSuccess('Loan created.'); qc.invalidateQueries(['loans']); modal.close(); reset(); },
    onError:    (e) => swError(e.response?.data?.message || 'Failed to create loan.'),
  });
  const approveMutation = useMutation({
    mutationFn: payrollApi.approveLoan,
    onSuccess:  () => { swSuccess('Loan approved.'); qc.invalidateQueries(['loans']); },
    onError:    () => swError('Failed to approve loan.'),
  });
  const rejectMutation = useMutation({
    mutationFn: payrollApi.rejectLoan,
    onSuccess:  () => { swSuccess('Loan rejected.'); qc.invalidateQueries(['loans']); },
    onError:    () => swError('Failed to reject loan.'),
  });

  const handleApprove = async (id) => {
    const res = await swConfirm({ title: 'Approve this loan?', confirmText: 'Approve' });
    if (res.isConfirmed) approveMutation.mutate(id);
  };
  const handleReject = async (id) => {
    const res = await swConfirm({ title: 'Reject this loan?', confirmText: 'Reject', isDanger: true });
    if (res.isConfirmed) rejectMutation.mutate(id);
  };

  const stats = (data?.data || []).reduce(
    (acc, l) => ({ total: acc.total+1, pending: acc.pending+(l.status==='pending'?1:0), active: acc.active+(l.status==='active'?1:0), amount: acc.amount+Number(l.loan_amount||0), balance: acc.balance+Number(l.outstanding_balance||0) }),
    { total: 0, pending: 0, active: 0, amount: 0, balance: 0 }
  );

  const columns = [
    { key: 'employee', label: 'Employee', render: (_, row) => (
      <div className="flex items-center gap-3">
        <Avatar name={`${row.employee?.first_name} ${row.employee?.last_name}`} size="sm" />
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{row.employee?.first_name} {row.employee?.last_name}</p>
          <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{row.employee?.employee_number}</p>
        </div>
      </div>
    )},
    { key: 'loan_amount',         label: 'Amount',   render: v => <span className="font-semibold">{fCurrency(v)}</span> },
    { key: 'interest_rate',       label: 'Interest', render: v => `${v}%` },
    { key: 'term_months',         label: 'Term',     render: v => `${v} mo.` },
    { key: 'outstanding_balance', label: 'Balance',  render: (v, row) => row.status === 'settled' ? <span style={{ color: 'var(--emerald)' }}>Settled</span> : <span style={{ color: 'var(--red)' }}>{fCurrency(v)}</span> },
    { key: 'disbursement_date',   label: 'Disbursed',render: v => fDate(v) },
    { key: 'status',              label: 'Status',   render: v => <LoanStatus status={v} /> },
    { key: 'actions', label: '', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setScheduleId(row.id)} className="px-2 py-1 rounded text-xs font-medium" style={{ color: 'var(--teal)', background: 'var(--teal-bg)' }}>Schedule</button>
        {canManage && row.status === 'pending' && (
          <>
            <button onClick={() => handleApprove(row.id)} className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald)' }}><Check size={11}/></button>
            <button onClick={() => handleReject(row.id)}  className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'var(--red-bg)',     color: 'var(--red)' }}><X size={11}/></button>
          </>
        )}
      </div>
    )},
  ];

  const rows = (data?.data || []).filter(r => !search || `${r.employee?.first_name} ${r.employee?.last_name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Loans Management" subtitle="Employee salary advances and loan tracking"
        actions={canManage && <Button onClick={modal.open} variant="primary" size="sm"><Plus size={14}/> New Loan</Button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[['Total Loans', stats.total, 'var(--blue-bg)', 'var(--blue)'],['Pending', stats.pending, 'var(--amber-bg)', 'var(--amber)'],['Active', stats.active, 'var(--teal-bg)', 'var(--teal)'],['Total Issued', fCurrency(stats.amount), 'var(--violet-bg)', 'var(--violet)'],['Outstanding', fCurrency(stats.balance), 'var(--red-bg)', 'var(--red)']].map(([label, value, bg, color]) => (
          <div key={label} className="card p-4" style={{ background: bg }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color, opacity: 0.75 }}>{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="card mb-0">
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-1">
            {[['all','All'],['pending','Pending'],['active','Active']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={tab === key ? { background: 'var(--teal)', color: '#fff' } : { color: 'var(--ink-soft)' }}>{label}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee…" className="input text-sm" style={{ width: 220 }} />
        </div>
        <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No loans found." />
      </div>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="New Loan Application">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select className="input" {...register('employee_id', { required: 'Employee is required' })}>
              <option value="">Select employee…</option>
              {(employees?.data || []).map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.employee_number}</option>)}
            </select>
            {errors.employee_id && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.employee_id.message}</p>}
          </div>
          <Input label="Loan Amount (GHS) *" type="number" step="0.01" min="1"
            {...register('loan_amount', { required: 'Amount required', min: { value: 1, message: 'Must be > 0' } })}
            error={errors.loan_amount?.message} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Interest Rate (%)" type="number" step="0.1" min="0" {...register('interest_rate')} />
            <Input label="Term (months) *" type="number" min="1" max="60"
              {...register('term_months', { required: 'Term required' })} error={errors.term_months?.message} />
          </div>
          <Input label="Disbursement Date *" type="date" {...register('disbursement_date', { required: 'Date required' })} error={errors.disbursement_date?.message} />
          <Input label="Purpose / Notes" {...register('purpose')} placeholder="Reason for loan…" />
          <div className="flex gap-2 pt-2 justify-end">
            <Button type="button" variant="ghost" onClick={modal.close}>Cancel</Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending}>Submit Loan</Button>
          </div>
        </form>
      </Modal>
      <ScheduleModal loanId={scheduleId} isOpen={!!scheduleId} onClose={() => setScheduleId(null)} />
    </div>
  );
};
