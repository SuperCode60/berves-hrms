import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { recruitmentApi } from '../../api/recruitment';
import { employeesApi }   from '../../api/employees';
import { PageHeader }     from '../../components/layout/PageHeader';
import { DataTable }      from '../../components/common/Table';
import { Badge }          from '../../components/common/Badge';
import { Modal }          from '../../components/common/Modal';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Button }         from '../../components/common/Button';
import { useModal }       from '../../hooks/useModal';
import { fDate }          from '../../utils';
import { useForm }        from 'react-hook-form';
import { swSuccess, swError } from '../../lib/swal';

export const RecruitmentPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const modal = useModal();
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({ queryKey:['job-postings'], queryFn:() => recruitmentApi.postings().then(r=>r.data) });
  const { data:depts  }     = useQuery({ queryKey:['departments'],  queryFn:() => employeesApi.departments().then(r=>r.data.data) });
  const { data:sites  }     = useQuery({ queryKey:['sites'],        queryFn:() => employeesApi.sites().then(r=>r.data.data) });
  const { data:titles }     = useQuery({ queryKey:['job-titles'],   queryFn:() => employeesApi.jobTitles().then(r=>r.data.data) });

  const createMutation = useMutation({
    mutationFn: recruitmentApi.createPosting,
    onSuccess:  () => { swSuccess('Job posted successfully!'); qc.invalidateQueries(['job-postings']); modal.close(); reset(); },
    onError:    () => swError('Failed to post job.'),
  });

  const columns = [
    { key:'title',           label:'Position',   render:(_, r) => <span className="font-semibold">{r.job_title?.title}</span> },
    { key:'department',      label:'Department', render:(_, r) => r.department?.name },
    { key:'site',            label:'Site',       render:(_, r) => r.site?.name||'Any' },
    { key:'employment_type', label:'Type',       render: v => <Badge status={v} label={v?.replace(/_/g,' ')} /> },
    { key:'deadline',        label:'Deadline',   render: v => fDate(v) },
    { key:'status',          label:'Status',     render: v => <Badge status={v} /> },
    { key:'applicants_count',label:'Applicants', render:(v, r) => (
      <button onClick={() => navigate('/recruitment/'+r.id+'/applicants')}
        className="flex items-center gap-1 hover:underline" style={{ color:'var(--teal)' }}>
        <Users size={12} /> {v||0}
      </button>
    )},
  ];

  return (
    <div>
      <PageHeader title="Recruitment" subtitle="Job postings and applicant tracking"
        actions={<button onClick={modal.open} className="btn-primary btn-sm"><Plus size={14} /> Post Job</button>}
      />
      <div className="card">
        <DataTable columns={columns} data={data?.data} loading={isLoading} emptyMessage="No job postings." />
      </div>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Post New Job" size="lg">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))}>
          <div className="modal-body space-y-4">
            <div className="form-row">
              <Select label="Job Title" required {...register('job_title_id',{required:true})}>
                <option value="">Select title…</option>
                {(titles||[]).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}
              </Select>
              <Select label="Department" required {...register('department_id',{required:true})}>
                <option value="">Select…</option>
                {(depts||[]).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>
            <div className="form-row">
              <Select label="Site" {...register('site_id')}>
                <option value="">Any site</option>
                {(sites||[]).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Select label="Employment Type" required {...register('employment_type',{required:true})}>
                <option value="">Select…</option>
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="site_based">Site Based</option>
              </Select>
            </div>
            <Textarea label="Description" required rows={3} {...register('description',{required:true})} />
            <Textarea label="Requirements" rows={3} {...register('requirements')} />
            <div className="form-row">
              <Input label="Salary Min (GHS)" type="number" {...register('salary_min')} />
              <Input label="Salary Max (GHS)" type="number" {...register('salary_max')} />
            </div>
            <Input label="Application Deadline" type="date" required {...register('deadline',{required:true})} />
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={() => { modal.close(); reset(); }}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Post Job</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
