import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { 
  FaUserFriends, 
  FaSeedling, 
  FaLeaf,
  FaClipboardList 
} from 'react-icons/fa';
import { PiFileXLight } from "react-icons/pi";
import { Button } from '../../ui/BeneficiaryButtons';
import AlertModal from '../../ui/AlertModal';
import AddCropStatusModal from '../../features/crop-status/AddCropStatusModal';
import EditCropStatusModal from '../../features/crop-status/EditCropStatusModal';
import DeleteCropStatusModal from '../../features/crop-status/DeleteCropStatusModal';
import ViewCropStatusModal from '../../features/crop-status/ViewCropStatusModal';
import { cropStatusAPI, beneficiariesAPI, handleAPIError } from '../../../services/api';

// Inline NoDataIcon component
const NoDataIcon = ({ type = 'default', size = '48px', color = '#6c757d' }) => {
  const getIcon = () => {
    switch (type) {
      case 'beneficiaries':
      case 'personal':
        return <PiFileXLight size={size} color={color} />;
      case 'seedlings':
      case 'seedling':
        return <PiFileXLight size={size} color={color} />;
      case 'crops':
      case 'crop':
        return <PiFileXLight size={size} color={color} />;
      default:
        return <PiFileXLight size={size} color={color} />;
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
  'Beneficiary ID',
  'Name',
  'Survey Date',
  'Surveyer',
  'Number of Alive Crops',
  'Number of Dead Crops',
  'Plot'
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

// Spacing styles for better column spacing
const columnHeaderStyles = {
  0: { paddingRight: '16px', width: '1%', whiteSpace: 'nowrap' }, // Beneficiary ID
  1: { paddingLeft: '32px' }, // Name
  2: { paddingLeft: '16px' }, // Survey Date
  3: { paddingLeft: '16px' }, // Surveyer
  4: { paddingLeft: '16px', textAlign: 'center' }, // Alive Crops - centered
  5: { paddingLeft: '16px', textAlign: 'center' }, // Dead Crops - centered
  6: { paddingLeft: '16px' }  // Plot
};

const columnCellStyles = {
  0: { paddingRight: '16px', width: '1%', whiteSpace: 'nowrap' }, // Beneficiary ID
  1: { padding: '6px 8px 6px 24px' }, // Name
  2: { paddingLeft: '16px' }, // Survey Date
  3: { paddingLeft: '16px' }, // Surveyer
  4: { paddingLeft: '16px', textAlign: 'center' }, // Alive Crops - centered
  5: { paddingLeft: '16px', textAlign: 'center' }, // Dead Crops - centered
  6: { paddingLeft: '16px' }  // Plot
};

// Alert modal configuration
const getAlertConfig = (type, title, message) => ({
  isOpen: true,
  type,
  title,
  message
});

const CropStatusTable = () => {
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [cropStatusData, setCropStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [recordToView, setRecordToView] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const styles = getCommonStyles();

  const fetchCropStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cropStatusAPI.getAll();
      setCropStatusData(data || []);
    } catch (err) {
      const e = handleAPIError(err);
      setError(e.message || 'Failed to fetch crop status records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadBeneficiaries = async () => {
    try {
      const data = await beneficiariesAPI.getAll();
      setBeneficiaries(data);
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
    }
  };

  useEffect(() => { 
    fetchCropStatus(); 
    loadBeneficiaries();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cropStatusData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cropStatusData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleApiOperation = async (operation, successMessage, errorMessage) => {
    try {
      await operation();
      await fetchCropStatus();
      setAlertModal(getAlertConfig('success', 'Success', successMessage));
    } catch (err) {
      const e = handleAPIError(err);
      setError(e.message || errorMessage);
      setAlertModal(getAlertConfig('error', 'Failed', e.message || errorMessage));
    }
  };

  const handleAddCropStatus = async (newRecord) => {
    await handleApiOperation(
      () => cropStatusAPI.create(newRecord),
      'Crop status record has been added successfully.',
      'Failed to add crop status record. Please try again.'
    );
  };

  const handleEditCropStatus = async (updatedRecord) => {
    if (!updatedRecord.id) {
      setAlertModal(getAlertConfig('error', 'Failed', 'Record ID is missing. Cannot update record.'));
      return;
    }
    await handleApiOperation(
      () => cropStatusAPI.update(updatedRecord.id, updatedRecord),
      'Crop status record has been updated successfully.',
      'Failed to update crop status record. Please try again.'
    );
  };

  const handleDeleteCropStatus = async (recordId) => {
    await handleApiOperation(
      () => cropStatusAPI.delete(recordId),
      'Crop status record has been deleted successfully.',
      'Failed to delete crop status record. Please try again.'
    );
  };

  const handleAddClick = () => setIsAddModalOpen(true);
  const handleAddModalClose = () => setIsAddModalOpen(false);
  const handleAddModalSubmit = async (formData) => {
    try {
      await handleAddCropStatus(formData);
      setIsAddModalOpen(false);
    } catch (error) {
      // handled
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedRecord(null);
  };

  const handleEditModalSubmit = async (formData) => {
    try {
      await handleEditCropStatus(formData);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      // handled
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setRecordToDelete(null);
  };

  const handleDeleteConfirm = async (record) => {
    try {
      await handleDeleteCropStatus(record.id);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      // handled
    }
  };

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleViewClick = (record) => {
    setRecordToView(record);
    setIsViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setRecordToView(null);
  };

  const handleViewEditClick = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleViewDeleteClick = (record) => {
    setRecordToDelete(record);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const formatCropStatusForDisplay = (record) => {
    // Find beneficiary for name and profile picture
    const beneficiary = beneficiaries.find(b => b.beneficiaryId === record.beneficiaryId);
    const beneficiaryName = beneficiary ? beneficiary.fullName || `${beneficiary.firstName} ${beneficiary.middleName ? beneficiary.middleName + ' ' : ''}${beneficiary.lastName}`.trim() : record.beneficiaryId;
    
    return {
      beneficiaryId: record.beneficiaryId,
      name: (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' // Gap between picture and name
        }}>
          {beneficiary && beneficiary.picture ? (
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              border: '2px solid #e8f5e8'
            }}>
              <img 
                src={`http://localhost:5000${beneficiary.picture}`} 
                alt="Profile" 
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
              👤
            </div>
          )}
          <span>{beneficiaryName}</span>
        </div>
      ),
      surveyDate: new Date(record.surveyDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      surveyer: record.surveyer,
      aliveCrops: (
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#28a745', fontWeight: '600', fontSize: '0.6rem' }}>{record.aliveCrops.toLocaleString()}</span>
        </div>
      ),
      deadCrops: (
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#dc3545', fontWeight: '600', fontSize: '0.6rem' }}>{record.deadCrops.toLocaleString()}</span>
        </div>
      ),
      plot: record.plot || 'N/A'
    };
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 78px)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <div>
          <h2 style={{ color: '#2c5530', marginBottom: '0.2rem', fontSize: '1.4rem' }}>Crop Status</h2>
          <p style={{ color: '#6c757d', margin: '0', fontSize: '0.60rem' }}>Survey results and crop health monitoring</p>
        </div>
        <Button onClick={handleAddClick} type="primary" size="medium" icon="+">Add Record</Button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f5c6cb', fontSize: '0.65rem' }}>{error}</div>
      )}

      <div style={{ overflowX: 'auto', marginTop: '1rem', flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={styles.emptyState}>
            <div style={{ width: '35px', height: '35px', border: '3px solid #f3f3f3', borderTop: '3px solid #2c5530', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
                  <th key={index} style={{ 
                    ...styles.tableHeader, 
                    ...(columnHeaderStyles[index] || {})
                  }}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((record, rowIndex) => {
                const displayData = formatCropStatusForDisplay(record);
                return (
                  <tr 
                    key={record.id || rowIndex} 
                    style={{ 
                      borderBottom: '1px solid #e8f5e8', 
                      transition: 'background-color 0.2s', 
                      height: '28px', 
                      backgroundColor: rowIndex % 2 === 0 ? '#fafdfa' : 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewClick(record)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f8f0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fafdfa' : 'white'}>
                    {Object.values(displayData).map((cell, cellIndex) => (
                      <td key={cellIndex} style={{ ...styles.tableCell, ...(columnCellStyles[cellIndex] || {}) }}>{cell}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && cropStatusData.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'white', borderTop: '0.5px solid rgba(36, 99, 59, 0.3)', position: 'sticky', bottom: '0', flexShrink: 0 }}>
          <div style={{ fontSize: '0.65rem', color: '#6c757d' }}>
            Items {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, cropStatusData.length)} of {cropStatusData.length} entries
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} type="pagination" size="pagination">&lt;</Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button key={page} onClick={() => handlePageChange(page)} type={currentPage === page ? 'paginationActive' : 'pagination'} size="pagination" style={{ minWidth: '28px' }}>{page}</Button>
            ))}
            <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} type="pagination" size="pagination">&gt;</Button>
          </div>
        </div>
      )}

      <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal({ ...alertModal, isOpen: false })} type={alertModal.type} title={alertModal.title} message={alertModal.message} autoClose={true} autoCloseDelay={3000} />

      <AddCropStatusModal isOpen={isAddModalOpen} onClose={handleAddModalClose} onSubmit={handleAddModalSubmit} />

      {isEditModalOpen && selectedRecord && (
        <EditCropStatusModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSubmit={handleEditModalSubmit}
          record={selectedRecord}
        />
      )}

      <DeleteCropStatusModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        record={recordToDelete}
      />

      {isViewModalOpen && recordToView && (
        <ViewCropStatusModal
          isOpen={isViewModalOpen}
          onClose={handleViewModalClose}
          record={recordToView}
          onEdit={handleViewEditClick}
          onDelete={handleViewDeleteClick}
          beneficiary={beneficiaries.find(b => b.beneficiaryId === recordToView.beneficiaryId)}
        />
      )}
    </div>
  );
};

export default CropStatusTable; 