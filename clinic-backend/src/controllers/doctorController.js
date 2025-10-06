const { PrismaClient } = require('@prisma/client');  
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Create uploads/doctors directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'doctors');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fileName = `doctor-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, fileName);
  }
});
const upload = multer({ storage });

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;
    const where = {};

    if (specialization) {
      where.specialization = {
        contains: specialization,
        mode: 'insensitive'
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } }
      ];
    }

    const doctors = await prisma.doctor.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        appointments: {
          where: {
            status: 'BOOKED',
            appointmentDateTime: {
              gte: new Date()
            }
          },
          select: {
            appointmentDateTime: true
          }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new doctor with optional image upload
// @route   POST /api/doctors
// @access  Private/Admin
const createDoctor = async (req, res, next) => {
  try {
    let imageUrl = null;

    // Handle file upload if present
    if (req.file) {
      imageUrl = `/uploads/doctors/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const { 
      name, 
      email, 
      specialization, 
      department,
      designation,
      description, 
      bio,
      phone, 
      dob,
      yearOfExperience,
      medicalLicense,
      languagesSpoken,
      bloodGroup,
      gender,
      address1,
      address2,
      country,
      city,
      state,
      pincode,
      availability 
    } = req.body;

    // Check if email already exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { email }
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email already exists'
      });
    }

    const doctor = await prisma.doctor.create({
      data: {
        name,
        email,
        specialization,
        department: department || null,
        designation: designation || null,
        description: description || null,
        bio: bio || null,
        imageUrl, // store uploaded image path or fallback
        phone: phone || null,
        dob: dob ? new Date(dob) : null,
        yearOfExperience: yearOfExperience ? parseInt(yearOfExperience) : null,
        medicalLicense: medicalLicense || null,
        languagesSpoken: languagesSpoken || null,
        bloodGroup: bloodGroup || null,
        gender: gender || null,
        address1: address1 || null,
        address2: address2 || null,
        country: country || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        availability: availability || '{}'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin
const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if doctor exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id }
    });

    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Convert dob to Date if provided
    if (updateData.dob) {
      updateData.dob = new Date(updateData.dob);
    }

    // Convert yearOfExperience to number if provided
    if (updateData.yearOfExperience) {
      updateData.yearOfExperience = parseInt(updateData.yearOfExperience);
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id }
    });

    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Delete image file if exists
    if (existingDoctor.imageUrl && existingDoctor.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', existingDoctor.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.doctor.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload doctor image (optional base64 fallback)
// @route   POST /api/doctors/upload-image
// @access  Private/Admin
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

    // Extract base64 data and file extension
    const matches = image.match(/^data:image\/([a-zA-Z]*);base64,([^"]*)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image data'
      });
    }

    const imageType = matches[1];
    const base64Data = matches[2];
    
    // Generate unique filename
    const fileName = `doctor-${Date.now()}-${Math.round(Math.random() * 1E9)}.${imageType}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert base64 to buffer and save
    const imageBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, imageBuffer);

    // Return URL path
    const imageUrl = `/uploads/doctors/${fileName}`;
    
    res.json({
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

module.exports = {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  uploadImage,
  upload // <-- export multer middleware
};
