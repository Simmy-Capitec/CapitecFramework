const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');

/**
 * ANIMAL SANCTUARY MANAGEMENT API SERVER
 * 
 * This Express.js server provides REST API endpoints for managing:
 * - Animals and their care
 * - Adoption processes
 * - Volunteer management
 * - Donation tracking
 * - Staff operations
 * 
 * Designed for test automation training with comprehensive endpoints
 * for frontend, API, and database integration testing.
 */

const app = express();
const PORT = process.env.PORT || 3001;

// ===================================================================
// MIDDLEWARE CONFIGURATION
// ===================================================================

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Request logging middleware for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ===================================================================
// API ROUTES
// ===================================================================

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbHealthy = await testConnection();
        const status = dbHealthy ? 'healthy' : 'unhealthy';
        const statusCode = dbHealthy ? 200 : 503;
        
        res.status(statusCode).json({
            status,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API information endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Animal Sanctuary Management API',
        version: '1.0.0',
        description: 'REST API for managing animal sanctuary operations',
        endpoints: {
            animals: '/api/animals',
            adopters: '/api/adopters',
            applications: '/api/applications',
            adoptions: '/api/adoptions',
            volunteers: '/api/volunteers',
            donations: '/api/donations',
            staff: '/api/staff',
            medical: '/api/medical',
            habitats: '/api/habitats',
            reports: '/api/reports'
        },
        documentation: '/api/docs',
        health: '/health'
    });
});

// Import and use route modules
const animalRoutes = require('./routes/animals');
const adopterRoutes = require('./routes/adopters');
const applicationRoutes = require('./routes/applications');
const adoptionRoutes = require('./routes/adoptions');
const volunteerRoutes = require('./routes/volunteers');
const donationRoutes = require('./routes/donations');
const staffRoutes = require('./routes/staff');
const medicalRoutes = require('./routes/medical');
const habitatRoutes = require('./routes/habitats');
const reportRoutes = require('./routes/reports');

app.use('/api/animals', animalRoutes);
app.use('/api/adopters', adopterRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/habitats', habitatRoutes);
app.use('/api/reports', reportRoutes);

// ===================================================================
// ERROR HANDLING MIDDLEWARE
// ===================================================================

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.originalUrl} does not exist`,
        availableEndpoints: '/api'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.message
        });
    }
    
    // MySQL duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'Duplicate Entry',
            message: 'A record with this information already exists'
        });
    }
    
    // MySQL foreign key constraint error
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            error: 'Invalid Reference',
            message: 'Referenced record does not exist'
        });
    }
    
    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid Token',
            message: 'Authentication token is invalid'
        });
    }
    
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token Expired',
            message: 'Authentication token has expired'
        });
    }
    
    // Default error response
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.name || 'Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// ===================================================================
// SERVER STARTUP
// ===================================================================

async function startServer() {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Server not started.');
            process.exit(1);
        }
        
        // Start server
        const server = app.listen(PORT, () => {
            console.log('🚀 Animal Sanctuary API Server Started');
            console.log(`📍 Port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
            console.log(`📚 API Info: http://localhost:${PORT}/api`);
            console.log('='.repeat(50));
        });
        
        // Graceful shutdown handling
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });
        
        process.on('SIGINT', () => {
            console.log('SIGINT received, shutting down gracefully');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });
        
        return server;
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start server if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = app;