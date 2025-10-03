import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineMail } from 'react-icons/ai';
import doctorImage from '../../assets/doctor.jpg';
import '../../styles/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { authAPI } = await import('../../utils/api');
      await authAPI.forgotPassword(email);
      setSuccess(true);
      
      // Redirect to OTP page after 2 seconds
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={doctorImage} alt="Doctor" className="auth-image" />
      </div>
      
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">No worries, we'll send you reset instructions</p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {success && (
              <div className="success-message">
                Password reset instructions have been sent to your email!
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
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

            <button type="submit" className="auth-button" disabled={loading || success}>
              {loading ? 'Sending...' : success ? 'Email Sent' : 'Submit'}
            </button>

            <p className="auth-footer">
              Return to <Link to="/login">Login</Link>
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

export default ForgotPassword;