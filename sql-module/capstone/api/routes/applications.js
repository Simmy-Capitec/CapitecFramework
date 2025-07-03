const express = require('express');
const router = express.Router();
const { executeQuery, logActivity, beginTransaction, commitTransaction, rollbackTransaction } = require('../config/database');
const { validateApplication, validateId } = require('../middleware/validation');

/**
 * ADOPTION APPLICATIONS ROUTE MODULE
 * 
 * Handles the adoption application workflow:
 * - Application submission and management
 * - Status tracking and updates
 * - Interview scheduling
 * - Application approval/rejection process
 */

// ===================================================================
// GET ROUTES - READ OPERATIONS
// ===================================================================

/**
 * GET /api/applications
 * Retrieve adoption applications with filtering and pagination
 */
router.get('/', async (req, res) => {
    try {
        const {
            status,
            animal_id,
            adopter_id,
            start_date,
            end_date,
            page = 1,
            limit = 20,
            sort = 'application_date',
            order = 'desc'
        } = req.query;

        let whereConditions = [];
        let queryParams = [];

        if (status) {
            whereConditions.push('app.status = ?');
            queryParams.push(status);
        }

        if (animal_id) {
            whereConditions.push('app.animal_id = ?');
            queryParams.push(parseInt(animal_id));
        }

        if (adopter_id) {
            whereConditions.push('app.adopter_id = ?');
            queryParams.push(parseInt(adopter_id));
        }

        if (start_date) {
            whereConditions.push('DATE(app.application_date) >= ?');
            queryParams.push(start_date);
        }

        if (end_date) {
            whereConditions.push('DATE(app.application_date) <= ?');
            queryParams.push(end_date);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const validSortFields = ['application_date', 'status', 'animal_name', 'adopter_name'];
        const sortField = validSortFields.includes(sort) ? sort : 'application_date';
        const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        const query = `
            SELECT 
                app.application_id,
                app.application_date,
                app.status,
                app.preferred_adoption_date,
                app.reason_for_adoption,
                app.interview_date,
                app.decision_date,
                
                -- Animal information
                an.animal_id,
                an.name as animal_name,
                an.species,
                an.breed,
                an.age,
                an.adoption_status as animal_status,
                
                -- Adopter information
                ad.adopter_id,
                CONCAT(ad.first_name, ' ', ad.last_name) as adopter_name,
                ad.email as adopter_email,
                ad.phone as adopter_phone,
                ad.city as adopter_city,
                ad.state as adopter_state,
                ad.background_check_status,
                
                -- Staff information
                CONCAT(interviewer.first_name, ' ', interviewer.last_name) as interviewer_name,
                CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name,
                
                DATEDIFF(CURDATE(), app.application_date) as days_since_application
                
            FROM adoption_applications app
            LEFT JOIN animals an ON app.animal_id = an.animal_id
            LEFT JOIN adopters ad ON app.adopter_id = ad.adopter_id
            LEFT JOIN staff interviewer ON app.interviewer_staff_id = interviewer.staff_id
            LEFT JOIN staff approver ON app.approved_by_staff_id = approver.staff_id
            ${whereClause}
            ORDER BY 
                CASE WHEN '${sortField}' = 'application_date' THEN app.application_date END ${sortOrder},
                CASE WHEN '${sortField}' = 'status' THEN app.status END ${sortOrder},
                CASE WHEN '${sortField}' = 'animal_name' THEN an.name END ${sortOrder},
                CASE WHEN '${sortField}' = 'adopter_name' THEN CONCAT(ad.first_name, ' ', ad.last_name) END ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        queryParams.push(parseInt(limit), offset);
        const applications = await executeQuery(query, queryParams);

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM adoption_applications app
            LEFT JOIN animals an ON app.animal_id = an.animal_id
            LEFT JOIN adopters ad ON app.adopter_id = ad.adopter_id
            ${whereClause}
        `;
        const countParams = queryParams.slice(0, -2);
        const [countResult] = await executeQuery(countQuery, countParams);
        const total = countResult.total;

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: applications,
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
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications',
            message: error.message
        });
    }
});

