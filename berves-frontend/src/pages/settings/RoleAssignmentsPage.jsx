import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Shield, Search, Filter, UserPlus, UserMinus } from 'lucide-react';
import { roleAssignmentsApi } from '../../api/roleAssignments';
import { rolesApi } from '../../api/roles';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Avatar } from '../../components/common/Avatar';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { swSuccess, swError } from '../../lib/swal';

export const RoleAssignmentsPage = () => {
  const qc = useQueryClient();
  const { page, setPage, perPage } = usePagination();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const dSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['role-assignments', page, perPage, dSearch, roleFilter],
    queryFn: () => roleAssignmentsApi.getUsersWithRoles({ 
      page, 
      per_page: perPage, 
      search: dSearch,
      role_id: roleFilter 
    }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: roles } = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => rolesApi.all().then(r => r.data.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['role-stats'],
    queryFn: () => roleAssignmentsApi.getStats().then(r => r.data),
  });

  const assignMutation = useMutation({
    mutationFn: ({ userId, roleIds }) => roleAssignmentsApi.assignRoles(userId, roleIds),
    onSuccess: () => {
      swSuccess('Roles assigned successfully');
      qc.invalidateQueries(['role-assignments']);
      setShowAssignModal(false);
    },
    onError: (err) => swError(err.response?.data?.message || 'Failed to assign roles'),
  });

  const bulkAssignMutation = useMutation({
    mutationFn: (data) => roleAssignmentsApi.bulkAssign(data),
    onSuccess: () => {
      swSuccess('Roles bulk assigned successfully');
      qc.invalidateQueries(['role-assignments']);
      setShowBulkModal(false);
    },
    onError: (err) => swError(err.response?.data?.message || 'Failed to bulk assign roles'),
  });

  const handleAssignRoles = (user) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  const columns = [
    { 
      key: 'user', 
      label: 'User', 
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar 
            name={row.name} 
            photo={row.profile_photo_url} 
            size="sm" 
          />
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'roles', 
      label: 'Roles', 
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles?.length > 0 ? (
            row.roles.map(role => (
              <Badge key={role.id} variant="secondary" label={role.display_name} />
            ))
          ) : (
            <span className="text-sm text-gray-500">No roles assigned</span>
          )}
        </div>
      )
    },
    { 
      key: 'permissions_count', 
      label: 'Permissions', 
      render: (_, row) => {
        const permissionCount = row.roles?.reduce((total, role) => 
          total + (role.permissions?.length || 0), 0) || 0;
        return (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{permissionCount}</span>
          </div>
        );
      }
    },
    { 
      key: 'employee', 
      label: 'Employee', 
      render: (_, row) => (
        <div>
          {row.employee ? (
            <>
              <p className="text-sm font-medium">{row.employee.first_name} {row.employee.last_name}</p>
              <p className="text-xs text-gray-500">{row.employee.employee_number}</p>
            </>
          ) : (
            <span className="text-sm text-gray-500">No employee record</span>
          )}
        </div>
      )
    },
    { 
      key: 'actions', 
      label: '', 
      width: '120px',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleAssignRoles(row)}
            className="btn-ghost btn-sm"
          >
            <UserPlus size={14} /> Assign
          </button>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Role Assignments" 
        subtitle={data?.meta?.total ? `${data.meta.total} users` : ''}
        actions={
          <Button onClick={() => setShowBulkModal(true)}>
            <UserPlus size={14} /> Bulk Assign
          </Button>
        }
      />

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{stats.reduce((sum, role) => sum + role.users_count, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Roles</p>
                <p className="text-2xl font-bold">{stats.length}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Users/Role</p>
                <p className="text-2xl font-bold">
                  {stats.length > 0 ? Math.round(stats.reduce((sum, role) => sum + role.users_count, 0) / stats.length) : 0}
                </p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header gap-3 flex-wrap">
          <SearchInput 
            value={search} 
            onChange={(v) => { setSearch(v); setPage(1); }} 
            placeholder="Search users..." 
          />
          <Select 
            value={roleFilter} 
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-48"
          >
            <option value="">All Roles</option>
            {(roles || []).map(role => (
              <option key={role.id} value={role.id}>{role.display_name}</option>
            ))}
          </Select>
        </div>
        
        <DataTable 
          columns={columns} 
          data={data?.data} 
          loading={isLoading} 
          emptyMessage="No users found" 
        />
        
        <Pagination meta={data?.meta} onPageChange={setPage} />
      </div>

      {/* Assign Roles Modal */}
      <AssignRolesModal 
        show={showAssignModal} 
        onHide={() => setShowAssignModal(false)}
        user={selectedUser}
        roles={roles}
        onSuccess={() => {
          setShowAssignModal(false);
          qc.invalidateQueries(['role-assignments']);
        }}
      />

      {/* Bulk Assign Modal */}
      <BulkAssignModal 
        show={showBulkModal} 
        onHide={() => setShowBulkModal(false)}
        roles={roles}
        onSuccess={() => {
          setShowBulkModal(false);
          qc.invalidateQueries(['role-assignments']);
        }}
      />
    </div>
  );
};

