import { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './UploadWork.css';

export default function UploadWork({ onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { token } = useAuth();

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newPreviews = files.map((f) => {
      const url = URL.createObjectURL(f);
      return url.startsWith('blob:') ? url : null;
    }).filter(Boolean);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    if (imagePreviews[index]) URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    imagePreviews.forEach((url) => url && URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Work name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      imageFiles.forEach((file) => {
        formData.append('images[]', file);
      });

      await api.post('/api/works', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      resetForm();
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload work. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        {success && (
          <div className="upload-success">
            ✅ Work uploaded successfully! Redirecting to portfolio…
          </div>
        )}
        {error && <div className="upload-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="work-name">
                Work Name <span className="required">*</span>
              </label>
              <input
                id="work-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. E-commerce Website"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="work-description">Description</label>
            <textarea
              id="work-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this project…"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Images</label>
            <div className="images-grid">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="preview-wrapper small">
                  <img src={preview} alt={`Preview ${idx + 1}`} className="preview-img" />
                  <button type="button" className="remove-preview" onClick={() => removeImage(idx)}>✕</button>
                </div>
              ))}
              <label htmlFor="images-input" className="file-drop-zone add-more">
                <span>🖼️</span>
                <span>{imageFiles.length === 0 ? 'Click to upload images' : '+ Add more'}</span>
                <span className="file-hint">JPG, PNG, GIF, WEBP</span>
              </label>
            </div>
            <input
              id="images-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="hidden-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Clear Form
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Uploading…' : '⬆️ Upload Work'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
