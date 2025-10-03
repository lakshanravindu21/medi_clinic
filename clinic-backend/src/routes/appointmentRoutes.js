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

// All appointment routes require authentication
router.use(protect);

router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.post('/', validateAppointment, createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;