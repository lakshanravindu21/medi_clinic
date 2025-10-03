const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../utils/jwt');

const prisma = new PrismaClient();

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token'
    });
  }
};

// Check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Check if user is admin or doctor
const adminOrDoctor = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'DOCTOR')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Doctor privileges required.'
    });
  }
};

module.exports = {
  protect,
  adminOnly,
  adminOrDoctor
};