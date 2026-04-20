import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Images, Upload, Users as UsersIcon, CalendarDays, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import idLogo from '../../images/IDlogo.png';
import Stats from '../components/Stats';
import Portfolio from '../components/Portfolio';
import UploadWork from '../components/UploadWork';
import UsersList from '../components/Users';
import Appointments from '../components/Appointments';
import './Dashboard.css';

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'portfolio', label: 'Portfolio', icon: Images },
  { key: 'upload', label: 'Upload Work', icon: Upload },
  { key: 'users', label: 'Users', icon: UsersIcon },
  { key: 'appointments', label: 'Citas', icon: CalendarDays },
];

const SECTION_META = {
  overview:  { title: 'Overview',         subtitle: 'Dashboard summary and quick stats' },
  portfolio: { title: 'Portfolio',         subtitle: 'View and manage your work portfolio' },
  upload:    { title: 'Upload New Work',   subtitle: 'Add a new project to your portfolio' },
  users:     { title: 'Users',            subtitle: 'View registered users and their companies' },
  appointments: { title: 'Citas', subtitle: 'Revisa reuniones agendadas con su detalle completo' },
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const meta = SECTION_META[activeSection];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={idLogo} alt="Impactos Digitales" className="sidebar-logo-img" />
          </div>
          <div>
            <h2>Impactos Digitales</h2>
            <span className="sidebar-tagline">Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-item ${activeSection === key ? 'active' : ''}`}
              onClick={() => setActiveSection(key)}
            >
              <Icon size={19} strokeWidth={activeSection === key ? 2.2 : 1.8} />
              <span>{label}</span>
              {activeSection === key && <ChevronRight size={15} className="nav-arrow" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar">
              {admin?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="admin-details">
              <span className="admin-name">{admin?.username}</span>
              <span className="admin-role">Administrator</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1>{meta.title}</h1>
            <p className="header-subtitle">{meta.subtitle}</p>
          </div>
        </header>

        <div className="content-body">
          {activeSection === 'overview' && <Stats onNavigate={setActiveSection} />}
          {activeSection === 'portfolio' && <Portfolio />}
          {activeSection === 'upload' && (
            <UploadWork onSuccess={() => setActiveSection('portfolio')} />
          )}
          {activeSection === 'users' && <UsersList />}
          {activeSection === 'appointments' && <Appointments />}
        </div>
      </main>
    </div>
  );
}
