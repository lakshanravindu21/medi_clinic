import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import doctorImage from '../../assets/doctor.jpg';
import '../../styles/auth.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(45);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleResend = async () => {
    try {
      const { authAPI } = await import('../../utils/api');
      await authAPI.forgotPassword(email);
      setTimer(45);
      setError('');
    } catch (err) {
      setError('Failed to resend code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 4) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { authAPI } = await import('../../utils/api');
      await authAPI.verifyOTP({ email, otp: otpCode });
      navigate('/reset-password', { state: { email, otp: otpCode } });
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={doctorImage} alt="Doctor" className="auth-image" />
      </div>

      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h1 className="auth-title">Email OTP Verification</h1>
          <p className="auth-subtitle">We sent a code to {email}</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="otp-footer">
              <span className="otp-text">
                Didn't receive code.{' '}
                {timer > 0 ? (
                  <span className="otp-timer">{formatTime(timer)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="otp-resend"
                  >
                    Resend Code
                  </button>
                )}
              </span>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Proceed'}
            </button>
          </form>
        </div>

        <footer className="auth-copyright">
          Copyright @2025 - Fuchsius
        </footer>
      </div>
    </div>
  );
};

export default OTPVerification;