const express = require('express');
const router = express.Router();
const { executeQuery, logActivity } = require('../config/database');
const { validateAdopter, validateId } = require('../middleware/validation');

/**
 * ADOPTERS ROUTE MODULE
 * 
 * Handles adopter management operations:
 * - Adopter registration and profile management
 * - Background check tracking
 * - Adoption history
 * - Contact information management
 */

// ===================================================================
// GET ROUTES - READ OPERATIONS
// ===================================================================

/**
 * GET /api/adopters
 * Retrieve all adopters with filtering and pagination
 */
router.get('/', async (req, res) => {
    try {
        const {
            status,
            city,
            state,
            background_check_status,
            page = 1,
            limit = 20,
            sort = 'last_name',
            order = 'asc'
        } = req.query;

        let whereConditions = [];
        let queryParams = [];

        if (status) {
            whereConditions.push('a.background_check_status = ?');
            queryParams.push(status);
        }

        if (city) {
            whereConditions.push('a.city LIKE ?');
            queryParams.push(`%${city}%`);
        }

        if (state) {
            whereConditions.push('a.state = ?');
            queryParams.push(state);
        }

        if (background_check_status) {
            whereConditions.push('a.background_check_status = ?');
            queryParams.push(background_check_status);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const validSortFields = ['first_name', 'last_name', 'email', 'city', 'state', 'created_at'];
        const sortField = validSortFields.includes(sort) ? sort : 'last_name';
        const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        const query = `
            SELECT 
                a.adopter_id,
                a.first_name,
                a.last_name,
                a.email,
                a.phone,
                a.city,
                a.state,
                a.housing_type,
                a.housing_owned,
                a.has_yard,
                a.yard_fenced,
                a.has_other_pets,
                a.background_check_status,
                a.approved_date,
                a.created_at,
                COUNT(DISTINCT app.application_id) as total_applications,
                COUNT(DISTINCT ad.adoption_id) as total_adoptions,
                MAX(app.application_date) as last_application_date
            FROM adopters a
            LEFT JOIN adoption_applications app ON a.adopter_id = app.adopter_id
            LEFT JOIN adoptions ad ON a.adopter_id = ad.adopter_id
            ${whereClause}
            GROUP BY a.adopter_id
            ORDER BY a.${sortField} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        queryParams.push(parseInt(limit), offset);
        const adopters = await executeQuery(query, queryParams);

        // Get total count
        const countQuery = `
            SELECT COUNT(DISTINCT a.adopter_id) as total
            FROM adopters a
            ${whereClause}
        `;
        const countParams = queryParams.slice(0, -2);
        const [countResult] = await executeQuery(countQuery, countParams);
        const total = countResult.total;

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: adopters,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total_records: total,
                total_pages: totalPages,
                has_next_page: parseInt(page) < totalPages,
                has_prev_page: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching adopters:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch adopters',
            message: error.message
        });
    }
});

/**
 * GET /api/adopters/:id
 * Retrieve specific adopter with complete profile
 */
router.get('/:id', validateId(), async (req, res) => {
    try {
        const adopterId = req.params.id;

        const query = `
            SELECT 
                a.*,
                COUNT(DISTINCT app.application_id) as total_applications,
                COUNT(DISTINCT CASE WHEN app.status = 'Approved' THEN app.application_id END) as approved_applications,
                COUNT(DISTINCT ad.adoption_id) as total_adoptions
            FROM adopters a
            LEFT JOIN adoption_applications app ON a.adopter_id = app.adopter_id
            LEFT JOIN adoptions ad ON a.adopter_id = ad.adopter_id
            WHERE a.adopter_id = ?
            GROUP BY a.adopter_id
        `;

        const adopters = await executeQuery(query, [adopterId]);

        if (adopters.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Adopter not found',
                message: `No adopter found with ID ${adopterId}`
            });
        }

        const adopter = adopters[0];

        // Get adoption applications
        const applicationsQuery = `
            SELECT 
                app.application_id,
                app.application_date,
                app.status,
                app.preferred_adoption_date,
                app.reason_for_adoption,
                an.animal_id,
                an.name as animal_name,
                an.species,
                an.breed
            FROM adoption_applications app
            LEFT JOIN animals an ON app.animal_id = an.animal_id
            WHERE app.adopter_id = ?
            ORDER BY app.application_date DESC
        `;

        const applications = await executeQuery(applicationsQuery, [adopterId]);

        // Get completed adoptions
        const adoptionsQuery = `
            SELECT 
                ad.adoption_id,
                ad.adoption_date,
                ad.adoption_fee_paid,
                ad.follow_up_date,
                ad.follow_up_completed,
                an.animal_id,
                an.name as animal_name,
                an.species,
                an.breed
            FROM adoptions ad
            LEFT JOIN animals an ON ad.animal_id = an.animal_id
            WHERE ad.adopter_id = ?
            ORDER BY ad.adoption_date DESC
        `;

        const adoptions = await executeQuery(adoptionsQuery, [adopterId]);

        res.json({
            success: true,
            data: {
                ...adopter,
                applications,
                adoptions
            }
        });
    } catch (error) {
        console.error('Error fetching adopter:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch adopter',
            message: error.message
        });
    }
});

/**
 * GET /api/adopters/search/:term
 * Search adopters by name or email
 */
router.get('/search/:term', async (req, res) => {
    try {
        const searchTerm = `%${req.params.term}%`;

        const query = `
            SELECT 
                adopter_id,
                first_name,
                last_name,
                email,
                phone,
                city,
                state,
                background_check_status,
                created_at
            FROM adopters
            WHERE 
                first_name LIKE ? OR 
                last_name LIKE ? OR 
                email LIKE ? OR
                CONCAT(first_name, ' ', last_name) LIKE ?
            ORDER BY last_name, first_name
            LIMIT 50
        `;

        const adopters = await executeQuery(query, [searchTerm, searchTerm, searchTerm, searchTerm]);

        res.json({
            success: true,
            data: adopters,
            search_term: req.params.term,
            results_count: adopters.length
        });
    } catch (error) {
        console.error('Error searching adopters:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search adopters',
            message: error.message
        });
    }
});

// ===================================================================
// POST ROUTES - CREATE OPERATIONS
// ===================================================================

/**
 * POST /api/adopters
 * Create new adopter profile
 */
router.post('/', validateAdopter, async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            state,
            zip_code,
            date_of_birth,
            occupation,
            housing_type,
            housing_owned,
            has_yard = false,
            yard_fenced = false,
            has_other_pets = false,
            other_pets_details,
            previous_pet_experience,
            household_members,
            veterinarian_info,
            references
        } = req.body;

        // Check if email already exists
        const existingAdopter = await executeQuery(
            'SELECT adopter_id FROM adopters WHERE email = ?',
            [email]
        );

        if (existingAdopter.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Email already exists',
                message: 'An adopter with this email address already exists'
            });
        }

        // Insert new adopter
        const insertQuery = `
            INSERT INTO adopters (
                first_name, last_name, email, phone, address, city, state, zip_code,
                date_of_birth, occupation, housing_type, housing_owned, has_yard,
                yard_fenced, has_other_pets, other_pets_details, previous_pet_experience,
                household_members, veterinarian_info, references
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams = [
            first_name, last_name, email, phone, address, city, state, zip_code,
            date_of_birth, occupation, housing_type, housing_owned, has_yard,
            yard_fenced, has_other_pets, other_pets_details, previous_pet_experience,
            household_members ? JSON.stringify(household_members) : null,
            veterinarian_info ? JSON.stringify(veterinarian_info) : null,
            references ? JSON.stringify(references) : null
        ];

        const result = await executeQuery(insertQuery, insertParams);
        const newAdopterId = result.insertId;

        // Log activity
        await logActivity('adopters', newAdopterId, 'INSERT', 'System', null, null, req.body, req.ip);

        // Return created adopter
        const createdAdopter = await executeQuery(
            'SELECT * FROM adopters WHERE adopter_id = ?',
            [newAdopterId]
        );

        res.status(201).json({
            success: true,
            message: 'Adopter profile created successfully',
            data: createdAdopter[0]
        });
    } catch (error) {
        console.error('Error creating adopter:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create adopter profile',
            message: error.message
        });
    }
});

// ===================================================================
// PUT ROUTES - UPDATE OPERATIONS
// ===================================================================

/**
 * PUT /api/adopters/:id
 * Update adopter profile
 */
router.put('/:id', validateId(), async (req, res) => {
    try {
        const adopterId = req.params.id;

        // Check if adopter exists
        const existingAdopter = await executeQuery(
            'SELECT * FROM adopters WHERE adopter_id = ?',
            [adopterId]
        );

        if (existingAdopter.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Adopter not found',
                message: `No adopter found with ID ${adopterId}`
            });
        }

        const oldAdopter = existingAdopter[0];

        // Build update query
        const updateFields = [];
        const updateParams = [];

        const allowedFields = [
            'first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state',
            'zip_code', 'date_of_birth', 'occupation', 'housing_type', 'housing_owned',
            'has_yard', 'yard_fenced', 'has_other_pets', 'other_pets_details',
            'previous_pet_experience', 'household_members', 'veterinarian_info',
            'references', 'notes'
        ];

        allowedFields.forEach(field => {
            if (req.body.hasOwnProperty(field)) {
                updateFields.push(`${field} = ?`);
                if (field === 'household_members' || field === 'veterinarian_info' || field === 'references') {
                    updateParams.push(req.body[field] ? JSON.stringify(req.body[field]) : null);
                } else {
                    updateParams.push(req.body[field]);
                }
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update',
                message: 'Please provide at least one field to update'
            });
        }

        // Check for email conflicts
        if (req.body.email && req.body.email !== oldAdopter.email) {
            const emailCheck = await executeQuery(
                'SELECT adopter_id FROM adopters WHERE email = ? AND adopter_id != ?',
                [req.body.email, adopterId]
            );

            if (emailCheck.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already exists',
                    message: 'Another adopter with this email address already exists'
                });
            }
        }

        // Perform update
        updateParams.push(adopterId);
        const updateQuery = `
            UPDATE adopters 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE adopter_id = ?
        `;

        await executeQuery(updateQuery, updateParams);

        // Log activity
        await logActivity('adopters', adopterId, 'UPDATE', 'System', null, oldAdopter, req.body, req.ip);

        // Return updated adopter
        const updatedAdopter = await executeQuery(
            'SELECT * FROM adopters WHERE adopter_id = ?',
            [adopterId]
        );

        res.json({
            success: true,
            message: 'Adopter profile updated successfully',
            data: updatedAdopter[0]
        });
    } catch (error) {
        console.error('Error updating adopter:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update adopter profile',
            message: error.message
        });
    }
});

