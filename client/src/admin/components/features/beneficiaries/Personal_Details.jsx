import React, { useState, useEffect } from 'react';
import { beneficiariesAPI, handleAPIError } from '../../../services/api';
import { 
  FaUserFriends, 
  FaSeedling, 
  FaLeaf,
  FaClipboardList 
} from 'react-icons/fa';
import { HiOutlineTrash } from "react-icons/hi2";
import { AiOutlineEdit } from "react-icons/ai";
import { LuArrowDownUp, LuArrowUpAZ, LuArrowDownZA, LuArrowDown, LuArrowUp, LuArrowUp01, LuArrowDown10 } from "react-icons/lu";
import Button from '../../ui/BeneficiaryButtons';
import AlertModal from '../../ui/AlertModal';
import Pagination from '../../ui/Pagination';
import AddBeneficiaryModal from './AddBeneficiaryModal';
import EditBeneficiaryModal from './EditBeneficiaryModal';
import DeleteBeneficiaryModal from './DeleteBeneficiaryModal';

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
  'Name',
  'Address',
  'Gender',
  'Birth Date',
  'Age',
  'Status',
  'Cellphone',
  ''
];

// Common styles (updated to match requested UI)
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
  actionsCell: {
    display: 'flex',
    gap: '8px'
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
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #f5c6cb',
    fontSize: '0.875rem'
  }
});

