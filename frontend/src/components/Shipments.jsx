import React, { useState, useEffect } from 'react';
import {
  Truck, Plane, CheckCircle, AlertTriangle, Calendar, Building, Plus,
  Search, Filter, MapPin, Package, FileText, Download,
  MoreHorizontal, ChevronLeft, ChevronRight, Clock, Truck as TruckIcon
} from 'lucide-react';
import { api } from '../services/api';

export default function Shipments() {
  const [activeTab, setActiveTab] = useState('All Shipments');
  const [activeTrackingTab, setActiveTrackingTab] = useState('Tracking');
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);

  useEffect(() => {
    fetchShipments();
  }, []);

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Pending', 'SHIPPED': 'Shipped', 'IN_TRANSIT': 'In Transit',
      'OUT_FOR_DELIVERY': 'Out for Delivery', 'DELIVERED': 'Delivered',
      'DELAYED': 'Delayed', 'CANCELLED': 'Cancelled', 'FAILED': 'Failed'
    };
    return labels[status] || status;
  };

  const getStatusColors = (status) => {
    switch (status) {
      case 'DELIVERED': return { statusColor: '#10b981', statusBg: '#d1fae5' };
      case 'IN_TRANSIT': 
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY': return { statusColor: '#3b82f6', statusBg: '#dbeafe' };
      case 'DELAYED': 
      case 'FAILED':
      case 'CANCELLED': return { statusColor: '#ef4444', statusBg: '#fee2e2' };
      case 'PENDING': return { statusColor: '#f59e0b', statusBg: '#fef3c7' };
      default: return { statusColor: '#64748b', statusBg: '#f1f5f9' };
    }
  };

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/shipments');
      if (res?.data) {
        const formatted = res.data.map(sh => {
          let itemsCount = 0;
          if (sh.salesOrder && sh.salesOrder.items) itemsCount = sh.salesOrder.items.reduce((s, i) => s + i.quantity, 0);
          if (sh.purchaseOrder && sh.purchaseOrder.items) itemsCount = sh.purchaseOrder.items.reduce((s, i) => s + i.quantity, 0);
          
          let supplierName = 'Unknown';
          if (sh.type === 'OUTBOUND' && sh.salesOrder?.customer) {
            supplierName = `${sh.salesOrder.customer.firstName || ''} ${sh.salesOrder.customer.lastName || ''}`.trim();
          } else if (sh.type === 'INBOUND' && sh.purchaseOrder?.supplier) {
            supplierName = sh.purchaseOrder.supplier.name;
          }

          return {
            ...sh,
            displayId: sh.shipmentNumber || sh.id.substring(0, 8),
            typeDisplay: sh.type === 'OUTBOUND' ? 'Outbound' : 'Inbound',
            order: sh.salesOrder?.orderNumber || sh.purchaseOrder?.orderNumber || '-',
            supplier: supplierName || '-',
            route: `${sh.originAddress || 'Origin'} → ${sh.destinationAddress || 'Destination'}`,
            items: itemsCount,
            statusDisplay: getStatusLabel(sh.status),
            eta: sh.estimatedDeliveryDate ? new Date(sh.estimatedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-',
            ...getStatusColors(sh.status),
            events: sh.events || []
          };
        });
        setShipments(formatted);
        if (formatted.length > 0) {
          setSelectedShipment(formatted[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const inTransitCount = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'SHIPPED').length;
  const deliveredCount = shipments.filter(s => s.status === 'DELIVERED').length;
  const delayedCount = shipments.filter(s => s.status === 'DELAYED').length;
  const totalShipmentsCount = shipments.length;
  const outboundCount = shipments.filter(s => s.type === 'OUTBOUND').length;
  const inboundCount = shipments.filter(s => s.type === 'INBOUND').length;
  const cancelledCount = shipments.filter(s => s.status === 'CANCELLED').length;
  
  const activeShipments = [
    { label: 'In Transit', value: inTransitCount, icon: <Plane size={16} className="text-primary" /> },
    { label: 'Out for Delivery', value: shipments.filter(s => s.status === 'OUT_FOR_DELIVERY').length, icon: <Truck size={16} className="text-blue-500" /> },
    { label: 'At Origin', value: shipments.filter(s => s.status === 'PENDING').length, icon: <Package size={16} className="text-orange-500" /> },
    { label: 'At Destination', value: deliveredCount, icon: <MapPin size={16} className="text-red-500" /> },
  ];

  return (
    <div className="dashboard-scroll-area">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Shipments</h2>
          <p className="text-muted text-sm">Track and manage incoming and outgoing shipments across all warehouses</p>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 sm:mt-0">
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
          <div className="card-header">
            <div className="icon-rounded icon-primary-bg">
              <Truck size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Total Shipments</p>
          <div className="kpi-value">
            {totalShipmentsCount}
            <span className="trend-badge trend-up">↑ 18%</span>
          </div>
          <p className="text-xs text-muted">+44 from last month</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
              <Plane size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">In Transit</p>
          <div className="kpi-value">
            {inTransitCount}
            <span className="trend-badge trend-up">↑ 25%</span>
          </div>
          <p className="text-xs text-muted">25% of total shipments</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
              <CheckCircle size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Delivered</p>
          <div className="kpi-value">
            {deliveredCount}
            <span className="trend-badge trend-up">↑ 20%</span>
          </div>
          <p className="text-xs text-muted">69% delivery rate</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Delayed</p>
          <div className="kpi-value">
            {delayedCount}
            <span className="trend-badge" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>↑ 12%</span>
          </div>
          <p className="text-xs text-muted">6% of total shipments</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 pb-2" style={{ borderBottom: '1px solid var(--color-border)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {[
          { name: 'All Shipments', count: totalShipmentsCount },
          { name: 'Outgoing', count: outboundCount },
          { name: 'Incoming', count: inboundCount },
          { name: 'In Transit', count: inTransitCount },
          { name: 'Delivered', count: deliveredCount },
          { name: 'Delayed', count: delayedCount },
          { name: 'Cancelled', count: cancelledCount }
        ].map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            style={{
              padding: '0.75rem 0',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.name ? '600' : '500',
              color: activeTab === tab.name ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === tab.name ? '2px solid var(--color-primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.name}
            <span style={{
              backgroundColor: activeTab === tab.name ? 'var(--color-primary-faded)' : '#f1f5f9',
              color: activeTab === tab.name ? 'var(--color-primary)' : 'var(--color-text-muted)',
              padding: '0.1rem 0.4rem',
              borderRadius: '1rem',
              fontSize: '0.7rem'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="search-bar" style={{ flex: '1 1 300px' }}>
          <Search size={16} />
          <input type="text" placeholder="Search by shipment ID, order ID, supplier, or tracking number..." />
        </div>
        <div className="select-input">
          <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
            <option>All Types</option>
            <option>Outbound</option>
            <option>Inbound</option>
          </select>
        </div>
        <div className="select-input">
          <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
            <option>All Statuses</option>
            <option>In Transit</option>
            <option>Delivered</option>
          </select>
        </div>
        <div className="select-input">
          <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
            <option>All Warehouses</option>
          </select>
        </div>
        <button className="select-input" style={{ cursor: 'pointer' }}>
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="dashboard-grid-2">
        <div className="flex flex-col gap-6" style={{ gridColumn: 'span 1' }}>
          {/* Map and Active Shipments Summary */}
          <div className="card flex flex-wrap gap-4" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ flex: '1 1 300px', backgroundColor: '#f8fafc', position: 'relative', minHeight: '250px' }}>
              {/* Dummy Map Area */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.6 }}>
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <rect width="20" height="20" fill="none" />
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '0.7rem', color: '#94a3b8' }}>Ahmedabad</div>
              <div style={{ position: 'absolute', top: '30%', left: '50%', fontSize: '0.7rem', color: '#94a3b8' }}>Bhopal</div>
              <div style={{ position: 'absolute', top: '15%', left: '70%', fontSize: '0.7rem', color: '#94a3b8' }}>Lucknow</div>
              <div style={{ position: 'absolute', top: '60%', left: '60%', fontSize: '0.7rem', color: '#94a3b8' }}>Nagpur</div>
              <div style={{ position: 'absolute', top: '80%', left: '65%', fontSize: '0.7rem', color: '#94a3b8' }}>Hyderabad</div>

              <div style={{ position: 'absolute', top: '20%', left: '40%', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} className="text-primary" /> <span className="text-xs font-semibold">Delhi</span>
              </div>
              <div style={{ position: 'absolute', bottom: '20%', left: '20%', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} className="text-primary" /> <span className="text-xs font-semibold">Mumbai</span>
              </div>

              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <path d="M 150 60 Q 140 120 80 180" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="5,5" />
              </svg>

              <div style={{ position: 'absolute', top: '50%', left: '35%', transform: 'translate(-50%, -50%)', backgroundColor: '#1e293b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TruckIcon size={10} /> IN TRANSIT
                </div>
                <div style={{ textAlign: 'center', color: '#cbd5e1' }}>2 days left</div>
              </div>
            </div>
            <div style={{ flex: '1 1 200px', padding: '1.5rem', borderLeft: '1px solid var(--color-border)' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm">Active Shipments</h3>
                <a href="#" className="card-action" style={{ fontSize: '0.75rem' }}>View All</a>
              </div>
              <div className="flex flex-col gap-4">
                {activeShipments.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <span className="font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipments List */}
          <div className="card" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '1.5rem 1.5rem 0', marginBottom: '1rem' }}>
              <h3 className="card-title"><FileText size={18} className="text-primary" /> Shipments List</h3>
              <button className="select-input" style={{ cursor: 'pointer', color: 'var(--color-primary)', border: '1px solid var(--color-primary-faded)', padding: '0.25rem 0.75rem' }}>
                <Download size={14} /> Export
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}><input type="checkbox" /></th>
                    <th>Shipment ID</th>
                    <th>Type</th>
                    <th>Related Order/PO</th>
                    <th>Supplier / Customer</th>
                    <th>Origin → Destination</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>ETA</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Loading shipments...</td>
                    </tr>
                  ) : shipments.map((shipment, idx) => (
                    <tr key={idx} onClick={() => setSelectedShipment(shipment)} style={{ cursor: 'pointer', backgroundColor: selectedShipment?.id === shipment.id ? '#f1f5f9' : 'transparent', borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                      <td className="font-medium text-primary text-sm">{shipment.displayId}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: shipment.type === 'OUTBOUND' ? '#dbeafe' : '#d1fae5', color: shipment.type === 'OUTBOUND' ? '#3b82f6' : '#10b981' }}>
                          {shipment.typeDisplay}
                        </span>
                      </td>
                      <td className="text-sm">{shipment.order}</td>
                      <td className="text-sm">{shipment.supplier}</td>
                      <td className="text-muted text-xs">{shipment.route}</td>
                      <td className="text-sm">{shipment.items}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: shipment.statusBg, color: shipment.statusColor }}>
                          {shipment.statusDisplay}
                        </span>
                      </td>
                      <td className="text-muted text-xs">{shipment.eta}</td>
                      <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <button style={{ color: 'var(--color-text-muted)' }}><MoreHorizontal size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-4" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <div className="text-sm text-muted">Showing {shipments.length} shipments</div>
              <div className="flex items-center gap-1 flex-wrap">
                <button style={{ padding: '0.25rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}><ChevronLeft size={16} /></button>
                <button style={{ width: '30px', height: '30px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>1</button>
                <button style={{ width: '30px', height: '30px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>2</button>
                <button style={{ width: '30px', height: '30px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>3</button>
                <button style={{ width: '30px', height: '30px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>4</button>
                <button style={{ width: '30px', height: '30px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>5</button>
                <span className="text-muted mx-1">...</span>
                <button style={{ width: '30px', height: '30px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>36</button>
                <button style={{ padding: '0.25rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shipment Detail */}
        <div className="card flex flex-col" style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem 1.5rem 0' }}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="icon-rounded icon-primary-bg" style={{ width: '32px', height: '32px' }}>
                  <TruckIcon size={16} />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {selectedShipment?.displayId || 'Select a shipment'}
                    {selectedShipment && (
                      <span className="badge" style={{ backgroundColor: selectedShipment.statusBg, color: selectedShipment.statusColor }}>
                        {selectedShipment.statusDisplay}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button style={{ color: 'var(--color-text-muted)' }}><MoreHorizontal size={16} /></button>
            </div>
            {selectedShipment && (
              <div className="text-xs text-muted mb-4">
                Order: {selectedShipment.order} | Supplier: {selectedShipment.supplier}
              </div>
            )}

            <div className="flex gap-4 overflow-x-auto" style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Tracking', 'Details', 'Items', 'Documents'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTrackingTab(tab)}
                  style={{
                    padding: '0.5rem 0',
                    fontSize: '0.875rem',
                    fontWeight: activeTrackingTab === tab ? '600' : '500',
                    color: activeTrackingTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    borderBottom: activeTrackingTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
            {activeTrackingTab === 'Tracking' && (
              <div className="relative">
                {/* Timeline line */}
                <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--color-primary)', opacity: 0.5 }}></div>

                {selectedShipment?.events?.length > 0 ? selectedShipment.events.map((evt, idx) => (
                  <div key={idx} className="flex gap-4 mb-6 relative z-10">
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'white', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: idx === 0 ? 'var(--color-primary)' : 'transparent' }}></div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{getStatusLabel(evt.status)}</div>
                      <div className="text-xs text-muted">{new Date(evt.timestamp).toLocaleString()}</div>
                      <div className="text-xs text-muted mt-1">{evt.location || evt.description || '-'}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-muted p-4">No tracking events recorded yet.</div>
                )}
              </div>
            )}
          </div>

          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center gap-3">
              <div className="icon-rounded icon-primary-bg" style={{ width: '32px', height: '32px' }}>
                <TruckIcon size={16} />
              </div>
              <div>
                <div className="text-xs text-muted">Estimated Delivery</div>
                <div className="font-bold text-sm">{selectedShipment?.eta || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
