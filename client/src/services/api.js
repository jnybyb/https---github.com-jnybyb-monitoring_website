const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper function to handle API errors
const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    return {
      message: error.response.data?.error || 'Server error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    return {
      message: 'No response from server. Please check your connection.',
      status: 0
    };
  } else {
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
  getAll: async () => apiRequest('/beneficiaries'),
  getById: async (id) => apiRequest(`/beneficiaries/${id}`),
  create: async (beneficiaryData) => {
    const formData = new FormData();
    Object.keys(beneficiaryData).forEach(key => {
      if (key !== 'picture' && beneficiaryData[key] !== null && beneficiaryData[key] !== undefined) {
        formData.append(key, beneficiaryData[key]);
      }
    });
    if (beneficiaryData.picture instanceof File) {
      formData.append('picture', beneficiaryData.picture);
    }
    return apiRequestWithFile('/beneficiaries', formData, { method: 'POST' });
  },
  update: async (id, beneficiaryData) => {
    const formData = new FormData();
    Object.keys(beneficiaryData).forEach(key => {
      if (key !== 'picture' && beneficiaryData[key] !== null && beneficiaryData[key] !== undefined) {
        formData.append(key, beneficiaryData[key]);
      }
    });
    if (beneficiaryData.picture instanceof File) {
      formData.append('picture', beneficiaryData.picture);
    }
    return apiRequestWithFile(`/beneficiaries/${id}`, formData, { method: 'PUT' });
  },
  delete: async (id) => apiRequest(`/beneficiaries/${id}`, { method: 'DELETE' })
};

// Seedlings API
export const seedlingsAPI = {
  getAll: async () => apiRequest('/seedlings'),
  create: async (record) => apiRequest('/seedlings', {
    method: 'POST',
    body: JSON.stringify(record)
  }),
  update: async (id, record) => apiRequest(`/seedlings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(record)
  }),
  delete: async (id) => apiRequest(`/seedlings/${id}`, { method: 'DELETE' })
};

// Crop Status API
export const cropStatusAPI = {
  getAll: async () => apiRequest('/crop-status'),
  create: async (record) => {
    const formData = new FormData();
    formData.append('surveyDate', record.surveyDate);
    formData.append('surveyer', record.surveyer);
    formData.append('beneficiaryId', record.beneficiaryId);
    formData.append('aliveCrops', record.aliveCrops);
    formData.append('deadCrops', record.deadCrops ?? 0);
    if (Array.isArray(record.pictures)) {
      record.pictures.forEach(file => {
        if (file instanceof File) formData.append('pictures', file);
      });
    }
    return apiRequestWithFile('/crop-status', formData, { method: 'POST' });
  },
  update: async (id, record) => {
    const formData = new FormData();
    formData.append('surveyDate', record.surveyDate);
    formData.append('surveyer', record.surveyer);
    formData.append('beneficiaryId', record.beneficiaryId);
    formData.append('aliveCrops', record.aliveCrops);
    formData.append('deadCrops', record.deadCrops ?? 0);
    if (Array.isArray(record.pictures)) {
      record.pictures.forEach(file => {
        if (file instanceof File) formData.append('pictures', file);
      });
    }
    return apiRequestWithFile(`/crop-status/${id}`, formData, { method: 'PUT' });
  },
  delete: async (id) => apiRequest(`/crop-status/${id}`, { method: 'DELETE' })
};

// Farm Plots API
export const farmPlotsAPI = {
  getAll: async () => apiRequest('/farm-plots'),
  getById: async (id) => apiRequest(`/farm-plots/${id}`),
  create: async (farmPlotData) => apiRequest('/farm-plots', { method: 'POST', body: JSON.stringify(farmPlotData) }),
  update: async (id, farmPlotData) => apiRequest(`/farm-plots/${id}`, { method: 'PUT', body: JSON.stringify(farmPlotData) }),
  delete: async (id) => apiRequest(`/farm-plots/${id}`, { method: 'DELETE' })
};

// Test API connection
export const testAPI = async () => apiRequest('/health');

export { handleAPIError }; 