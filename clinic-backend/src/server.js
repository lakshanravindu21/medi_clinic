const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // ✅ Added multer
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const patientRoutes = require('./routes/patientRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Ensure uploads/doctors folder exists
const uploadsDir = path.join(__dirname, 'uploads');
const doctorUploadsDir = path.join(uploadsDir, 'doctors');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(doctorUploadsDir)) {
  fs.mkdirSync(doctorUploadsDir, { recursive: true });
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Clinic API is running',
    timestamp: new Date().toISOString()
  });
});

//
// ===============================
// ✅ Multer setup for file uploads
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/doctors/'); // Save in 'uploads/doctors' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage });

// ✅ Upload route (relative path for frontend)
app.post('/api/doctors/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Relative path works directly in frontend
  const imageUrl = `/uploads/doctors/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    imageUrl, // <-- store this in DB when creating doctor
  });
});

//
// ===============================
// API Routes
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🏥 Clinic Appointment Booking System       ║
║   Server running on port ${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
║   API: http://localhost:${PORT}/api           ║
╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
