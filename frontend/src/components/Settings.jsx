import { useState } from 'react';
import { KeyRound, Eye, EyeOff, Save } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import './Settings.css';

const FIELDS = [
  { key: 'current', label: 'Contraseña actual',          autoComplete: 'current-password' },
  { key: 'next',    label: 'Nueva contraseña',            autoComplete: 'new-password' },
  { key: 'confirm', label: 'Confirmar nueva contraseña',  autoComplete: 'new-password' },
];

export default function Settings() {
  const { token } = useAuth();
  const showToast = useToast();
  const [form, setForm]   = useState({ current: '', next: '', confirm: '' });
  const [show, setShow]   = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleShow = (field) => () =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      showToast('Las contraseñas nuevas no coinciden', 'error');
      return;
    }
    if (form.next.length < 8) {
      showToast('La nueva contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }
    try {
      setSaving(true);
      await api.post(
        '/api/auth/change-password',
        { current_password: form.current, new_password: form.next },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast('Contraseña actualizada correctamente');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al cambiar la contraseña', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-card">
        <div className="settings-card-header">
          <KeyRound size={18} />
          <h3>Cambiar contraseña</h3>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          {FIELDS.map(({ key, label, autoComplete }) => (
            <div key={key} className="settings-field">
              <label htmlFor={`pwd-${key}`}>{label}</label>
              <div className="settings-input-wrap">
                <input
                  id={`pwd-${key}`}
                  type={show[key] ? 'text' : 'password'}
                  value={form[key]}
                  onChange={handleChange(key)}
                  autoComplete={autoComplete}
                  required
                />
                <button type="button" className="pwd-toggle" onClick={toggleShow(key)}>
                  {show[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" className="settings-save-btn" disabled={saving}>
            <Save size={15} />
            {saving ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
