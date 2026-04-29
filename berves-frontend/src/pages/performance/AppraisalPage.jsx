import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceApi } from '../../api/performance';
import { PageHeader }     from '../../components/layout/PageHeader';
import { Badge }          from '../../components/common/Badge';
import { Button }         from '../../components/common/Button';
import { ArrowLeft, Send } from 'lucide-react';
import { fDate }          from '../../utils';
import { swSuccess, swError, swConfirm } from '../../lib/swal';

export const AppraisalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data:appraisal, isLoading } = useQuery({
    queryKey: ['appraisal', id],
    queryFn:  () => performanceApi.getAppraisal(id).then(r => r.data.data),
  });

  const submitMutation = useMutation({
    mutationFn: () => performanceApi.submitAppraisal(id),
    onSuccess:  () => { swSuccess('Appraisal submitted for review!'); qc.invalidateQueries(['appraisal', id]); },
    onError:    () => swError('Failed to submit appraisal.'),
  });

  const scoreMutation = useMutation({
    mutationFn: ({ kpiId, actual_value, comments }) => performanceApi.updateKpiScore(id, kpiId, { actual_value, comments }),
    onSuccess:  () => qc.invalidateQueries(['appraisal', id]),
  });

  const handleSubmit = async () => {
    const res = await swConfirm({
      title:       'Submit appraisal?',
      text:        'Once submitted, you can no longer edit the scores.',
      confirmText: 'Submit for review',
    });
    if (res.isConfirmed) submitMutation.mutate();
  };

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor:'var(--teal) transparent var(--teal) var(--teal)' }} />
    </div>
  );

  return (
    <div>
      <PageHeader title="Appraisal" subtitle={appraisal?.appraisal_cycle?.name}
        actions={<>
          <button onClick={() => navigate(-1)} className="btn-secondary btn-sm"><ArrowLeft size={14} /> Back</button>
          {appraisal?.status==='draft' && (
            <Button onClick={handleSubmit} loading={submitMutation.isPending}><Send size={14} /> Submit</Button>
          )}
        </>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="card p-5 h-fit">
          <div className="space-y-3 text-sm">
            {[['Employee',  appraisal?.employee?.first_name+' '+appraisal?.employee?.last_name],
              ['Appraiser', appraisal?.appraiser?.first_name+' '+appraisal?.appraiser?.last_name],
              ['Cycle',     appraisal?.appraisal_cycle?.name],
            ].map(([l,v]) => (
              <div key={l} className="flex justify-between">
                <span style={{ color:'var(--ink-soft)' }}>{l}</span>
                <span className="font-medium" style={{ color:'var(--ink)' }}>{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span style={{ color:'var(--ink-soft)' }}>Status</span>
              <Badge status={appraisal?.status} />
            </div>
            <div className="flex justify-between">
              <span style={{ color:'var(--ink-soft)' }}>Overall Score</span>
              <span className="font-semibold" style={{ color:'var(--ink)' }}>
                {appraisal?.overall_score ? appraisal.overall_score+'%' : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Scores */}
        <div className="xl:col-span-2 card">
          <div className="card-header">
            <h3 className="font-semibold" style={{ color:'var(--ink)' }}>KPI Scores</h3>
          </div>
          <div className="divide-y" style={{ borderColor:'var(--border-lo)' }}>
            {(appraisal?.kpi_scores||[]).map(kpi => (
              <div key={kpi.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium" style={{ color:'var(--ink)' }}>{kpi.kpi?.name}</p>
                    <p className="text-xs mt-0.5" style={{ color:'var(--ink-faint)' }}>
                      Target: {kpi.target_value} {kpi.kpi?.measurement_unit} · Weight: {kpi.kpi?.weight}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {appraisal?.status==='draft' ? (
                      <input type="number" defaultValue={kpi.actual_value||''} placeholder="Actual"
                        className="input w-24 text-sm"
                        onBlur={e => scoreMutation.mutate({ kpiId:kpi.kpi_id, actual_value:e.target.value })} />
                    ) : (
                      <span className="font-semibold" style={{ color:'var(--ink)' }}>{kpi.actual_value||'—'}</span>
                    )}
                    {kpi.score && <span className="badge badge-blue">{kpi.score}pts</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
