import { useState } from 'react';
import './WorkDetail.css';

export default function WorkDetail({ work, onClose }) {
  const [currentImg, setCurrentImg] = useState(0);
  const images = work.images || [];

  const prevImg = () => setCurrentImg((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImg = () => setCurrentImg((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>✕</button>

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
                <button className="gallery-arrow left" onClick={prevImg}>‹</button>
                <button className="gallery-arrow right" onClick={nextImg}>›</button>
                <div className="gallery-counter">{currentImg + 1} / {images.length}</div>
              </>
            )}
          </div>
        ) : (
          <div className="detail-no-img">📄 No images</div>
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
          <h2 className="detail-name">{work.name}</h2>
          <span className="detail-date">
            {new Date(work.created_at).toLocaleDateString('es-MX', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
          {work.description && (
            <p className="detail-description">{work.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