const PersonalDetailsTable = () => {
  const styles = getCommonStyles();
  
  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'default' // 'default', 'asc', 'desc'
  });

  // Format address for display
  const formatAddress = (beneficiary) => {
    const parts = [
      beneficiary.purok,
      beneficiary.barangay,
      beneficiary.municipality,
      beneficiary.province
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Format name for display
  const formatName = (beneficiary) => {
    const parts = [
      beneficiary.firstName,
      beneficiary.middleName,
      beneficiary.lastName
    ].filter(Boolean);
    return parts.join(' ');
  };

  const totalRecords = filteredBeneficiaries.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Get unique addresses and statuses for filter options
  const uniqueAddresses = [...new Set(beneficiaries.map(b => formatAddress(b)).filter(Boolean))];
  const uniqueStatuses = [...new Set(beneficiaries.map(b => b.maritalStatus).filter(Boolean))];

  useEffect(() => {
    // Ensure current page stays in range when data/pageSize changes
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  // Load existing beneficiaries from the database on mount
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await beneficiariesAPI.getAll();
        const records = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setBeneficiaries(records);
        setFilteredBeneficiaries(records);
      } catch (err) {
        setError(err?.message || 'Failed to load beneficiaries.');
      } finally {
        setLoading(false);
      }
    };
    fetchBeneficiaries();
  }, []);

  // Handler to open the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handler for form submission
  const handleSubmitBeneficiary = async (beneficiaryData) => {
    try {
      // After creating on the server, refresh the list to get the canonical
      // picture URL (instead of keeping a File object in state).
      const res = await beneficiariesAPI.getAll();
      const records = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setBeneficiaries(records);
      setFilteredBeneficiaries(records); // Update filtered list
      handleCloseModal();
      setAlertModal({ isOpen: true, type: 'success', title: 'Success', message: 'Beneficiary has been added successfully.' });
    } catch (error) {
      const e = handleAPIError(error);
      setError(e.message || 'Failed to add beneficiary.');
      setAlertModal({ isOpen: true, type: 'error', title: 'Failed', message: e.message || 'Failed to add beneficiary.' });
    }
  };

  // Open Edit modal with selected beneficiary
  const handleOpenEdit = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsEditOpen(true);
  };

  // Close Edit modal
  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedBeneficiary(null);
  };

  // Submit Edit changes
  const handleSubmitEdit = async (updateData) => {
    if (!selectedBeneficiary) return;
    try {
      setLoading(true);
      await beneficiariesAPI.update(selectedBeneficiary.id, updateData);
      // Refresh list to reflect any server-side formatting (e.g., picture path)
      const res = await beneficiariesAPI.getAll();
      const records = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setBeneficiaries(records);
      setFilteredBeneficiaries(records); // Update filtered list
      handleCloseEdit();
      setAlertModal({ isOpen: true, type: 'success', title: 'Success', message: 'Beneficiary has been updated successfully.' });
    } catch (err) {
      const e = handleAPIError(err);
      setError(e.message || 'Failed to update beneficiary.');
      setAlertModal({ isOpen: true, type: 'error', title: 'Failed', message: e.message || 'Failed to update beneficiary.' });
    } finally {
      setLoading(false);
    }
  };

  // Open Delete modal with selected beneficiary
  const handleOpenDelete = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsDeleteOpen(true);
  };

  // Close Delete modal
  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedBeneficiary(null);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedBeneficiary) return;
    try {
      setLoading(true);
      await beneficiariesAPI.delete(selectedBeneficiary.id);
      setBeneficiaries((prev) => prev.filter((b) => b.id !== selectedBeneficiary.id));
      setFilteredBeneficiaries((prev) => prev.filter((b) => b.id !== selectedBeneficiary.id)); // Update filtered list
      handleCloseDelete();
      setAlertModal({ isOpen: true, type: 'success', title: 'Success', message: 'Beneficiary has been deleted successfully.' });
    } catch (err) {
      const e = handleAPIError(err);
      setError(e.message || 'Failed to delete beneficiary.');
      setAlertModal({ isOpen: true, type: 'error', title: 'Failed', message: e.message || 'Failed to delete beneficiary.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertModal({ ...alertModal, isOpen: false });
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'default';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'default') {
        direction = 'asc';
      } else if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else {
        direction = 'default';
      }
    } else {
      direction = 'asc';
    }

    setSortConfig({ key, direction });

    if (direction === 'default') {
      setFilteredBeneficiaries([...beneficiaries]);
    } else {
      const sorted = [...beneficiaries].sort((a, b) => {
        let aValue, bValue;

        if (key === 'beneficiaryId') {
          aValue = a.beneficiaryId || '';
          bValue = b.beneficiaryId || '';
        } else if (key === 'name') {
          aValue = formatName(a).toLowerCase();
          bValue = formatName(b).toLowerCase();
        } else if (key === 'birthDate') {
          aValue = a.birthDate ? new Date(a.birthDate).getTime() : 0;
          bValue = b.birthDate ? new Date(b.birthDate).getTime() : 0;
          if (direction === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        } else if (key === 'gender') {
          aValue = a.gender || '';
          bValue = b.gender || '';
        } else if (key === 'age') {
          aValue = parseInt(a.age) || 0;
          bValue = parseInt(b.age) || 0;
          if (direction === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        } else {
          aValue = a[key] || '';
          bValue = b[key] || '';
        }

        if (direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      setFilteredBeneficiaries(sorted);
    }
  };

  // Get sort icon for a column
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      if (columnKey === 'gender') {
        return <LuArrowDownUp size={12} />;
      } else if (columnKey === 'age') {
        return <LuArrowDownUp size={12} />;
      } else {
        return <LuArrowDownUp size={12} />;
      }
    }
    
    switch (sortConfig.direction) {
      case 'asc':
        if (columnKey === 'gender') {
          return <LuArrowUp size={12} />;
        } else if (columnKey === 'age') {
          return <LuArrowUp01 size={12} />;
        } else {
          return <LuArrowUpAZ size={12} />;
        }
      case 'desc':
        if (columnKey === 'gender') {
          return <LuArrowDown size={12} />;
        } else if (columnKey === 'age') {
          return <LuArrowDown10 size={12} />;
        } else {
          return <LuArrowDownZA size={12} />;
        }
      default:
        if (columnKey === 'gender') {
          return <LuArrowDownUp size={12} />;
        } else if (columnKey === 'age') {
          return <LuArrowDownUp size={12} />;
        } else {
          return <LuArrowDownUp size={12} />;
        }
    }
  };

  // Apply filters
  const applyFilters = () => {
    // No filters to apply, just use all beneficiaries
    setFilteredBeneficiaries([...beneficiaries]);
    setCurrentPage(1); // Reset to first page
  };

  // Render table content
  const renderTableContent = () => {
    if (loading) {
      return (
        <div style={styles.emptyState}>
          <div style={{ width: '35px', height: '35px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--dark-green)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#6c757d', margin: '1rem 0 0 0', fontSize: '0.875rem' }}>
            Loading beneficiaries...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.errorMessage}>
            <strong>Error:</strong> {error}
          </div>
          <Button
            onClick={() => setError(null)}
            type="secondary"
            size="medium"
          >
            Retry
          </Button>
        </div>
      );
    }

    if (filteredBeneficiaries.length === 0) {
      return (
        <div style={styles.emptyState}>
          <NoDataIcon type="beneficiaries" size="48px" color="#6c757d" />
          <h3 style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '1.125rem' }}>No Data Available</h3>
          <p style={{ color: '#6c757d', margin: '0', fontSize: '0.875rem' }}>No beneficiary records found. Click "Add Beneficiary" to add new records.</p>
        </div>
      );
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filteredBeneficiaries.slice(start, end);

    return (
      <>
        <table style={styles.table}>
          <thead>
            <tr style={{ backgroundColor: '#f0f8f0' }}>
              {columns.map((column, index) => (
                <th
                  key={index}
                  style={{
                    ...styles.tableHeader,
                    paddingLeft: index === 1 ? '20px' : '12px',
                    cursor: (column === 'Beneficiary ID' || column === 'Name' || column === 'Birth Date' || column === 'Gender' || column === 'Age') ? 'pointer' : 'default',
                    userSelect: 'none',
                    position: 'relative'
                  }}
                  onClick={() => {
                    if (column === 'Beneficiary ID') handleSort('beneficiaryId');
                    else if (column === 'Name') handleSort('name');
                    else if (column === 'Birth Date') handleSort('birthDate');
                    else if (column === 'Gender') handleSort('gender');
                    else if (column === 'Age') handleSort('age');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {(column === 'Beneficiary ID' || column === 'Name' || column === 'Birth Date' || column === 'Gender' || column === 'Age') && (
                      <span style={{ color: sortConfig.key === (column === 'Beneficiary ID' ? 'beneficiaryId' : column === 'Name' ? 'name' : column === 'Birth Date' ? 'birthDate' : column === 'Gender' ? 'gender' : 'age') ? '#2c5530' : '#6c757d' }}>
                        {getSortIcon(column === 'Beneficiary ID' ? 'beneficiaryId' : column === 'Name' ? 'name' : column === 'Birth Date' ? 'birthDate' : column === 'Gender' ? 'gender' : 'age')}
                      </span>
                    )}
                    {column}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((beneficiary, rowIndex) => (
              <tr
                key={beneficiary.id}
                style={{
                  borderBottom: '1px solid #e8f5e8',
                  transition: 'background-color 0.2s',
                  height: '28px',
                  backgroundColor: rowIndex % 2 === 0 ? '#fafdfa' : 'white'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0f8f0')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fafdfa' : 'white')}
              >
                {/* Beneficiary ID */}
                <td style={styles.tableCell}>{beneficiary.beneficiaryId}</td>

                {/* Name with avatar */}
                <td style={{ ...styles.tableCell, padding: '6px 8px 6px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {beneficiary.picture ? (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f8f9fa',
                          border: '2px solid #e8f5e8'
                        }}
                      >
                        <img
                          src={`http://localhost:5000${beneficiary.picture}`}
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#f8f9fa',
                          border: '2px solid #e8f5e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}
                      >
                        👤
                      </div>
                    )}
                    <span>
                      {[beneficiary.firstName, beneficiary.middleName, beneficiary.lastName]
                        .filter(Boolean)
                        .join(' ')}
                    </span>
                  </div>
                </td>

                {/* Address */}
                <td style={styles.tableCell}>{formatAddress(beneficiary)}</td>

                {/* Gender */}
                <td style={styles.tableCell}>{beneficiary.gender}</td>

                {/* Birth Date (formatted) */}
                <td style={styles.tableCell}>
                  {beneficiary.birthDate
                    ? new Date(beneficiary.birthDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : ''}
                </td>

                {/* Age */}
                <td style={styles.tableCell}>{beneficiary.age}</td>

                {/* Status */}
                <td style={styles.tableCell}>{beneficiary.maritalStatus}</td>

                {/* Cellphone */}
                <td style={styles.tableCell}>{beneficiary.cellphone}</td>

                {/* Actions */}
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      style={{ ...styles.actionButton, color: '#2c5530' }}
                      onMouseOver={(e) => (e.currentTarget.style.color = '#1e3a23')}
                      onMouseOut={(e) => (e.currentTarget.style.color = '#2c5530')}
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => handleOpenEdit(beneficiary)}
                    >
                      <AiOutlineEdit size={12} />
                    </button>
                    <button
                      style={{ ...styles.actionButton, color: '#dc3545' }}
                      onMouseOver={(e) => (e.currentTarget.style.color = '#c82333')}
                      onMouseOut={(e) => (e.currentTarget.style.color = '#dc3545')}
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => handleOpenDelete(beneficiary)}
                    >
                      <HiOutlineTrash size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 78px)', overflow: 'hidden' }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <div>
          <h2 style={{ color: '#2c5530', marginBottom: '0.2rem', fontSize: '1.4rem' }}>Personal Details</h2>
          <p style={{ color: '#6c757d', margin: '0', fontSize: '0.60rem' }}>
            Beneficiary personal information and contact details
          </p>
        </div>
          <Button
            onClick={handleOpenModal}
            type="primary"
            size="medium"
            icon="+"
          >
            Add Beneficiary
          </Button>
      </div>
      
      {/* Table container */}
      <div style={{ overflowX: 'auto', marginTop: '1rem', flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {renderTableContent()}
        </div>

      {/* Sticky pagination anchored to MainContent container (outside the inner scroller) */}
      {filteredBeneficiaries.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Add Beneficiary Modal */}
      <AddBeneficiaryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitBeneficiary}
      />

      {/* Edit Beneficiary Modal */}
      <EditBeneficiaryModal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        onSubmit={handleSubmitEdit}
        beneficiary={selectedBeneficiary}
      />

      {/* Delete Beneficiary Modal */}
      <DeleteBeneficiaryModal
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        beneficiary={selectedBeneficiary}
      />

      {/* Alerts */}
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

export default PersonalDetailsTable; 