import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import AddPatientModal from '../components/AddPatientModal';
import { AiOutlineMore, AiOutlineCalendar } from 'react-icons/ai';
import { MdLocationOn } from 'react-icons/md';
import '../styles/patients.css';

const Patients = () => {
  const [patients] = useState([
    { 
      id: 1,
      name: 'Marsha Noland',
      age: 25,
      gender: 'Female',
      lastAppointment: 'Thu, 27 Mar 2025',
      location: 'Kurunegala',
      image: 'https://ui-avatars.com/api/?name=Marsha+Noland&background=F472B6&color=fff'
    },
    { 
      id: 2,
      name: 'Irma Armstrong',
      age: 32,
      gender: 'Female',
      lastAppointment: 'Thu, 12 Mar 2025',
      location: 'Kurunegala',
      image: 'https://ui-avatars.com/api/?name=Irma+Armstrong&background=FCA5A5&color=fff'
    },
    { 
      id: 3,
      name: 'Jesus Adams',
      age: 27,
      gender: 'Male',
      lastAppointment: 'Fri, 05 Mar 2025',
      location: 'Kurunegala',
      image: 'https://ui-avatars.com/api/?name=Jesus+Adams&background=FB923C&color=fff'
    },
    { 
      id: 4,
      name: 'Ezra Belcher',
      age: 28,
      gender: 'Male',
      lastAppointment: 'Sat, 24 Feb 2025',
      location: 'Kurunegala',
      image: 'https://ui-avatars.com/api/?name=Ezra+Belcher&background=FBBF24&color=fff'
    },
    { 
      id: 5,
      name: 'Glen Lentz',
      age: 22,
      gender: 'Male',
      lastAppointment: 'Sat, 16 Feb 2025',
      location: 'Kurunegala',
      image: 'https://ui-avatars.com/api/?name=Glen+Lentz&background=A3E635&color=fff'
    },
    { 
      id: 6,
      name: 'Bernard Griffith',
      age: 34,
      gender: 'Male',
      lastAppointment: 'Tue, 01 Feb 2025',
      location: 'Kurunegala',
      image: 'https://ui-avatars.com/api/?name=Bernard+Griffith&background=22D3EE&color=fff'
    },
    { 
      id: 7,
      name: 'John Elsass',
      age: 23,
      gender: 'Male',
      lastAppointment: 'Mon, 25 Jan 2025',
      location: 'Malabe',
      image: 'https://ui-avatars.com/api/?name=John+Elsass&background=93C5FD&color=fff'
    },
    { 
      id: 8,
      name: 'Martin Lisa',
      age: 26,
      gender: 'Female',
      lastAppointment: 'Thu, 22 Jan 2025',
      location: 'Malabe',
      image: 'https://ui-avatars.com/api/?name=Martin+Lisa&background=C084FC&color=fff'
    },
    { 
      id: 9,
      name: 'Ava Mitchell',
      age: 25,
      gender: 'Female',
      lastAppointment: 'Sat, 18 Jan 2025',
      location: 'Malabe',
      image: 'https://ui-avatars.com/api/?name=Ava+Mitchell&background=F9A8D4&color=fff'
    },
    { 
      id: 10,
      name: 'Noah Davis',
      age: 32,
      gender: 'Male',
      lastAppointment: 'Wed, 15 Jan 2025',
      location: 'Malabe',
      image: 'https://ui-avatars.com/api/?name=Noah+Davis&background=FDE68A&color=fff'
    },
    { 
      id: 11,
      name: 'Emily Ross',
      age: 29,
      gender: 'Female',
      lastAppointment: 'Fri, 10 Jan 2025',
      location: 'Malabe',
      image: 'https://ui-avatars.com/api/?name=Emily+Ross&background=99F6E4&color=fff'
    },
    { 
      id: 12,
      name: 'Ryan Anderson',
      age: 30,
      gender: 'Male',
      lastAppointment: 'Tue, 04 Jan 2025',
      location: 'Malabe',
      image: 'https://ui-avatars.com/api/?name=Ryan+Anderson&background=FCA5A5&color=fff'
    },
  ]);

  const [showMenu, setShowMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="dashboard-main">
        <Header />
        
        <div className="patients-content">
          <div className="patients-header">
            <div>
              <h1>Patient Grid</h1>
              <span className="total-badge">Total Patients : 565</span>
            </div>
            <button 
              className="add-patient-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + New Patient
            </button>
          </div>

          <div className="patients-grid">
            {patients.map((patient) => (
              <div key={patient.id} className="patient-card">
                <div className="patient-card-header">
                  <div className="patient-info">
                    <img src={patient.image} alt={patient.name} />
                    <button 
                      className="menu-btn"
                      onClick={() => setShowMenu(showMenu === patient.id ? null : patient.id)}
                    >
                      <AiOutlineMore size={20} />
                    </button>
                    {showMenu === patient.id && (
                      <div className="dropdown-menu">
                        <button>Edit</button>
                        <button>Delete</button>
                      </div>
                    )}
                  </div>
                  <div className="patient-details">
                    <h3>{patient.name}</h3>
                    <p className="patient-meta">{patient.age}, {patient.gender}</p>
                  </div>
                </div>
                <div className="patient-card-body">
                  <div className="info-row">
                    <AiOutlineCalendar className="info-icon" />
                    <span className="info-label">Last Appointment :</span>
                    <span className="info-value">{patient.lastAppointment}</span>
                  </div>
                  <div className="info-row">
                    <MdLocationOn className="info-icon" />
                    <span className="info-value">{patient.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="load-more-btn">Load More ↻</button>

          <footer className="dashboard-footer">
            2025 © Fuchsius, All Rights Reserved
          </footer>
        </div>
      </div>

      <AddPatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Patients;