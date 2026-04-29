import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, ArrowLeft, FileText, Wallet, UserCheck } from 'lucide-react';
import { employeesApi } from '../../api/employees';
import { PageHeader }   from '../../components/layout/PageHeader';
import { Avatar }       from '../../components/common/Avatar';
import { Badge }        from '../../components/common/Badge';
import { Modal }        from '../../components/common/Modal';
import { Select }       from '../../components/common/Input';
import { Button }       from '../../components/common/Button';
import { fDate, fCurrency } from '../../utils';
import { useAuth }      from '../../hooks/useAuth';
import { swSuccess, swError } from '../../lib/swal';

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { canManageEmployees } = useAuth();
  const [tab, setTab] = useState('details');
  const [mgrModal, setMgrModal] = useState(false);
  const [selectedMgr, setSelectedMgr] = useState('');

  const { data:emp, isLoading } = useQuery({
    queryKey:['employee',id],
    queryFn:() => employeesApi.get(id).then(r=>r.data.data),
  });
  const { data:docs } = useQuery({
    queryKey:['employee-docs',id],
    queryFn:() => employeesApi.documents(id).then(r=>r.data.data),
    enabled: tab==='documents',
  });
  const { data:allowances } = useQuery({
    queryKey:['employee-allowances',id],
    queryFn:() => employeesApi.allowances(id).then(r=>r.data.data),
    enabled: tab==='allowances',
  });
  const { data: managers } = useQuery({
    queryKey: ['employees-mgr'],
    queryFn:  () => employeesApi.list({ per_page: 200, status: 'active' }).then(r => r.data.data),
    enabled:  mgrModal,
  });

  const assignMgrMutation = useMutation({
    mutationFn: (manager_id) => employeesApi.assignManager(id, manager_id || null),
    onSuccess: () => {
      swSuccess('Manager assigned successfully.');
      qc.invalidateQueries(['employee', id]);
      setMgrModal(false);
    },
    onError: () => swError('Failed to assign manager.'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor:'var(--teal) transparent var(--teal) var(--teal)' }} />
    </div>
  );

  const TABS = [
    {key:'details',    label:'Personal Info'},
    {key:'employment', label:'Employment'},
    {key:'payroll',    label:'Payroll'},
    {key:'allowances', label:'Allowances'},
    {key:'documents',  label:'Documents'},
  ];

  const field = (label, value) => (
    <div key={label}>
      <p className="text-xs mb-0.5 uppercase tracking-wide" style={{ color:'var(--ink-faint)' }}>{label}</p>
      <p className="font-medium text-sm" style={{ color:'var(--ink)' }}>{value || '—'}</p>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`${emp?.first_name} ${emp?.last_name}`}
        subtitle={`${emp?.employee_number} · ${emp?.job_title?.title || ''}`}
        actions={<>
          <button onClick={() => navigate(-1)} className="btn-secondary btn-sm"><ArrowLeft size={14} /> Back</button>
          {canManageEmployees && (<>
            <button onClick={() => { setSelectedMgr(emp?.manager_id ? String(emp.manager_id) : ''); setMgrModal(true); }}
              className="btn-secondary btn-sm"><UserCheck size={14} /> Assign Manager</button>
            <button onClick={() => navigate(`/employees/${id}/edit`)} className="btn-primary btn-sm"><Edit size={14} /> Edit</button>
          </>)}
        </>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Profile card */}
        <div className="card p-6 text-center xl:col-span-1 h-fit">
          <Avatar 
          name={`${emp?.first_name} ${emp?.last_name}`} 
          photo={emp?.profile_photo_url || emp?.profile_photo} 
          size="xl" 
          className="mx-auto mb-3" 
          employeeId={emp?.id}
        />
          <h3 className="font-semibold" style={{ color:'var(--ink)' }}>{emp?.first_name} {emp?.last_name}</h3>
          <p className="text-sm" style={{ color:'var(--ink-soft)' }}>{emp?.job_title?.title}</p>
          <div className="mt-2"><Badge status={emp?.employment_status} /></div>
          <div className="mt-4 text-left space-y-3 text-sm">
            {[['Department', emp?.department?.name], ['Site', emp?.site?.name], ['Type', emp?.employment_type?.replace(/_/g,' ')], ['Hired', fDate(emp?.hire_date)]].map(([l,v]) => (
              <div key={l} className="flex justify-between">
                <span style={{ color:'var(--ink-soft)' }}>{l}</span>
                <span className="font-medium capitalize" style={{ color:'var(--ink)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex gap-0" style={{ borderBottom:'1px solid var(--border)' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={tab===t.key ? 'tab-active' : 'tab-inactive'}>{t.label}</button>
            ))}
          </div>

          {tab==='details' && (
            <div className="card card-body grid grid-cols-1 md:grid-cols-2 gap-5">
              {field('Full Name', `${emp?.first_name} ${emp?.last_name}${emp?.other_names?' '+emp.other_names:''}`)}
              {field('Date of Birth', fDate(emp?.date_of_birth))}
              {field('Gender', emp?.gender)}
              {field('National ID', emp?.national_id)}
              {field('TIN Number', emp?.tin_number)}
              {field('SSNIT', emp?.ssnit_number)}
              {field('Phone', emp?.phone)}
              {field('Email', emp?.email)}
              {field('Address', emp?.address)}
              {field('Emergency Contact', `${emp?.emergency_contact_name||''} · ${emp?.emergency_contact_phone||''}`)}
            </div>
          )}

          {tab==='employment' && (
            <div className="card card-body grid grid-cols-1 md:grid-cols-2 gap-5">
              {field('Employee Number', emp?.employee_number)}
              {field('Employment Type', emp?.employment_type?.replace(/_/g,' '))}
              {field('Status', emp?.employment_status?.replace(/_/g,' '))}
              {field('Department', emp?.department?.name)}
              {field('Job Title', emp?.job_title?.title)}
              {field('Site', emp?.site?.name)}
              {field('Manager', emp?.manager ? `${emp.manager.first_name} ${emp.manager.last_name}` : '—')}
              {field('Hire Date', fDate(emp?.hire_date))}
              {field('Probation End', fDate(emp?.probation_end_date))}
              {field('Contract End', fDate(emp?.contract_end_date))}
            </div>
          )}

          {tab==='payroll' && (
            <div className="card card-body grid grid-cols-1 md:grid-cols-2 gap-5">
              {field('Base Salary', fCurrency(emp?.base_salary))}
              {field('Bank Name', emp?.bank_name)}
              {field('Account Number', '•••• ' + (emp?.bank_account?.slice(-4) || '—'))}
              {field('Branch', emp?.bank_branch)}
            </div>
          )}

          {tab==='allowances' && (
            <div className="card">
              <div className="card-header"><h3 className="font-semibold" style={{ color:'var(--ink)' }}>Allowances</h3></div>
              <div className="divide-y" style={{ borderColor:'var(--border-lo)' }}>
                {!(allowances?.length) ? (
                  <div className="py-10 text-center text-sm" style={{ color:'var(--ink-faint)' }}>No allowances on record</div>
                ) : allowances.map(a => (
                  <div key={a.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet size={15} style={{ color:'var(--ink-faint)' }} />
                      <div>
                        <p className="text-sm font-medium capitalize" style={{ color:'var(--ink)' }}>{a.allowance_type.replace(/_/g,' ')}</p>
                        <p className="text-xs" style={{ color:'var(--ink-soft)' }}>
                          From {fDate(a.effective_from)}{a.effective_to ? ` · Until ${fDate(a.effective_to)}` : ' · Ongoing'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm" style={{ color:'var(--ink)' }}>{fCurrency(a.amount)}</p>
                      {a.is_taxable && <span className="text-xs" style={{ color:'var(--amber)' }}>Taxable</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='documents' && (
            <div className="card">
              <div className="card-header"><h3 className="font-semibold" style={{ color:'var(--ink)' }}>Documents & Certifications</h3></div>
              <div className="divide-y" style={{ borderColor:'var(--border-lo)' }}>
                {!(docs?.length) ? (
                  <div className="py-10 text-center text-sm" style={{ color:'var(--ink-faint)' }}>No documents uploaded</div>
                ) : docs.map(doc => (
                  <div key={doc.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={16} style={{ color:'var(--ink-faint)' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color:'var(--ink)' }}>{doc.document_name}</p>
                        <p className="text-xs capitalize" style={{ color:'var(--ink-soft)' }}>{doc.document_type?.replace(/_/g,' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {doc.expiry_date && <p className="text-xs" style={{ color:'var(--amber)' }}>Exp: {fDate(doc.expiry_date)}</p>}
                      <a href={doc.file_path} target="_blank" rel="noreferrer" className="text-xs hover:underline" style={{ color:'var(--teal)' }}>Download</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={mgrModal} onClose={() => setMgrModal(false)} title="Assign Manager">
        <div className="modal-body space-y-4">
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
            Current manager: <strong style={{ color: 'var(--ink)' }}>{emp?.manager ? `${emp.manager.first_name} ${emp.manager.last_name}` : 'None'}</strong>
          </p>
          <Select label="New Manager" value={selectedMgr} onChange={e => setSelectedMgr(e.target.value)}>
            <option value="">No manager (remove)</option>
            {(managers || []).filter(m => String(m.id) !== id).map(m => (
              <option key={m.id} value={m.id}>{m.first_name} {m.last_name} — {m.job_title?.title || m.department?.name || ''}</option>
            ))}
          </Select>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" type="button" onClick={() => setMgrModal(false)}>Cancel</Button>
          <Button loading={assignMgrMutation.isPending} onClick={() => assignMgrMutation.mutate(selectedMgr)}>
            <UserCheck size={14} /> Assign Manager
          </Button>
        </div>
      </Modal>
    </div>
  );
};
