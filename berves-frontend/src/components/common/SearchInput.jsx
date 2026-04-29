import { Search, X } from 'lucide-react';
export const SearchInput = ({ value, onChange, placeholder='Search…' }) => (
  <div className="relative">
    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--ink-faint)'}} />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="input pl-9 pr-9 w-64" />
    {value && (
      <button onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
        style={{color:'var(--ink-faint)'}}>
        <X size={14} />
      </button>
    )}
  </div>
);
