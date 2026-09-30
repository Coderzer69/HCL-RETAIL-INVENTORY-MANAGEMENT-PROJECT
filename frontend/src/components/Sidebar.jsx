import React from 'react';
import { 
  Package, LayoutGrid, Box, Warehouse, ArrowRightLeft, 
  ShoppingCart, FileText, Users, Truck, Bell, Settings, Crown 
} from 'lucide-react';

export default function Sidebar({ isOpen, activeTab, setActiveTab }) {
  const navItems = [
    { icon: <LayoutGrid size={20} />, label: 'Dashboard' },
    { icon: <Package size={20} />, label: 'Products' },
    { icon: <LayoutGrid size={20} />, label: 'Categories' },
    { icon: <Box size={20} />, label: 'Inventory' },
    { icon: <Warehouse size={20} />, label: 'Warehouses' },
    { icon: <ArrowRightLeft size={20} />, label: 'Stock Movements' },
    { icon: <ShoppingCart size={20} />, label: 'Sales Orders' },
    { icon: <FileText size={20} />, label: 'Purchase Orders' },
    { icon: <Users size={20} />, label: 'Suppliers' },
    { icon: <Truck size={20} />, label: 'Shipments' },
    { icon: <Users size={20} />, label: 'Users & Roles' },
    { icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo cursor-pointer" onClick={() => setActiveTab('Dashboard')}>
        <div className="icon-box">
          <Box size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold">RetailHub</h1>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item, index) => (
            <li key={index}>
              <button 
                onClick={() => setActiveTab(item.label)} 
                className={`nav-item w-full text-left ${activeTab === item.label ? 'active' : ''}`}
                style={{ background: activeTab === item.label ? 'var(--color-primary)' : 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <div className="flex items-center gap-3 w-full" style={{ color: activeTab === item.label ? 'white' : 'var(--color-text-muted)' }}>
                  {item.icon}
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
