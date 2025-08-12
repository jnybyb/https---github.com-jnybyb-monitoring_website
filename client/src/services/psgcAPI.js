const PSGC_BASE_URL = 'https://psgc.cloud/api';

// Helper function to handle PSGC API errors
const handlePSGCError = (error) => {
  console.error('PSGC API Error:', error);
  
  if (error.response) {
    return {
      message: error.response.data?.error || 'PSGC API server error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    return {
      message: 'No response from PSGC API. Please check your connection.',
      status: 0
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred with PSGC API',
      status: 0
    };
  }
};

// Generic PSGC API request function
const psgcRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${PSGC_BASE_URL}${endpoint}`, {
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
    throw handlePSGCError(error);
  }
};

// PSGC API endpoints
export const psgcAPI = {
  // Get all provinces
  getProvinces: async () => {
    try {
      const data = await psgcRequest('/provinces');
      return data.map(province => ({
        id: province.code,
        name: province.name,
        regionCode: province.regionCode,
        regionName: province.regionName
      }));
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },

  // Get all municipalities
  getMunicipalities: async () => {
    try {
      const data = await psgcRequest('/municipalities');
      return data.map(municipality => ({
        id: municipality.code,
        name: municipality.name,
        provinceCode: municipality.provinceCode,
        provinceName: municipality.provinceName,
        regionCode: municipality.regionCode,
        regionName: municipality.regionName
      }));
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      throw error;
    }
  },

  // Get all barangays
  getBarangays: async () => {
    try {
      const data = await psgcRequest('/barangays');
      return data.map(barangay => ({
        id: barangay.code,
        name: barangay.name,
        municipalityCode: barangay.municipalityCode,
        municipalityName: barangay.municipalityName,
        provinceCode: barangay.provinceCode,
        provinceName: barangay.provinceName,
        regionCode: barangay.regionCode,
        regionName: barangay.regionName
      }));
    } catch (error) {
      console.error('Error fetching barangays:', error);
      throw error;
    }
  },

  // Get municipalities by province
  getMunicipalitiesByProvince: async (provinceCode) => {
    try {
      const data = await psgcRequest(`/municipalities?provinceCode=${provinceCode}`);
      return data.map(municipality => ({
        id: municipality.code,
        name: municipality.name,
        provinceCode: municipality.provinceCode,
        provinceName: municipality.provinceName
      }));
    } catch (error) {
      console.error('Error fetching municipalities by province:', error);
      throw error;
    }
  },

  // Get barangays by municipality
  getBarangaysByMunicipality: async (municipalityCode) => {
    try {
      const data = await psgcRequest(`/barangays?municipalityCode=${municipalityCode}`);
      return data.map(barangay => ({
        id: barangay.code,
        name: barangay.name,
        municipalityCode: barangay.municipalityCode,
        municipalityName: barangay.municipalityName
      }));
    } catch (error) {
      console.error('Error fetching barangays by municipality:', error);
      throw error;
    }
  },

  // Get barangays by province
  getBarangaysByProvince: async (provinceCode) => {
    try {
      const data = await psgcRequest(`/barangays?provinceCode=${provinceCode}`);
      return data.map(barangay => ({
        id: barangay.code,
        name: barangay.name,
        municipalityCode: barangay.municipalityCode,
        municipalityName: barangay.municipalityName,
        provinceCode: barangay.provinceCode,
        provinceName: barangay.provinceName
      }));
    } catch (error) {
      console.error('Error fetching barangays by province:', error);
      throw error;
    }
  },

  // Search functionality
  searchProvinces: async (query) => {
    try {
      const data = await psgcRequest(`/provinces?q=${encodeURIComponent(query)}`);
      return data.map(province => ({
        id: province.code,
        name: province.name,
        regionCode: province.regionCode,
        regionName: province.regionName
      }));
    } catch (error) {
      console.error('Error searching provinces:', error);
      throw error;
    }
  },

  searchMunicipalities: async (query) => {
    try {
      const data = await psgcRequest(`/municipalities?q=${encodeURIComponent(query)}`);
      return data.map(municipality => ({
        id: municipality.code,
        name: municipality.name,
        provinceCode: municipality.provinceCode,
        provinceName: municipality.provinceName
      }));
    } catch (error) {
      console.error('Error searching municipalities:', error);
      throw error;
    }
  },

  searchBarangays: async (query) => {
    try {
      const data = await psgcRequest(`/barangays?q=${encodeURIComponent(query)}`);
      return data.map(barangay => ({
        id: barangay.code,
        name: barangay.name,
        municipalityCode: barangay.municipalityCode,
        municipalityName: barangay.municipalityName,
        provinceCode: barangay.provinceCode,
        provinceName: barangay.provinceName
      }));
    } catch (error) {
      console.error('Error searching barangays:', error);
      throw error;
    }
  }
};

export { handlePSGCError };
