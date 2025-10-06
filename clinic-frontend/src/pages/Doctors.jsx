import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import AddDoctorModal from '../components/AddDoctorModal';
import { AiOutlineMore } from 'react-icons/ai';
import { doctorAPI } from '../utils/api';
import '../styles/doctors.css';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getAll();
      console.log('Fetched doctors:', response.data); // Debug log
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorAPI.delete(doctorId);
        fetchDoctors();
        setShowMenu(null);
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor');
      }
    }
  };

  const formatAvailability = (availability) => {
    try {
      const parsed = JSON.parse(availability);
      const days = Object.keys(parsed);
      return days.length > 0 ? days.join(', ') : 'Not specified';
    } catch {
      return 'Not specified';
    }
  };

  const getDoctorImage = (doctor) => {
    // Check if imageUrl exists and is a base64 string or URL
    if (doctor.imageUrl) {
      console.log('Doctor has imageUrl:', doctor.name, doctor.imageUrl.substring(0, 50)); // Debug
      return doctor.imageUrl;
    }
    // Fallback to avatar placeholder
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random&size=200`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="dashboard-main">
        <Header />
        
        <div className="doctors-content">
          <div className="doctors-header">
            <div>
              <h1>Doctor Grid</h1>
              <span className="total-badge">Total Doctors : {doctors.length}</span>
            </div>
            <button 
              className="add-doctor-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + New Doctor
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No doctors found. Add your first doctor!
            </div>
          ) : (
            <div className="doctors-grid">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-card-header">
                    <img 
                      src={getDoctorImage(doctor)} 
                      alt={doctor.name}
                      onError={(e) => {
                        console.error('Image failed to load for:', doctor.name);
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random&size=200`;
                      }}
                    />
                    <button 
                      className="menu-btn"
                      onClick={() => setShowMenu(showMenu === doctor.id ? null : doctor.id)}
                    >
                      <AiOutlineMore size={20} />
                    </button>
                    {showMenu === doctor.id && (
                      <div className="dropdown-menu">
                        <button onClick={() => alert('Edit functionality coming soon')}>Edit</button>
                        <button onClick={() => handleDelete(doctor.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                  <h3>{doctor.name}</h3>
                  <p className="specialty">{doctor.specialization}</p>
                  <p className="available">Available: {formatAvailability(doctor.availability)}</p>
                </div>
              ))}
            </div>
          )}

          <footer className="dashboard-footer">
            2025 © Fuchsius, All Rights Reserved
          </footer>
        </div>
      </div>

      <AddDoctorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDoctors}
      />
    </div>
  );
};

export default Doctors;