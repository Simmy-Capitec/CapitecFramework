const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

/**
 * VOLUNTEERS ROUTE MODULE - SIMPLIFIED
 * Basic operations for volunteer management
 */

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                v.volunteer_id,
                CONCAT(v.first_name, ' ', v.last_name) as name,
                v.email,
                v.phone,
                v.status,
                v.start_date,
                v.total_hours_logged
            FROM volunteers v
            WHERE v.status = 'Active'
            ORDER BY v.last_name, v.first_name
        `;
        
        const volunteers = await executeQuery(query);
        res.json({ success: true, data: volunteers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, phone, start_date } = req.body;
        
        const query = `
            INSERT INTO volunteers (first_name, last_name, email, phone, start_date)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await executeQuery(query, [first_name, last_name, email, phone, start_date || new Date()]);
        res.status(201).json({ success: true, volunteer_id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;