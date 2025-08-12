import { useState, useEffect, useCallback } from 'react';
import { psgcAPI } from '../services/psgcAPI';
import { addressesAPI } from '../services/api';

export const usePSGCAddressData = () => {
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usePSGC, setUsePSGC] = useState(true); // Toggle between PSGC and local API

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, [usePSGC]);

  const loadProvinces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (usePSGC) {
        // Try PSGC API first
        try {
          const data = await psgcAPI.getProvinces();
          setProvinces(data);
          return;
        } catch (psgcError) {
          console.warn('PSGC API failed, falling back to local API:', psgcError);
          setUsePSGC(false);
        }
      }
      
      // Fallback to local API
      const data = await addressesAPI.getProvinces();
      setProvinces(data);
    } catch (err) {
      setError('Failed to load provinces');
      console.error('Error loading provinces:', err);
    } finally {
      setLoading(false);
    }
  }, [usePSGC]);

  const loadMunicipalities = useCallback(async (province) => {
    if (!province) {
      setMunicipalities([]);
      setBarangays([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (usePSGC) {
        // Try PSGC API first
        try {
          let data;
          if (typeof province === 'string') {
            // If province is a name, search for it first
            const provinceResults = await psgcAPI.searchProvinces(province);
            if (provinceResults.length > 0) {
              data = await psgcAPI.getMunicipalitiesByProvince(provinceResults[0].id);
            } else {
              data = [];
            }
          } else {
            // If province is a code
            data = await psgcAPI.getMunicipalitiesByProvince(province);
          }
          setMunicipalities(data);
          setBarangays([]);
          return;
        } catch (psgcError) {
          console.warn('PSGC API failed, falling back to local API:', psgcError);
          setUsePSGC(false);
        }
      }
      
      // Fallback to local API
      const data = await addressesAPI.getMunicipalities(province);
      setMunicipalities(data);
      setBarangays([]);
    } catch (err) {
      setError('Failed to load municipalities');
      console.error('Error loading municipalities:', err);
    } finally {
      setLoading(false);
    }
  }, [usePSGC]);

  const loadBarangays = useCallback(async (province, municipality) => {
    if (!province || !municipality) {
      setBarangays([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (usePSGC) {
        // Try PSGC API first
        try {
          let data;
          if (typeof municipality === 'string') {
            // If municipality is a name, search for it first
            const municipalityResults = await psgcAPI.searchMunicipalities(municipality);
            if (municipalityResults.length > 0) {
              data = await psgcAPI.getBarangaysByMunicipality(municipalityResults[0].id);
            } else {
              data = [];
            }
          } else {
            // If municipality is a code
            data = await psgcAPI.getBarangaysByMunicipality(municipality);
          }
          setBarangays(data);
          return;
        } catch (psgcError) {
          console.warn('PSGC API failed, falling back to local API:', psgcError);
          setUsePSGC(false);
        }
      }
      
      // Fallback to local API
      const data = await addressesAPI.getBarangays(province, municipality);
      setBarangays(data);
    } catch (err) {
      setError('Failed to load barangays');
      console.error('Error loading barangays:', err);
    } finally {
      setLoading(false);
    }
  }, [usePSGC]);

  const resetMunicipalities = useCallback(() => {
    setMunicipalities([]);
    setBarangays([]);
  }, []);

  const resetBarangays = useCallback(() => {
    setBarangays([]);
  }, []);

  const toggleAPI = useCallback(() => {
    setUsePSGC(!usePSGC);
  }, [usePSGC]);

  const refreshData = useCallback(() => {
    loadProvinces();
  }, [loadProvinces]);

  // Enhanced search functionality
  const searchProvinces = useCallback(async (query) => {
    if (!query || query.length < 2) return [];
    
    try {
      if (usePSGC) {
        try {
          return await psgcAPI.searchProvinces(query);
        } catch (psgcError) {
          console.warn('PSGC search failed:', psgcError);
          setUsePSGC(false);
        }
      }
      
      // Fallback to local search
      const allProvinces = await addressesAPI.getProvinces();
      return allProvinces.filter(province => 
        province.toLowerCase().includes(query.toLowerCase())
      ).map(province => ({ id: province, name: province }));
    } catch (err) {
      console.error('Error searching provinces:', err);
      return [];
    }
  }, [usePSGC]);

  const searchMunicipalities = useCallback(async (query, province = null) => {
    if (!query || query.length < 2) return [];
    
    try {
      if (usePSGC) {
        try {
          if (province) {
            const provinceResults = await psgcAPI.searchProvinces(province);
            if (provinceResults.length > 0) {
              const municipalities = await psgcAPI.getMunicipalitiesByProvince(provinceResults[0].id);
              return municipalities.filter(m => 
                m.name.toLowerCase().includes(query.toLowerCase())
              );
            }
          }
          return await psgcAPI.searchMunicipalities(query);
        } catch (psgcError) {
          console.warn('PSGC search failed:', psgcError);
          setUsePSGC(false);
        }
      }
      
      // Fallback to local search
      const allMunicipalities = await addressesAPI.getMunicipalities(province || '');
      return allMunicipalities.filter(municipality => 
        municipality.toLowerCase().includes(query.toLowerCase())
      ).map(municipality => ({ id: municipality, name: municipality }));
    } catch (err) {
      console.error('Error searching municipalities:', err);
      return [];
    }
  }, [usePSGC]);

  const searchBarangays = useCallback(async (query, municipality = null) => {
    if (!query || query.length < 2) return [];
    
    try {
      if (usePSGC) {
        try {
          if (municipality) {
            const municipalityResults = await psgcAPI.searchMunicipalities(municipality);
            if (municipalityResults.length > 0) {
              const barangays = await psgcAPI.getBarangaysByMunicipality(municipalityResults[0].id);
              return barangays.filter(b => 
                b.name.toLowerCase().includes(query.toLowerCase())
              );
            }
          }
          return await psgcAPI.searchBarangays(query);
        } catch (psgcError) {
          console.warn('PSGC search failed:', psgcError);
          setUsePSGC(false);
        }
      }
      
      // Fallback to local search
      const allBarangays = await addressesAPI.getBarangays('', municipality || '');
      return allBarangays.filter(barangay => 
        barangay.toLowerCase().includes(query.toLowerCase())
      ).map(barangay => ({ id: barangay, name: barangay }));
    } catch (err) {
      console.error('Error searching barangays:', err);
      return [];
    }
  }, [usePSGC]);

  return {
    provinces,
    municipalities,
    barangays,
    loading,
    error,
    usePSGC,
    loadProvinces,
    loadMunicipalities,
    loadBarangays,
    resetMunicipalities,
    resetBarangays,
    toggleAPI,
    refreshData,
    searchProvinces,
    searchMunicipalities,
    searchBarangays
  };
};
