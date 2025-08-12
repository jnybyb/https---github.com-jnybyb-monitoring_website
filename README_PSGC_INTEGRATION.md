# PSGC API Integration

This project now integrates with the Philippine Standard Geographic Code (PSGC) API to provide comprehensive address data for provinces, municipalities, and barangays.

## Overview

The PSGC API integration provides:
- **Complete address data** from official Philippine government sources
- **Real-time data** that's always up-to-date
- **Fallback system** to local data when PSGC API is unavailable
- **Search functionality** for quick address lookup
- **Hierarchical selection** (Province → Municipality → Barangay)

## API Endpoints

The integration uses these PSGC API endpoints:

```bash
# Get all provinces
curl -s https://psgc.cloud/api/provinces

# Get all municipalities
curl -s https://psgc.cloud/api/municipalities

# Get all barangays
curl -s https://psgc.cloud/api/barangays

# Search with query parameters
curl -s "https://psgc.cloud/api/provinces?q=Metro Manila"
curl -s "https://psgc.cloud/api/municipalities?q=Quezon City"
curl -s "https://psgc.cloud/api/barangays?q=Katipunan"
```

## Files Created

### 1. PSGC API Service (`client/src/services/psgcAPI.js`)
- Handles all API calls to PSGC endpoints
- Provides data transformation and error handling
- Includes search functionality for all address types

### 2. Enhanced Hook (`client/src/hooks/usePSGCAddressData.js`)
- Manages state for provinces, municipalities, and barangays
- Automatically falls back to local API if PSGC fails
- Provides toggle between PSGC and local data sources

### 3. Address Selector Component (`client/src/components/ui/PSGCAddressSelector.jsx`)
- Dropdown-based address selection
- Integrates with the PSGC hook
- Shows current data source (PSGC API vs Local Data)

### 4. Demo Component (`client/src/components/ui/PSGCDemo.jsx`)
- Showcases PSGC API functionality
- Includes search examples for all address types
- Test button to verify API connectivity

## Usage

### Basic Integration

```jsx
import { usePSGCAddressData } from '../hooks/usePSGCAddressData';

const MyComponent = () => {
  const {
    provinces,
    municipalities,
    barangays,
    loading,
    error,
    usePSGC,
    loadMunicipalities,
    loadBarangays,
    toggleAPI
  } = usePSGCAddressData();

  // Use the data in your component
  return (
    <div>
      <p>Data Source: {usePSGC ? 'PSGC API' : 'Local Data'}</p>
      <button onClick={toggleAPI}>Switch Data Source</button>
      
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      
      <select onChange={(e) => loadMunicipalities(e.target.value)}>
        {provinces.map(province => (
          <option key={province.id} value={province.name}>
            {province.name}
          </option>
        ))}
      </select>
    </div>
  );
};
```

### Using the Address Selector Component

```jsx
import PSGCAddressSelector from '../components/ui/PSGCAddressSelector';

const AddressForm = () => {
  const [address, setAddress] = useState({
    province: '',
    municipality: '',
    barangay: ''
  });

  return (
    <PSGCAddressSelector
      selectedProvince={address.province}
      selectedMunicipality={address.municipality}
      selectedBarangay={address.barangay}
      onProvinceChange={(value) => setAddress(prev => ({ ...prev, province: value }))}
      onMunicipalityChange={(value) => setAddress(prev => ({ ...prev, municipality: value }))}
      onBarangayChange={(value) => setAddress(prev => ({ ...prev, barangay: value }))}
      required={true}
    />
  );
};
```

### Direct API Calls

```jsx
import { psgcAPI } from '../services/psgcAPI';

const SearchAddresses = () => {
  const searchProvinces = async (query) => {
    try {
      const results = await psgcAPI.searchProvinces(query);
      console.log('Found provinces:', results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const getAllProvinces = async () => {
    try {
      const provinces = await psgcAPI.getProvinces();
      console.log('All provinces:', provinces);
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
    }
  };

  return (
    <div>
      <input 
        placeholder="Search provinces..." 
        onChange={(e) => searchProvinces(e.target.value)} 
      />
      <button onClick={getAllProvinces}>Load All Provinces</button>
    </div>
  );
};
```

## Data Structure

### Province Object
```javascript
{
  id: "012800000",           // PSGC code
  name: "Metro Manila",      // Province name
  regionCode: "130000000",   // Region code
  regionName: "National Capital Region" // Region name
}
```