/**
 * GET /api/applications/:id
 * Retrieve specific application with full details
 */
router.get('/:id', validateId(), async (req, res) => {
    try {
        const applicationId = req.params.id;

        const query = `
            SELECT 
                app.*,
                
                -- Animal details
                an.name as animal_name,
                an.species,
                an.breed,
                an.age,
                an.weight_kg,
                an.gender as animal_gender,
                an.color,
                an.adoption_fee,
                an.special_needs,
                an.behavioral_notes,
                
                -- Adopter details
                ad.first_name as adopter_first_name,
                ad.last_name as adopter_last_name,
                ad.email as adopter_email,
                ad.phone as adopter_phone,
                ad.address as adopter_address,
                ad.city as adopter_city,
                ad.state as adopter_state,
                ad.zip_code as adopter_zip,
                ad.housing_type,
                ad.housing_owned,
                ad.has_yard,
                ad.yard_fenced,
                ad.has_other_pets,
                ad.other_pets_details,
                ad.previous_pet_experience,
                ad.background_check_status,
                
                -- Staff details
                CONCAT(interviewer.first_name, ' ', interviewer.last_name) as interviewer_name,
                interviewer.email as interviewer_email,
                CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name,
                
                DATEDIFF(CURDATE(), app.application_date) as days_since_application
                
            FROM adoption_applications app
            LEFT JOIN animals an ON app.animal_id = an.animal_id
            LEFT JOIN adopters ad ON app.adopter_id = ad.adopter_id
            LEFT JOIN staff interviewer ON app.interviewer_staff_id = interviewer.staff_id
            LEFT JOIN staff approver ON app.approved_by_staff_id = approver.staff_id
            WHERE app.application_id = ?
        `;

        const applications = await executeQuery(query, [applicationId]);

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found',
                message: `No application found with ID ${applicationId}`
            });
        }

        res.json({
            success: true,
            data: applications[0]
        });
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch application',
            message: error.message
        });
    }
});

/**
 * GET /api/applications/animal/:animal_id
 * Get all applications for a specific animal
 */
router.get('/animal/:animal_id', validateId('animal_id'), async (req, res) => {
    try {
        const animalId = req.params.animal_id;

        const query = `
            SELECT 
                app.application_id,
                app.application_date,
                app.status,
                app.reason_for_adoption,
                app.interview_date,
                app.decision_date,
                CONCAT(ad.first_name, ' ', ad.last_name) as adopter_name,
                ad.email as adopter_email,
                ad.phone as adopter_phone,
                ad.background_check_status,
                DATEDIFF(CURDATE(), app.application_date) as days_since_application
            FROM adoption_applications app
            LEFT JOIN adopters ad ON app.adopter_id = ad.adopter_id
            WHERE app.animal_id = ?
            ORDER BY app.application_date DESC
        `;

        const applications = await executeQuery(query, [animalId]);

        res.json({
            success: true,
            data: applications,
            animal_id: animalId,
            total_applications: applications.length
        });
    } catch (error) {
        console.error('Error fetching animal applications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch animal applications',
            message: error.message
        });
    }
});

// ===================================================================
// POST ROUTES - CREATE OPERATIONS
// ===================================================================

/**
 * POST /api/applications
 * Submit new adoption application
 */
