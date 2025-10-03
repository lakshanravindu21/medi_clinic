import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import AddDoctorModal from '../components/AddDoctorModal';
import { AiOutlineMore } from 'react-icons/ai';
import '../styles/doctors.css';

const Doctors = () => {
  const [doctors] = useState([
    { 
      id: 1,
      name: 'Dr. Mick Thompson', 
      specialty: 'Cardiologist',
      available: 'Mon, 20 Jan 2025',
      image: 'https://ui-avatars.com/api/?name=Mick+Thompson&background=4F46E5&color=fff'
    },
    { 
      id: 2,
      name: 'Dr. Sarah Johnson', 
      specialty: 'Orthopedic Surgeon',
      available: 'Wed, 22 Jan 2025',
      image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=10B981&color=fff'
    },
    { 
      id: 3,
      name: 'Dr. Emily Carter', 
      specialty: 'Pediatrician',
      available: 'Fri, 24 Jan 2025',
      image: 'https://ui-avatars.com/api/?name=Emily+Carter&background=F59E0B&color=fff'
    },
    { 
      id: 4,
      name: 'Dr. David Lee', 
      specialty: 'Gynecologist',
      available: 'Tue, 21 Jan 2025',
      image: 'https://ui-avatars.com/api/?name=David+Lee&background=8B5CF6&color=fff'
    },
    { 
      id: 5,
      name: 'Dr. Anna Kim', 
      specialty: 'Psychiatrist',
      available: 'Mon, 27 Jan 2025',
      image: 'https://ui-avatars.com/api/?name=Anna+Kim&background=EC4899&color=fff'
    },
    { 
      id: 6,
      name: 'Dr. John Smith', 
      specialty: 'Neurosurgeon',
      available: 'Mon, 27 Jan 2025',
      image: 'https://ui-avatars.com/api/?name=John+Smith&background=06B6D4&color=fff'
    },
    { 
      id: 7,
      name: 'Dr. Lisa White', 
      specialty: 'Oncologist',
      available: 'Sat, 25 Jan 2025',
      image: 'https://ui-avatars.com/api/?name=Lisa+White&background=14B8A6&color=fff'
    },
    { 
      id: 8,
      name: 'Dr. Patricia Brown', 
      specialty: 'Pulmonologist',
      available: 'Sun, 01 Feb 2025',
      image: 'https://ui-avatars.com/api/?name=Patricia+Brown&background=F97316&color=fff'
    },
    { 
      id: 9,
      name: 'Dr. Rachel Green', 
      specialty: 'Urologist',
      available: 'Tue, 28 Jan 2025',
      image: 'https://ui-avatars.com/api/?name=Rachel+Green&background=84CC16&color=fff'
    },
    { 
      id: 10,
      name: 'Dr. Michael Smith', 
      specialty: 'Cardiologist',
      available: 'Thu, 05 Feb 2025',
      image: 'https://ui-avatars.com/api/?name=Michael+Smith&background=6366F1&color=fff'
    },
    { 
      id: 11,
      name: 'Dr. Sarah Johnson', 
      specialty: 'Surgeon',
      available: 'Mon, 09 Feb 2025',
      image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=22D3EE&color=fff'
    },
    { 
      id: 12,
      name: 'Dr. Adrian White', 
      specialty: 'Practitioner',
      available: 'Sat, 25 Jan 2025',
      image: 'https://ui-avatars.com/api/?name=Adrian+White&background=A855F7&color=fff'
    },
  ]);

  const [showMenu, setShowMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="dashboard-main">
        <Header />
        
        <div className="doctors-content">
          <div className="doctors-header">
            <div>
              <h1>Doctor Grid</h1>
              <span className="total-badge">Total Doctors : 565</span>
            </div>
            <button 
              className="add-doctor-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + New Doctor
            </button>
          </div>

          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-card-header">
                  <img src={doctor.image} alt={doctor.name} />
                  <button 
                    className="menu-btn"
                    onClick={() => setShowMenu(showMenu === doctor.id ? null : doctor.id)}
                  >
                    <AiOutlineMore size={20} />
                  </button>
                  {showMenu === doctor.id && (
                    <div className="dropdown-menu">
                      <button>Edit</button>
                      <button>Delete</button>
                    </div>
                  )}
                </div>
                <h3>{doctor.name}</h3>
                <p className="specialty">{doctor.specialty}</p>
                <p className="available">Available : {doctor.available}</p>
              </div>
            ))}
          </div>

          <footer className="dashboard-footer">
            2025 © Fuchsius, All Rights Reserved
          </footer>
        </div>
      </div>

      <AddDoctorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Doctors;