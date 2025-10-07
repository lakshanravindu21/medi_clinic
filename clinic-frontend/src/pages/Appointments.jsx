import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import AddAppointmentModal from '../components/AddAppointmentModal';
import { AiOutlineSearch, AiOutlineFilter, AiOutlineMore, AiOutlineCalendar, AiOutlineClose } from 'react-icons/ai';
import { appointmentAPI } from '../utils/api';
import '../styles/appointments.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showMenu, setShowMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Status change modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [changingAppointment, setChangingAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAndSortAppointments();
  }, [appointments, searchQuery, sortBy, statusFilter]);

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

  const filterAndSortAppointments = () => {
    let filtered = [...appointments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patient?.name?.toLowerCase().includes(query) ||
        apt.doctor?.name?.toLowerCase().includes(query) ||
        apt.reason?.toLowerCase().includes(query) ||
        apt.patient?.phone?.includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => 
        apt.status?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime);
        case 'oldest':
          return new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime);
        case 'name':
          return (a.patient?.name || '').localeCompare(b.patient?.name || '');
        case 'doctor':
          return (a.doctor?.name || '').localeCompare(b.doctor?.name || '');
        default:
          return 0;
      }
    });

    setFilteredAppointments(filtered);
    setCurrentPage(1);
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
    // Check if appointment can be edited
    const status = appointment.status?.toUpperCase();
    if (status === 'CANCELED' || status === 'COMPLETED') {
      setErrorMessage(`Cannot edit ${status.toLowerCase()} appointments`);
      setShowMenu(null);
      return;
    }

    setEditingAppointment({
      ...appointment,
      appointmentDateTime: new Date(appointment.appointmentDateTime).toISOString().slice(0, 16)
    });
    setIsModalOpen(true);
    setShowMenu(null);
  };

  const handleStatusChange = (appointment) => {
    setChangingAppointment(appointment);
    setNewStatus(appointment.status);
    setShowStatusModal(true);
    setShowMenu(null);
  };

  const confirmStatusChange = async () => {
    if (!changingAppointment || !newStatus) return;
    
    // Don't proceed if status hasn't changed
    if (newStatus === changingAppointment.status) {
      setErrorMessage('Please select a different status');
      return;
    }

    try {
      // Call API to update status
      const response = await appointmentAPI.updateStatus(changingAppointment.id, newStatus);
      setSuccessMessage(`Appointment status updated to ${getStatusDisplay(newStatus)}!`);
      await fetchAppointments();
      setShowStatusModal(false);
      setChangingAppointment(null);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage(error.message || 'Failed to update appointment status');
    }
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
      ' • ' +
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

  const canEditAppointment = (status) => {
    const upperStatus = status?.toUpperCase();
    return upperStatus !== 'CANCELED' && upperStatus !== 'COMPLETED';
  };

  const canChangeStatus = (status) => {
    const upperStatus = status?.toUpperCase();
    return upperStatus !== 'CANCELED';
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('recent');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Header />

        <div className="appointments-content">
          {successMessage && (
            <div className="alert-message success-message">
              <span className="alert-icon">✓</span>
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="alert-message error-message">
              <span className="alert-icon">✕</span>
              {errorMessage}
            </div>
          )}

          <div className="appointments-header">
            <div>
              <h1>Appointments</h1>
              <p className="header-subtitle">Manage and track all patient appointments</p>
            </div>
            <div className="header-actions">
              <button className="export-btn">
                <AiOutlineCalendar size={18} />
                Export
              </button>
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

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#EEF2FF' }}>
                <AiOutlineCalendar size={24} color="#4F46E5" />
              </div>
              <div>
                <p className="stat-label">Total Appointments</p>
                <h3 className="stat-value">{appointments.length}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#D1FAE5' }}>
                <span style={{ fontSize: '24px' }}>✓</span>
              </div>
              <div>
                <p className="stat-label">Confirmed</p>
                <h3 className="stat-value">
                  {appointments.filter(a => a.status?.toUpperCase() === 'BOOKED').length}
                </h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#DBEAFE' }}>
                <span style={{ fontSize: '24px' }}>✔</span>
              </div>
              <div>
                <p className="stat-label">Completed</p>
                <h3 className="stat-value">
                  {appointments.filter(a => a.status?.toUpperCase() === 'COMPLETED').length}
                </h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#FEE2E2' }}>
                <span style={{ fontSize: '24px' }}>✕</span>
              </div>
              <div>
                <p className="stat-label">Cancelled</p>
                <h3 className="stat-value">
                  {appointments.filter(a => a.status?.toUpperCase() === 'CANCELED').length}
                </h3>
              </div>
            </div>
          </div>

          <div className="filters-section">
            <div className="search-box">
              <AiOutlineSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by patient, doctor, phone or reason..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>
            
            <div className="filter-dropdown-container">
              <button 
                className={`filter-btn ${statusFilter !== 'all' ? 'active' : ''}`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <AiOutlineFilter /> 
                Filter {statusFilter !== 'all' && `(${statusFilter})`}
              </button>
              
              {showFilterMenu && (
                <div className="filter-menu">
                  <div className="filter-menu-header">
                    <span>Filter by Status</span>
                    <button onClick={() => setShowFilterMenu(false)}>✕</button>
                  </div>
                  <button 
                    className={statusFilter === 'all' ? 'active' : ''}
                    onClick={() => { setStatusFilter('all'); setShowFilterMenu(false); }}
                  >
                    All Appointments
                  </button>
                  <button 
                    className={statusFilter === 'booked' ? 'active' : ''}
                    onClick={() => { setStatusFilter('booked'); setShowFilterMenu(false); }}
                  >
                    <span className="status-dot confirmed"></span> Confirmed
                  </button>
                  <button 
                    className={statusFilter === 'completed' ? 'active' : ''}
                    onClick={() => { setStatusFilter('completed'); setShowFilterMenu(false); }}
                  >
                    <span className="status-dot completed"></span> Completed
                  </button>
                  <button 
                    className={statusFilter === 'canceled' ? 'active' : ''}
                    onClick={() => { setStatusFilter('canceled'); setShowFilterMenu(false); }}
                  >
                    <span className="status-dot cancelled"></span> Cancelled
                  </button>
                  <button 
                    className={statusFilter === 'rescheduled' ? 'active' : ''}
                    onClick={() => { setStatusFilter('rescheduled'); setShowFilterMenu(false); }}
                  >
                    <span className="status-dot rescheduled"></span> Rescheduled
                  </button>
                </div>
              )}
            </div>

            <div className="sort-dropdown">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Sort By: Recent</option>
                <option value="oldest">Sort By: Oldest</option>
                <option value="name">Sort By: Patient Name</option>
                <option value="doctor">Sort By: Doctor Name</option>
              </select>
            </div>

            {(searchQuery || statusFilter !== 'all') && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          <div className="results-info">
            Showing {currentAppointments.length} of {filteredAppointments.length} appointments
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading appointments...</p>
            </div>
          ) : (
            <>
              <div className="appointments-table-container">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th style={{ width: '18%' }}>Date & Time</th>
                      <th style={{ width: '20%' }}>Patient</th>
                      <th style={{ width: '20%' }}>Doctor</th>
                      <th style={{ width: '22%' }}>Reason</th>
                      <th style={{ width: '12%' }}>Status</th>
                      <th style={{ width: '8%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-state">
                          <div className="empty-state-content">
                            <AiOutlineCalendar size={48} color="#D1D5DB" />
                            <h3>No appointments found</h3>
                            <p>
                              {searchQuery || statusFilter !== 'all' 
                                ? 'Try adjusting your filters' 
                                : 'Book your first appointment to get started'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentAppointments.map((apt) => (
                        <tr key={apt.id} className="table-row">
                          <td className="date-time">
                            <AiOutlineCalendar size={16} style={{ marginRight: '8px', color: '#6B7280' }} />
                            {formatDateTime(apt.appointmentDateTime)}
                          </td>
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
                          <td className="reason-cell">{apt.reason || 'General Checkup'}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(apt.status)}`}>
                              {getStatusDisplay(apt.status)}
                            </span>
                          </td>
                          <td style={{ position: 'relative' }}>
                            <button
                              className="menu-btn"
                              onClick={() => setShowMenu(showMenu === apt.id ? null : apt.id)}
                            >
                              <AiOutlineMore size={18} />
                            </button>
                            {showMenu === apt.id && (
                              <div className="dropdown-menu">
                                {canEditAppointment(apt.status) && (
                                  <button onClick={() => handleEdit(apt)}>
                                    <span>✏️</span> Edit Details
                                  </button>
                                )}
                                {canChangeStatus(apt.status) && (
                                  <button onClick={() => handleStatusChange(apt)}>
                                    <span>🔄</span> Change Status
                                  </button>
                                )}
                                {apt.status?.toUpperCase() !== 'CANCELED' && (
                                  <button onClick={() => handleCancel(apt.id)} className="danger">
                                    <span>🗑️</span> Cancel
                                  </button>
                                )}
                                {apt.status?.toUpperCase() === 'CANCELED' && (
                                  <button disabled className="disabled-btn">
                                    Already Cancelled
                                  </button>
                                )}
                                {apt.status?.toUpperCase() === 'COMPLETED' && !canEditAppointment(apt.status) && (
                                  <button disabled className="disabled-btn">
                                    Appointment Completed
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

              {filteredAppointments.length > 0 && (
                <div className="pagination">
                  <div className="pagination-info">
                    <span>Show</span>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>entries per page</span>
                  </div>
                  <div className="pagination-controls">
                    <button 
                      className="page-btn" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            className={`page-btn ${currentPage === pageNumber ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="page-ellipsis">...</span>;
                      }
                      return null;
                    })}
                    
                    <button 
                      className="page-btn" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <footer className="dashboard-footer">2025 © Fuchsius, All Rights Reserved</footer>
        </div>
      </div>

      {/* Edit Appointment Modal */}
      <AddAppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={handleModalSuccess}
        appointment={editingAppointment}
      />

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header">
              <h3>Change Appointment Status</h3>
              <button 
                className="close-modal-btn" 
                onClick={() => setShowStatusModal(false)}
              >
                <AiOutlineClose size={20} />
              </button>
            </div>
            
            <div className="status-modal-body">
              <div className="current-status-info">
                <p className="info-label">Patient:</p>
                <p className="info-value">{changingAppointment?.patient?.name}</p>
              </div>
              
              <div className="current-status-info">
                <p className="info-label">Current Status:</p>
                <span className={`status-badge ${getStatusClass(changingAppointment?.status)}`}>
                  {getStatusDisplay(changingAppointment?.status)}
                </span>
              </div>

              <div className="status-select-container">
                <label>Select New Status:</label>
                <div className="status-options">
                  <label className={`status-option ${newStatus === 'BOOKED' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="BOOKED"
                      checked={newStatus === 'BOOKED'}
                      onChange={(e) => setNewStatus(e.target.value)}
                    />
                    <div className="status-option-content">
                      <span className="status-dot confirmed"></span>
                      <span>Confirmed</span>
                    </div>
                  </label>

                  <label className={`status-option ${newStatus === 'RESCHEDULED' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="RESCHEDULED"
                      checked={newStatus === 'RESCHEDULED'}
                      onChange={(e) => setNewStatus(e.target.value)}
                    />
                    <div className="status-option-content">
                      <span className="status-dot rescheduled"></span>
                      <span>Rescheduled</span>
                    </div>
                  </label>

                  <label className={`status-option ${newStatus === 'COMPLETED' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="COMPLETED"
                      checked={newStatus === 'COMPLETED'}
                      onChange={(e) => setNewStatus(e.target.value)}
                    />
                    <div className="status-option-content">
                      <span className="status-dot completed"></span>
                      <span>Completed</span>
                    </div>
                  </label>

                  <label className={`status-option ${newStatus === 'CANCELED' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="CANCELED"
                      checked={newStatus === 'CANCELED'}
                      onChange={(e) => setNewStatus(e.target.value)}
                    />
                    <div className="status-option-content">
                      <span className="status-dot cancelled"></span>
                      <span>Cancelled</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="status-modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={confirmStatusChange}
                disabled={!newStatus || newStatus === changingAppointment?.status}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;