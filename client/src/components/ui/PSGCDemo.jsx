import React, { useState, useCallback } from 'react';
import { psgcAPI } from '../../services/psgcAPI';

const PSGCDemo = () => {
  const [searchQuery, setSearchQuery] = useState({
    province: '',
    municipality: '',
    barangay: ''
  });
  const [searchResults, setSearchResults] = useState({
    province: [],
    municipality: [],
    barangay: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search provinces
  const handleProvinceSearch = useCallback(async (query) => {
    setSearchQuery(prev => ({ ...prev, province: query }));
    
    if (query.length < 2) {
      setSearchResults(prev => ({ ...prev, province: [] }));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await psgcAPI.searchProvinces(query);
      setSearchResults(prev => ({ ...prev, province: results }));
    } catch (error) {
      setError('Error searching provinces: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search municipalities
  const handleMunicipalitySearch = useCallback(async (query) => {
    setSearchQuery(prev => ({ ...prev, municipality: query }));
    
    if (query.length < 2) {
      setSearchResults(prev => ({ ...prev, municipality: [] }));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await psgcAPI.searchMunicipalities(query);
      setSearchResults(prev => ({ ...prev, municipality: results }));
    } catch (error) {
      setError('Error searching municipalities: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search barangays
  const handleBarangaySearch = useCallback(async (query) => {
    setSearchQuery(prev => ({ ...prev, barangay: query }));
    
    if (query.length < 2) {
      setSearchResults(prev => ({ ...prev, barangay: [] }));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await psgcAPI.searchBarangays(query);
      setSearchResults(prev => ({ ...prev, barangay: results }));
    } catch (error) {
      setError('Error searching barangays: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Test API endpoints
  const testAPIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing PSGC APIs...');
      
      // Test provinces
      const provinces = await psgcAPI.getProvinces();
      console.log('Provinces:', provinces.slice(0, 5));
      
      // Test municipalities
      const municipalities = await psgcAPI.getMunicipalities();
      console.log('Municipalities:', municipalities.slice(0, 5));
      
      // Test barangays
      const barangays = await psgcAPI.getBarangays();
      console.log('Barangays:', barangays.slice(0, 5));
      
      alert('PSGC APIs tested successfully! Check console for results.');
    } catch (error) {
      setError('Error testing APIs: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>
        PSGC API Integration Demo
      </h2>

      {/* Test APIs Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={testAPIs}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {loading ? 'Testing...' : 'Test PSGC APIs'}
        </button>
      </div>

      {error && (
        <div style={{ 
          color: 'var(--red)', 
          backgroundColor: 'rgba(255, 0, 0, 0.1)', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '2rem' 
        }}>
          {error}
        </div>
      )}

      {/* Province Search */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Search Provinces</h3>
        <input
          type="text"
          value={searchQuery.province}
          onChange={(e) => handleProvinceSearch(e.target.value)}
          placeholder="Type to search provinces..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--gray)',
            fontSize: '14px'
          }}
        />
        {searchResults.province.length > 0 && (
          <div style={{ 
            marginTop: '8px', 
            maxHeight: '200px', 
            overflowY: 'auto',
            border: '1px solid var(--gray)',
            borderRadius: '6px'
          }}>
            {searchResults.province.map((province, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--light-gray)',
                  fontSize: '14px'
                }}
              >
                <strong>{province.name}</strong>
                {province.regionName && (
                  <span style={{ color: 'var(--gray)', marginLeft: '8px' }}>
                    ({province.regionName})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Municipality Search */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Search Municipalities</h3>
        <input
          type="text"
          value={searchQuery.municipality}
          onChange={(e) => handleMunicipalitySearch(e.target.value)}
          placeholder="Type to search municipalities..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--gray)',
            fontSize: '14px'
          }}
        />
        {searchResults.municipality.length > 0 && (
          <div style={{ 
            marginTop: '8px', 
            maxHeight: '200px', 
            overflowY: 'auto',
            border: '1px solid var(--gray)',
            borderRadius: '6px'
          }}>
            {searchResults.municipality.map((municipality, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--light-gray)',
                  fontSize: '14px'
                }}
              >
                <strong>{municipality.name}</strong>
                {municipality.provinceName && (
                  <span style={{ color: 'var(--gray)', marginLeft: '8px' }}>
                    ({municipality.provinceName})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barangay Search */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Search Barangays</h3>
        <input
          type="text"
          value={searchQuery.barangay}
          onChange={(e) => handleBarangaySearch(e.target.value)}
          placeholder="Type to search barangays..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--gray)',
            fontSize: '14px'
          }}
        />
        {searchResults.barangay.length > 0 && (
          <div style={{ 
            marginTop: '8px', 
            maxHeight: '200px', 
            overflowY: 'auto',
            border: '1px solid var(--gray)',
            borderRadius: '6px'
          }}>
            {searchResults.barangay.map((barangay, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--light-gray)',
                  fontSize: '14px'
                }}
              >
                <strong>{barangay.name}</strong>
                {barangay.municipalityName && (
                  <span style={{ color: 'var(--gray)', marginLeft: '8px' }}>
                    ({barangay.municipalityName})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Information */}
      <div style={{ 
        backgroundColor: 'var(--light-gray)', 
        padding: '1rem', 
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <h4 style={{ marginBottom: '0.5rem' }}>API Endpoints Used:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li><code>https://psgc.cloud/api/provinces</code> - Get all provinces</li>
          <li><code>https://psgc.cloud/api/municipalities</code> - Get all municipalities</li>
          <li><code>https://psgc.cloud/api/barangays</code> - Get all barangays</li>
          <li>Search endpoints with query parameters for filtering</li>
        </ul>
      </div>
    </div>
  );
};

export default PSGCDemo;
