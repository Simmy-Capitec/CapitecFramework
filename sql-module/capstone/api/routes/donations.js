const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

/**
 * DONATIONS ROUTE MODULE - SIMPLIFIED
 * Basic operations for donation tracking
 */

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                d.donation_id,
                d.amount,
                d.donation_date,
                d.donation_type,
                d.purpose,
                CONCAT(donor.first_name, ' ', donor.last_name) as donor_name
            FROM donations d
            LEFT JOIN donors donor ON d.donor_id = donor.donor_id
            ORDER BY d.donation_date DESC
            LIMIT 100
        `;
        
        const donations = await executeQuery(query);
        res.json({ success: true, data: donations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { donor_id, amount, donation_type, payment_method, purpose } = req.body;
        
        const query = `
            INSERT INTO donations (donor_id, amount, donation_type, payment_method, purpose)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await executeQuery(query, [donor_id, amount, donation_type || 'One-time', payment_method, purpose || 'General Fund']);
        res.status(201).json({ success: true, donation_id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;