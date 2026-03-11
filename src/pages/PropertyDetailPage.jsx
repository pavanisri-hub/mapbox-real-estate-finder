import React from 'react';
import { useParams } from 'react-router-dom';

const PropertyDetailPage = () => {
  const { id } = useParams();

  return (
    <div data-testid="property-detail-container">
      <h1 data-testid="property-title">Property {id} title placeholder</h1>
      <div data-testid="property-price">Price placeholder</div>
      <div data-testid="property-full-address">Full address placeholder</div>

      <div
        style={{ border: '1px solid #ccc', minHeight: 300, marginTop: '1rem' }}
        data-testid="property-map"
      >
        Property map placeholder
      </div>

      <div data-testid="property-coordinates">
        Coordinates placeholder
      </div>

      <div data-testid="nearby-amenities">
        Nearby amenities placeholder
      </div>
    </div>
  );
};

export default PropertyDetailPage;
