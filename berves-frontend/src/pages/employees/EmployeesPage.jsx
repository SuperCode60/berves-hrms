import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Download, Trash2, Layers, MapPin } from 'lucide-react';
import { employeesApi }  from '../../api/employees';
import { PageHeader }    from '../../components/layout/PageHeader';
import { DataTable }     from '../../components/common/Table';
import { Pagination }    from '../../components/common/Pagination';
import { Badge }         from '../../components/common/Badge';
import { Avatar }        from '../../components/common/Avatar';
import { SearchInput }   from '../../components/common/SearchInput';
import { Select }        from '../../components/common/Input';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce }   from '../../hooks/useDebounce';
import { fDate }         from '../../utils';
import { useAuth }     from '../../hooks/useAuth';
import { swDelete, swSuccess, swError } from '../../lib/swal';

export const EmployeesPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { canManageEmployees } = useAuth();
  const { page, setPage, perPage } = usePagination();
  const [search,       setSearch] = useState('');
  const [statusFilter, setStatus] = useState('');
  const [typeFilter,   setType]   = useState('');
  const [deptFilter,   setDept]   = useState('');
  const [siteFilter,   setSite]   = useState('');
  const dSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, perPage, dSearch, statusFilter, typeFilter, deptFilter, siteFilter],
    queryFn:  () => employeesApi.list({
      page, per_page: perPage, search: dSearch,
      status: statusFilter, type: typeFilter,
      department_id: deptFilter, site_id: siteFilter,
    }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: depts } = useQuery({ queryKey:['departments'], queryFn:() => employeesApi.departments().then(r=>r.data.data) });
  const { data: sites } = useQuery({ queryKey:['sites','active'], queryFn:() => employeesApi.sites().then(r=>r.data.data) });

  const deleteMutation = useMutation({
    mutationFn: (id) => employeesApi.delete(id),
    onSuccess:  () => { swSuccess('Employee deleted.'); qc.invalidateQueries(['employees']); },
    onError:    () => swError('Could not delete employee.'),
  });

  const handleDelete = async (id, name) => {
    const res = await swDelete(name);
    if (res.isConfirmed) deleteMutation.mutate(id);
  };

  const columns = [
    { key:'name', label:'Employee', render:(_, row) => (
      <div className="flex items-center gap-3">
        <Avatar 
          name={row.first_name + ' ' + row.last_name} 
          photo={row.profile_photo_url || row.profile_photo} 
          size="sm" 
          employeeId={row.id}
        />
        <div>
          <p className="font-semibold text-sm" style={{ color:'var(--ink)' }}>{row.first_name} {row.last_name}</p>
          <p className="text-xs" style={{ color:'var(--ink-faint)' }}>{row.employee_number}</p>
        </div>
      </div>
    )},
    { key:'department', label:'Department', render:(_, row) => row.department?.name || '—' },
    { key:'job_title',  label:'Role',       render:(_, row) => row.job_title?.title || '—' },
    { key:'site',       label:'Site',       render:(_, row) => row.site?.name || '—' },
    { key:'employment_type',   label:'Type',   render: v => <Badge status={v} label={v?.replace(/_/g,' ')} /> },
    { key:'employment_status', label:'Status', render: v => <Badge status={v} /> },
    { key:'hire_date', label:'Hired', render: v => fDate(v) },
    { key:'actions', label:'', width:'100px', render:(_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => navigate('/employees/'+row.id)} className="btn-ghost btn-sm">View</button>
        <button onClick={() => handleDelete(row.id, row.first_name+' '+row.last_name)}
          className="btn-ghost btn-sm" style={{ color:'var(--red)' }}>
          <Trash2 size={13} />
        </button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Employees" subtitle={data?.meta?.total ? `${data.meta.total} employees` : ''}
        actions={<>
          {canManageEmployees && <>
            <button onClick={() => navigate('/employees/departments')} className="btn-secondary btn-sm"><Layers size={14} /> Departments</button>
            <button onClick={() => navigate('/employees/sites')}       className="btn-secondary btn-sm"><MapPin  size={14} /> Sites</button>
          </>}
          <button className="btn-secondary btn-sm"><Download size={14} /> Export</button>
          <button onClick={() => navigate('/employees/new')} className="btn-primary btn-sm"><UserPlus size={14} /> Add Employee</button>
        </>}
      />
      <div className="card">
        <div className="card-header gap-3 flex-wrap">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search employees…" />
          <Select value={deptFilter} onChange={e => { setDept(e.target.value); setPage(1); }} className="w-44">
            <option value="">All Departments</option>
            {(depts||[]).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Select value={siteFilter} onChange={e => { setSite(e.target.value); setPage(1); }} className="w-40">
            <option value="">All Sites</option>
            {(sites||[]).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-36">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
            <option value="suspended">Suspended</option>
          </Select>
          <Select value={typeFilter} onChange={e => { setType(e.target.value); setPage(1); }} className="w-40">
            <option value="">All Types</option>
            <option value="permanent">Permanent</option>
            <option value="contract">Contract</option>
            <option value="site_based">Site Based</option>
          </Select>
        </div>
        <DataTable columns={columns} data={data?.data} loading={isLoading} emptyMessage="No employees found." />
        <Pagination meta={data?.meta} onPageChange={setPage} />
      </div>
    </div>
  );
};
