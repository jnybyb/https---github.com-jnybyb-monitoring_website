import React from 'react';
import { HiOutlineTrash } from "react-icons/hi2";

const DeleteSeedlingModal = ({ isOpen, onClose, onConfirm, record, beneficiaryName }) => {
  if (!isOpen || !record) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '0',
      maxWidth: '350px',
      width: '90%',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      position: 'relative'
    },
    header: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottom: '.5px solid #e9ecef',
      padding: '1.5rem 1.5rem',
      background: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    title: {
      color: 'var(--black)',
      margin: 0,
      fontSize: '1rem',
      fontWeight: '600'
    },
    content: {
      padding: '2rem',
      textAlign: 'center'
    },
    icon: {
      fontSize: '48px',
      color: 'var(--red)',
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'center'
    },
    message: {
      color: 'var(--black)',
      fontSize: '14px',
      marginBottom: '1.5rem',
      lineHeight: '1.5'
    },
    recordInfo: {
      backgroundColor: '#f8f9fa',
      padding: '1rem',
      borderRadius: '6px',
      marginBottom: '1.5rem',
      border: '1px solid #e9ecef'
    },
    beneficiaryName: {
      fontWeight: '600',
      color: 'var(--emerald-green)',
      fontSize: '16px',
      marginBottom: '0.5rem'
    },
    recordDetails: {
      color: 'var(--black)',
      fontSize: '14px',
      fontWeight: '500'
    },
    warning: {
      color: 'var(--red)',
      fontSize: '12px',
      fontStyle: 'italic',
      marginBottom: '1.5rem'
    },
    buttons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      border: 'none'
    },
    cancelButton: {
      border: '1px solid var(--gray)',
      backgroundColor: 'white',
      color: 'var(--black)'
    },
    deleteButton: {
      backgroundColor: 'var(--red)',
      color: 'white'
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(record);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Delete Seedling Record</h2>
        </div>

        {/* Modal Content */}
        <div style={styles.content}>
          {/* Warning Icon */}
          <div style={styles.icon}>
            <HiOutlineTrash size={48} color="#dc3545" />
          </div>

          {/* Confirmation Message */}
          <p style={styles.message}>
            Are you sure you want to delete this seedling record?
          </p>

          {/* Record Information */}
          <div style={styles.recordInfo}>
            <div style={styles.beneficiaryName}>
              {beneficiaryName || record.beneficiaryId}
            </div>
            <div style={styles.recordDetails}>
              <div>Beneficiary ID: {record.beneficiaryId}</div>
              <div>Received: {record.received}</div>
              <div>Planted: {record.planted}</div>
              <div>Hectares: {record.hectares} ha</div>
              <div>Plot: {record.plot || 'N/A'}</div>
              <div>Date: {(() => {
                try {
                  const date = new Date(record.dateOfPlanting || record.dateOfPlantingStart);
                  if (isNaN(date.getTime())) {
                    return 'N/A';
                  }
                  return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                } catch (error) {
                  return 'N/A';
                }
              })()}</div>
            </div>
          </div>

          {/* Warning Message */}
          <p style={styles.warning}>
            This action cannot be undone. All seedling record data will be permanently deleted.
          </p>

          {/* Action Buttons */}
          <div style={styles.buttons}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                ...styles.button,
                ...styles.cancelButton
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.borderColor = '#adb5bd';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = 'var(--gray)';
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              style={{
                ...styles.button,
                ...styles.deleteButton
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dc3545'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--red)'}
            >
              Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSeedlingModal;
