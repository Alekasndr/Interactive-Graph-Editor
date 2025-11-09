import { useState, useEffect, useRef } from 'react';
import '../styles/EdgePropertiesModal.css';

interface EdgePropertiesModalProps {
  isOpen: boolean;
  position: { x: number; y: number };
  edgeId: string | null;
  currentWeight?: number;
  onSubmit: (edgeId: string, weight?: number) => void;
  onCancel: () => void;
}

const EdgePropertiesModal = ({
  isOpen,
  position,
  edgeId,
  currentWeight,
  onSubmit,
  onCancel,
}: EdgePropertiesModalProps) => {
  const [weight, setWeight] = useState<string>('');
  const weightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setWeight(currentWeight !== undefined ? String(currentWeight) : '');
      setTimeout(() => weightInputRef.current?.focus(), 100);
    }
  }, [isOpen, currentWeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (edgeId) {
      const weightValue = weight.trim() === '' ? undefined : parseFloat(weight);
      onSubmit(edgeId, weightValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onCancel} />
      <div
        className="modal-container"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <h3>Edge Weight</h3>

          <label className="modal-label">
            Weight:
            <input
              ref={weightInputRef}
              type="number"
              step="any"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              className="modal-input"
            />
          </label>

          <div className="modal-buttons">
            <button type="submit" className="modal-btn modal-btn-primary">
              Apply
            </button>
            <button type="button" onClick={onCancel} className="modal-btn modal-btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EdgePropertiesModal;
