import { useNavigate } from 'react-router-dom';
import { AiOutlineSearch, AiOutlineBell } from 'react-icons/ai';
import '../../styles/header.css';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user?.name || "User";

  // initials (first letters of name)
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <header className="header">
      {/* Left: Logo */}
      <div className="header-left">
        <div className="logo-container">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#logo-gradient)"/>
              <rect x="2" y="2" width="28" height="28" rx="6" stroke="url(#logo-gradient-border)" strokeWidth="1" opacity="0.5"/>
              <path d="M16 10V22M10 16H22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="16" r="8" stroke="white" strokeWidth="1.5" opacity="0.3"/>
              <defs>
                <linearGradient id="logo-gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4F46E5"/>
                  <stop offset="1" stopColor="#6366F1"/>
                </linearGradient>
                <linearGradient id="logo-gradient-border" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818CF8"/>
                  <stop offset="1" stopColor="#6366F1"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">Preclinic</span>
        </div>
      </div>

      {/* Middle: Search Bar */}
      <div className="search-bar">
        <AiOutlineSearch className="search-icon" />
        <input type="text" placeholder="Search doctors, patients, appointments..." />
      </div>

      {/* Right: Notifications + User + Logout */}
      <div className="header-right">
        <button className="icon-button notification-button">
          <AiOutlineBell size={20} />
          <span className="notification-badge"></span>
        </button>

        <div className="user-initials" title={userName}>{initials}</div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;