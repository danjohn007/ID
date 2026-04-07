import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import idLogo from '../../images/IDlogo.png';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      if (response.data.success) {
        login(response.data.token, response.data.admin);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error connecting to server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-logo">
            <img src={idLogo} alt="Impactos Digitales" className="brand-logo-img" />
          </div>
          <h1>Impactos Digitales</h1>
          <p>Portfolio Management Dashboard</p>
        </div>
        <div className="login-features">
          <div className="feature-item">
            <div className="feature-dot" />
            <span>Manage your portfolio projects</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot" />
            <span>Track client interactions</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot" />
            <span>Upload and organize your work</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
