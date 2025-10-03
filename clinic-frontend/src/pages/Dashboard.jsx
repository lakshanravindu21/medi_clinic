import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { 
  AiOutlineUser, 
  AiOutlineTeam, 
  AiOutlineCalendar,
  AiOutlineLeft,
  AiOutlineRight
} from 'react-icons/ai';
import '../styles/dashboard.css';



const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stats, setStats] = useState({
    doctors: { count: 247, trend: '+55%' },
    patients: { count: 4178, trend: '+25%' },
    appointments: { count: 12178, trend: '-15%' }
  });

  const appointmentStats = {
    all: 6314,
    cancelled: 456,
    reschedule: 745,
    completed: 4578
  };

  const popularDoctors = [
    { name: 'Dr. Mick Thompson', specialty: 'Cardiologist', bookings: 258 },
    { name: 'Dr. Emily Carter', specialty: 'Pediatrician', bookings: 125 },
    { name: 'Dr. David Lee', specialty: 'Gynecologist', bookings: 115 }
  ];

  const upcomingAppointments = [
    { type: 'General Visit', date: 'Wed, 05 Apr 2025, 06:30 PM' },
    { type: 'General Visit', date: 'Wed, 05 Apr 2025, 04:10 PM' },
    { type: 'General Visit', date: 'Wed, 05 Apr 2025, 10:00 AM' }
  ];

  const allAppointments = [
    { 
      doctor: 'Dr. John Smith', 
      specialty: 'Neurosurgeon',
      patient: 'Jesus Adams', 
      phone: '+1 41254 43214',
      dateTime: '28 May 2025 - 11:15 AM',
      mode: 'Online',
      status: 'Confirmed'
    },
    { 
      doctor: 'Dr. Lisa White', 
      specialty: 'Oncologist',
      patient: 'Ezra Belcher', 
      phone: '+1 65895 41247',
      dateTime: '29 May 2025 - 11:30 AM',
      mode: 'In-Person',
      status: 'Cancelled'
    },
    { 
      doctor: 'Dr. Patricia Brown', 
      specialty: 'Pulmonologist',
      patient: 'Glen Lentz', 
      phone: '+1 12458 45845',
      dateTime: '30 May 2025 - 09:30 AM',
      mode: 'Online',
      status: 'Confirmed'
    },
    { 
      doctor: 'Dr. Rachel Green', 
      specialty: 'Urologist',
      patient: 'Bernard Griffith', 
      phone: '+1 61422 45214',
      dateTime: '30 May 2025 - 10:00 AM',
      mode: 'Online',
      status: 'Checked Out'
    },
    { 
      doctor: 'Dr. Michael Smith', 
      specialty: 'Cardiologist',
      patient: 'John Elsass', 
      phone: '+1 27851 26371',
      dateTime: '30 May 2025 - 11:00 AM',
      mode: 'Online',
      status: 'Schedule'
    }
  ];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const calendar = [];
  
  for (let i = 0; i < firstDay; i++) {
    calendar.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendar.push(day);
  }

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'checked out': return 'status-checked';
      case 'schedule': return 'status-schedule';
      default: return '';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="dashboard-main">
        <Header />
        
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon doctors-icon">
                <AiOutlineUser size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Doctors</p>
                <h3 className="stat-value">{stats.doctors.count}</h3>
              </div>
              <div className="stat-trend positive">
                <span className="trend-badge">{stats.doctors.trend}</span>
                <span className="trend-label">in last 7 Days</span>
              </div>
              <div className="stat-chart">
                {[40, 55, 45, 60, 50, 70, 65].map((height, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${height}%` }}></div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon patients-icon">
                <AiOutlineTeam size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Patients</p>
                <h3 className="stat-value">{stats.patients.count}</h3>
              </div>
              <div className="stat-trend positive">
                <span className="trend-badge">{stats.patients.trend}</span>
                <span className="trend-label">in last 7 Days</span>
              </div>
              <div className="stat-chart orange">
                {[45, 60, 55, 70, 65, 75, 70].map((height, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${height}%` }}></div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon appointments-icon">
                <AiOutlineCalendar size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Appointment</p>
                <h3 className="stat-value">{stats.appointments.count}</h3>
              </div>
              <div className="stat-trend negative">
                <span className="trend-badge">{stats.appointments.trend}</span>
                <span className="trend-label">in last 7 Days</span>
              </div>
              <div className="stat-chart cyan">
                {[60, 70, 65, 55, 60, 65, 70].map((height, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${height}%` }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Appointment Statistics */}
            <div className="dashboard-card appointment-stats">
              <div className="card-header">
                <h2>Appointment Statistics</h2>
                <select className="filter-dropdown">
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Yearly</option>
                </select>
              </div>

              <div className="stats-badges">
                <div className="badge-item">
                  <span className="badge-dot all"></span>
                  <span className="badge-label">All Appointments</span>
                  <span className="badge-value">{appointmentStats.all}</span>
                </div>
                <div className="badge-item">
                  <span className="badge-dot cancelled"></span>
                  <span className="badge-label">Cancelled</span>
                  <span className="badge-value">{appointmentStats.cancelled}</span>
                </div>
                <div className="badge-item">
                  <span className="badge-dot reschedule"></span>
                  <span className="badge-label">Reschedule</span>
                  <span className="badge-value">{appointmentStats.reschedule}</span>
                </div>
                <div className="badge-item">
                  <span className="badge-dot completed"></span>
                  <span className="badge-label">Completed</span>
                  <span className="badge-value">{appointmentStats.completed}</span>
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-y-axis">
                  <span>5K</span>
                  <span>4K</span>
                  <span>3K</span>
                  <span>2K</span>
                  <span>1K</span>
                  <span>0</span>
                </div>
                <div className="chart-bars">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                    <div key={month} className="bar-group">
                      <div className="bar-stack">
                        <div className="bar completed" style={{ height: `${40 + Math.random() * 30}%` }}></div>
                        <div className="bar ongoing" style={{ height: `${20 + Math.random() * 20}%` }}></div>
                        <div className="bar rescheduled" style={{ height: `${10 + Math.random() * 15}%` }}></div>
                      </div>
                      <span className="bar-label">{month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color completed"></span>
                  <span>Completed</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color ongoing"></span>
                  <span>Ongoing</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color rescheduled"></span>
                  <span>Rescheduled</span>
                </div>
              </div>
            </div>

            {/* Right Side - Calendar and Appointments */}
            <div className="right-sidebar">
              {/* Calendar */}
              <div className="dashboard-card calendar-card">
                <div className="card-header">
                  <h3>Appointments</h3>
                  <select className="filter-dropdown">
                    <option>All Type</option>
                    <option>Online</option>
                    <option>In-Person</option>
                  </select>
                </div>

                <div className="calendar">
                  <div className="calendar-header">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
                      <AiOutlineLeft />
                    </button>
                    <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
                      <AiOutlineRight />
                    </button>
                  </div>

                  <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="calendar-day-header">{day}</div>
                    ))}
                    {calendar.map((day, i) => (
                      <div key={i} className={`calendar-day ${day === 5 ? 'selected' : ''} ${!day ? 'empty' : ''}`}>
                        {day || ''}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="upcoming-appointments">
                  {upcomingAppointments.map((apt, i) => (
                    <div key={i} className="appointment-item">
                      <div className="appointment-avatar">
                        <img src={`https://ui-avatars.com/api/?name=${apt.type}&background=random`} alt="" />
                      </div>
                      <div className="appointment-details">
                        <p className="appointment-type">{apt.type}</p>
                        <p className="appointment-time">{apt.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="view-all-btn">View All Appointments</button>
              </div>
            </div>
          </div>

          {/* Popular Doctors */}
          <div className="dashboard-card popular-doctors">
            <div className="card-header">
              <h2>Popular Doctors</h2>
              <select className="filter-dropdown">
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>

            <div className="doctors-grid">
              {popularDoctors.map((doctor, i) => (
                <div key={i} className="doctor-card">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`} 
                    alt={doctor.name}
                    className="doctor-avatar"
                  />
                  <h4>{doctor.name}</h4>
                  <p className="doctor-specialty">{doctor.specialty}</p>
                  <p className="doctor-bookings"><strong>{doctor.bookings}</strong> Bookings</p>
                </div>
              ))}
            </div>
          </div>

          {/* All Appointments Table */}
          <div className="dashboard-card appointments-table">
            <div className="card-header">
              <h2>All Appointments</h2>
              <button className="view-all-link">View All</button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allAppointments.map((apt, i) => (
                  <tr key={i}>
                    <td>
                      <div className="doctor-info">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor)}&background=4F46E5&color=fff`}
                          alt={apt.doctor}
                        />
                        <div>
                          <p className="doctor-name">{apt.doctor}</p>
                          <p className="doctor-spec">{apt.specialty}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="patient-info">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient)}&background=random`}
                          alt={apt.patient}
                        />
                        <div>
                          <p className="patient-name">{apt.patient}</p>
                          <p className="patient-phone">{apt.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="date-time">{apt.dateTime}</td>
                    <td className="mode">{apt.mode}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <footer className="dashboard-footer">
            2025 © Fuchsius, All Rights Reserved
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;