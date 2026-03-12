import React, { useEffect, useState } from "react";

const SavedSearchesPage = () => {
  const [savedProperties, setSavedProperties] = useState([]);

  useEffect(() => {
    const existing = JSON.parse(
      window.localStorage.getItem("savedProperties") || "[]"
    );
    setSavedProperties(existing);
  }, []);

  if (!savedProperties.length) {
    return (
      <div>
        <h1>Saved Searches</h1>
        <div data-testid="no-saved-searches">
          You have no saved properties yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Saved Searches</h1>
      <div>
        {savedProperties.map((p) => (
          <div
            key={p.id}
            data-testid={`saved-search-${p.id}`}
            style={{
              borderBottom: "1px solid #e5e7eb",
              padding: "0.75rem"
            }}
          >
            <div>{p.title}</div>
            <div>
              ${p.price.toLocaleString()} – {p.city}, {p.state}
            </div>
            <button
              type="button"
              data-testid={`delete-search-${p.id}`}
              onClick={() => {
                const updated = savedProperties.filter((sp) => sp.id !== p.id);
                setSavedProperties(updated);
                window.localStorage.setItem(
                  "savedProperties",
                  JSON.stringify(updated)
                );
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedSearchesPage;
