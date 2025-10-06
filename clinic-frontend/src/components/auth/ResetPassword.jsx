import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineLock, AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai';
import doctorImage from '../../assets/doctor.jpg';
import '../../styles/auth.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !otp) {
      navigate('/forgot-password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { authAPI } = await import('../../utils/api');
      await authAPI.resetPassword({ email, otp, newPassword });
      navigate('/reset-success');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="small-auth">
        <div className="auth-left">
          <img src={doctorImage} alt="Doctor" className="auth-image" />
        </div>

        <div className="auth-right">
          <div className="auth-form-wrapper">
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">Please enter your new password</p>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-wrapper">
                  <AiOutlineLock className="input-icon" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <AiOutlineLock className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="Confirm new password"
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

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>

          <footer className="auth-copyright">
            Copyright @2025 - Fuchsius
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

