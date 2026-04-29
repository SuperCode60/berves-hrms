import { clsx } from 'clsx';
export const StatCard = ({ label, value, icon: Icon, iconColor='var(--teal)', iconBg='var(--teal-bg)', change, changeLabel, loading }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: iconBg }}>
      <Icon size={22} style={{ color: iconColor }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm truncate" style={{ color: 'var(--ink-soft)' }}>{label}</p>
      {loading
        ? <div className="h-7 w-24 rounded mt-1 animate-pulse" style={{ background: 'var(--border)' }} />
        : <p className="text-base sm:text-2xl font-semibold leading-tight mt-0.5 overflow-hidden" style={{ color: 'var(--ink)', wordBreak: 'break-word' }}>{value}</p>
      }
      {change !== undefined && (
        <p className="text-xs mt-0.5" style={{ color: change >= 0 ? 'var(--emerald)' : 'var(--red)' }}>
          {change >= 0 ? '+' : ''}{change}% <span style={{ color: 'var(--ink-faint)' }}>{changeLabel}</span>
        </p>
      )}
    </div>
  </div>
);
