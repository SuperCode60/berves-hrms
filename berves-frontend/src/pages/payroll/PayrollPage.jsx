import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Play, CheckCircle } from 'lucide-react';
import { payrollApi }  from '../../api/payroll';
import { PageHeader }  from '../../components/layout/PageHeader';
import { DataTable }   from '../../components/common/Table';
import { Badge }       from '../../components/common/Badge';
import { Modal }       from '../../components/common/Modal';
import { Button }      from '../../components/common/Button';
import { Input }       from '../../components/common/Input';
import { useModal }    from '../../hooks/useModal';
import { fDate }       from '../../utils';
import { useForm }     from 'react-hook-form';
import { swSuccess, swError, swConfirm, swLoading, swClose } from '../../lib/swal';

export const PayrollPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const createModal = useModal();
  const { register, handleSubmit, formState:{ errors }, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['payroll-periods'],
    queryFn:  () => payrollApi.periods().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: payrollApi.createPeriod,
    onSuccess:  () => { swSuccess('Payroll period created!'); qc.invalidateQueries(['payroll-periods']); createModal.close(); reset(); },
    onError:    (e) => swError(e.response?.data?.message || 'Failed to create period.'),
  });

  const runMutation = useMutation({
    mutationFn: payrollApi.runPayroll,
    onSuccess:  () => { swClose(); swSuccess('Payroll run started! Processing all employees.'); qc.invalidateQueries(['payroll-periods']); },
    onError:    () => { swClose(); swError('Failed to run payroll.'); },
  });

  const approveMutation = useMutation({
    mutationFn: payrollApi.approvePeriod,
    onSuccess:  () => { swSuccess('Payroll approved!'); qc.invalidateQueries(['payroll-periods']); },
    onError:    () => swError('Failed to approve payroll.'),
  });

  const handleRun = async (id, name) => {
    const res = await swConfirm({
      title:       `Run payroll for ${name}?`,
      text:        'This will calculate pay for all active employees. This may take a moment.',
      confirmText: 'Yes, run payroll',
    });
    if (!res.isConfirmed) return;
    swLoading('Running payroll…');
    runMutation.mutate(id);
  };

  const handleApprove = async (id, name) => {
    const res = await swConfirm({
      title:       `Approve ${name}?`,
      text:        'Approved payroll will be locked for payment.',
      confirmText: 'Approve',
    });
    if (res.isConfirmed) approveMutation.mutate(id);
  };

  const columns = [
    { key:'period_name', label:'Period', render:(v, row) => (
      <button onClick={() => navigate('/payroll/'+row.id)} className="font-semibold hover:underline" style={{ color:'var(--teal)' }}>{v}</button>
    )},
    { key:'start_date',   label:'Start',     render: v => fDate(v) },
    { key:'end_date',     label:'End',       render: v => fDate(v) },
    { key:'status',       label:'Status',    render: v => <Badge status={v} /> },
    { key:'processed_at', label:'Processed', render: v => fDate(v) },
    { key:'actions', label:'', render:(_, row) => (
      <div className="flex items-center gap-2">
        {row.status==='open'       && <button onClick={() => handleRun(row.id, row.period_name)}     className="btn-primary   btn-sm"><Play size={12} /> Run</button>}
        {row.status==='processing' && <button onClick={() => handleApprove(row.id, row.period_name)} className="btn-secondary btn-sm"><CheckCircle size={12} /> Approve</button>}
        <button onClick={() => navigate('/payroll/'+row.id)} className="btn-ghost btn-sm">View</button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Payroll" subtitle="Manage monthly payroll cycles"
        actions={<button onClick={createModal.open} className="btn-primary btn-sm"><Plus size={14} /> New Period</button>}
      />
      <div className="card">
        <DataTable columns={columns} data={data?.data} loading={isLoading} emptyMessage="No payroll periods yet." />
      </div>

      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create Payroll Period">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))}>
          <div className="modal-body space-y-4">
            <Input label="Period Name" required placeholder="e.g. April 2025"
              error={errors.period_name?.message} {...register('period_name',{required:'Required'})} />
            <div className="form-row">
              <Input label="Start Date" type="date" required error={errors.start_date?.message} {...register('start_date',{required:'Required'})} />
              <Input label="End Date"   type="date" required error={errors.end_date?.message}   {...register('end_date',{required:'Required'})} />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={createModal.close}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Period</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
