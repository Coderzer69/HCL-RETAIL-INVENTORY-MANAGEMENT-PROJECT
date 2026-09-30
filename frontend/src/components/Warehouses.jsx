import React, { useState, useEffect } from 'react';
import { 
  Building2, Package, Database, AlertTriangle, 
  Search, Download, Plus, MoreHorizontal, 
  MapPin, Filter, Calendar, Map as MapIcon, 
  PieChart, ChevronLeft, ChevronRight, X, Edit2
} from 'lucide-react';
import { api } from '../services/api';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWH, setEditingWH] = useState(null);
  const [formData, setFormData] = useState({
    name: '', locationCode: '', address: '', isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/warehouses');
      setWarehouses(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const openAddModal = () => {
    setEditingWH(null);
    setFormData({ name: '', locationCode: '', address: '', isActive: true });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (wh) => {
    setEditingWH(wh);
    setFormData({
      name: wh.name,
      locationCode: wh.locationCode,
      address: wh.address,
      isActive: wh.isActive
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editingWH) {
        await api.put(`/warehouses/${editingWH.id}`, formData);
      } else {
        await api.post('/warehouses', formData);
      }
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (err) {
      setFormError(err.message || 'Error saving warehouse');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredWarehouses = warehouses.filter(wh => 
    wh.name.toLowerCase().includes(search.toLowerCase()) || 
    wh.locationCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-scroll-area">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Warehouses</h2>
          <p className="text-muted text-sm">Manage your warehouse locations and monitor stock distribution</p>
        </div>
        <div className="flex gap-3">
          <div className="select-input">
            <Calendar size={16} className="text-muted" />
            <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
              <option>Sep 1, 2024 - Sep 30, 2024</option>
            </select>
          </div>
          <div className="select-input">
            <Building2 size={16} className="text-muted" />
            <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
              <option>All Warehouses</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-4">
        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-primary-faded)', color: 'var(--color-primary)' }}>
              <Building2 size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Total Warehouses</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{warehouses.length}</h3>
            <span className="trend-badge trend-up">↑ 25%</span>
          </div>
          <p className="text-xs text-muted">Active warehouse locations</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <Package size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Total Stock Value</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">₹48,52,300</h3>
            <span className="trend-badge trend-up">↑ 8%</span>
          </div>
          <p className="text-xs text-muted">Value across all warehouses</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Database size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Total Capacity Utilized</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">68%</h3>
            <span className="trend-badge trend-down">↓ 12%</span>
          </div>
          <p className="text-xs text-muted">Storage capacity usage</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
              <AlertTriangle size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Low Stock Locations</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">2</h3>
            <span className="trend-badge" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>↑ 100%</span>
          </div>
          <p className="text-xs text-muted">Warehouses with low stock items</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Main Left Content: Table */}
        <div className="card p-0 overflow-hidden">
          <div className="card-header p-4 border-b m-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h3 className="card-title text-lg flex items-center gap-2">
              <Building2 size={20} className="text-primary" /> Warehouse List
            </h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-2" style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
                <Download size={16} /> Export
              </button>
              <button onClick={openAddModal} className="btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
                <Plus size={16} /> Add Warehouse
              </button>
            </div>
          </div>

          <div className="p-4 border-b flex gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="search-bar flex-1" style={{ maxWidth: '300px' }}>
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search warehouses..." 
                style={{ width: '100%' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <select className="select-input ml-auto" style={{ width: '120px' }}>
              <option>All Status</option>
              <option>Active</option>
              <option>Low Stock</option>
            </select>

            <button className="flex items-center gap-2" style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: 500 }}>
              <Filter size={16} /> Filters
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading warehouses...</div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
          ) : filteredWarehouses.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No warehouses found.</div>
          ) : (
            <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
              <table className="w-full text-left" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', width: '40px' }}><input type="checkbox" /></th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Warehouse</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Location / Address</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Capacity</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Current Stock</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWarehouses.map((wh) => (
                    <tr key={wh.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-gray-50 transition-colors">
                      <td style={{ padding: '1rem' }}><input type="checkbox" /></td>
                      <td style={{ padding: '1rem' }}>
                        <div className="flex items-center gap-3">
                          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-primary-faded)', color: 'var(--color-primary)', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{wh.name}</p>
                            <p className="text-xs text-muted">{wh.locationCode}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        <div className="flex items-start gap-1">
                          <MapPin size={14} className="text-primary mt-1 flex-shrink-0" />
                          <span style={{ whiteSpace: 'pre-line' }}>{wh.address}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '120px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>N/A</span>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `0%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '999px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>0 / 0</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>N/A</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                          backgroundColor: wh.isActive ? '#dcfce7' : '#fef9c3',
                          color: wh.isActive ? '#16a34a' : '#ca8a04'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                          {wh.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                        <button onClick={() => openEditModal(wh)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-text-muted)' }}><Edit2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="p-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-sm text-muted">Showing 1 to {filteredWarehouses.length} of {filteredWarehouses.length} warehouses</p>
            <div className="flex gap-1">
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '0.375rem', backgroundColor: 'white', color: 'var(--color-text-muted)', opacity: 0.5 }} disabled><ChevronLeft size={16} /></button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-primary)', borderRadius: '0.375rem', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 500 }}>1</button>
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '0.375rem', backgroundColor: 'white', color: 'var(--color-text-muted)', opacity: 0.5 }} disabled><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Map and Chart Cards */}
        <div className="dashboard-grid-half">
          
          {/* Map Card */}
          <div className="card p-0 overflow-hidden">
            <div className="card-header p-4 border-b m-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="card-title text-sm flex items-center gap-2">
                <MapIcon size={16} className="text-primary" /> Warehouse Locations
              </h3>
              <button style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                View Map
              </button>
            </div>
            <div style={{ height: '300px', backgroundColor: '#e0f2fe', position: 'relative', overflow: 'hidden' }}>
              {/* Pseudo Map SVG Background */}
              <svg width="100%" height="100%" viewBox="0 0 400 400" style={{ opacity: 0.5 }}>
                <path d="M100,200 Q150,100 250,150 T350,250" fill="none" stroke="#bae6fd" strokeWidth="2" />
                <path d="M50,150 Q100,50 200,100 T300,300" fill="none" stroke="#bae6fd" strokeWidth="2" />
                <path d="M150,300 Q200,200 300,150" fill="none" stroke="#bae6fd" strokeWidth="2" />
                <circle cx="200" cy="200" r="150" fill="white" opacity="0.3" />
              </svg>

              {/* Map Pins */}
              <div style={{ position: 'absolute', top: '25%', left: '45%', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8b5cf6', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1.2 }}>Delhi<br/><span style={{ fontWeight: 400, color: '#475569' }}>(North)</span></div>
              </div>

              <div style={{ position: 'absolute', top: '35%', left: '50%', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1.2 }}>Greater Noida<br/><span style={{ fontWeight: 400, color: '#475569' }}>(Main)</span></div>
              </div>

              <div style={{ position: 'absolute', top: '45%', right: '15%', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1.2 }}>Kolkata<br/><span style={{ fontWeight: 400, color: '#475569' }}>(East)</span></div>
              </div>

              <div style={{ position: 'absolute', top: '55%', left: '20%', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f97316', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1.2 }}>Mumbai<br/><span style={{ fontWeight: 400, color: '#475569' }}>(West)</span></div>
              </div>

              <div style={{ position: 'absolute', bottom: '25%', left: '40%', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1.2 }}>Bengaluru<br/><span style={{ fontWeight: 400, color: '#475569' }}>(South)</span></div>
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="card p-0 overflow-hidden">
            <div className="card-header p-4 border-b m-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="card-title text-sm flex items-center gap-2">
                <PieChart size={16} className="text-primary" /> Storage Capacity
              </h3>
              <button style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                View Details
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              
              {/* CSS Donut Chart */}
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="4"
                    strokeDasharray="68, 100"
                  />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', lineHeight: 1 }}>68%</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Utilized</span>
                </div>
              </div>

              {/* Legend */}
              <div style={{ flex: 1, marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></span>
                    Used Capacity
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>17,650 units</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e2e8f0' }}></span>
                    Available Capacity
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>8,350 units</span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>Total Capacity</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>26,000 units</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingWH ? 'Edit Warehouse' : 'Add Warehouse'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            {formError && <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>{formError}</div>}
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Warehouse Name *</label>
                <input required type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Main Hub" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Location Code *</label>
                <input required type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.locationCode} onChange={e => setFormData({...formData, locationCode: e.target.value})} placeholder="e.g. WH-001" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Full Address *</label>
                <textarea required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none', resize: 'vertical' }} rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street, City, State..."></textarea>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="isActiveWH" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <label htmlFor="isActiveWH" style={{ fontSize: '0.875rem', cursor: 'pointer', color: '#0f172a', fontWeight: 500 }}>Warehouse is Active</label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary" style={{ marginTop: 0, padding: '0.5rem 1rem', opacity: formLoading ? 0.7 : 1, cursor: formLoading ? 'not-allowed' : 'pointer' }}>
                  {formLoading ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
