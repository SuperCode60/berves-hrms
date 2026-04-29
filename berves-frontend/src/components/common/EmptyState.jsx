export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {Icon && (
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--canvas)', color: 'var(--ink-faint)' }}>
        <Icon size={28} />
      </div>
    )}
    <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--ink)' }}>{title}</h3>
    {description && <p className="text-sm max-w-xs" style={{ color: 'var(--ink-soft)' }}>{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
