import React, { useState, useEffect } from 'react';
import { HiOutlineTrash } from "react-icons/hi2";
import { AiOutlineEdit } from "react-icons/ai";
import { 
  FaUserFriends, 
  FaSeedling, 
  FaLeaf,
  FaClipboardList 
} from 'react-icons/fa';
import AddBeneficiaryModal from './AddBeneficiaryModal';
import EditBeneficiaryModal from './EditBeneficiaryModal';
import DeleteBeneficiaryModal from './DeleteBeneficiaryModal';
import AlertModal from '../../ui/AlertModal';
import Button from '../../ui/Buttons';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { beneficiariesAPI, handleAPIError } from '../../../services/api';

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
  'Beneficiary ID',
  'Picture',
  'Name',
  'Address',
  'Gender',
  'BDate',
  'Age',
  'Status',
  'Cellphone',
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

const PersonalDetailsTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState(null);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [personalDetailsData, setPersonalDetailsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const styles = getCommonStyles();

  // Fetch beneficiaries from API
  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await beneficiariesAPI.getAll();
      setPersonalDetailsData(data);
    } catch (err) {
      const errorData = handleAPIError(err);
      setError(errorData.message);
      console.error('Error fetching beneficiaries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load beneficiaries on component mount
  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = personalDetailsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(personalDetailsData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Prepare API data from beneficiary object
  const prepareApiData = (beneficiary) => ({
    beneficiaryId: beneficiary.beneficiaryId,
    firstName: beneficiary.firstName,
    middleName: beneficiary.middleName,
    lastName: beneficiary.lastName,
    purok: beneficiary.purok,
    barangay: beneficiary.barangay,
    municipality: beneficiary.municipality,
    province: beneficiary.province,
    gender: beneficiary.gender,
    birthDate: beneficiary.birthDate,
    maritalStatus: beneficiary.maritalStatus,
    cellphone: beneficiary.cellphone,
    age: beneficiary.age,
    picture: beneficiary.picture instanceof File ? beneficiary.picture : null
  });

  // Handle API operations with alert feedback
  const handleApiOperation = async (operation, successMessage, errorMessage) => {
    try {
      await operation();
      await fetchBeneficiaries();
      setAlertModal(getAlertConfig('success', 'Success', successMessage));
    } catch (err) {
      const errorData = handleAPIError(err);
      setError(errorData.message);
      console.error('API operation error:', err);
      setAlertModal(getAlertConfig('error', 'Failed', errorMessage || errorData.message));
    }
  };

  const handleAddBeneficiary = async (newBeneficiary) => {
    const apiData = prepareApiData(newBeneficiary);
    await handleApiOperation(
      () => beneficiariesAPI.create(apiData),
      'Beneficiary has been added successfully.',
      'Failed to add beneficiary.'
    );
  };

  // Handle alert modal close and then close modals
  const handleAlertClose = () => {
    setAlertModal({ ...alertModal, isOpen: false });
    // Close modals after alert closes
    setTimeout(() => {
      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedBeneficiary(null);
    }, 100);
  };

  // Handle edit beneficiary
  const handleEditBeneficiary = async (updatedBeneficiary) => {
    const apiData = prepareApiData(updatedBeneficiary);
    await handleApiOperation(
      () => beneficiariesAPI.update(selectedBeneficiary.id, apiData),
      'Beneficiary has been updated successfully.',
      'Failed to update beneficiary.'
    );
  };

  // Handle delete beneficiary
  const handleDeleteBeneficiary = async (beneficiaryId) => {
    await handleApiOperation(
      () => beneficiariesAPI.delete(beneficiaryId),
      'Beneficiary has been deleted successfully.',
      'Failed to delete beneficiary.'
    );
  };

  // Handle edit button click
  const handleEditClick = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (beneficiary) => {
    setBeneficiaryToDelete(beneficiary);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async (beneficiary) => {
    try {
      const response = await beneficiariesAPI.delete(beneficiary.id);
      await fetchBeneficiaries(); // Refresh the data
      
      // Create a detailed success message
      let successMessage = 'Beneficiary deleted successfully.';
      if (response && response.deletedRecords) {
        const { seedlings, cropStatus, farmPlots } = response.deletedRecords;
        const details = [];
        if (seedlings > 0) details.push(`${seedlings} seedling record${seedlings > 1 ? 's' : ''}`);
        if (cropStatus > 0) details.push(`${cropStatus} crop status record${cropStatus > 1 ? 's' : ''}`);
        if (farmPlots > 0) details.push(`${farmPlots} farm plot${farmPlots > 1 ? 's' : ''}`);
        
        if (details.length > 0) {
          successMessage = `Beneficiary and related records deleted: ${details.join(', ')}.`;
        }
      }
      
      setAlertModal(getAlertConfig('success', 'Success', successMessage));
      
      // Close delete modal after showing notification
      setTimeout(() => {
        setIsDeleteModalOpen(false);
        setBeneficiaryToDelete(null);
      }, 1000); // Close after 1 second (same as alert duration)
    } catch (err) {
      const errorData = handleAPIError(err);
      setError(errorData.message);
      console.error('Error deleting beneficiary:', err);
      setAlertModal(getAlertConfig('error', 'Failed', 'Failed to delete beneficiary. Please try again.'));
    }
  };

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setBeneficiaryToDelete(null);
  };

  // Format data for display
  const formatBeneficiaryForDisplay = (beneficiary) => {
    return {
      beneficiaryId: beneficiary.beneficiaryId,
      picture: beneficiary.picture ? (
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
      ),
      name: beneficiary.fullName || `${beneficiary.firstName} ${beneficiary.middleName ? beneficiary.middleName + ' ' : ''}${beneficiary.lastName}`.trim(),
      address: beneficiary.fullAddress || `${beneficiary.purok}, ${beneficiary.barangay}, ${beneficiary.municipality}, ${beneficiary.province}`,
      gender: beneficiary.gender,
      bDate: new Date(beneficiary.birthDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      age: beneficiary.age,
      status: beneficiary.maritalStatus,
      cellphone: beneficiary.cellphone,
      actions: (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => handleEditClick(beneficiary)}
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
            onClick={() => handleDeleteClick(beneficiary)}
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
          <h2 style={{ color: '#2c5530', marginBottom: '0.2rem', fontSize: '1.4rem' }}>Personal Details</h2>
          <p style={{ color: '#6c757d', margin: '0', fontSize: '0.60rem' }}>Beneficiary personal information and contact details</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          type="primary"
          size="medium"
          icon="+"
        >
          Add Beneficiary
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
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>Please wait while we fetch the beneficiary data.</p>
          </div>
        ) : personalDetailsData.length === 0 ? (
          <div style={styles.emptyState}>
            <NoDataIcon type="beneficiaries" size="48px" color="#6c757d" />
            <h3 style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '1.125rem' }}>No Data Available</h3>
            <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>No beneficiary records found. Click "Add Beneficiary" to add new records.</p>
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
              {currentItems.map((beneficiary, rowIndex) => {
                const displayData = formatBeneficiaryForDisplay(beneficiary);
                return (
                  <tr key={beneficiary._id || rowIndex} style={{
                    borderBottom: '1px solid #e8f5e8',
                    transition: 'background-color 0.2s',
                    height: '28px',
                    backgroundColor: rowIndex % 2 === 0 ? '#fafdfa' : 'white'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f8f0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fafdfa' : 'white'}>
                    {Object.values(displayData).map((cell, cellIndex) => (
                      <td key={cellIndex} style={{
                        ...styles.tableCell,
                        padding: cellIndex === 1 ? '6px 8px 6px 16px' : cellIndex === 2 ? '6px 16px 6px 8px' : '6px 16px'
                      }}>
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
      {!loading && personalDetailsData.length > 0 && (
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
            Items {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, personalDetailsData.length)} of {personalDetailsData.length} entries
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

      {/* Modals */}
      {isModalOpen && (
        <AddBeneficiaryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddBeneficiary}
        />
      )}

      {isEditModalOpen && selectedBeneficiary && (
        <EditBeneficiaryModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedBeneficiary(null);
          }}
          onSubmit={handleEditBeneficiary}
          beneficiary={selectedBeneficiary}
        />
      )}

      {/* Delete Beneficiary Modal */}
      <DeleteBeneficiaryModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        beneficiary={beneficiaryToDelete}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={handleAlertClose}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        autoClose={true}
        autoCloseDelay={1000}
      />
    </div>
  );
};

export default PersonalDetailsTable; 