import { useState, useEffect } from 'react';
import { Images, Users, Upload, ArrowUpRight, Calendar } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Stats.css';

export default function Stats({ onNavigate }) {
  const [works, setWorks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [worksRes, usersRes] = await Promise.all([
          api.get('/api/works', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setWorks(worksRes.data.works || []);
        setUsers(usersRes.data.users || []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="spinner" />
      </div>
    );
  }

  const totalImages = works.reduce((sum, w) => sum + (w.images?.length || 0), 0);
  const recentWorks = works.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  return (
    <div className="stats-page">
      {/* Stat cards */}
      <div className="stat-cards">
        <button className="stat-card" onClick={() => onNavigate('portfolio')}>
          <div className="stat-icon blue"><Images size={20} /></div>
          <div className="stat-data">
            <span className="stat-value">{works.length}</span>
            <span className="stat-label">Projects</span>
          </div>
          <ArrowUpRight size={16} className="stat-arrow" />
        </button>

        <button className="stat-card" onClick={() => onNavigate('users')}>
          <div className="stat-icon green"><Users size={20} /></div>
          <div className="stat-data">
            <span className="stat-value">{users.length}</span>
            <span className="stat-label">Users</span>
          </div>
          <ArrowUpRight size={16} className="stat-arrow" />
        </button>

        <button className="stat-card" onClick={() => onNavigate('portfolio')}>
          <div className="stat-icon purple"><Upload size={20} /></div>
          <div className="stat-data">
            <span className="stat-value">{totalImages}</span>
            <span className="stat-label">Images</span>
          </div>
          <ArrowUpRight size={16} className="stat-arrow" />
        </button>
      </div>

      {/* Recent activity */}
      <div className="stats-grid">
        <div className="stats-section">
          <div className="section-header">
            <h3>Recent Projects</h3>
            <button className="section-link" onClick={() => onNavigate('portfolio')}>
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          {recentWorks.length === 0 ? (
            <p className="empty-text">No projects yet</p>
          ) : (
            <div className="recent-list">
              {recentWorks.map((w) => (
                <div key={w.id} className="recent-item">
                  <div className="recent-thumb">
                    {w.images?.[0] ? (
                      <img src={w.images[0].image_url} alt={w.name} />
                    ) : (
                      <div className="thumb-placeholder"><Images size={16} /></div>
                    )}
                  </div>
                  <div className="recent-info">
                    <span className="recent-name">{w.name}</span>
                    <span className="recent-meta">
                      <Calendar size={12} />
                      {new Date(w.created_at).toLocaleDateString('es-MX', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="recent-badge">{w.images?.length || 0} img</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stats-section">
          <div className="section-header">
            <h3>Recent Users</h3>
            <button className="section-link" onClick={() => onNavigate('users')}>
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          {recentUsers.length === 0 ? (
            <p className="empty-text">No users yet</p>
          ) : (
            <div className="recent-list">
              {recentUsers.map((u) => (
                <div key={u.id} className="recent-item">
                  <div className="user-avatar-sm">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="recent-info">
                    <span className="recent-name">{u.name}</span>
                    <span className="recent-meta">{u.email}</span>
                  </div>
                  {u.company && <span className="recent-badge">{u.company}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
