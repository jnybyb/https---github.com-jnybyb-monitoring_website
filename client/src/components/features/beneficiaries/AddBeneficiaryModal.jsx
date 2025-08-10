import React, { useState, useEffect, memo } from 'react';

// Common styles
const getCommonStyles = () => ({
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: 'var(--black)',
    fontSize: '12px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    height: '44px'
  },
  select: {
    width: '100%',
    padding: '10px 32px 10px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    height: '44px',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    transition: 'border-color 0.2s ease'
  },
  error: {
    color: 'var(--red)',
    fontSize: '11px',
    marginTop: '4px',
    display: 'block'
  },
  sectionTitle: {
    color: 'var(--black)',
    marginBottom: '1.5rem',
    fontSize: '1rem',
    fontWeight: '600'
  },
  button: {
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  }
});

// Reusable input field component
const InputField = memo(({ 
  name, 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error 
}) => {
  const styles = getCommonStyles();
  
  return (
    <div>
      <label style={styles.label}>
        {label} {required && '*'}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        style={{
          ...styles.input,
          border: `1px solid ${error ? 'var(--red)' : 'var(--gray)'}`
        }}
        placeholder={placeholder}
        className="modal-input-field"
      />
      {error && (
        <span style={styles.error}>{error}</span>
      )}
    </div>
  );
});

// Reusable select field component
const SelectField = memo(({ 
  name, 
  label, 
  value, 
  onChange, 
  options, 
  required = false, 
  error 
}) => {
  const styles = getCommonStyles();
  
  return (
    <div>
      <label style={styles.label}>
        {label} {required && '*'}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          style={{
            ...styles.select,
            border: `1px solid ${error ? 'var(--red)' : 'var(--gray)'}`,
            color: value ? 'var(--black)' : '#adb5bd'
          }}
          className="custom-select-dropdown"
        >
          <option value="" disabled style={{ color: '#adb5bd' }}>Select {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option.value || option} value={option.value || option} style={{ color: 'var(--black)' }}>
              {option.label || option}
            </option>
          ))}
        </select>
        {/* Custom arrow icon */}
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          fontSize: '12px',
          color: '#adb5bd'
        }}>
          ▼
        </span>
      </div>
      {error && (
        <span style={styles.error}>{error}</span>
      )}
    </div>
  );
});

// Form data structure
const getInitialFormData = () => ({
  firstName: '',
  middleName: '',
  lastName: '',
  purok: '',
  barangay: '',
  municipality: 'Manay',
  province: 'Davao Oriental',
  gender: '',
  birthDate: '',
  maritalStatus: '',
  cellphone: '',
  picture: null
});

// Data options
const getDataOptions = () => ({
  provinces: [
    'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique', 'Apayao', 'Aurora',
    'Basilan', 'Bataan', 'Batanes', 'Batangas', 'Benguet', 'Biliran', 'Bohol', 'Bukidnon',
    'Bulacan', 'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin', 'Capiz', 'Catanduanes',
    'Cavite', 'Cebu', 'Cotabato', 'Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental',
    'Davao Oriental', 'Dinagat Islands', 'Eastern Samar', 'Guimaras', 'Ifugao', 'Ilocos Norte',
    'Ilocos Sur', 'Iloilo', 'Isabela', 'Kalinga', 'La Union', 'Laguna', 'Lanao del Norte',
    'Lanao del Sur', 'Leyte', 'Maguindanao', 'Marinduque', 'Masbate', 'Metro Manila', 'Misamis Occidental',
    'Misamis Oriental', 'Mountain Province', 'Negros Occidental', 'Negros Oriental', 'Northern Samar',
    'Nueva Ecija', 'Nueva Vizcaya', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Pampanga',
    'Pangasinan', 'Quezon', 'Quirino', 'Rizal', 'Romblon', 'Samar', 'Sarangani', 'Siquijor',
    'Sorsogon', 'South Cotabato', 'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Surigao del Norte',
    'Surigao del Sur', 'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte', 'Zamboanga del Sur',
    'Zamboanga Sibugay'
  ],
  barangays: [
    'Capasnan', 'Cayawan', 'Central', 'Concepcion', 'Del Pilar',
    'Guza', 'Holy Cross', 'Lambog', 'Mabini', 'Manreza',
    'New Taokanga', 'Old Macopa', 'Rizal', 'San Fermin', 'San Ignacio',
    'San Isidro', 'Zaragosa'
  ],
  genderOptions: [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ],
  maritalStatusOptions: [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Widowed', label: 'Widowed' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Separated', label: 'Separated' }
  ]
});

const AddBeneficiaryModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [beneficiaryId, setBeneficiaryId] = useState('');

  const styles = getCommonStyles();
  const options = getDataOptions();

  // Generate beneficiary ID on component mount
  useEffect(() => {
    generateBeneficiaryId();
  }, []);

  // Generate beneficiary ID: two letters, two numbers (e.g., AB12)
  const generateBeneficiaryId = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const randomLetter1 = letters[Math.floor(Math.random() * letters.length)];
    const randomLetter2 = letters[Math.floor(Math.random() * letters.length)];
    const randomNumber1 = numbers[Math.floor(Math.random() * numbers.length)];
    const randomNumber2 = numbers[Math.floor(Math.random() * numbers.length)];
    const newId = `${randomLetter1}${randomLetter2}${randomNumber1}${randomNumber2}`;
    setBeneficiaryId(newId);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'picture' && files) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          [name]: file
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.purok.trim()) {
      newErrors.purok = 'Purok is required';
    }
    
    if (!formData.barangay.trim()) {
      newErrors.barangay = 'Barangay is required';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }
    
    if (!formData.maritalStatus) {
      newErrors.maritalStatus = 'Marital status is required';
    }
    
    if (!formData.cellphone.trim()) {
      newErrors.cellphone = 'Cellphone number is required';
    } else if (!/^09\d{9}$/.test(formData.cellphone)) {
      newErrors.cellphone = 'Please enter a valid Philippine mobile number (09XXXXXXXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate age from birth date
  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return 0;
    
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(getInitialFormData());
    setErrors({});
    generateBeneficiaryId();
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const newBeneficiary = {
        beneficiaryId, // include the generated ID
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        purok: formData.purok,
        barangay: formData.barangay,
        municipality: formData.municipality,
        province: formData.province,
        gender: formData.gender,
        birthDate: formData.birthDate,
        maritalStatus: formData.maritalStatus,
        cellphone: formData.cellphone,
        picture: formData.picture
      };
      
      onSubmit(newBeneficiary);
      resetForm();
    }
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '0',
        maxWidth: '550px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        position: 'relative'
      }}
      className="hide-scrollbar-modal"
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '.5px solid #e9ecef',
          padding: '1.5rem 1.5rem',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ color: 'var(--black)', margin: 0, fontSize: '1rem', fontWeight: '600' }}>Add New Beneficiary</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {/* Personal Information Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={styles.sectionTitle}>
              Personal Information
            </h3>
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              {/* Name Fields */}
              <div style={{ width: '60%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <InputField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                  error={errors.firstName}
                />
                <InputField
                  name="middleName"
                  label="Middle Name"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  placeholder="Enter middle name (optional)"
                  error={errors.middleName}
                />
                <InputField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                  error={errors.lastName}
                />
              </div>

                             {/* Profile Picture Container */}
               <div style={{
                 minWidth: '200px',
                 maxWidth: '200px',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 gap: '.5rem',
                 marginTop: '1rem',
                 padding: '.6rem',
                 backgroundColor: '#f8f9fa',
                 borderRadius: '8px',
                 border: '1px solid #e9ecef',
                 boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
               }}>
                 <div style={{
                   width: '70px',
                   height: '70px',
                   borderRadius: '50%',
                   backgroundColor: 'white',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontSize: '40px',
                   border: '2px dashed #ced4da',
                   overflow: 'hidden',
                   transition: 'border-color 0.2s ease'
                 }}>
                   {formData.picture ? (
                     <img
                       src={URL.createObjectURL(formData.picture)}
                       alt="Preview"
                       style={{
                         width: '100%',
                         height: '100%',
                         objectFit: 'cover',
                         borderRadius: '50%'
                       }}
                     />
                   ) : (
                     <svg width="48" height="48" viewBox="0 0 24 24" fill="#6c757d">
                       <circle cx="12" cy="8" r="4"/>
                       <path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"/>
                     </svg>
                   )}
                 </div>
                 
                                   <div style={{ width: '100%', textAlign: 'center' }}>
                    <input
                      type="file"
                      name="picture"
                      accept="image/*"
                      onChange={handleInputChange}
                      style={{
                        width: '70%',
                        display: 'block',
                        margin: '0 auto 0.2rem auto',
                        border: '1px solid var(--gray)',
                        borderRadius: '4px',
                        fontSize: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        padding: '4px'
                      }}
                    />
                    <p style={{ fontSize: '8px', color: '#6c757d', marginBottom: '.5rem' }}>
                      Upload profile picture
                    </p>
                  </div>
                 
                 <div style={{
                   padding: '0.75rem',
                   backgroundColor: 'white',
                   borderRadius: '6px',
                   textAlign: 'center',
                   fontWeight: '500',
                   fontSize: '11px',
                   color: 'var(--black)',
                   width: '100%',
                   border: '1px solid #e9ecef'
                 }}>
                   <div style={{ marginBottom: '0.25rem', fontSize: '10px' }}>Beneficiary ID</div>
                   <span style={{ 
                     fontWeight: '700', 
                     color: 'var(--emerald-green)', 
                     letterSpacing: '1px', 
                     fontSize: '16px' 
                   }}>
                     {beneficiaryId}
                   </span>
                 </div>
               </div>
            </div>
          </div>

          {/* Address Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={styles.sectionTitle}>
              Address Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={styles.label}>
                  Province *
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  readOnly
                  style={{
                    ...styles.input,
                    border: '1px solid var(--gray)',
                    backgroundColor: '#f8f9fa',
                    color: 'var(--black)',
                    cursor: 'not-allowed'
                  }}
                  tabIndex={-1}
                />
              </div>
              <div>
                <label style={styles.label}>
                  Municipality *
                </label>
                <input
                  type="text"
                  name="municipality"
                  value={formData.municipality}
                  readOnly
                  style={{
                    ...styles.input,
                    border: '1px solid var(--gray)',
                    backgroundColor: '#f8f9fa',
                    color: 'var(--black)',
                    cursor: 'not-allowed'
                  }}
                  tabIndex={-1}
                />
              </div>
              <SelectField
                name="barangay"
                label="Barangay"
                value={formData.barangay}
                onChange={handleInputChange}
                options={options.barangays}
                required
                error={errors.barangay}
              />
              <InputField
                name="purok"
                label="Purok"
                value={formData.purok}
                onChange={handleInputChange}
                placeholder="Enter purok"
                required
                error={errors.purok}
              />
            </div>
          </div>

          {/* Personal Details Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={styles.sectionTitle}>
              Personal Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <SelectField
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleInputChange}
                options={options.genderOptions}
                required
                error={errors.gender}
              />
              <SelectField
                name="maritalStatus"
                label="Marital Status"
                value={formData.maritalStatus}
                onChange={handleInputChange}
                options={options.maritalStatusOptions}
                required
                error={errors.maritalStatus}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={styles.label}>
                  Birth Date *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    border: `1px solid ${errors.birthDate ? 'var(--red)' : 'var(--gray)'}`,
                    color: formData.birthDate ? 'var(--black)' : '#adb5bd',
                    backgroundColor: 'white'
                  }}
                  placeholder="Select birth date"
                />
                {errors.birthDate && (
                  <span style={styles.error}>{errors.birthDate}</span>
                )}
              </div>
              <div>
                <label style={styles.label}>
                  Age
                </label>
                <input
                  type="text"
                  value={formData.birthDate ? calculateAge(formData.birthDate) : '—'}
                  readOnly
                  style={{
                    ...styles.input,
                    border: '1px solid var(--gray)',
                    backgroundColor: '#f8f9fa',
                    color: 'var(--black)',
                    cursor: 'not-allowed'
                  }}
                  tabIndex={-1}
                />
              </div>
            </div>
            
            <InputField
              name="cellphone"
              label="Cellphone Number"
              value={formData.cellphone}
              onChange={handleInputChange}
              placeholder="09XXXXXXXXX"
              required
              error={errors.cellphone}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            paddingTop: '1rem',
            borderTop: '1px solid #e9ecef'
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                ...styles.button,
                border: '1px solid var(--gray)',
                backgroundColor: 'white',
                color: 'var(--black)'
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
              type="submit"
              style={{
                ...styles.button,
                border: 'none',
                backgroundColor: 'var(--dark-green)',
                color: 'white'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--emerald-green)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--dark-green)'}
            >
              Add Beneficiary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBeneficiaryModal;

<style>
{`
.hide-scrollbar-modal::-webkit-scrollbar {
  display: none;
}
.custom-select-dropdown option {
  font-size: 12px;
}
.custom-select-dropdown {
  max-height: 44px;
  overflow-y: auto;
}
.custom-select-dropdown:focus {
  outline: 2px solid var(--emerald-green);
}
.modal-input-field::placeholder {
  color: #adb5bd;
}
.modal-input-field:focus {
  outline: 2px solid var(--emerald-green);
  border-color: var(--emerald-green);
}
/* Fix dropdown overflow */
select.custom-select-dropdown {
  max-height: 44px;
}
select.custom-select-dropdown:focus {
  max-height: 200px;
  overflow-y: auto;
}
select.custom-select-dropdown::-webkit-scrollbar {
  width: 6px;
}
select.custom-select-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
select.custom-select-dropdown::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
select.custom-select-dropdown::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
/* Hide scrollbar for Firefox */
select.custom-select-dropdown {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}
`}
</style> 

