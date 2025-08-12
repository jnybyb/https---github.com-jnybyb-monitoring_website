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
import DeleteCropStatusModal from '../../features/crop-status/DeleteCropStatusModal';
import { cropStatusAPI, beneficiariesAPI, handleAPIError } from '../../../services/api';

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
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [cropStatusData, setCropStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
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
      console.log('Fetched crop status data:', data); // Debug log
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
    console.log('Updating crop status record:', updatedRecord); // Debug log
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
    console.log('Edit clicked for record:', record); // Debug log
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const formatCropStatusForDisplay = (record) => {
    return {
      surveyDate: new Date(record.surveyDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      surveyer: record.surveyer,
      beneficiaryId: record.beneficiaryId,
      pictures: record.pictures && record.pictures.length > 0 ? (
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', border: '2px solid #e8f5e8', cursor: 'pointer' }}
          title="Click to view pictures"
          onClick={() => console.log('View pictures:', record.pictures)}>
          <img src={`http://localhost:5000/uploads/${record.pictures[0]}`} alt="Crop Survey" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f8f9fa', border: '2px solid #e8f5e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>📷</div>
      ),
      aliveCrops: (<span style={{ color: '#28a745', fontWeight: '600', fontSize: '0.6rem' }}>{record.aliveCrops.toLocaleString()}</span>),
      deadCrops: (<span style={{ color: '#dc3545', fontWeight: '600', fontSize: '0.6rem' }}>{record.deadCrops.toLocaleString()}</span>),
      actions: (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button onClick={() => handleEditClick(record)} style={{ ...styles.actionButton, color: '#2c5530' }} onMouseOver={(e) => e.target.style.color = '#1e3a23'} onMouseOut={(e) => e.target.style.color = '#2c5530'} title="Edit"><AiOutlineEdit size={12} /></button>
          <button onClick={() => handleDeleteClick(record)} style={{ ...styles.actionButton, color: '#dc3545' }} onMouseOver={(e) => e.target.style.color = '#c82333'} onMouseOut={(e) => e.target.style.color = '#dc3545'} title="Delete"><HiOutlineTrash size={12} /></button>
        </div>
      )
    };
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
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
                  <th key={index} style={styles.tableHeader}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((record, rowIndex) => {
                const displayData = formatCropStatusForDisplay(record);
                return (
                  <tr key={record.id || rowIndex} style={{ borderBottom: '1px solid #e8f5e8', transition: 'background-color 0.2s', height: '28px', backgroundColor: rowIndex % 2 === 0 ? '#fafdfa' : 'white' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f8f0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fafdfa' : 'white'}>
                    {Object.values(displayData).map((cell, cellIndex) => (
                      <td key={cellIndex} style={styles.tableCell}>{cell}</td>
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
        <AddCropStatusModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSubmit={handleEditModalSubmit}
          record={selectedRecord}
          isEdit={true}
        />
      )}

      <DeleteCropStatusModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        record={recordToDelete}
      />
    </div>
  );
};

export default CropStatusTable; 