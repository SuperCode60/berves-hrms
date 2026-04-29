import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, Camera } from 'lucide-react';
import { employeesApi } from '../../api/employees';
import { PageHeader }   from '../../components/layout/PageHeader';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Button }       from '../../components/common/Button';
import { Avatar }       from '../../components/common/Avatar';
import ProfilePhotoUpload from '../../components/common/ProfilePhotoUpload';
import { profilePhotoApi } from '../../api/profilePhoto';
import { swSuccess, swError } from '../../lib/swal';

const schema = z.object({
  first_name:  z.string().min(1,'Required'),
  last_name:   z.string().min(1,'Required'),
  email:       z.string().email().optional().or(z.literal('')),
  phone:       z.string().min(1,'Required'),
  date_of_birth:   z.string().optional(),
  gender:          z.enum(['male','female','other']).optional().or(z.literal('')),
  national_id:     z.string().optional(),
  tin_number:      z.string().optional(),
  ssnit_number:    z.string().optional(),
  department_id:   z.string().min(1,'Required'),
  job_title_id:    z.string().min(1,'Required'),
  site_id:         z.string().min(1,'Required'),
  manager_id:      z.string().optional(),
  employment_type: z.enum(['permanent','contract','site_based']),
  hire_date:       z.string().min(1,'Required'),
  contract_end_date:  z.string().optional(),
  probation_end_date: z.string().optional(),
  base_salary:     z.string().min(1,'Required'),
  bank_name:       z.string().optional(),
  bank_account:    z.string().optional(),
  bank_branch:     z.string().optional(),
  address:                  z.string().optional(),
  emergency_contact_name:   z.string().optional(),
  emergency_contact_phone:  z.string().optional(),
});

