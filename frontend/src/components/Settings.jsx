import React from 'react';
import { User, Bell, Lock, Globe, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="dashboard-scroll-area">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted text-sm">Manage your account preferences and application settings</p>
      </div>

      <div className="dashboard-grid-2">
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="card-header border-b pb-4 mb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="card-title"><User size={18} className="text-primary" /> Personal Information</h3>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-muted block mb-1">Full Name</label>
                <input type="text" className="select-input w-full" defaultValue="Urvish Bhardwaj" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted block mb-1">Email Address</label>
                <input type="email" className="select-input w-full" defaultValue="admin@retailhub.com" />
              </div>
              <button className="btn-primary" style={{ width: 'auto', alignSelf: 'flex-start' }}>Save Changes</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-b pb-4 mb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="card-title"><Bell size={18} className="text-primary" /> Notification Preferences</h3>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Email notifications for new orders</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Low stock alerts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span className="text-sm">Weekly inventory summary</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="card-header border-b pb-4 mb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="card-title"><Shield size={18} className="text-primary" /> Security</h3>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-muted block mb-1">Current Password</label>
                <input type="password" className="select-input w-full" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted block mb-1">New Password</label>
                <input type="password" className="select-input w-full" placeholder="••••••••" />
              </div>
              <button className="btn-primary" style={{ width: 'auto', alignSelf: 'flex-start' }}>Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
