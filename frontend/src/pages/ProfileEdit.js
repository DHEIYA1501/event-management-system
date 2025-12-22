// src/pages/ProfileEdit.js
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const ProfileEdit = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get current user data
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      bio: userData.bio || ''
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await adminService.updateProfile(formData);
      localStorage.setItem('user', JSON.stringify(response.data));
      setMessage('✅ Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#DBA858' }}>Edit Profile</h1>
      
      {message && (
        <div style={{
          padding: '1rem',
          background: message.includes('✅') ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
          color: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('✅') ? '#28a745' : '#dc3545'}`,
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#DBA858' }}>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{ width: '100%', padding: '0.8rem', background: '#031B28', color: '#DBA858', border: '1px solid #083248', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#DBA858' }}>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{ width: '100%', padding: '0.8rem', background: '#031B28', color: '#DBA858', border: '1px solid #083248', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#DBA858' }}>Phone</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            style={{ width: '100%', padding: '0.8rem', background: '#031B28', color: '#DBA858', border: '1px solid #083248', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#DBA858' }}>Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows="4"
            style={{ width: '100%', padding: '0.8rem', background: '#031B28', color: '#DBA858', border: '1px solid #083248', borderRadius: '4px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #E89C31 0%, #DBA858 100%)',
            color: '#031B28',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfileEdit;