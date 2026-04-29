import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { recruitmentApi } from '../../api/recruitment';
import { PageHeader }     from '../../components/layout/PageHeader';
import { DataTable }      from '../../components/common/Table';
import { Badge }          from '../../components/common/Badge';
import { Select }         from '../../components/common/Input';
import { fDate }          from '../../utils';
import { swSuccess, swError } from '../../lib/swal';

const STATUSES = ['applied','shortlisted','interviewed','offered','rejected','hired'];

export const ApplicantsPage = () => {
  const { postingId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['applicants', postingId],
    queryFn:  () => recruitmentApi.applicants(postingId).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => recruitmentApi.updateApplicant(id, { status }),
    onSuccess:  () => { swSuccess('Applicant status updated.'); qc.invalidateQueries(['applicants', postingId]); },
    onError:    () => swError('Failed to update status.'),
  });

  const columns = [
    { key:'full_name',  label:'Applicant', render: v => <span className="font-semibold">{v}</span> },
    { key:'email',      label:'Email' },
    { key:'phone',      label:'Phone', render: v => v||'—' },
    { key:'applied_at', label:'Applied', render: v => fDate(v) },
    { key:'status',     label:'Status',  render: v => <Badge status={v} /> },
    { key:'actions', label:'Move to', render:(_, r) => (
      <Select value={r.status} onChange={e => updateMutation.mutate({ id:r.id, status:e.target.value })} className="w-32 text-xs py-1">
        {STATUSES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
      </Select>
    )},
    { key:'cv_path', label:'CV', render: v => v
      ? <a href={v} target="_blank" rel="noreferrer" className="text-xs hover:underline" style={{ color:'var(--teal)' }}>Download</a>
      : '—'
    },
  ];

  return (
    <div>
      <PageHeader title="Applicants" subtitle={'Job posting #'+postingId}
        actions={<button onClick={() => navigate(-1)} className="btn-secondary btn-sm"><ArrowLeft size={14} /> Back</button>}
      />
      <div className="card">
        <DataTable columns={columns} data={data?.data} loading={isLoading} emptyMessage="No applicants yet." />
      </div>
    </div>
  );
};
