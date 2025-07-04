const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

/**
 * REPORTS ROUTE MODULE
 * Analytics and reporting endpoints for the animal sanctuary
 */

// Dashboard summary report
router.get('/dashboard', async (req, res) => {
    try {
        const stats = {};

        // Animal statistics
        const animalStats = await executeQuery(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN adoption_status = 'Available' THEN 1 END) as available,
                COUNT(CASE WHEN adoption_status = 'Pending' THEN 1 END) as pending,
                COUNT(CASE WHEN adoption_status = 'Adopted' THEN 1 END) as adopted
            FROM animals WHERE is_active = TRUE
        `);
        stats.animals = animalStats[0];

        // Application statistics
        const appStats = await executeQuery(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'Submitted' THEN 1 END) as submitted,
                COUNT(CASE WHEN status = 'Under Review' THEN 1 END) as under_review,
                COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved
            FROM adoption_applications
            WHERE application_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        stats.recent_applications = appStats[0];

        // Donation statistics
        const donationStats = await executeQuery(`
            SELECT 
                COUNT(*) as total_donations,
                SUM(amount) as total_amount,
                AVG(amount) as average_amount
            FROM donations
            WHERE donation_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        stats.recent_donations = donationStats[0];

        // Volunteer statistics
        const volunteerStats = await executeQuery(`
            SELECT 
                COUNT(*) as active_volunteers,
                SUM(total_hours_logged) as total_hours
            FROM volunteers
            WHERE status = 'Active'
        `);
        stats.volunteers = volunteerStats[0];

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Monthly adoption report
router.get('/adoptions/monthly', async (req, res) => {
    try {
        const query = `
            SELECT 
                DATE_FORMAT(adoption_date, '%Y-%m') as month,
                COUNT(*) as adoptions,
                SUM(adoption_fee_paid) as revenue,
                AVG(adoption_fee_paid) as avg_fee
            FROM adoptions
            WHERE adoption_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(adoption_date, '%Y-%m')
            ORDER BY month DESC
        `;
        
        const report = await executeQuery(query);
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Animal intake report
router.get('/animals/intake', async (req, res) => {
    try {
        const query = `
            SELECT 
                DATE_FORMAT(arrival_date, '%Y-%m') as month,
                COUNT(*) as new_arrivals,
                species,
                source
            FROM animals
            WHERE arrival_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            AND is_active = TRUE
            GROUP BY DATE_FORMAT(arrival_date, '%Y-%m'), species, source
            ORDER BY month DESC, species
        `;
        
        const report = await executeQuery(query);
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;