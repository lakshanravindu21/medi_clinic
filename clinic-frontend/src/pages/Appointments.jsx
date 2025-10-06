import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import AddAppointmentModal from '../components/AddAppointmentModal';
import { AiOutlineSearch, AiOutlineFilter, AiOutlineMore } from 'react-icons/ai';
import { appointmentAPI } from '../utils/api';
import '../styles/appointments.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMenu, setShowMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAll();
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setErrorMessage('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await appointmentAPI.cancel(appointmentId);
        setSuccessMessage(response.message || 'Appointment cancelled successfully!');
        await fetchAppointments();
        setShowMenu(null);
      } catch (error) {
        console.error('Error canceling appointment:', error);
        setErrorMessage(error.message || 'Failed to cancel appointment');
      }
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment({
      ...appointment,
      appointmentDateTime: new Date(appointment.appointmentDateTime).toISOString().slice(0, 16)
    });
    setIsModalOpen(true);
    setShowMenu(null);
  };

  const handleModalSuccess = async () => {
    await fetchAppointments();
    setEditingAppointment(null);
    setIsModalOpen(false);
    setSuccessMessage(
      editingAppointment 
        ? 'Appointment updated successfully!' 
        : 'Appointment booked successfully!'
    );
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return (
      date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' - ' +
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'BOOKED':
        return 'status-confirmed';
      case 'CANCELED':
        return 'status-cancelled';
      case 'COMPLETED':
        return 'status-checked-out';
      case 'RESCHEDULED':
        return 'status-schedule';
      default:
        return '';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toUpperCase()) {
      case 'BOOKED':
        return 'Confirmed';
      case 'CANCELED':
        return 'Cancelled';
      case 'COMPLETED':
        return 'Completed';
      case 'RESCHEDULED':
        return 'Rescheduled';
      default:
        return status;
    }
  };

  const getDoctorImage = (doctor) => {
    if (doctor?.imageUrl) {
      if (doctor.imageUrl.startsWith('/uploads/')) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${API_URL}${doctor.imageUrl}`;
      }
      return doctor.imageUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      doctor?.name || 'Doctor'
    )}&background=4F46E5&color=fff`;
  };

  const getPatientImage = (patient) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      patient?.name || 'Patient'
    )}&background=random`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Header />

        <div className="appointments-content">
          {/* Success/Error Messages */}
          {successMessage && (
            <div style={{
              padding: '12px 20px',
              backgroundColor: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              color: '#065f46',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>✓</span>
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div style={{
              padding: '12px 20px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>✕</span>
              {errorMessage}
            </div>
          )}

          <div className="appointments-header">
            <h1>Appointments</h1>
            <div className="header-actions">
              <button className="export-btn">Export</button>
              <button
                className="add-appointment-btn"
                onClick={() => {
                  setEditingAppointment(null);
                  setIsModalOpen(true);
                }}
              >
                + New Appointment
              </button>
            </div>
          </div>

          <div className="filters-section">
            <div className="search-box">
              <AiOutlineSearch className="search-icon" />
              <input type="text" placeholder="Search" />
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading appointments...</div>
          ) : (
            <>
              <div className="appointments-table-container">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                          No appointments found. Book your first appointment!
                        </td>
                      </tr>
                    ) : (
                      appointments.map((apt) => (
                        <tr key={apt.id}>
                          <td className="date-time">{formatDateTime(apt.appointmentDateTime)}</td>
                          <td>
                            <div className="patient-cell">
                              <img src={getPatientImage(apt.patient)} alt={apt.patient?.name || 'Patient'} />
                              <div>
                                <p className="patient-name">{apt.patient?.name || 'N/A'}</p>
                                <p className="patient-phone">{apt.patient?.phone || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="doctor-cell">
                              <img src={getDoctorImage(apt.doctor)} alt={apt.doctor?.name || 'Doctor'} />
                              <div>
                                <p className="doctor-name">{apt.doctor?.name || 'N/A'}</p>
                                <p className="doctor-specialty">{apt.doctor?.specialization || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="mode">{apt.reason || 'General Checkup'}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(apt.status)}`}>
                              {getStatusDisplay(apt.status)}
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
                                {apt.status !== 'CANCELED' && (
                                  <>
                                    <button onClick={() => handleEdit(apt)}>Edit</button>
                                    <button onClick={() => handleCancel(apt.id)}>Cancel</button>
                                  </>
                                )}
                                {apt.status === 'CANCELED' && (
                                  <button disabled style={{ color: '#999', cursor: 'not-allowed' }}>
                                    Cancelled
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
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
                  <button className="page-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
                    ←
                  </button>
                  <button className="page-btn active">{currentPage}</button>
                  <button className="page-btn" onClick={() => setCurrentPage(currentPage + 1)}>
                    →
                  </button>
                </div>
              </div>
            </>
          )}

          <footer className="dashboard-footer">2025 © Fuchsius, All Rights Reserved</footer>
        </div>
      </div>

      <AddAppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={handleModalSuccess}
        appointment={editingAppointment}
      />
    </div>
  );
};

export default Appointments;