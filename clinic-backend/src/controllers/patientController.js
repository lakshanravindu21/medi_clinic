const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Admin
const getPatients = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    // Build filter
    const where = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        primaryDoctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        primaryDoctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private/Admin
const createPatient = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      primaryDoctorId,
      dob,
      gender,
      bloodGroup,
      status,
      address1,
      address2,
      country,
      city,
      state,
      pincode,
      imageUrl
    } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user first (for authentication)
    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('patient123', 10);

    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: defaultPassword,
        phone,
        role: 'PATIENT'
      }
    });

    // Create patient profile
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phone,
        email,
        primaryDoctorId: primaryDoctorId || null,
        dob: dob ? new Date(dob) : null,
        gender,
        bloodGroup,
        status: status || 'Active',
        address1,
        address2,
        country,
        city,
        state,
        pincode,
        imageUrl: imageUrl || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        primaryDoctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private/Admin
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Convert dob to Date if provided
    if (updateData.dob) {
      updateData.dob = new Date(updateData.dob);
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        primaryDoctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private/Admin
const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Delete patient (will also delete user due to cascade)
    await prisma.patient.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const uploadImage = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }

    // Validate base64 image format
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format'
      });
    }

    // In development, we return the base64 string directly
    // In production, you would upload to cloud storage (Cloudinary, S3, etc.)
    res.json({
      success: true,
      imageUrl: image  // Return the base64 string as imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  uploadImage
};