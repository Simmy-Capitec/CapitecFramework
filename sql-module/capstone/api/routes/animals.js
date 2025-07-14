const express = require('express');
const router = express.Router();
const { executeQuery, logActivity } = require('../config/database');
const { validateAnimal, validateAnimalUpdate } = require('../middleware/validation');

/**
 * ANIMALS ROUTE MODULE
 * 
 * Handles all animal-related operations:
 * - CRUD operations for animals
 * - Search and filtering
 * - Adoption status management
 * - Medical history integration
 * 
 * This module is designed for comprehensive testing scenarios
 * covering database validation, API responses, and business logic.
 */

// ===================================================================
// GET ROUTES - READ OPERATIONS
// ===================================================================

/**
 * GET /api/animals
 * Retrieve all animals with optional filtering and pagination
 * 
 * Query Parameters:
 * - status: Filter by adoption status
 * - species: Filter by species
 * - habitat: Filter by habitat ID
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 20)
 * - sort: Sort field (default: 'name')
 * - order: Sort order (asc/desc, default: 'asc')
 */
router.get('/', async (req, res) => {
    try {
        const {
            status,
            species,
            habitat,
            available_only,
            page = 1,
            limit = 20,
            sort = 'name',
            order = 'asc'
        } = req.query;

        // Build WHERE clause dynamically
        let whereConditions = ['a.is_active = TRUE'];
        let queryParams = [];

        if (status) {
            whereConditions.push('a.adoption_status = ?');
            queryParams.push(status);
        }

        if (species) {
            whereConditions.push('a.species = ?');
            queryParams.push(species);
        }

        if (habitat) {
            whereConditions.push('a.habitat_id = ?');
            queryParams.push(parseInt(habitat));
        }

        if (available_only === 'true') {
            whereConditions.push('a.adoption_status = "Available"');
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const validSortFields = ['name', 'species', 'age', 'arrival_date', 'adoption_status'];
        const sortField = validSortFields.includes(sort) ? sort : 'name';
        const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        // Main query
        const query = `
            SELECT 
                a.animal_id,
                a.name,
                a.species,
                a.breed,
                a.age,
                a.weight_kg,
                a.gender,
                a.color,
                a.arrival_date,
                a.adoption_status,
                a.adoption_fee,
                a.dietary_requirements,
                a.behavioral_notes,
                a.special_needs,
                a.photos,
                h.habitat_name,
                h.habitat_type,
                DATEDIFF(CURDATE(), a.arrival_date) as days_in_sanctuary,
                (SELECT COUNT(*) FROM medical_records mr WHERE mr.animal_id = a.animal_id) as medical_records_count,
                (SELECT COUNT(*) FROM adoption_applications aa WHERE aa.animal_id = a.animal_id AND aa.status != 'Rejected') as application_count
            FROM animals a
            LEFT JOIN habitats h ON a.habitat_id = h.habitat_id
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY a.${sortField} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        queryParams.push(parseInt(limit), offset);
        const animals = await executeQuery(query, queryParams);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM animals a
            WHERE ${whereConditions.join(' AND ')}
        `;
        const countParams = queryParams.slice(0, -2); // Remove limit and offset
        const [countResult] = await executeQuery(countQuery, countParams);
        const total = countResult.total;

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            success: true,
            data: animals,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total_records: total,
                total_pages: totalPages,
                has_next_page: hasNextPage,
                has_prev_page: hasPrevPage
            },
            filters_applied: {
                status,
                species,
                habitat,
                available_only
            }
        });
    } catch (error) {
        console.error('Error fetching animals:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch animals',
            message: error.message
        });
    }
});

/**
 * GET /api/animals/:id
 * Retrieve specific animal with complete details
 */
