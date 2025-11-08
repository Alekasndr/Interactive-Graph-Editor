import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useGraphStore } from '../stores/StoreContext';
import '../styles/SearchBar.css';

const SearchBar: React.FC = observer(() => {
  const graphStore = useGraphStore();
  const [inputValue, setInputValue] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (graphStore.searchQuery === '') {
      setInputValue('');
      setSearched(false);
    }
  }, [graphStore.searchQuery]);

  const handleSearch = () => {
    if (inputValue.trim()) {
      graphStore.setSearchQuery(inputValue);
      setSearched(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (event.target.value === '') {
      graphStore.setSearchQuery('');
      setSearched(false);
    }
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search nodes by name..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button className="search-button" onClick={handleSearch}>
        Search
      </button>
      {searched && graphStore.searchQuery && !graphStore.highlightedNodeId && (
        <span className="search-not-found">Node not found</span>
      )}
    </div>
  );
});

export default SearchBar;
