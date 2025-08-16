import React, { useState } from 'react';
import {
  MdOutlineDashboard,
  MdDashboard,
} from 'react-icons/md';
import {
  RiMapPinLine,
  RiMapPinFill,
  RiFolderUserLine,
  RiFolderUserFill,
  RiSeedlingLine,
  RiSeedlingFill,
  RiBarChartLine,
  RiBarChartFill,
} from 'react-icons/ri';
import {
  PiCoffeeLight,
  PiCoffeeFill,
} from 'react-icons/pi';
import {
  BsClipboard2Data,
  BsClipboard2DataFill,
} from 'react-icons/bs';
import SidebarButtons from '../ui/SidebarButtons';

// Navigation items configuration with icons and subcategories
const navItems = [
  { 
    label: 'Dashboard', 
    inactiveIcon: <MdOutlineDashboard />,
    activeIcon: <MdDashboard />
  },
  { 
    label: 'Map Monitoring', 
    inactiveIcon: <RiMapPinLine />,
    activeIcon: <RiMapPinFill />
  },
  { 
    label: 'Coffee Beneficiaries', 
    inactiveIcon: <PiCoffeeLight />,
    activeIcon: <PiCoffeeFill />,
    hasSubcategories: true,
    subcategories: [
      { 
        label: 'Personal Details',
        inactiveIcon: <RiFolderUserLine />,
        activeIcon: <RiFolderUserFill />
      },
      { 
        label: 'Seedling Records',
        inactiveIcon: <RiSeedlingLine />,
        activeIcon: <RiSeedlingFill />
      },
      { 
        label: 'Crop Status',
        inactiveIcon: <RiBarChartLine />,
        activeIcon: <RiBarChartFill />
      }
    ]
  },
  { 
    label: 'Reports', 
    inactiveIcon: <BsClipboard2Data />,
    activeIcon: <BsClipboard2DataFill />
  },
];

// Sidebar component with expandable navigation
const Sidebar = ({ active, setActive }) => {
  // Track which navigation items are expanded
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Toggle expanded state of navigation item
  const toggleExpanded = (itemLabel) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemLabel)) {
      newExpanded.delete(itemLabel);
    } else {
      newExpanded.add(itemLabel);
    }
    setExpandedItems(newExpanded);
  };

  const isItemExpanded = (itemLabel) => expandedItems.has(itemLabel);

  // Handle main navigation button clicks
  const handleMainButtonClick = (item) => {
    if (item.hasSubcategories) {
      // For items with subcategories, set as active and toggle expansion
      setActive(item.label);
      toggleExpanded(item.label);
    } else {
      // For items without subcategories, set as active and close all expansions
      setActive(item.label);
      setExpandedItems(new Set());
    }
  };

  // Handle subcategory button clicks
  const handleSubButtonClick = (subItem, parentItem) => {
    setActive(subItem.label);
    if (!isItemExpanded(parentItem.label)) {
      setExpandedItems(new Set([...expandedItems, parentItem.label]));
    }
  };



  // Main sidebar container styles
  const sidebarStyles = {
    background: 'var(--dark-green)',
    color: 'var(--white)',
    boxSizing: 'border-box',
    padding: '1.6rem 0.3rem',
    fontFamily: 'var(--font-main)',
    fontWeight: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    minHeight: 0,
    marginTop: '-0.3rem',
  };

  // Navigation container styles
  const navStyles = {
    width: '100%', 
    padding: '0 0.5rem', 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column' 
  };

  const navListStyles = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const listItemStyles = {
    marginBottom: '.75rem', 
    width: '100%' 
  };



  return (
    <aside style={sidebarStyles}>
      <nav style={navStyles}>
        <ul style={navListStyles}>
          {navItems.map((item) => {
            const isActive = active === item.label;
            const isExpanded = isItemExpanded(item.label);
            const hasActiveSubcategory = item.hasSubcategories && item.subcategories && 
              item.subcategories.some(subItem => active === subItem.label);
            // Parent is active if it's the active item OR if one of its subcategories is active
            const isParentActive = item.hasSubcategories ? (isActive || hasActiveSubcategory) : isActive;

            return (
              <li key={item.label} style={listItemStyles}>
                <SidebarButtons
                  item={item}
                  isActive={isActive}
                  isExpanded={isExpanded}
                  isParentActive={isParentActive}
                  hasActiveSubcategory={hasActiveSubcategory}
                  active={active}
                  onMainButtonClick={handleMainButtonClick}
                  onSubButtonClick={handleSubButtonClick}
                  isItemExpanded={isItemExpanded}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 