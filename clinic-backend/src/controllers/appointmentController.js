const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient();

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const { status, doctorId, date } = req.query;
    const where = {};

    // Role-based filtering
    if (req.user.role === 'PATIENT') {
      where.patientId = req.user.id;
    } else if (req.user.role === 'DOCTOR') {
      where.doctorId = req.user.id;
    }

    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.appointmentDateTime = { gte: startDate, lt: endDate };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true }
        },
        doctor: {
          select: { id: true, name: true, specialization: true, imageUrl: true }
        }
      },
      orderBy: { appointmentDateTime: 'desc' }
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
          select: { id: true, name: true, email: true, phone: true }
        },
        doctor: {
          select: { id: true, name: true, specialization: true, imageUrl: true, phone: true }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
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

    // Validate appointment is in the future
    const appointmentDate = new Date(appointmentDateTime);
    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Check if time slot is already booked
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDateTime: appointmentDate,
        status: { in: ['BOOKED', 'RESCHEDULED'] }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId,
        appointmentDateTime: appointmentDate,
        reason: reason || null,
        symptoms: symptoms || null,
        status: 'BOOKED'
      },
      include: {
        doctor: {
          select: { name: true, specialization: true }
        },
        patient: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
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

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment is already cancelled
    if (existingAppointment.status === 'CANCELED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a cancelled appointment'
      });
    }

    const updateData = {};

    // Handle rescheduling
    if (appointmentDateTime) {
      const newDateTime = new Date(appointmentDateTime);
      
      // Validate future date
      if (newDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Appointment date must be in the future'
        });
      }

      // Check for conflicts
      const conflicting = await prisma.appointment.findFirst({
        where: {
          doctorId: existingAppointment.doctorId,
          appointmentDateTime: newDateTime,
          status: { in: ['BOOKED', 'RESCHEDULED'] },
          NOT: { id }
        }
      });

      if (conflicting) {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked. Please choose another time.'
        });
      }

      updateData.appointmentDateTime = newDateTime;
      updateData.status = 'RESCHEDULED';
    }

    if (reason !== undefined) updateData.reason = reason;
    if (symptoms !== undefined) updateData.symptoms = symptoms;
    
    // Only admin can update notes and status directly
    if (req.user.role === 'ADMIN') {
      if (notes !== undefined) updateData.notes = notes;
      if (status !== undefined) updateData.status = status;
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, specialization: true } }
      }
    });

    res.json({
      success: true,
      message: appointmentDateTime 
        ? 'Appointment rescheduled successfully!' 
        : 'Appointment updated successfully!',
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

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if already cancelled
    if (existingAppointment.status === 'CANCELED') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is already cancelled'
      });
    }

    // Update status to CANCELED instead of deleting
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELED' }
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
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