import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, X, Check } from 'lucide-react';
import { api } from '../services/api';

export default function Header({ onMenuClick, onProfileClick }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional polling: setInterval(fetchNotifications, 60000);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="header relative">
      <div className="flex items-center gap-4">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search products, orders, suppliers, warehouses..." />
        </div>
      </div>
      
      <div className="header-right relative">
        <div ref={dropdownRef}>
          <button 
            className="notification-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={24} />
            {unreadCount > 0 && <span className="dot">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden" style={{ top: '100%', right: '120px' }}>
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs font-medium text-primary bg-blue-50 px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className={`text-sm ${!notif.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="text-gray-400 hover:text-primary p-1"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="user-profile cursor-pointer" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
          <div className="avatar">UB</div>
          <div>
            <h4 className="text-sm font-semibold hover:text-primary transition-colors">Urvish Bhardwaj</h4>
            <p className="text-xs text-muted">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
