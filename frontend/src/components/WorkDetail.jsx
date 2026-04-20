import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ImageIcon, Calendar, FileText, Pencil, Save, RotateCcw, AlertCircle } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './WorkDetail.css';

export default function WorkDetail({ work, onClose, onUpdated }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(work.name || '');
  const [description, setDescription] = useState(work.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const images = work.images || [];
  const { token } = useAuth();

  useEffect(() => {
    setName(work.name || '');
    setDescription(work.description || '');
    setError('');
    setIsEditing(false);
  }, [work]);

  const prevImg = () => setCurrentImg((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImg = () => setCurrentImg((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleCancelEdit = () => {
    setName(work.name || '');
    setDescription(work.description || '');
    setError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError('El nombre del portafolio es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const response = await api.put(
        `/api/works/${work.id}`,
        {
          name: cleanName,
          description: description.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.work) {
        onUpdated && onUpdated(response.data.work);
      }

      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el portafolio.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Image gallery */}
        {images.length > 0 ? (
          <div className="detail-gallery">
            <img
              src={images[currentImg].image_url}
              alt={`${work.name} - ${currentImg + 1}`}
              className="detail-main-img"
            />
            {images.length > 1 && (
              <>
                <button className="gallery-arrow left" onClick={prevImg}>
                  <ChevronLeft size={24} />
                </button>
                <button className="gallery-arrow right" onClick={nextImg}>
                  <ChevronRight size={24} />
                </button>
                <div className="gallery-counter">{currentImg + 1} / {images.length}</div>
              </>
            )}
          </div>
        ) : (
          <div className="detail-no-img">
            <ImageIcon size={40} />
            <span>No images</span>
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="detail-thumbs">
            {images.map((img, idx) => (
              <img
                key={img.id || idx}
                src={img.image_url}
                alt={`Thumb ${idx + 1}`}
                className={`detail-thumb ${idx === currentImg ? 'active' : ''}`}
                onClick={() => setCurrentImg(idx)}
              />
            ))}
          </div>
        )}

        {/* Info */}
        <div className="detail-info">
          <div className="detail-top-row">
            <span className="detail-date">
              <Calendar size={14} />
              {new Date(work.created_at).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
            {!isEditing ? (
              <button className="detail-action-btn" onClick={() => setIsEditing(true)}>
                <Pencil size={15} />
                Editar
              </button>
            ) : (
              <div className="detail-edit-actions">
                <button className="detail-action-btn ghost" onClick={handleCancelEdit} disabled={saving}>
                  <RotateCcw size={14} />
                  Cancelar
                </button>
                <button className="detail-action-btn" onClick={handleSave} disabled={saving}>
                  <Save size={15} />
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="detail-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {isEditing ? (
            <div className="detail-edit-form">
              <label htmlFor="work-name-edit">Nombre</label>
              <input
                id="work-name-edit"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                disabled={saving}
              />

              <label htmlFor="work-description-edit">Descripcion</label>
              <textarea
                id="work-description-edit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                disabled={saving}
              />
            </div>
          ) : (
            <>
              <h2 className="detail-name">{work.name}</h2>
              {work.description && (
                <p className="detail-description">{work.description}</p>
              )}
            </>
          )}

          {work.pdf_url && (
            <a
              href={work.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-pdf-btn"
            >
              <FileText size={16} />
              View PDF Portfolio
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
