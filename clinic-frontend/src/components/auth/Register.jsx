import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineUser, AiOutlineMail, AiOutlineLock, AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai';
import doctorImage from '../../assets/doctor.jpg';
import '../../styles/auth.css';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('❌ Passwords do not match!');
      return;
    }

    if (!agreeToTerms) {
      setError('⚠️ Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const { authAPI } = await import('../../utils/api');
      const response = await authAPI.register({ 
        name: fullName, 
        email, 
        password 
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setSuccess('✅ Registration successful! Redirecting...');
      
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message || '❌ Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container small-auth"> 
      <div className="auth-left">
        <img src={doctorImage} alt="Doctor" className="auth-image" />
      </div>
      
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h1 className="auth-title">Register</h1>
          <p className="auth-subtitle">Please enter your details to create account</p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <div className="input-wrapper">
                <AiOutlineUser className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  placeholder="Enter Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <AiOutlineMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <AiOutlineLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="************"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <AiOutlineLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="************"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
              </div>
            </div>

            <div className="terms-wrapper">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                I agree to the <Link to="/terms">Terms of Service</Link> & <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="auth-footer">
              Already have an account yet? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>

        <footer className="auth-copyright">
          Copyright @2025 - Fuchsius
        </footer>
      </div>
    </div>
  );
};

export default Register;