router.get('/:id', async (req, res) => {
    try {
        const animalId = parseInt(req.params.id);

        if (isNaN(animalId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid animal ID',
                message: 'Animal ID must be a number'
            });
        }

        const query = `
            SELECT 
                a.*,
                h.habitat_name,
                h.habitat_type,
                h.capacity as habitat_capacity,
                h.current_occupancy as habitat_occupancy,
                DATEDIFF(CURDATE(), a.arrival_date) as days_in_sanctuary,
                CASE 
                    WHEN a.adoption_status = 'Available' THEN 'This animal is ready for adoption'
                    WHEN a.adoption_status = 'Pending' THEN 'This animal has a pending adoption application'
                    WHEN a.adoption_status = 'Adopted' THEN 'This animal has been adopted'
                    WHEN a.adoption_status = 'Medical Hold' THEN 'This animal is receiving medical care'
                    ELSE 'This animal is not currently available for adoption'
                END as status_description
            FROM animals a
            LEFT JOIN habitats h ON a.habitat_id = h.habitat_id
            WHERE a.animal_id = ? AND a.is_active = TRUE
        `;

        const animals = await executeQuery(query, [animalId]);

        if (animals.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Animal not found',
                message: `No animal found with ID ${animalId}`
            });
        }

        const animal = animals[0];

        // Get medical history
        const medicalQuery = `
            SELECT 
                mr.record_id,
                mr.visit_date,
                mr.visit_type,
                mr.diagnosis,
                mr.treatment,
                mr.medication,
                mr.next_visit_date,
                mr.cost,
                mr.notes,
                CONCAT(s.first_name, ' ', s.last_name) as veterinarian_name
            FROM medical_records mr
            LEFT JOIN staff s ON mr.staff_id = s.staff_id
            WHERE mr.animal_id = ?
            ORDER BY mr.visit_date DESC
        `;

        const medicalHistory = await executeQuery(medicalQuery, [animalId]);

        // Get adoption applications (if any)
        const applicationsQuery = `
            SELECT 
                aa.application_id,
                aa.application_date,
                aa.status,
                CONCAT(ad.first_name, ' ', ad.last_name) as adopter_name,
                ad.email as adopter_email,
                ad.phone as adopter_phone
            FROM adoption_applications aa
            LEFT JOIN adopters ad ON aa.adopter_id = ad.adopter_id
            WHERE aa.animal_id = ? AND aa.status != 'Rejected'
            ORDER BY aa.application_date DESC
        `;

        const applications = await executeQuery(applicationsQuery, [animalId]);

        // Combine all data
        const completeAnimalData = {
            ...animal,
            medical_history: medicalHistory,
            adoption_applications: applications
        };

        res.json({
            success: true,
            data: completeAnimalData
        });
    } catch (error) {
        console.error('Error fetching animal:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch animal',
            message: error.message
        });
    }
});

/**
 * GET /api/animals/search/:term
 * Search animals by name, species, or breed
 */
router.get('/search/:term', async (req, res) => {
    try {
        const searchTerm = `%${req.params.term}%`;

        const query = `
            SELECT 
                a.animal_id,
                a.name,
                a.species,
                a.breed,
                a.age,
                a.adoption_status,
                a.adoption_fee,
                h.habitat_name,
                DATEDIFF(CURDATE(), a.arrival_date) as days_in_sanctuary
            FROM animals a
            LEFT JOIN habitats h ON a.habitat_id = h.habitat_id
            WHERE a.is_active = TRUE
            AND (
                a.name LIKE ? OR 
                a.species LIKE ? OR 
                a.breed LIKE ? OR
                a.color LIKE ?
            )
            ORDER BY a.name
            LIMIT 50
        `;

        const animals = await executeQuery(query, [searchTerm, searchTerm, searchTerm, searchTerm]);

        res.json({
            success: true,
            data: animals,
            search_term: req.params.term,
            results_count: animals.length
        });
    } catch (error) {
        console.error('Error searching animals:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search animals',
            message: error.message
        });
    }
});

// ===================================================================
// POST ROUTES - CREATE OPERATIONS
// ===================================================================

/**
 * POST /api/animals
 * Create a new animal record
 */
