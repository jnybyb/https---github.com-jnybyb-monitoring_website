import React, { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, Circle, ScaleControl, Polygon } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
import { beneficiariesAPI, farmPlotsAPI } from '../../../services/api';
import AddFarmPlotModal from './AddFarmPlotModal';
import ViewFarmPlotModal from './ViewFarmPlotModal';
import AlertModal from '../../ui/AlertModal';

// Temporary placeholder component until leaflet dependencies are installed
const MapMonitoring = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [alertConfig, setAlertConfig] = useState(null);

  return (
    <div style={{ 
      padding: '2rem',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#2c5530' }}>Map Monitoring</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2c5530',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3a23'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2c5530'}
        >
          Add Farm Plot
        </button>
                            </div>
      
                            <div style={{ 
        flex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '2px dashed #dee2e6'
      }}>
        <div style={{ textAlign: 'center', color: '#6c757d' }}>
          <h3>Map Component</h3>
          <p>Map functionality will be available after installing leaflet dependencies.</p>
          <p>Run: npm install react-leaflet leaflet</p>
              </div>
            </div>
            
      {/* Modals */}
      {isAddModalOpen && (
        <AddFarmPlotModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            // Refresh data if needed
          }}
        />
      )}

      {isViewModalOpen && selectedPlot && (
      <ViewFarmPlotModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        plot={selectedPlot}
      />
      )}
      
      {alertConfig && (
      <AlertModal
          {...alertConfig}
          onClose={() => setAlertConfig(null)}
        />
      )}
      </div>
  );
};

export default MapMonitoring; 
