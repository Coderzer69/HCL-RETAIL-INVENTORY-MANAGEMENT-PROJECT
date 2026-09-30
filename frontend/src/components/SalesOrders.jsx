import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, CheckCircle, Clock, XCircle, Calendar, Plus,
  Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, 
  Package, MapPin, CreditCard, Download, Eye, FileText, X
} from 'lucide-react';
import { api } from '../services/api';

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('All Orders');
  const [activeOrderTab, setActiveOrderTab] = useState('Items');
  
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [shipFormData, setShipFormData] = useState({ trackingNumber: '', carrier: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [createFormData, setCreateFormData] = useState({ shippingAddress: '', items: [{ productId: '', quantity: 1 }] });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      const data = res.data || [];
      setOrders(data);
      if (data.length > 0) {
        setSelectedOrder(prev => prev ? data.find(o => o.id === prev.id) || data[0] : data[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
  const totalRevenue = orders
    .filter(o => !['CANCELLED', 'RETURNED'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const getTabCount = (statusName) => {
    if (statusName === 'All Orders') return totalOrders;
    if (statusName === 'Pending') return orders.filter(o => o.status === 'PENDING').length;
    if (statusName === 'Processing') return orders.filter(o => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
    if (statusName === 'Shipped') return orders.filter(o => o.status === 'SHIPPED').length;
    if (statusName === 'Completed') return orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
    if (statusName === 'Cancelled') return orders.filter(o => o.status === 'CANCELLED').length;
    return 0;
  };

  const filteredOrders = orders.filter(o => {
    let matchTab = true;
    if (activeTab === 'Pending') matchTab = o.status === 'PENDING';
    if (activeTab === 'Processing') matchTab = o.status === 'PROCESSING' || o.status === 'CONFIRMED';
    if (activeTab === 'Shipped') matchTab = o.status === 'SHIPPED';
    if (activeTab === 'Completed') matchTab = o.status === 'DELIVERED' || o.status === 'COMPLETED';
    if (activeTab === 'Cancelled') matchTab = o.status === 'CANCELLED';

    let matchSearch = true;
    if (search) {
      const s = search.toLowerCase();
      matchSearch = o.orderNumber?.toLowerCase().includes(s) || 
                    o.customer?.firstName?.toLowerCase().includes(s) ||
                    o.customer?.lastName?.toLowerCase().includes(s);
    }
    return matchTab && matchSearch;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'DELIVERED':
      case 'COMPLETED': return { bg: '#d1fae5', color: '#10b981' };
      case 'PENDING': return { bg: '#fef3c7', color: '#f59e0b' };
      case 'CONFIRMED': return { bg: '#e0e7ff', color: '#4f46e5' };
      case 'PROCESSING': return { bg: '#dbeafe', color: '#3b82f6' };
      case 'SHIPPED': return { bg: '#ede9fe', color: '#8b5cf6' };
      case 'CANCELLED':
      case 'RETURNED': return { bg: '#fee2e2', color: '#ef4444' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setActionLoading(true);
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post(`/orders/${selectedOrder.id}/shipments`, shipFormData);
      setIsShipModalOpen(false);
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to create shipment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      const items = createFormData.items.filter(i => i.productId && i.quantity > 0);
      if (items.length === 0) throw new Error('Add at least one valid item');
      
      await api.post('/orders', {
        shippingAddress: createFormData.shippingAddress,
        items: items.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity, 10) }))
      });
      setIsCreateModalOpen(false);
      await fetchOrders();
    } catch (err) {
      setCreateError(err.message || 'Failed to create order (Note: Requires CUSTOMER role in this phase)');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="dashboard-scroll-area relative">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Sales Orders</h2>
          <p className="text-muted text-sm">Manage customer orders, track fulfillment, and monitor revenue</p>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 sm:mt-0">
          <div className="select-input">
            <Calendar size={16} className="text-muted" />
            <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
              <option>Last 30 Days</option>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginTop: 0 }}>
            <Plus size={16} /> Create Order
          </button>
        </div>
      </div>

      <div className="dashboard-grid-4">
        <div className="card">
          <div className="card-header">
            <div className="icon-rounded icon-primary-bg">
              <ShoppingCart size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Total Orders</p>
          <div className="kpi-value">
            {totalOrders}
            <span className="trend-badge trend-up">↑ 12%</span>
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
          <p className="text-sm font-semibold text-muted">Pending Fulfillment</p>
          <div className="kpi-value">
            {pendingOrders}
            <span className="trend-badge trend-down" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>↓ 5%</span>
          </div>
          <p className="text-xs text-muted">Awaiting processing</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
              <CheckCircle size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Completed Orders</p>
          <div className="kpi-value">
            {completedOrders}
            <span className="trend-badge trend-up">↑ 15%</span>
          </div>
          <p className="text-xs text-muted">Successfully delivered</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
              <CreditCard size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Total Revenue</p>
          <div className="kpi-value">
            ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="trend-badge trend-up">↑ 22%</span>
          </div>
          <p className="text-xs text-muted">In the selected period</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 pb-2" style={{ borderBottom: '1px solid var(--color-border)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['All Orders', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'].map(tab => (
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
              cursor: 'pointer',
              background: 'none'
            }}
          >
            {tab}
            <span style={{ 
              backgroundColor: activeTab === tab ? 'var(--color-primary-faded)' : '#f1f5f9',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              padding: '0.1rem 0.4rem',
              borderRadius: '1rem',
              fontSize: '0.7rem'
            }}>
              {getTabCount(tab)}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="search-bar" style={{ flex: '1 1 250px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by order ID, customer name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="select-input">
          <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
            <option>Payment Status</option>
            <option>Paid</option>
            <option>Pending</option>
          </select>
        </div>
        <button className="select-input" style={{ cursor: 'pointer' }}>
          <Filter size={16} /> Filters
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading orders...</div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders found.</div>
      ) : (
        <div className="dashboard-grid-2">
          {/* Left Column: Orders List */}
          <div className="card flex flex-col" style={{ padding: 0, gridColumn: 'span 1' }}>
            <div className="card-header" style={{ padding: '1.5rem 1.5rem 0', marginBottom: '1rem' }}>
              <h3 className="card-title"><ShoppingCart size={18} className="text-primary" /> Orders List</h3>
              <button className="select-input" style={{ cursor: 'pointer', color: 'var(--color-primary)', border: '1px solid var(--color-primary-faded)', padding: '0.25rem 0.75rem' }}>
                <Download size={14} /> Export
              </button>
            </div>
            
            <div className="table-container" style={{ flex: 1 }}>
              <table>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}><input type="checkbox" /></th>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    const stStyle = getStatusStyle(order.status);
                    const dateStr = new Date(order.createdAt).toLocaleDateString();
                    return (
                      <tr 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        style={{ 
                          borderBottom: '1px solid var(--color-border)', 
                          cursor: 'pointer', 
                          backgroundColor: isSelected ? '#f8fafc' : 'transparent' 
                        }}
                      >
                        <td style={{ textAlign: 'center' }}><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                        <td className="font-medium text-primary text-sm">{order.orderNumber}</td>
                        <td className="text-muted text-sm">{dateStr}</td>
                        <td className="font-medium text-sm">{order.customer?.firstName} {order.customer?.lastName}</td>
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
              <div className="text-sm text-muted">Showing {filteredOrders.length} orders</div>
              <div className="flex items-center gap-1 flex-wrap">
                <button style={{ padding: '0.25rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}><ChevronLeft size={16} /></button>
                <button style={{ width: '30px', height: '30px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>1</button>
                <button style={{ padding: '0.25rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Detail */}
          {selectedOrder && (
            <div className="card flex flex-col" style={{ padding: 0 }}>
              <div style={{ padding: '1.5rem 1.5rem 0' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-lg flex items-center gap-2 mb-1">
                      {selectedOrder.orderNumber}
                      <span className="badge" style={{ backgroundColor: getStatusStyle(selectedOrder.status).bg, color: getStatusStyle(selectedOrder.status).color, fontSize: '0.7rem' }}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="select-input" style={{ padding: '0.4rem', cursor: 'pointer' }}><FileText size={16} /></button>
                  </div>
                </div>

                <div className="flex gap-4 mb-4 overflow-x-auto whitespace-nowrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Items', 'Customer Info', 'Shipping'].map(tab => (
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
                            <th style={{ paddingBottom: '0.5rem', fontWeight: '500' }}>Product</th>
                            <th style={{ paddingBottom: '0.5rem', fontWeight: '500' }}>Qty</th>
                            <th style={{ paddingBottom: '0.5rem', fontWeight: '500' }}>Price</th>
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
                              <td style={{ padding: '0.75rem 0' }}>{item.quantity}</td>
                              <td style={{ padding: '0.75rem 0' }}>₹{Number(item.unitPrice).toLocaleString()}</td>
                              <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: '500' }}>
                                ₹{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col gap-2 mt-4" style={{ width: '100%', marginLeft: 'auto', maxWidth: '250px' }}>
                      <div className="flex justify-between text-base font-bold mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <span>Total</span>
                        <span className="text-primary">₹{Number(selectedOrder.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeOrderTab === 'Customer Info' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                        {selectedOrder.customer?.firstName?.[0]}{selectedOrder.customer?.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</h3>
                        <p className="text-sm text-muted">Customer</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <div className="text-xs text-muted mb-1">Email Address</div>
                        <div className="font-medium text-sm text-primary">{selectedOrder.customer?.email}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeOrderTab === 'Shipping' && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><MapPin size={16} className="text-muted" /> Shipping Address</h4>
                      <div className="text-sm" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
                        <span style={{ whiteSpace: 'pre-line' }}>{selectedOrder.shippingAddress}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', backgroundColor: '#f8fafc', display: 'flex', gap: '1rem' }}>
                 {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(selectedOrder.status) && (
                   <button 
                     disabled={actionLoading}
                     onClick={() => updateStatus(selectedOrder.id, 'CANCELLED')}
                     className="btn-primary" 
                     style={{ flex: 1, marginTop: 0, backgroundColor: 'white', color: 'var(--color-text)', border: '1px solid var(--color-border)', opacity: actionLoading ? 0.7 : 1 }}
                   >
                     Decline / Cancel
                   </button>
                 )}
                 
                 {selectedOrder.status === 'PENDING' && (
                   <button onClick={() => updateStatus(selectedOrder.id, 'CONFIRMED')} disabled={actionLoading} className="btn-primary" style={{ flex: 2, marginTop: 0, opacity: actionLoading ? 0.7 : 1 }}>Confirm Order</button>
                 )}
                 {selectedOrder.status === 'CONFIRMED' && (
                   <button onClick={() => updateStatus(selectedOrder.id, 'PROCESSING')} disabled={actionLoading} className="btn-primary" style={{ flex: 2, marginTop: 0, opacity: actionLoading ? 0.7 : 1 }}>Process Order</button>
                 )}
                 {selectedOrder.status === 'PROCESSING' && (
                   <button onClick={() => setIsShipModalOpen(true)} disabled={actionLoading} className="btn-primary" style={{ flex: 2, marginTop: 0, opacity: actionLoading ? 0.7 : 1 }}>Ship Order</button>
                 )}
                 {selectedOrder.status === 'SHIPPED' && (
                   <button onClick={() => updateStatus(selectedOrder.id, 'DELIVERED')} disabled={actionLoading} className="btn-primary" style={{ flex: 2, marginTop: 0, opacity: actionLoading ? 0.7 : 1 }}>Mark Delivered</button>
                 )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ship Order Modal */}
      {isShipModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', margin: '1rem' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Ship Order</h3>
              <button onClick={() => setIsShipModalOpen(false)} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleShipSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Tracking Number</label>
                <input required type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={shipFormData.trackingNumber} onChange={e => setShipFormData({...shipFormData, trackingNumber: e.target.value})} placeholder="e.g. TRK-123456789" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Carrier / Courier</label>
                <input required type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={shipFormData.carrier} onChange={e => setShipFormData({...shipFormData, carrier: e.target.value})} placeholder="e.g. FedEx, BlueDart" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsShipModalOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn-primary" style={{ marginTop: 0, padding: '0.5rem 1rem', opacity: actionLoading ? 0.7 : 1, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  Confirm Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Create Order</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {createError && <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>{createError}</div>}
            <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Shipping Address *</label>
                <textarea required rows="3" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={createFormData.shippingAddress} onChange={e => setCreateFormData({...createFormData, shippingAddress: e.target.value})} placeholder="Full address..."></textarea>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>Order Items *</label>
                  <button type="button" onClick={() => setCreateFormData({...createFormData, items: [...createFormData.items, { productId: '', quantity: 1 }]})} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Item</button>
                </div>
                {createFormData.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div className="select-input" style={{ flex: 1, margin: 0, padding: 0 }}>
                      <select required style={{ width: '100%', padding: '0.75rem', border: 'none', background: 'transparent', outline: 'none' }} value={item.productId} onChange={e => {
                        const newItems = [...createFormData.items];
                        newItems[index].productId = e.target.value;
                        setCreateFormData({...createFormData, items: newItems});
                      }}>
                        <option value="">Select Product...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.basePrice})</option>)}
                      </select>
                    </div>
                    <input required type="number" min="1" style={{ width: '80px', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={item.quantity} onChange={e => {
                      const newItems = [...createFormData.items];
                      newItems[index].quantity = e.target.value;
                      setCreateFormData({...createFormData, items: newItems});
                    }} />
                    {createFormData.items.length > 1 && (
                      <button type="button" onClick={() => {
                        const newItems = createFormData.items.filter((_, i) => i !== index);
                        setCreateFormData({...createFormData, items: newItems});
                      }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                    )}
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={createLoading} className="btn-primary" style={{ marginTop: 0, padding: '0.5rem 1rem', opacity: createLoading ? 0.7 : 1, cursor: createLoading ? 'not-allowed' : 'pointer' }}>
                  {createLoading ? 'Submitting...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
