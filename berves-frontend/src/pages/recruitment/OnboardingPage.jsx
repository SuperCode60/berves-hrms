import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Circle } from 'lucide-react';
import { recruitmentApi } from '../../api/recruitment';
import { PageHeader }     from '../../components/layout/PageHeader';
import { swSuccess, swError } from '../../lib/swal';

export const OnboardingPage = () => {
  const { employeeId } = useParams();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding', employeeId],
    queryFn:  () => recruitmentApi.onboarding(employeeId).then(r => r.data.data),
  });

  const completeMutation = useMutation({
    mutationFn: (id) => recruitmentApi.completeTask(id, { status:'completed' }),
    onSuccess:  () => { swSuccess('Task marked as complete!'); qc.invalidateQueries(['onboarding', employeeId]); },
    onError:    () => swError('Failed to complete task.'),
  });

  const grouped = (data||[]).reduce((acc, item) => {
    const cat = item.checklist?.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const total     = data?.length || 0;
  const completed = data?.filter(i => i.status==='completed').length || 0;

  return (
    <div>
      <PageHeader title="Onboarding Checklist" subtitle={`Employee #${employeeId} · ${completed}/${total} tasks completed`} />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor:'var(--teal) transparent var(--teal) var(--teal)' }} />
        </div>
      ) : Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="card mb-4">
          <div className="card-header">
            <h3 className="font-semibold" style={{ color:'var(--ink)' }}>{category}</h3>
            <span className="text-sm" style={{ color:'var(--ink-soft)' }}>
              {items.filter(i=>i.status==='completed').length}/{items.length} done
            </span>
          </div>
          <div className="divide-y" style={{ borderColor:'var(--border-lo)' }}>
            {items.map(item => (
              <div key={item.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.status==='completed'
                    ? <CheckCircle size={18} style={{ color:'var(--emerald)', flexShrink:0 }} />
                    : <Circle     size={18} style={{ color:'var(--border)',   flexShrink:0 }} />
                  }
                  <div>
                    <p className="text-sm font-medium" style={{ color:'var(--ink)' }}>{item.checklist?.name}</p>
                    {item.checklist?.is_mandatory && <span className="text-xs" style={{ color:'var(--red)' }}>Mandatory</span>}
                  </div>
                </div>
                {item.status!=='completed' && (
                  <button onClick={() => completeMutation.mutate(item.id)} className="btn-primary btn-sm"
                    disabled={completeMutation.isPending}>Mark Done</button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
