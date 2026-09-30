import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, Camera, Shield, User, Phone, MapPin, Mail, 
  Key, Calendar, Clock, Edit2, Lock, 
  Settings, Activity, Upload, Trash2, Check, X
} from 'lucide-react';
import { api } from '../services/api';

export default function Profile({ onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    department: 'IT & Operations',
    employeeId: 'N/A',
    dateOfJoining: 'N/A',
    status: 'Active',
    email: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        const user = res.data;
        if (user) {
          setFormData(prev => ({
            ...prev,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.email || '',
            role: user.roles && user.roles.length > 0 ? user.roles[0] : 'User',
            employeeId: `EMP-${user.id.substring(0, 5).toUpperCase()}`
          }));
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePhoto(imageUrl);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const initials = formData.fullName ? formData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading profile...</div>;
  }

  return (
    <div className="dashboard-scroll-area" style={{ backgroundColor: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>User Profile</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Manage your personal information and account settings</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          <Home size={16} /> / <span style={{ color: '#0f172a' }}>Profile</span>
        </div>
      </div>

      {/* Top Banner Card */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '1rem', 
        marginBottom: '1.5rem', 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        backgroundImage: 'radial-gradient(circle at 100% 0%, #f3e8ff 0%, transparent 40%), radial-gradient(circle at 0% 100%, #e0e7ff 0%, transparent 40%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: '6rem', height: '6rem', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.875rem', fontWeight: 'bold',
              backgroundImage: profilePhoto ? `url(${profilePhoto})` : 'none',
              backgroundSize: 'cover', backgroundPosition: 'center'
            }}>
              {!profilePhoto && initials}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ position: 'absolute', bottom: 0, right: 0, width: '2rem', height: '2rem', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>{formData.fullName}</h2>
            <p style={{ color: 'var(--color-primary)', fontWeight: 500, marginBottom: '0.75rem', fontSize: '0.875rem' }}>{formData.role}</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
                <Shield size={12} /> {formData.role}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#166534' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: formData.status === 'Active' ? '#16a34a' : '#ef4444' }}></span> {formData.status}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#d8b4fe', fontSize: '2.5rem', fontFamily: 'serif', lineHeight: 1, marginBottom: '-10px' }}>"</div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontStyle: 'italic', fontWeight: 500, position: 'relative', zIndex: 10 }}>
            Building better systems<br/>for a smarter tomorrow.
          </p>
          <div style={{ height: '2px', width: '3rem', backgroundColor: 'var(--color-primary)', marginLeft: 'auto', marginTop: '0.75rem' }}></div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="profile-grid">
        
        {/* Center Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#0f172a' }}>Personal Information</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Update your personal details and profile information</p>
                </div>
              </div>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={handleCancel}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}
                  >
                    <Check size={16} /> Save
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem 1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.375rem' }}>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} style={{ width: '100%', padding: '0.625rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', fontSize: '0.875rem', color: isEditing ? '#1e293b' : 'var(--color-text-muted)', backgroundColor: isEditing ? '#ffffff' : '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.375rem' }}>Role</label>
                <input type="text" name="role" value={formData.role} onChange={handleInputChange} disabled={!isEditing} style={{ width: '100%', padding: '0.625rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', fontSize: '0.875rem', color: isEditing ? '#1e293b' : 'var(--color-text-muted)', backgroundColor: isEditing ? '#ffffff' : '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.375rem' }}>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleInputChange} disabled={!isEditing} style={{ width: '100%', padding: '0.625rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', fontSize: '0.875rem', color: isEditing ? '#1e293b' : 'var(--color-text-muted)', backgroundColor: isEditing ? '#ffffff' : '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.375rem' }}>Employee ID</label>
                <input type="text" name="employeeId" value={formData.employeeId} disabled style={{ width: '100%', padding: '0.625rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-text-muted)', backgroundColor: '#f1f5f9', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.375rem' }}>Date of Joining</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}><Calendar size={16} /></div>
                  <input type="text" name="dateOfJoining" value={formData.dateOfJoining} disabled style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-text-muted)', backgroundColor: '#f1f5f9', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.375rem' }}>Status</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)' }}><span style={{ display: 'block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: formData.status === 'Active' ? '#22c55e' : '#ef4444' }}></span></div>
                  <select name="status" value={formData.status} onChange={handleInputChange} disabled={!isEditing} style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', fontSize: '0.875rem', color: isEditing ? '#1e293b' : 'var(--color-text-muted)', backgroundColor: isEditing ? '#ffffff' : '#f8fafc', outline: 'none', appearance: 'none' }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ 
                  width: '5rem', height: '5rem', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold',
                  backgroundImage: profilePhoto ? `url(${profilePhoto})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center'
                }}>
                  {!profilePhoto && initials}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: '1.5rem', height: '1.5rem', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>Profile Photo</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem', maxWidth: '300px', lineHeight: 1.5 }}>
                  Upload a new profile photo. Recommended size: 400x400px (Max 2MB)
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
                  <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                    <Upload size={16} /> Upload Photo
                  </button>
                  <button onClick={handleRemovePhoto} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: 'var(--color-text-muted)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                    <Trash2 size={16} color="#ef4444" /> Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Phone size={16} />
                </div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Contact Information</h3>
              </div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>
                  <Edit2 size={12} /> Edit
                </button>
              ) : null}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                  <Mail size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '2px' }}>Email Address</p>
                  {isEditing ? (
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', fontSize: '0.875rem', outline: 'none' }} />
                  ) : (
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{formData.email}</p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                  <Phone size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '2px' }}>Phone Number</p>
                  {isEditing ? (
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', fontSize: '0.875rem', outline: 'none' }} />
                  ) : (
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{formData.phone || 'N/A'}</p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                  <MapPin size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '2px' }}>Location</p>
                  {isEditing ? (
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} style={{ width: '100%', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', fontSize: '0.875rem', outline: 'none' }} />
                  ) : (
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{formData.location || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', marginBottom: '1.5rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Shield size={16} />
              </div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Account Information</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                  <Key size={14} /> Account Type
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{formData.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                  <Calendar size={14} /> Member Since
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{formData.dateOfJoining}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                  <Clock size={14} /> Last Login
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>Just now</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: formData.status === 'Active' ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: formData.status === 'Active' ? '#22c55e' : '#ef4444' }}></span>
                  </span> 
                  Account Status
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{formData.status}</span>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={onLogout} 
                style={{ color: '#ef4444', backgroundColor: 'transparent', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem' }}>
                Log Out
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
