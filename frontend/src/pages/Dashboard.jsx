import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Portfolio from '../components/Portfolio';
import UploadWork from '../components/UploadWork';
import './Dashboard.css';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('portfolio');
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-icon">🎨</span>
          <h2>Portfolio</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveSection('portfolio')}
          >
            <span className="nav-icon">🖼️</span>
            <span>Portfolio</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveSection('upload')}
          >
            <span className="nav-icon">⬆️</span>
            <span>Upload Work</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <span className="admin-avatar">👤</span>
            <span className="admin-name">{admin?.username}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="content-header">
          <h1>{activeSection === 'portfolio' ? '📁 My Portfolio' : '⬆️ Upload New Work'}</h1>
          <p className="header-subtitle">
            {activeSection === 'portfolio'
              ? 'View and manage your work portfolio'
              : 'Add a new project to your portfolio'}
          </p>
        </header>

        <div className="content-body">
          {activeSection === 'portfolio' ? (
            <Portfolio />
          ) : (
            <UploadWork onSuccess={() => setActiveSection('portfolio')} />
          )}
        </div>
      </main>
    </div>
  );
}
