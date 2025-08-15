import React, { useState, useEffect } from 'react';
import { HiOutlineTrash } from "react-icons/hi2";
import { AiOutlineEdit } from "react-icons/ai";
import { 
  FaUserFriends, 
  FaSeedling, 
  FaLeaf,
  FaClipboardList 
} from 'react-icons/fa';
import Button from '../../ui/Buttons';
import AlertModal from '../../ui/AlertModal';
import LoadingSpinner from '../../ui/LoadingSpinner';
import AddSeedlingRecordModal from './AddSeedlingRecordModal';
import DeleteSeedlingModal from './DeleteSeedlingModal';
import { seedlingsAPI, beneficiariesAPI, handleAPIError } from '../../../services/api';

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

// Table column headers (requested order)
const columns = [
  'Beneficiary ID',
  'Name',
  'Seeds Received',
  'Date Received',
  'Planted',
  'Date Planted',
  'Hectares',
  'Plot',
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

// Spacing styles with more space between Beneficiary ID and Name
const columnHeaderStyles = {
  0: { paddingRight: '16px', width: '1%', whiteSpace: 'nowrap' }, // Beneficiary ID
  1: { paddingLeft: '32px' }, // Name
  2: { paddingLeft: '16px' }, // Seeds Received
  3: { paddingLeft: '16px' }, // Date Received
  4: { paddingLeft: '16px' }, // Planted
  5: { paddingLeft: '16px' }, // Date Planted
  6: { paddingLeft: '16px' }, // Hectares
  7: { paddingLeft: '16px' }  // Plot
};
const columnCellStyles = {
  0: { paddingRight: '16px', width: '1%', whiteSpace: 'nowrap' }, // Beneficiary ID
  1: { padding: '6px 8px 6px 24px' }, // Name
  2: { paddingLeft: '16px' }, // Seeds Received
  3: { paddingLeft: '16px' }, // Date Received
  4: { paddingLeft: '16px' }, // Planted
  5: { paddingLeft: '16px' }, // Date Planted
  6: { paddingLeft: '16px' }, // Hectares
  7: { paddingLeft: '16px' }  // Plot
};

// Alert modal configuration
const getAlertConfig = (type, title, message) => ({
  isOpen: true,
  type,
  title,
  message
});

const SeedlingRecordsTable = () => {
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [seedlingRecordsData, setSeedlingRecordsData] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const styles = getCommonStyles();

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [records, bens] = await Promise.all([
        seedlingsAPI.getAll(),
        beneficiariesAPI.getAll()
      ]);
      setSeedlingRecordsData(records || []);
      // Map beneficiaries for name lookup and profile pictures
      const mapped = (bens || []).map(b => ({
        beneficiaryId: b.beneficiaryId,
        fullName: b.fullName || `${b.firstName} ${b.middleName ? b.middleName + ' ' : ''}${b.lastName}`.trim(),
        picture: b.picture // Include profile picture from database
      }));
      setBeneficiaries(mapped);
    } catch (err) {
      const e = handleAPIError(err);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = seedlingRecordsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(seedlingRecordsData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleAddSeedlingRecord = async (newRecord) => {
    try {
      await seedlingsAPI.create(newRecord);
      setAlertModal(getAlertConfig('success', 'Success', 'Seedling record has been added successfully.'));
      await fetchAll();
    } catch (err) {
      const e = handleAPIError(err);
      setError(e.message);
      setAlertModal(getAlertConfig('error', 'Failed', e.message));
    }
  };

  const handleEditSeedlingRecord = async (updatedRecord) => {
    try {
      // Use the ID from the updated record data
      const recordId = updatedRecord.id;
      if (!recordId) {
        throw new Error('Record ID is missing for update operation');
      }
      
      await seedlingsAPI.update(recordId, updatedRecord);
      setAlertModal(getAlertConfig('success', 'Success', 'Seedling record has been updated successfully.'));
      await fetchAll();
    } catch (err) {
      const e = handleAPIError(err);
      setError(e.message);
      setAlertModal(getAlertConfig('error', 'Failed', e.message));
    }
  };

  const handleDeleteSeedlingRecord = async (recordId) => {
    try {
      await seedlingsAPI.delete(recordId);
      setAlertModal(getAlertConfig('success', 'Success', 'Seedling record has been deleted successfully.'));
      await fetchAll();
    } catch (err) {
      const e = handleAPIError(err);
      setError(e.message);
      setAlertModal(getAlertConfig('error', 'Failed', e.message));
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

  const handleAlertClose = () => {
    setAlertModal({ ...alertModal, isOpen: false });
    setTimeout(() => {
      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedRecord(null);
      setRecordToDelete(null);
    }, 100);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setRecordToDelete(null);
  };

  const handleDeleteConfirm = async (record) => {
    try {
      await handleDeleteSeedlingRecord(record.id);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      // handled
    }
  };

  const formatSeedlingRecordForDisplay = (record) => {
    const beneficiary = beneficiaries.find(b => b.beneficiaryId === record.beneficiaryId);
    const beneficiaryName = beneficiary ? beneficiary.fullName : record.beneficiaryId;
    const start = record.dateOfPlantingStart || record.dateOfPlanting;
    const end = record.dateOfPlantingEnd || null;
    const receivedDateString = record.dateReceived ? new Date(record.dateReceived).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const dateString = (() => {
      if (!start) return 'N/A';
      const startDate = new Date(start);
      if (!end) return startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const endDate = new Date(end);
      // Same month and year → e.g., August 12-18, 2025
      if (startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()) {
        const month = startDate.toLocaleDateString('en-US', { month: 'long' });
        return `${month} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
      }
      // Different month or year → e.g., August 28, 2025 - September 02, 2025
      const s = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const e = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      return `${s} - ${e}`;
    })();
    return {
      beneficiaryId: record.beneficiaryId,
      beneficiaryName: (
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
      received: Number(record.received).toLocaleString(),
      dateReceived: receivedDateString,
      planted: Number(record.planted).toLocaleString(),
      dateOfPlanting: dateString,
      hectares: record.hectares ? `${record.hectares} ha` : 'N/A',
      plot: record.plot || 'N/A',
      actions: (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={() => handleEditClick(record)}
            style={{ ...styles.actionButton, color: '#2c5530' }}
            onMouseOver={(e) => e.target.style.color = '#1e3a23'}
            onMouseOut={(e) => e.target.style.color = '#2c5530'}
            title="Edit"
          >
            <AiOutlineEdit size={12} />
          </button>
          <button
            onClick={() => handleDeleteClick(record)}
            style={{ ...styles.actionButton, color: '#dc3545' }}
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <div>
          <h2 style={{ color: '#2c5530', marginBottom: '0.2rem', fontSize: '1.4rem' }}>Seedling Records</h2>
          <p style={{ color: '#6c757d', margin: '0', fontSize: '0.60rem' }}>Coffee seedling distribution and planting records</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} type="primary" size="medium" icon="+">Add Record</Button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f5c6cb', fontSize: '0.65rem' }}>
          {error}
        </div>
      )}

      <div style={{ overflowX: 'auto', marginTop: '1rem', flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={styles.emptyState}>
            <LoadingSpinner color="#2c5530" />
            <h3 style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Loading...</h3>
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>Please wait while we fetch the seedling records.</p>
          </div>
        ) : seedlingRecordsData.length === 0 ? (
          <div style={styles.emptyState}>
            <NoDataIcon type="seedlings" size="48px" color="#6c757d" />
            <h3 style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '1.125rem' }}>No Data Available</h3>
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>No seedling records found. Click "Add Record" to add new records.</p>
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
                const displayData = formatSeedlingRecordForDisplay(record);
                return (
                  <tr key={record.id || rowIndex} style={{ borderBottom: '1px solid #e8f5e8', transition: 'background-color 0.2s', height: '28px', backgroundColor: rowIndex % 2 === 0 ? '#fafdfa' : 'white' }}
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

      {!loading && seedlingRecordsData.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'white', borderTop: '0.5px solid rgba(36, 99, 59, 0.3)', position: 'sticky', bottom: '0', flexShrink: 0 }}>
          <div style={{ fontSize: '0.65rem', color: '#6c757d' }}>
            Items {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, seedlingRecordsData.length)} of {seedlingRecordsData.length} entries
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

      {isModalOpen && (
        <AddSeedlingRecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddSeedlingRecord} />
      )}

      {isEditModalOpen && selectedRecord && (
        <AddSeedlingRecordModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedRecord(null); }} onSubmit={handleEditSeedlingRecord} record={selectedRecord} isEdit={true} />
      )}

      <AlertModal isOpen={alertModal.isOpen} onClose={handleAlertClose} type={alertModal.type} title={alertModal.title} message={alertModal.message} autoClose={true} autoCloseDelay={3000} />

      <DeleteSeedlingModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        record={recordToDelete}
        beneficiaryName={recordToDelete ? beneficiaries.find(b => b.beneficiaryId === recordToDelete.beneficiaryId)?.fullName : ''}
      />
    </div>
  );
};

export default SeedlingRecordsTable; 
