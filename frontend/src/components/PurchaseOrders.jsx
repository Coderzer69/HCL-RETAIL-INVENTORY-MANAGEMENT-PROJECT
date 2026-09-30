import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, Clock, XCircle, Calendar, Plus,
  Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, 
  Package, MapPin, Building, Download, Upload, AlertCircle, X
} from 'lucide-react';
import { api } from '../services/api';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('All POs');
  const [activeOrderTab, setActiveOrderTab] = useState('Items');
  
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({ supplierId: '', destinationWarehouseId: '', items: [{ productId: '', quantityOrdered: 1 }] });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/procurement');
      const data = res.data || [];
      setOrders(data);
      if (data.length > 0) {
        setSelectedOrder(prev => prev ? data.find(o => o.id === prev.id) || data[0] : data[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [supRes, whRes, prRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/warehouses'),
        api.get('/products?limit=1000')
      ]);
      setSuppliers(supRes.data || []);
      setWarehouses(whRes.data || []);
      setProducts(prRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dependencies', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'SUBMITTED' || o.status === 'DRAFT').length;
  const receivedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'PARTIAL').length;
  const totalSpend = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const filteredOrders = orders.filter(o => {
    let matchTab = true;
    if (activeTab === 'Draft') matchTab = o.status === 'DRAFT';
    if (activeTab === 'Pending') matchTab = o.status === 'SUBMITTED';
    if (activeTab === 'Partially Received') matchTab = o.status === 'PARTIAL';
    if (activeTab === 'Completed') matchTab = o.status === 'COMPLETED';
    if (activeTab === 'Cancelled') matchTab = o.status === 'CANCELLED';

    let matchSearch = true;
    if (search) {
      const s = search.toLowerCase();
      matchSearch = o.poNumber?.toLowerCase().includes(s) || 
                    o.supplier?.companyName?.toLowerCase().includes(s);
    }
    return matchTab && matchSearch;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'COMPLETED': return { bg: '#d1fae5', color: '#10b981' };
      case 'PARTIAL': return { bg: '#dbeafe', color: '#3b82f6' };
      case 'SUBMITTED': return { bg: '#fef3c7', color: '#f59e0b' };
      case 'CANCELLED': return { bg: '#fee2e2', color: '#ef4444' };
      default: return { bg: '#f1f5f9', color: '#64748b' }; // DRAFT
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const items = formData.items.filter(i => i.productId && i.quantityOrdered > 0);
      if (items.length === 0) throw new Error('Add at least one valid item');
      
      await api.post('/procurement', {
        supplierId: formData.supplierId,
        destinationWarehouseId: formData.destinationWarehouseId,
        items: items.map(i => ({ productId: i.productId, quantityOrdered: parseInt(i.quantityOrdered, 10) }))
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to create PO (Ensure products are linked to the supplier)');
    } finally {
      setFormLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(true);
      await api.patch(`/procurement/${id}/status`, { status });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update PO');
    } finally {
      setActionLoading(false);
    }
  };

  const receiveGoods = async () => {
    try {
      setActionLoading(true);
      // Auto-receive all remaining quantities for demo
      const itemsToReceive = selectedOrder.items.map(i => ({
        productId: i.productId,
        quantityReceived: i.quantityOrdered - i.quantityReceived
      })).filter(i => i.quantityReceived > 0);

      if (itemsToReceive.length === 0) return;

      await api.post(`/procurement/${selectedOrder.id}/receive`, { items: itemsToReceive });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to receive goods');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-scroll-area relative">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Purchase Orders</h2>
          <p className="text-muted text-sm">Manage supplier orders, track incoming inventory, and monitor spending</p>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 sm:mt-0">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginTop: 0 }}>
            <Plus size={16} /> Create PO
          </button>
        </div>
      </div>

      <div className="dashboard-grid-4">
        <div className="card">
          <div className="card-header">
            <div className="icon-rounded icon-primary-bg">
              <FileText size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Total POs</p>
          <div className="kpi-value">
            {totalOrders}
            <span className="trend-badge trend-up">↑ 8%</span>
          </div>
          <p className="text-xs text-muted">Overall volume</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
              <Clock size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Pending Orders</p>
          <div className="kpi-value">
            {pendingOrders}
            <span className="trend-badge trend-down" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>↓ 2%</span>
          </div>
          <p className="text-xs text-muted">Awaiting delivery</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
              <Package size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Received Orders</p>
          <div className="kpi-value">
            {receivedOrders}
            <span className="trend-badge trend-up">↑ 15%</span>
          </div>
          <p className="text-xs text-muted">Fully or partially fulfilled</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
              <Building size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Total Spend</p>
          <div className="kpi-value">
            ₹{totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="trend-badge trend-up">↑ 11%</span>
          </div>
          <p className="text-xs text-muted">In the selected period</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 pb-2" style={{ borderBottom: '1px solid var(--color-border)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['All POs', 'Draft', 'Pending', 'Partially Received', 'Completed', 'Cancelled'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '0.75rem 0', 
              fontSize: '0.875rem',
              fontWeight: activeTab === tab ? '600' : '500',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="search-bar" style={{ flex: '1 1 250px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by PO number or supplier..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading POs...</div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No POs found.</div>
      ) : (
        <div className="dashboard-grid-2">
          {/* Left Column: POs List */}
          <div className="card flex flex-col" style={{ padding: 0, gridColumn: 'span 1' }}>
            <div className="card-header" style={{ padding: '1.5rem 1.5rem 0', marginBottom: '1rem' }}>
              <h3 className="card-title"><FileText size={18} className="text-primary" /> Purchase Orders List</h3>
              <button className="select-input" style={{ cursor: 'pointer', color: 'var(--color-primary)', border: '1px solid var(--color-primary-faded)', padding: '0.25rem 0.75rem' }}>
                <Download size={14} /> Export
              </button>
            </div>
            
            <div className="table-container" style={{ flex: 1 }}>
              <table>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}><input type="checkbox" /></th>
                    <th>PO Number</th>
                    <th>Date</th>
                    <th>Supplier</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    const stStyle = getStatusStyle(order.status);
                    return (
                      <tr 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer', backgroundColor: isSelected ? '#f8fafc' : 'transparent' }}
                      >
                        <td style={{ textAlign: 'center' }}><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                        <td className="font-medium text-primary text-sm">{order.poNumber}</td>
                        <td className="text-muted text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="font-medium text-sm">{order.supplier?.companyName}</td>
                        <td className="font-semibold text-sm">₹{Number(order.totalAmount).toLocaleString()}</td>
                        <td>
                          <span className="badge" style={{ backgroundColor: stStyle.bg, color: stStyle.color }}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center flex-wrap gap-4" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <div className="text-sm text-muted">Showing {filteredOrders.length} POs</div>
            </div>
          </div>

          {/* Right Column: PO Detail */}
          {selectedOrder && (
            <div className="card flex flex-col" style={{ padding: 0 }}>
              <div style={{ padding: '1.5rem 1.5rem 0' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-lg flex items-center gap-2 mb-1">
                      {selectedOrder.poNumber}
                      <span className="badge" style={{ backgroundColor: getStatusStyle(selectedOrder.status).bg, color: getStatusStyle(selectedOrder.status).color, fontSize: '0.7rem' }}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted">Created on {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex gap-4 mb-4 overflow-x-auto whitespace-nowrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Items', 'Supplier Info', 'Delivery Details'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveOrderTab(tab)}
                      style={{ 
                        padding: '0.5rem 0', 
                        fontSize: '0.875rem',
                        fontWeight: activeOrderTab === tab ? '600' : '500',
                        color: activeOrderTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        borderBottom: activeOrderTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '0 1.5rem 1.5rem', flex: 1, overflowY: 'auto' }}>
                {activeOrderTab === 'Items' && (
                  <div className="flex flex-col gap-4">
                    <div className="table-container">
                      <table style={{ width: '100%', fontSize: '0.875rem' }}>
                        <thead style={{ color: 'var(--color-text-muted)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                          <tr>
                            <th style={{ paddingBottom: '0.5rem', fontWeight: '500' }}>Item Description</th>
                            <th style={{ paddingBottom: '0.5rem', fontWeight: '500' }}>Ordered</th>
                            <th style={{ paddingBottom: '0.5rem', fontWeight: '500' }}>Received</th>
                            <th style={{ paddingBottom: '0.5rem', fontWeight: '500' }}>Unit Price</th>
                            <th style={{ paddingBottom: '0.5rem', fontWeight: '500', textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items?.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '0.75rem 0' }}>
                                <div className="font-medium">{item.product?.name}</div>
                                <div className="text-xs text-muted">SKU: {item.product?.sku}</div>
                              </td>
                              <td style={{ padding: '0.75rem 0' }}>{item.quantityOrdered}</td>
                              <td style={{ padding: '0.75rem 0' }} className={item.quantityReceived < item.quantityOrdered ? "text-warning" : "text-success"}>
                                {item.quantityReceived}
                              </td>
                              <td style={{ padding: '0.75rem 0' }}>₹{Number(item.unitCost).toLocaleString()}</td>
                              <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: '500' }}>
                                ₹{(Number(item.unitCost) * item.quantityOrdered).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col gap-2 mt-4" style={{ width: '100%', marginLeft: 'auto', maxWidth: '250px' }}>
                      <div className="flex justify-between text-base font-bold mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <span>Total Cost</span>
                        <span className="text-primary">₹{Number(selectedOrder.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeOrderTab === 'Supplier Info' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem', backgroundColor: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                        {selectedOrder.supplier?.companyName?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{selectedOrder.supplier?.companyName}</h3>
                        <p className="text-sm text-muted">Supplier</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeOrderTab === 'Delivery Details' && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><MapPin size={16} className="text-muted" /> Destination Warehouse</h4>
                      <div className="text-sm" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
                        <div className="font-medium mb-1">{selectedOrder.destinationWarehouse?.name}</div>
                        <div className="text-muted mb-1">{selectedOrder.destinationWarehouse?.address}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', backgroundColor: '#f8fafc', display: 'flex', gap: '1rem' }}>
                 {selectedOrder.status === 'DRAFT' && (
                   <>
                    <button onClick={() => updateStatus(selectedOrder.id, 'CANCELLED')} disabled={actionLoading} className="btn-primary" style={{ flex: 1, marginTop: 0, backgroundColor: 'white', color: 'var(--color-text)', border: '1px solid var(--color-border)', opacity: actionLoading ? 0.7 : 1 }}>Cancel PO</button>
                    <button onClick={() => updateStatus(selectedOrder.id, 'SUBMITTED')} disabled={actionLoading} className="btn-primary" style={{ flex: 2, marginTop: 0, opacity: actionLoading ? 0.7 : 1 }}>Submit to Supplier</button>
                   </>
                 )}
                 {['SUBMITTED', 'PARTIAL'].includes(selectedOrder.status) && (
                   <button onClick={receiveGoods} disabled={actionLoading} className="btn-primary" style={{ flex: 1, marginTop: 0, backgroundColor: '#10b981', opacity: actionLoading ? 0.7 : 1 }}>Mark as Received</button>
                 )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create PO Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Create Purchase Order</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>{formError}</div>}
            
            <form onSubmit={handleCreatePO} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Supplier *</label>
                <div className="select-input" style={{ width: '100%', margin: 0, padding: 0 }}>
                  <select required style={{ width: '100%', padding: '0.75rem', border: 'none', background: 'transparent', outline: 'none' }} value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                    <option value="">Select Supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Destination Warehouse *</label>
                <div className="select-input" style={{ width: '100%', margin: 0, padding: 0 }}>
                  <select required style={{ width: '100%', padding: '0.75rem', border: 'none', background: 'transparent', outline: 'none' }} value={formData.destinationWarehouseId} onChange={e => setFormData({...formData, destinationWarehouseId: e.target.value})}>
                    <option value="">Select Warehouse...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Order Items *</label>
                  <button type="button" onClick={() => setFormData({...formData, items: [...formData.items, { productId: '', quantityOrdered: 1 }]})} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Item</button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div className="select-input" style={{ flex: 1, margin: 0, padding: 0 }}>
                      <select required style={{ width: '100%', padding: '0.75rem', border: 'none', background: 'transparent', outline: 'none' }} value={item.productId} onChange={e => {
                        const newItems = [...formData.items];
                        newItems[index].productId = e.target.value;
                        setFormData({...formData, items: newItems});
                      }}>
                        <option value="">Select Product...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
                      </select>
                    </div>
                    <input required type="number" min="1" style={{ width: '80px', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={item.quantityOrdered} onChange={e => {
                      const newItems = [...formData.items];
                      newItems[index].quantityOrdered = e.target.value;
                      setFormData({...formData, items: newItems});
                    }} />
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => {
                        const newItems = formData.items.filter((_, i) => i !== index);
                        setFormData({...formData, items: newItems});
                      }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                    )}
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary" style={{ marginTop: 0, padding: '0.5rem 1rem', opacity: formLoading ? 0.7 : 1, cursor: formLoading ? 'not-allowed' : 'pointer' }}>
                  {formLoading ? 'Submitting...' : 'Create PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
