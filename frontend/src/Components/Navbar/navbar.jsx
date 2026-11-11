import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import './navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser, switchRole } = useAuth();

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <nav className="navbar">
      <div className="navlogo">
        <Link to="/dashboard" className="navbar-logo">
          <span style={{ fontSize: '20px', marginRight: '6px' }}>🏛️</span>
          <span style={{ fontWeight: '800', color: '#1e3a8a', letterSpacing: '-0.5px' }}>
            RMC RoadRegister
          </span>
        </Link>
      </div>

      <div className="navItem">
        <ul className={`navbar-menu ${open ? 'navbar-open' : ''}`}>
          <li className="navbar-item">
            <Link to="/dashboard" className="navbar-link">📊 Dashboard</Link>
          </li>
          <li className="navbar-item">
            <Link to="/register" className="navbar-link">🏛️ Road Register</Link>
          </li>
          <li className="navbar-item">
            <Link to="/map" className="navbar-link">🗺️ Map & Gallery</Link>
          </li>
          <li className="navbar-item">
            <Link to="/uploadvideo" className="navbar-link">🤖 AI Survey</Link>
          </li>
          <li className="navbar-item">
            <Link to="/rules-engine" className="navbar-link">⚙️ Rules Engine</Link>
          </li>
          <li className="navbar-item">
            <Link to="/reports" className="navbar-link">📑 Reports</Link>
          </li>
          <li className="navbar-item">
            <Link to="/form" className="navbar-link">📝 Citizen Complaint</Link>
          </li>
        </ul>

        {/* Role-Based Access Control Switcher */}
        <div className="rbac-user-badge">
          <span className="user-avatar">{currentUser.avatar}</span>
          <div className="user-details">
            <span className="user-name">{currentUser.name}</span>
            <select
              className="role-selector"
              value={currentUser.role}
              onChange={(e) => switchRole(e.target.value)}
              title="Switch RBAC Role to test permissions"
            >
              <option value={ROLES.RMC_OFFICER}>RMC Officer (EE)</option>
              <option value={ROLES.ADMIN}>System Admin</option>
              <option value={ROLES.FIELD_ENGINEER}>Field Engineer (AE)</option>
              <option value={ROLES.VIEWER}>Public / Viewer</option>
            </select>
          </div>
        </div>

        <div className="navbar-hamburger" onClick={handleClick}>
          <div className={`hamburger-line ${open ? 'hamburger-open' : ''}`}></div>
          <div className={`hamburger-line ${open ? 'hamburger-open' : ''}`}></div>
          <div className={`hamburger-line ${open ? 'hamburger-open' : ''}`}></div>
        </div>
      </div>
    </nav>
  );
}
