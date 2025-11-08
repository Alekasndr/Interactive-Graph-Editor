import { useState, useEffect, useRef } from 'react';
import './NodeCreationModal.css';

interface NodeCreationModalProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onSubmit: (label: string, setError: (error: string) => void) => void;
  onCancel: () => void;
}

const NodeCreationModal = ({ isOpen, position, onSubmit, onCancel }: NodeCreationModalProps) => {
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLabel('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Please enter a node label');
      return;
    }
    onSubmit(label.trim(), setError);
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
          <h3>Create Node</h3>
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter node name"
            className="modal-input"
          />
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-buttons">
            <button type="submit" className="modal-btn modal-btn-primary">
              Create
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

export default NodeCreationModal;
