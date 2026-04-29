export const DataTable = ({ columns, data, loading, emptyMessage='No records found.' }) => {
  if (loading) return (
    <div className="flex items-center justify-center h-48" style={{color:'var(--ink-faint)'}}>
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{borderColor:'var(--teal) transparent var(--teal) var(--teal)'}} />
    </div>
  );
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>{columns.map((col) => (
            <th key={col.key} style={col.width ? { width: col.width } : {}}>{col.label}</th>
          ))}</tr>
        </thead>
        <tbody>
          {!data?.length ? (
            <tr><td colSpan={columns.length} className="text-center py-14" style={{color:'var(--ink-faint)'}}>{emptyMessage}</td></tr>
          ) : data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
