// src/pages/ClubAdmin.js
import React, { useState, useEffect } from 'react';

const ClubAdmin = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This will be connected by A2
    // For now, show placeholder
    setTimeout(() => {
      setEvents([
        { _id: '1', title: 'Tech Workshop', date: '2025-12-25', venue: 'Lab 1', registrationCount: 15, capacity: 50 },
        { _id: '2', title: 'Cultural Fest', date: '2025-12-28', venue: 'Auditorium', registrationCount: 42, capacity: 100 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div>Loading club admin panel...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#DBA858', borderBottom: '2px solid #8C0E0F', paddingBottom: '0.5rem' }}>
        🛠️ Club Admin Dashboard
      </h1>
      
      <div style={{ 
        background: 'rgba(11, 40, 56, 0.3)', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginTop: '1.5rem',
        border: '1px solid #083248'
      }}>
        <h3 style={{ color: '#E89C31', marginBottom: '1rem' }}>📊 Quick Stats</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#DBA858' }}>{events.length}</div>
            <div style={{ color: '#A0AEC0' }}>Total Events</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#DBA858' }}>
              {events.reduce((sum, event) => sum + (event.registrationCount || 0), 0)}
            </div>
            <div style={{ color: '#A0AEC0' }}>Total Registrations</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#DBA858' }}>📅 Your Events</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {events.map(event => (
            <div key={event._id} style={{
              background: 'linear-gradient(135deg, #0B2838 0%, #083248 100%)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #8C0E0F',
              transition: 'transform 0.2s'
            }}>
              <h4 style={{ color: '#E89C31', marginBottom: '0.5rem' }}>
                {event.title}
              </h4>
              <p style={{ color: '#DBA858', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                📅 {new Date(event.date).toLocaleDateString()} | 🕒 2:00 PM
              </p>
              <p style={{ color: '#A0AEC0', marginBottom: '1rem' }}>📍 {event.venue}</p>
              
              <div style={{ 
                background: 'rgba(3, 27, 40, 0.5)', 
                padding: '0.8rem',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#DBA858' }}>Registrations:</span>
                  <span style={{ color: '#E89C31', fontWeight: 'bold' }}>
                    {event.registrationCount} / {event.capacity}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#031B28',
                  borderRadius: '3px',
                  marginTop: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(event.registrationCount / event.capacity) * 100}%`,
                    height: '100%',
                    background: '#E89C31',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: 'rgba(232, 156, 49, 0.2)',
                  color: '#E89C31',
                  border: '1px solid #E89C31',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Edit
                </button>
                <button style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: 'rgba(140, 14, 15, 0.2)',
                  color: '#DBA858',
                  border: '1px solid #8C0E0F',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  View Registrations
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#A0AEC0', fontSize: '0.9rem' }}>
        <p>⚡ Club Admin Panel - Built for Day 3 Features</p>
        <p>Events Management • Registration Lists • CSV Export</p>
      </div>
    </div>
  );
};

export default ClubAdmin;