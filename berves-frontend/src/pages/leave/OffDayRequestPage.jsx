import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Send } from 'lucide-react';
import { leaveApi }   from '../../api/leave';
import { PageHeader } from '../../components/layout/PageHeader';
import { Input, Textarea } from '../../components/common/Input';
import { Button }     from '../../components/common/Button';
import { swSuccess, swError } from '../../lib/swal';

export const OffDayRequestPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { register, handleSubmit, formState:{ errors } } = useForm();

  const mutation = useMutation({
    mutationFn: leaveApi.createOffDay,
    onSuccess:  () => { swSuccess('Off-day request submitted!'); qc.invalidateQueries(['off-day-requests']); navigate('/leave'); },
    onError:    (err) => swError(err.response?.data?.message || 'Failed to submit request.'),
  });

  return (
    <div>
      <PageHeader title="Request Off-Day" subtitle="Submit a new off-day request"
        actions={<button onClick={() => navigate(-1)} className="btn-secondary btn-sm"><ArrowLeft size={14} /> Back</button>}
      />
      <div className="max-w-xl">
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="card">
          <div className="card-body space-y-5">
            <div className="form-row">
              <Input
                label="Start Date"
                type="date"
                required
                error={errors.start_date?.message}
                {...register('start_date', { required: 'Start date is required' })}
              />
              <Input
                label="End Date"
                type="date"
                required
                error={errors.end_date?.message}
                {...register('end_date', { required: 'End date is required' })}
              />
            </div>
            <Textarea label="Reason (optional)" rows={3} {...register('reason')} />

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
