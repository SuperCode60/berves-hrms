import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const fDate     = (date) => date ? format(parseISO(String(date).slice(0,10)), 'dd MMM yyyy') : '—';
export const fDateTime = (date) => date ? format(parseISO(date), 'dd MMM yyyy, HH:mm') : '—';
export const fRelative = (date) => date ? formatDistanceToNow(parseISO(date), { addSuffix: true }) : '—';
export const fCurrency = (amount, currency = 'GHS') =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency }).format(amount ?? 0);
export const fNumber  = (n)  => new Intl.NumberFormat('en-GH').format(n ?? 0);
export const fPercent = (n)  => `${Number(n ?? 0).toFixed(1)}%`;

export const statusBadge = (status) => {
  const map = {
    active:'badge-green', approved:'badge-green', paid:'badge-green',
    completed:'badge-green', hired:'badge-green', settled:'badge-green',
    pending:'badge-yellow', processing:'badge-yellow', scheduled:'badge-yellow',
    enrolled:'badge-yellow', upcoming:'badge-yellow', shortlisted:'badge-teal',
    interviewed:'badge-blue', offered:'badge-violet',
    rejected:'badge-red', terminated:'badge-red', failed:'badge-red',
    defaulted:'badge-red', expired:'badge-red',
    draft:'badge-gray', closed:'badge-gray', cancelled:'badge-gray',
    on_leave:'badge-blue', open:'badge-blue',
    permanent:'badge-blue', contract:'badge-yellow', site_based:'badge-teal',
    low:'badge-green', medium:'badge-yellow', high:'badge-red', critical:'badge-red',
    near_miss:'badge-yellow', first_aid:'badge-blue', fatality:'badge-red',
    lost_time:'badge-red', property_damage:'badge-yellow',
  };
  return map[status] || 'badge-gray';
};

export const statusLabel = (status) =>
  status ? status.replace(/_/g,' ').replace(/\b\w/g,(c)=>c.toUpperCase()) : '—';

export const getInitials = (name) =>
  name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

/**
 * Safely download any blob/arraybuffer/string response from Axios.
 * Works with responseType:'blob' and responseType:'arraybuffer'.
 */
export const downloadBlob = (data, filename, mimeType) => {
  let blob;
  if (data instanceof Blob) {
    blob = mimeType ? new Blob([data], { type: mimeType }) : data;
  } else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    blob = new Blob([data], { type: mimeType || 'application/octet-stream' });
  } else if (typeof data === 'string') {
    blob = new Blob([data], { type: mimeType || 'text/plain;charset=utf-8' });
  } else {
    blob = new Blob([data], { type: mimeType || 'application/octet-stream' });
  }
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

/**
 * Client-side CSV builder — use when API export is unavailable.
 * @param {string[][]} rows  2D array; first row = headers
 * @param {string}     filename
 */
export const exportCsvClient = (rows, filename = 'export.csv') => {
  const csv = rows.map(row =>
    row.map(cell => {
      const v = cell == null ? '' : String(cell);
      return v.includes(',') || v.includes('"') || v.includes('\n')
        ? `"${v.replace(/"/g, '""')}"`
        : v;
    }).join(',')
  ).join('\r\n');

  downloadBlob('\uFEFF' + csv, filename, 'text/csv;charset=utf-8');
};
