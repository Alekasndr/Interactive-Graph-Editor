import React from 'react';
import '../styles/PathFindingButton.css';

interface PathFindingButtonProps {
  onClick: () => void;
  isActive: boolean;
}

const PathFindingButton: React.FC<PathFindingButtonProps> = ({ onClick, isActive }) => {
  return (
    <button
      className={`pathfinding-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title="Find shortest path between two nodes"
    >
      {isActive ? 'Cancel Path Finding' : 'Run Path-Finding'}
    </button>
  );
};

export default PathFindingButton;
