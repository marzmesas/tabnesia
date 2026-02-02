import React from 'react';
import { useSearchContext } from '../context/SearchContext';

export const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useSearchContext();

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search tabs by title or URL..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button
          className="search-clear"
          onClick={() => setSearchQuery('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};
