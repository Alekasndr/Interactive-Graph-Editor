import React from 'react';
import '../styles/NodeCreationModal.css';

interface PathFindingInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PathFindingInstructionsModal: React.FC<PathFindingInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div
        className="modal-container"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '400px',
        }}
      >
        <div>
          <h3>Path-Finding Instructions</h3>
          <div style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            <p><strong>How to use:</strong></p>
            <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li>Click on the <strong>first node</strong> (start point)</li>
              <li>Click on a <strong>different node</strong> (end point)</li>
              <li>The shortest path will be highlighted for 5 seconds</li>
            </ol>
          </div>
          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
              className="modal-btn modal-btn-primary"
              style={{ width: '100%' }}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PathFindingInstructionsModal;
