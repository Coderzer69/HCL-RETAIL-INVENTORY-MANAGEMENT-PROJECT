import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Shield, Plus, Search, Filter, 
  MoreHorizontal, ChevronLeft, ChevronRight, Edit3, Trash2,
  Box, Tag, Eye, Package, ShoppingCart, FileText, Warehouse, Truck, Settings
} from 'lucide-react';
import { api } from '../services/api';

export default function UsersAndRoles() {
  const [activeUserTab, setActiveUserTab] = useState('Permissions');
  
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles')
      ]);

      if (usersRes?.data) {
        setUsers(usersRes.data);
        if (usersRes.data.length > 0) setSelectedUser(usersRes.data[0]);
      }

      if (rolesRes?.data) {
        setRoles(rolesRes.data);
      }
    } catch (error) {
      console.error('Error fetching users or roles', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (roleName) => {
    switch (roleName?.toUpperCase()) {
      case 'ADMIN': return <Shield size={16} style={{ color: '#7c3aed' }} />;
      case 'STORE_MANAGER':
      case 'MANAGER': return <Users size={16} style={{ color: '#3b82f6' }} />;
      case 'WAREHOUSE_STAFF':
      case 'INVENTORY_STAFF': return <Box size={16} style={{ color: '#f59e0b' }} />;
      case 'SALES_STAFF': return <Tag size={16} style={{ color: '#3b82f6' }} />;
      case 'PURCHASE_STAFF': return <ShoppingCart size={16} style={{ color: '#ef4444' }} />;
      default: return <Eye size={16} style={{ color: '#64748b' }} />;
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName?.toUpperCase()) {
      case 'ADMIN': return { bg: '#ede9fe', color: '#7c3aed' };
      case 'STORE_MANAGER':
      case 'MANAGER': return { bg: '#dbeafe', color: '#3b82f6' };
      case 'WAREHOUSE_STAFF': 
      case 'INVENTORY_STAFF': return { bg: '#fef3c7', color: '#d97706' };
      case 'PURCHASE_STAFF': return { bg: '#fee2e2', color: '#ef4444' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const getInitials = (user) => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getUserPrimaryRole = (user) => {
    if (!user || !user.roles || user.roles.length === 0) return 'Viewer';
    return user.roles[0].role.name;
  };

  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;
  
  return (
    <div className="dashboard-scroll-area">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Users & Roles</h2>
          <p className="text-muted text-sm">Manage your team members, set roles, and control access permissions</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="dashboard-grid-4">
        <div className="card">
          <div className="card-header">
            <div className="icon-rounded icon-primary-bg">
              <Users size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Total Users</p>
          <div className="kpi-value">
            {users.length}
            <span className="trend-badge trend-up">↑ 20%</span>
          </div>
          <p className="text-xs text-muted">+4 from last month</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
              <CheckCircle size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Active Users</p>
          <div className="kpi-value">
            {activeCount}
            <span className="trend-badge trend-up">↑ 17%</span>
          </div>
          <p className="text-xs text-muted">{users.length ? Math.round((activeCount / users.length) * 100) : 0}% of total users</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              <XCircle size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Inactive Users</p>
          <div className="kpi-value">
            {inactiveCount}
            <span className="trend-badge" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>↑ 25%</span>
          </div>
          <p className="text-xs text-muted">{users.length ? Math.round((inactiveCount / users.length) * 100) : 0}% of total users</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
              <Shield size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Total Roles</p>
          <div className="kpi-value">
            {roles.length}
          </div>
          <p className="text-xs text-muted">System defined + Custom</p>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Left Column: Users List */}
        <div className="card flex flex-col" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '1.5rem 1.5rem 0', marginBottom: '1rem' }}>
            <h3 className="card-title"><Users size={18} className="text-primary" /> Users</h3>
          </div>
          
          <div className="flex flex-wrap gap-3" style={{ padding: '0 1.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
            <div className="search-bar" style={{ flex: '1 1 200px' }}>
              <Search size={16} />
              <input type="text" placeholder="Search users by name, email, or role..." />
            </div>
            <div className="select-input">
              <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
                <option>All Roles</option>
                {roles.map(r => (
                  <option key={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <button className="select-input" style={{ cursor: 'pointer' }}>
              <Filter size={16} /> Filters
            </button>
          </div>

          <div className="table-container" style={{ flex: 1 }}>
            <table>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}><input type="checkbox" /></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</td>
                  </tr>
                ) : users.map((user, idx) => {
                  const roleName = getUserPrimaryRole(user);
                  const colors = getRoleColor(roleName);
                  const isSelected = selectedUser?.id === user.id;

                  return (
                    <tr key={idx} onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer', backgroundColor: isSelected ? '#f1f5f9' : 'transparent', borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar" style={{ backgroundColor: colors.color, width: '32px', height: '32px', fontSize: '12px' }}>
                            {getInitials(user)}
                          </div>
                          <span className="font-medium text-sm">{user.firstName} {user.lastName}</span>
                        </div>
                      </td>
                      <td className="text-muted text-sm">{user.email}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: colors.bg, color: colors.color }}>
                          {roleName}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: user.isActive ? '#10b981' : '#ef4444' }}></span>
                          <span className="text-xs" style={{ color: user.isActive ? '#10b981' : '#ef4444' }}>{user.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="text-muted text-xs">Just now</td>
                      <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <button style={{ color: 'var(--color-text-muted)' }}><MoreHorizontal size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Roles & Permissions */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><FileText size={18} className="text-primary" /> Roles</h3>
              <button className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', fontSize: '0.75rem', marginTop: 0 }}>
                <Plus size={14} /> Create Role
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {roles.map((role, idx) => {
                const colors = getRoleColor(role.name);
                return (
                  <div key={idx} className="flex justify-between items-center" style={{ padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                    <div className="flex gap-3 items-center">
                      <div style={{ backgroundColor: colors.bg, padding: '0.5rem', borderRadius: '0.375rem', display: 'flex' }}>
                        {getRoleIcon(role.name)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{role.name}</div>
                        <div className="text-xs text-muted mt-1">{role.description || 'Access to selected modules'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge" style={{ backgroundColor: '#ede9fe', color: '#7c3aed', fontSize: '0.7rem' }}>{role._count?.userRoles || 0} users</span>
                      <MoreHorizontal size={14} className="text-muted" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedUser && (
            <div className="card flex-1">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="avatar" style={{ backgroundColor: getRoleColor(getUserPrimaryRole(selectedUser)).color }}>
                    {getInitials(selectedUser)}
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {selectedUser.firstName} {selectedUser.lastName}
                      <span className="badge" style={{ backgroundColor: selectedUser.isActive ? '#d1fae5' : '#fee2e2', color: selectedUser.isActive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: selectedUser.isActive ? '#10b981' : '#ef4444' }}></span> {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-muted mt-1">{selectedUser.email}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button style={{ padding: '0.4rem', color: 'var(--color-text-muted)' }}><MoreHorizontal size={16} /></button>
                  <button className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', fontSize: '0.75rem', marginTop: 0 }}>
                    <Edit3 size={14} /> Edit User
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mb-4 overflow-x-auto whitespace-nowrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Details', 'Assigned Roles', 'Permissions', 'Activity Log'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveUserTab(tab)}
                    style={{ 
                      padding: '0.75rem 0.5rem', 
                      fontSize: '0.875rem',
                      fontWeight: activeUserTab === tab ? '600' : '500',
                      color: activeUserTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      borderBottom: activeUserTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeUserTab === 'Permissions' && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col gap-1" style={{ flex: '1 1 200px', borderRight: '1px solid var(--color-border)', paddingRight: '0.5rem' }}>
                    {[
                      {name: 'Products', icon: <Package size={14} />},
                      {name: 'Inventory', icon: <Box size={14} />},
                      {name: 'Orders', icon: <ShoppingCart size={14} />},
                      {name: 'Purchase', icon: <FileText size={14} />},
                      {name: 'Suppliers', icon: <Users size={14} />},
                      {name: 'Warehouses', icon: <Warehouse size={14} />},
                      {name: 'Shipments', icon: <Truck size={14} />},
                      {name: 'Settings', icon: <Settings size={14} />},
                    ].map((mod, idx) => (
                      <button key={idx} style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.375rem', fontSize: '0.875rem',
                        backgroundColor: mod.name === 'Products' ? 'var(--color-primary-faded)' : 'transparent',
                        color: mod.name === 'Products' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: mod.name === 'Products' ? '600' : '500'
                      }}>
                        {mod.icon} {mod.name}
                      </button>
                    ))}
                  </div>
                  
                  <div style={{ flex: '2 1 300px', paddingLeft: '0.5rem' }}>
                    <div className="mb-4">
                      <h3 className="font-semibold text-sm">Products</h3>
                      <p className="text-xs text-muted mt-1">Manage product catalog and related information</p>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {[
                        { title: 'View Products', desc: 'Can view product list and details', checked: true },
                        { title: 'Create Products', desc: 'Can add new products', checked: getUserPrimaryRole(selectedUser) === 'Admin' || getUserPrimaryRole(selectedUser) === 'Manager' },
                        { title: 'Edit Products', desc: 'Can update product information', checked: getUserPrimaryRole(selectedUser) === 'Admin' || getUserPrimaryRole(selectedUser) === 'Manager' },
                        { title: 'Delete Products', desc: 'Can remove products', checked: getUserPrimaryRole(selectedUser) === 'Admin' },
                        { title: 'Manage Categories', desc: 'Can create, edit and delete categories', checked: getUserPrimaryRole(selectedUser) === 'Admin' },
                      ].map((perm, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="mt-1">
                            <input type="checkbox" checked={perm.checked} readOnly style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }} />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{perm.title}</div>
                            <div className="text-xs text-muted mt-1">{perm.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
