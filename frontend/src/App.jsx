import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Login from './components/Login';
import Signup from './components/Signup';
import Categories from './components/Categories';
import Warehouses from './components/Warehouses';
import Inventory from './components/Inventory';
import StockMovements from './components/StockMovements';
import UsersAndRoles from './components/UsersAndRoles';
import Shipments from './components/Shipments';
import SalesOrders from './components/SalesOrders';
import PurchaseOrders from './components/PurchaseOrders';
import Suppliers from './components/Suppliers';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('activeTab') || 'Dashboard';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('activeTab', tab);
  };
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await api.get('/auth/profile');
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
      setIsInitializing(false);
    };

    validateSession();

    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setAuthMode('login');
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setAuthMode('login');
    }
  };

  if (isInitializing) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    if (authMode === 'login') {
      return <Login onLogin={handleLogin} onNavigateToSignup={() => setAuthMode('signup')} />;
    } else {
      return <Signup onSignup={handleLogin} onNavigateToLogin={() => setAuthMode('login')} />;
    }
  }

  return (
    <div className="app-container">
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false); // Close sidebar on mobile after clicking
        }}
      />
      <div className="main-content">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          onProfileClick={() => setActiveTab('Profile')}
          onLogout={handleLogout}
        />
        {activeTab === 'Settings' ? <Settings /> :
          activeTab === 'Profile' ? <Profile onLogout={handleLogout} /> :
            activeTab === 'Products' ? <Products /> :
              activeTab === 'Categories' ? <Categories /> :
                activeTab === 'Warehouses' ? <Warehouses /> :
                  activeTab === 'Inventory' ? <Inventory /> :
                    activeTab === 'Stock Movements' ? <StockMovements /> :
                      activeTab === 'Sales Orders' ? <SalesOrders /> :
                        activeTab === 'Purchase Orders' ? <PurchaseOrders /> :
                          activeTab === 'Suppliers' ? <Suppliers /> :
                            activeTab === 'Shipments' ? <Shipments /> :
                              activeTab === 'Users & Roles' ? <UsersAndRoles /> :
                                <Dashboard />}
      </div>
    </div>
  );
}

export default App;
