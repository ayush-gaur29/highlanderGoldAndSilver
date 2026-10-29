import React from 'react';
import { Icons } from '../../utils/icons';

export interface CollectionSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export const CollectionSearchBar: React.FC<CollectionSearchBarProps> = ({
  value,
  onChange,
  onClear
}) => {
  return (
    <div className="search-input-wrapper">
      <span className="search-icon">
        <Icons.Search size={16} />
      </span>
      <input
        type="text"
        id="collectionSearchInput"
        className="search-input"
        placeholder="Search collection by item #, coin, metal, grade..."
        aria-label="Search available precious metals"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className={`clear-search-btn ${value.length > 0 ? 'visible' : ''}`}
        id="clearSearchBtn"
        aria-label="Clear search query"
        onClick={onClear}
      >
        <Icons.Close size={16} />
      </button>
    </div>
  );
};
