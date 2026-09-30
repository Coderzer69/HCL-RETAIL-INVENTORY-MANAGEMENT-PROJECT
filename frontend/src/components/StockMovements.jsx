import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, ArrowDown, ArrowRightLeft, FileText, 
  BarChart2, PieChart, Search, Download, Plus, 
  MoreHorizontal, Filter, Calendar, Building, 
  ChevronLeft, ChevronRight, ClipboardList,
  Package
} from 'lucide-react';
import { api } from '../services/api';

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await api.get('/analytics/movements');
        setMovements(res.data || []);
      } catch (err) {
        console.error('Failed to fetch stock movements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, []);

  const getTypeBadge = (type) => {
    switch(type) {
      case 'IN': return { bg: '#dcfce7', text: '#16a34a', icon: <ArrowUp size={12} />, label: 'Stock In' };
      case 'OUT': return { bg: '#fee2e2', text: '#ef4444', icon: <ArrowDown size={12} />, label: 'Stock Out' };
      case 'TRANSFER': return { bg: '#f3e8ff', text: '#8b5cf6', icon: <ArrowRightLeft size={12} />, label: 'Transfer' };
      case 'ADJUSTMENT': return { bg: '#fef9c3', text: '#ca8a04', icon: <FileText size={12} />, label: 'Adjustment' };
      default: return { bg: '#f1f5f9', text: '#64748b', icon: null, label: type };
    }
  };

  const getQtyColor = (type) => {
    switch(type) {
      case 'IN': return '#16a34a';
      case 'OUT': return '#ef4444';
      case 'TRANSFER': return '#8b5cf6';
      case 'ADJUSTMENT': return '#ca8a04';
      default: return '#64748b';
    }
  };

  // Compute metrics
  let totalIn = 0, totalOut = 0, totalTransfers = 0, totalAdjustments = 0;
  movements.forEach(m => {
    if (m.movementType === 'IN') totalIn += m.quantity;
    else if (m.movementType === 'OUT') totalOut += m.quantity;
    else if (m.movementType === 'TRANSFER') totalTransfers += m.quantity;
    else if (m.movementType === 'ADJUSTMENT') totalAdjustments += m.quantity;
  });

  const totalUnits = totalIn + totalOut + totalTransfers + totalAdjustments;

  return (
    <div className="dashboard-scroll-area">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Stock Movements</h2>
          <p className="text-muted text-sm">Track all inventory in, out, transfers and adjustments across your warehouses</p>
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

      {loading ? (
        <div className="flex justify-center items-center h-64 text-muted">Loading stock movements...</div>
      ) : (
        <>
          <div className="dashboard-grid-4">
            <div className="card">
              <div className="flex justify-between items-start mb-2">
                <div className="icon-rounded" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                  <ArrowUp size={20} />
                </div>
                <button className="text-muted"><MoreHorizontal size={16} /></button>
              </div>
              <p className="text-sm text-muted mb-1">Total Stock In</p>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">{totalIn.toLocaleString()} units</h3>
              </div>
            </div>

            <div className="card">
              <div className="flex justify-between items-start mb-2">
                <div className="icon-rounded" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
                  <ArrowDown size={20} />
                </div>
                <button className="text-muted"><MoreHorizontal size={16} /></button>
              </div>
              <p className="text-sm text-muted mb-1">Total Stock Out</p>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">{totalOut.toLocaleString()} units</h3>
              </div>
            </div>

            <div className="card">
              <div className="flex justify-between items-start mb-2">
                <div className="icon-rounded" style={{ backgroundColor: 'var(--color-primary-faded)', color: 'var(--color-primary)' }}>
                  <ArrowRightLeft size={20} />
                </div>
                <button className="text-muted"><MoreHorizontal size={16} /></button>
              </div>
              <p className="text-sm text-muted mb-1">Total Transfers</p>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">{totalTransfers.toLocaleString()} units</h3>
              </div>
            </div>

            <div className="card">
              <div className="flex justify-between items-start mb-2">
                <div className="icon-rounded" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                  <FileText size={20} />
                </div>
                <button className="text-muted"><MoreHorizontal size={16} /></button>
              </div>
              <p className="text-sm text-muted mb-1">Total Adjustments</p>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">{totalAdjustments.toLocaleString()} units</h3>
              </div>
            </div>
          </div>

          <div className="warehouse-grid mt-6">
            <div className="card p-0 overflow-hidden">
              <div className="card-header p-4 border-b m-0" style={{ borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title text-sm flex items-center gap-2">
                  <PieChart size={16} className="text-primary" /> Movement Type Distribution
                </h3>
              </div>
              <div className="p-4 flex items-center justify-between gap-6" style={{ height: '220px' }}>
                <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    {totalUnits > 0 ? (
                      <>
                        <path d={`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`} fill="none" stroke="#eab308" strokeWidth="5" strokeDasharray="100, 100" />
                        <path d={`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`} fill="none" stroke="#8b5cf6" strokeWidth="5" strokeDasharray={`${((totalIn + totalOut + totalTransfers) / totalUnits) * 100}, 100`} />
                        <path d={`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`} fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray={`${((totalIn + totalOut) / totalUnits) * 100}, 100`} />
                        <path d={`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`} fill="none" stroke="#22c55e" strokeWidth="5" strokeDasharray={`${(totalIn / totalUnits) * 100}, 100`} />
                      </>
                    ) : (
                      <path d={`M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831`} fill="none" stroke="#e2e8f0" strokeWidth="5" />
                    )}
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', lineHeight: 1, marginBottom: '2px' }}>{totalUnits.toLocaleString()}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Total Units</span>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span> Stock In
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{totalIn.toLocaleString()}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{totalUnits ? Math.round((totalIn/totalUnits)*100) : 0}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span> Stock Out
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{totalOut.toLocaleString()}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{totalUnits ? Math.round((totalOut/totalUnits)*100) : 0}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }}></span> Transfers
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{totalTransfers.toLocaleString()}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{totalUnits ? Math.round((totalTransfers/totalUnits)*100) : 0}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }}></span> Adjustments
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{totalAdjustments.toLocaleString()}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{totalUnits ? Math.round((totalAdjustments/totalUnits)*100) : 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-0 overflow-hidden mt-6">
            <div className="card-header p-4 border-b m-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="card-title text-lg flex items-center gap-2">
                <ClipboardList size={20} className="text-primary" /> Stock Movements List
              </h3>
            </div>

            <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
              <table className="w-full text-left" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', width: '40px' }}><input type="checkbox" /></th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Date & Time</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Type</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Product</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>SKU</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Warehouse</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Quantity</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted p-4">No stock movements found</td>
                    </tr>
                  ) : movements.map((item) => {
                    const badge = getTypeBadge(item.movementType);
                    const qtyColor = getQtyColor(item.movementType);
                    const sign = item.movementType === 'IN' ? '+' : item.movementType === 'OUT' ? '-' : '';
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-gray-50 transition-colors">
                        <td style={{ padding: '1rem' }}><input type="checkbox" /></td>
                        <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600,
                            backgroundColor: badge.bg, color: badge.text
                          }}>
                            {badge.icon} {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div className="flex items-center gap-3">
                            <div style={{ width: '28px', height: '28px', backgroundColor: '#e2e8f0', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                              <Package size={16} />
                            </div>
                            <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{item.product?.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.product?.sku}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.warehouse?.name}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: qtyColor }}>
                          {sign}{item.quantity}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.referenceId || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
