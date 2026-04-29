import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Shield, Settings, Package } from 'lucide-react';
import { permissionsApi } from '../../api/permissions';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { swDelete, swSuccess, swError } from '../../lib/swal';

export const PermissionsPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { page, setPage, perPage } = usePagination();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const dSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['permissions', page, perPage, dSearch, moduleFilter],
    queryFn: () => permissionsApi.list({ 
      page, 
      per_page: perPage, 
      search: dSearch,
      module: moduleFilter 
    }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: modules } = useQuery({
    queryKey: ['permission-modules'],
    queryFn: () => permissionsApi.modules().then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => permissionsApi.delete(id),
    onSuccess: () => {
      swSuccess('Permission deleted successfully');
      qc.invalidateQueries(['permissions']);
    },
    onError: () => swError('Failed to delete permission'),
  });

  const handleDelete = async (id, name) => {
    const res = await swDelete(name);
    if (res.isConfirmed) deleteMutation.mutate(id);
  };

  const handleEdit = (permission) => {
    setEditingPermission(permission);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingPermission(null);
    setShowModal(true);
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Permission', 
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-600" />
          <div>
            <span className="font-medium">{row.display_name}</span>
            <span className="text-xs text-gray-500 block">({row.name})</span>
          </div>
        </div>
      )
    },
    { 
      key: 'module', 
      label: 'Module', 
      render: (value) => (
        <Badge variant="secondary" label={value} />
      )
    },
    { 
      key: 'action', 
      label: 'Action', 
      render: (value) => (
        <Badge variant="info" label={value} />
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
      key: 'roles_count', 
      label: 'Roles', 
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{row.roles?.length || 0}</span>
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
            onClick={() => navigate(`/settings/permissions/${row.id}`)}
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
        title="Permissions" 
        subtitle={data?.meta?.total ? `${data.meta.total} permissions` : ''}
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowBulkModal(true)}>
              <Package size={14} /> Bulk Create
            </Button>
            <Button onClick={handleCreate}>
              <Plus size={14} /> Add Permission
            </Button>
          </>
        }
      />

      <div className="card">
        <div className="card-header gap-3 flex-wrap">
          <SearchInput 
            value={search} 
            onChange={(v) => { setSearch(v); setPage(1); }} 
            placeholder="Search permissions..." 
          />
          <Select 
            value={moduleFilter} 
            onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
            className="w-48"
          >
            <option value="">All Modules</option>
            {(modules || []).map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </Select>
        </div>
        
        <DataTable 
          columns={columns} 
          data={data?.data} 
          loading={isLoading} 
          emptyMessage="No permissions found" 
        />
        
        <Pagination meta={data?.meta} onPageChange={setPage} />
      </div>

      {/* Permission Modal */}
      <PermissionModal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        permission={editingPermission}
        onSuccess={() => {
          setShowModal(false);
          qc.invalidateQueries(['permissions']);
        }}
      />

      {/* Bulk Create Modal */}
      <BulkCreateModal 
        show={showBulkModal} 
        onHide={() => setShowBulkModal(false)}
        onSuccess={() => {
          setShowBulkModal(false);
          qc.invalidateQueries(['permissions']);
        }}
      />
    </div>
  );
};

// Permission Modal Component
const PermissionModal = ({ show, onHide, permission, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    module: '',
    action: '',
  });

  const qc = useQueryClient();

  const { data: modules } = useQuery({
    queryKey: ['permission-modules'],
    queryFn: () => import('../../api/permissions').then(api => api.permissionsApi.modules().then(r => r.data)),
    enabled: show,
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (permission) {
        return import('../../api/permissions').then(api => api.permissionsApi.update(permission.id, data));
      }
      return import('../../api/permissions').then(api => api.permissionsApi.create(data));
    },
    onSuccess: () => {
      swSuccess(permission ? 'Permission updated successfully' : 'Permission created successfully');
      onSuccess();
    },
    onError: (err) => swError(err.response?.data?.message || 'Failed to save permission'),
  });

  React.useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        display_name: permission.display_name,
        description: permission.description || '',
        module: permission.module,
        action: permission.action,
      });
    } else {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        module: '',
        action: '',
      });
    }
  }, [permission]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header>
        <Modal.Title>{permission ? 'Edit Permission' : 'Create Permission'}</Modal.Title>
      </Modal.Header>
      
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <Input
              label="Permission Name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="e.g., Create Employee"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Module"
                value={formData.module}
                onChange={(e) => setFormData(prev => ({ ...prev, module: e.target.value }))}
                required
              >
                <option value="">Select module...</option>
                {(modules || []).map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </Select>
              
              <Input
                label="Action"
                value={formData.action}
                onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                placeholder="e.g., create"
                required
              />
            </div>
            
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this permission allows"
              rows={3}
            />
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isLoading}>
            {permission ? 'Update Permission' : 'Create Permission'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

// Bulk Create Modal Component
const BulkCreateModal = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    module: '',
    permissions: [{ name: '', display_name: '', action: '', description: '' }],
  });

  const qc = useQueryClient();

  const { data: modules } = useQuery({
    queryKey: ['permission-modules'],
    queryFn: () => import('../../api/permissions').then(api => api.permissionsApi.modules().then(r => r.data)),
    enabled: show,
  });

  const mutation = useMutation({
    mutationFn: (data) => import('../../api/permissions').then(api => api.permissionsApi.bulkCreate(data)),
    onSuccess: () => {
      swSuccess('Permissions created successfully');
      onSuccess();
    },
    onError: (err) => swError(err.response?.data?.message || 'Failed to create permissions'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const addPermission = () => {
    setFormData(prev => ({
      ...prev,
      permissions: [...prev.permissions, { name: '', display_name: '', action: '', description: '' }]
    }));
  };

  const removePermission = (index) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter((_, i) => i !== index)
    }));
  };

  const updatePermission = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map((perm, i) => 
        i === index ? { ...perm, [field]: value } : perm
      )
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header>
        <Modal.Title>Bulk Create Permissions</Modal.Title>
      </Modal.Header>
      
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <Select
              label="Module"
              value={formData.module}
              onChange={(e) => setFormData(prev => ({ ...prev, module: e.target.value }))}
              required
            >
              <option value="">Select module...</option>
              {(modules || []).map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </Select>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Permissions</label>
                <Button type="button" variant="secondary" size="sm" onClick={addPermission}>
                  Add Permission
                </Button>
              </div>
              
              {formData.permissions.map((permission, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">Permission {index + 1}</h4>
                    {formData.permissions.length > 1 && (
                      <Button 
                        type="button" 
                        variant="danger" 
                        size="sm" 
                        onClick={() => removePermission(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Display Name"
                      value={permission.display_name}
                      onChange={(e) => updatePermission(index, 'display_name', e.target.value)}
                      placeholder="e.g., Create Employee"
                      required
                    />
                    <Input
                      label="Action"
                      value={permission.action}
                      onChange={(e) => updatePermission(index, 'action', e.target.value)}
                      placeholder="e.g., create"
                      required
                    />
                  </div>
                  
                  <Textarea
                    label="Description"
                    value={permission.description}
                    onChange={(e) => updatePermission(index, 'description', e.target.value)}
                    placeholder="Describe what this permission allows"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isLoading}>
            Create Permissions
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
