import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, ScaleControl, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { beneficiariesAPI, farmPlotsAPI } from '../../../services/api';
import AddFarmPlotModal from './AddFarmPlotModal';
import AlertModal from '../../ui/AlertModal';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom corner marker icon
const createCornerMarkerIcon = (color) => {
  return L.divIcon({
    className: 'custom-corner-marker',
    html: `<div style="
      width: 12px; 
      height: 12px; 
      background-color: ${color}; 
      border: 2px solid white; 
      border-radius: 50%; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

// Custom location marker icon with beneficiary profile
const createLocationMarkerIcon = (color, beneficiaryName) => {
  // Generate initials from beneficiary name for the profile picture
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(beneficiaryName);
  
  return L.divIcon({
    className: 'custom-location-marker',
    html: `<div style="
      width: 32px; 
      height: 40px; 
      position: relative;
    ">
      <div style="
        width: 32px; 
        height: 32px; 
        background-color: ${color}; 
        border: 2px solid white; 
        border-radius: 50% 50% 50% 0; 
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        position: absolute;
        top: 0;
        left: 0;
      "></div>
      <div style="
        width: 20px; 
        height: 20px; 
        background-color: white; 
        border: 2px solid ${color}; 
        border-radius: 50%; 
        position: absolute;
        top: 6px;
        left: 6px;
        transform: rotate(45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: ${color};
        font-size: 10px;
        font-family: Arial, sans-serif;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      ">${initials}</div>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40]
  });
};

// Calculate center point of polygon coordinates
const calculatePolygonCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;
  
  let sumLat = 0;
  let sumLng = 0;
  
  coordinates.forEach(coord => {
    sumLat += parseFloat(coord.lat);
    sumLng += parseFloat(coord.lng);
  });
  
  return {
    lat: sumLat / coordinates.length,
    lng: sumLng / coordinates.length
  };
};

