import { NavLink } from 'react-router-dom';
import { 
  AiOutlineDashboard, 
  AiOutlineUser, 
  AiOutlineTeam, 
  AiOutlineCalendar, 
  AiOutlineCustomerService, 
  AiOutlineMessage 
} from 'react-icons/ai';
import '../../styles/sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: AiOutlineDashboard, path: '/dashboard' },
    { name: 'Doctors', icon: AiOutlineUser, path: '/doctors' },
    { name: 'Patients', icon: AiOutlineTeam, path: '/patients' },
    { name: 'Appointments', icon: AiOutlineCalendar, path: '/appointments' },
    { name: 'Services', icon: AiOutlineCustomerService, path: '/services' },
    { name: 'Messages', icon: AiOutlineMessage, path: '/messages' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="nav-icon" />
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;