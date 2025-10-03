import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { AiOutlineSearch, AiOutlineFilter, AiOutlineMore } from 'react-icons/ai';
import '../styles/appointments.css';

const Appointments = () => {
  const [appointments] = useState([
    {
      id: 1,
      dateTime: '30 Apr 2025 - 09:30 AM',
      patient: { name: 'Alberto Ripley', phone: '+1 56556 54565' },
      doctor: { name: 'Dr. Mick Thompson', specialty: 'Cardiologist' },
      mode: 'In-person',
      status: 'Checked Out'
    },
    {
      id: 2,
      dateTime: '15 Apr 2025 - 11:20 AM',
      patient: { name: 'Susan Babin', phone: '+1 65658 95654' },
      doctor: { name: 'Dr. Sarah Johnson', specialty: 'Orthopedic Surgeon' },
      mode: 'Online',
      status: 'Checked in'
    },
    {
      id: 3,
      dateTime: '02 Apr 2025 - 08:15 AM',
      patient: { name: 'Carol Lam', phone: '+1 55654 56647' },
      doctor: { name: 'Dr. Emily Carter', specialty: 'Pediatrician' },
      mode: 'In-Person',
      status: 'Cancelled'
    },
    {
      id: 4,
      dateTime: '27 Mar 2025 - 02:00 PM',
      patient: { name: 'Marsha Noland', phone: '+1 65668 54558' },
      doctor: { name: 'Dr. David Lee', specialty: 'Gynecologist' },
      mode: 'Online',
      status: 'Schedule'
    },
    {
      id: 5,
      dateTime: '12 Mar 2025 - 05:40 PM',
      patient: { name: 'Irma Armstrong', phone: '+1 45214 66568' },
      doctor: { name: 'Dr. Anna Kim', specialty: 'Psychiatrist' },
      mode: 'Online',
      status: 'Confirmed'
    },
    {
      id: 6,
      dateTime: '05 Mar 2025 - 11:15 AM',
      patient: { name: 'Jesus Adams', phone: '+1 41254 45214' },
      doctor: { name: 'Dr. John Smith', specialty: 'Neurosurgeon' },
      mode: 'Online',
      status: 'Confirmed'
    },
    {
      id: 7,
      dateTime: '24 Feb 2025 - 09:20 AM',
      patient: { name: 'Ezra Belcher', phone: '+1 65895 41247' },
      doctor: { name: 'Dr. Lisa White', specialty: 'Oncologist' },
      mode: 'In-Person',
      status: 'Cancelled'
    },
    {
      id: 8,
      dateTime: '16 Feb 2025 - 11:40 AM',
      patient: { name: 'Glen Lentz', phone: '+1 62458 45845' },
      doctor: { name: 'Dr. Patricia Brown', specialty: 'Pulmonologist' },
      mode: 'Online',
      status: 'Confirmed'
    },
    {
      id: 9,
      dateTime: '01 Feb 2025 - 04:00 PM',
      patient: { name: 'Bernard Griffith', phone: '+1 61422 45214' },
      doctor: { name: 'Dr. Rachel Green', specialty: 'Urologist' },
      mode: 'Online',
      status: 'Checked Out'
    },
    {
      id: 10,
      dateTime: '25 Jan 2025 - 03:10 PM',
      patient: { name: 'John Elsass', phone: '+1 47851 26371' },
      doctor: { name: 'Dr. Michael Smith', specialty: 'Cardiologist' },
      mode: 'Online',
      status: 'Schedule'
    },
  ]);

  const [currentPage, setCurrentPage] = useState(2);
  const [showMenu, setShowMenu] = useState(null);

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'checked out': return 'status-checked-out';
      case 'checked in': return 'status-checked-in';
      case 'schedule': return 'status-schedule';
      default: return '';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="dashboard-main">
        <Header />
        
        <div className="appointments-content">
          <div className="appointments-header">
            <h1>Appointment</h1>
            <div className="header-actions">
              <button className="export-btn">Export</button>
              <button className="add-appointment-btn">+ New Appointment</button>
            </div>
          </div>

          <div className="filters-section">
            <div className="search-box">
              <AiOutlineSearch className="search-icon" />
              <input type="text" placeholder="Search" />
            </div>
            <div className="date-range">
              <span>📅 27 May 2025 - 02 Jun 2025</span>
            </div>
            <button className="filter-btn">
              <AiOutlineFilter /> Filter
            </button>
            <div className="sort-dropdown">
              <select>
                <option>Sort By : Recent</option>
                <option>Sort By : Oldest</option>
                <option>Sort By : Name</option>
              </select>
            </div>
          </div>

          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td className="date-time">{apt.dateTime}</td>
                    <td>
                      <div className="patient-cell">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient.name)}&background=random`}
                          alt={apt.patient.name}
                        />
                        <div>
                          <p className="patient-name">{apt.patient.name}</p>
                          <p className="patient-phone">{apt.patient.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="doctor-cell">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor.name)}&background=4F46E5&color=fff`}
                          alt={apt.doctor.name}
                        />
                        <div>
                          <p className="doctor-name">{apt.doctor.name}</p>
                          <p className="doctor-specialty">{apt.doctor.specialty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="mode">{apt.mode}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="menu-btn"
                        onClick={() => setShowMenu(showMenu === apt.id ? null : apt.id)}
                      >
                        <AiOutlineMore size={18} />
                      </button>
                      {showMenu === apt.id && (
                        <div className="dropdown-menu">
                          <button>View</button>
                          <button>Edit</button>
                          <button>Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              <span>Show</span>
              <select>
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>Results</span>
            </div>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>←</button>
              <button className="page-btn">1</button>
              <button className="page-btn active">2</button>
              <button className="page-btn">3</button>
              <span>...</span>
              <button className="page-btn">12</button>
              <button className="page-btn" onClick={() => setCurrentPage(currentPage + 1)}>→</button>
            </div>
          </div>

          <footer className="dashboard-footer">
            2025 © Fuchsius, All Rights Reserved
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Appointments;