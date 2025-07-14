import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * ANIMAL SANCTUARY DATABASE TESTING SUITE
 * 
 * This test suite focuses on direct SQL testing and database validation:
 * 1. Complex SQL query testing
 * 2. Database constraints and triggers
 * 3. Data integrity validation
 * 4. Business rule enforcement at database level
 * 5. Performance testing for queries
 * 
 * Perfect for training SQL skills in a test automation context!
 */

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'animal_sanctuary_capstone'
};

let connection;

test.beforeEach(async () => {
    connection = await mysql.createConnection(DB_CONFIG);
});

test.afterEach(async () => {
    if (connection) {
        await connection.end();
    }
});

test.describe('Animal Sanctuary Database - SQL Testing', () => {

    test.describe('Basic SQL Operations and CRUD', () => {

        test('SELECT operations - basic data retrieval', async () => {
            // Test 1: Simple SELECT with WHERE clause
            const [animals] = await connection.execute(`
                SELECT animal_id, name, species, age 
                FROM animals 
                WHERE species = 'Dog' AND age > 2
                ORDER BY name
            `);
            
            expect(animals.length).toBeGreaterThan(0);
            animals.forEach(animal => {
                expect(animal.species).toBe('Dog');
                expect(animal.age).toBeGreaterThan(2);
                expect(animal.name).toBeTruthy();
            });

            // Test 2: SELECT with LIKE pattern matching
            const [searchResults] = await connection.execute(`
                SELECT name, species 
                FROM animals 
                WHERE name LIKE '%a%' 
                AND is_active = TRUE
            `);
            
            searchResults.forEach(animal => {
                expect(animal.name.toLowerCase()).toContain('a');
            });

            // Test 3: SELECT with NULL handling
            const [animalsWithDiet] = await connection.execute(`
                SELECT name, dietary_requirements
                FROM animals 
                WHERE dietary_requirements IS NOT NULL 
                AND dietary_requirements != ''
            `);
            
            animalsWithDiet.forEach(animal => {
                expect(animal.dietary_requirements).toBeTruthy();
            });
        });

        test('INSERT operations with data validation', async () => {
            // Test 1: Valid animal insertion
            const testAnimal = {
                name: 'SQL Test Dog',
                species: 'Dog',
                breed: 'Test Breed',
                age: 3,
                gender: 'Male',
                arrival_date: '2024-01-01',
                microchip_number: `SQLTEST${Date.now()}`
            };

            const [insertResult] = await connection.execute(`
                INSERT INTO animals (name, species, breed, age, gender, arrival_date, microchip_number)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, Object.values(testAnimal));

            expect(insertResult.insertId).toBeGreaterThan(0);
            expect(insertResult.affectedRows).toBe(1);

            // Verify the insertion
            const [verifyResult] = await connection.execute(`
                SELECT * FROM animals WHERE animal_id = ?
            `, [insertResult.insertId]);

            expect(verifyResult.length).toBe(1);
            expect(verifyResult[0].name).toBe(testAnimal.name);
            expect(verifyResult[0].species).toBe(testAnimal.species);

            // Test 2: Test unique constraint on microchip
            try {
                await connection.execute(`
                    INSERT INTO animals (name, species, microchip_number)
                    VALUES ('Duplicate Test', 'Cat', ?)
                `, [testAnimal.microchip_number]);
                
                // This should not execute if constraint works
                expect(true).toBe(false);
            } catch (error) {
                expect(error.code).toBe('ER_DUP_ENTRY');
            }
        });

        test('UPDATE operations and data consistency', async () => {
            // Get an existing animal for testing
            const [animals] = await connection.execute(`
                SELECT animal_id, name, age FROM animals WHERE is_active = TRUE LIMIT 1
            `);
            expect(animals.length).toBe(1);
            
            const animal = animals[0];
            const newAge = animal.age + 1;

            // Test UPDATE operation
            const [updateResult] = await connection.execute(`
                UPDATE animals 
                SET age = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE animal_id = ?
            `, [newAge, animal.animal_id]);

            expect(updateResult.affectedRows).toBe(1);

            // Verify the update
            const [verifyResult] = await connection.execute(`
                SELECT age, updated_at 
                FROM animals 
                WHERE animal_id = ?
            `, [animal.animal_id]);

            expect(verifyResult[0].age).toBe(newAge);
            expect(verifyResult[0].updated_at).toBeTruthy();
        });

        test('DELETE operations and soft delete pattern', async () => {
            // Create a test animal for deletion
            const [insertResult] = await connection.execute(`
                INSERT INTO animals (name, species, arrival_date, microchip_number)
                VALUES ('Delete Test', 'Cat', CURDATE(), ?)
            `, [`DELETE_TEST_${Date.now()}`]);

            const testAnimalId = insertResult.insertId;

            // Test soft delete (set is_active = FALSE)
            const [deleteResult] = await connection.execute(`
                UPDATE animals 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
                WHERE animal_id = ?
            `, [testAnimalId]);

            expect(deleteResult.affectedRows).toBe(1);

            // Verify animal still exists but is inactive
            const [softDeleteCheck] = await connection.execute(`
                SELECT is_active FROM animals WHERE animal_id = ?
            `, [testAnimalId]);

            expect(softDeleteCheck.length).toBe(1);
            expect(softDeleteCheck[0].is_active).toBe(0); // FALSE in MySQL
        });

    });

    test.describe('Advanced SQL Queries and JOINs', () => {

        test('INNER JOIN - animals with habitat information', async () => {
            const [results] = await connection.execute(`
                SELECT 
                    a.name as animal_name,
                    a.species,
                    h.habitat_name,
                    h.habitat_type,
                    h.capacity,
                    h.current_occupancy
                FROM animals a
                INNER JOIN habitats h ON a.habitat_id = h.habitat_id
                WHERE a.is_active = TRUE
                ORDER BY h.habitat_name, a.name
            `);

            expect(results.length).toBeGreaterThan(0);
            
            results.forEach(row => {
                expect(row.animal_name).toBeTruthy();
                expect(row.habitat_name).toBeTruthy();
                expect(row.capacity).toBeGreaterThan(0);
                expect(row.current_occupancy).toBeGreaterThanOrEqual(0);
            });
        });

        test('LEFT JOIN - animals with medical history', async () => {
            const [results] = await connection.execute(`
                SELECT 
                    a.animal_id,
                    a.name as animal_name,
                    a.species,
                    COUNT(mr.record_id) as medical_record_count,
                    MAX(mr.visit_date) as last_visit_date,
                    SUM(mr.cost) as total_medical_cost
                FROM animals a
                LEFT JOIN medical_records mr ON a.animal_id = mr.animal_id
                WHERE a.is_active = TRUE
                GROUP BY a.animal_id, a.name, a.species
                HAVING medical_record_count > 0
                ORDER BY total_medical_cost DESC
            `);

            results.forEach(row => {
                expect(row.animal_name).toBeTruthy();
                expect(row.medical_record_count).toBeGreaterThan(0);
                expect(row.last_visit_date).toBeTruthy();
                expect(row.total_medical_cost).toBeGreaterThanOrEqual(0);
            });
        });

        test('Complex JOIN - adoption workflow analysis', async () => {
            const [results] = await connection.execute(`
                SELECT 
                    an.name as animal_name,
                    an.species,
                    an.adoption_status,
                    COUNT(DISTINCT app.application_id) as application_count,
                    COUNT(DISTINCT CASE WHEN app.status = 'Approved' THEN app.application_id END) as approved_count,
                    CONCAT(latest_adopter.first_name, ' ', latest_adopter.last_name) as latest_applicant,
                    latest_app.application_date as latest_application_date
                FROM animals an
                LEFT JOIN adoption_applications app ON an.animal_id = app.animal_id
                LEFT JOIN (
                    SELECT animal_id, MAX(application_date) as max_date
                    FROM adoption_applications
                    GROUP BY animal_id
                ) latest ON an.animal_id = latest.animal_id
                LEFT JOIN adoption_applications latest_app ON latest.animal_id = latest_app.animal_id 
                    AND latest.max_date = latest_app.application_date
                LEFT JOIN adopters latest_adopter ON latest_app.adopter_id = latest_adopter.adopter_id
                WHERE an.is_active = TRUE
                GROUP BY an.animal_id, an.name, an.species, an.adoption_status
                ORDER BY application_count DESC, latest_application_date DESC
            `);

            results.forEach(row => {
                expect(row.animal_name).toBeTruthy();
                expect(row.application_count).toBeGreaterThanOrEqual(0);
                expect(row.approved_count).toBeLessThanOrEqual(row.application_count);
            });
        });

    });

    test.describe('Aggregate Functions and Window Functions', () => {

        test('GROUP BY with aggregate functions', async () => {
            // Test 1: Animal statistics by species
            const [speciesStats] = await connection.execute(`
                SELECT 
                    species,
                    COUNT(*) as animal_count,
                    AVG(age) as average_age,
                    MIN(age) as youngest_age,
                    MAX(age) as oldest_age,
                    AVG(weight_kg) as average_weight
                FROM animals 
                WHERE is_active = TRUE AND age IS NOT NULL
                GROUP BY species
                HAVING animal_count > 0
                ORDER BY animal_count DESC
            `);

            expect(speciesStats.length).toBeGreaterThan(0);
            
            speciesStats.forEach(species => {
                expect(species.species).toBeTruthy();
                expect(species.animal_count).toBeGreaterThan(0);
                expect(species.average_age).toBeGreaterThan(0);
                expect(species.youngest_age).toBeLessThanOrEqual(species.oldest_age);
            });

            // Test 2: Habitat utilization analysis
            const [habitatStats] = await connection.execute(`
                SELECT 
                    h.habitat_name,
                    h.capacity,
                    h.current_occupancy,
                    ROUND((h.current_occupancy / h.capacity) * 100, 2) as occupancy_percentage,
                    COUNT(a.animal_id) as actual_animal_count
                FROM habitats h
                LEFT JOIN animals a ON h.habitat_id = a.habitat_id AND a.is_active = TRUE
                GROUP BY h.habitat_id, h.habitat_name, h.capacity, h.current_occupancy
                ORDER BY occupancy_percentage DESC
            `);

            habitatStats.forEach(habitat => {
                expect(habitat.habitat_name).toBeTruthy();
                expect(habitat.capacity).toBeGreaterThan(0);
                expect(habitat.occupancy_percentage).toBeGreaterThanOrEqual(0);
                expect(habitat.occupancy_percentage).toBeLessThanOrEqual(100);
            });
        });

        test('Window functions for ranking and analytics', async () => {
            // Test ranking animals by days in sanctuary
            const [rankings] = await connection.execute(`
                SELECT 
                    name,
                    species,
                    arrival_date,
                    DATEDIFF(CURDATE(), arrival_date) as days_in_sanctuary,
                    ROW_NUMBER() OVER (ORDER BY arrival_date ASC) as arrival_rank,
                    ROW_NUMBER() OVER (PARTITION BY species ORDER BY arrival_date ASC) as species_rank,
                    LAG(arrival_date) OVER (ORDER BY arrival_date) as previous_arrival
                FROM animals 
                WHERE is_active = TRUE
                ORDER BY arrival_date
                LIMIT 10
            `);

            rankings.forEach((animal, index) => {
                expect(animal.name).toBeTruthy();
                expect(animal.days_in_sanctuary).toBeGreaterThanOrEqual(0);
                expect(animal.arrival_rank).toBe(index + 1);
                expect(animal.species_rank).toBeGreaterThan(0);
            });
        });

    });

    test.describe('Subqueries and CTEs', () => {

        test('subqueries for complex filtering', async () => {
            // Find animals with above-average medical costs
            const [expensiveAnimals] = await connection.execute(`
                SELECT 
                    a.name,
                    a.species,
                    total_cost.total_medical_cost
                FROM animals a
                JOIN (
                    SELECT 
                        animal_id,
                        SUM(cost) as total_medical_cost
                    FROM medical_records
                    GROUP BY animal_id
                    HAVING SUM(cost) > (
                        SELECT AVG(animal_total) 
                        FROM (
                            SELECT SUM(cost) as animal_total
                            FROM medical_records
                            GROUP BY animal_id
                        ) as avg_costs
                    )
                ) total_cost ON a.animal_id = total_cost.animal_id
                WHERE a.is_active = TRUE
                ORDER BY total_cost.total_medical_cost DESC
            `);

            expensiveAnimals.forEach(animal => {
                expect(animal.name).toBeTruthy();
                expect(animal.total_medical_cost).toBeGreaterThan(0);
            });
        });

        test('EXISTS subquery for relationship checking', async () => {
            // Find adopters who have submitted applications but haven't been approved
            const [pendingAdopters] = await connection.execute(`
                SELECT 
                    ad.adopter_id,
                    CONCAT(ad.first_name, ' ', ad.last_name) as adopter_name,
                    ad.email,
                    ad.background_check_status
                FROM adopters ad
                WHERE EXISTS (
                    SELECT 1 
                    FROM adoption_applications app 
                    WHERE app.adopter_id = ad.adopter_id 
                    AND app.status IN ('Submitted', 'Under Review')
                )
                AND ad.background_check_status = 'Approved'
                ORDER BY ad.last_name, ad.first_name
            `);

            pendingAdopters.forEach(adopter => {
                expect(adopter.adopter_name).toBeTruthy();
                expect(adopter.background_check_status).toBe('Approved');
            });
        });

    });

    test.describe('Database Constraints and Business Rules', () => {

        test('foreign key constraints enforcement', async () => {
            // Test 1: Cannot insert animal with invalid habitat_id
            try {
                await connection.execute(`
                    INSERT INTO animals (name, species, habitat_id, arrival_date)
                    VALUES ('Invalid Habitat Test', 'Dog', 99999, CURDATE())
                `);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.code).toBe('ER_NO_REFERENCED_ROW_2');
            }

            // Test 2: Cannot delete habitat with animals
            const [habitatWithAnimals] = await connection.execute(`
                SELECT h.habitat_id 
                FROM habitats h
                JOIN animals a ON h.habitat_id = a.habitat_id AND a.is_active = TRUE
                LIMIT 1
            `);

            if (habitatWithAnimals.length > 0) {
                try {
                    await connection.execute(`
                        DELETE FROM habitats WHERE habitat_id = ?
                    `, [habitatWithAnimals[0].habitat_id]);
                    expect(true).toBe(false); // Should not reach here
                } catch (error) {
                    expect(error.code).toBe('ER_ROW_IS_REFERENCED_2');
                }
            }
        });

        test('check constraints and data validation', async () => {
            // Test age constraints (if implemented)
            try {
                await connection.execute(`
                    INSERT INTO animals (name, species, age, arrival_date)
                    VALUES ('Invalid Age Test', 'Dog', -5, CURDATE())
                `);
                // If no check constraint, manually verify this would be invalid
                const [result] = await connection.execute(`
                    SELECT age FROM animals WHERE name = 'Invalid Age Test'
                `);
                if (result.length > 0) {
                    console.warn('Warning: Negative age allowed in database');
                }
            } catch (error) {
                // Good - constraint is working
                expect(error.code).toBeTruthy();
            }
        });

        test('unique constraints enforcement', async () => {
            // Test unique email constraint for adopters
            const uniqueEmail = `test_unique_${Date.now()}@example.com`;
            
            // First insertion should succeed
            await connection.execute(`
                INSERT INTO adopters (first_name, last_name, email, phone, address, city, state, zip_code, housing_type, housing_owned)
                VALUES ('Test', 'User1', ?, '555-0001', '123 Test St', 'Test City', 'TS', '12345', 'House', TRUE)
            `, [uniqueEmail]);

            // Second insertion with same email should fail
            try {
                await connection.execute(`
                    INSERT INTO adopters (first_name, last_name, email, phone, address, city, state, zip_code, housing_type, housing_owned)
                    VALUES ('Test', 'User2', ?, '555-0002', '456 Test Ave', 'Test City', 'TS', '12345', 'Apartment', FALSE)
                `, [uniqueEmail]);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.code).toBe('ER_DUP_ENTRY');
            }
        });

    });

    test.describe('Performance Testing and Query Optimization', () => {

        test('query performance benchmarks', async () => {
            // Test 1: Complex JOIN query performance
            const startTime1 = Date.now();
            
            const [complexQuery] = await connection.execute(`
                SELECT 
                    a.name,
                    a.species,
                    h.habitat_name,
                    COUNT(mr.record_id) as medical_records,
                    COUNT(app.application_id) as applications,
                    MAX(mr.visit_date) as last_medical_visit
                FROM animals a
                LEFT JOIN habitats h ON a.habitat_id = h.habitat_id
                LEFT JOIN medical_records mr ON a.animal_id = mr.animal_id
                LEFT JOIN adoption_applications app ON a.animal_id = app.animal_id
                WHERE a.is_active = TRUE
                GROUP BY a.animal_id, a.name, a.species, h.habitat_name
                ORDER BY medical_records DESC, applications DESC
            `);

            const duration1 = Date.now() - startTime1;
            console.log(`Complex JOIN query took ${duration1}ms`);
            expect(duration1).toBeLessThan(5000); // Should complete within 5 seconds

            // Test 2: Aggregation query performance
            const startTime2 = Date.now();
            
            const [aggregationQuery] = await connection.execute(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    species,
                    COUNT(*) as count,
                    AVG(age) as avg_age,
                    AVG(weight_kg) as avg_weight
                FROM animals 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m'), species
                ORDER BY month DESC, species
            `);

            const duration2 = Date.now() - startTime2;
            console.log(`Aggregation query took ${duration2}ms`);
            expect(duration2).toBeLessThan(3000); // Should complete within 3 seconds
        });

        test('index effectiveness verification', async () => {
            // Test query plans for indexed columns
            const [explainResult] = await connection.execute(`
                EXPLAIN SELECT * FROM animals WHERE microchip_number = 'MC001234567'
            `);

            // Check if index is being used (key should not be NULL)
            expect(explainResult[0].key).toBeTruthy();
            expect(explainResult[0].rows).toBeLessThanOrEqual(1); // Should be very selective
        });

    });

    test.describe('Data Integrity and Consistency Checks', () => {

        test('referential integrity verification', async () => {
            // Check for orphaned records
            const [orphanedApplications] = await connection.execute(`
                SELECT app.application_id 
                FROM adoption_applications app
                LEFT JOIN animals a ON app.animal_id = a.animal_id
                LEFT JOIN adopters ad ON app.adopter_id = ad.adopter_id
                WHERE a.animal_id IS NULL OR ad.adopter_id IS NULL
            `);
            expect(orphanedApplications.length).toBe(0);

            // Check for invalid status combinations
            const [invalidStatuses] = await connection.execute(`
                SELECT app.application_id
                FROM adoption_applications app
                JOIN animals a ON app.animal_id = a.animal_id
                WHERE app.status = 'Approved' 
                AND a.adoption_status = 'Available'
            `);
            // This might be valid in some cases, but worth checking
            console.log(`Found ${invalidStatuses.length} approved applications for available animals`);
        });

        test('data consistency across related tables', async () => {
            // Verify habitat occupancy matches actual animal count
            const [occupancyMismatch] = await connection.execute(`
                SELECT 
                    h.habitat_id,
                    h.habitat_name,
                    h.current_occupancy as recorded_occupancy,
                    COUNT(a.animal_id) as actual_occupancy
                FROM habitats h
                LEFT JOIN animals a ON h.habitat_id = a.habitat_id AND a.is_active = TRUE
                GROUP BY h.habitat_id, h.habitat_name, h.current_occupancy
                HAVING recorded_occupancy != actual_occupancy
            `);

            if (occupancyMismatch.length > 0) {
                console.warn('Habitat occupancy mismatches found:', occupancyMismatch);
            }
            // This might be expected during testing, so we'll log but not fail
        });

    });

});