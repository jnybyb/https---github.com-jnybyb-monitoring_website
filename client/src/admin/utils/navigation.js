// Function to get active page from URL
export const getActiveFromPath = (pathname) => {
  let result;
  switch (pathname) {
    case '/dashboard':
      result = 'Dashboard';
      break;
    case '/map-monitoring':
      result = 'Map Monitoring';
      break;
    case '/beneficiaries':
    case '/beneficiaries/personal-details':
      result = 'Personal Details';
      break;
    case '/beneficiaries/seedling-records':
      result = 'Seedling Records';
      break;
    case '/beneficiaries/crop-status':
      result = 'Crop Status';
      break;
    case '/reports':
      result = 'Reports';
      break;
    default:
      result = 'Dashboard';
  }
  return result;
};

// Function to navigate to URL based on active page
export const navigateToPage = (page, navigate) => {
  switch (page) {
    case 'Dashboard':
      navigate('/dashboard');
      break;
    case 'Map Monitoring':
      navigate('/map-monitoring');
      break;
    case 'Coffee Beneficiaries':
      // When clicking the parent category, navigate to Personal Details by default
      navigate('/beneficiaries/personal-details');
      break;
    case 'Personal Details':
      navigate('/beneficiaries/personal-details');
      break;
    case 'Seedling Records':
      navigate('/beneficiaries/seedling-records');
      break;
    case 'Crop Status':
      navigate('/beneficiaries/crop-status');
      break;
    case 'Reports':
      navigate('/reports');
      break;
    default:
      navigate('/dashboard');
  }
};
