const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Role-based access control with ownership verification
 * @param {Array} allowedRoles - List of roles allowed to access the route
 */
const roleCheck = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized. No user information found.'
        });
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Only ${allowedRoles.join(', ')} can perform this action.`
        });
      }

      // Ownership verification for routes with :id parameter
      if (req.params.id) {
        const appointment = await prisma.appointment.findUnique({
          where: { id: req.params.id },
          select: { patientId: true, doctorId: true, status: true }
        });

        if (!appointment) {
          return res.status(404).json({
            success: false,
            message: 'Appointment not found'
          });
        }

        // Patient can only access their own appointments
        if (user.role === 'PATIENT' && appointment.patientId !== user.id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only manage your own appointments.'
          });
        }

        // Doctor can only access their assigned appointments
        if (user.role === 'DOCTOR' && appointment.doctorId !== user.id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only view or modify your assigned appointments.'
          });
        }
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during role validation'
      });
    }
  };
};

module.exports = { roleCheck };