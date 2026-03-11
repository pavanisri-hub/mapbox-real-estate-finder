import React from 'react';

const SavedSearchesPage = () => {
  const hasSavedSearches = false;

  if (!hasSavedSearches) {
    return (
      <div>
        <h1>Saved Searches</h1>
        <div data-testid="no-saved-searches">
          You have no saved searches yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Saved Searches</h1>
      <div data-testid="saved-search-1">
        <button data-testid="load-search-1">Load</button>
        <button data-testid="delete-search-1">Delete</button>
      </div>
    </div>
  );
};

export default SavedSearchesPage;
