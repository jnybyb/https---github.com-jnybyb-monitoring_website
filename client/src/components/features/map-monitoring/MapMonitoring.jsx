import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, ScaleControl, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { beneficiariesAPI, farmPlotsAPI } from '../../../services/api';
import AddFarmPlotModal from './AddFarmPlotModal';

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
  const [mapStyle, setMapStyle] = useState('satellite'); // Current map style

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
      width: '12.5%', // 1/8 of the main content
      minWidth: '250px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
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
      padding: '0.75rem 1rem',
      backgroundColor: '#2d7c4a',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      width: '100%'
    },
    mapStyleButton: {
      padding: '0.5rem 0.75rem',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.75rem',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      width: '100%',
      marginBottom: '0.5rem'
    },
    activeMapStyle: {
      backgroundColor: '#2d7c4a'
    },
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
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e8f5e8'
    },
    statItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
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
    try {
      // Prepare the data for the backend
      const farmPlotData = {
        beneficiaryId: data.beneficiaryId,
        plotName: `Plot for ${data.fullName}`,
        color: getRandomColor(),
        coordinates: data.coordinates
      };

      // Save to backend
      const newPlot = await farmPlotsAPI.create(farmPlotData);
      
      // Add to local state
      setFarmPlots(prev => [...prev, newPlot]);
      console.log('Added farm plot with boundaries and corner markers:', newPlot);
    } catch (error) {
      console.error('Error creating farm plot:', error);
      alert('Failed to create farm plot: ' + error.message);
    }
  };

  // Generate random color for plot boundaries
  const getRandomColor = () => {
    const colors = ['#2d7c4a', '#28a745', '#20c997', '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14', '#ffc107'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div>
        <h2 style={styles.title}>Map Monitoring</h2>
        <p style={styles.subtitle}>Real-time location monitoring</p>
      </div>
      {/* Content Section - Map and Details side by side */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', flex: 1 }}>
        {/* Left Panel - Map (7/8 width) */}
        <div style={styles.mapPanel}>
          <div style={styles.mapContainer}>
            <MapContainer 
              center={[defaultLocation.lat, defaultLocation.lng]} 
              zoom={defaultLocation.zoom} 
              style={styles.map}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution={mapLayers[mapStyle].attribution}
                url={mapLayers[mapStyle].url}
              />

              {/* Farm Plot Boundaries and Corner Markers */}
              {farmPlots.map((plot, index) => {
                const centerPoint = calculatePolygonCenter(plot.coordinates);
                
                return (
                  <React.Fragment key={plot.id}>
                    {/* Plot Boundary Polygon */}
                    <Polygon
                      positions={plot.coordinates.map(coord => [parseFloat(coord.lat), parseFloat(coord.lng)])}
                pathOptions={{
                        color: plot.color,
                        fillColor: plot.color,
                        fillOpacity: 0.3,
                        weight: 2
                }}
              >
                <Popup>
                        <div>
                          <b>{plot.beneficiaryName}</b><br />
                          <small>Plot #{index + 1}</small><br />
                          <small>{plot.address}</small><br />
                          <small>Boundary Points: {plot.coordinates.length}</small>
                        </div>
                      </Popup>
                    </Polygon>

                    {/* Corner Markers */}
                    {plot.coordinates.map((coord, coordIndex) => (
                      <Marker
                        key={`${plot.id}-corner-${coordIndex}`}
                        position={[parseFloat(coord.lat), parseFloat(coord.lng)]}
                        icon={createCornerMarkerIcon(plot.color)}
                      >
                        <Popup>
                          <div>
                            <b>Corner Point {coordIndex + 1}</b><br />
                            <small>{plot.beneficiaryName}</small><br />
                            <small>Lat: {coord.lat}</small><br />
                            <small>Lng: {coord.lng}</small>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Location Marker with Beneficiary Profile at Center */}
                    {centerPoint && (
                      <Marker
                        key={`${plot.id}-location`}
                        position={[centerPoint.lat, centerPoint.lng]}
                        icon={createLocationMarkerIcon(plot.color, plot.beneficiaryName)}
                      >
                        <Popup>
                          <div style={{ minWidth: '200px' }}>
                            <div style={{ 
                              borderBottom: '2px solid #2d7c4a', 
                              paddingBottom: '8px', 
                              marginBottom: '8px' 
                            }}>
                              <b style={{ color: '#2d7c4a', fontSize: '14px' }}>
                                {plot.beneficiaryName}
                              </b>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              <div><strong>Plot #{index + 1}</strong></div>
                              <div>{plot.address}</div>
                              <div style={{ marginTop: '8px' }}>
                                <small>Boundary Points: {plot.coordinates.length}</small><br />
                                <small>Center: {centerPoint.lat.toFixed(6)}, {centerPoint.lng.toFixed(6)}</small>
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
        {/* Right Panel - Details (1/8 width) */}
        <div style={styles.detailsPanel}>
          <div style={styles.infoPanel}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2c5530' }}>
                Map Style
          </div>
              <button 
                style={{ 
                  ...styles.mapStyleButton, 
                  ...(mapStyle === 'satellite' ? styles.activeMapStyle : {})
                }}
                onClick={() => setMapStyle('satellite')}
              >
                Satellite
              </button>
            <button 
                style={{ 
                  ...styles.mapStyleButton, 
                  ...(mapStyle === 'terrain' ? styles.activeMapStyle : {})
                }}
                onClick={() => setMapStyle('terrain')}
              >
                Terrain
            </button>
            <button 
                style={{ 
                  ...styles.mapStyleButton, 
                  ...(mapStyle === 'street' ? styles.activeMapStyle : {})
                }}
                onClick={() => setMapStyle('street')}
              >
                Street
              </button>
            </div>
            <button 
              style={{ ...styles.controlButton, width: '100%' }}
              onClick={() => setShowAddModal(true)}
            >
              Add Farm/Plot Location
            </button>
          </div>
        </div>
      </div>
      {/* Add Farm/Plot Modal */}
      <AddFarmPlotModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFarmPlot}
        beneficiaries={beneficiaries}
      />
    </div>
  );
};

export default MapMonitoring; 