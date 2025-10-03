import { useNavigate } from 'react-router-dom';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import doctorImage from '../../assets/doctor.jpg';
import '../../styles/auth.css';

const ResetSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="small-auth">
        <div className="auth-left">
          <img src={doctorImage} alt="Doctor" className="auth-image" />
        </div>

        <div className="auth-right">
          <div className="auth-form-wrapper">
            <div className="success-icon-wrapper">
              <AiOutlineCheckCircle className="success-icon" />
            </div>
            
            <h1 className="auth-title">Success</h1>
            <p className="auth-subtitle success-subtitle">
              Your new password has been successfully saved.
            </p>

            <button 
              onClick={() => navigate('/login')} 
              className="auth-button"
            >
              Back to Login
            </button>
          </div>

          <footer className="auth-copyright">
            Copyright @2025 - Fuchsius
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ResetSuccess;
