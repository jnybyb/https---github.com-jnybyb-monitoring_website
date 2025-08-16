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
import {
  IoChevronDown,
} from 'react-icons/io5';

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

  // Generate button styles based on active state and hierarchy
  const getButtonStyles = (isActive, isParent = false) => ({
    width: isParent ? '95%' : '83%',
    background: isActive ? 'var(--white)' : 'transparent',
    border: 'none',
    color: isActive ? 'var(--dark-green)' : 'var(--light-gray)',
    fontFamily: 'inherit',
    fontWeight: isActive ? 600 : (isParent ? 400 : 500),
    fontSize: isParent ? '0.75rem' : '0.7rem',
    padding: isParent ? '0.65rem .75rem' : '0.75rem 0.75rem 0.65rem 1rem',
    borderRadius: isParent ? '7px' : '6px',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: isParent ? '0.5rem' : '0.7rem',
    borderLeft: isActive ? `${isParent ? '3px' : '2px'} solid var(--ivory)` : `${isParent ? '3px' : '2px'} solid transparent`,
    transition: 'all 0.2s ease',
    justifyContent: 'flex-start',
    textAlign: 'left',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    boxShadow: isActive && isParent ? `0 1px 10px var(--shadow-dark)` : 'none',
    transform: isActive && isParent ? 'translateY(-1px)' : 'none',
  });

  // Generate icon styles based on active state
  const getIconStyles = (isActive, isParent = false) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isParent ? 20 : 16,
    minWidth: isParent ? 20 : 16,
    fontSize: isParent ? '1.1rem' : '0.9rem',
    color: isActive ? (isParent ? 'var(--dark-green)' : 'var(--primary-green)') : 'inherit',
    transition: 'color 0.2s ease',
  });

  // Generate hover event handlers for interactive feedback
  const getHoverHandlers = (isActive, isParent = false) => ({
    onMouseOver: (e) => {
      if (!isActive) {
        e.currentTarget.style.background = 'var(--mint-green)';
        e.currentTarget.style.color = 'var(--dark-brown)';
        const iconElement = e.currentTarget.querySelector('span:first-child');
        if (iconElement) {
          iconElement.style.color = 'var(--dark-brown)';
        }
      }
    },
    onMouseOut: (e) => {
      if (!isActive) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--light-gray)';
        const iconElement = e.currentTarget.querySelector('span:first-child');
        if (iconElement) {
          iconElement.style.color = 'var(--light-gray)';
        }
      }
    }
  });

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

  // Chevron icon styles with rotation animation
  const chevronStyles = (isParentActive, isExpanded) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    color: isParentActive ? 'var(--dark-green)' : 'inherit',
    transition: 'transform 0.2s ease',
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  });

  // Subcategories list styles
  const subcategoriesListStyles = {
    listStyle: 'none',
    padding: '0.7rem 0 0 0',
    margin: 0,
    width: '95%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  };

  const subcategoryListItemStyles = {
    marginBottom: '0.5rem', 
    width: '100%', 
    display: 'flex', 
    justifyContent: 'flex-end' 
  };

  // Subcategory indicator dot styles
  const subcategoryDotStyles = (isSubActive) => ({
    width: 4,
    height: 4,
    borderRadius: '50%',
    backgroundColor: isSubActive ? 'var(--primary-green)' : 'var(--deep-brown)',
    opacity: 0.6,
  });

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
                <button
                  style={getButtonStyles(isParentActive, true)}
                  onClick={() => handleMainButtonClick(item)}
                  {...getHoverHandlers(isParentActive, true)}
                >
                  <span style={getIconStyles(isParentActive, true)}>
                    {isParentActive ? item.activeIcon : item.inactiveIcon}
                  </span>
                  <span style={{ flex: 1, textAlign: 'left' }}>
                    {item.label}
                  </span>
                  {item.hasSubcategories && (
                    <span style={chevronStyles(isParentActive, isExpanded)}>
                      <IoChevronDown />
                    </span>
                  )}
                </button>
                
                {item.hasSubcategories && isExpanded && (
                  <ul style={subcategoriesListStyles}>
                    {item.subcategories.map((subItem) => {
                      const isSubActive = active === subItem.label;
                      
                      return (
                        <li key={subItem.label} style={subcategoryListItemStyles}>
                          <button
                            style={getButtonStyles(isSubActive, false)}
                            onClick={() => handleSubButtonClick(subItem, item)}
                            {...getHoverHandlers(isSubActive, false)}
                          >
                            {subItem.inactiveIcon ? (
                              <span style={getIconStyles(isSubActive, false)}>
                                {isSubActive ? subItem.activeIcon : subItem.inactiveIcon}
                              </span>
                            ) : (
                              <span style={subcategoryDotStyles(isSubActive)} />
                            )}
                            <span style={{ flex: 1, textAlign: 'left' }}>
                              {subItem.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 