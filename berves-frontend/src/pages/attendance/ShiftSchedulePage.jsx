import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { attendanceApi } from '../../api/attendance';
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

export const ShiftSchedulePage = () => {
  const qc = useQueryClient();
  const modal = useModal();
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading }  = useQuery({ queryKey:['shift-schedules'],  queryFn:() => attendanceApi.shifts().then(r=>r.data) });
  const { data:templates }   = useQuery({ queryKey:['shift-templates'],  queryFn:() => attendanceApi.shiftTemplates().then(r=>r.data.data) });
  const { data:employees }   = useQuery({ queryKey:['employees-list'],   queryFn:() => employeesApi.list({ per_page:999 }).then(r=>r.data.data) });
  const { data:sites }       = useQuery({ queryKey:['sites'],            queryFn:() => employeesApi.sites().then(r=>r.data.data) });

  const createMutation = useMutation({
    mutationFn: attendanceApi.createSchedule,
    onSuccess:  () => { swSuccess('Shift scheduled!'); qc.invalidateQueries(['shift-schedules']); modal.close(); reset(); },
    onError:    () => swError('Failed to schedule shift.'),
  });

  const columns = [
    { key:'employee',       label:'Employee',  render:(_, r) => <span className="font-medium">{r.employee?.first_name} {r.employee?.last_name}</span> },
    { key:'shift_template', label:'Shift',     render:(_, r) => <>{r.shift_template?.name} <span className="text-xs" style={{color:'var(--ink-faint)'}}>({r.shift_template?.start_time}–{r.shift_template?.end_time})</span></> },
    { key:'schedule_date',  label:'Date',      render: v => fDate(v) },
    { key:'site',           label:'Site',      render:(_, r) => r.site?.name },
    { key:'status',         label:'Status',    render: v => <Badge status={v} /> },
  ];

  return (
    <div>
      <PageHeader title="Shift Schedules" subtitle="Manage employee shift assignments"
        actions={<button onClick={modal.open} className="btn-primary btn-sm"><Plus size={14} /> Assign Shift</button>}
      />
      <div className="card">
        <DataTable columns={columns} data={data?.data} loading={isLoading} emptyMessage="No shifts scheduled." />
      </div>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Assign Shift">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))}>
          <div className="modal-body space-y-4">
            <Select label="Employee" required {...register('employee_id', { required:true })}>
              <option value="">Select employee…</option>
              {(employees||[]).map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </Select>
            <Select label="Shift Template" required {...register('shift_template_id', { required:true })}>
              <option value="">Select shift…</option>
              {(templates||[]).map(t => <option key={t.id} value={t.id}>{t.name} ({t.start_time}–{t.end_time})</option>)}
            </Select>
            <Select label="Site" required {...register('site_id', { required:true })}>
              <option value="">Select site…</option>
              {(sites||[]).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Input label="Date" type="date" required {...register('schedule_date', { required:true })} />
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={modal.close}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Assign</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