// ===================================================================
// SPECIALIZED ROUTES
// ===================================================================

/**
 * PUT /api/adopters/:id/background-check
 * Update background check status
 */
router.put('/:id/background-check', validateId(), async (req, res) => {
    try {
        const adopterId = req.params.id;
        const { status, notes } = req.body;

        const validStatuses = ['Pending', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status',
                message: 'Status must be Pending, Approved, or Rejected'
            });
        }

        // Check if adopter exists
        const existingAdopter = await executeQuery(
            'SELECT * FROM adopters WHERE adopter_id = ?',
            [adopterId]
        );

        if (existingAdopter.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Adopter not found',
                message: `No adopter found with ID ${adopterId}`
            });
        }

        const updateData = {
            background_check_status: status,
            notes: notes || null
        };

        if (status === 'Approved') {
            updateData.approved_date = new Date();
        }

        const updateFields = Object.keys(updateData).map(field => `${field} = ?`);
        const updateParams = [...Object.values(updateData), adopterId];

        const updateQuery = `
            UPDATE adopters 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE adopter_id = ?
        `;

        await executeQuery(updateQuery, updateParams);

        // Log activity
        await logActivity('adopters', adopterId, 'UPDATE', 'Staff', null, 
            { background_check_status: existingAdopter[0].background_check_status }, 
            updateData, req.ip);

        res.json({
            success: true,
            message: 'Background check status updated successfully',
            data: {
                adopter_id: adopterId,
                background_check_status: status,
                approved_date: updateData.approved_date || null,
                updated_at: new Date()
            }
        });
    } catch (error) {
        console.error('Error updating background check:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update background check status',
            message: error.message
        });
    }
});

