import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X, ExternalLink } from 'lucide-react';
import { leaveApi }    from '../../api/leave';
import { PageHeader }  from '../../components/layout/PageHeader';
import { DataTable }   from '../../components/common/Table';
import { Badge }       from '../../components/common/Badge';
import { Pagination }  from '../../components/common/Pagination';
import { useAuth }     from '../../hooks/useAuth';
import { fDate }       from '../../utils';
import { usePagination } from '../../hooks/usePagination';
import { swSuccess, swError, swConfirm } from '../../lib/swal';

export const LeavePage = () => {
  const { canApproveLeave } = useAuth();
  const navigate = useNavigate();
  const { page, setPage } = usePagination();
  const [tab, setTab] = useState('requests');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leave-requests', page],
    queryFn:  () => leaveApi.requests({ page }).then(r => r.data),
    keepPreviousData: true,
  });
  const { data:offDays, isLoading:offLoading } = useQuery({
    queryKey: ['off-day-requests', page],
    queryFn:  () => leaveApi.offDayRequests({ page }).then(r => r.data),
    enabled:  tab === 'offdays',
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }) => leaveApi.approveRequest(id, { status: action }),
    onSuccess:  (_, { action }) => {
      swSuccess(action === 'approved' ? 'Leave approved.' : 'Leave rejected.');
      qc.invalidateQueries(['leave-requests']);
    },
    onError: () => swError('Could not process the leave decision.'),
  });

  const approveOffDay = async (id, action) => {
    try {
      await leaveApi.approveOffDay(id, { status: action });
      swSuccess(action === 'approved' ? 'Off-day approved.' : 'Off-day rejected.');
      qc.invalidateQueries(['off-day-requests']);
    } catch { swError('Could not process the off-day decision.'); }
  };

  const handleApprove = async (id, action, label) => {
    const isDeny = action === 'rejected';
    const res = await swConfirm({
      title:       isDeny ? 'Reject leave request?' : 'Approve leave request?',
      text:        isDeny ? 'The employee will be notified of the rejection.' : 'The employee will be notified.',
      confirmText: isDeny ? 'Yes, reject' : 'Yes, approve',
      danger:      isDeny,
    });
    if (res.isConfirmed) approveMutation.mutate({ id, action });
  };

  const leaveColumns = [
    { key:'employee',        label:'Employee',  render:(_, r) => <span className="font-semibold">{r.employee?.first_name} {r.employee?.last_name}</span> },
    { key:'leave_type',      label:'Type',      render:(_, r) => r.leave_type?.name },
    { key:'start_date',      label:'From',      render: v => fDate(v) },
    { key:'end_date',        label:'To',        render: v => fDate(v) },
    { key:'days_requested',  label:'Days',      render: v => v + ' day(s)' },
    { key:'status',          label:'Status',    render: v => <Badge status={v} /> },
    { key:'actions', label:'', render:(_, r) => canApproveLeave && r.status === 'pending' ? (
      <div className="flex gap-1">
        <button onClick={() => handleApprove(r.id, 'approved')} className="btn-primary btn-sm"><Check size={12} /></button>
        <button onClick={() => handleApprove(r.id, 'rejected')} className="btn-danger  btn-sm"><X size={12} /></button>
      </div>
    ) : null },
  ];

  return (
    <div>
      <PageHeader title="Leave & Off-Days" subtitle="Manage leave requests and approvals"
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate('/leave/off-day/request')} className="btn-secondary btn-sm"><Plus size={14} /> Request Off-Day</button>
            <button onClick={() => navigate('/leave/request')}         className="btn-primary  btn-sm"><Plus size={14} /> Request Leave</button>
          </div>
        }
      />
      <div className="flex gap-0 mb-4" style={{ borderBottom:'1px solid var(--border)' }}>
        {[['requests','Leave Requests'],['offdays','Off-Day Requests']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} className={tab===k ? 'tab-active' : 'tab-inactive'}>{l}</button>
        ))}
      </div>

      {tab==='requests' && (
        <div className="card">
          <DataTable columns={leaveColumns} data={data?.data} loading={isLoading} emptyMessage="No leave requests." />
          <Pagination meta={data?.meta} onPageChange={setPage} />
        </div>
      )}

      {tab==='offdays' && (
        <div className="card">
          <div className="card-header justify-end">
            <button onClick={() => navigate('/leave/off-days')} className="btn-secondary btn-sm">
              <ExternalLink size={13} /> View Full List
            </button>
          </div>
          <DataTable columns={[
            { key:'employee',   label:'Employee', render:(_, r) => <span className="font-semibold">{r.employee?.first_name} {r.employee?.last_name}</span> },
            { key:'start_date', label:'From',     render: v => fDate(v) },
            { key:'end_date',   label:'To',       render: v => fDate(v) },
            { key:'days_count', label:'Days',     render: v => `${v}d` },
            { key:'reason',     label:'Reason',   render: v => v || '—' },
            { key:'status',         label:'Status',  render: v => <Badge status={v} /> },
            { key:'actions', label:'', render:(_, r) => canApproveLeave && r.status==='pending' ? (
              <div className="flex gap-1">
                <button onClick={() => approveOffDay(r.id,'approved')} className="btn-primary btn-sm"><Check size={12} /></button>
                <button onClick={() => approveOffDay(r.id,'rejected')} className="btn-danger  btn-sm"><X size={12} /></button>
              </div>
            ) : null },
          ]} data={offDays?.data} loading={offLoading} emptyMessage="No off-day requests." />
          <Pagination meta={offDays?.meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};
