const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateDoctor } = require('../middleware/validation');

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctor);

// Protected routes (Admin only)
router.post('/', protect, adminOnly, validateDoctor, createDoctor);
router.put('/:id', protect, adminOnly, validateDoctor, updateDoctor);
router.delete('/:id', protect, adminOnly, deleteDoctor);

module.exports = router;