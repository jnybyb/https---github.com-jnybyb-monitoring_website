import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { IoLocation } from "react-icons/io5";
import Button from '../../ui/Buttons';
import LoadingSpinner from '../../ui/LoadingSpinner';
// Removed API imports

// Coordinate Picker Modal Component
const CoordinatePickerModal = ({ isOpen, onClose, onSelect, initialCoordinates = null }) => {
  const [coordinates, setCoordinates] = useState({
    lat: '',
    lng: ''
  });
  const [mapCenter, setMapCenter] = useState({
    lat: 7.2167,
    lng: 126.3333
  });

  useEffect(() => {
    if (initialCoordinates) {
      const coords = parseGPS(initialCoordinates);
      if (coords) {
        setCoordinates(coords);
        setMapCenter(coords);
      }
    }
  }, [initialCoordinates]);

  // Parse GPS coordinates from string format
  const parseGPS = (gpsString) => {
    if (!gpsString) return null;
    
    try {
      if (gpsString.includes(',')) {
        const [lat, lng] = gpsString.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      const coords = gpsString.split(/\s+/).map(coord => parseFloat(coord.trim()));
      if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return { lat: coords[0], lng: coords[1] };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing GPS coordinates:', error);
      return null;
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleCoordinateChange = (field, value) => {
    setCoordinates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCoordinates = () => {
    const { lat, lng } = coordinates;
    
    if (!lat || !lng) {
      alert('Please enter both latitude and longitude coordinates.');
      return;
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Please enter valid numeric coordinates.');
      return;
    }

    if (latNum < -90 || latNum > 90) {
      alert('Latitude must be between -90 and 90 degrees.');
      return;
    }

    if (lngNum < -180 || lngNum > 180) {
      alert('Longitude must be between -180 and 180 degrees.');
      return;
    }

    // Format coordinates for storage
    const gpsString = `${latNum}, ${lngNum}`;
    onSelect(gpsString);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1001
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #e8f5e8',
          paddingBottom: '0.75rem'
        }}>
          <h3 style={{
            color: '#2c5530',
            fontSize: '1.1rem',
            fontWeight: '600',
            margin: 0
          }}>
            Select GPS Coordinates
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: '#6c757d',
              padding: '0.25rem',
              borderRadius: '4px'
            }}
          >
            <IoClose />
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{
            color: '#6c757d',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            Enter the GPS coordinates for the coffee farm location. You can also use your current location.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#2c5530',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}>
              Latitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g., 7.2167"
              value={coordinates.lat}
              onChange={(e) => handleCoordinateChange('lat', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#2c5530',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}>
              Longitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g., 126.3333"
              value={coordinates.lng}
              onChange={(e) => handleCoordinateChange('lng', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          <h4 style={{
            color: '#2c5530',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Quick Actions
          </h4>
          <button
            onClick={handleGetCurrentLocation}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2d7c4a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <IoLocation />
            Use Current Location
          </button>
        </div>

        <div style={{
          backgroundColor: '#fff3cd',
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <p style={{
            color: '#856404',
            fontSize: '0.75rem',
            margin: 0
          }}>
            <strong>Tip:</strong> You can get coordinates from Google Maps by right-clicking on a location and selecting "What's here?"
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveCoordinates}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2d7c4a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            Save Coordinates
          </button>
        </div>
      </div>
    </div>
  );
};

const DUMMY_BENEFICIARIES = [
  { beneficiaryId: 'B001', fullName: 'Juan Dela Cruz' },
  { beneficiaryId: 'B002', fullName: 'Maria Santos' },
];

const AddSeedlingRecordModal = ({ isOpen, onClose, onSubmit, record = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    beneficiaryName: '',
    received: '',
    planted: '',
    hectares: '',
    dateOfPlanting: '',
    gps: ''
  });
  const [beneficiaries, setBeneficiaries] = useState(DUMMY_BENEFICIARIES);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCoordinatePicker, setShowCoordinatePicker] = useState(false);

  // Helper function to construct full name
  const getFullName = (beneficiary) => {
    if (beneficiary.fullName) {
      return beneficiary.fullName;
    }
    const firstName = beneficiary.firstName || '';
    const middleName = beneficiary.middleName || '';
    const lastName = beneficiary.lastName || '';
    return `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');
  };

  // Load beneficiaries for dropdown
  // Remove useEffect for fetching beneficiaries

  // Initialize form data when editing
  useEffect(() => {
    if (isEdit && record) {
      // Find beneficiary name for the record
      const beneficiary = beneficiaries.find(b => b.beneficiaryId === record.beneficiaryId);
      const beneficiaryName = beneficiary ? getFullName(beneficiary) : '';
      
      setFormData({
        beneficiaryId: record.beneficiaryId || '',
        beneficiaryName: beneficiaryName,
        received: record.received?.toString() || '',
        planted: record.planted?.toString() || '',
        hectares: record.hectares?.toString() || '',
        dateOfPlanting: record.dateOfPlanting ? new Date(record.dateOfPlanting).toISOString().split('T')[0] : '',
        gps: record.gps || ''
      });
    } else {
      setFormData({
        beneficiaryId: '',
        beneficiaryName: '',
        received: '',
        planted: '',
        hectares: '',
        dateOfPlanting: '',
        gps: ''
      });
    }
    setErrors({});
  }, [isEdit, record, isOpen, beneficiaries]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.beneficiaryName) {
      newErrors.beneficiaryName = 'Beneficiary is required';
    }

    if (!formData.received || formData.received <= 0) {
      newErrors.received = 'Received seedlings must be greater than 0';
    }

    if (!formData.planted || formData.planted <= 0) {
      newErrors.planted = 'Planted seedlings must be greater than 0';
    }

    if (parseInt(formData.planted) > parseInt(formData.received)) {
      newErrors.planted = 'Planted seedlings cannot exceed received seedlings';
    }

    if (!formData.hectares || formData.hectares <= 0) {
      newErrors.hectares = 'Hectares must be greater than 0';
    }

    if (!formData.dateOfPlanting) {
      newErrors.dateOfPlanting = 'Date of planting is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'beneficiaryName') {
      // Find beneficiary by name and set the ID automatically
      const beneficiary = beneficiaries.find(b => getFullName(b) === value);
      setFormData(prev => ({
        ...prev,
        beneficiaryName: value,
        beneficiaryId: beneficiary ? beneficiary.beneficiaryId : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCoordinateSelect = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      gps: coordinates
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        received: parseInt(formData.received),
        planted: parseInt(formData.planted),
        hectares: parseFloat(formData.hectares),
        gps: formData.gps || null
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          width: '90%',
          maxWidth: '450px',
          maxHeight: '85vh',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid #e8f5e8',
            paddingBottom: '0.75rem'
          }}>
            <h2 style={{
              color: '#2c5530',
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: '600'
            }}>
              {isEdit ? 'Edit Seedling Record' : 'Add New Seedling Record'}
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1.25rem',
                color: '#6c757d',
                padding: '0.25rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => !loading && (e.target.style.color = '#dc3545')}
              onMouseOut={(e) => !loading && (e.target.style.color = '#6c757d')}
            >
              <IoClose />
            </button>
          </div>

          {/* Form */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Beneficiary Name and ID in one row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.375rem',
                      color: '#2c5530',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Beneficiary *
                    </label>
                    <select
                      name="beneficiaryName"
                      value={formData.beneficiaryName}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: errors.beneficiaryName ? '1px solid #dc3545' : '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        backgroundColor: 'white',
                        color: '#495057',
                        height: '36px'
                      }}
                      disabled={loading}
                    >
                      <option value="">Select Beneficiary</option>
                      {beneficiaries && beneficiaries.length > 0 ? (
                        beneficiaries.map(beneficiary => (
                          <option key={beneficiary.beneficiaryId} value={getFullName(beneficiary)}>
                            {getFullName(beneficiary)}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No beneficiaries available</option>
                      )}
                    </select>
                    {errors.beneficiaryName && (
                      <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>
                        {errors.beneficiaryName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.375rem',
                      color: '#2c5530',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Beneficiary ID
                    </label>
                    <input
                      type="text"
                      value={formData.beneficiaryId}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        backgroundColor: '#f8f9fa',
                        color: '#6c757d',
                        cursor: 'not-allowed',
                        height: '36px'
                      }}
                      placeholder="Auto-populated"
                    />
                  </div>
                </div>

                {/* Received Seedlings */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.375rem',
                    color: '#2c5530',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Received Seedlings *
                  </label>
                  <input
                    type="number"
                    name="received"
                    value={formData.received}
                    onChange={handleInputChange}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: errors.received ? '1px solid #dc3545' : '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: 'white',
                      color: '#495057',
                      height: '36px'
                    }}
                    disabled={loading}
                    placeholder="Enter number"
                  />
                  {errors.received && (
                    <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>
                      {errors.received}
                    </p>
                  )}
                </div>

                {/* Planted Seedlings */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.375rem',
                    color: '#2c5530',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Planted Seedlings *
                  </label>
                  <input
                    type="number"
                    name="planted"
                    value={formData.planted}
                    onChange={handleInputChange}
                    min="1"
                    max={formData.received}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: errors.planted ? '1px solid #dc3545' : '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: 'white',
                      color: '#495057',
                      height: '36px'
                    }}
                    disabled={loading}
                    placeholder="Enter number"
                  />
                  {errors.planted && (
                    <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>
                      {errors.planted}
                    </p>
                  )}
                </div>

                {/* Hectares */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.375rem',
                    color: '#2c5530',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Hectares *
                  </label>
                  <input
                    type="number"
                    name="hectares"
                    value={formData.hectares}
                    onChange={handleInputChange}
                    min="0.1"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: errors.hectares ? '1px solid #dc3545' : '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: 'white',
                      color: '#495057',
                      height: '36px'
                    }}
                    disabled={loading}
                    placeholder="Enter hectares"
                  />
                  {errors.hectares && (
                    <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>
                      {errors.hectares}
                    </p>
                  )}
                </div>

                {/* Date of Planting */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.375rem',
                    color: '#2c5530',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Date of Planting *
                  </label>
                  <input
                    type="date"
                    name="dateOfPlanting"
                    value={formData.dateOfPlanting}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: errors.dateOfPlanting ? '1px solid #dc3545' : '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: 'white',
                      color: '#495057',
                      height: '36px'
                    }}
                    disabled={loading}
                  />
                  {errors.dateOfPlanting && (
                    <p style={{ color: '#dc3545', fontSize: '0.625rem', marginTop: '0.125rem' }}>
                      {errors.dateOfPlanting}
                    </p>
                  )}
                </div>

                {/* GPS Coordinates with Coordinate Picker */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.375rem',
                    color: '#2c5530',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    GPS Coordinates (Optional)
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'flex-end'
                  }}>
                    <input
                      type="text"
                      name="gps"
                      value={formData.gps}
                      onChange={handleInputChange}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        backgroundColor: 'white',
                        color: '#495057',
                        height: '36px'
                      }}
                      disabled={loading}
                      placeholder="Enter GPS coordinates or use picker"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCoordinatePicker(true)}
                      disabled={loading}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#2d7c4a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        height: '36px',
                        width: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Open coordinate picker"
                    >
                      <IoLocation />
                    </button>
                  </div>
                  <p style={{
                    color: '#6c757d',
                    fontSize: '0.625rem',
                    marginTop: '0.125rem'
                  }}>
                    Click the location icon to use coordinate picker
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e8f5e8'
          }}>
            <Button
              type="secondary"
              size="medium"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="medium"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <LoadingSpinner color="white" />
                  Saving...
                </div>
              ) : (
                isEdit ? 'Update Record' : 'Add Record'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Coordinate Picker Modal */}
      <CoordinatePickerModal
        isOpen={showCoordinatePicker}
        onClose={() => setShowCoordinatePicker(false)}
        onSelect={handleCoordinateSelect}
        initialCoordinates={formData.gps}
      />
    </>
  );
};

export default AddSeedlingRecordModal; 