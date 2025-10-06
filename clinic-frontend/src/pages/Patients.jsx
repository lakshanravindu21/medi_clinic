import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import AddPatientModal from '../components/AddPatientModal';
import { AiOutlineMore, AiOutlineCalendar } from 'react-icons/ai';
import { MdLocationOn } from 'react-icons/md';
import { patientAPI } from '../utils/api';
import '../styles/patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getAll();
      console.log('Fetched patients:', response.data);
      setPatients(response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientAPI.delete(patientId);
        fetchPatients();
        setShowMenu(null);
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getPatientImage = (patient) => {
    // Check if imageUrl exists
    if (patient.imageUrl) {
      // If it's a relative path (starts with /uploads/)
      if (patient.imageUrl.startsWith('/uploads/')) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const fullUrl = `${API_URL}${patient.imageUrl}`;
        console.log('Patient image URL:', patient.firstName, fullUrl);
        return fullUrl;
      }
      // If it's already a full URL or base64
      return patient.imageUrl;
    }
    // Fallback to avatar placeholder
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.firstName + ' ' + patient.lastName)}&background=random&size=150`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="dashboard-main">
        <Header />
        
        <div className="patients-content">
          <div className="patients-header">
            <div>
              <h1>Patient Grid</h1>
              <span className="total-badge">Total Patients : {patients.length}</span>
            </div>
            <button 
              className="add-patient-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + New Patient
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading patients...</div>
          ) : patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No patients found. Add your first patient!
            </div>
          ) : (
            <div className="patients-grid">
              {patients.map((patient) => (
                <div key={patient.id} className="patient-card">
                  <div className="patient-card-header">
                    <div className="patient-info">
                      <img 
                        src={getPatientImage(patient)} 
                        alt={`${patient.firstName} ${patient.lastName}`}
                        onError={(e) => {
                          console.error('Image failed to load for:', `${patient.firstName} ${patient.lastName}`);
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.firstName + ' ' + patient.lastName)}&background=random&size=150`;
                        }}
                      />
                      <button 
                        className="menu-btn"
                        onClick={() => setShowMenu(showMenu === patient.id ? null : patient.id)}
                      >
                        <AiOutlineMore size={20} />
                      </button>
                      {showMenu === patient.id && (
                        <div className="dropdown-menu">
                          <button onClick={() => alert('Edit functionality coming soon')}>Edit</button>
                          <button onClick={() => handleDelete(patient.id)}>Delete</button>
                        </div>
                      )}
                    </div>
                    <div className="patient-details">
                      <h3>{patient.firstName} {patient.lastName}</h3>
                      <p className="patient-meta">
                        {patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'N/A'}, {patient.gender || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="patient-card-body">
                    <div className="info-row">
                      <AiOutlineCalendar className="info-icon" />
                      <span className="info-label">Last Appointment :</span>
                      <span className="info-value">{formatDate(patient.createdAt)}</span>
                    </div>
                    <div className="info-row">
                      <MdLocationOn className="info-icon" />
                      <span className="info-value">{patient.city || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <footer className="dashboard-footer">
            2025 © Fuchsius, All Rights Reserved
          </footer>
        </div>
      </div>

      <AddPatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPatients}
      />
    </div>
  );
};

export default Patients;