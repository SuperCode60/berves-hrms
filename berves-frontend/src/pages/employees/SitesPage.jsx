import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useDebounce } from '../../hooks/useDebounce';
import { Plus, Edit2, Trash2, MapPin, Settings2, Users, ToggleLeft, ToggleRight, Navigation, LocateFixed, AlertCircle } from 'lucide-react';
import { employeesApi } from '../../api/employees';
import { PageHeader }   from '../../components/layout/PageHeader';
import { DataTable }    from '../../components/common/Table';
import { Modal }        from '../../components/common/Modal';
import { Input }        from '../../components/common/Input';
import { Button }       from '../../components/common/Button';
import { Badge }        from '../../components/common/Badge';
import { Avatar }       from '../../components/common/Avatar';
import { useModal }     from '../../hooks/useModal';
import { swDelete, swSuccess, swError } from '../../lib/swal';

export const SitesPage = () => {
  const qc    = useQueryClient();
  const modal = useModal();
  const [manageSite, setManageSite] = useState(null);

  const { data: sites, isLoading } = useQuery({
    queryKey: ['sites-all'],
    queryFn:  () => employeesApi.sites({ all: 1 }).then(r => r.data.data),
  });
  const { data: siteEmployees, isLoading: loadingSiteEmps } = useQuery({
    queryKey: ['site-employees', manageSite?.id],
    queryFn:  () => employeesApi.siteEmployees(manageSite.id).then(r => r.data.data),
    enabled:  !!manageSite,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const [detecting,    setDetecting]    = useState(false);
  const [geoError,     setGeoError]     = useState('');
  const [placeQuery,   setPlaceQuery]   = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [showDrop,     setShowDrop]     = useState(false);
  const dropRef   = useRef(null);
  const dPlace    = useDebounce(placeQuery, 500);
  const watchLat  = watch('latitude');
  const watchLng  = watch('longitude');

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Forward geocode search
  useEffect(() => {
    if (!dPlace || dPlace.length < 2) { setPlaceResults([]); setShowDrop(false); return; }
    setSearching(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(dPlace)}&format=json&limit=6&addressdetails=1`, { headers: { 'Accept-Language': 'en' } })
      .then(r => r.json())
      .then(data => { setPlaceResults(data); setShowDrop(data.length > 0); })
      .catch(() => {})
      .finally(() => setSearching(false));
  }, [dPlace]);

  useEffect(() => {
    setGeoError('');
    setDetecting(false);
    setPlaceQuery('');
    setPlaceResults([]);
    setShowDrop(false);
    if (modal.data) {
      reset({
        name:               modal.data.name ?? '',
        location:           modal.data.location ?? '',
        latitude:           modal.data.latitude ?? '',
        longitude:          modal.data.longitude ?? '',
        geo_fence_radius_m: modal.data.geo_fence_radius_m ?? '',
      });
    } else {
      reset({ name:'', location:'', latitude:'', longitude:'', geo_fence_radius_m:'' });
    }
  }, [modal.data, modal.isOpen, reset]);

  const pickPlace = (place) => {
    setValue('latitude',  parseFloat(parseFloat(place.lat).toFixed(6)));
    setValue('longitude', parseFloat(parseFloat(place.lon).toFixed(6)));
    setValue('location',  place.display_name);
    setPlaceQuery(place.display_name);
    setShowDrop(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { setGeoError('Geolocation is not supported by your browser.'); return; }
    setDetecting(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setValue('latitude',  parseFloat(latitude.toFixed(6)));
        setValue('longitude', parseFloat(longitude.toFixed(6)));
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, { headers: { 'Accept-Language': 'en' } });
          const data = await res.json();
          if (data.display_name) { setValue('location', data.display_name); setPlaceQuery(data.display_name); }
        } catch {}
        setDetecting(false);
      },
      (err) => {
        const msg = { 1: 'Location permission denied — please allow access in your browser.', 2: 'Position unavailable. Try again.', 3: 'Location request timed out.' };
        setGeoError(msg[err.code] ?? 'Could not retrieve location.');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const saveMutation = useMutation({
    mutationFn: (data) => modal.data
      ? employeesApi.updateSite(modal.data.id, data)
      : employeesApi.createSite(data),
    onSuccess: () => {
      swSuccess(modal.data ? 'Site updated.' : 'Site created.');
      qc.invalidateQueries(['sites-all']);
      qc.invalidateQueries(['sites']);
      modal.close();
    },
    onError: (err) => swError(err.response?.data?.message || 'Failed to save site.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => employeesApi.deleteSite(id),
    onSuccess:  () => { swSuccess('Site deactivated.'); qc.invalidateQueries(['sites-all']); qc.invalidateQueries(['sites']); },
    onError:    () => swError('Could not delete site.'),
  });

  const toggleMutation = useMutation({
    mutationFn: (site) => site.is_active
      ? employeesApi.deactivateSite(site.id)
      : employeesApi.activateSite(site.id),
    onSuccess: (_, site) => {
      swSuccess(site.is_active ? 'Site deactivated.' : 'Site activated.');
      qc.invalidateQueries(['sites-all']);
      qc.invalidateQueries(['sites']);
      // Update the manageSite state to reflect new status
      setManageSite(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
    },
    onError: () => swError('Failed to update site status.'),
  });

  const handleDelete = async (site) => {
    const res = await swDelete(site.name);
    if (res.isConfirmed) deleteMutation.mutate(site.id);
  };

  const columns = [
    { key: 'name', label: 'Site Name', render: (v) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--teal-bg)' }}>
          <MapPin size={14} style={{ color: 'var(--teal)' }} />
        </div>
        <span className="font-semibold">{v}</span>
      </div>
    )},
    { key: 'location',           label: 'Location',      render: v => v || '—' },
    { key: 'geo_fence_radius_m', label: 'Geo-fence (m)', render: v => v ? `${v} m` : '—' },
    { key: 'is_active', label: 'Status', render: v => <Badge status={v ? 'active' : 'inactive'} label={v ? 'Active' : 'Inactive'} /> },
    { key: 'actions', label: '', render: (_, r) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setManageSite(r)} className="btn-ghost btn-sm" title="Manage">
          <Settings2 size={13} /> <span className="hidden sm:inline">Manage</span>
        </button>
        <button onClick={() => modal.open(r)} className="btn-ghost btn-sm"><Edit2 size={13} /></button>
        <button onClick={() => handleDelete(r)} className="btn-ghost btn-sm" style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Sites" subtitle="Manage work sites and geo-fence settings"
        actions={<button onClick={() => modal.open(null)} className="btn-primary btn-sm"><Plus size={14} /> Add Site</button>}
      />

      <div className="card">
        <DataTable columns={columns} data={sites} loading={isLoading} emptyMessage="No sites found." />
      </div>

      {/* ── Edit / Create Modal ───────────────────────────────────────── */}
      <Modal isOpen={modal.isOpen} onClose={modal.close} title={modal.data ? 'Edit Site' : 'Add Site'}>
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))}>
          <div className="modal-body space-y-4">
            <Input label="Site Name" required error={errors.name?.message}
              {...register('name', { required: 'Required' })} />
            <Input label="Location / Address" {...register('location')} />

            {/* ── Location search + coordinates ──────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>
                  Coordinates
                </span>
                <button type="button" onClick={detectLocation} disabled={detecting}
                  className="btn-secondary btn-sm flex items-center gap-1.5"
                  style={{ fontSize: '11px', padding: '3px 10px' }}>
                  {detecting
                    ? <span className="animate-spin inline-block w-3 h-3 border border-t-transparent rounded-full" style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
                    : <LocateFixed size={12} />}
                  {detecting ? 'Detecting…' : 'Use GPS'}
                </button>
              </div>

              {/* Place search */}
              <div className="relative" ref={dropRef}>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--ink-faint)' }} />
                  {searching && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin inline-block w-3 h-3 border border-t-transparent rounded-full" style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
                  )}
                  <input
                    type="text"
                    placeholder="Search for a place — e.g. Sunyani, Bono Region"
                    value={placeQuery}
                    onChange={e => { setPlaceQuery(e.target.value); setShowDrop(false); }}
                    onFocus={() => placeResults.length > 0 && setShowDrop(true)}
                    className="input w-full"
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>

                {showDrop && placeResults.length > 0 && (
                  <ul className="absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    {placeResults.map((p, i) => (
                      <li key={i}>
                        <button type="button" onMouseDown={() => pickPlace(p)}
                          className="w-full text-left px-3 py-2.5 text-sm transition-colors"
                          style={{ color: 'var(--ink)' }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseOut={e  => e.currentTarget.style.background = ''}>
                          <span className="font-medium">{p.address?.city || p.address?.town || p.address?.village || p.name}</span>
                          <span className="text-xs ml-1.5" style={{ color: 'var(--ink-soft)' }}>
                            {[p.address?.state, p.address?.country].filter(Boolean).join(', ')}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {geoError && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
                  <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                  {geoError}
                </div>
              )}

              {/* Lat / Lng fields — auto-filled, editable */}
              <div className="form-row">
                <Input label="Latitude"  type="number" step="any" {...register('latitude')} />
                <Input label="Longitude" type="number" step="any" {...register('longitude')} />
              </div>

              {watchLat && watchLng && (
                <a href={`https://www.openstreetmap.org/?mlat=${watchLat}&mlon=${watchLng}#map=16/${watchLat}/${watchLng}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--teal)' }}>
                  <Navigation size={11} /> Verify on map
                </a>
              )}
            </div>

            <Input label="Geo-fence Radius (metres)" type="number" min="50"
              placeholder="e.g. 100"
              {...register('geo_fence_radius_m', { min: { value: 50, message: 'Min 50 m' } })}
              error={errors.geo_fence_radius_m?.message} />
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={modal.close}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {modal.data ? 'Update Site' : 'Create Site'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Manage Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={!!manageSite} onClose={() => setManageSite(null)}
        title={`Manage — ${manageSite?.name || ''}`} size="lg">
        <div className="modal-body space-y-4">
          {/* Info + status toggle */}
          <div className="p-4 rounded-lg space-y-3" style={{ background: 'var(--surface-2)' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--ink-faint)' }}>Location</p>
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{manageSite?.location || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--ink-faint)' }}>Geo-fence</p>
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  {manageSite?.geo_fence_radius_m ? `${manageSite.geo_fence_radius_m} m` : '—'}
                </p>
              </div>
              {(manageSite?.latitude || manageSite?.longitude) && (
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--ink-faint)' }}>Coordinates</p>
                  <p className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--ink)' }}>
                    <Navigation size={12} />
                    {manageSite?.latitude}, {manageSite?.longitude}
                  </p>
                </div>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-lo)' }}>
              <div className="flex items-center gap-2">
                {manageSite?.is_active
                  ? <ToggleRight size={20} style={{ color: 'var(--teal)' }} />
                  : <ToggleLeft  size={20} style={{ color: 'var(--ink-faint)' }} />}
                <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  Site is <strong>{manageSite?.is_active ? 'Active' : 'Inactive'}</strong>
                </span>
              </div>
              <Button
                variant={manageSite?.is_active ? 'danger' : 'secondary'}
                loading={toggleMutation.isPending}
                onClick={() => toggleMutation.mutate(manageSite)}>
                {manageSite?.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>

          {/* Employee list */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} style={{ color: 'var(--ink-soft)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                Employees at this site
                {siteEmployees && <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--ink-soft)' }}>({siteEmployees.length})</span>}
              </p>
            </div>

            {loadingSiteEmps ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent"
                  style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
              </div>
            ) : !(siteEmployees?.length) ? (
              <div className="py-8 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>
                No employees assigned to this site
              </div>
            ) : (
              <div className="divide-y rounded-lg overflow-hidden" style={{ borderColor: 'var(--border-lo)', border: '1px solid var(--border-lo)' }}>
                {siteEmployees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${emp.first_name} ${emp.last_name}`} photo={emp.profile_photo} size="sm" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{emp.first_name} {emp.last_name}</p>
                        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{emp.department?.name || '—'} · {emp.job_title?.title || '—'}</p>
                      </div>
                    </div>
                    <Badge status={emp.employment_status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setManageSite(null)}>Close</Button>
          <Button onClick={() => { modal.open(manageSite); setManageSite(null); }}>
            <Edit2 size={13} /> Edit Site
          </Button>
        </div>
      </Modal>
    </div>
  );
};
