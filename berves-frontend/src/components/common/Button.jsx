import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
export const Button = ({ children, variant='primary', size='md', loading, className, ...props }) => {
  const variants = {
    primary:'btn-primary', secondary:'btn-secondary',
    danger:'btn-danger',   ghost:'btn-ghost',
  };
  const sizes = { sm:'btn-sm', md:'', lg:'btn-lg' };
  return (
    <button className={clsx('btn', variants[variant], sizes[size], className)}
      disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
};
