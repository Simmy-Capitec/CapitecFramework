const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

/**
 * STAFF ROUTE MODULE - SIMPLIFIED
 * Basic operations for staff management
 */

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                staff_id,
                employee_id,
                CONCAT(first_name, ' ', last_name) as name,
                email,
                role,
                specialization,
                hire_date,
                is_active
            FROM staff
            WHERE is_active = TRUE
            ORDER BY last_name, first_name
        `;
        
        const staff = await executeQuery(query);
        res.json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT * FROM staff WHERE staff_id = ? AND is_active = TRUE
        `;
        
        const staff = await executeQuery(query, [req.params.id]);
        if (staff.length === 0) {
            return res.status(404).json({ success: false, error: 'Staff member not found' });
        }
        res.json({ success: true, data: staff[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;