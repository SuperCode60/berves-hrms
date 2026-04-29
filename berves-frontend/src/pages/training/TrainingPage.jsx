import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { trainingApi }   from '../../api/training';
import { employeesApi }  from '../../api/employees';
import { PageHeader }    from '../../components/layout/PageHeader';
import { DataTable }     from '../../components/common/Table';
import { Badge }         from '../../components/common/Badge';
import { Modal }         from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { Button }        from '../../components/common/Button';
import { useModal }      from '../../hooks/useModal';
import { fDate }         from '../../utils';
import { useForm }       from 'react-hook-form';
import { swSuccess, swError } from '../../lib/swal';

export const TrainingPage = () => {
  const qc = useQueryClient();
  const enrollModal = useModal();
  const [tab, setTab] = useState('enrollments');
  const { register, handleSubmit, reset } = useForm();

  const { data:enrollments, isLoading } = useQuery({ queryKey:['enrollments'], queryFn:() => trainingApi.enrollments().then(r=>r.data) });
  const { data:programs }               = useQuery({ queryKey:['programs'],    queryFn:() => trainingApi.programs().then(r=>r.data.data) });
  const { data:employees }              = useQuery({ queryKey:['employees-list'], queryFn:() => employeesApi.list({ per_page:999 }).then(r=>r.data.data) });
  const { data:expiring }               = useQuery({ queryKey:['expiring-certs'], queryFn:() => trainingApi.expiringCerts().then(r=>r.data.data), enabled:tab==='expiring' });

  const enrollMutation = useMutation({
    mutationFn: trainingApi.enroll,
    onSuccess:  () => { swSuccess('Employee enrolled!'); qc.invalidateQueries(['enrollments']); enrollModal.close(); reset(); },
    onError:    () => swError('Enrollment failed.'),
  });

  const enrollCols = [
    { key:'employee',         label:'Employee', render:(_, r) => <span className="font-semibold">{r.employee?.first_name} {r.employee?.last_name}</span> },
    { key:'training_program', label:'Program',  render:(_, r) => r.training_program?.name },
    { key:'scheduled_date',   label:'Scheduled',render: v => fDate(v) },
    { key:'completed_date',   label:'Completed',render: v => fDate(v) },
    { key:'expiry_date', label:'Expires', render: v => v
      ? <span style={{ color: new Date(v) < new Date() ? 'var(--red)' : 'var(--ink)' }}>{fDate(v)}</span>
      : '—'
    },
    { key:'score',  label:'Score',  render: v => v ? v+'%' : '—' },
    { key:'status', label:'Status', render: v => <Badge status={v} /> },
  ];

  return (
    <div>
      <PageHeader title="Training & Certifications" subtitle="Track employee training and certificate expiry"
        actions={<button onClick={enrollModal.open} className="btn-primary btn-sm"><Plus size={14} /> Enroll Employee</button>}
      />
      <div className="flex gap-0 mb-4" style={{ borderBottom:'1px solid var(--border)' }}>
        {[['enrollments','Enrollments'],['expiring','Expiring Certs']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} className={tab===k ? 'tab-active' : 'tab-inactive'}>{l}</button>
        ))}
      </div>

      {tab==='enrollments' && <div className="card"><DataTable columns={enrollCols} data={enrollments?.data} loading={isLoading} emptyMessage="No enrollments." /></div>}
      {tab==='expiring'    && <div className="card"><DataTable columns={[
        ...enrollCols.slice(0,2),
        { key:'expiry_date', label:'Expiry', render: v => <span className="font-medium" style={{ color:'var(--red)' }}>{fDate(v)}</span> },
        { key:'employee',    label:'Site',   render:(_, r) => r.employee?.site?.name||'—' },
      ]} data={expiring} loading={false} emptyMessage="No expiring certifications." /></div>}

      <Modal isOpen={enrollModal.isOpen} onClose={enrollModal.close} title="Enroll in Training">
        <form onSubmit={handleSubmit(d => enrollMutation.mutate(d))}>
          <div className="modal-body space-y-4">
            <Select label="Employee" required {...register('employee_id',{required:true})}>
              <option value="">Select employee…</option>
              {(employees||[]).map(e=><option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </Select>
            <Select label="Training Program" required {...register('training_program_id',{required:true})}>
              <option value="">Select program…</option>
              {(programs||[]).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Input label="Scheduled Date" type="date" {...register('scheduled_date')} />
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={enrollModal.close}>Cancel</Button>
            <Button type="submit" loading={enrollMutation.isPending}>Enroll</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
