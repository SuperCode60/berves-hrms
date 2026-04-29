import { ChevronLeft, ChevronRight } from 'lucide-react';
export const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.last_page <= 1) return null;
  const { current_page, last_page, from, to, total } = meta;
  const pages = Array.from({ length: last_page }, (_, i) => i + 1)
    .filter(p => p === 1 || p === last_page || Math.abs(p - current_page) <= 2);
  return (
    <div className="flex items-center justify-between px-5 py-3" style={{borderTop:'1px solid var(--border-lo)'}}>
      <p className="text-sm" style={{color:'var(--ink-soft)'}}>
        Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> of <span className="font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(current_page - 1)} disabled={current_page === 1}
          className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
          style={{color:'var(--ink-soft)'}} onMouseOver={e=>e.currentTarget.style.background='var(--canvas)'} onMouseOut={e=>e.currentTarget.style.background=''}>
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i, arr) => (
          <span key={p}>
            {i > 0 && arr[i-1] !== p-1 && <span className="px-1" style={{color:'var(--ink-faint)'}}>…</span>}
            <button onClick={() => onPageChange(p)}
              className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
              style={p === current_page
                ? {background:'var(--teal)', color:'#fff'}
                : {color:'var(--ink-soft)'}}>
              {p}
            </button>
          </span>
        ))}
        <button onClick={() => onPageChange(current_page + 1)} disabled={current_page === last_page}
          className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
          style={{color:'var(--ink-soft)'}} onMouseOver={e=>e.currentTarget.style.background='var(--canvas)'} onMouseOut={e=>e.currentTarget.style.background=''}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
