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
// Removed API imports

// Dummy data for initial state
const DUMMY_BENEFICIARIES = [
  { beneficiaryId: 'B001', fullName: 'Juan Dela Cruz' },
  { beneficiaryId: 'B002', fullName: 'Maria Santos' },
];
const DUMMY_SEEDLING_RECORDS = [
  {
    _id: 'R001',
    beneficiaryId: 'B001',
    received: 1000,
    planted: 900,
    hectares: 1.5,
    dateOfPlanting: '2023-06-15',
    gps: '7.2167, 126.3333',
  },
  {
    _id: 'R002',
    beneficiaryId: 'B002',
    received: 800,
    planted: 800,
    hectares: 1.2,
    dateOfPlanting: '2023-07-10',
    gps: '7.2200, 126.3400',
  },
];

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
  'Beneficiary Name',
  'Beneficiary ID',
  'Received',
  'Planted',
  'Hectares',
  'Date of Planting',
  'GPS',
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

const SeedlingRecordsTable = () => {
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [seedlingRecordsData, setSeedlingRecordsData] = useState(DUMMY_SEEDLING_RECORDS);
  const [beneficiaries, setBeneficiaries] = useState(DUMMY_BENEFICIARIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const styles = getCommonStyles();

  // Remove fetchSeedlingRecords and useEffect for fetching
  // Load seedling records on component mount
  // useEffect(() => {
  //   fetchSeedlingRecords();
  // }, []);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = seedlingRecordsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(seedlingRecordsData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Replace handleApiOperation and API logic with local state updates
  const handleAddSeedlingRecord = async (newRecord) => {
    setSeedlingRecordsData(prev => [
      { ...newRecord, _id: `R${Date.now()}` },
      ...prev,
    ]);
    setAlertModal(getAlertConfig('success', 'Success', 'Seedling record has been added successfully.'));
  };
  const handleEditSeedlingRecord = async (updatedRecord) => {
    setSeedlingRecordsData(prev => prev.map(r =>
      r._id === selectedRecord._id ? { ...selectedRecord, ...updatedRecord } : r
    ));
    setAlertModal(getAlertConfig('success', 'Success', 'Seedling record has been updated successfully.'));
  };
  const handleDeleteSeedlingRecord = async (recordId) => {
    setSeedlingRecordsData(prev => prev.filter(r => r._id !== recordId));
    setAlertModal(getAlertConfig('success', 'Success', 'Seedling record has been deleted successfully.'));
  };

  // Handle edit button click
  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (record) => {
    if (window.confirm('Are you sure you want to delete this seedling record? This action cannot be undone.')) {
      handleDeleteSeedlingRecord(record._id);
    }
  };

  // Handle alert modal close
  const handleAlertClose = () => {
    setAlertModal({ ...alertModal, isOpen: false });
    // Close modals after alert closes
    setTimeout(() => {
      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
    }, 100);
  };

  // Format data for display
  const formatSeedlingRecordForDisplay = (record) => {
    // Find beneficiary by ID to get the full name
    const beneficiary = beneficiaries.find(b => b.beneficiaryId === record.beneficiaryId);
    const beneficiaryName = beneficiary ? beneficiary.fullName : record.beneficiaryId;
    
    return {
      beneficiaryName: beneficiaryName,
      beneficiaryId: record.beneficiaryId,
      received: record.received.toLocaleString(),
      planted: record.planted.toLocaleString(),
      hectares: `${record.hectares} ha`,
      dateOfPlanting: new Date(record.dateOfPlanting).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      gps: record.gps || 'N/A',
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
          <h2 style={{ color: '#2c5530', marginBottom: '0.2rem', fontSize: '1.4rem' }}>Seedling Records</h2>
          <p style={{ color: '#6c757d', margin: '0', fontSize: '0.60rem' }}>Coffee seedling distribution and planting records</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
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
                  <th key={index} style={styles.tableHeader}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((record, rowIndex) => {
                const displayData = formatSeedlingRecordForDisplay(record);
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
      {!loading && seedlingRecordsData.length > 0 && (
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
            Items {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, seedlingRecordsData.length)} of {seedlingRecordsData.length} entries
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

      {/* Add Seedling Record Modal */}
      {isModalOpen && (
        <AddSeedlingRecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddSeedlingRecord}
        />
      )}

      {/* Edit Seedling Record Modal */}
      {isEditModalOpen && selectedRecord && (
        <AddSeedlingRecordModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecord(null);
          }}
          onSubmit={handleEditSeedlingRecord}
          record={selectedRecord}
          isEdit={true}
        />
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
    </div>
  );
};

export default SeedlingRecordsTable; 