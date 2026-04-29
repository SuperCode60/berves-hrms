import { clsx } from 'clsx';
import { statusBadge, statusLabel } from '../../utils';
export const Badge = ({ status, label, className }) => (
  <span className={clsx(statusBadge(status), className)}>
    {label || statusLabel(status)}
  </span>
);
