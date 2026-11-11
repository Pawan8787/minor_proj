import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const ROLES = {
  RMC_OFFICER: 'RMC_Officer',
  ADMIN: 'Admin',
  FIELD_ENGINEER: 'Field_Engineer',
  VIEWER: 'Viewer'
};

const DEFAULT_USERS = {
  [ROLES.RMC_OFFICER]: {
    name: 'Er. Rajesh Verma',
    role: ROLES.RMC_OFFICER,
    title: 'Executive Engineer (EE)',
    department: 'Raipur Municipal Corporation (RMC)',
    avatar: '👨‍💼',
    permissions: ['view_dashboard', 'manage_register', 'update_defects', 'export_reports', 'run_ai_survey']
  },
  [ROLES.ADMIN]: {
    name: 'Dr. R. K. Singhal',
    role: ROLES.ADMIN,
    title: 'Superintending Engineer & Admin',
    department: 'Municipal IT & Works Directorate',
    avatar: '🛡️',
    permissions: ['all']
  },
  [ROLES.FIELD_ENGINEER]: {
    name: 'Er. Priya Patel',
    role: ROLES.FIELD_ENGINEER,
    title: 'Assistant Engineer (AE) - Survey',
    department: 'Ward Maintenance Flying Squad',
    avatar: '👷‍♀️',
    permissions: ['view_dashboard', 'run_ai_survey', 'resolve_defects', 'export_reports']
  },
  [ROLES.VIEWER]: {
    name: 'Public Citizen / Auditor',
    role: ROLES.VIEWER,
    title: 'Public Observer',
    department: 'Citizen Transparency Portal',
    avatar: '👤',
    permissions: ['view_dashboard', 'view_register', 'view_map']
  }
};

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('rmc_user_role') || ROLES.RMC_OFFICER;
  });

  const currentUser = DEFAULT_USERS[currentRole] || DEFAULT_USERS[ROLES.RMC_OFFICER];

  useEffect(() => {
    localStorage.setItem('rmc_user_role', currentRole);
  }, [currentRole]);

  const switchRole = (newRole) => {
    if (DEFAULT_USERS[newRole]) {
      setCurrentRole(newRole);
    }
  };

  const hasPermission = (permission) => {
    if (currentUser.role === ROLES.ADMIN) return true;
    return currentUser.permissions.includes(permission) || currentUser.permissions.includes('all');
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, switchRole, hasPermission, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