// Assign Roles Modal Component
const AssignRolesModal = ({ show, onHide, user, roles, onSuccess }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);

  const assignMutation = useMutation({
    mutationFn: (roleIds) => import('../../api/roleAssignments').then(api => 
      api.roleAssignmentsApi.assignRoles(user.id, roleIds)
    ),
    onSuccess: () => {
      swSuccess('Roles assigned successfully');
      onSuccess();
    },
    onError: (err) => swError(err.response?.data?.message || 'Failed to assign roles'),
  });

  React.useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles?.map(role => role.id) || []);
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    assignMutation.mutate(selectedRoles);
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (!user) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header>
        <Modal.Title>Assign Roles to {user.name}</Modal.Title>
      </Modal.Header>
      
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Select roles to assign to <strong>{user.name}</strong>
            </p>
            
            {roles?.map(role => (
              <label key={role.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">{role.display_name}</p>
                    <p className="text-sm text-gray-500">{role.description || 'No description'}</p>
                  </div>
                </div>
                <Badge variant="info" label={`${role.permissions?.length || 0} permissions`} />
              </label>
            ))}
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" loading={assignMutation.isLoading}>
            Assign Roles
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

// Bulk Assign Modal Component
const BulkAssignModal = ({ show, onHide, roles, onSuccess }) => {
  const [formData, setFormData] = useState({
    userIds: '',
    roleIds: [],
  });

  const bulkAssignMutation = useMutation({
    mutationFn: (data) => import('../../api/roleAssignments').then(api => 
      api.roleAssignmentsApi.bulkAssign(data)
    ),
    onSuccess: () => {
      swSuccess('Roles bulk assigned successfully');
      onSuccess();
    },
    onError: (err) => swError(err.response?.data?.message || 'Failed to bulk assign roles'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userIds = formData.userIds
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));
    
    if (userIds.length === 0) {
      swError('Please enter valid user IDs');
      return;
    }
    
    if (formData.roleIds.length === 0) {
      swError('Please select at least one role');
      return;
    }
    
    bulkAssignMutation.mutate({
      user_ids: userIds,
      role_ids: formData.roleIds,
    });
  };

  const handleRoleToggle = (roleId) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header>
        <Modal.Title>Bulk Assign Roles</Modal.Title>
      </Modal.Header>
      
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User IDs (comma-separated)
              </label>
              <textarea
                value={formData.userIds}
                onChange={(e) => setFormData(prev => ({ ...prev, userIds: e.target.value }))}
                placeholder="e.g., 1, 2, 3, 4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter user IDs separated by commas
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Roles
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {roles?.map(role => (
                  <label key={role.id} className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.roleIds.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        className="mr-3"
                      />
                      <span className="font-medium">{role.display_name}</span>
                    </div>
                    <Badge variant="info" label={`${role.permissions?.length || 0} permissions`} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" loading={bulkAssignMutation.isLoading}>
            Bulk Assign Roles
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