router.post('/', validateApplication, async (req, res) => {
    let connection;
    
    try {
        const {
            adopter_id,
            animal_id,
            preferred_adoption_date,
            reason_for_adoption,
            lifestyle_info,
            work_schedule,
            travel_frequency,
            plan_for_pet_care,
            monthly_budget,
            special_requests
        } = req.body;

        connection = await beginTransaction();

        // Verify adopter exists and is approved
        const adopterQuery = `
            SELECT adopter_id, first_name, last_name, background_check_status
            FROM adopters 
            WHERE adopter_id = ?
        `;
        const adopters = await connection.execute(adopterQuery, [adopter_id]);

        if (adopters[0].length === 0) {
            await rollbackTransaction(connection);
            return res.status(404).json({
                success: false,
                error: 'Adopter not found',
                message: 'The specified adopter does not exist'
            });
        }

        const adopter = adopters[0][0];
        if (adopter.background_check_status !== 'Approved') {
            await rollbackTransaction(connection);
            return res.status(400).json({
                success: false,
                error: 'Background check required',
                message: 'Adopter must have an approved background check to submit applications'
            });
        }

        // Verify animal exists and is available
        const animalQuery = `
            SELECT animal_id, name, adoption_status
            FROM animals 
            WHERE animal_id = ? AND is_active = TRUE
        `;
        const animals = await connection.execute(animalQuery, [animal_id]);

        if (animals[0].length === 0) {
            await rollbackTransaction(connection);
            return res.status(404).json({
                success: false,
                error: 'Animal not found',
                message: 'The specified animal does not exist or is not active'
            });
        }

        const animal = animals[0][0];
        if (animal.adoption_status !== 'Available') {
            await rollbackTransaction(connection);
            return res.status(400).json({
                success: false,
                error: 'Animal not available',
                message: `Animal ${animal.name} is not currently available for adoption`
            });
        }

        // Check for existing active application
        const existingQuery = `
            SELECT application_id 
            FROM adoption_applications 
            WHERE adopter_id = ? AND animal_id = ? 
            AND status NOT IN ('Rejected', 'Withdrawn')
        `;
        const existing = await connection.execute(existingQuery, [adopter_id, animal_id]);

        if (existing[0].length > 0) {
            await rollbackTransaction(connection);
            return res.status(409).json({
                success: false,
                error: 'Application already exists',
                message: 'You already have an active application for this animal'
            });
        }

        // Insert new application
        const insertQuery = `
            INSERT INTO adoption_applications (
                adopter_id, animal_id, preferred_adoption_date, reason_for_adoption,
                lifestyle_info, work_schedule, travel_frequency, plan_for_pet_care,
                monthly_budget, special_requests
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams = [
            adopter_id, animal_id, preferred_adoption_date, reason_for_adoption,
            lifestyle_info, work_schedule, travel_frequency, plan_for_pet_care,
            monthly_budget, special_requests
        ];

        const result = await connection.execute(insertQuery, insertParams);
        const newApplicationId = result[0].insertId;

        // Update animal status to 'Pending' if this is the first application
        const pendingAppsQuery = `
            SELECT COUNT(*) as count 
            FROM adoption_applications 
            WHERE animal_id = ? AND status NOT IN ('Rejected', 'Withdrawn')
        `;
        const [pendingCount] = await connection.execute(pendingAppsQuery, [animal_id]);

        if (pendingCount[0].count === 1) { // This is the first pending application
            await connection.execute(
                'UPDATE animals SET adoption_status = "Pending" WHERE animal_id = ?',
                [animal_id]
            );
        }

        await commitTransaction(connection);

        // Log activity
        await logActivity('adoption_applications', newApplicationId, 'INSERT', 'Adopter', adopter_id, null, req.body, req.ip);

        // Return created application with details
        const createdApplication = await executeQuery(`
            SELECT 
                app.*,
                CONCAT(ad.first_name, ' ', ad.last_name) as adopter_name,
                an.name as animal_name
            FROM adoption_applications app
            LEFT JOIN adopters ad ON app.adopter_id = ad.adopter_id
            LEFT JOIN animals an ON app.animal_id = an.animal_id
            WHERE app.application_id = ?
        `, [newApplicationId]);

        res.status(201).json({
            success: true,
            message: 'Adoption application submitted successfully',
            data: createdApplication[0]
        });
    } catch (error) {
        if (connection) {
            await rollbackTransaction(connection);
        }
        console.error('Error creating application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit application',
            message: error.message
        });
    }
});

// ===================================================================
// PUT ROUTES - UPDATE OPERATIONS
// ===================================================================

/**
 * PUT /api/applications/:id/status
 * Update application status
 */
router.put('/:id/status', validateId(), async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status, staff_id, decision_reason, interview_date, interview_notes } = req.body;

        const validStatuses = ['Submitted', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected', 'Withdrawn'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status',
                message: 'Status must be one of: ' + validStatuses.join(', ')
            });
        }

        // Get current application
        const currentApp = await executeQuery(
            'SELECT * FROM adoption_applications WHERE application_id = ?',
            [applicationId]
        );

        if (currentApp.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found',
                message: `No application found with ID ${applicationId}`
            });
        }

        const application = currentApp[0];

        // Build update query
        const updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
        const updateParams = [status];

        if (status === 'Interview Scheduled' && interview_date) {
            updateFields.push('interview_date = ?', 'interviewer_staff_id = ?');
            updateParams.push(interview_date, staff_id);
        }

        if (status === 'Approved' || status === 'Rejected') {
            updateFields.push('decision_date = CURRENT_TIMESTAMP', 'decision_reason = ?', 'approved_by_staff_id = ?');
            updateParams.push(decision_reason || null, staff_id);
        }

        if (interview_notes) {
            updateFields.push('interview_notes = ?');
            updateParams.push(interview_notes);
        }

        updateParams.push(applicationId);

        const updateQuery = `
            UPDATE adoption_applications 
            SET ${updateFields.join(', ')}
            WHERE application_id = ?
        `;

        await executeQuery(updateQuery, updateParams);

        // Update animal status if needed
        if (status === 'Approved') {
            await executeQuery(
                'UPDATE animals SET adoption_status = "Pending" WHERE animal_id = ?',
                [application.animal_id]
            );
        } else if (status === 'Rejected' || status === 'Withdrawn') {
            // Check if there are other pending applications
            const otherPendingQuery = `
                SELECT COUNT(*) as count 
                FROM adoption_applications 
                WHERE animal_id = ? AND application_id != ? 
                AND status NOT IN ('Rejected', 'Withdrawn')
            `;
            const [otherPending] = await executeQuery(otherPendingQuery, [application.animal_id, applicationId]);

            if (otherPending.count === 0) {
                await executeQuery(
                    'UPDATE animals SET adoption_status = "Available" WHERE animal_id = ?',
                    [application.animal_id]
                );
            }
        }

        // Log activity
        await logActivity('adoption_applications', applicationId, 'UPDATE', 'Staff', staff_id, 
            { status: application.status }, { status, decision_reason }, req.ip);

        res.json({
            success: true,
            message: 'Application status updated successfully',
            data: {
                application_id: applicationId,
                old_status: application.status,
                new_status: status,
                updated_at: new Date()
            }
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update application status',
            message: error.message
        });
    }
});

// ===================================================================
// SPECIALIZED ROUTES
// ===================================================================

/**
 * GET /api/applications/stats/summary
 * Get application statistics
 */
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = {};

        // Applications by status
        const statusQuery = `
            SELECT status, COUNT(*) as count
            FROM adoption_applications
            GROUP BY status
        `;
        const statusStats = await executeQuery(statusQuery);
        stats.by_status = statusStats.reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
        }, {});

        // Applications by time period
        const timeQuery = `
            SELECT 
                DATE_FORMAT(application_date, '%Y-%m') as month,
                COUNT(*) as applications,
                COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved
            FROM adoption_applications
            WHERE application_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(application_date, '%Y-%m')
            ORDER BY month DESC
        `;
        const timeStats = await executeQuery(timeQuery);
        stats.by_month = timeStats;

        // Average processing time
        const processingQuery = `
            SELECT 
                AVG(DATEDIFF(decision_date, application_date)) as avg_processing_days,
                status
            FROM adoption_applications
            WHERE decision_date IS NOT NULL
            GROUP BY status
        `;
        const processingStats = await executeQuery(processingQuery);
        stats.processing_time = processingStats;

        // Pending interviews
        const interviewQuery = `
            SELECT COUNT(*) as count
            FROM adoption_applications
            WHERE status = 'Interview Scheduled' 
            AND interview_date >= CURDATE()
        `;
        const [interviewStats] = await executeQuery(interviewQuery);
        stats.pending_interviews = interviewStats.count;

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching application stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch application statistics',
            message: error.message
        });
    }
});

module.exports = router;