import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { safetyApi }    from '../../api/safety';
import { employeesApi } from '../../api/employees';
import { PageHeader }   from '../../components/layout/PageHeader';
import { DataTable }    from '../../components/common/Table';
import { Badge }        from '../../components/common/Badge';
import { Modal }        from '../../components/common/Modal';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Button }       from '../../components/common/Button';
import { useModal }     from '../../hooks/useModal';
import { fDate }        from '../../utils';
import { useForm }      from 'react-hook-form';
import { swSuccess, swError } from '../../lib/swal';

export const SafetyPage = () => {
  const qc    = useQueryClient();
  const modal = useModal();
  const [tab, setTab] = useState('incidents');
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading }           = useQuery({ queryKey:['incidents'],   queryFn:() => safetyApi.incidents().then(r=>r.data) });
  const { data:inspections, isLoading:inspLoading } = useQuery({
    queryKey:['inspections'], queryFn:() => safetyApi.inspections().then(r=>r.data), enabled: tab==='inspections',
  });
  const { data:sites } = useQuery({ queryKey:['sites'], queryFn:() => employeesApi.sites().then(r=>r.data.data) });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k,v]) => v && fd.append(k, v));
      return safetyApi.createIncident(fd);
    },
    onSuccess: () => { swSuccess('Incident reported!'); qc.invalidateQueries(['incidents']); modal.close(); reset(); },
    onError:   () => swError('Failed to submit incident report.'),
  });

  const incidentCols = [
    { key:'type',     label:'Type',     render: v => <Badge status={v} label={v?.replace(/_/g,' ')} /> },
    { key:'severity', label:'Severity', render: v => {
      const map = { low:'badge-green', medium:'badge-yellow', high:'badge-red', critical:'badge-red' };
      return <span className={`badge ${map[v]||'badge-gray'} capitalize`}>{v}</span>;
    }},
    { key:'incident_date', label:'Date',      render: v => fDate(v) },
    { key:'site',          label:'Site',      render:(_, r) => r.site?.name },
    { key:'reported_by',   label:'Reported By', render:(_, r) => `${r.reported_by_employee?.first_name||''} ${r.reported_by_employee?.last_name||''}` },
    { key:'status',        label:'Status',    render: v => <Badge status={v} /> },
    { key:'description',   label:'Description', render: v => (
      <span className="text-xs line-clamp-1 max-w-xs" style={{ color:'var(--ink-soft)' }}>{v}</span>
    )},
  ];

  const inspectionCols = [
    { key:'inspection_date', label:'Date',      render: v => fDate(v) },
    { key:'site',            label:'Site',      render:(_, r) => r.site?.name },
    { key:'inspector',       label:'Inspector', render:(_, r) => `${r.inspector?.first_name||''} ${r.inspector?.last_name||''}` },
    { key:'risk_level', label:'Risk', render: v => {
      const map = { low:'badge-green', medium:'badge-yellow', high:'badge-red' };
      return <span className={`badge ${map[v]||'badge-gray'} capitalize`}>{v}</span>;
    }},
    { key:'status',          label:'Status',    render: v => <Badge status={v} /> },
    { key:'follow_up_required', label:'Follow-up', render: v => v
      ? <span className="text-xs font-medium" style={{ color:'var(--orange)' }}>Required</span> : '—'
    },
  ];

  return (
    <div>
      <PageHeader title="Health & Safety" subtitle="Incident reporting and safety inspections"
        actions={<button onClick={modal.open} className="btn-primary btn-sm"><Plus size={14} /> Report Incident</button>}
      />

      <div className="flex gap-0 mb-4" style={{ borderBottom:'1px solid var(--border)' }}>
        {[['incidents','Incidents'],['inspections','Inspections']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} className={tab===k ? 'tab-active' : 'tab-inactive'}>{l}</button>
        ))}
      </div>

      {tab==='incidents'   && <div className="card"><DataTable columns={incidentCols}  data={data?.data}        loading={isLoading}    emptyMessage="No incidents reported." /></div>}
      {tab==='inspections' && <div className="card"><DataTable columns={inspectionCols} data={inspections?.data} loading={inspLoading}   emptyMessage="No inspections recorded." /></div>}

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Report Incident" size="lg">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))}>
          <div className="modal-body space-y-4">
            <div className="form-row">
              <Select label="Incident Type" required {...register('type',{required:true})}>
                <option value="">Select…</option>
                {['near_miss','first_aid','medical_treatment','lost_time','fatality','property_damage'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                ))}
              </Select>
              <Select label="Severity" required {...register('severity',{required:true})}>
                <option value="">Select…</option>
                {['low','medium','high','critical'].map(s => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </Select>
            </div>
            <div className="form-row">
              <Select label="Site" required {...register('site_id',{required:true})}>
                <option value="">Select site…</option>
                {(sites||[]).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Input label="Incident Date" type="date" required {...register('incident_date',{required:true})} />
            </div>
            <Textarea label="Description" required rows={3} {...register('description',{required:true})} />
            <Textarea label="Corrective Actions" rows={2} {...register('corrective_actions')} />
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={() => { modal.close(); reset(); }}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Submit Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
