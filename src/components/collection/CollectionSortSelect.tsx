import React from 'react';

export interface CollectionSortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CollectionSortSelect: React.FC<CollectionSortSelectProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="sort-select-wrapper">
      <label htmlFor="collectionSortSelect" className="sort-label">
        Sort By:
      </label>
      <select
        id="collectionSortSelect"
        className="sort-select"
        aria-label="Sort collection items"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="lot-asc">Item # · Low to High</option>
        <option value="lot-desc">Item # · High to Low</option>
        <option value="price-asc">Price · Low to High</option>
        <option value="price-desc">Price · High to Low</option>
        <option value="title-asc">Title · A to Z</option>
      </select>
    </div>
  );
};
