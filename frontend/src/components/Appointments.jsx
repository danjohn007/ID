import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  UserRound,
  Building2,
  Phone,
  Mail,
  BadgeCheck,
  FileText,
  Link as LinkIcon,
  Monitor,
  Copy,
  Check,
  ExternalLink,
  Send,
  Search,
  FileDown,
  StickyNote,
  X,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import './Appointments.css';

const WEEK_DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

function toDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toMonthKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

function formatDate(date) {
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return 'No disponible';
  return new Date(value).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(value) {
  if (!value) return '--:--';
  return new Date(value).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getModeLabel(mode, meetingLink) {
  const normalized = String(mode || '').trim().toUpperCase();
  const link = String(meetingLink || '').trim();

  const isVirtualByMode = [
    'VIRTUAL',
    'ONLINE',
    'REMOTO',
    'REMOTE',
    'MEET',
    'GOOGLE MEET',
    'ZOOM',
    'TEAMS',
    'WEBEX',
  ].includes(normalized);

  // If there is a meeting URL, treat the appointment as virtual.
  if (isVirtualByMode || link !== '') return 'Virtual';

  if (normalized === 'PRESENCIAL' || normalized === 'OFFLINE') return 'Presencial';

  return normalized ? normalized.charAt(0) + normalized.slice(1).toLowerCase() : 'Presencial';
}

const STATUS_LABELS = {
  SCHEDULED: 'Programada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
};

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Programada' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'NO_SHOW', label: 'No asistió' },
];

export default function Appointments() {
  const { token } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState([]);
  const [monthSummary, setMonthSummary] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [savingLink, setSavingLink] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/api/appointments', {
          params: {
            date: toDateKey(selectedDate),
            month: toMonthKey(currentMonth),
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        setAppointments(response.data.appointments || []);
        setMonthSummary(response.data.monthSummary || {});
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudieron cargar las citas.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token, selectedDate, currentMonth]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstDayWeek = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = new Date(year, month, 0).getDate();
    const grid = [];

    for (let i = firstDayWeek - 1; i >= 0; i -= 1) {
      grid.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        inMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      grid.push({
        date: new Date(year, month, day),
        inMonth: true,
      });
    }

    while (grid.length % 7 !== 0) {
      const nextDay = grid.length - (firstDayWeek + daysInMonth) + 1;
      grid.push({
        date: new Date(year, month + 1, nextDay),
        inMonth: false,
      });
    }

    return grid;
  }, [currentMonth]);

  const selectedDateKey = toDateKey(selectedDate);
  const todayKey = toDateKey(new Date());

  const handleMonthChange = (offset) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleDateClick = (date, inMonth) => {
    setSelectedDate(date);
    if (!inMonth) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const openAppointmentDetail = async (appointment) => {
    // Use row data immediately so detail view works even when legacy rows have id=0.
    setSelectedAppointment(appointment || null);

    const numericId = Number(appointment?.id ?? 0);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return;
    }

    try {
      setDetailLoading(true);
      const response = await api.get('/api/appointments/single', {
        params: { id: numericId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedAppointment(response.data.appointment || null);
    } catch (err) {
      // Keep showing list-row data if server detail request fails.
      setError(err.response?.data?.message || 'No se pudo cargar el detalle completo de la cita.');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    setLinkInput(selectedAppointment?.meeting_link || '');
    setNotesInput(selectedAppointment?.notes || '');
    setCopied(false);
  }, [selectedAppointment?.id]);

  const handleStatusChange = async (newStatus) => {
    if (!selectedAppointment?.id || statusSaving) return;
    try {
      setStatusSaving(true);
      await api.patch(
        '/api/appointments/single',
        { id: selectedAppointment.id, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedAppointment((prev) => ({ ...prev, status: newStatus }));
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedAppointment.id ? { ...a, status: newStatus } : a)),
      );
      showToast('Estatus actualizado');
    } catch (err) {
      showToast(err.response?.data?.message || 'No se pudo actualizar el estatus.', 'error');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSaveLink = async () => {
    if (!selectedAppointment?.id || savingLink) return;
    try {
      setSavingLink(true);
      await api.patch(
        '/api/appointments/single',
        { id: selectedAppointment.id, meeting_link: linkInput },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedAppointment((prev) => ({ ...prev, meeting_link: linkInput || null }));
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedAppointment.id ? { ...a, meeting_link: linkInput || null } : a)),
      );
      showToast('Liga guardada');
    } catch (err) {
      showToast(err.response?.data?.message || 'No se pudo guardar la liga.', 'error');
    } finally {
      setSavingLink(false);
    }
  };

  const handleCopyLink = () => {
    const link = selectedAppointment?.meeting_link;
    if (!link) return;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    const header = 'Nombre,Telefono,Empresa,Email,Interes,Modalidad,Hora,Estatus';
    const rows = appointments.map((a) =>
      [
        `"${a.name || a.user_name || ''}",`,
        `"${a.phone || ''}",`,
        `"${a.company || ''}",`,
        `"${a.email || ''}",`,
        `"${a.interest || ''}",`,
        `"${getModeLabel(a.mode, a.meeting_link)}",`,
        `"${formatTime(a.appointment_at)}",`,
        `"${STATUS_LABELS[a.status] || a.status || ''}"`,
      ].join(''),
    );
    const csv  = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const el   = document.createElement('a');
    el.href     = url;
    el.download = `citas-${toDateKey(selectedDate)}.csv`;
    el.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment?.id || savingNotes) return;
    try {
      setSavingNotes(true);
      await api.patch(
        '/api/appointments/single',
        { id: selectedAppointment.id, notes: notesInput },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedAppointment((prev) => ({ ...prev, notes: notesInput }));
      showToast('Nota guardada');
    } catch (err) {
      showToast(err.response?.data?.message || 'No se pudo guardar la nota.', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (a.name || a.user_name || '').toLowerCase().includes(q) ||
      (a.company || '').toLowerCase().includes(q) ||
      (a.phone || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="appointments-page">
      <section className="appointments-calendar-panel">
        <div className="calendar-header">
          <div className="calendar-title-wrap">
            <CalendarDays size={18} />
            <h3>Calendario de citas</h3>
          </div>
          <div className="calendar-controls">
            <button type="button" className="month-btn" onClick={() => handleMonthChange(-1)}>
              <ChevronLeft size={16} />
            </button>
            <span className="month-label">
              {currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </span>
            <button type="button" className="month-btn" onClick={() => handleMonthChange(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-grid-head">
          {WEEK_DAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map(({ date, inMonth }) => {
            const dateKey = toDateKey(date);
            const dayAppointments = monthSummary[dateKey] || 0;
            const isSelected = dateKey === selectedDateKey;
            const isToday = dateKey === todayKey;

            return (
              <button
                key={dateKey}
                type="button"
                className={`calendar-day ${inMonth ? '' : 'outside'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => handleDateClick(date, inMonth)}
              >
                <span className="day-number">{date.getDate()}</span>
                {dayAppointments > 0 && (
                  <span className="day-dot">
                    {dayAppointments > 9 ? '9+' : dayAppointments}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="appointments-list-panel">
        <div className="list-header">
          <h3>Citas del dia</h3>
          <p>{formatDate(selectedDate)}</p>
        </div>

        {!loading && !error && appointments.length > 0 && (
          <div className="list-toolbar">
            <div className="list-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Buscar por nombre, empresa o tel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="search-clear" onClick={() => setSearch('')}>
                  <X size={13} />
                </button>
              )}
            </div>
            <button type="button" className="list-export-btn" onClick={exportCSV} title="Exportar a CSV">
              <FileDown size={15} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="appointments-state">
            <div className="spinner" />
            <p>Cargando citas...</p>
          </div>
        ) : error ? (
          <div className="appointments-state error">
            <p>{error}</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="appointments-state empty">
            <p>No hay citas agendadas para este dia.</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="appointments-state empty">
            <p>No se encontraron citas con esa búsqueda.</p>
          </div>
        ) : (
          <div className="appointments-list">
            {filteredAppointments.map((appointment) => {
              const displayName = appointment.name || appointment.user_name || 'Sin nombre';
              return (
                <button
                  key={appointment.id}
                  type="button"
                  className="appointment-row"
                  onClick={() => openAppointmentDetail(appointment)}
                >
                  <div className="appointment-time">
                    <Clock3 size={14} />
                    <span>{formatTime(appointment.appointment_at)}</span>
                  </div>
                  <div className="appointment-main">
                    <strong>{displayName}</strong>
                    <span>
                      {appointment.interest || 'Sin interes definido'}
                      {' · '}
                      {getModeLabel(appointment.mode, appointment.meeting_link)}
                    </span>
                  </div>
                  <span className={`appointment-status ${String(appointment.status || '').toLowerCase()}`}>
                    {STATUS_LABELS[appointment.status] || appointment.status || 'Programada'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {(selectedAppointment || detailLoading) && (
        <div className="appointment-modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle de cita</h3>
              <button type="button" className="modal-close" onClick={() => setSelectedAppointment(null)}>
                <X size={16} />
              </button>
            </div>

            {detailLoading ? (
              <div className="appointments-state">
                <div className="spinner" />
                <p>Cargando detalle...</p>
              </div>
            ) : (
              selectedAppointment && (
                <div className="appointment-detail-grid">
                  <div className="detail-item">
                    <span><UserRound size={14} /> Nombre</span>
                    <strong>{selectedAppointment.name || selectedAppointment.user_name || 'Sin nombre'}</strong>
                  </div>
                  <div className="detail-item">
                    <span><Phone size={14} /> Telefono</span>
                    <strong>{selectedAppointment.phone || 'No registrado'}</strong>
                  </div>
                  <div className="detail-item">
                    <span><Mail size={14} /> Email</span>
                    <strong>{selectedAppointment.email || 'No registrado'}</strong>
                  </div>
                  <div className="detail-item">
                    <span><Building2 size={14} /> Empresa</span>
                    <strong>{selectedAppointment.company || 'No registrada'}</strong>
                  </div>
                  <div className="detail-item">
                    <span><FileText size={14} /> Evento</span>
                    <strong>{selectedAppointment.event_name || 'Sin evento'}</strong>
                  </div>
                  <div className="detail-item">
                    <span><Monitor size={14} /> Modalidad</span>
                    <strong>{getModeLabel(selectedAppointment.mode, selectedAppointment.meeting_link)}</strong>
                  </div>
                  <div className="detail-item wide">
                    <span><BadgeCheck size={14} /> Interes</span>
                    <strong>{selectedAppointment.interest || 'Sin detalle'}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Fecha de cita</span>
                    <strong>{formatDateTime(selectedAppointment.appointment_at)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Creada</span>
                    <strong>{formatDateTime(selectedAppointment.created_at)}</strong>
                  </div>
                  <div className="detail-item wide">
                    <span>Estatus</span>
                    <div className="detail-status-section">
                      <span className={`appointment-status ${String(selectedAppointment.status || 'scheduled').toLowerCase()}`}>
                        {STATUS_LABELS[selectedAppointment.status] || selectedAppointment.status || 'Programada'}
                      </span>
                      <div className="status-actions">
                        {STATUS_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            className={`status-btn ${value.toLowerCase()} ${selectedAppointment.status === value ? 'active' : ''}`}
                            onClick={() => handleStatusChange(value)}
                            disabled={statusSaving || selectedAppointment.status === value}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {getModeLabel(selectedAppointment.mode, selectedAppointment.meeting_link) === 'Virtual' && (
                    <div className="detail-item wide">
                      <span><LinkIcon size={14} /> Liga de reunion virtual</span>
                      {selectedAppointment.meeting_link && (
                        <div className="meeting-link-row">
                          <a
                            href={selectedAppointment.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="meeting-link"
                          >
                            {selectedAppointment.meeting_link}
                          </a>
                          <button
                            type="button"
                            className={`icon-btn copy-btn${copied ? ' copied' : ''}`}
                            onClick={handleCopyLink}
                            title={copied ? 'Copiado' : 'Copiar liga'}
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                          <a
                            href={selectedAppointment.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-btn"
                            title="Abrir en nueva pestaña"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      )}
                      <div className="link-editor">
                        <input
                          type="url"
                          className="link-input"
                          placeholder="https://meet.google.com/..."
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value)}
                        />
                        <button
                          type="button"
                          className="link-save-btn"
                          onClick={handleSaveLink}
                          disabled={savingLink || linkInput === (selectedAppointment.meeting_link || '')}
                        >
                          {savingLink ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          type="button"
                          className="link-share-btn"
                          disabled
                          title="Próximamente: compartir por correo"
                        >
                          <Send size={14} />
                          Compartir
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="detail-item wide">
                    <span><StickyNote size={14} /> Notas internas</span>
                    <textarea
                      className="notes-textarea"
                      placeholder="Agrega notas privadas sobre esta cita..."
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      rows={3}
                    />
                    <button
                      type="button"
                      className="link-save-btn"
                      onClick={handleSaveNotes}
                      disabled={savingNotes || notesInput === (selectedAppointment.notes || '')}
                      style={{ alignSelf: 'flex-end', marginTop: '0.35rem' }}
                    >
                      {savingNotes ? 'Guardando...' : 'Guardar nota'}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
