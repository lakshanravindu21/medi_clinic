// Validation middleware for request data

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation (min 6 characters)
const passwordRegex = /^.{6,}$/;

// Validate registration data
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = [];

  // Check required fields
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || !passwordRegex.test(password)) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate login data
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate appointment data
const validateAppointment = (req, res, next) => {
  const { doctorId, appointmentDateTime, reason } = req.body;

  const errors = [];

  if (!doctorId) {
    errors.push('Doctor ID is required');
  }

  if (!appointmentDateTime) {
    errors.push('Appointment date and time is required');
  } else {
    const appointmentDate = new Date(appointmentDateTime);
    if (isNaN(appointmentDate.getTime())) {
      errors.push('Invalid date format');
    } else if (appointmentDate < new Date()) {
      errors.push('Appointment date cannot be in the past');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate doctor data
const validateDoctor = (req, res, next) => {
  const { name, email, specialization } = req.body;

  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }

  if (!specialization || specialization.trim().length === 0) {
    errors.push('Specialization is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateAppointment,
  validateDoctor
};