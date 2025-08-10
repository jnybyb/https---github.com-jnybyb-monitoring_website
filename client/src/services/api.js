const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle API errors
const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.error || 'Server error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'No response from server. Please check your connection.',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0
    };
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw handleAPIError(error);
  }
};

// Generic API request function for file uploads
const apiRequestWithFile = async (endpoint, formData, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || 'POST',
      body: formData,
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw handleAPIError(error);
  }
};

// Beneficiaries API
export const beneficiariesAPI = {
  // Get all beneficiaries
  getAll: async () => {
    return apiRequest('/beneficiaries');
  },

  // Get single beneficiary
  getById: async (id) => {
    return apiRequest(`/beneficiaries/${id}`);
  },

  // Create new beneficiary
  create: async (beneficiaryData) => {
    const formData = new FormData();
    
    // Add all text fields
    Object.keys(beneficiaryData).forEach(key => {
      if (key !== 'picture' && beneficiaryData[key] !== null && beneficiaryData[key] !== undefined) {
        formData.append(key, beneficiaryData[key]);
      }
    });
    
    // Add picture file if present
    if (beneficiaryData.picture instanceof File) {
      formData.append('picture', beneficiaryData.picture);
    }
    
    return apiRequestWithFile('/beneficiaries', formData, {
      method: 'POST'
    });
  },

  // Update beneficiary
  update: async (id, beneficiaryData) => {
    const formData = new FormData();
    
    // Add all text fields
    Object.keys(beneficiaryData).forEach(key => {
      if (key !== 'picture' && beneficiaryData[key] !== null && beneficiaryData[key] !== undefined) {
        formData.append(key, beneficiaryData[key]);
      }
    });
    
    // Add picture file if present
    if (beneficiaryData.picture instanceof File) {
      formData.append('picture', beneficiaryData.picture);
    }
    
    return apiRequestWithFile(`/beneficiaries/${id}`, formData, {
      method: 'PUT'
    });
  },

  // Delete beneficiary
  delete: async (id) => {
    return apiRequest(`/beneficiaries/${id}`, {
      method: 'DELETE'
    });
  }
};

// Farm Plots API
export const farmPlotsAPI = {
  // Get all farm plots
  getAll: async () => {
    return apiRequest('/farm-plots');
  },

  // Get single farm plot
  getById: async (id) => {
    return apiRequest(`/farm-plots/${id}`);
  },

  // Create new farm plot
  create: async (farmPlotData) => {
    return apiRequest('/farm-plots', {
      method: 'POST',
      body: JSON.stringify(farmPlotData)
    });
  },

  // Update farm plot
  update: async (id, farmPlotData) => {
    return apiRequest(`/farm-plots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(farmPlotData)
    });
  },

  // Delete farm plot
  delete: async (id) => {
    return apiRequest(`/farm-plots/${id}`, {
      method: 'DELETE'
    });
  }
};

// Test API connection
export const testAPI = async () => {
  return apiRequest('/test');
};

export { handleAPIError }; 