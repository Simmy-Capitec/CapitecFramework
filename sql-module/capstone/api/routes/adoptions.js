const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

/**
 * ADOPTIONS ROUTE MODULE - SIMPLIFIED
 * Basic CRUD operations for completed adoptions
 */

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                ad.adoption_id,
                ad.adoption_date,
                ad.adoption_fee_paid,
                CONCAT(adopter.first_name, ' ', adopter.last_name) as adopter_name,
                an.name as animal_name,
                an.species
            FROM adoptions ad
            LEFT JOIN adopters adopter ON ad.adopter_id = adopter.adopter_id
            LEFT JOIN animals an ON ad.animal_id = an.animal_id
            ORDER BY ad.adoption_date DESC
            LIMIT 50
        `;
        
        const adoptions = await executeQuery(query);
        res.json({ success: true, data: adoptions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT ad.*, 
                   CONCAT(adopter.first_name, ' ', adopter.last_name) as adopter_name,
                   an.name as animal_name
            FROM adoptions ad
            LEFT JOIN adopters adopter ON ad.adopter_id = adopter.adopter_id
            LEFT JOIN animals an ON ad.animal_id = an.animal_id
            WHERE ad.adoption_id = ?
        `;
        
        const adoptions = await executeQuery(query, [req.params.id]);
        if (adoptions.length === 0) {
            return res.status(404).json({ success: false, error: 'Adoption not found' });
        }
        res.json({ success: true, data: adoptions[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;