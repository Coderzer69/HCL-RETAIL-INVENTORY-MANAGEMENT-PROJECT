import React from 'react';
import { Box, FileText, Building, TrendingUp } from 'lucide-react';

export default function AuthLayout({ children, isLogin }) {
  return (
    <div className="auth-container" style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#f8fafc' }}>
      {/* Left Panel - Hidden on small screens */}
      <div className="auth-left-panel" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #f4f0ff 0%, #e0e7ff 100%)', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 rounded" style={{ width: '6rem', height: '6rem', backgroundColor: '#d8b4fe', opacity: 0.2, transform: 'rotate(12deg)', position: 'absolute', top: '10%', right: '10%' }}></div>
        <div className="absolute bottom-20 left-20 rounded" style={{ width: '8rem', height: '8rem', backgroundColor: '#a5b4fc', opacity: 0.2, transform: 'rotate(-12deg)', position: 'absolute', bottom: '15%', left: '10%' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex items-center gap-2 mb-6" style={{ marginBottom: '2.5rem' }}>
            <div className="icon-rounded" style={{ backgroundColor: 'var(--color-primary)', color: 'white', width: '32px', height: '32px' }}>
              <Box size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', lineHeight: 1 }}>RetailHub</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Inventory Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded" style={{ padding: '0.25rem 0.75rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-primary-faded)', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 500, width: 'max-content', borderRadius: '9999px' }}>
            <Box size={14} />
            All-in-One Retail Management
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: 1.2, color: '#0f172a' }}>
            {isLogin ? 'Streamline your retail business with ' : 'Manage your retail business with '}
            <span style={{ color: 'var(--color-primary)' }}>confidence</span>
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', marginBottom: '2.5rem', maxWidth: '28rem' }}>
            Track inventory, manage orders, and coordinate warehouses — all in one place.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: Box, title: 'Real-time Inventory', desc: 'Keep track of stock across all warehouses' },
              { icon: FileText, title: 'Order Management', desc: 'Streamline sales and purchase orders' },
              { icon: Building, title: 'Multi-Warehouse', desc: 'Manage multiple locations effortlessly' },
              { icon: TrendingUp, title: 'Business Insights', desc: 'Make data-driven decisions' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="icon-rounded" style={{ backgroundColor: 'white', color: 'var(--color-primary)', width: '40px', height: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', paddingTop: '2.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          © 2024 RetailHub. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right-panel" style={{ width: '50%', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '28rem', backgroundColor: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
