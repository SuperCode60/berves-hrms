import { X } from 'lucide-react';
import { useEffect } from 'react';

const sizes = { sm:'max-w-sm', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' };

export const Modal = ({ isOpen, onClose, title, children, size='md' }) => {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${sizes[size]}`}>
        <div className="modal-header">
          <h3 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--ink-soft)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--canvas)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};