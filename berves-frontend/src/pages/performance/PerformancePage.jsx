import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { performanceApi } from '../../api/performance';
import { employeesApi }   from '../../api/employees';
import { PageHeader }     from '../../components/layout/PageHeader';
import { DataTable }      from '../../components/common/Table';
import { Badge }          from '../../components/common/Badge';
import { Modal }          from '../../components/common/Modal';
import { Select }         from '../../components/common/Input';
import { Button }         from '../../components/common/Button';
import { useModal }       from '../../hooks/useModal';
import { fDate }          from '../../utils';
import { useForm }        from 'react-hook-form';
import { swSuccess, swError } from '../../lib/swal';

export const PerformancePage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const modal = useModal();
  const { register, handleSubmit } = useForm();

  const { data, isLoading } = useQuery({ queryKey:['appraisals'],       queryFn:() => performanceApi.appraisals().then(r=>r.data) });
  const { data:cycles }     = useQuery({ queryKey:['appraisal-cycles'],  queryFn:() => performanceApi.cycles().then(r=>r.data.data) });
  const { data:employees }  = useQuery({ queryKey:['employees-list'],    queryFn:() => employeesApi.list({ per_page:999 }).then(r=>r.data.data) });

  const createMutation = useMutation({
    mutationFn: performanceApi.createAppraisal,
    onSuccess:  (res) => {
      swSuccess('Appraisal created!');
      qc.invalidateQueries(['appraisals']);
      modal.close();
      navigate('/performance/appraisals/'+res.data.data.id);
    },
    onError: () => swError('Failed to create appraisal.'),
  });

  const columns = [
    { key:'employee',      label:'Employee',  render:(_, r) => <span className="font-semibold">{r.employee?.first_name} {r.employee?.last_name}</span> },
    { key:'appraiser',     label:'Appraiser', render:(_, r) => r.appraiser?.first_name+' '+r.appraiser?.last_name },
    { key:'cycle',         label:'Cycle',     render:(_, r) => r.appraisal_cycle?.name },
    { key:'overall_score', label:'Score',     render: v => v ? <span className="font-semibold">{v}%</span> : '—' },
    { key:'status',        label:'Status',    render: v => <Badge status={v} /> },
    { key:'actions', label:'', render:(_, r) => (
      <button onClick={() => navigate('/performance/appraisals/'+r.id)} className="btn-ghost btn-sm">View</button>
    )},
  ];

  return (
    <div>
      <PageHeader title="Performance" subtitle="KPI appraisals and evaluations"
        actions={<button onClick={modal.open} className="btn-primary btn-sm"><Plus size={14} /> New Appraisal</button>}
      />
      <div className="card">
        <DataTable columns={columns} data={data?.data} loading={isLoading} emptyMessage="No appraisals." />
      </div>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Create Appraisal">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))}>
          <div className="modal-body space-y-4">
            <Select label="Employee" required {...register('employee_id',{required:true})}>
              <option value="">Select employee…</option>
              {(employees||[]).map(e=><option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </Select>
            <Select label="Appraiser (Manager)" required {...register('appraiser_id',{required:true})}>
              <option value="">Select manager…</option>
              {(employees||[]).map(e=><option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </Select>
            <Select label="Appraisal Cycle" required {...register('appraisal_cycle_id',{required:true})}>
              <option value="">Select cycle…</option>
              {(cycles||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={modal.close}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
