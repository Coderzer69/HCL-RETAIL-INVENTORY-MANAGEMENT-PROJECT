import React, { useState, useEffect } from 'react';
import { 
  Package, Database, AlertTriangle, Ban, 
  Search, Upload, Plus, Filter, MoreHorizontal, 
  ChevronLeft, ChevronRight, Calendar, Building,
  X, Edit2, Trash2
} from 'lucide-react';
import { api } from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', barcode: '', categoryId: '', description: '', basePrice: 0, isActive: true
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = async (page = 1, searchQuery = search, catId = categoryId) => {
    try {
      setLoading(true);
      setError(null);
      let url = `/products?page=${page}&limit=10`;
      if (searchQuery) url += `&search=${searchQuery}`;
      if (catId) url += `&categoryId=${catId}`;
      
      const res = await api.get(url);
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1, search, categoryId);
  }, [search, categoryId]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchProducts(newPage);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', sku: '', barcode: '', categoryId: '', description: '', basePrice: 0, isActive: true });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      categoryId: product.categoryId || '',
      description: product.description || '',
      basePrice: product.basePrice,
      isActive: product.isActive
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts(pagination.page);
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        categoryId: formData.categoryId || undefined,
        barcode: formData.barcode || undefined,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setIsModalOpen(false);
      fetchProducts(pagination.page);
    } catch (err) {
      setFormError(err.message || 'An error occurred');
    } finally {
      setFormLoading(false);
    }
  };
  
  // Calculate stats
  const totalProducts = pagination.total;
  const activeProducts = products.filter(p => p.isActive).length;
  // Stock data is managed by inventory service, mock zeroes for now
  const lowStock = 0; 
  const outOfStock = 0;

  return (
    <div className="dashboard-scroll-area relative">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted text-sm">Manage your product catalog, pricing, and stock levels</p>
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
          <p className="text-sm text-muted mb-1">Total Products</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{totalProducts}</h3>
          </div>
          <p className="text-xs text-muted">All products in catalog</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <Database size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Active Products (Page)</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{activeProducts}</h3>
          </div>
          <p className="text-xs text-muted">Currently selling products</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
              <AlertTriangle size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Low Stock Products</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{lowStock}</h3>
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
          <p className="text-sm text-muted mb-1">Out of Stock</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">{outOfStock}</h3>
          </div>
          <p className="text-xs text-muted">Items currently out of stock</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="card-header p-4 border-b m-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="card-title text-lg">
            <Package size={20} className="text-primary" /> Product Catalog
          </h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2" style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
              <Upload size={16} /> Import
            </button>
            <button onClick={openAddModal} className="btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem', marginTop: 0 }}>
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        <div className="p-4 border-b flex gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="search-bar flex-1" style={{ maxWidth: '300px' }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="select-input" style={{ width: '150px' }}>
            <select 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button className="flex items-center gap-2 ml-auto" style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: 500 }}>
            <Filter size={16} /> Filters
          </button>
        </div>

        {error ? (
           <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
        ) : loading ? (
           <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading products...</div>
        ) : products.length === 0 ? (
           <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No products found.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}><input type="checkbox" /></th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Warehouse</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '0.375rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Package size={20} className="text-muted" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{product.name}</p>
                          <p className="text-xs text-muted">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#f3e8ff', color: '#9333ea', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem', fontWeight: 500 }}>₹{product.basePrice}</td>
                    <td style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>0 units</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Multiple</td>
                    <td>
                      <span className={`badge`} style={{ 
                        backgroundColor: product.isActive ? '#d1fae5' : '#fee2e2', 
                        color: product.isActive ? '#10b981' : '#ef4444' 
                      }}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      <div className="flex gap-3">
                        <button onClick={() => openEditModal(product)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-text-muted)' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(product.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-sm text-muted">Showing page {pagination.page} of {pagination.pages} ({pagination.total} products)</p>
          <div className="flex gap-1 items-center">
            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '0.375rem', backgroundColor: 'white', color: 'var(--color-text-muted)', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1 }}><ChevronLeft size={16} /></button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-primary)', borderRadius: '0.375rem', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 500 }}>{pagination.page}</button>
            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages || pagination.pages === 0} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '0.375rem', backgroundColor: 'white', color: 'var(--color-text-muted)', cursor: pagination.page === pagination.pages || pagination.pages === 0 ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.pages || pagination.pages === 0 ? 0.5 : 1 }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            {formError && <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>{formError}</div>}
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Product Name *</label>
                <input required type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter product name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>SKU *</label>
                  <input required type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. PRD-001" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Barcode</label>
                  <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} placeholder="Optional barcode" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Base Price (₹) *</label>
                  <input required type="number" step="0.01" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Category</label>
                  <div className="select-input" style={{ width: '100%', margin: 0, padding: 0 }}>
                    <select style={{ width: '100%', padding: '0.75rem', border: 'none', background: 'transparent', outline: 'none' }} value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0f172a' }}>Description</label>
                <textarea style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none', resize: 'vertical' }} rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Product description..."></textarea>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <label htmlFor="isActive" style={{ fontSize: '0.875rem', cursor: 'pointer', color: '#0f172a', fontWeight: 500 }}>Product is Active</label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary" style={{ marginTop: 0, padding: '0.5rem 1rem', opacity: formLoading ? 0.7 : 1, cursor: formLoading ? 'not-allowed' : 'pointer' }}>
                  {formLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