### Municipality Object
```javascript
{
  id: "137401000",           // PSGC code
  name: "Quezon City",       // Municipality name
  provinceCode: "137400000", // Province code
  provinceName: "Metro Manila", // Province name
  regionCode: "130000000",   // Region code
  regionName: "National Capital Region" // Region name
}
```

### Barangay Object
```javascript
{
  id: "137401001",           // PSGC code
  name: "Katipunan",         // Barangay name
  municipalityCode: "137401000", // Municipality code
  municipalityName: "Quezon City", // Municipality name
  provinceCode: "137400000", // Province code
  provinceName: "Metro Manila", // Province name
  regionCode: "130000000",   // Region code
  regionName: "National Capital Region" // Region name
}
```

## Features

### 1. Automatic Fallback
- If PSGC API fails, automatically switches to local data
- Ensures application continues to work even with API issues
- Manual toggle available to switch between data sources

### 2. Search Functionality
- Real-time search for provinces, municipalities, and barangays
- Minimum 2 characters required for search
- Results include hierarchical information

### 3. Hierarchical Loading
- Provinces load on component mount
- Municipalities load when province is selected
- Barangays load when municipality is selected
- Automatic reset of dependent fields

### 4. Error Handling
- Comprehensive error handling for API failures
- User-friendly error messages
- Graceful degradation to local data

## Configuration

### Environment Variables
No additional environment variables are required. The PSGC API is publicly accessible.

### API Rate Limits
The PSGC API has generous rate limits, but consider implementing caching for production use.

### Caching Strategy
For production applications, consider implementing:
- Local storage caching for frequently accessed data
- Redis caching for server-side data
- Periodic refresh of cached data

## Testing

### 1. Test API Connectivity
Use the demo component to test basic API functionality:
```jsx
import PSGCDemo from '../components/ui/PSGCDemo';

// In your app
<PSGCDemo />
```

### 2. Test Fallback System
- Temporarily block PSGC API access
- Verify automatic fallback to local data
- Test manual toggle between data sources

### 3. Test Search Functionality
- Search for various provinces, municipalities, and barangays
- Verify search results include hierarchical information
- Test with different query lengths

## Troubleshooting

### Common Issues

1. **API Not Responding**
   - Check internet connectivity
   - Verify PSGC API endpoint accessibility
   - Check browser console for CORS issues

2. **Data Not Loading**
   - Verify hook is properly imported
   - Check component mounting lifecycle
   - Verify API response format

3. **Search Not Working**
   - Ensure minimum 2 characters for search
   - Check search function implementation
   - Verify API search endpoints

### Debug Mode
Enable debug logging by checking browser console for:
- API request/response logs
- Fallback system logs
- Error details

## Migration from Local Data

If you're currently using the local address system:

1. **Replace the hook import:**
   ```jsx
   // Old
   import { useAddressData } from '../hooks/useAddressData';
   
   // New
   import { usePSGCAddressData } from '../hooks/usePSGCAddressData';
   ```

2. **Update component usage:**
   ```jsx
   // Old
   const { provinces, municipalities, barangays } = useAddressData();
   
   // New
   const { provinces, municipalities, barangays, usePSGC, toggleAPI } = usePSGCAddressData();
   ```

3. **Add data source indicator (optional):**
   ```jsx
   <div>
     <span>Data Source: {usePSGC ? 'PSGC API' : 'Local Data'}</span>
     <button onClick={toggleAPI}>Switch</button>
   </div>
   ```

## Future Enhancements

Potential improvements for the PSGC integration:

1. **Advanced Search**
   - Fuzzy search with typo tolerance
   - Search by postal code
   - Search by coordinates

2. **Data Synchronization**
   - Periodic sync with PSGC updates
   - Local database updates
   - Change notification system

3. **Performance Optimization**
   - Virtual scrolling for large datasets
   - Debounced search inputs
   - Progressive loading

4. **Additional Data**
   - Postal codes
   - Geographic coordinates
   - Administrative boundaries

## Support

For issues with the PSGC API integration:
1. Check the browser console for error messages
2. Verify PSGC API endpoint accessibility
3. Test with the demo component
4. Check network tab for API request/response details

For PSGC API-specific issues, refer to the official PSGC documentation or contact the API provider.
