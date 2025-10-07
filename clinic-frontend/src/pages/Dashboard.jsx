import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { 
  AiOutlineUser, 
  AiOutlineTeam, 
  AiOutlineCalendar,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineLock
} from 'react-icons/ai';
import { doctorAPI, patientAPI, appointmentAPI } from '../utils/api';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  // Backend URL for images
  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  // Data states
  const [stats, setStats] = useState({
    doctors: { count: 0, trend: '+0%' },
    patients: { count: 0, trend: '+0%' },
    appointments: { count: 0, trend: '+0%' }
  });
  const [appointmentStats, setAppointmentStats] = useState({
    all: 0,
    cancelled: 0,
    reschedule: 0,
    completed: 0
  });
  const [popularDoctors, setPopularDoctors] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check user role on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
  }, []);

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };

  // Fetch all data on component mount
  useEffect(() => {
    if (userRole && userRole !== 'PATIENT') {
      fetchDashboardData();
    } else if (userRole === 'PATIENT') {
      setLoading(false);
    }
  }, [userRole]);

  // Fetch appointments for selected date
  useEffect(() => {
    if (userRole && userRole !== 'PATIENT') {
      fetchAppointmentsForDate(selectedDate);
    }
  }, [selectedDate, userRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
        doctorAPI.getAll(),
        patientAPI.getAll(),
        appointmentAPI.getAll()
      ]);

      // Calculate stats
      const doctors = doctorsRes.data || [];
      const patients = patientsRes.data || [];
      const appointments = appointmentsRes.data || [];

      // Update counts
      setStats({
        doctors: { count: doctors.length, trend: '+55%' },
        patients: { count: patients.length, trend: '+25%' },
        appointments: { count: appointments.length, trend: '+15%' }
      });

      // Calculate appointment statistics
      const statsData = {
        all: appointments.length,
        cancelled: appointments.filter(a => a.status === 'CANCELED').length,
        reschedule: appointments.filter(a => a.status === 'RESCHEDULED').length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length
      };
      setAppointmentStats(statsData);

      // Get today's appointments (closest 3)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointments = appointments
        .filter(apt => {
          const aptDate = new Date(apt.appointmentDateTime);
          return aptDate >= today && aptDate < tomorrow && apt.status !== 'CANCELED';
        })
        .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
        .slice(0, 3);

      setUpcomingAppointments(todayAppointments);

      // Calculate popular doctors (by booking count) - TOP 4
      const doctorBookings = {};
      appointments.forEach(apt => {
        if (apt.status !== 'CANCELED') {
          doctorBookings[apt.doctorId] = (doctorBookings[apt.doctorId] || 0) + 1;
        }
      });

      const popularDocs = doctors
        .map(doc => ({
          ...doc,
          bookings: doctorBookings[doc.id] || 0
        }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 4);

      setPopularDoctors(popularDocs);

      // Get recent appointments for table (last 5)
      const recentAppointments = appointments
        .sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime))
        .slice(0, 5);

      setAllAppointments(recentAppointments);

      // Calculate monthly statistics for chart
      calculateMonthlyStats(appointments);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyStats = (appointments) => {
    const currentYear = new Date().getFullYear();
    const monthlyData = Array(12).fill(null).map((_, i) => ({
      month: i,
      completed: 0,
      ongoing: 0,
      rescheduled: 0
    }));

    appointments.forEach(apt => {
      const aptDate = new Date(apt.appointmentDateTime);
      if (aptDate.getFullYear() === currentYear) {
        const month = aptDate.getMonth();
        if (apt.status === 'COMPLETED') {
          monthlyData[month].completed++;
        } else if (apt.status === 'BOOKED') {
          monthlyData[month].ongoing++;
        } else if (apt.status === 'RESCHEDULED') {
          monthlyData[month].rescheduled++;
        }
      }
    });

    setMonthlyStats(monthlyData);
  };

  const fetchAppointmentsForDate = async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await appointmentAPI.getAll({ date: dateStr });
      const appointments = response.data || [];
      setSelectedDateAppointments(appointments.filter(apt => apt.status !== 'CANCELED'));
    } catch (err) {
      console.error('Error fetching appointments for date:', err);
    }
  };

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
    switch(status?.toUpperCase()) {
      case 'BOOKED': return 'status-confirmed';
      case 'CANCELED': return 'status-cancelled';
      case 'COMPLETED': return 'status-checked';
      case 'RESCHEDULED': return 'status-schedule';
      default: return '';
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setShowAllAppointments(true);
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const getMaxValue = () => {
    const max = Math.max(...monthlyStats.map(m => 
      m.completed + m.ongoing + m.rescheduled
    ));
    return Math.max(max, 10);
  };

  // Patient Access Denied Screen
  if (userRole === 'PATIENT') {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <Header />
          <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f8bdffff 0%, #764ba2 100%)',
              borderRadius: '20px',
              padding: '50px',
              maxWidth: '600px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
              textAlign: 'center',
              color: 'white',
              animation: 'slideIn 0.5s ease-out'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 30px',
                backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}>
                <AiOutlineLock size={50} style={{ color: 'white' }} />
              </div>
              
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
              }}>
                Access Restricted
              </h1>
              
              <p style={{
                fontSize: '18px',
                lineHeight: '1.6',
                marginBottom: '30px',
                opacity: '0.95'
              }}>
                Sorry! This dashboard is only accessible to administrators and staff members. As a patient, you don't have permission to view this page.
              </p>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <p style={{
                  fontSize: '16px',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  💡 Tip: You can book appointments and view your medical history from your patient portal.
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => window.location.href = '/appointments'}
                  style={{
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                  }}
                >
                  View My Appointments
                </button>
                
                <button 
                  onClick={() => window.location.href = '/book-appointment'}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid white',
                    padding: '15px 30px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#667eea';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Book New Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <Header />
          <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', color: '#666' }}>Loading dashboard data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <Header />
          <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div style={{ textAlign: 'center', color: '#ef4444' }}>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>{error}</div>
              <button 
                onClick={fetchDashboardData}
                style={{ padding: '10px 20px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="stat-trend positive">
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
                  {(() => {
                    const maxVal = getMaxValue();
                    const step = Math.ceil(maxVal / 5);
                    return [5, 4, 3, 2, 1, 0].map(i => (
                      <span key={i}>{i * step}</span>
                    ));
                  })()}
                </div>
                <div className="chart-bars">
                  {monthlyStats.map((data, i) => {
                    const maxVal = getMaxValue();
                    const total = data.completed + data.ongoing + data.rescheduled;
                    const completedHeight = maxVal > 0 ? (data.completed / maxVal) * 100 : 0;
                    const ongoingHeight = maxVal > 0 ? (data.ongoing / maxVal) * 100 : 0;
                    const rescheduledHeight = maxVal > 0 ? (data.rescheduled / maxVal) * 100 : 0;

                    return (
                      <div key={i} className="bar-group">
                        <div className="bar-stack">
                          {completedHeight > 0 && (
                            <div className="bar completed" style={{ height: `${completedHeight}%` }}></div>
                          )}
                          {ongoingHeight > 0 && (
                            <div className="bar ongoing" style={{ height: `${ongoingHeight}%` }}></div>
                          )}
                          {rescheduledHeight > 0 && (
                            <div className="bar rescheduled" style={{ height: `${rescheduledHeight}%` }}></div>
                          )}
                        </div>
                        <span className="bar-label">{monthNames[i].slice(0, 3)}</span>
                      </div>
                    );
                  })}
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
                    <button onClick={() => {
                      const newDate = new Date(currentMonth);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCurrentMonth(newDate);
                    }}>
                      <AiOutlineLeft />
                    </button>
                    <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                    <button onClick={() => {
                      const newDate = new Date(currentMonth);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setCurrentMonth(newDate);
                    }}>
                      <AiOutlineRight />
                    </button>
                  </div>

                  <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="calendar-day-header">{day}</div>
                    ))}
                    {calendar.map((day, i) => (
                      <div 
                        key={i} 
                        className={`calendar-day ${isToday(day) ? 'selected' : ''} ${!day ? 'empty' : ''}`}
                        onClick={() => handleDateClick(day)}
                        style={{ cursor: day ? 'pointer' : 'default' }}
                      >
                        {day || ''}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="upcoming-appointments">
                  {showAllAppointments ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0 }}>
                          Appointments for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </h4>
                        <button 
                          onClick={() => setShowAllAppointments(false)}
                          style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '14px' }}
                        >
                          Back
                        </button>
                      </div>
                      {selectedDateAppointments.length > 0 ? (
                        selectedDateAppointments.map((apt, i) => (
                          <div key={i} className="appointment-item">
                            <div className="appointment-avatar">
                              <img 
                                src={getImageUrl(apt.doctor?.imageUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.name || 'Doctor')}&background=random`} 
                                alt={apt.doctor?.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.name || 'Doctor')}&background=random`;
                                }}
                              />
                            </div>
                            <div className="appointment-details">
                              <p className="appointment-type">{apt.doctor?.name} - {apt.doctor?.specialization}</p>
                              <p className="appointment-time">{formatTime(apt.appointmentDateTime)}</p>
                              <p className="appointment-time" style={{ fontSize: '12px', color: '#666' }}>
                                Patient: {apt.patient?.name}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          No appointments for this date
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h4 style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>Today's Upcoming</h4>
                      {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((apt, i) => (
                          <div key={i} className="appointment-item">
                            <div className="appointment-avatar">
                              <img 
                                src={getImageUrl(apt.doctor?.imageUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.name || 'Doctor')}&background=random`} 
                                alt={apt.doctor?.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.name || 'Doctor')}&background=random`;
                                }}
                              />
                            </div>
                            <div className="appointment-details">
                              <p className="appointment-type">{apt.doctor?.name} - {apt.doctor?.specialization}</p>
                              <p className="appointment-time">{formatDateTime(apt.appointmentDateTime)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          No appointments today
                        </div>
                      )}
                    </>
                  )}
                </div>

                <button 
                  className="view-all-btn"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setShowAllAppointments(true);
                  }}
                >
                  View All Appointments
                </button>
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
              {popularDoctors.length > 0 ? (
                popularDoctors.map((doctor, i) => (
                  <div key={i} className="doctor-card">
                    <img 
                      src={getImageUrl(doctor.imageUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`} 
                      alt={doctor.name}
                      className="doctor-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`;
                      }}
                    />
                    <h4>{doctor.name}</h4>
                    <p className="doctor-specialty">{doctor.specialization}</p>
                    <p className="doctor-bookings"><strong>{doctor.bookings}</strong> Bookings</p>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                  No doctors available
                </div>
              )}
            </div>
          </div>

          {/* All Appointments Table */}
          <div className="dashboard-card appointments-table">
            <div className="card-header">
              <h2>Recent Appointments</h2>
              <button className="view-all-link" onClick={() => window.location.href = '/appointments'}>
                View All
              </button>
            </div>

            {allAppointments.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allAppointments.map((apt, i) => (
                    <tr key={i}>
                      <td>
                        <div className="doctor-info">
                          <img 
                            src={getImageUrl(apt.doctor?.imageUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.name || 'Doctor')}&background=4F46E5&color=fff`}
                            alt={apt.doctor?.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.name || 'Doctor')}&background=4F46E5&color=fff`;
                            }}
                          />
                          <div>
                            <p className="doctor-name">{apt.doctor?.name || 'N/A'}</p>
                            <p className="doctor-spec">{apt.doctor?.specialization || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="patient-info">
                          <img 
                            src={getImageUrl(apt.patient?.imageUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient?.name || 'Patient')}&background=random`}
                            alt={apt.patient?.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient?.name || 'Patient')}&background=random`;
                            }}
                          />
                          <div>
                            <p className="patient-name">{apt.patient?.name || 'N/A'}</p>
                            <p className="patient-phone">{apt.patient?.phone || apt.patient?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="date-time">{formatDateTime(apt.appointmentDateTime)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(apt.status)}`}>
                          {apt.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No appointments found
              </div>
            )}
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