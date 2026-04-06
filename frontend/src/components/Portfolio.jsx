import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import WorkDetail from './WorkDetail';
import './Portfolio.css';

export default function Portfolio() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const { token } = useAuth();

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/works', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorks(res.data.works || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this work?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/api/works/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorks((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete work');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="portfolio-state">
        <div className="spinner" />
        <p>Loading portfolio…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-state error">
        <span>⚠️</span>
        <p>{error}</p>
        <button className="retry-btn" onClick={fetchWorks}>Retry</button>
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="portfolio-state empty">
        <span>📂</span>
        <p>No works yet. Start by uploading your first project!</p>
      </div>
    );
  }

  const getCoverImage = (work) => {
    if (work.images && work.images.length > 0) return work.images[0].image_url;
    return null;
  };

  return (
    <>
      <div className="portfolio-grid">
        {works.map((work) => (
          <div key={work.id} className="work-card" onClick={() => setSelectedWork(work)}>
            <div className="work-media">
              {getCoverImage(work) ? (
                <img src={getCoverImage(work)} alt={work.name} className="work-image" />
              ) : (
                <div className="work-no-media">📄</div>
              )}
              {work.images && work.images.length > 1 && (
                <span className="work-img-count">📷 {work.images.length}</span>
              )}
            </div>
            <div className="work-info">
              <h3 className="work-name">{work.name}</h3>
              {work.description && (
                <p className="work-description">{work.description}</p>
              )}
              <div className="work-meta">
                <span className="work-date">
                  {new Date(work.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <button
                  className="delete-btn"
                  onClick={(e) => handleDelete(e, work.id)}
                  disabled={deletingId === work.id}
                >
                  {deletingId === work.id ? 'Deleting…' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedWork && (
        <WorkDetail work={selectedWork} onClose={() => setSelectedWork(null)} />
      )}
    </>
  );
}