const MapMonitoring = () => {
  // Default coordinates for Taocanga, Manay, Davao Oriental
  const defaultLocation = {
    lat: 7.2167, // Approximate latitude for Manay, Davao Oriental
    lng: 126.3333, // Approximate longitude for Manay, Davao Oriental
    zoom: 12
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(false);
  const [farmPlots, setFarmPlots] = useState([]); // Store farm plots data
  const [loadingFarmPlots, setLoadingFarmPlots] = useState(false);
  const [isCreatingPlot, setIsCreatingPlot] = useState(false); // Loading state for plot creation
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state

  const styles = {
    container: {
      padding: '2rem',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxHeight: '100vh',
      backgroundColor: '#f8f9fa',
      gap: '1.5rem',
      overflow: 'hidden'
    },
    detailsPanel: {
      width: '320px',
      minWidth: '300px',
      maxWidth: '350px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    mapPanel: {
      flex: 1, // Takes the remaining space (7/8)
      display: 'flex',
      flexDirection: 'column'
    },
    title: {
      color: 'var(--forest-color)',
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '0.1rem'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '0.9rem'
    },
    infoPanel: {
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e8f5e8'
    },
    infoTitle: {
      color: '#2c5530',
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.5rem'
    },
    infoText: {
      color: '#6c757d',
      fontSize: '0.8rem',
      lineHeight: '1.4'
    },
    controlsPanel: {
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e8f5e8',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    controlButton: {
      padding: '0.875rem 1.25rem',
      backgroundColor: '#2d7c4a',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      width: '100%'
    },
    // Removed map style buttons
    mapContainer: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e8f5e8',
      position: 'relative',
      maxHeight: '67vh',
      minHeight: '400px'
    },
    map: {
      width: '100%',
      height: '100%',
      minHeight: '400px',
      maxHeight: '67vh'
    },
    statsPanel: {
      backgroundColor: 'white',
      padding: '1.25rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e8f5e8',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0
    },
    statItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 0',
      borderBottom: '1px solid #f0f0f0'
    },
    statLabel: {
      color: '#6c757d',
      fontSize: '0.8rem',
      fontWeight: '500'
    },
    statValue: {
      color: '#2c5530',
      fontSize: '0.9rem',
      fontWeight: '600'
    },
    plotsListPanel: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #f0f0f0'
    },
    plotsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    plotsListContainer: {
      flex: 1,
      overflowY: 'auto',
      paddingRight: '0.5rem',
      marginTop: '1rem',
      borderTop: '1px solid #f0f0f0',
      paddingTop: '1rem',
      minHeight: 0
    },
    plotItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e8f5e8',
      marginBottom: '0.75rem'
    },
    plotNumber: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#2c5530',
      minWidth: '50px'
    },
    farmerInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flex: 1
    },
    farmerDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3rem'
    },
    farmerName: {
      fontSize: '0.8rem',
      fontWeight: '500',
      color: '#343a40'
    },
    beneficiaryId: {
      fontSize: '0.65rem',
      color: '#6c757d'
    },
    plotActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '30px'
    },
    threeDotsButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.1rem',
      color: '#6c757d',
      padding: '0.25rem',
      borderRadius: '4px',
      transition: 'all 0.2s',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ':hover': {
        backgroundColor: '#f0f0f0',
        color: '#2d7c4a'
      }
    }
  };

  // Map tile layer options
  const mapLayers = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    hybrid: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    terrain: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  };

  // Fetch beneficiaries and farm plots on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingBeneficiaries(true);
        setLoadingFarmPlots(true);
        
        console.log('Starting to fetch data...');
        
        // Fetch beneficiaries and farm plots in parallel
        const [beneficiariesData, farmPlotsData] = await Promise.all([
          beneficiariesAPI.getAll(),
          farmPlotsAPI.getAll()
        ]);
        
        console.log('Fetched beneficiaries:', beneficiariesData);
        console.log('Number of beneficiaries:', beneficiariesData?.length || 0);
        console.log('Fetched farm plots:', farmPlotsData);
        
        setBeneficiaries(beneficiariesData || []);
        setFarmPlots(farmPlotsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data: ' + error.message);
      } finally {
        setLoadingBeneficiaries(false);
        setLoadingFarmPlots(false);
      }
    };

    fetchData();
  }, []);

  // Handle submit from AddFarmPlotModal
  const handleAddFarmPlot = async (data) => {
    if (isCreatingPlot) return; // Prevent multiple submissions
    
    try {
      setIsCreatingPlot(true);
      console.log('Creating farm plot with data:', data);
      
      // Prepare the data for the backend
      const farmPlotData = {
        beneficiaryId: data.beneficiaryId,
        plotName: `Plot for ${data.fullName}`,
        color: getRandomColor(),
        coordinates: data.coordinates
      };

      console.log('Sending farm plot data to server:', farmPlotData);
      
      // Save to backend
      const newPlot = await farmPlotsAPI.create(farmPlotData);
      
      console.log('Server response for new plot:', newPlot);
      console.log('Response type:', typeof newPlot);
      console.log('Response keys:', Object.keys(newPlot || {}));
      
      // Validate the response has required fields
      if (!newPlot || !newPlot.id || !newPlot.coordinates) {
        console.error('Invalid plot response:', newPlot);
        throw new Error('Invalid response from server: missing required fields');
      }
      
      // Add to local state
      const updatedPlots = [...farmPlots, newPlot];
      console.log('Updated plots array:', updatedPlots);
      setFarmPlots(updatedPlots);
      console.log('Added farm plot with boundaries and corner markers:', newPlot);
      
      // Show success modal
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error creating farm plot:', error);
      alert('Failed to create farm plot: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCreatingPlot(false);
    }
  };

  // Generate random color for plot boundaries
  const getRandomColor = () => {
    const colors = ['#2d7c4a', '#28a745', '#20c997', '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14', '#ffc107'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle plot actions (edit/delete)
  const handlePlotActions = (plot, index) => {
    const action = prompt(`Plot #${index + 1} - ${plot.beneficiaryName}\n\nChoose action:\n1. Edit\n2. Delete\n\nEnter 1 or 2:`);
    
    if (action === '1') {
      alert('Edit functionality coming soon!');
    } else if (action === '2') {
      if (confirm(`Are you sure you want to delete Plot #${index + 1}?`)) {
        // Remove from local state
        setFarmPlots(prev => prev.filter((_, i) => i !== index));
        alert('Plot deleted successfully!');
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div>
        <h2 style={styles.title}>Map Monitoring</h2>
        <p style={styles.subtitle}>Real-time location monitoring</p>
      </div>
      {/* Map and Details Section */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', flex: 1 }}>
        <div style={styles.mapPanel}>
          <div style={styles.mapContainer}>
            <MapContainer 
              center={[defaultLocation.lat, defaultLocation.lng]} 
              zoom={defaultLocation.zoom} 
              style={styles.map}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution={mapLayers.satellite.attribution}
                url={mapLayers.satellite.url}
              />

              {/* Farm Plot Boundaries and Corner Markers */}
              {farmPlots.map((plot, index) => {
                // Defensive check to prevent crashes
                if (!plot || !plot.coordinates || !Array.isArray(plot.coordinates) || plot.coordinates.length === 0) {
                  console.warn('Invalid plot data:', plot);
                  return null;
                }
                
                const centerPoint = calculatePolygonCenter(plot.coordinates);
                
                return (
                  <React.Fragment key={plot.id || `plot-${index}`}>
                    {/* Plot Boundary Polygon */}
                    <Polygon
                      positions={plot.coordinates.map(coord => [parseFloat(coord.lat), parseFloat(coord.lng)])}
                      pathOptions={{
                        color: plot.color || '#2d7c4a',
                        fillColor: plot.color || '#2d7c4a',
                        fillOpacity: 0.3,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div>
                          <b>{plot.beneficiaryName || 'Unknown Beneficiary'}</b><br />
                          <small>Plot #{index + 1}</small><br />
                          <small>{plot.address || 'Address not available'}</small>
                        </div>
                      </Popup>
                    </Polygon>

                    {/* Corner Markers */}
                    {plot.coordinates.map((coord, coordIndex) => {
                      if (!coord || coord.lat === undefined || coord.lng === undefined) {
                        return null;
                      }
                      return (
                        <Marker
                          key={`${plot.id || index}-corner-${coordIndex}`}
                          position={[parseFloat(coord.lat), parseFloat(coord.lng)]}
                          icon={createCornerMarkerIcon(plot.color || '#2d7c4a')}
                        >
                          <Popup>
                            <div>
                              <b>Corner Point {coordIndex + 1}</b><br />
                              <small>{plot.beneficiaryName || 'Unknown Beneficiary'}</small><br />
                              <small>Lat: {coord.lat}</small><br />
                              <small>Lng: {coord.lng}</small>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}

                    {/* Location Marker with Beneficiary Profile at Center */}
                    {centerPoint && (
                      <Marker
                        key={`${plot.id}-location`}
                        position={[centerPoint.lat, centerPoint.lng]}
                        icon={createLocationMarkerIcon(plot.color, plot.beneficiaryName)}
                      >
                        <Popup>
                          <div style={{ minWidth: '250px' }}>
                            <div style={{ 
                              borderBottom: '2px solid #2d7c4a', 
                              paddingBottom: '8px', 
                              marginBottom: '8px' 
                            }}>
                              <b style={{ color: '#2d7c4a', fontSize: '16px' }}>
                                {plot.beneficiaryName}
                              </b>
                            </div>
                            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                marginBottom: '12px' 
                              }}>
                                <div style={{
                                  width: '48px',
                                  height: '48px',
                                  backgroundColor: plot.color || '#2d7c4a',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  border: '3px solid #e8f5e8'
                                }}>
                                  {plot.beneficiaryName ? 
                                    plot.beneficiaryName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 
                                    '??'
                                  }
                                </div>
                                <div>
                                  <div style={{ marginBottom: '6px' }}>
                                    <span style={{ fontWeight: '500', color: '#343a40' }}>Beneficiary ID:</span> {plot.beneficiaryId}
                                  </div>
                                  <div>
                                    <span style={{ fontWeight: '500', color: '#343a40' }}>Address:</span> {plot.address}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </React.Fragment>
                );
              })}

              <ScaleControl />
            </MapContainer>
          </div>
        </div>
        {/* Details Panel */}
        <div style={styles.detailsPanel}>
          {/* Add Farm Plot Button - No container */}
          <button 
            style={{ ...styles.controlButton, width: '100%', marginBottom: '1rem' }}
            onClick={() => setShowAddModal(true)}
          >
            Add Farm/Plot Location
          </button>
          
          {/* Plots Summary and List - Combined Container */}
          <div style={styles.statsPanel}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Plots</span>
              <span style={styles.statValue}>{farmPlots?.length || 0}</span>
            </div>
            
            {/* Plots List - Inside the same container */}
            {farmPlots && farmPlots.length > 0 && (
              <div style={styles.plotsListContainer}>
                {farmPlots.map((plot, index) => (
                  <div key={plot.id || index} style={styles.plotItem}>
                    <div style={styles.plotNumber}>Plot #{index + 1}</div>
                    <div style={styles.farmerInfo}>
                      <div style={styles.farmerAvatar}>
                        {plot.beneficiaryName ? 
                          plot.beneficiaryName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 
                          '??'
                        }
                      </div>
                      <div style={styles.farmerDetails}>
                        <div style={styles.farmerName}>{plot.beneficiaryName || 'Unknown Farmer'}</div>
                        <div style={styles.beneficiaryId}>ID: {plot.beneficiaryId || 'N/A'}</div>
                      </div>

                    </div>
                    <div style={styles.plotActions}>
                      <button 
                        style={styles.threeDotsButton}
                        onClick={() => handlePlotActions(plot, index)}
                        title="Plot actions"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add Farm/Plot Modal */}
      <AddFarmPlotModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFarmPlot}
        beneficiaries={beneficiaries}
        isLoading={isCreatingPlot}
      />
      
      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Success!"
        message="Farm Plot has been saved successfully."
        confirmText="OK"
        autoClose={true}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default MapMonitoring; 
