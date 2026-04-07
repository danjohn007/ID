import { useState, useEffect } from 'react';
import { Search, Building2, Mail, Phone, UserCircle, Download, AlertCircle, Tag } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Users.css';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.company || '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.event_name || '').toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const header = 'Name,Phone,Company,Email,Event';
    const rows = users.map(
      (u) =>
        `"${u.name}","${u.phone || ''}","${u.company || ''}","${u.email}","${u.event_name || ''}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="users-state">
        <div className="spinner" />
        <p>Loading users…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-state error">
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      {/* Toolbar */}
      <div className="users-toolbar">
        <div className="search-box">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, phone, company, email or event…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="export-btn" onClick={exportCSV} disabled={users.length === 0}>
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="users-summary">
        <span>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
        {search && <span className="summary-filter">filtered from {users.length} total</span>}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="users-state empty">
          <UserCircle size={40} />
          <p>{search ? 'No users match your search' : 'No users registered yet'}</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Email</th>
                <th>Event</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-tbl">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name-tbl">{user.name}</span>
                    </div>
                  </td>
                  <td>
                    {user.phone ? (
                      <div className="phone-cell">
                        <Phone size={14} />
                        <span>{user.phone}</span>
                      </div>
                    ) : (
                      <span className="empty-cell">—</span>
                    )}
                  </td>
                  <td>
                    {user.company ? (
                      <div className="company-cell">
                        <Building2 size={14} />
                        <span>{user.company}</span>
                      </div>
                    ) : (
                      <span className="empty-cell">—</span>
                    )}
                  </td>
                  <td>
                    <div className="email-cell">
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    {user.event_name ? (
                      <div className="event-cell">
                        <Tag size={14} />
                        <span>{user.event_name}</span>
                      </div>
                    ) : (
                      <span className="empty-cell">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
