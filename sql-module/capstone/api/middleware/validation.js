const Joi = require('joi');

/**
 * VALIDATION MIDDLEWARE
 * 
 * This module provides comprehensive validation for all API endpoints
 * using Joi schemas. Each validation function ensures data integrity
 * and provides clear error messages for testing scenarios.
 */

// ===================================================================
// ANIMAL VALIDATION SCHEMAS
// ===================================================================

const animalSchema = Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
        'string.empty': 'Animal name is required',
        'string.max': 'Animal name must be less than 100 characters'
    }),
    species: Joi.string().min(1).max(50).required().messages({
        'string.empty': 'Species is required',
        'string.max': 'Species must be less than 50 characters'
    }),
    breed: Joi.string().max(100).allow('', null).messages({
        'string.max': 'Breed must be less than 100 characters'
    }),
    age: Joi.number().integer().min(0).max(50).allow(null).messages({
        'number.min': 'Age cannot be negative',
        'number.max': 'Age cannot exceed 50 years'
    }),
    weight_kg: Joi.number().positive().max(10000).allow(null).messages({
        'number.positive': 'Weight must be positive',
        'number.max': 'Weight cannot exceed 10,000 kg'
    }),
    gender: Joi.string().valid('Male', 'Female', 'Unknown').default('Unknown').messages({
        'any.only': 'Gender must be Male, Female, or Unknown'
    }),
    color: Joi.string().max(100).allow('', null).messages({
        'string.max': 'Color description must be less than 100 characters'
    }),
    source: Joi.string().max(100).allow('', null).messages({
        'string.max': 'Source must be less than 100 characters'
    }),
    habitat_id: Joi.number().integer().positive().allow(null).messages({
        'number.positive': 'Habitat ID must be positive'
    }),
    dietary_requirements: Joi.string().allow('', null),
    behavioral_notes: Joi.string().allow('', null),
    special_needs: Joi.string().allow('', null),
    microchip_number: Joi.string().max(50).allow('', null).messages({
        'string.max': 'Microchip number must be less than 50 characters'
    }),
    adoption_fee: Joi.number().min(0).max(10000).default(0).messages({
        'number.min': 'Adoption fee cannot be negative',
        'number.max': 'Adoption fee cannot exceed $10,000'
    })
});

const animalUpdateSchema = animalSchema.fork(
    ['name', 'species'], 
    (schema) => schema.optional()
).append({
    adoption_status: Joi.string().valid('Available', 'Pending', 'Adopted', 'Not Available', 'Medical Hold').messages({
        'any.only': 'Invalid adoption status'
    })
});

// ===================================================================
// ADOPTER VALIDATION SCHEMAS
// ===================================================================

const adopterSchema = Joi.object({
    first_name: Joi.string().min(1).max(50).required().messages({
        'string.empty': 'First name is required',
        'string.max': 'First name must be less than 50 characters'
    }),
    last_name: Joi.string().min(1).max(50).required().messages({
        'string.empty': 'Last name is required',
        'string.max': 'Last name must be less than 50 characters'
    }),
    email: Joi.string().email().max(100).required().messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
    }),
    phone: Joi.string().pattern(/^[\d\s\-\+\(\)\.]+$/).min(10).max(20).required().messages({
        'string.pattern.base': 'Please provide a valid phone number',
        'string.min': 'Phone number must be at least 10 digits',
        'string.empty': 'Phone number is required'
    }),
    address: Joi.string().min(5).max(500).required().messages({
        'string.min': 'Address must be at least 5 characters',
        'string.empty': 'Address is required'
    }),
    city: Joi.string().min(1).max(50).required().messages({
        'string.empty': 'City is required'
    }),
    state: Joi.string().min(2).max(50).required().messages({
        'string.min': 'State must be at least 2 characters',
        'string.empty': 'State is required'
    }),
    zip_code: Joi.string().pattern(/^[\d\-\s]+$/).min(5).max(10).required().messages({
        'string.pattern.base': 'Please provide a valid zip code',
        'string.empty': 'Zip code is required'
    }),
    date_of_birth: Joi.date().max('now').min('1900-01-01').allow(null).messages({
        'date.max': 'Date of birth cannot be in the future',
        'date.min': 'Date of birth cannot be before 1900'
    }),
    occupation: Joi.string().max(100).allow('', null),
    housing_type: Joi.string().valid('House', 'Apartment', 'Condo', 'Other').required().messages({
        'any.only': 'Housing type must be House, Apartment, Condo, or Other',
        'string.empty': 'Housing type is required'
    }),
    housing_owned: Joi.boolean().required().messages({
        'boolean.base': 'Please specify if you own or rent your housing'
    }),
    has_yard: Joi.boolean().default(false),
    yard_fenced: Joi.boolean().default(false),
    has_other_pets: Joi.boolean().default(false),
    other_pets_details: Joi.string().allow('', null),
    previous_pet_experience: Joi.string().allow('', null),
    household_members: Joi.array().items(Joi.object()).allow(null),
    veterinarian_info: Joi.object().allow(null),
    references: Joi.array().items(Joi.object()).allow(null)
});

// ===================================================================
// APPLICATION VALIDATION SCHEMAS
// ===================================================================

const applicationSchema = Joi.object({
    adopter_id: Joi.number().integer().positive().required().messages({
        'number.positive': 'Valid adopter ID is required'
    }),
    animal_id: Joi.number().integer().positive().required().messages({
        'number.positive': 'Valid animal ID is required'
    }),
    preferred_adoption_date: Joi.date().min('now').allow(null).messages({
        'date.min': 'Preferred adoption date cannot be in the past'
    }),
    reason_for_adoption: Joi.string().min(10).max(1000).required().messages({
        'string.min': 'Please provide at least 10 characters explaining why you want to adopt',
        'string.empty': 'Reason for adoption is required'
    }),
    lifestyle_info: Joi.string().max(1000).allow('', null),
    work_schedule: Joi.string().max(500).allow('', null),
    travel_frequency: Joi.string().max(100).allow('', null),
    plan_for_pet_care: Joi.string().max(1000).allow('', null),
    monthly_budget: Joi.number().min(0).max(10000).allow(null).messages({
        'number.min': 'Monthly budget cannot be negative'
    }),
    special_requests: Joi.string().max(500).allow('', null)
});

