import { clsx } from 'clsx';
import { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className, required, ...props }, ref) => (
  <div>
    {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <input ref={ref} className={clsx('input', error && 'border-red-400 focus:ring-red-400/20', className)} {...props} />
    {error && <p className="error-msg">{error}</p>}
  </div>
));
Input.displayName = 'Input';

export const Select = forwardRef(({ label, error, children, className, required, ...props }, ref) => (
  <div>
    {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <select ref={ref} className={clsx('input', error && 'border-red-400', className)} {...props}>{children}</select>
    {error && <p className="error-msg">{error}</p>}
  </div>
));
Select.displayName = 'Select';

export const Textarea = forwardRef(({ label, error, className, required, ...props }, ref) => (
  <div>
    {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <textarea ref={ref} className={clsx('input min-h-[80px] resize-y', error && 'border-red-400', className)} {...props} />
    {error && <p className="error-msg">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';
