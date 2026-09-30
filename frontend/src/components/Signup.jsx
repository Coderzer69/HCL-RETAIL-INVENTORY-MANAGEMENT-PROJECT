import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { api } from '../services/api';

export default function Signup({ onSignup, onNavigateToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      const data = await api.post('/auth/register', { firstName, lastName, email, password, roles: ['ADMIN'] });
      
      // Store token if any
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      }
      
      onSignup(); // Navigate to Dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout isLogin={false}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Create your account</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Get started with RetailHub</p>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Full name</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <User size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Work email</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <Lock size={18} />
            </div>
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 2.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Must be at least 8 characters long</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>Confirm password</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <Lock size={18} />
            </div>
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 2.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            style={{ marginTop: '0.25rem' }} 
          />
          <label htmlFor="terms" style={{ fontSize: '0.875rem', color: '#0f172a', cursor: 'pointer' }}>
            I agree to the <a href="#" style={{ color: 'var(--color-primary)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--color-primary)' }}>Privacy Policy</a>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ width: '100%', padding: '0.875rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, transition: 'background-color 0.2s' }}
        >
          {isLoading ? 'Creating account...' : 'Create account →'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
        <span style={{ padding: '0 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>or sign up with</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
      </div>

      <button style={{ width: '100%', padding: '0.875rem', backgroundColor: 'white', color: '#0f172a', border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'background-color 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign up with Google
      </button>

      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        Already have an account? <button onClick={onNavigateToLogin} style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign in</button>
      </div>
    </AuthLayout>
  );
}
