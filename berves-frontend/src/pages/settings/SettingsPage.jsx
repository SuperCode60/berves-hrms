import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Globe, DollarSign, Clock, Calendar, Shield, Bell, Mail,
  Database, Activity, Download, Upload, Trash2, RefreshCw,
  CheckCircle, AlertTriangle, Plus, Save, Edit2, Key,
  ChevronRight, Server, HardDrive, Zap, Lock,
} from 'lucide-react';
import { settingsApi }  from '../../api/settings';
import { PageHeader }   from '../../components/layout/PageHeader';
import { Modal }        from '../../components/common/Modal';
import { Button }       from '../../components/common/Button';
import { useModal }     from '../../hooks/useModal';
import { useForm }      from 'react-hook-form';
import { downloadBlob } from '../../utils';
import { swSuccess, swError, swConfirm, swLoading, swClose } from '../../lib/swal';

/* ── Local UI components ───────────────────────────────────────────────── */

const HealthDot = ({ status }) => {
  const colors = { ok: '#10b981', warn: '#f59e0b', error: '#ef4444' };
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: colors[status] || colors.error }}
    />
  );
};

const SectionHeader = ({ icon: Icon, title, desc, action }) => (
  <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
    <div className="flex items-start gap-3 min-w-0">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--teal-bg)' }}
      >
        <Icon size={18} style={{ color: 'var(--teal)' }} />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>{title}</h2>
        {desc && <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>{desc}</p>}
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

const FormSection = ({ title, children }) => (
  <div className="rounded-xl border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--canvas)' }}>
    {title && (
      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--ink-faint)' }}>
        {title}
      </p>
    )}
    {children}
  </div>
);

const Toggle = ({ checked, onChange, loading }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => !loading && onChange(!checked)}
    disabled={loading}
    className="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors focus:outline-none"
    style={{
      background: checked ? 'var(--teal)' : 'var(--border)',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
    }}
  >
    <span
      className="inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform"
      style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
    />
  </button>
);

const EmptyCard = ({ icon: Icon, message }) => (
  <div
    className="text-center py-12 rounded-xl border border-dashed"
    style={{ borderColor: 'var(--border)', color: 'var(--ink-faint)' }}
  >
    <Icon size={36} strokeWidth={1.2} className="mx-auto mb-3" />
    <p className="text-sm">{message}</p>
  </div>
);

const PolicyRow = ({ leftSlot, children }) => (
  <div
    className="flex items-center gap-3 flex-wrap px-4 sm:px-5 py-4 rounded-xl border"
    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
  >
    <div className="flex-1 min-w-0">{leftSlot}</div>
    <div className="flex items-center gap-2 flex-shrink-0 ml-auto">{children}</div>
  </div>
);

