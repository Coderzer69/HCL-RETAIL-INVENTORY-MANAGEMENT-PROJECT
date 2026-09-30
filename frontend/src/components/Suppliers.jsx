import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Clock, Star, Calendar, Plus,
  Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, 
  Building, MapPin, Mail, Phone, FileText, Download, Edit3, Shield, X
} from 'lucide-react';
import { api } from '../services/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('All Suppliers');
  const [activeSupplierTab, setActiveSupplierTab] = useState('Overview');
  
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ companyName: '', contactName: '', phone: '', address: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      const data = res.data || [];
      setSuppliers(data);
      if (data.length > 0) {
        setSelectedSupplier(prev => prev ? data.find(s => s.id === prev.id) || data[0] : data[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const totalSuppliers = suppliers.length;
  // In the real app, we might have status, for now assuming all are active if they exist
  const activeSuppliers = suppliers.length; 

  const filteredSuppliers = suppliers.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.companyName?.toLowerCase().includes(q) || s.contactName?.toLowerCase().includes(q);
  });

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await api.post('/suppliers', formData);
      setIsModalOpen(false);
      setFormData({ companyName: '', contactName: '', phone: '', address: '' });
      await fetchSuppliers();
    } catch (err) {
      setFormError(err.message || 'Failed to create supplier');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="dashboard-scroll-area">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Suppliers</h2>
          <p className="text-muted text-sm">Manage vendor relationships, monitor performance, and track active orders</p>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 sm:mt-0">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginTop: 0 }}>
            <Plus size={16} /> Add Supplier
          </button>
        </div>
      </div>

      <div className="dashboard-grid-4">
        <div className="card">
          <div className="card-header">
            <div className="icon-rounded icon-primary-bg">
              <Building size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Total Suppliers</p>
          <div className="kpi-value">
            {totalSuppliers}
            <span className="trend-badge trend-up">↑ 4%</span>
          </div>
          <p className="text-xs text-muted">Active network</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
              <CheckCircle size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Active Suppliers</p>
          <div className="kpi-value">
            {activeSuppliers}
            <span className="trend-badge trend-up">↑ 2%</span>
          </div>
          <p className="text-xs text-muted">Currently active</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
              <Clock size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Pending Onboarding</p>
          <div className="kpi-value">
            0
            <span className="trend-badge trend-down" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>↓ 1</span>
          </div>
          <p className="text-xs text-muted">Awaiting document verification</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="icon-rounded" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
              <Star size={20} />
            </div>
            <MoreHorizontal size={20} className="text-muted cursor-pointer" />
          </div>
          <p className="text-sm font-semibold text-muted">Average Rating</p>
          <div className="kpi-value">
            4.8
            <span className="trend-badge trend-up">↑ 0.2</span>
          </div>
          <p className="text-xs text-muted">Across all active suppliers</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 pb-2" style={{ borderBottom: '1px solid var(--color-border)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {[
          { name: 'All Suppliers', count: totalSuppliers },
          { name: 'Active', count: activeSuppliers },
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
              gap: '0.5rem',
              background: 'none',
              cursor: 'pointer'
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
        <div className="search-bar" style={{ flex: '1 1 250px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by supplier name or contact..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading suppliers...</div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
      ) : filteredSuppliers.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No suppliers found.</div>
      ) : (
        <div className="dashboard-grid-2">
          {/* Left Column: Suppliers List */}
          <div className="card flex flex-col" style={{ padding: 0, gridColumn: 'span 1' }}>
            <div className="card-header" style={{ padding: '1.5rem 1.5rem 0', marginBottom: '1rem' }}>
              <h3 className="card-title"><Building size={18} className="text-primary" /> Suppliers Directory</h3>
              <button className="select-input" style={{ cursor: 'pointer', color: 'var(--color-primary)', border: '1px solid var(--color-primary-faded)', padding: '0.25rem 0.75rem' }}>
                <Download size={14} /> Export
              </button>
            </div>
            
            <div className="table-container" style={{ flex: 1 }}>
              <table>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}><input type="checkbox" /></th>
                    <th>Supplier Name</th>
                    <th>Contact</th>
                    <th>Rating</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => {
                    const isSelected = selectedSupplier?.id === supplier.id;
                    return (
                      <tr 
                        key={supplier.id} 
                        onClick={() => setSelectedSupplier(supplier)}
                        style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer', backgroundColor: isSelected ? '#f8fafc' : 'transparent' }}
                      >
                        <td style={{ textAlign: 'center' }}><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '10px', backgroundColor: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                              {supplier.companyName?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-primary text-sm">{supplier.companyName}</span>
                          </div>
                        </td>
                        <td className="text-sm">{supplier.contactName || '-'}</td>
                        <td className="text-sm">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-warning" fill="#f59e0b" />
                            <span>4.8</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>Active</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center flex-wrap gap-4" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <div className="text-sm text-muted">Showing {filteredSuppliers.length} suppliers</div>
            </div>
          </div>

          {/* Right Column: Supplier Detail */}
          {selectedSupplier && (
            <div className="card flex flex-col" style={{ padding: 0 }}>
              <div style={{ padding: '1.5rem 1.5rem 0' }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <div className="avatar" style={{ width: '56px', height: '56px', fontSize: '1.5rem', backgroundColor: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      {selectedSupplier.companyName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-lg flex items-center gap-2 mb-1">
                        {selectedSupplier.companyName}
                        <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#10b981', fontSize: '0.7rem' }}>Active</span>
                      </div>
                      <div className="text-sm text-muted">ID: {selectedSupplier.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mb-4 overflow-x-auto whitespace-nowrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Overview', 'Contacts'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveSupplierTab(tab)}
                      style={{ 
                        padding: '0.5rem 0', 
                        fontSize: '0.875rem',
                        fontWeight: activeSupplierTab === tab ? '600' : '500',
                        color: activeSupplierTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        borderBottom: activeSupplierTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
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
                {activeSupplierTab === 'Overview' && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Company Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-muted mb-1">Vendor Since</div>
                          <div className="font-medium">{new Date(selectedSupplier.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><MapPin size={16} className="text-muted" /> Primary Address</h4>
                      <div className="text-sm" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
                        <span style={{ whiteSpace: 'pre-line' }}>{selectedSupplier.address || 'No address provided'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSupplierTab === 'Contacts' && (
                  <div className="flex flex-col gap-4">
                    <div style={{ padding: '1rem', border: '1px solid var(--color-primary-faded)', borderRadius: '0.5rem', backgroundColor: 'var(--color-primary-faded)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold">{selectedSupplier.contactName || 'Primary Contact'}</div>
                          <div className="text-xs text-muted">Account Manager</div>
                        </div>
                        <span className="badge" style={{ backgroundColor: 'white', color: 'var(--color-primary)' }}>Primary</span>
                      </div>
                      <div className="flex flex-col gap-2 mt-3 text-sm">
                        <div className="flex items-center gap-2 text-muted"><Phone size={14} /> {selectedSupplier.phone || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add Supplier</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>{formError}</div>}
            
            <form onSubmit={handleCreateSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Company Name *</label>
                <input required type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Contact Name</label>
                <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Phone Number</label>
                <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Full Address</label>
                <textarea rows="3" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="HQ Address..."></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary" style={{ marginTop: 0, padding: '0.5rem 1rem', opacity: formLoading ? 0.7 : 1, cursor: formLoading ? 'not-allowed' : 'pointer' }}>
                  {formLoading ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
