# Philippine Address System for Coffee Monitoring Web Application

## Overview

This document describes the implementation of a comprehensive Philippine address system with cascading dropdowns for provinces, municipalities, and barangays in the Coffee Monitoring Web Application.

## Features

- **Cascading Dropdowns**: Province → Municipality → Barangay selection
- **Database Storage**: All address data is stored locally for offline use
- **Dynamic Loading**: Address options are loaded dynamically based on user selection
- **Comprehensive Coverage**: Includes major provinces in the Philippines
- **Offline Capability**: Once loaded, address data works without internet connection

## Database Schema

### Philippine Addresses Table

```sql
CREATE TABLE philippine_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  province VARCHAR(100) NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  barangay VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_address (province, municipality, barangay),
  INDEX idx_province (province),
  INDEX idx_municipality (municipality),
  INDEX idx_barangay (barangay)
);
```

## API Endpoints

### Get All Provinces
```
GET /api/addresses/provinces
```
Returns a list of all available provinces.

### Get Municipalities by Province
```
GET /api/addresses/municipalities/:province
```
Returns municipalities for a specific province.

### Get Barangays by Province and Municipality
```
GET /api/addresses/barangays/:province/:municipality
```
Returns barangays for a specific province and municipality.

### Sync Addresses
```
POST /api/addresses/sync
```
Synchronizes address data from external sources (currently from JSON file).

## Frontend Implementation

### Custom Hook: useAddressData

The `useAddressData` hook manages the address data and provides functions for loading cascading dropdowns:

```javascript
const {
  provinces,
  municipalities,
  barangays,
  loading,
  error,
  loadMunicipalities,
  loadBarangays,
  resetMunicipalities,
  resetBarangays
} = useAddressData();
```

### Cascading Logic

1. **Province Selection**: When a province is selected, it triggers loading of municipalities
2. **Municipality Selection**: When a municipality is selected, it triggers loading of barangays
3. **Reset Logic**: Changing a higher-level selection resets all lower-level options

### Form Validation

The address fields are now required and validated:
- Province selection is required
- Municipality selection is required (enabled only after province selection)
- Barangay selection is required (enabled only after municipality selection)

## Data Sources

### Primary Source: JSON File
Address data is stored in `server/data/philippine_addresses.json` with a hierarchical structure:

```json
[
  {
    "province": "Davao Oriental",
    "municipalities": [
      {
        "name": "Manay",
        "barangays": ["Capasnan", "Cayawan", "Central", ...]
      }
    ]
  }
]
```

### Fallback Data
If the JSON file cannot be read, the system falls back to basic address data for core functionality.

## Usage

### Adding a New Beneficiary

1. Open the "Add Beneficiary" modal
2. In the Address Information section:
   - Select a province from the dropdown
   - Select a municipality (enabled after province selection)
   - Select a barangay (enabled after municipality selection)
   - Enter the purok (street/sitio)

### Editing a Beneficiary

1. Open the "Edit Beneficiary" modal
2. The address fields will be pre-populated with existing data
3. Municipalities and barangays are automatically loaded based on the current province/municipality
4. Make changes as needed using the same cascading logic

## Adding New Addresses

### Method 1: Update JSON File
1. Edit `server/data/philippine_addresses.json`
2. Add new provinces, municipalities, or barangays
3. Restart the server to trigger data sync

### Method 2: Database Insert
```sql
INSERT INTO philippine_addresses (province, municipality, barangay) 
VALUES ('New Province', 'New Municipality', 'New Barangay');
```

### Method 3: API Endpoint
```javascript
await addressesAPI.syncAddresses([
  { province: 'New Province', municipality: 'New Municipality', barangay: 'New Barangay' }
]);
```

## Benefits

1. **User Experience**: Intuitive cascading selection prevents invalid address combinations
2. **Data Integrity**: Ensures only valid province-municipality-barangay combinations
3. **Offline Capability**: Works without internet connection after initial data load
4. **Scalability**: Easy to add new addresses through JSON file updates
5. **Performance**: Fast local database queries instead of external API calls

## Future Enhancements

1. **Real-time Updates**: Integration with Philippine government address APIs
2. **GPS Coordinates**: Add latitude/longitude for mapping features
3. **Postal Codes**: Include postal code information
4. **Address Validation**: Real-time validation against official databases
5. **Multi-language Support**: Support for local languages and dialects

## Troubleshooting

### Common Issues

1. **Address Data Not Loading**: Check if the JSON file exists and is valid JSON
2. **Dropdowns Not Working**: Verify the database table exists and has data
3. **Validation Errors**: Ensure all required address fields are selected

### Debug Steps

1. Check server logs for address sync messages
2. Verify database table structure and data
3. Test API endpoints directly
4. Check browser console for JavaScript errors

## Support

For issues or questions regarding the address system, please check:
1. Server logs for error messages
2. Database connectivity and table structure
3. Frontend console for JavaScript errors
4. API endpoint responses
