import { useAuthStore } from '../store/authStore';
import { useMemo } from 'react';

export const useAuth = () => {
  const user            = useAuthStore((s) => s.user);
  const token           = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login           = useAuthStore((s) => s.login);
  const logout          = useAuthStore((s) => s.logout);
  const updateUser      = useAuthStore((s) => s.updateUser);

  const hasRole = useMemo(() => (roles) => {
    if (!user) return false;
    const r = Array.isArray(roles) ? roles : [roles];
    return r.includes(user.role);
  }, [user]);

  const hasPermission = useMemo(() => (perm) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(perm) ?? false;
  }, [user]);

  return {
    user, token, isAuthenticated, login, logout, updateUser,
    hasRole, hasPermission,
    isAdmin:         user?.role === 'admin',
    isHR:            user?.role === 'hr',
    isManager:       user?.role === 'manager',
    isEmployee:      user?.role === 'employee',
    isPayrollOfficer:user?.role === 'payroll_officer',
    canApproveLeave: ['admin','hr','manager'].includes(user?.role),
    canRunPayroll:   ['admin','payroll_officer'].includes(user?.role),
    canViewPayroll:  ['admin','hr','payroll_officer'].includes(user?.role),
    canManageEmployees: ['admin','hr'].includes(user?.role),
    canViewReports:  ['admin','hr','payroll_officer'].includes(user?.role),
  };
};
