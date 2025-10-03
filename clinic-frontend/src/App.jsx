import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* TODO: Add more routes */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route path="/doctors" element={<Doctors />} /> */}
          {/* <Route path="/appointments" element={<Appointments />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;