router.post('/', validateAnimal, async (req, res) => {
    try {
        const {
            name,
            species,
            breed,
            age,
            weight_kg,
            gender,
            color,
            source,
            habitat_id,
            dietary_requirements,
            behavioral_notes,
            special_needs,
            microchip_number,
            adoption_fee = 0
        } = req.body;

        // Check if habitat exists and has capacity
        if (habitat_id) {
            const habitatQuery = `
                SELECT capacity, current_occupancy 
                FROM habitats 
                WHERE habitat_id = ?
            `;
            const habitats = await executeQuery(habitatQuery, [habitat_id]);

            if (habitats.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid habitat',
                    message: 'The specified habitat does not exist'
                });
            }

            const habitat = habitats[0];
            if (habitat.current_occupancy >= habitat.capacity) {
                return res.status(400).json({
                    success: false,
                    error: 'Habitat at capacity',
                    message: 'The specified habitat is at full capacity'
                });
            }
        }

        // Insert new animal
        const insertQuery = `
            INSERT INTO animals (
                name, species, breed, age, weight_kg, gender, color,
                arrival_date, source, habitat_id, dietary_requirements,
                behavioral_notes, special_needs, microchip_number, adoption_fee
            ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertParams = [
            name, species, breed, age, weight_kg, gender, color,
            source, habitat_id, dietary_requirements, behavioral_notes,
            special_needs, microchip_number, adoption_fee
        ];

        const result = await executeQuery(insertQuery, insertParams);
        const newAnimalId = result.insertId;

        // Update habitat occupancy if habitat assigned
        if (habitat_id) {
            await executeQuery(
                'UPDATE habitats SET current_occupancy = current_occupancy + 1 WHERE habitat_id = ?',
                [habitat_id]
            );
        }

        // Log activity
        await logActivity('animals', newAnimalId, 'INSERT', 'Staff', null, null, req.body, req.ip);

        // Return the created animal
        const createdAnimal = await executeQuery(
            'SELECT * FROM animals WHERE animal_id = ?',
            [newAnimalId]
        );

        res.status(201).json({
            success: true,
            message: 'Animal created successfully',
            data: createdAnimal[0]
        });
    } catch (error) {
        console.error('Error creating animal:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: 'Duplicate microchip number',
                message: 'An animal with this microchip number already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to create animal',
            message: error.message
        });
    }
});

// ===================================================================
// PUT ROUTES - UPDATE OPERATIONS
// ===================================================================

/**
 * PUT /api/animals/:id
 * Update an existing animal record
 */
router.put('/:id', validateAnimalUpdate, async (req, res) => {
    try {
        const animalId = parseInt(req.params.id);

        if (isNaN(animalId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid animal ID',
                message: 'Animal ID must be a number'
            });
        }

        // Check if animal exists
        const existingAnimal = await executeQuery(
            'SELECT * FROM animals WHERE animal_id = ? AND is_active = TRUE',
            [animalId]
        );

        if (existingAnimal.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Animal not found',
                message: `No animal found with ID ${animalId}`
            });
        }

        const oldAnimal = existingAnimal[0];

        // Build update query dynamically
        const updateFields = [];
        const updateParams = [];

        const allowedFields = [
            'name', 'species', 'breed', 'age', 'weight_kg', 'gender',
            'color', 'adoption_status', 'adoption_fee', 'habitat_id',
            'dietary_requirements', 'behavioral_notes', 'special_needs',
            'microchip_number'
        ];

        allowedFields.forEach(field => {
            if (req.body.hasOwnProperty(field)) {
                updateFields.push(`${field} = ?`);
                updateParams.push(req.body[field]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update',
                message: 'Please provide at least one field to update'
            });
        }

        // Handle habitat change
        if (req.body.habitat_id && req.body.habitat_id !== oldAnimal.habitat_id) {
            // Check new habitat capacity
            const newHabitatQuery = `
                SELECT capacity, current_occupancy 
                FROM habitats 
                WHERE habitat_id = ?
            `;
            const newHabitats = await executeQuery(newHabitatQuery, [req.body.habitat_id]);

            if (newHabitats.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid habitat',
                    message: 'The specified habitat does not exist'
                });
            }

            const newHabitat = newHabitats[0];
            if (newHabitat.current_occupancy >= newHabitat.capacity) {
                return res.status(400).json({
                    success: false,
                    error: 'Habitat at capacity',
                    message: 'The specified habitat is at full capacity'
                });
            }
        }

        // Perform update
        updateParams.push(animalId);
        const updateQuery = `
            UPDATE animals 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE animal_id = ?
        `;

        await executeQuery(updateQuery, updateParams);

        // Update habitat occupancy if habitat changed
        if (req.body.habitat_id && req.body.habitat_id !== oldAnimal.habitat_id) {
            // Decrease old habitat occupancy
            if (oldAnimal.habitat_id) {
                await executeQuery(
                    'UPDATE habitats SET current_occupancy = current_occupancy - 1 WHERE habitat_id = ?',
                    [oldAnimal.habitat_id]
                );
            }
            
            // Increase new habitat occupancy
            await executeQuery(
                'UPDATE habitats SET current_occupancy = current_occupancy + 1 WHERE habitat_id = ?',
                [req.body.habitat_id]
            );
        }

        // Log activity
        await logActivity('animals', animalId, 'UPDATE', 'Staff', null, oldAnimal, req.body, req.ip);

        // Return updated animal
        const updatedAnimal = await executeQuery(
            'SELECT * FROM animals WHERE animal_id = ?',
            [animalId]
        );

        res.json({
            success: true,
            message: 'Animal updated successfully',
            data: updatedAnimal[0]
        });
    } catch (error) {
        console.error('Error updating animal:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: 'Duplicate microchip number',
                message: 'An animal with this microchip number already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to update animal',
            message: error.message
        });
    }
});

// ===================================================================
// DELETE ROUTES - DELETE OPERATIONS
// ===================================================================

/**
 * DELETE /api/animals/:id
 * Soft delete an animal (set is_active to false)
 */
router.delete('/:id', async (req, res) => {
    try {
        const animalId = parseInt(req.params.id);

        if (isNaN(animalId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid animal ID',
                message: 'Animal ID must be a number'
            });
        }

        // Check if animal exists and is active
        const existingAnimal = await executeQuery(
            'SELECT * FROM animals WHERE animal_id = ? AND is_active = TRUE',
            [animalId]
        );

        if (existingAnimal.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Animal not found',
                message: `No active animal found with ID ${animalId}`
            });
        }

        const animal = existingAnimal[0];

        // Check if animal has pending adoption applications
        const pendingApplications = await executeQuery(
            'SELECT COUNT(*) as count FROM adoption_applications WHERE animal_id = ? AND status IN ("Submitted", "Under Review", "Interview Scheduled", "Approved")',
            [animalId]
        );

        if (pendingApplications[0].count > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete animal',
                message: 'Animal has pending adoption applications. Please resolve these first.'
            });
        }

        // Soft delete the animal
        await executeQuery(
            'UPDATE animals SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE animal_id = ?',
            [animalId]
        );

        // Update habitat occupancy
        if (animal.habitat_id) {
            await executeQuery(
                'UPDATE habitats SET current_occupancy = current_occupancy - 1 WHERE habitat_id = ?',
                [animal.habitat_id]
            );
        }

        // Log activity
        await logActivity('animals', animalId, 'DELETE', 'Staff', null, animal, null, req.ip);

        res.json({
            success: true,
            message: 'Animal deleted successfully',
            data: {
                animal_id: animalId,
                name: animal.name,
                deleted_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error deleting animal:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete animal',
            message: error.message
        });
    }
});

// ===================================================================
// SPECIALIZED ROUTES
// ===================================================================

/**
 * GET /api/animals/stats/summary
 * Get animal statistics summary
 */
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = {};

        // Total animals by status
        const statusQuery = `
            SELECT adoption_status, COUNT(*) as count
            FROM animals 
            WHERE is_active = TRUE
            GROUP BY adoption_status
        `;
        const statusStats = await executeQuery(statusQuery);
        stats.by_status = statusStats.reduce((acc, row) => {
            acc[row.adoption_status] = row.count;
            return acc;
        }, {});

        // Total animals by species
        const speciesQuery = `
            SELECT species, COUNT(*) as count
            FROM animals 
            WHERE is_active = TRUE
            GROUP BY species
            ORDER BY count DESC
        `;
        const speciesStats = await executeQuery(speciesQuery);
        stats.by_species = speciesStats;

        // Average age and weight
        const avgQuery = `
            SELECT 
                AVG(age) as avg_age,
                AVG(weight_kg) as avg_weight,
                COUNT(*) as total_animals
            FROM animals 
            WHERE is_active = TRUE
        `;
        const [avgStats] = await executeQuery(avgQuery);
        stats.averages = avgStats;

        // Recent arrivals (last 30 days)
        const recentQuery = `
            SELECT COUNT(*) as count
            FROM animals 
            WHERE is_active = TRUE
            AND arrival_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `;
        const [recentStats] = await executeQuery(recentQuery);
        stats.recent_arrivals = recentStats.count;

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching animal stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch animal statistics',
            message: error.message
        });
    }
});

module.exports = router;