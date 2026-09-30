import React, { useState, useEffect } from 'react';
import { 
  Package, Database, AlertTriangle, Ban, 
  Search, Upload, Download, Plus, MoreHorizontal, 
  Filter, Calendar, Building, ChevronLeft, ChevronRight,
  ClipboardList, X
} from 'lucide-react';
import { api } from '../services/api';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [selectedWH, setSelectedWH] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '', warehouseId: '', quantity: 1, movementType: 'IN', notes: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDependencies = async () => {
    try {
      const [whRes, prRes] = await Promise.all([
        api.get('/warehouses'),
        api.get('/products?limit=1000')
      ]);
      setWarehouses(whRes.data || []);
      setProducts(prRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dependencies', err);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      setInventory(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchInventory();
  }, []);

  const openAddModal = () => {
    setFormData({ productId: '', warehouseId: '', quantity: 1, movementType: 'IN', notes: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity, 10)
      };
      await api.post('/inventory/movements', payload);
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      setFormError(err.message || 'Error recording stock movement');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatus = (stock, reorder) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < reorder) return 'Low Stock';
    return 'In Stock';
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          item.product?.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesWH = selectedWH ? item.warehouseId === selectedWH : true;
    const matchesStatus = selectedStatus ? getStatus(item.quantityOnHand, item.reorderLevel) === selectedStatus : true;
    return matchesSearch && matchesWH && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Stock': return { bg: '#dcfce7', text: '#16a34a', dot: '#22c55e' };
      case 'Low Stock': return { bg: '#fef9c3', text: '#ca8a04', dot: '#eab308' };
      case 'Out of Stock': return { bg: '#fee2e2', text: '#ef4444', dot: '#ef4444' };
      default: return { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
    }
  };

  const getStockColor = (stock, reorder) => {
    if (stock === 0) return '#ef4444'; // Red for Out of Stock
    if (stock < reorder) return '#ca8a04'; // Yellow for Low Stock
    return '#16a34a'; // Green for In Stock
  };

  // KPIs
  const totalStock = inventory.reduce((acc, curr) => acc + curr.quantityOnHand, 0);
  const lowStockItems = inventory.filter(i => i.quantityOnHand > 0 && i.quantityOnHand < i.reorderLevel).length;
  const outOfStockItems = inventory.filter(i => i.quantityOnHand === 0).length;

  return (
    <div className="dashboard-scroll-area">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Inventory</h2>
          <p className="text-muted text-sm">Track and manage your stock levels across all warehouses</p>
        </div>
        <div className="flex gap-3">
          <div className="select-input">
            <Calendar size={16} className="text-muted" />
            <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
              <option>Sep 1, 2024 - Sep 30, 2024</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-4">
        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-primary-faded)', color: 'var(--color-primary)' }}>
              <Package size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Total Inventory Items</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{inventory.length}</h3>
          </div>
          <p className="text-xs text-muted">Unique product placements</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <Database size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Total Stock Quantity</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{totalStock.toLocaleString()}</h3>
          </div>
          <p className="text-xs text-muted">Units across all warehouses</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
              <AlertTriangle size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Low Stock Items</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{lowStockItems}</h3>
          </div>
          <p className="text-xs text-muted">Items below reorder level</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
              <Ban size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Out of Stock Items</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{outOfStockItems}</h3>
          </div>
          <p className="text-xs text-muted">Items currently out of stock</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden mt-6">
        <div className="card-header p-4 border-b m-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="card-title text-lg flex items-center gap-2">
            <ClipboardList size={20} className="text-primary" /> Inventory List
          </h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2" style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
              <Download size={16} /> Export
            </button>
            <button onClick={openAddModal} className="btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem', marginTop: 0 }}>
              <Plus size={16} /> Adjust Stock
            </button>
          </div>
        </div>

        <div className="p-4 border-b flex gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="search-bar flex-1" style={{ maxWidth: '350px' }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by product name or SKU..." 
              style={{ width: '100%' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="select-input" style={{ width: '160px', padding: 0 }}>
            <select 
              style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '0 1rem' }}
              value={selectedWH}
              onChange={e => setSelectedWH(e.target.value)}
            >
              <option value="">All Warehouses</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="select-input" style={{ width: '160px', padding: 0 }}>
            <select 
              style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '0 1rem' }}
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="">All Stock Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <button className="flex items-center gap-2 ml-auto" style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: 500 }}>
            <Filter size={16} /> Filters
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading inventory...</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
        ) : filteredInventory.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No inventory found.</div>
        ) : (
          <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
            <table className="w-full text-left" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem', width: '40px' }}><input type="checkbox" /></th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Product</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>SKU</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Warehouse</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Stock Quantity</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Reserved</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Reorder Level</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const statusLabel = getStatus(item.quantityOnHand, item.reorderLevel);
                  const sColors = getStatusColor(statusLabel);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-gray-50 transition-colors">
                      <td style={{ padding: '1rem' }}><input type="checkbox" /></td>
                      <td style={{ padding: '1rem' }}>
                        <div className="flex items-center gap-3">
                          <div style={{ width: '36px', height: '36px', backgroundColor: '#e2e8f0', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <Package size={20} />
                          </div>
                          <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{item.product?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.product?.sku}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.warehouse?.name}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: getStockColor(item.quantityOnHand, item.reorderLevel) }}>
                        {item.quantityOnHand} units
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.quantityReserved} units</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.reorderLevel}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                          backgroundColor: sColors.bg, color: sColors.text
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sColors.dot }}></span>
                          {statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                        <button><MoreHorizontal size={18} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-sm text-muted">Showing 1 to {filteredInventory.length} of {filteredInventory.length} inventory items</p>
          <div className="flex gap-1 items-center">
            <button disabled style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '0.375rem', backgroundColor: 'white', color: 'var(--color-text-muted)', opacity: 0.5 }}><ChevronLeft size={16} /></button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-primary)', borderRadius: '0.375rem', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 500 }}>1</button>
            <button disabled style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '0.375rem', backgroundColor: 'white', color: 'var(--color-text-muted)', opacity: 0.5 }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Record Stock Movement</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            {formError && <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>{formError}</div>}
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Product *</label>
                <div className="select-input" style={{ width: '100%', margin: 0, padding: 0 }}>
                  <select required style={{ width: '100%', padding: '0.75rem', border: 'none', background: 'transparent', outline: 'none' }} value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})}>
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Warehouse *</label>
                <div className="select-input" style={{ width: '100%', margin: 0, padding: 0 }}>
                  <select required style={{ width: '100%', padding: '0.75rem', border: 'none', background: 'transparent', outline: 'none' }} value={formData.warehouseId} onChange={e => setFormData({...formData, warehouseId: e.target.value})}>
                    <option value="">Select Warehouse...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Movement Type *</label>
                  <div className="select-input" style={{ width: '100%', margin: 0, padding: 0 }}>
                    <select required style={{ width: '100%', padding: '0.75rem', border: 'none', background: 'transparent', outline: 'none' }} value={formData.movementType} onChange={e => setFormData({...formData, movementType: e.target.value})}>
                      <option value="IN">Stock IN (+)</option>
                      <option value="OUT">Stock OUT (-)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Quantity *</label>
                  <input required type="number" min="1" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Notes (Optional)</label>
                <textarea style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none', resize: 'vertical' }} rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Reason for adjustment..."></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary" style={{ marginTop: 0, padding: '0.5rem 1rem', opacity: formLoading ? 0.7 : 1, cursor: formLoading ? 'not-allowed' : 'pointer' }}>
                  {formLoading ? 'Saving...' : 'Record Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
