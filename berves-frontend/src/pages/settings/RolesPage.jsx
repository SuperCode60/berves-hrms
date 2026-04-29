import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Shield, Settings } from 'lucide-react';
import { rolesApi } from '../../api/roles';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { swDelete, swSuccess, swError } from '../../lib/swal';

export const RolesPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { page, setPage, perPage } = usePagination();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const dSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['roles', page, perPage, dSearch],
    queryFn: () => rolesApi.list({ page, per_page: perPage, search: dSearch }).then(r => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => rolesApi.delete(id),
    onSuccess: () => {
      swSuccess('Role deleted successfully');
      qc.invalidateQueries(['roles']);
    },
    onError: () => swError('Failed to delete role'),
  });

  const handleDelete = async (id, name) => {
    const res = await swDelete(name);
    if (res.isConfirmed) deleteMutation.mutate(id);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setShowModal(true);
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Role Name', 
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-600" />
          <span className="font-medium">{row.display_name}</span>
          <span className="text-xs text-gray-500">({row.name})</span>
        </div>
      )
    },
    { 
      key: 'description', 
      label: 'Description', 
      render: (value) => (
        <span className="text-sm text-gray-600 line-clamp-2">
          {value || 'No description'}
        </span>
      )
    },
    { 
      key: 'permissions_count', 
      label: 'Permissions', 
      render: (_, row) => (
        <Badge variant="info" label={`${row.permissions?.length || 0} permissions`} />
      )
    },
    { 
      key: 'users_count', 
      label: 'Users', 
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{row.users_count || 0}</span>
        </div>
      )
    },
    { 
      key: 'created_at', 
      label: 'Created', 
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'actions', 
      label: '', 
      width: '120px',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(`/settings/roles/${row.id}`)}
            className="btn-ghost btn-sm"
          >
            View
          </button>
          <button 
            onClick={() => handleEdit(row)}
            className="btn-ghost btn-sm"
          >
            <Edit size={14} />
          </button>
          <button 
            onClick={() => handleDelete(row.id, row.display_name)}
            className="btn-ghost btn-sm text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Roles & Permissions" 
        subtitle={data?.meta?.total ? `${data.meta.total} roles` : ''}
        actions={
          <Button onClick={handleCreate}>
            <Plus size={14} /> Add Role
          </Button>
        }
      />

      <div className="card">
        <div className="card-header">
          <SearchInput 
            value={search} 
            onChange={(v) => { setSearch(v); setPage(1); }} 
            placeholder="Search roles..." 
          />
        </div>
        
        <DataTable 
          columns={columns} 
          data={data?.data} 
          loading={isLoading} 
          emptyMessage="No roles found" 
        />
        
        <Pagination meta={data?.meta} onPageChange={setPage} />
      </div>

      {/* Role Modal */}
      <RoleModal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        role={editingRole}
        onSuccess={() => {
          setShowModal(false);
          qc.invalidateQueries(['roles']);
        }}
      />
    </div>
  );
};

// Role Modal Component
const RoleModal = ({ show, onHide, role, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [],
  });

  const qc = useQueryClient();

  const { data: permissions } = useQuery({
    queryKey: ['permissions', 'grouped'],
    queryFn: () => import('../../api/permissions').then(api => api.permissionsApi.grouped().then(r => r.data)),
    enabled: show,
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (role) {
        return import('../../api/roles').then(api => api.rolesApi.update(role.id, data));
      }
      return import('../../api/roles').then(api => api.rolesApi.create(data));
    },
    onSuccess: () => {
      swSuccess(role ? 'Role updated successfully' : 'Role created successfully');
      onSuccess();
    },
    onError: (err) => swError(err.response?.data?.message || 'Failed to save role'),
  });

  React.useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        display_name: role.display_name,
        description: role.description || '',
        permissions: role.permissions?.map(p => p.id) || [],
      });
    } else {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        permissions: [],
      });
    }
  }, [role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header>
        <Modal.Title>{role ? 'Edit Role' : 'Create Role'}</Modal.Title>
      </Modal.Header>
      
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <Input
              label="Role Name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="e.g., HR Manager"
              required
            />
            
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the role and its responsibilities"
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="max-h-64 overflow-y-auto space-y-3">
                {permissions && Object.entries(permissions).map(([module, modulePermissions]) => (
                  <div key={module}>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{module}</h4>
                    <div className="space-y-1">
                      {modulePermissions.map(permission => (
                        <label key={permission.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="mr-2"
                          />
                          <span className="text-sm">{permission.display_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isLoading}>
            {role ? 'Update Role' : 'Create Role'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