export const EmployeeFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const photoRef  = useRef(null);
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const { data: depts     } = useQuery({ queryKey:['departments'],      queryFn:() => employeesApi.departments().then(r=>r.data.data) });
  const { data: sites     } = useQuery({ queryKey:['sites','active'],   queryFn:() => employeesApi.sites().then(r=>r.data.data) });
  const { data: titles    } = useQuery({ queryKey:['job-titles'],       queryFn:() => employeesApi.jobTitles().then(r=>r.data.data) });
  const { data: managers  } = useQuery({ queryKey:['employees-mgr'],    queryFn:() => employeesApi.list({ per_page: 200, status:'active' }).then(r=>r.data.data) });
  const { data: emp       } = useQuery({ queryKey:['employee',id],      queryFn:() => employeesApi.get(id).then(r=>r.data.data), enabled:isEdit });

  const { register, handleSubmit, reset, formState:{ errors } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (emp) {
      reset({
        ...emp,
        department_id:      String(emp.department_id),
        job_title_id:       String(emp.job_title_id),
        site_id:            String(emp.site_id),
        manager_id:         emp.manager_id ? String(emp.manager_id) : '',
        base_salary:        String(emp.base_salary),
        contract_end_date:  emp.contract_end_date  ?? '',
        probation_end_date: emp.probation_end_date ?? '',
      });
      setPhotoPreview(emp.profile_photo_url || emp.profile_photo || null);
    }
  }, [emp, reset]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      let result;
      if (isEdit) {
        result = await employeesApi.update(id, data);
      } else {
        result = await employeesApi.create(data);
      }
      if (photoFile) {
        const empId = isEdit ? id : result.data.data.id;
        const fd = new FormData();
        fd.append('profile_photo', photoFile);
        await profilePhotoApi.upload(empId, fd);
      }
      return result;
    },
    onSuccess: () => {
      swSuccess(isEdit ? 'Employee updated successfully!' : 'Employee created successfully!');
      qc.invalidateQueries(['employees']);
      navigate('/employees');
    },
    onError: (err) => swError(err.response?.data?.message || 'Failed to save employee.'),
  });

  const fullName = `${emp?.first_name || ''} ${emp?.last_name || ''}`.trim() || 'New Employee';

  const SECTIONS = [
    { title:'Profile Photo', fields:(
      <div className="flex justify-center">
        <div className="text-center">
          <ProfilePhotoUpload
            currentPhoto={photoPreview}
            name={`${emp?.first_name} ${emp?.last_name}`}
            size="2xl"
            onPhotoChange={(file) => {
              if (file) {
                setPhotoFile(file);
                setPhotoPreview(URL.createObjectURL(file));
              } else {
                setPhotoFile(null);
                setPhotoPreview(null);
              }
            }}
            className="mx-auto"
          />
        </div>
      </div>
    )},
    { title:'Personal Information', fields:(
      <div className="space-y-5">
        <div className="form-row">
          <Input label="First Name" required error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Last Name"  required error={errors.last_name?.message}  {...register('last_name')} />
        </div>
        <div className="form-row">
          <Input label="Phone" required error={errors.phone?.message} {...register('phone')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <div className="form-row">
          <Input label="Date of Birth" type="date" {...register('date_of_birth')} />
          <Select label="Gender" error={errors.gender?.message} {...register('gender')}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div className="form-row">
          <Input label="National ID"  {...register('national_id')} />
          <Input label="TIN Number"   {...register('tin_number')} />
        </div>
        <Input label="SSNIT Number" {...register('ssnit_number')} />
        <Textarea label="Address" rows={2} {...register('address')} />
        <div className="form-row">
          <Input label="Emergency Contact Name"  {...register('emergency_contact_name')} />
          <Input label="Emergency Contact Phone" {...register('emergency_contact_phone')} />
        </div>
      </div>
    )},
    { title:'Employment Details', fields:(
      <div className="space-y-5">
        <div className="form-row">
          <Select label="Department" required error={errors.department_id?.message} {...register('department_id')}>
            <option value="">Select department…</option>
            {(depts||[]).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Select label="Job Title" required error={errors.job_title_id?.message} {...register('job_title_id')}>
            <option value="">Select title…</option>
            {(titles||[]).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}
          </Select>
        </div>
        <div className="form-row">
          <Select label="Site" required error={errors.site_id?.message} {...register('site_id')}>
            <option value="">Select site…</option>
            {(sites||[]).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select label="Employment Type" required error={errors.employment_type?.message} {...register('employment_type')}>
            <option value="">Select type…</option>
            <option value="permanent">Permanent</option>
            <option value="contract">Contract</option>
            <option value="site_based">Site Based</option>
          </Select>
        </div>
        <Select label="Direct Manager" {...register('manager_id')}>
          <option value="">No manager assigned</option>
          {(managers||[]).filter(m => !id || String(m.id) !== id).map(m=>(
            <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
          ))}
        </Select>
        <div className="form-row">
          <Input label="Hire Date" type="date" required error={errors.hire_date?.message} {...register('hire_date')} />
          <Input label="Probation End Date" type="date" {...register('probation_end_date')} />
        </div>
        <Input label="Contract End Date" type="date" {...register('contract_end_date')}
          placeholder="Leave blank for permanent staff" />
      </div>
    )},
    { title:'Payroll & Banking', fields:(
      <div className="space-y-5">
        <Input label="Base Salary (GHS)" type="number" step="0.01" required error={errors.base_salary?.message} {...register('base_salary')} />
        <div className="form-row">
          <Input label="Bank Name"       {...register('bank_name')} />
          <Input label="Account Number"  {...register('bank_account')} />
        </div>
        <Input label="Bank Branch" {...register('bank_branch')} />
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Employee' : 'Add New Employee'}
        subtitle={isEdit ? 'Update employee record' : 'Create a new employee profile'}
        actions={<button onClick={() => navigate(-1)} className="btn-secondary btn-sm"><ArrowLeft size={14} /> Back</button>}
      />
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-6">
        {SECTIONS.map(s => (
          <div key={s.title} className="card">
            <div className="card-header">
              <h3 className="font-semibold" style={{ color:'var(--ink)' }}>{s.title}</h3>
            </div>
            <div className="card-body">{s.fields}</div>
          </div>
        ))}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={mutation.isLoading || mutation.isPending}>
            <Save size={14} /> {isEdit ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
};
