import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Layers, Settings2, Users } from 'lucide-react';
import { employeesApi } from '../../api/employees';
import { PageHeader }   from '../../components/layout/PageHeader';
import { DataTable }    from '../../components/common/Table';
import { Modal }        from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { Button }       from '../../components/common/Button';
import { Avatar }       from '../../components/common/Avatar';
import { Badge }        from '../../components/common/Badge';
import { useModal }     from '../../hooks/useModal';
import { swDelete, swSuccess, swError } from '../../lib/swal';

export const DepartmentsPage = () => {
  const qc    = useQueryClient();
  const modal = useModal();
  const [manageDept, setManageDept] = useState(null);

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn:  () => employeesApi.departments().then(r => r.data.data),
  });
  const { data: sites } = useQuery({
    queryKey: ['sites', 'active'],
    queryFn:  () => employeesApi.sites().then(r => r.data.data),
  });
  const { data: employees } = useQuery({
    queryKey: ['employees-all'],
    queryFn:  () => employeesApi.list({ per_page: 200 }).then(r => r.data.data),
  });
  const { data: deptEmployees, isLoading: loadingDeptEmps } = useQuery({
    queryKey: ['dept-employees', manageDept?.id],
    queryFn:  () => employeesApi.departmentEmployees(manageDept.id).then(r => r.data.data),
    enabled:  !!manageDept,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (modal.data) {
      reset({
        name:       modal.data.name ?? '',
        site_id:    modal.data.site_id    ? String(modal.data.site_id)    : '',
        manager_id: modal.data.manager_id ? String(modal.data.manager_id) : '',
      });
    } else {
      reset({ name: '', site_id: '', manager_id: '' });
    }
  }, [modal.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) => modal.data
      ? employeesApi.updateDepartment(modal.data.id, data)
      : employeesApi.createDepartment(data),
    onSuccess: () => {
      swSuccess(modal.data ? 'Department updated.' : 'Department created.');
      qc.invalidateQueries(['departments']);
      modal.close();
    },
    onError: (err) => swError(err.response?.data?.message || 'Failed to save department.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => employeesApi.deleteDepartment(id),
    onSuccess:  () => { swSuccess('Department deleted.'); qc.invalidateQueries(['departments']); },
    onError:    (err) => swError(err.response?.data?.message || 'Could not delete department.'),
  });

  const handleDelete = async (dept) => {
    const res = await swDelete(dept.name);
    if (res.isConfirmed) deleteMutation.mutate(dept.id);
  };

  const columns = [
    { key: 'name', label: 'Department', render: (v) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--blue-bg)' }}>
          <Layers size={14} style={{ color: 'var(--blue)' }} />
        </div>
        <span className="font-semibold">{v}</span>
      </div>
    )},
    { key: 'site',    label: 'Site',    render: (_, r) => r.site?.name    || '—' },
    { key: 'manager', label: 'Manager', render: (_, r) => r.manager
      ? `${r.manager.first_name} ${r.manager.last_name}` : '—' },
    { key: 'actions', label: '', render: (_, r) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setManageDept(r)} className="btn-ghost btn-sm" title="Manage">
          <Settings2 size={13} /> <span className="hidden sm:inline">Manage</span>
        </button>
        <button onClick={() => modal.open(r)} className="btn-ghost btn-sm"><Edit2 size={13} /></button>
        <button onClick={() => handleDelete(r)} className="btn-ghost btn-sm" style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Departments" subtitle="Manage departments and their managers"
        actions={<button onClick={() => modal.open(null)} className="btn-primary btn-sm"><Plus size={14} /> Add Department</button>}
      />

      <div className="card">
        <DataTable columns={columns} data={departments} loading={isLoading} emptyMessage="No departments found." />
      </div>

      {/* ── Edit / Create Modal ───────────────────────────────────────── */}
      <Modal isOpen={modal.isOpen} onClose={modal.close} title={modal.data ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))}>
          <div className="modal-body space-y-4">
            <Input label="Department Name" required error={errors.name?.message}
              {...register('name', { required: 'Required' })} />
            <Select label="Site" {...register('site_id')}>
              <option value="">No site assigned</option>
              {(sites || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select label="Manager" {...register('manager_id')}>
              <option value="">No manager assigned</option>
              {(employees || []).map(e => (
                <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
              ))}
            </Select>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={modal.close}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {modal.data ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Manage Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={!!manageDept} onClose={() => setManageDept(null)}
        title={`Manage — ${manageDept?.name || ''}`} size="lg">
        <div className="modal-body space-y-4">
          {/* Info row */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ background: 'var(--surface-2)' }}>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--ink-faint)' }}>Site</p>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{manageDept?.site?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--ink-faint)' }}>Manager</p>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                {manageDept?.manager ? `${manageDept.manager.first_name} ${manageDept.manager.last_name}` : '—'}
              </p>
            </div>
          </div>

          {/* Employee list */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} style={{ color: 'var(--ink-soft)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                Employees
                {deptEmployees && <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--ink-soft)' }}>({deptEmployees.length})</span>}
              </p>
            </div>

            {loadingDeptEmps ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent"
                  style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
              </div>
            ) : !(deptEmployees?.length) ? (
              <div className="py-8 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>
                No employees in this department
              </div>
            ) : (
              <div className="divide-y rounded-lg overflow-hidden" style={{ borderColor: 'var(--border-lo)', border: '1px solid var(--border-lo)' }}>
                {deptEmployees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${emp.first_name} ${emp.last_name}`} photo={emp.profile_photo} size="sm" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{emp.first_name} {emp.last_name}</p>
                        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{emp.job_title?.title || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <Badge status={emp.employment_status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setManageDept(null)}>Close</Button>
          <Button onClick={() => { modal.open(manageDept); setManageDept(null); }}>
            <Edit2 size={13} /> Edit Department
          </Button>
        </div>
      </Modal>
    </div>
  );
};
