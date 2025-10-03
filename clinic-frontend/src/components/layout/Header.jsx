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
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#4F46E5"/>
          <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="logo-text">Preclinic</span>
      </div>

      {/* Middle: Search Bar */}
      <div className="search-bar">
        <AiOutlineSearch className="search-icon" />
        <input type="text" placeholder="Search..." />
      </div>

      {/* Right: Notifications + User + Logout */}
      <div className="header-right">
        <button className="icon-button notification-button">
          <AiOutlineBell size={20} />
          <span className="notification-badge"></span>
        </button>

        <div className="user-initials">{initials}</div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