const IconActionBtn = ({ onClick, color, hoverBg, hoverColor, children, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="p-1.5 rounded-lg transition-colors"
    style={{ color }}
    onMouseEnter={e => {
      e.currentTarget.style.background = hoverBg;
      if (hoverColor) e.currentTarget.style.color = hoverColor;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = '';
      e.currentTarget.style.color = color;
    }}
  >
    {children}
  </button>
);

/* ══════════════════════════════════════════════════════════════════════════ */
export const SettingsPage = () => {
  const [tab, setTab]               = useState('company');
  const qc                          = useQueryClient();
  const restoreRef                  = useRef(null);
  const overtimeModal               = useModal();
  const leavePolicyModal            = useModal();
  const [editOtPolicy, setEditOtPolicy] = useState(null);
  const [editLpPolicy, setEditLpPolicy] = useState(null);

  const { register: regOt,  handleSubmit: hsOt, reset: resetOt } = useForm();
  const { register: regLp,  handleSubmit: hsLp, reset: resetLp } = useForm();

  /* ── Queries ──────────────────────────────────────────────────────────── */
  const { data: settings } = useQuery({
    queryKey: ['settings-all'],
    queryFn: () => settingsApi.all().then(r => r.data?.data || {}),
  });
  const { data: payrollCycle } = useQuery({
    queryKey: ['payroll-cycle'],
    queryFn: () => settingsApi.payrollCycle().then(r => r.data?.data),
  });
  const { data: taxConfig } = useQuery({
    queryKey: ['tax-config'],
    queryFn: () => settingsApi.taxConfigurations().then(r => r.data?.data || []),
  });
  const { data: overtimePolicies } = useQuery({
    queryKey: ['overtime-policies'],
    queryFn: () => settingsApi.overtimePolicies().then(r => r.data?.data || []),
  });
  const { data: leavePolicies } = useQuery({
    queryKey: ['leave-policies'],
    queryFn: () => settingsApi.leavePolicies().then(r => r.data?.data || []),
  });
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => settingsApi.roles().then(r => r.data?.data || []),
    enabled: tab === 'roles',
  });
  const { data: backups, isLoading: backLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: () => settingsApi.backups().then(r => r.data?.data || []),
    enabled: tab === 'backup',
  });
  const { data: healthData, refetch: refetchHealth, isFetching: healthFetching } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => settingsApi.systemHealth().then(r => r.data?.data),
    enabled: tab === 'system',
  });

  /* ── Mutations ────────────────────────────────────────────────────────── */
  const saveSetting = useMutation({
    mutationFn: ({ key, value }) => settingsApi.update(key, value),
    onSuccess: () => qc.invalidateQueries(['settings-all']),
    onError: () => swError('Failed to save setting.'),
  });

  const saveCycle = useMutation({
    mutationFn: settingsApi.updatePayrollCycle,
    onSuccess: () => { swSuccess('Payroll cycle saved!'); qc.invalidateQueries(['payroll-cycle']); },
    onError: () => swError('Failed to save payroll cycle.'),
  });

  const saveOt = useMutation({
    mutationFn: d => editOtPolicy?.id
      ? settingsApi.updateOvertimePolicy(editOtPolicy.id, d)
      : settingsApi.createOvertimePolicy(d),
    onSuccess: () => {
      swSuccess('Overtime policy saved!');
      qc.invalidateQueries(['overtime-policies']);
      overtimeModal.close();
      setEditOtPolicy(null);
      resetOt();
    },
    onError: () => swError('Failed to save overtime policy.'),
  });

  const toggleOtActive = useMutation({
    mutationFn: ({ id, active }) => active
      ? settingsApi.deactivateOtPolicy(id)
      : settingsApi.activateOtPolicy(id),
    onSuccess: () => qc.invalidateQueries(['overtime-policies']),
    onError: () => swError('Failed to update policy status.'),
  });

  const deleteOt = useMutation({
    mutationFn: settingsApi.deleteOvertimePolicy,
    onSuccess: () => { swSuccess('Policy deleted.'); qc.invalidateQueries(['overtime-policies']); },
    onError: () => swError('Failed to delete policy.'),
  });

  const saveLp = useMutation({
    mutationFn: d => editLpPolicy?.id
      ? settingsApi.updateLeavePolicy(editLpPolicy.id, d)
      : settingsApi.createLeavePolicy(d),
    onSuccess: () => {
      swSuccess('Leave policy saved!');
      qc.invalidateQueries(['leave-policies']);
      leavePolicyModal.close();
      setEditLpPolicy(null);
      resetLp();
    },
    onError: () => swError('Failed to save leave policy.'),
  });

  const deleteLp = useMutation({
    mutationFn: settingsApi.deleteLeavePolicy,
    onSuccess: () => { swSuccess('Policy deleted.'); qc.invalidateQueries(['leave-policies']); },
    onError: () => swError('Failed to delete policy.'),
  });

  const saveEmail = useMutation({
    mutationFn: async (data) => {
      const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== '');
      await Promise.all(entries.map(([key, value]) => settingsApi.update(key, value)));
    },
    onSuccess: () => { swSuccess('Email settings saved!'); qc.invalidateQueries(['settings-all']); },
    onError: () => swError('Failed to save email settings.'),
  });

  const createBackup = useMutation({
    mutationFn: () => settingsApi.createBackup('manual'),
    onSuccess: r => { swSuccess(`Backup created: ${r.data?.data?.size_human}`); qc.invalidateQueries(['backups']); },
    onError: e => swError(e.response?.data?.message || 'Backup failed.'),
  });

  const deleteBackup = useMutation({
    mutationFn: settingsApi.deleteBackup,
    onSuccess: () => { swSuccess('Backup deleted.'); qc.invalidateQueries(['backups']); },
  });

  const clearCache = useMutation({
    mutationFn: settingsApi.clearCache,
    onSuccess: () => swSuccess('Cache cleared!'),
    onError: () => swError('Cache clear failed.'),
  });

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    try {
      await Promise.all(
        Object.entries(data)
          .filter(([, v]) => v !== '')
          .map(([key, value]) => settingsApi.update(key, value))
      );
      swSuccess('Company info saved!');
      qc.invalidateQueries(['settings-all']);
    } catch {
      swError('Failed to save company info.');
    }
  };

  const handleSaveCycle = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    saveCycle.mutate(Object.fromEntries(fd.entries()));
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    saveEmail.mutate(Object.fromEntries(fd.entries()));
  };

  const handleDownload = async (filename) => {
    swLoading('Downloading…');
    try {
      const r = await settingsApi.downloadBackup(filename);
      swClose();
      downloadBlob(r.data, filename);
    } catch {
      swClose();
      swError('Download failed.');
    }
  };

  const handleDeleteBackup = async (filename) => {
    const r = await swConfirm({ title: `Delete ${filename}?`, danger: true, confirmText: 'Delete' });
    if (r.isConfirmed) deleteBackup.mutate(filename);
  };

  const handleRestoreUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = await swConfirm({
      title: '⚠️ Restore System?',
      text: `This will overwrite ALL data with "${file.name}". A safety backup is auto-created first.`,
      confirmText: 'Yes, Restore',
      danger: true,
    });
    if (!r.isConfirmed) { e.target.value = ''; return; }
    swLoading('Restoring… please wait.');
    try {
      const fd = new FormData();
      fd.append('backup', file);
      await settingsApi.restoreBackup(fd);
      swClose();
      swSuccess('Restored! Please log in again.');
      setTimeout(() => window.location.href = '/login', 2500);
    } catch (err) {
      swClose();
      swError(err.response?.data?.message || 'Restore failed.');
    }
    e.target.value = '';
  };

  const openOtModal = (policy = null) => {
    setEditOtPolicy(policy);
    resetOt(policy
      ? { day_type: policy.day_type, multiplier: policy.multiplier, min_hours: policy.min_hours, max_hours: policy.max_hours }
      : { day_type: 'weekday', multiplier: 1.5, min_hours: 1, max_hours: 12 }
    );
    overtimeModal.open();
  };

  const openLpModal = (policy = null) => {
    setEditLpPolicy(policy);
    resetLp(policy
      ? { name: policy.name, description: policy.description || '', max_days: policy.max_days }
      : { name: '', description: '', max_days: 21 }
    );
    leavePolicyModal.open();
  };

  const notifVal = (key, def) => {
    if (!settings || settings[key] === undefined) return def;
    return settings[key] !== 'false';
  };

  const TABS = [
    { key: 'company',  label: 'Company',         icon: Globe },
    { key: 'payroll',  label: 'Payroll & Tax',   icon: DollarSign },
    { key: 'overtime', label: 'Overtime',         icon: Clock },
    { key: 'leave',    label: 'Leave Policy',     icon: Calendar },
    { key: 'roles',    label: 'Roles & Access',   icon: Shield },
    { key: 'notify',   label: 'Notifications',    icon: Bell },
    { key: 'backup',   label: 'Backup & Restore', icon: Database },
    { key: 'system',   label: 'System Health',    icon: Activity },
  ];

  const field = 'block w-full px-3.5 py-2.5 text-sm rounded-lg border transition-all duration-150 focus:outline-none';
  const fieldStyle = {
    background: 'var(--surface)',
    color: 'var(--ink)',
    borderColor: 'var(--border)',
    fontFamily: 'var(--ff-body)',
  };

  return (
    <div>
      <PageHeader title="System Settings" subtitle="Configure and manage your HRMS platform" />

      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">

        {/* ── Tab nav — horizontal scroll on mobile, vertical sidebar on lg+ ── */}
        <aside className="w-full lg:w-52 lg:flex-shrink-0 lg:sticky lg:top-20">
          <div className="card p-2 flex flex-row lg:flex-col overflow-x-auto gap-0.5">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className="flex-shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap"
                  style={active
                    ? { background: 'var(--teal-bg)', color: 'var(--teal)' }
                    : { color: 'var(--ink-soft)' }
                  }
                >
                  <Icon size={15} className="flex-shrink-0" />
                  <span className="lg:flex-1 lg:truncate">{label}</span>
                  {active && <ChevronRight size={12} className="hidden lg:block flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ════════════════════════════════════════════════════════
              COMPANY
          ════════════════════════════════════════════════════════ */}
          {tab === 'company' && settings && (
            <div className="card p-4 sm:p-6">
              <SectionHeader
                icon={Globe}
                title="Company Profile"
                desc="Displayed on payslips, reports and outgoing system emails"
              />
              <form onSubmit={handleSaveCompany} className="space-y-5">
                <FormSection title="Basic information">
                  <div className="space-y-4">
                    <div>
                      <label className="label">Company Name</label>
                      <input
                        name="company_name"
                        className={field}
                        style={fieldStyle}
                        defaultValue={settings?.company_name || 'Berves Engineering Limited'}
                        placeholder="e.g. Berves Engineering Limited"
                      />
                    </div>
                    <div>
                      <label className="label">Office Address</label>
                      <input
                        name="company_address"
                        className={field}
                        style={fieldStyle}
                        defaultValue={settings?.company_address || ''}
                        placeholder="Street, city, country"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Phone Number</label>
                        <input
                          name="company_phone"
                          className={field}
                          style={fieldStyle}
                          defaultValue={settings?.company_phone || ''}
                          placeholder="+233 XX XXX XXXX"
                        />
                      </div>
                      <div>
                        <label className="label">Email</label>
                        <input
                          name="company_email"
                          type="email"
                          className={field}
                          style={fieldStyle}
                          defaultValue={settings?.company_email || ''}
                          placeholder="info@company.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Website</label>
                      <input
                        name="company_website"
                        className={field}
                        style={fieldStyle}
                        defaultValue={settings?.company_website || ''}
                        placeholder="https://www.company.com"
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Currency">
                  <div className="max-w-xs">
                    <label className="label">Default Currency</label>
                    <select
                      name="payroll_currency"
                      className={field}
                      style={fieldStyle}
                      defaultValue={settings?.payroll_currency || 'GHS'}
                    >
                      <option value="GHS">GHS — Ghana Cedi</option>
                      <option value="USD">USD — US Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — British Pound</option>
                    </select>
                  </div>
                </FormSection>

                <div className="flex justify-end pt-1">
                  <Button type="submit" variant="primary" size="sm">
                    <Save size={14} /> Save Company Info
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              PAYROLL & TAX
          ════════════════════════════════════════════════════════ */}
          {tab === 'payroll' && (
            <div className="space-y-5">
              <div className="card p-4 sm:p-6">
                <SectionHeader
                  icon={DollarSign}
                  title="Payroll Cycle"
                  desc="Configure when payroll is processed and employees are paid each month"
                />
                {payrollCycle ? (
                  <form onSubmit={handleSaveCycle} className="space-y-5">
                    <FormSection title="Schedule">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Processing Day (1–31)</label>
                          <input
                            name="processing_day"
                            type="number" min="1" max="31"
                            className={field}
                            style={fieldStyle}
                            defaultValue={payrollCycle?.processing_day || 25}
                          />
                          <p className="text-xs mt-1.5" style={{ color: 'var(--ink-faint)' }}>
                            Day payroll calculation runs
                          </p>
                        </div>
                        <div>
                          <label className="label">Payment Day (1–31)</label>
                          <input
                            name="payment_day"
                            type="number" min="1" max="31"
                            className={field}
                            style={fieldStyle}
                            defaultValue={payrollCycle?.payment_day || 28}
                          />
                          <p className="text-xs mt-1.5" style={{ color: 'var(--ink-faint)' }}>
                            Day salaries hit bank accounts
                          </p>
                        </div>
                      </div>
                    </FormSection>
                    <FormSection title="Currency">
                      <div className="max-w-xs">
                        <label className="label">Payroll Currency</label>
                        <select
                          name="currency"
                          className={field}
                          style={fieldStyle}
                          defaultValue={payrollCycle?.currency || 'GHS'}
                        >
                          <option value="GHS">GHS — Ghana Cedi</option>
                          <option value="USD">USD — US Dollar</option>
                          <option value="EUR">EUR — Euro</option>
                          <option value="GBP">GBP — British Pound</option>
                        </select>
                      </div>
                    </FormSection>
                    <div className="flex justify-end">
                      <Button type="submit" variant="primary" size="sm" loading={saveCycle.isPending}>
                        <Save size={14} /> Save Payroll Cycle
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent"
                      style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
                  </div>
                )}
              </div>

              <div className="card p-4 sm:p-6">
                <SectionHeader
                  icon={Key}
                  title="Tax Configuration (PAYE)"
                  desc="Income tax brackets applied automatically during payroll processing"
                />
                {!taxConfig || taxConfig.length === 0 ? (
                  <EmptyCard icon={Key} message="No tax brackets configured." />
                ) : (
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Min (GHS)</th>
                          <th>Max (GHS)</th>
                          <th>Rate</th>
                          <th>Description</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxConfig.map(t => (
                          <tr key={t.id}>
                            <td className="font-mono text-sm">{Number(t.min_amount).toLocaleString()}</td>
                            <td className="font-mono text-sm">{t.max_amount ? Number(t.max_amount).toLocaleString() : '∞'}</td>
                            <td>
                              <span className="font-mono font-bold text-sm" style={{ color: 'var(--teal)' }}>
                                {t.rate}%
                              </span>
                            </td>
                            <td className="text-sm" style={{ color: 'var(--ink-soft)' }}>{t.description || '—'}</td>
                            <td>
                              <span className={`badge ${t.is_active ? 'badge-green' : 'badge-gray'}`}>
                                {t.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              OVERTIME
          ════════════════════════════════════════════════════════ */}
          {tab === 'overtime' && (
            <div className="card p-4 sm:p-6">
              <SectionHeader
                icon={Clock}
                title="Overtime Policies"
                desc="Rate multipliers applied for different overtime day types during payroll"
                action={
                  <Button size="sm" variant="primary" onClick={() => openOtModal()}>
                    <Plus size={14} /> Add Policy
                  </Button>
                }
              />
              {!overtimePolicies || overtimePolicies.length === 0 ? (
                <EmptyCard icon={Clock} message="No overtime policies yet. Click 'Add Policy' to define rate multipliers." />
              ) : (
                <div className="space-y-2">
                  {overtimePolicies.map(p => (
                    <PolicyRow
                      key={p.id}
                      leftSlot={
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--teal-bg)' }}
                          >
                            <Clock size={16} style={{ color: 'var(--teal)' }} />
                          </div>
                          <div>
                            <p className="font-semibold capitalize text-sm" style={{ color: 'var(--ink)' }}>
                              {p.day_type?.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                              <strong>{p.multiplier}×</strong> rate · {p.min_hours || 1}h – {p.max_hours || 12}h
                            </p>
                          </div>
                        </div>
                      }
                    >
                      <Toggle
                        checked={!!p.is_active}
                        onChange={() => toggleOtActive.mutate({ id: p.id, active: !!p.is_active })}
                        loading={toggleOtActive.isPending}
                      />
                      <IconActionBtn
                        onClick={() => openOtModal(p)}
                        title="Edit"
                        color="var(--teal)"
                        hoverBg="var(--teal-bg)"
                      >
                        <Edit2 size={14} />
                      </IconActionBtn>
                      <IconActionBtn
                        onClick={async () => {
                          const r = await swConfirm({ title: `Delete "${p.day_type}"?`, danger: true, confirmText: 'Delete' });
                          if (r.isConfirmed) deleteOt.mutate(p.id);
                        }}
                        title="Delete"
                        color="var(--ink-faint)"
                        hoverBg="var(--red-bg)"
                        hoverColor="var(--red)"
                      >
                        <Trash2 size={14} />
                      </IconActionBtn>
                    </PolicyRow>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              LEAVE POLICY
          ════════════════════════════════════════════════════════ */}
          {tab === 'leave' && (
            <div className="card p-4 sm:p-6">
              <SectionHeader
                icon={Calendar}
                title="Leave Policies"
                desc="Annual leave entitlements and day allocations per leave type"
                action={
                  <Button size="sm" variant="primary" onClick={() => openLpModal()}>
                    <Plus size={14} /> Add Policy
                  </Button>
                }
              />
              {!leavePolicies || leavePolicies.length === 0 ? (
                <EmptyCard icon={Calendar} message="No leave policies defined yet." />
              ) : (
                <div className="space-y-2">
                  {leavePolicies.map(p => (
                    <PolicyRow
                      key={p.id}
                      leftSlot={
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--blue-bg)' }}
                          >
                            <Calendar size={16} style={{ color: 'var(--blue)' }} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{p.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                              {p.max_days ? `${p.max_days} days/year` : 'No day limit'}
                              {p.description ? ` · ${p.description}` : ''}
                            </p>
                          </div>
                        </div>
                      }
                    >
                      <span className={`badge ${p.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <IconActionBtn
                        onClick={() => openLpModal(p)}
                        title="Edit"
                        color="var(--teal)"
                        hoverBg="var(--teal-bg)"
                      >
                        <Edit2 size={14} />
                      </IconActionBtn>
                      <IconActionBtn
                        onClick={async () => {
                          const r = await swConfirm({ title: `Delete "${p.name}"?`, danger: true, confirmText: 'Delete' });
                          if (r.isConfirmed) deleteLp.mutate(p.id);
                        }}
                        title="Delete"
                        color="var(--ink-faint)"
                        hoverBg="var(--red-bg)"
                        hoverColor="var(--red)"
                      >
                        <Trash2 size={14} />
                      </IconActionBtn>
                    </PolicyRow>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              ROLES & ACCESS
          ════════════════════════════════════════════════════════ */}
          {tab === 'roles' && (
            <div className="card p-4 sm:p-6">
              <SectionHeader
                icon={Shield}
                title="Roles & Access Control"
                desc="System roles and their assigned permissions. Contact IT to modify permission sets."
              />
              {!roles || roles.length === 0 ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent"
                    style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
                </div>
              ) : (
                <div className="space-y-3">
                  {roles.map(role => (
                    <div key={role.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--canvas)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'var(--teal-bg)' }}>
                          <Lock size={14} style={{ color: 'var(--teal)' }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm capitalize" style={{ color: 'var(--ink)' }}>
                            {role.name.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
                            {role.permissions?.length || 0} permissions
                          </p>
                        </div>
                      </div>
                      {role.permissions?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 12).map(p => (
                            <span key={p.id}
                              className="text-xs px-1.5 py-0.5 rounded font-mono"
                              style={{ background: 'var(--surface)', color: 'var(--ink-soft)', border: '1px solid var(--border-lo)' }}>
                              {p.name}
                            </span>
                          ))}
                          {role.permissions.length > 12 && (
                            <span className="text-xs px-1.5 py-0.5" style={{ color: 'var(--ink-faint)' }}>
                              +{role.permissions.length - 12} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              NOTIFICATIONS
          ════════════════════════════════════════════════════════ */}
          {tab === 'notify' && (
            <div className="space-y-5">
              <div className="card p-4 sm:p-6">
                <SectionHeader
                  icon={Bell}
                  title="Notification Triggers"
                  desc="Control which system events create in-app notifications for users"
                />
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  {[
                    ['Leave submitted',         'notify_leave_submitted',   true,  'Notify HR when an employee submits a leave request'],
                    ['Leave approved/rejected',  'notify_leave_reviewed',   true,  'Notify employees when their leave is actioned'],
                    ['Payslip ready',            'notify_payslip_ready',    true,  'Notify employees when their payslip is generated'],
                    ['Overtime approved',        'notify_overtime_approved', true,  'Notify employees when overtime is approved'],
                    ['Loan decision',            'notify_loan_reviewed',    true,  'Notify employees of loan approval or rejection'],
                    ['Certification expiring',   'notify_cert_expiry',      true,  'Alert employees when a certification is about to expire'],
                    ['Incident reported',        'notify_incident',         false, 'Notify HR when a safety incident is logged'],
                    ['New employee onboarding',  'notify_onboarding',       false, 'Notify HR when a new hire completes onboarding'],
                  ].map(([label, key, def, hint], idx, arr) => (
                    <div
                      key={key}
                      className="flex items-center gap-4 justify-between px-4 sm:px-5 py-4"
                      style={{
                        background: idx % 2 === 0 ? 'var(--surface)' : 'var(--canvas)',
                        borderBottom: idx < arr.length - 1 ? '1px solid var(--border-lo)' : 'none',
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--ink-faint)' }}>{hint}</p>
                      </div>
                      <Toggle
                        checked={notifVal(key, def)}
                        onChange={v => saveSetting.mutate({ key, value: v ? 'true' : 'false' })}
                        loading={saveSetting.isPending}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4 sm:p-6">
                <SectionHeader
                  icon={Mail}
                  title="Email / SMTP Configuration"
                  desc="Server settings for outgoing notification and system emails"
                />
                {settings ? (
                  <form onSubmit={handleSaveEmail} className="space-y-5">
                    <FormSection title="Server">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">SMTP Host</label>
                          <input
                            name="mail_host"
                            className={field}
                            style={fieldStyle}
                            defaultValue={settings?.mail_host || ''}
                            placeholder="smtp.gmail.com"
                          />
                        </div>
                        <div>
                          <label className="label">SMTP Port</label>
                          <input
                            name="mail_port"
                            className={field}
                            style={fieldStyle}
                            defaultValue={settings?.mail_port || '587'}
                            placeholder="587"
                          />
                        </div>
                      </div>
                    </FormSection>

                    <FormSection title="Sender identity">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">From Name</label>
                          <input
                            name="mail_from_name"
                            className={field}
                            style={fieldStyle}
                            defaultValue={settings?.mail_from_name || 'Berves HRMS'}
                            placeholder="Berves HRMS"
                          />
                        </div>
                        <div>
                          <label className="label">From Email</label>
                          <input
                            name="mail_from_address"
                            type="email"
                            className={field}
                            style={fieldStyle}
                            defaultValue={settings?.mail_from_address || ''}
                            placeholder="noreply@company.com"
                          />
                        </div>
                      </div>
                    </FormSection>

                    <FormSection title="Authentication">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Username</label>
                          <input
                            name="mail_username"
                            className={field}
                            style={fieldStyle}
                            defaultValue={settings?.mail_username || ''}
                            placeholder="SMTP username"
                          />
                        </div>
                        <div>
                          <label className="label">Password</label>
                          <input
                            name="mail_password"
                            type="password"
                            className={field}
                            style={fieldStyle}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </FormSection>

                    <div className="flex justify-end">
                      <Button type="submit" variant="primary" size="sm" loading={saveEmail.isPending}>
                        <Save size={14} /> Save Email Config
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent"
                      style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              BACKUP & RESTORE
          ════════════════════════════════════════════════════════ */}
          {tab === 'backup' && (
            <div className="space-y-5">
              <div className="card p-4 sm:p-6">
                <SectionHeader
                  icon={Database}
                  title="Backup & Restore"
                  desc="Create, download, and restore full system database backups"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div
                    className="rounded-xl p-5 border flex flex-col gap-3"
                    style={{ borderColor: 'var(--border)', background: 'var(--canvas)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--teal-bg)' }}>
                        <Download size={18} style={{ color: 'var(--teal)' }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Create Backup</p>
                        <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>SQL dump + settings ZIP</p>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                      Export a full backup archive safe for off-site storage. Old backups are auto-pruned (keeps last 10).
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={createBackup.isPending}
                      onClick={() => createBackup.mutate()}
                    >
                      <Database size={14} /> Create Backup Now
                    </Button>
                  </div>

                  <div
                    className="rounded-xl p-5 border-2 border-dashed flex flex-col gap-3"
                    style={{ borderColor: 'var(--red)', background: 'var(--red-bg)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(220,38,38,0.15)' }}>
                        <Upload size={18} style={{ color: 'var(--red)' }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Restore from Backup</p>
                        <p className="text-xs" style={{ color: 'var(--red)' }}>⚠️ Destructive operation</p>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                      Upload a .zip backup file. A safety snapshot is auto-created first.{' '}
                      <strong>All current data will be replaced.</strong>
                    </p>
                    <input type="file" accept=".zip" ref={restoreRef} onChange={handleRestoreUpload} className="hidden" />
                    <Button variant="danger" size="sm" onClick={() => restoreRef.current?.click()}>
                      <Upload size={14} /> Upload & Restore
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>
                    Backup History
                  </p>
                  <div className="flex-1 h-px" style={{ background: 'var(--border-lo)' }} />
                </div>

                {backLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent"
                      style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
                  </div>
                ) : !backups || backups.length === 0 ? (
                  <div
                    className="text-center py-10 rounded-xl border border-dashed"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink-faint)' }}
                  >
                    <Database size={32} strokeWidth={1.2} className="mx-auto mb-2" />
                    <p className="text-sm">No backups yet. Create your first backup above.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {backups.map(b => (
                      <div
                        key={b.filename}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl border"
                        style={{ borderColor: 'var(--border)', background: 'var(--canvas)' }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: b.type === 'automatic' ? 'var(--blue-bg)' : 'var(--teal-bg)' }}
                        >
                          <Database size={15}
                            style={{ color: b.type === 'automatic' ? 'var(--blue)' : 'var(--teal)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate font-mono" style={{ color: 'var(--ink)' }}>
                            {b.filename}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-faint)' }}>
                            {b.size_human} · {new Date(b.created_at).toLocaleString()} · <span className="capitalize">{b.type}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <IconActionBtn
                            onClick={() => handleDownload(b.filename)}
                            title="Download"
                            color="var(--teal)"
                            hoverBg="var(--teal-bg)"
                          >
                            <Download size={14} />
                          </IconActionBtn>
                          <IconActionBtn
                            onClick={() => handleDeleteBackup(b.filename)}
                            title="Delete"
                            color="var(--ink-faint)"
                            hoverBg="var(--red-bg)"
                            hoverColor="var(--red)"
                          >
                            <Trash2 size={14} />
                          </IconActionBtn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              SYSTEM HEALTH
          ════════════════════════════════════════════════════════ */}
          {tab === 'system' && (
            <div className="space-y-5">
              <div className="card p-4 sm:p-6">
                <SectionHeader
                  icon={Activity}
                  title="System Health"
                  desc="Real-time status of all critical system components"
                  action={
                    <Button size="sm" variant="secondary" onClick={() => refetchHealth()} loading={healthFetching}>
                      <RefreshCw size={13} /> Refresh
                    </Button>
                  }
                />
                {!healthData ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-7 w-7 border-2 border-t-transparent"
                      style={{ borderColor: 'var(--teal) transparent var(--teal) var(--teal)' }} />
                  </div>
                ) : (
                  <>
                    <div
                      className="rounded-xl p-4 flex items-center gap-4 mb-6"
                      style={{ background: healthData.overall === 'healthy' ? 'var(--emerald-bg)' : 'var(--amber-bg)' }}
                    >
                      {healthData.overall === 'healthy'
                        ? <CheckCircle size={24} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
                        : <AlertTriangle size={24} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                      }
                      <div>
                        <p className="font-bold" style={{ color: healthData.overall === 'healthy' ? 'var(--emerald)' : 'var(--amber)' }}>
                          System is {healthData.overall === 'healthy' ? 'Healthy' : 'Degraded'}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                          Last checked: {new Date(healthData.checked_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(healthData.checks || {}).map(([key, check]) => {
                        const IconMap = { database: Server, storage: HardDrive, cache: Zap, queue: Activity, backup: Database, disk: HardDrive };
                        const Icon = IconMap[key] || Activity;
                        const bg  = check.status === 'ok' ? 'var(--emerald-bg)' : check.status === 'warn' ? 'var(--amber-bg)' : 'var(--red-bg)';
                        const clr = check.status === 'ok' ? 'var(--emerald)'    : check.status === 'warn' ? 'var(--amber)'    : 'var(--red)';
                        return (
                          <div key={key}
                            className="rounded-xl border p-4 flex items-center gap-3"
                            style={{ borderColor: 'var(--border)', background: 'var(--canvas)' }}
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: bg }}>
                              <Icon size={15} style={{ color: clr }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{check.label}</p>
                              {check.detail && (
                                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--ink-soft)' }}>{check.detail}</p>
                              )}
                            </div>
                            <HealthDot status={check.status} />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="card p-4 sm:p-6">
                <SectionHeader icon={Zap} title="Cache Management" />
                <div
                  className="flex items-start sm:items-center gap-4 flex-wrap justify-between px-4 sm:px-5 py-4 rounded-xl border"
                  style={{ borderColor: 'var(--border)', background: 'var(--canvas)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: 'var(--ink)' }}>Clear All Caches</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                      Clears config, view, and application caches. System rebuilds them automatically on next request.
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" loading={clearCache.isPending} onClick={() => clearCache.mutate()}>
                    <RefreshCw size={13} /> Clear Cache
                  </Button>
                </div>
              </div>

              <div className="card p-4 sm:p-6">
                <SectionHeader icon={Server} title="Application Information" />
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  {[
                    ['Application', 'Berves Engineering HRMS'],
                    ['Version',     'v2.0.0'],
                    ['Framework',   'Laravel 11 + React 18'],
                    ['Environment', import.meta.env.MODE || 'production'],
                  ].map(([l, v], i, arr) => (
                    <div
                      key={l}
                      className="flex items-center justify-between px-5 py-3.5"
                      style={{
                        background: i % 2 === 0 ? 'var(--surface)' : 'var(--canvas)',
                        borderBottom: i < arr.length - 1 ? '1px solid var(--border-lo)' : 'none',
                      }}
                    >
                      <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{l}</p>
                      <p className="text-sm font-mono font-semibold" style={{ color: 'var(--ink)' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Overtime Policy Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={overtimeModal.isOpen}
        onClose={() => {
          overtimeModal.close();
          setEditOtPolicy(null);
          resetOt();
        }}
        title={editOtPolicy ? 'Edit Overtime Policy' : 'New Overtime Policy'}
        size="md"
      >
        <form onSubmit={hsOt(d => saveOt.mutate(d))}>
          <div className="modal-body">
            <div className="space-y-4">
              <div>
                <label className="label">Day Type *</label>
                <select className="input" {...regOt('day_type', { required: true })}>
                  <option value="weekday">Weekday</option>
                  <option value="sunday">Sunday</option>
                  <option value="public_holiday">Public Holiday</option>
                </select>
              </div>
              <div>
                <label className="label">Rate Multiplier *</label>
                <input
                  type="number"
                  step="0.25"
                  min="1"
                  max="5"
                  className="input"
                  {...regOt('multiplier', { required: true })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Min Hours</label>
                  <input type="number" step="0.5" min="0" className="input" {...regOt('min_hours')} />
                </div>
                <div>
                  <label className="label">Max Hours</label>
                  <input type="number" step="0.5" min="1" className="input" {...regOt('max_hours')} />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="ghost" size="sm" onClick={overtimeModal.close}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saveOt.isPending}>
              Save Policy
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Leave Policy Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={leavePolicyModal.isOpen}
        onClose={() => {
          leavePolicyModal.close();
          setEditLpPolicy(null);
          resetLp();
        }}
        title={editLpPolicy ? 'Edit Leave Policy' : 'New Leave Policy'}
        size="md"
      >
        <form onSubmit={hsLp(d => saveLp.mutate(d))}>
          <div className="modal-body">
            <div className="space-y-4">
              <div>
                <label className="label">Policy Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Annual Leave"
                  {...regLp('name', { required: 'Name is required' })}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  placeholder="Brief description of this leave type…"
                  {...regLp('description')}
                />
              </div>
              <div>
                <label className="label">Max Days per Year</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  placeholder="21"
                  {...regLp('max_days')}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="ghost" size="sm" onClick={leavePolicyModal.close}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saveLp.isPending}>
              Save Policy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};