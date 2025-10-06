const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validation');
const { roleCheck } = require('../middleware/roleCheck');

// All appointment routes require authentication
router.use(protect);

// Get all appointments (filtered by role)
router.get('/', getAppointments);

// Get single appointment
router.get('/:id', roleCheck(['ADMIN', 'DOCTOR', 'PATIENT']), getAppointment);

// Create appointment (patients only)
router.post('/', roleCheck(['PATIENT']), validateAppointment, createAppointment);

// Update/reschedule appointment
router.put('/:id', roleCheck(['PATIENT', 'DOCTOR', 'ADMIN']), updateAppointment);

// Cancel appointment
router.delete('/:id', roleCheck(['PATIENT', 'ADMIN']), cancelAppointment);

module.exports = router;