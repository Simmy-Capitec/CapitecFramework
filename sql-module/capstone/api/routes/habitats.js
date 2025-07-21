const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

/**
 * HABITATS ROUTE MODULE - SIMPLIFIED
 * Basic operations for habitat management
 */

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                h.habitat_id,
                h.habitat_name,
                h.habitat_type,
                h.capacity,
                h.current_occupancy,
                h.temperature_range,
                h.special_features,
                ROUND((h.current_occupancy / h.capacity) * 100, 1) as occupancy_percentage
            FROM habitats h
            ORDER BY h.habitat_name
        `;
        
        const habitats = await executeQuery(query);
        res.json({ success: true, data: habitats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT h.*, 
                   COUNT(a.animal_id) as animals_count
            FROM habitats h
            LEFT JOIN animals a ON h.habitat_id = a.habitat_id AND a.is_active = TRUE
            WHERE h.habitat_id = ?
            GROUP BY h.habitat_id
        `;
        
        const habitats = await executeQuery(query, [req.params.id]);
        if (habitats.length === 0) {
            return res.status(404).json({ success: false, error: 'Habitat not found' });
        }
        res.json({ success: true, data: habitats[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id/animals', async (req, res) => {
    try {
        const query = `
            SELECT 
                animal_id,
                name,
                species,
                breed,
                age,
                adoption_status
            FROM animals
            WHERE habitat_id = ? AND is_active = TRUE
            ORDER BY name
        `;
        
        const animals = await executeQuery(query, [req.params.id]);
        res.json({ success: true, data: animals });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;