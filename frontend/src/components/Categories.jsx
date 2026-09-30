import React from 'react';
import { 
  LayoutGrid, Package, Tag, Ban, 
  Search, Upload, Plus, MoreHorizontal, 
  ChevronLeft, ChevronRight, Calendar, Building,
  Monitor, Shirt, Armchair, ShoppingBag, 
  Car, Book, Dumbbell, Dog, Droplets
} from 'lucide-react';

const categoriesData = [
  { id: 1, name: 'Electronics', description: 'Computers, mobile phones, accessories and electronic devices', products: 320, status: 'Active', date: 'Sep 15, 2024', icon: <Monitor size={18} />, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 2, name: 'Apparel & Clothing', description: "Men's, women's and children's clothing", products: 185, status: 'Active', date: 'Sep 12, 2024', icon: <Shirt size={18} />, color: '#3b82f6', bg: '#eff6ff' },
  { id: 3, name: 'Home & Living', description: 'Home decor, furniture and lifestyle products', products: 142, status: 'Active', date: 'Sep 10, 2024', icon: <Armchair size={18} />, color: '#ec4899', bg: '#fdf2f8' },
  { id: 4, name: 'Accessories', description: 'Bags, wallets, watches and accessories', products: 96, status: 'Active', date: 'Sep 8, 2024', icon: <ShoppingBag size={18} />, color: '#eab308', bg: '#fefce8' },
  { id: 5, name: 'Footwear', description: 'Shoes, sneakers and footwear collections', products: 88, status: 'Active', date: 'Sep 5, 2024', icon: <Package size={18} />, color: '#10b981', bg: '#ecfdf5' },
  { id: 6, name: 'Beauty & Personal Care', description: 'Skincare, haircare and personal care products', products: 76, status: 'Active', date: 'Sep 3, 2024', icon: <Droplets size={18} />, color: '#f97316', bg: '#fff7ed' },
  { id: 7, name: 'Sports & Fitness', description: 'Sports equipment and fitness accessories', products: 64, status: 'Inactive', date: 'Aug 28, 2024', icon: <Dumbbell size={18} />, color: '#6366f1', bg: '#eef2ff' },
  { id: 8, name: 'Books & Stationery', description: 'Books, notebooks and office supplies', products: 58, status: 'Active', date: 'Aug 25, 2024', icon: <Book size={18} />, color: '#0ea5e9', bg: '#f0f9ff' },
  { id: 9, name: 'Pet Supplies', description: 'Pet food, toys and care products', products: 42, status: 'Active', date: 'Aug 20, 2024', icon: <Dog size={18} />, color: '#d946ef', bg: '#fdf4ff' },
  { id: 10, name: 'Automotive', description: 'Car accessories and automotive products', products: 37, status: 'Inactive', date: 'Aug 18, 2024', icon: <Car size={18} />, color: '#8b5cf6', bg: '#f5f3ff' },
];

export default function Categories() {
  return (
    <div className="dashboard-scroll-area">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-muted text-sm">Organize your products into categories for better management</p>
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
              <LayoutGrid size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Total Categories</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">24</h3>
            <span className="trend-badge trend-up">↑ 14%</span>
          </div>
          <p className="text-xs text-muted">All product categories</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <Package size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Active Categories</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">21</h3>
            <span className="trend-badge trend-up">↑ 11%</span>
          </div>
          <p className="text-xs text-muted">Categories with products</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
              <Tag size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Total Products</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">1,248</h3>
            <span className="trend-badge trend-up">↑ 12%</span>
          </div>
          <p className="text-xs text-muted">Products across all categories</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-2">
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
              <Ban size={20} />
            </div>
            <button className="text-muted"><MoreHorizontal size={16} /></button>
          </div>
          <p className="text-sm text-muted mb-1">Empty Categories</p>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold">3</h3>
            <span className="trend-badge trend-down">↓ 40%</span>
          </div>
          <p className="text-xs text-muted">Categories without products</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="card-header p-4 border-b m-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="card-title text-lg flex items-center gap-2">
            <LayoutGrid size={20} className="text-primary" /> Category List
          </h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2" style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
              <Upload size={16} /> Import
            </button>
            <button className="btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
              <Plus size={16} /> Add Category
            </button>
          </div>
        </div>

        <div className="p-4 border-b flex gap-3 flex-wrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="search-bar flex-1" style={{ maxWidth: '400px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search categories by name or description..." style={{ width: '100%' }} />
          </div>
          
          <select className="select-input ml-auto" style={{ width: '150px' }}>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <select className="select-input" style={{ width: '160px' }}>
            <option>Sort by: Name</option>
            <option>Sort by: Date</option>
            <option>Sort by: Products</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem', width: '40px' }}><input type="checkbox" /></th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Category</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Description</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Products</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Created Date</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoriesData.map((category) => (
                <tr key={category.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-gray-50 transition-colors">
                  <td style={{ padding: '1rem' }}><input type="checkbox" /></td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: '36px', height: '36px', backgroundColor: category.bg, color: category.color, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {category.icon}
                      </div>
                      <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{category.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {category.description}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {category.products} products
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge-${category.status === 'Active' ? 'success' : 'danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                      {category.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{category.date}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                    <button><MoreHorizontal size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-sm text-muted">Showing 1 to 10 of 24 categories</p>
          <div className="flex gap-1">
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '0.375rem', backgroundColor: 'white', color: 'var(--color-text-muted)' }}><ChevronLeft size={16} /></button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-primary)', borderRadius: '0.375rem', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 500 }}>1</button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '0.375rem', backgroundColor: 'white', color: 'var(--color-text-muted)' }}>2</button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '0.375rem', backgroundColor: 'white', color: 'var(--color-text-muted)' }}>3</button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: '0.375rem', backgroundColor: 'white', color: 'var(--color-text-muted)' }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
