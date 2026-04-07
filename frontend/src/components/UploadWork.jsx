import { useState } from 'react';
import { ImagePlus, X, CheckCircle, AlertCircle, RotateCcw, Upload, FileText } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './UploadWork.css';

export default function UploadWork({ onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
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
    setPdfFile(null);
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
      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }
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
            <CheckCircle size={18} />
            <span>Work uploaded successfully! Redirecting to portfolio…</span>
          </div>
        )}
        {error && (
          <div className="upload-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

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
                  <button type="button" className="remove-preview" onClick={() => removeImage(idx)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label htmlFor="images-input" className="file-drop-zone add-more">
                <ImagePlus size={24} />
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

          <div className="form-group">
            <label>PDF Portfolio</label>
            {pdfFile ? (
              <div className="pdf-selected">
                <FileText size={18} />
                <span className="pdf-name">{pdfFile.name}</span>
                <button type="button" className="remove-pdf" onClick={() => setPdfFile(null)}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label htmlFor="pdf-input" className="file-drop-zone pdf-zone">
                <FileText size={24} />
                <span>Click to upload a PDF</span>
                <span className="file-hint">PDF up to 100 MB</span>
              </label>
            )}
            <input
              id="pdf-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                if (e.target.files[0]) setPdfFile(e.target.files[0]);
                e.target.value = '';
              }}
              className="hidden-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={resetForm}>
              <RotateCcw size={15} />
              Clear Form
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : (
                <>
                  <Upload size={16} />
                  Upload Work
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
