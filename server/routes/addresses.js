const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();

// Get all JSON files from the data folder
const getDataFiles = () => {
  const dataPath = path.join(__dirname, '..', 'data');
  const files = fs.readdirSync(dataPath);
  return files.filter(file => file.endsWith('.json'));
};

// Read and parse all data files
const getAllAddressData = () => {
  const dataPath = path.join(__dirname, '..', 'data');
  const allData = [];
  
  const jsonFiles = getDataFiles();
  
  jsonFiles.forEach(file => {
    try {
      const filePath = path.join(dataPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        allData.push(...data);
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  });
  
  return allData;
};

// Provinces from all JSON files in data folder
router.get('/provinces', async (req, res) => {
  try {
    const allData = getAllAddressData();
    const provinces = [...new Set(allData.map(province => province.province))].sort((a, b) => a.localeCompare(b));
    res.json(provinces);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Municipalities by province
router.get('/municipalities/:province', async (req, res) => {
  try {
    const allData = getAllAddressData();
    const provinceData = allData.find(p => p.province === req.params.province);
    
    if (provinceData && Array.isArray(provinceData.municipalities)) {
      const municipalities = provinceData.municipalities
        .map(m => typeof m === 'string' ? m : (m && m.name ? m.name : null))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      return res.json(municipalities);
    }
    
    return res.json([]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Barangays by province and municipality
router.get('/barangays/:province/:municipality', async (req, res) => {
  try {
    const allData = getAllAddressData();
    const provinceData = allData.find(p => p.province === req.params.province);
    
    if (provinceData && Array.isArray(provinceData.municipalities)) {
      const municipalityData = provinceData.municipalities.find(m => 
        (typeof m === 'string' && m === req.params.municipality) || 
        (m && m.name && m.name === req.params.municipality)
      );
      
      if (municipalityData && Array.isArray(municipalityData.barangays)) {
        const barangays = [...municipalityData.barangays].sort((a, b) => a.localeCompare(b));
        return res.json(barangays);
      }
    }
    
    return res.json([]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;


