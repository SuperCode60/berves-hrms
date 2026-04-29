import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, MapPin, Loader2, WifiOff } from 'lucide-react';
import { attendanceApi } from '../../api/attendance';
import { PageHeader }    from '../../components/layout/PageHeader';
import { DataTable }     from '../../components/common/Table';
import { Badge }         from '../../components/common/Badge';
import { SearchInput }   from '../../components/common/SearchInput';
import { Pagination }    from '../../components/common/Pagination';
import { useAuth }       from '../../hooks/useAuth';
import { fDateTime }     from '../../utils';
import { usePagination } from '../../hooks/usePagination';
import { useNavigate }   from 'react-router-dom';
import { swSuccess, swError, swConfirm } from '../../lib/swal';

// Resolves with coords or rejects with a user-readable message
const getCoords = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject('Geolocation is not supported by your browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
    (err) => {
      const msg = {
        1: 'Location permission denied. Please allow location access in your browser settings.',
        2: 'Your position could not be determined. Check that GPS / Location Services are enabled.',
        3: 'Location request timed out. Move to an open area and try again.',
      };
      reject(msg[err.code] ?? 'Could not get location.');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
});

export const AttendancePage = () => {
  const { isAdmin, isHR, isManager } = useAuth();
  const navigate = useNavigate();
  const { page, setPage } = usePagination();
  const [search,     setSearch]     = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [gpsStatus,  setGpsStatus]  = useState('idle'); // idle | acquiring | ok | failed
  const qc = useQueryClient();
  const isManager_ = isAdmin || isHR || isManager;

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', page, search, dateFilter],
    queryFn:  () => (isManager_
      ? attendanceApi.records({ page, search, date: dateFilter })
      : attendanceApi.myAttendance({ page, date: dateFilter })
    ).then(r => r.data),
    keepPreviousData: true,
  });

  const checkInMutation = useMutation({
    mutationFn: (payload) => attendanceApi.checkIn(payload),
    onSuccess:  () => { swSuccess('Checked in successfully!'); qc.invalidateQueries(['attendance']); },
    onError:    (err) => swError(err.response?.data?.message || 'Check-in failed. Please try again.'),
  });

  const checkOutMutation = useMutation({
    mutationFn: (payload) => attendanceApi.checkOut(payload),
    onSuccess:  () => { swSuccess('Checked out successfully!'); qc.invalidateQueries(['attendance']); },
    onError:    (err) => swError(err.response?.data?.message || 'Check-out failed. Please try again.'),
  });

  const doAction = async (action /* 'in' | 'out' */) => {
    setGpsStatus('acquiring');
    let coords = null;
    let gpsErrorMsg = '';

    try {
      coords = await getCoords();
      setGpsStatus('ok');
    } catch (msg) {
      gpsErrorMsg = msg;
      setGpsStatus('failed');
    }

    const isIn   = action === 'in';
    const title  = isIn ? 'Check in now?' : 'Check out now?';
    const text   = coords
      ? `GPS location acquired. ${isIn ? 'Your location will be recorded.' : ''}`
      : `GPS unavailable: ${gpsErrorMsg}\n\nYou can still ${isIn ? 'check in' : 'check out'} without location verification.`;

    const res = await swConfirm({
      title,
      text,
      confirmText: isIn ? 'Check In' : 'Check Out',
      danger: false,
    });

    setGpsStatus('idle');

    if (!res.isConfirmed) return;

    const payload = coords ?? {};
    if (isIn) checkInMutation.mutate(payload);
    else      checkOutMutation.mutate(payload);
  };

  const acquiring = gpsStatus === 'acquiring';
  const busy      = acquiring || checkInMutation.isPending || checkOutMutation.isPending;

  const columns = [
    ...(isManager_ ? [{ key: 'employee', label: 'Employee', render: (_, row) => (
      <span className="font-medium" style={{ color: 'var(--ink)' }}>{row.employee?.first_name} {row.employee?.last_name}</span>
    )}] : []),
    { key: 'check_in_at',  label: 'Check In',  render: v => fDateTime(v) },
    { key: 'check_out_at', label: 'Check Out',  render: v => v ? fDateTime(v) : <span style={{ color: 'var(--ink-faint)' }}>—</span> },
    { key: 'total_hours',  label: 'Hours',      render: v => v ? v + 'h' : '—' },
    { key: 'late_minutes', label: 'Late',       render: v => v > 0 ? <span style={{ color: 'var(--amber)' }}>{v}m late</span> : '—' },
    { key: 'is_within_geofence', label: 'GPS',  render: v => v
      ? <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--emerald)' }}><MapPin size={12} /> Valid</span>
      : <span style={{ color: 'var(--ink-faint)' }}>—</span>
    },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
    { key: 'site',   label: 'Site',   render: (_, row) => row.site?.name || '—' },
  ];

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Check-in / check-out records"
        actions={<>
          {isManager_ && <button onClick={() => navigate('/attendance/shifts')} className="btn-secondary btn-sm">Shift Schedules</button>}

          {/* GPS status pill */}
          {gpsStatus === 'acquiring' && (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'var(--teal-bg)', color: 'var(--teal)' }}>
              <Loader2 size={11} className="animate-spin" /> Acquiring GPS…
            </span>
          )}
          {gpsStatus === 'ok' && (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'var(--emerald-bg, #d1fae5)', color: 'var(--emerald)' }}>
              <MapPin size={11} /> GPS ready
            </span>
          )}
          {gpsStatus === 'failed' && (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
              <WifiOff size={11} /> No GPS
            </span>
          )}

          <button onClick={() => doAction('out')} className="btn-secondary btn-sm" disabled={busy}>
            {checkOutMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : null}
            Check Out
          </button>
          <button onClick={() => doAction('in')} className="btn-primary btn-sm" disabled={busy}>
            {acquiring || checkInMutation.isPending
              ? <Loader2 size={13} className="animate-spin" />
              : <Clock size={14} />}
            Check In
          </button>
        </>}
      />
      <div className="card">
        <div className="card-header gap-3 flex-wrap">
          {isManager_ && <SearchInput value={search} onChange={setSearch} placeholder="Search employees…" />}
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input w-40" />
        </div>
        <DataTable columns={columns} data={data?.data} loading={isLoading} emptyMessage="No attendance records." />
        <Pagination meta={data?.meta} onPageChange={setPage} />
      </div>
    </div>
  );
};
