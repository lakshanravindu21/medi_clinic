const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const { status, doctorId, date } = req.query;

    // Build filter object
    const where = {};

    // If user is a patient, only show their appointments
    if (req.user.role === 'PATIENT') {
      where.patientId = req.user.id;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by doctor
    if (doctorId) {
      where.doctorId = doctorId;
    }

    // Filter by date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      where.appointmentDateTime = {
        gte: startDate,
        lt: endDate
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        appointmentDateTime: 'desc'
      }
    });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            imageUrl: true,
            phone: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    if (req.user.role === 'PATIENT' && appointment.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDateTime, reason, symptoms } = req.body;

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if time slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDateTime: new Date(appointmentDateTime),
        status: {
          in: ['BOOKED', 'RESCHEDULED']
        }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId,
        appointmentDateTime: new Date(appointmentDateTime),
        reason: reason || null,
        symptoms: symptoms || null,
        status: 'BOOKED'
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { appointmentDateTime, reason, symptoms, status, notes } = req.body;

    // Get existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'PATIENT' && existingAppointment.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Prepare update data
    const updateData = {};

    if (appointmentDateTime) {
      // Check if new time slot is available
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId: existingAppointment.doctorId,
          appointmentDateTime: new Date(appointmentDateTime),
          status: {
            in: ['BOOKED', 'RESCHEDULED']
          },
          NOT: {
            id: id
          }
        }
      });

      if (conflictingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked'
        });
      }

      updateData.appointmentDateTime = new Date(appointmentDateTime);
      updateData.status = 'RESCHEDULED';
    }

    if (reason !== undefined) updateData.reason = reason;
    if (symptoms !== undefined) updateData.symptoms = symptoms;
    if (notes !== undefined && req.user.role === 'ADMIN') updateData.notes = notes;
    if (status !== undefined && req.user.role === 'ADMIN') updateData.status = status;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            name: true,
            email: true
          }
        },
        doctor: {
          select: {
            name: true,
            specialization: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role === 'PATIENT' && existingAppointment.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    // Update status to CANCELED instead of deleting
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELED' }
    });

    res.json({
      success: true,
      message: 'Appointment canceled successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment
};