/**
 * GET /api/adopters/stats/summary
 * Get adopter statistics
 */
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = {};

        // Total adopters by background check status
        const statusQuery = `
            SELECT background_check_status, COUNT(*) as count
            FROM adopters
            GROUP BY background_check_status
        `;
        const statusStats = await executeQuery(statusQuery);
        stats.by_background_status = statusStats.reduce((acc, row) => {
            acc[row.background_check_status] = row.count;
            return acc;
        }, {});

        // Geographic distribution
        const geoQuery = `
            SELECT state, COUNT(*) as count
            FROM adopters
            GROUP BY state
            ORDER BY count DESC
            LIMIT 10
        `;
        const geoStats = await executeQuery(geoQuery);
        stats.by_state = geoStats;

        // Housing types
        const housingQuery = `
            SELECT housing_type, COUNT(*) as count
            FROM adopters
            GROUP BY housing_type
        `;
        const housingStats = await executeQuery(housingQuery);
        stats.by_housing_type = housingStats.reduce((acc, row) => {
            acc[row.housing_type] = row.count;
            return acc;
        }, {});

        // Recent registrations
        const recentQuery = `
            SELECT COUNT(*) as count
            FROM adopters
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `;
        const [recentStats] = await executeQuery(recentQuery);
        stats.recent_registrations = recentStats.count;

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching adopter stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch adopter statistics',
            message: error.message
        });
    }
});

module.exports = router;