// ===================================================================
// VOLUNTEER VALIDATION SCHEMAS
// ===================================================================

const volunteerSchema = Joi.object({
    first_name: Joi.string().min(1).max(50).required(),
    last_name: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().max(100).required(),
    phone: Joi.string().pattern(/^[\d\s\-\+\(\)\.]+$/).min(10).max(20).required(),
    address: Joi.string().max(500).allow('', null),
    city: Joi.string().max(50).allow('', null),
    state: Joi.string().max(50).allow('', null),
    zip_code: Joi.string().max(10).allow('', null),
    date_of_birth: Joi.date().max('now').min('1900-01-01').allow(null),
    emergency_contact: Joi.object().allow(null),
    skills: Joi.array().items(Joi.string()).allow(null),
    availability: Joi.object().allow(null)
});

// ===================================================================
// DONATION VALIDATION SCHEMAS
// ===================================================================

const donationSchema = Joi.object({
    donor_id: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().max(1000000).required().messages({
        'number.positive': 'Donation amount must be positive',
        'number.max': 'Donation amount cannot exceed $1,000,000'
    }),
    donation_type: Joi.string().valid('One-time', 'Monthly', 'Annual', 'Memorial', 'Honor').default('One-time'),
    payment_method: Joi.string().valid('Credit Card', 'Check', 'Cash', 'Bank Transfer', 'PayPal', 'Other').required(),
    purpose: Joi.string().valid('General Fund', 'Medical Care', 'Food', 'Facility Maintenance', 'Emergency Fund', 'Specific Animal').default('General Fund'),
    specific_animal_id: Joi.number().integer().positive().allow(null),
    memorial_info: Joi.object().allow(null),
    campaign_source: Joi.string().max(100).allow('', null)
});

// ===================================================================
// MEDICAL RECORD VALIDATION SCHEMAS
// ===================================================================

const medicalRecordSchema = Joi.object({
    animal_id: Joi.number().integer().positive().required(),
    staff_id: Joi.number().integer().positive().required(),
    visit_date: Joi.date().max('now').required(),
    visit_type: Joi.string().valid('Checkup', 'Vaccination', 'Treatment', 'Surgery', 'Emergency').required(),
    diagnosis: Joi.string().allow('', null),
    treatment: Joi.string().allow('', null),
    medication: Joi.string().max(200).allow('', null),
    dosage: Joi.string().max(100).allow('', null),
    next_visit_date: Joi.date().min('now').allow(null),
    cost: Joi.number().min(0).max(50000).default(0),
    notes: Joi.string().allow('', null)
});

// ===================================================================
// VALIDATION MIDDLEWARE FUNCTIONS
// ===================================================================

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Source of data ('body', 'query', 'params')
 */
function validate(schema, source = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Please check the provided data',
                details: errors
            });
        }

        req[source] = value;
        next();
    };
}

// ===================================================================
// SPECIFIC VALIDATION MIDDLEWARE
// ===================================================================

const validateAnimal = validate(animalSchema);
const validateAnimalUpdate = validate(animalUpdateSchema);
const validateAdopter = validate(adopterSchema);
const validateApplication = validate(applicationSchema);
const validateVolunteer = validate(volunteerSchema);
const validateDonation = validate(donationSchema);
const validateMedicalRecord = validate(medicalRecordSchema);

// ===================================================================
// CUSTOM VALIDATION FUNCTIONS
// ===================================================================

/**
 * Validate pagination parameters
 */
function validatePagination(req, res, next) {
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
            success: false,
            error: 'Invalid page parameter',
            message: 'Page must be a positive integer'
        });
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
            success: false,
            error: 'Invalid limit parameter',
            message: 'Limit must be between 1 and 100'
        });
    }
    
    req.query.page = pageNum;
    req.query.limit = limitNum;
    next();
}

/**
 * Validate ID parameter
 */
function validateId(paramName = 'id') {
    return (req, res, next) => {
        const id = parseInt(req.params[paramName]);
        
        if (isNaN(id) || id < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID parameter',
                message: `${paramName} must be a positive integer`
            });
        }
        
        req.params[paramName] = id;
        next();
    };
}

/**
 * Validate date range parameters
 */
function validateDateRange(req, res, next) {
    const { start_date, end_date } = req.query;
    
    if (start_date && !isValidDate(start_date)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid start_date',
            message: 'start_date must be in YYYY-MM-DD format'
        });
    }
    
    if (end_date && !isValidDate(end_date)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid end_date',
            message: 'end_date must be in YYYY-MM-DD format'
        });
    }
    
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid date range',
            message: 'start_date cannot be after end_date'
        });
    }
    
    next();
}

/**
 * Helper function to validate date format
 */
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// ===================================================================
// EXPORTS
// ===================================================================

module.exports = {
    // Schemas
    animalSchema,
    animalUpdateSchema,
    adopterSchema,
    applicationSchema,
    volunteerSchema,
    donationSchema,
    medicalRecordSchema,
    
    // Validation middleware
    validate,
    validateAnimal,
    validateAnimalUpdate,
    validateAdopter,
    validateApplication,
    validateVolunteer,
    validateDonation,
    validateMedicalRecord,
    
    // Utility middleware
    validatePagination,
    validateId,
    validateDateRange
};