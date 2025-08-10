import React, { useState, useEffect } from 'react';
import { HiOutlineTrash } from "react-icons/hi2";
import { AiOutlineEdit } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { 
  FaUserFriends, 
  FaSeedling, 
  FaLeaf,
  FaClipboardList 
} from 'react-icons/fa';
import Button from '../../ui/Buttons';
import AlertModal from '../../ui/AlertModal';
import LoadingSpinner from '../../ui/LoadingSpinner';
import AddCropStatusModal from '../../features/crop-status/AddCropStatusModal';
// Remove: import { beneficiaryAPI } from '../../../services/api';

// Inline NoDataIcon component
const NoDataIcon = ({ type = 'default', size = '48px', color = '#6c757d' }) => {
  const getIcon = () => {
    switch (type) {
      case 'beneficiaries':
      case 'personal':
        return <FaUserFriends size={size} color={color} />;
      case 'seedlings':
      case 'seedling':
        return <FaSeedling size={size} color={color} />;
      case 'crops':
      case 'crop':
        return <FaLeaf size={size} color={color} />;
      default:
        return <FaClipboardList size={size} color={color} />;
    }
  };

  return (
    <div style={{ 
      fontSize: size, 
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {getIcon()}
    </div>
  );
};

// Table column headers
const columns = [
  'Survey Date',
  'Surveyer',
  'Beneficiary ID',
  'Pictures',
  'Number of Alive Crops',
  'Number of Dead Crops',
  ''
];

// Common styles
const getCommonStyles = () => ({
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8'
  },
  tableHeader: {
    padding: '8px 12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#2c5530',
    borderBottom: '2px solid #2c5530',
    fontSize: '0.65rem',
    height: '32px'
  },
  tableCell: {
    padding: '6px 16px',
    fontSize: '0.6rem',
    color: '#495057',
    height: '28px',
    verticalAlign: 'middle'
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '3px',
    transition: 'color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

// Alert modal configuration
const getAlertConfig = (type, title, message) => ({
  isOpen: true,
  type,
  title,
  message
});

const CropStatusTable = () => {
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [cropStatusData, setCropStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const styles = getCommonStyles();

  // Fetch crop status data
  const fetchCropStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await cropStatusAPI.getAll();
      // setCropStatusData(response.data || []);
      
      // For now, set empty data to show "no data available"
      setCropStatusData([]);
    } catch (err) {
      setError('Failed to fetch crop status records. Please try again.');
      console.error('Error fetching crop status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load crop status on component mount
  useEffect(() => {
    fetchCropStatus();
  }, []);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cropStatusData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cropStatusData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle API operations with alert feedback
  const handleApiOperation = async (operation, successMessage, errorMessage) => {
    try {
      await operation();
      await fetchCropStatus();
      setAlertModal(getAlertConfig('success', 'Success', successMessage));
    } catch (err) {
      setError(err.message || errorMessage);
      console.error('API operation error:', err);
      setAlertModal(getAlertConfig('error', 'Failed', err.message || errorMessage));
    }
  };

  // Handle add crop status record
  const handleAddCropStatus = async (newRecord) => {
    await handleApiOperation(
      () => Promise.resolve(), // Replace with actual API call
      'Crop status record has been added successfully.',
      'Failed to add crop status record. Please try again.'
    );
  };

  // Handle edit crop status record
  const handleEditCropStatus = async (updatedRecord) => {
    await handleApiOperation(
      () => Promise.resolve(), // Replace with actual API call
      'Crop status record has been updated successfully.',
      'Failed to update crop status record. Please try again.'
    );
  };

  // Handle delete crop status record
  const handleDeleteCropStatus = async (recordId) => {
    await handleApiOperation(
      () => Promise.resolve(), // Replace with actual API call
      'Crop status record has been deleted successfully.',
      'Failed to delete crop status record. Please try again.'
    );
  };

  // Handle add button click
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  // Handle add modal close
  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
  };

  // Handle add modal submit
  const handleAddModalSubmit = async (formData) => {
    try {
      await handleAddCropStatus(formData);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding crop status:', error);
    }
  };

  // Handle edit button click
  const handleEditClick = (record) => {
    // TODO: Implement edit modal
    console.log('Edit record:', record);
  };

  // Handle delete button click
  const handleDeleteClick = (record) => {
    if (window.confirm('Are you sure you want to delete this crop status record? This action cannot be undone.')) {
      handleDeleteCropStatus(record._id);
    }
  };

  // Handle alert modal close
  const handleAlertClose = () => {
    setAlertModal({ ...alertModal, isOpen: false });
  };

  // Format data for display
  const formatCropStatusForDisplay = (record) => {
    return {
      surveyDate: new Date(record.surveyDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      surveyer: record.surveyer,
      beneficiaryId: record.beneficiaryId,
      pictures: record.pictures && record.pictures.length > 0 ? (
        <div style={{ 
          width: '28px', 
          height: '28px', 
          borderRadius: '50%', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '2px solid #e8f5e8',
          cursor: 'pointer'
        }}
        title="Click to view pictures"
        onClick={() => {
          // TODO: Implement picture viewer modal
          console.log('View pictures:', record.pictures);
        }}>
          <img 
            src={`http://localhost:5000/uploads/${record.pictures[0]}`} 
            alt="Crop Survey" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover'
            }}
          />
        </div>
      ) : (
        <div style={{ 
          width: '28px', 
          height: '28px', 
          borderRadius: '50%', 
          backgroundColor: '#f8f9fa',
          border: '2px solid #e8f5e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px'
        }}>
          📷
        </div>
      ),
      aliveCrops: (
        <span style={{ 
          color: '#28a745',
          fontWeight: '600',
          fontSize: '0.6rem'
        }}>
          {record.aliveCrops.toLocaleString()}
        </span>
      ),
      deadCrops: (
        <span style={{ 
          color: '#dc3545',
          fontWeight: '600',
          fontSize: '0.6rem'
        }}>
          {record.deadCrops.toLocaleString()}
        </span>
      ),
      actions: (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => handleEditClick(record)}
            style={{
              ...styles.actionButton,
              color: '#2c5530'
            }}
            onMouseOver={(e) => e.target.style.color = '#1e3a23'}
            onMouseOut={(e) => e.target.style.color = '#2c5530'}
            title="Edit"
          >
            <AiOutlineEdit size={12} />
          </button>
          <button
            onClick={() => handleDeleteClick(record)}
            style={{
              ...styles.actionButton,
              color: '#dc3545'
            }}
            onMouseOver={(e) => e.target.style.color = '#c82333'}
            onMouseOut={(e) => e.target.style.color = '#dc3545'}
            title="Delete"
          >
            <HiOutlineTrash size={12} />
          </button>
        </div>
      )
    };
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <div>
          <h2 style={{ color: '#2c5530', marginBottom: '0.2rem', fontSize: '1.4rem' }}>Crop Status</h2>
          <p style={{ color: '#6c757d', margin: '0', fontSize: '0.60rem' }}>Survey results and crop health monitoring</p>
        </div>
        <Button
          onClick={handleAddClick}
          type="primary"
          size="medium"
          icon="+"
        >
          Add Record
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb',
          fontSize: '0.65rem'
        }}>
          {error}
        </div>
      )}
      
      {/* Table container */}
      <div style={{ overflowX: 'auto', marginTop: '1rem', flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={styles.emptyState}>
            <LoadingSpinner color="#2c5530" />
            <h3 style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Loading...</h3>
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>Please wait while we fetch the crop status records.</p>
          </div>
        ) : cropStatusData.length === 0 ? (
          <div style={styles.emptyState}>
            <NoDataIcon type="crops" size="48px" color="#6c757d" />
            <h3 style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '1.125rem' }}>No Data Available</h3>
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>No crop status records found. Click "Add Record" to add new records.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: '#f0f8f0'}}>
                {columns.map((column, index) => (
                  <th key={index} style={styles.tableHeader}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((record, rowIndex) => {
                const displayData = formatCropStatusForDisplay(record);
                return (
                  <tr key={record._id || rowIndex} style={{
                    borderBottom: '1px solid #e8f5e8',
                    transition: 'background-color 0.2s',
                    height: '28px',
                    backgroundColor: rowIndex % 2 === 0 ? '#fafdfa' : 'white'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f8f0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fafdfa' : 'white'}>
                    {Object.values(displayData).map((cell, cellIndex) => (
                      <td key={cellIndex} style={styles.tableCell}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination - Always at bottom */}
      {!loading && cropStatusData.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          padding: '0.5rem',
          backgroundColor: 'white',
          borderTop: '0.5px solid rgba(36, 99, 59, 0.3)', // 30% opacity
          position: 'sticky',
          bottom: '0',
          flexShrink: 0
        }}>
          {/* Items info - bottom left */}
          <div style={{ fontSize: '0.65rem', color: '#6c757d' }}>
            Items {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, cropStatusData.length)} of {cropStatusData.length} entries
          </div>

          {/* Pagination controls - bottom right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              type="pagination"
              size="pagination"
            >
              &lt;
            </Button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                type={currentPage === page ? 'paginationActive' : 'pagination'}
                size="pagination"
                style={{ minWidth: '28px' }}
              >
                {page}
              </Button>
            ))}

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              type="pagination"
              size="pagination"
            >
              &gt;
            </Button>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={handleAlertClose}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        autoClose={true}
        autoCloseDelay={3000}
      />

      {/* Add Crop Status Modal */}
      <AddCropStatusModal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        onSubmit={handleAddModalSubmit}
      />
    </div>
  );
};

export default CropStatusTable; 