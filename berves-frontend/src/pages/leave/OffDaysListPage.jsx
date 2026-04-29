import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, X, Trash2, AlertTriangle } from 'lucide-react';
import { leaveApi }      from '../../api/leave';
import { PageHeader }    from '../../components/layout/PageHeader';
import { DataTable }     from '../../components/common/Table';
import { Badge }         from '../../components/common/Badge';
import { Pagination }    from '../../components/common/Pagination';
import { SearchInput }   from '../../components/common/SearchInput';
import { useAuth }       from '../../hooks/useAuth';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce }   from '../../hooks/useDebounce';
import { fDate }         from '../../utils';
import { swSuccess, swError, swConfirm, swDelete } from '../../lib/swal';

const STATUS_TABS = [
  { key: '',           label: 'All'      },
  { key: 'pending',    label: 'Pending'  },
  { key: 'approved',   label: 'Approved' },
  { key: 'rejected',   label: 'Rejected' },
];

export const OffDaysListPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { canApproveLeave, user } = useAuth();
  const { page, setPage, perPage } = usePagination();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const dSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['off-day-requests', page, perPage, status, dSearch],
    queryFn:  () => leaveApi.offDayRequests({ page, per_page: perPage, status, search: dSearch }).then(r => r.data),
    keepPreviousData: true,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => leaveApi.approveOffDayDirect(id),
    onSuccess:  () => { swSuccess('Off-day approved.'); qc.invalidateQueries(['off-day-requests']); },
    onError:    () => swError('Could not approve the request.'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => leaveApi.rejectOffDayDirect(id),
    onSuccess:  () => { swSuccess('Off-day rejected.'); qc.invalidateQueries(['off-day-requests']); },
    onError:    () => swError('Could not reject the request.'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => leaveApi.cancelOffDay(id),
    onSuccess:  () => { swSuccess('Off-day request cancelled.'); qc.invalidateQueries(['off-day-requests']); },
    onError:    (err) => swError(err.response?.data?.message || 'Could not cancel request.'),
  });

  const handleApprove = async (id) => {
    const res = await swConfirm({ title: 'Approve off-day?', text: 'The employee will be notified.', confirmText: 'Yes, approve' });
    if (res.isConfirmed) approveMutation.mutate(id);
  };

  const handleReject = async (id) => {
    const res = await swConfirm({ title: 'Reject off-day?', text: 'The employee will be notified of the rejection.', confirmText: 'Yes, reject', danger: true });
    if (res.isConfirmed) rejectMutation.mutate(id);
  };

  const handleCancel = async (id) => {
    const res = await swDelete('this off-day request');
    if (res.isConfirmed) cancelMutation.mutate(id);
  };

  const isOwnRecord = (row) => row.employee?.user_id === user?.id || row.employee_id === user?.employee_id;

  const columns = [
    ...(canApproveLeave ? [{
      key: 'employee', label: 'Employee',
      render: (_, r) => (
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
            {r.employee?.first_name} {r.employee?.last_name}
          </p>
          <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{r.employee?.employee_number}</p>
        </div>
      ),
    }] : []),
    {
      key: 'start_date', label: 'From',
      render: (v) => <span className="font-medium">{fDate(v)}</span>,
    },
    {
      key: 'end_date', label: 'To',
      render: (v) => <span className="font-medium">{fDate(v)}</span>,
    },
    {
      key: 'days_count', label: 'Days',
      render: (v) => <span className="text-sm font-semibold" style={{ color: 'var(--teal)' }}>{v}d</span>,
    },
    {
      key: 'reason', label: 'Reason',
      render: (v) => v
        ? <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>{v}</span>
        : <span style={{ color: 'var(--ink-faint)' }}>—</span>,
    },
    {
      key: 'has_schedule_conflict', label: 'Conflict',
      render: (v) => v
        ? <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--amber)' }}>
            <AlertTriangle size={12} /> Shift conflict
          </span>
        : null,
    },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
    ...(canApproveLeave ? [{
      key: 'reviewer', label: 'Reviewed by',
      render: (_, r) => r.reviewer
        ? <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>{r.reviewer.name}</span>
        : <span style={{ color: 'var(--ink-faint)' }}>—</span>,
    }] : []),
    {
      key: 'actions', label: '', width: '110px',
      render: (_, r) => (
        <div className="flex items-center gap-1">
          {canApproveLeave && r.status === 'pending' && (<>
            <button onClick={() => handleApprove(r.id)} className="btn-primary btn-sm" title="Approve">
              <Check size={12} />
            </button>
            <button onClick={() => handleReject(r.id)} className="btn-danger btn-sm" title="Reject">
              <X size={12} />
            </button>
          </>)}
          {r.status === 'pending' && isOwnRecord(r) && (
            <button onClick={() => handleCancel(r.id)} className="btn-ghost btn-sm" title="Cancel request"
              style={{ color: 'var(--red)' }}>
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Off-Day Requests"
        subtitle={data?.meta?.total != null ? `${data.meta.total} request${data.meta.total !== 1 ? 's' : ''}` : ''}
        actions={
          <button onClick={() => navigate('/leave/off-day/request')} className="btn-primary btn-sm">
            <Plus size={14} /> Request Off-Day
          </button>
        }
      />

      {/* Status tabs */}
      <div className="flex gap-0 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        {STATUS_TABS.map(t => (
          <button key={t.key} onClick={() => { setStatus(t.key); setPage(1); }}
            className={status === t.key ? 'tab-active' : 'tab-inactive'}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {/* Search bar */}
        {canApproveLeave && (
          <div className="card-header">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by employee name…" />
          </div>
        )}

        <DataTable
          columns={columns}
          data={data?.data}
          loading={isLoading}
          emptyMessage="No off-day requests found."
        />
        <Pagination meta={data?.meta} onPageChange={setPage} />
      </div>
    </div>
  );
};
