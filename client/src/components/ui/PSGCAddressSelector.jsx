import React, { useState, useEffect, useCallback } from 'react';
import { usePSGCAddressData } from '../../hooks/usePSGCAddressData';

const PSGCAddressSelector = ({
  selectedProvince,
  selectedMunicipality,
  selectedBarangay,
  onProvinceChange,
  onMunicipalityChange,
  onBarangayChange,
  required = false,
  disabled = false,
  className = '',
  style = {}
}) => {
  const {
    provinces,
    municipalities,
    barangays,
    loading,
    error,
    usePSGC,
    loadMunicipalities,
    loadBarangays,
    resetMunicipalities,
    resetBarangays,
    toggleAPI
  } = usePSGCAddressData();

  // Load municipalities when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadMunicipalities(selectedProvince);
    } else {
      resetMunicipalities();
    }
  }, [selectedProvince, loadMunicipalities, resetMunicipalities]);

  // Load barangays when municipality changes
  useEffect(() => {
    if (selectedMunicipality) {
      loadBarangays(selectedProvince, selectedMunicipality);
    } else {
      resetBarangays();
    }
  }, [selectedMunicipality, selectedProvince, loadBarangays, resetBarangays]);

  const getDisplayValue = (item) => {
    if (typeof item === 'string') return item;
    return item?.name || item?.id || '';
  };

  return (
    <div className={`psgc-address-selector ${className}`} style={style}>
      {/* API Toggle */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ fontSize: '12px', color: 'var(--gray)' }}>
          Data Source:
        </label>
        <button
          type="button"
          onClick={toggleAPI}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            borderRadius: '4px',
            border: '1px solid var(--gray)',
            backgroundColor: usePSGC ? 'var(--primary)' : 'white',
            color: usePSGC ? 'white' : 'var(--black)',
            cursor: 'pointer'
          }}
        >
          {usePSGC ? 'PSGC API' : 'Local Data'}
        </button>
        {loading && (
          <span style={{ fontSize: '11px', color: 'var(--gray)' }}>
            Loading...
          </span>
        )}
      </div>

      {error && (
        <div style={{ 
          color: 'var(--red)', 
          fontSize: '11px', 
          marginBottom: '1rem',
          padding: '8px',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Province Selection */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: '500', 
          color: 'var(--black)', 
          fontSize: '12px' 
        }}>
          Province {required && '*'}
        </label>
        <select
          value={selectedProvince || ''}
          onChange={(e) => onProvinceChange(e.target.value)}
          disabled={disabled || loading}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            border: '1px solid var(--gray)',
            height: '44px',
            backgroundColor: 'white'
          }}
        >
          <option value="">Select Province</option>
          {provinces.map((province, index) => (
            <option key={index} value={getDisplayValue(province)}>
              {getDisplayValue(province)}
            </option>
          ))}
        </select>
      </div>

      {/* Municipality Selection */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: '500', 
          color: 'var(--black)', 
          fontSize: '12px' 
        }}>
          Municipality {required && '*'}
        </label>
        <select
          value={selectedMunicipality || ''}
          onChange={(e) => onMunicipalityChange(e.target.value)}
          disabled={disabled || loading || !selectedProvince}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            border: '1px solid var(--gray)',
            height: '44px',
            backgroundColor: 'white'
          }}
        >
          <option value="">Select Municipality</option>
          {municipalities.map((municipality, index) => (
            <option key={index} value={getDisplayValue(municipality)}>
              {getDisplayValue(municipality)}
            </option>
          ))}
        </select>
      </div>

      {/* Barangay Selection */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: '500', 
          color: 'var(--black)', 
          fontSize: '12px' 
        }}>
          Barangay {required && '*'}
        </label>
        <select
          value={selectedBarangay || ''}
          onChange={(e) => onBarangayChange(e.target.value)}
          disabled={disabled || loading || !selectedMunicipality}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            border: '1px solid var(--gray)',
            height: '44px',
            backgroundColor: 'white'
          }}
        >
          <option value="">Select Barangay</option>
          {barangays.map((barangay, index) => (
            <option key={index} value={getDisplayValue(barangay)}>
              {getDisplayValue(barangay)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PSGCAddressSelector;
