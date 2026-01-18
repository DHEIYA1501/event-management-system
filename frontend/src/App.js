import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import Profile from './pages/Profile';
import EventDetails from './pages/EventDetails';
import ClubAdmin from './pages/ClubAdmin';
import { useAuth } from './contexts/AuthContext';
import ProfileEdit from './pages/ProfileEdit';

function App() {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const handleLogout = () => {
    logout();
  };

  return (
    <Router>
      <div className="App">
        <header style={{ 
          background: 'linear-gradient(135deg, #0B2838 0%, #083248 100%)',
          color: '#DBA858',
          padding: '1rem 2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          borderBottom: '3px solid #8C0E0F',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <Link to="/" style={{ 
              color: '#E89C31', 
              textDecoration: 'none',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🎯 <span style={{ color: '#DBA858' }}>Event</span>
              <span style={{ color: '#E89C31' }}>Hub</span>
            </Link>
            
            <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link to="/" style={{ 
                color: '#DBA858', 
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 0.8rem',
                borderRadius: '4px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(219, 168, 88, 0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                🏠 Home
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link to="/events" style={{ 
                    color: '#DBA858', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '0.5rem 0.8rem',
                    borderRadius: '4px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(219, 168, 88, 0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                    📅 Events
                  </Link>
                  
                  <Link to="/profile" style={{ 
                    color: '#DBA858', 
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '0.5rem 0.8rem',
                    borderRadius: '4px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(219, 168, 88, 0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                    👤 Profile
                  </Link>
                  
                  {/* Club Admin Panel Link */}
                  {user.role === 'club_admin' && (
                    <Link 
                      to="/club-admin" 
                      style={{ 
                        color: '#DBA858', 
                        textDecoration: 'none',
                        fontWeight: '500',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '4px',
                        background: 'rgba(140, 14, 15, 0.1)',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(140, 14, 15, 0.2)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(140, 14, 15, 0.1)'}
                    >
                      🛠️ Club Admin
                    </Link>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ 
                      background: 'rgba(140, 14, 15, 0.2)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      border: '1px solid #8C0E0F'
                    }}>
                      <span style={{ color: '#E89C31', fontSize: '0.9rem' }}>
                        👤 {user.name?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                      </span>
                      <span style={{ 
                        marginLeft: '0.5rem',
                        background: (user.role === 'club_admin' || user.role === 'admin') ? '#8C0E0F' : '#0B2838',
                        color: '#DBA858',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}>
                        {user.role || 'student'}
                      </span>
                    </div>
                    
                    <button 
                      onClick={handleLogout}
                      style={{ 
                        background: 'linear-gradient(135deg, #8C0E0F 0%, #B22222 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" style={{ 
                    background: 'rgba(232, 156, 49, 0.1)',
                    color: '#E89C31',
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '0.5rem 1.2rem',
                    borderRadius: '4px',
                    border: '1px solid #E89C31',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(232, 156, 49, 0.2)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(232, 156, 49, 0.1)'}>
                    🔐 Login
                  </Link>
                  
                  <Link to="/register" style={{ 
                    background: 'linear-gradient(135deg, #E89C31 0%, #DBA858 100%)',
                    color: '#031B28',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    padding: '0.5rem 1.2rem',
                    borderRadius: '4px',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                  }}>
                    📝 Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        
        <main style={{ 
          padding: '2rem',
          maxWidth: '1200px', 
          margin: '0 auto',
          minHeight: 'calc(100vh - 180px)'
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/club-admin" element={<ClubAdmin />} />
          </Routes>
        </main>
        
        <footer style={{ 
          background: 'linear-gradient(135deg, #031B28 0%, #0B2838 100%)',
          color: '#DBA858',
          padding: '1.5rem 2rem',
          textAlign: 'center',
          borderTop: '2px solid #083248',
          marginTop: '3rem'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <strong>🎯 EventHub</strong> - College Event Management System
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem',
              fontSize: '0.8rem',
              color: '#A0AEC0',
              marginTop: '0.5rem'
            }}>
              <span>🌐 Frontend: http://localhost:3000</span>
              <span>⚙️ Backend: http://localhost:5000</span>
              <span>📊 Status: {isLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}</span>
              <span>👤 Role: {user?.role || 'Not logged in'}</span>
            </div>
            <p style={{ 
              marginTop: '1rem', 
              fontSize: '0.8rem', 
              color: '#E89C31',
              borderTop: '1px solid #083248',
              paddingTop: '0.8rem'
            }}>
              Built with React & Node.js • Color Palette: #031B28 #0B2838 #083248 #8C0E0F #E89C31 #DBA858
            </p>
            <div style={{ 
              marginTop: '0.8rem', 
              fontSize: '0.7rem', 
              color: '#8C0E0F',
              padding: '0.5rem',
              background: 'rgba(140, 14, 15, 0.1)',
              borderRadius: '4px'
            }}>
              🚀 Day 3 Features: Club Admin Panel • Event Management • Registration Lists • CSV Export
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;