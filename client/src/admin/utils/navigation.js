// Function to get active page from URL
export const getActiveFromPath = (pathname) => {
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard';
    case '/map-monitoring':
      return 'Map Monitoring';
    case '/beneficiaries':
    case '/beneficiaries/personal-details':
      return 'Personal Details';
    case '/beneficiaries/seedling-records':
      return 'Seedling Records';
    case '/beneficiaries/crop-status':
      return 'Crop Status';
    case '/reports':
      return 'Reports';
    default:
      return 'Dashboard';
  }
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
