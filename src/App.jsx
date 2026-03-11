import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import PropertiesPage from './pages/PropertiesPage.jsx';
import PropertyDetailPage from './pages/PropertyDetailPage.jsx';
import AdvancedSearchPage from './pages/AdvancedSearchPage.jsx';
import SavedSearchesPage from './pages/SavedSearchesPage.jsx';

const App = () => {
  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/properties" style={{ marginRight: '1rem' }}>
          Properties
        </Link>
        <Link to="/search" style={{ marginRight: '1rem' }}>
          Advanced Search
        </Link>
        <Link to="/saved-searches">Saved Searches</Link>
      </nav>

      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/properties" replace />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/search" element={<AdvancedSearchPage />} />
          <Route path="/saved-searches" element={<SavedSearchesPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
