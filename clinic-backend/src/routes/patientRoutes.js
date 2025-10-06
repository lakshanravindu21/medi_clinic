const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  uploadImage
} = require('../controllers/patientController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes require authentication and admin privileges
router.use(protect, adminOnly);

router.post('/upload-image', uploadImage);
router.get('/', getPatients);
router.get('/:id', getPatient);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

module.exports = router;