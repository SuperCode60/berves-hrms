import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Send } from 'lucide-react';
import { leaveApi }   from '../../api/leave';
import { PageHeader } from '../../components/layout/PageHeader';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Button }     from '../../components/common/Button';
import { swSuccess, swError } from '../../lib/swal';

export const LeaveRequestPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { register, handleSubmit, formState:{ errors }, watch } = useForm();

  const { data:types }        = useQuery({ queryKey:['leave-types'],        queryFn:() => leaveApi.types().then(r=>r.data.data) });
  const { data:entitlements } = useQuery({ queryKey:['leave-entitlements'], queryFn:() => leaveApi.entitlements().then(r=>r.data.data) });

  const mutation = useMutation({
    mutationFn: leaveApi.createRequest,
    onSuccess:  () => { swSuccess('Leave request submitted!'); qc.invalidateQueries(['leave-requests']); navigate('/leave'); },
    onError:    (err) => swError(err.response?.data?.message || 'Failed to submit request.'),
  });

  const selectedType  = watch('leave_type_id');
  const entitlement   = entitlements?.find(e => String(e.leave_type_id) === String(selectedType));
  const remaining     = entitlement ? entitlement.entitled_days - entitlement.used_days : null;

  return (
    <div>
      <PageHeader title="Request Leave" subtitle="Submit a new leave request"
        actions={<button onClick={() => navigate(-1)} className="btn-secondary btn-sm"><ArrowLeft size={14} /> Back</button>}
      />
      <div className="max-w-xl">
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="card">
          <div className="card-body space-y-5">
            <Select label="Leave Type" required error={errors.leave_type_id?.message} {...register('leave_type_id',{required:'Required'})}>
              <option value="">Select type…</option>
              {(types||[]).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>

            {remaining !== null && (
              <div className="p-3 rounded-lg text-sm" style={{ background:'var(--blue-bg)', color:'var(--blue)' }}>
                Remaining: <strong>{remaining}</strong> day(s) of {entitlement.entitled_days} entitled
              </div>
            )}

            <div className="form-row">
              <Input label="Start Date" type="date" required error={errors.start_date?.message} {...register('start_date',{required:'Required'})} />
              <Input label="End Date"   type="date" required error={errors.end_date?.message}   {...register('end_date',{required:'Required'})} />
            </div>
            <Textarea label="Reason" rows={3} {...register('reason')} />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" loading={mutation.isPending}><Send size={14} /> Submit Request</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
