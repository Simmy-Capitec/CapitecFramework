const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

/**
 * MEDICAL RECORDS ROUTE MODULE - SIMPLIFIED
 * Basic operations for medical record management
 */

router.get('/', async (req, res) => {
    try {
        const { animal_id } = req.query;
        let query = `
            SELECT 
                mr.record_id,
                mr.visit_date,
                mr.visit_type,
                mr.diagnosis,
                mr.treatment,
                mr.cost,
                an.name as animal_name,
                CONCAT(s.first_name, ' ', s.last_name) as veterinarian_name
            FROM medical_records mr
            LEFT JOIN animals an ON mr.animal_id = an.animal_id
            LEFT JOIN staff s ON mr.staff_id = s.staff_id
        `;
        
        let params = [];
        if (animal_id) {
            query += ' WHERE mr.animal_id = ?';
            params.push(animal_id);
        }
        
        query += ' ORDER BY mr.visit_date DESC LIMIT 100';
        
        const records = await executeQuery(query, params);
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { animal_id, staff_id, visit_type, diagnosis, treatment, medication, cost } = req.body;
        
        const query = `
            INSERT INTO medical_records (animal_id, staff_id, visit_date, visit_type, diagnosis, treatment, medication, cost)
            VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)
        `;
        
        const result = await executeQuery(query, [animal_id, staff_id, visit_type, diagnosis, treatment, medication, cost || 0]);
        res.status(201).json({ success: true, record_id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;