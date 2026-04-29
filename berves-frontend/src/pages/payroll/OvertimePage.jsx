import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, X, Clock, ChevronDown } from 'lucide-react';
import { payrollApi }   from '../../api/payroll';
import { employeesApi } from '../../api/employees';
import { PageHeader }   from '../../components/layout/PageHeader';
import { DataTable }    from '../../components/common/Table';
import { Badge }        from '../../components/common/Badge';
import { Modal }        from '../../components/common/Modal';
import { Button }       from '../../components/common/Button';
import { Input }        from '../../components/common/Input';
import { Avatar }       from '../../components/common/Avatar';
import { useModal }     from '../../hooks/useModal';
import { useAuth }      from '../../hooks/useAuth';
import { fCurrency, fDate } from '../../utils';
import { swSuccess, swError, swConfirm } from '../../lib/swal';
import { useForm } from 'react-hook-form';

const DAY_TYPES = [
  { value: 'weekday',        label: 'Weekday (1.5×)' },
  { value: 'sunday',         label: 'Sunday (2×)' },
  { value: 'public_holiday', label: 'Public Holiday (2×)' },
];

export const OvertimePage = () => {
  const { canRunPayroll, isAdmin, isHR } = useAuth();
  const canManage = canRunPayroll || isAdmin || isHR;
  const qc       = useQueryClient();
  const modal    = useModal();
  const [tab, setTab]     = useState('all');
  const [search, setSearch] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, watch } =
    useForm({ defaultValues: { hours: 1, day_type: 'weekday' } });

  // ── Data fetching ──────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['overtime', tab],
    queryFn:  () => {
      const params = tab === 'pending' ? { approved: 0 } : tab === 'approved' ? { approved: 1 } : {};
      return payrollApi.overtimeList(params).then(r => r.data);
    },
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn:  () => employeesApi.list({ per_page: 500 }).then(r => r.data),
    enabled:  canManage,
  });

  // ── Mutations ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: payrollApi.createOvertime,
    onSuccess:  () => { swSuccess('Overtime recorded!'); qc.invalidateQueries(['overtime']); modal.close(); reset(); },
    onError:    (e) => swError(e.response?.data?.message || 'Failed to record overtime.'),
  });

  const approveMutation = useMutation({
    mutationFn: payrollApi.approveOvertime,
    onSuccess:  () => { swSuccess('Overtime approved.'); qc.invalidateQueries(['overtime']); },
    onError:    () => swError('Failed to approve overtime.'),
  });

  const rejectMutation = useMutation({
    mutationFn: payrollApi.rejectOvertime,
    onSuccess:  () => { swSuccess('Overtime rejected.'); qc.invalidateQueries(['overtime']); },
    onError:    () => swError('Failed to reject overtime.'),
  });

  const handleApprove = async (id, name) => {
    const res = await swConfirm({ title: `Approve overtime for ${name}?`, confirmText: 'Approve' });
    if (res.isConfirmed) approveMutation.mutate(id);
  };

  const handleReject = async (id, name) => {
    const res = await swConfirm({ title: `Reject overtime for ${name}?`, confirmText: 'Reject', isDanger: true });
    if (res.isConfirmed) rejectMutation.mutate(id);
  };

  // ── Table columns ──────────────────────────────────────────────────────
  const columns = [
    {
      key: 'employee', label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.employee?.first_name} ${row.employee?.last_name}`} size="sm" />
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
              {row.employee?.first_name} {row.employee?.last_name}
            </p>
            <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{row.employee?.employee_number}</p>
          </div>
        </div>
      ),
    },
    { key: 'date',      label: 'Date',     render: v => fDate(v) },
    {
      key: 'day_type', label: 'Type',
      render: v => {
        const map = { weekday: ['Weekday', 'var(--blue-bg)', 'var(--blue)'], sunday: ['Sunday', 'var(--violet-bg)', 'var(--violet)'], public_holiday: ['Public Holiday', 'var(--amber-bg)', 'var(--amber)'] };
        const [label, bg, color] = map[v] || [v, 'var(--canvas)', 'var(--ink-soft)'];
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: bg, color }}>{label}</span>;
      },
    },
    { key: 'hours',  label: 'Hours',       render: v => <span className="font-mono font-semibold">{v}h</span> },
    { key: 'amount', label: 'Amount',      render: v => <span className="font-semibold" style={{ color: 'var(--emerald)' }}>{fCurrency(v)}</span> },
    {
      key: 'approved_by', label: 'Status',
      render: (v, row) => v
        ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald)' }}><Check size={10} /> Approved</span>
        : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}><Clock size={10} /> Pending</span>,
    },
    canManage && {
      key: 'actions', label: '',
      render: (_, row) => !row.approved_by && (
        <div className="flex items-center gap-1">
          <button onClick={() => handleApprove(row.id, `${row.employee?.first_name} ${row.employee?.last_name}`)}
            className="btn-sm px-2 py-1 rounded text-xs font-semibold transition-colors"
            style={{ background: 'var(--emerald-bg)', color: 'var(--emerald)' }}>
            <Check size={12} />
          </button>
          <button onClick={() => handleReject(row.id, `${row.employee?.first_name} ${row.employee?.last_name}`)}
            className="btn-sm px-2 py-1 rounded text-xs font-semibold transition-colors"
            style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
            <X size={12} />
          </button>
        </div>
      ),
    },
  ].filter(Boolean);

  const rows = (data?.data || []).filter(r =>
    !search || (`${r.employee?.first_name} ${r.employee?.last_name}`).toLowerCase().includes(search.toLowerCase())
  );

  // ── Stats summary ──────────────────────────────────────────────────────
  const stats = (data?.data || []).reduce((acc, r) => ({
    total:    acc.total + 1,
    pending:  acc.pending  + (!r.approved_by ? 1 : 0),
    approved: acc.approved + (r.approved_by  ? 1 : 0),
    amount:   acc.amount   + Number(r.amount || 0),
  }), { total: 0, pending: 0, approved: 0, amount: 0 });

  return (
    <div>
      <PageHeader
        title="Overtime Management"
        subtitle="Track and approve employee overtime records"
        actions={canManage && (
          <Button onClick={modal.open} variant="primary" size="sm">
            <Plus size={14} /> Record Overtime
          </Button>
        )}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ['Total Records', stats.total,    'var(--blue-bg)',    'var(--blue)'],
          ['Pending',       stats.pending,  'var(--amber-bg)',   'var(--amber)'],
          ['Approved',      stats.approved, 'var(--emerald-bg)', 'var(--emerald)'],
          ['Total Amount',  fCurrency(stats.amount), 'var(--teal-bg)', 'var(--teal)'],
        ].map(([label, value, bg, color]) => (
          <div key={label} className="card p-4" style={{ background: bg }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color, opacity: 0.75 }}>{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="card mb-0">
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-1">
            {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={tab === key
                  ? { background: 'var(--teal)', color: '#fff' }
                  : { color: 'var(--ink-soft)' }}>
                {label}
              </button>
            ))}
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search employee…"
            className="input text-sm" style={{ width: 220 }}
          />
        </div>
        <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No overtime records found." />
      </div>

      {/* Create Modal */}
      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Record Overtime">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select className="input" {...register('employee_id', { required: 'Employee is required' })}>
              <option value="">Select employee…</option>
              {(employees?.data || []).map(e => (
                <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — {e.employee_number}</option>
              ))}
            </select>
            {errors.employee_id && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.employee_id.message}</p>}
          </div>
          <Input label="Date *" type="date" {...register('date', { required: 'Date is required' })} error={errors.date?.message} />
          <div>
            <label className="label">Day Type *</label>
            <select className="input" {...register('day_type', { required: true })}>
              {DAY_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <Input
            label="Hours *" type="number" step="0.5" min="0.5" max="12"
            {...register('hours', { required: 'Hours required', min: { value: 0.5, message: 'Min 0.5h' }, max: { value: 12, message: 'Max 12h' } })}
            error={errors.hours?.message}
          />
          <Input label="Notes" {...register('notes')} placeholder="Optional notes…" />
          <div className="flex gap-2 pt-2 justify-end">
            <Button type="button" variant="ghost" onClick={modal.close}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Record Overtime'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
