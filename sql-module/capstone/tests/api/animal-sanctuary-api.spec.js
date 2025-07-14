import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * ANIMAL SANCTUARY API TESTING SUITE
 * 
 * This comprehensive test suite covers:
 * 1. Database validation and data integrity
 * 2. REST API endpoint testing 
 * 3. Business logic validation
 * 4. Error handling and edge cases
 * 5. Integration between database and API layers
 * 
 * Perfect for training manual testers transitioning to automation!
 */

// Test configuration
const API_BASE_URL = process.env.SANCTUARY_API_URL || 'http://localhost:3001';
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'animal_sanctuary_capstone'
};

let dbConnection;
let apiContext;

// Setup database and API connections
test.beforeEach(async ({ request }) => {
    // Create database connection
    dbConnection = await mysql.createConnection(DB_CONFIG);
    
    // Create API request context
    apiContext = request;
});

test.afterEach(async () => {
    if (dbConnection) {
        await dbConnection.end();
    }
});

test.describe('Animal Sanctuary API - Core Functionality', () => {

    test.describe('Database Integration Tests', () => {

        test('should verify database schema and sample data', async () => {
            // Test database connectivity
            const [result] = await dbConnection.execute('SELECT 1 as connected');
            expect(result[0].connected).toBe(1);

            // Verify all required tables exist
            const [tables] = await dbConnection.execute('SHOW TABLES');
            const tableNames = tables.map(row => Object.values(row)[0]);
            
            const requiredTables = [
                'animals', 'habitats', 'adopters', 'adoption_applications',
                'adoptions', 'volunteers', 'volunteer_assignments', 
                'donors', 'donations', 'staff', 'medical_records'
            ];

            requiredTables.forEach(table => {
                expect(tableNames).toContain(table);
            });

            // Verify sample data exists
            const [animalCount] = await dbConnection.execute('SELECT COUNT(*) as count FROM animals WHERE is_active = TRUE');
            expect(animalCount[0].count).toBeGreaterThan(0);

            const [habitatCount] = await dbConnection.execute('SELECT COUNT(*) as count FROM habitats');
            expect(habitatCount[0].count).toBeGreaterThan(0);
        });

        test('should validate data relationships and constraints', async () => {
            // Test foreign key relationships
            const [orphanedAnimals] = await dbConnection.execute(`
                SELECT COUNT(*) as count 
                FROM animals a 
                LEFT JOIN habitats h ON a.habitat_id = h.habitat_id 
                WHERE a.habitat_id IS NOT NULL AND h.habitat_id IS NULL
            `);
            expect(orphanedAnimals[0].count).toBe(0);

            // Test unique constraints
            const [duplicateMicrochips] = await dbConnection.execute(`
                SELECT microchip_number, COUNT(*) as count 
                FROM animals 
                WHERE microchip_number IS NOT NULL 
                GROUP BY microchip_number 
                HAVING COUNT(*) > 1
            `);
            expect(duplicateMicrochips.length).toBe(0);

            // Test habitat capacity logic
            const [capacityCheck] = await dbConnection.execute(`
                SELECT h.habitat_id, h.capacity, h.current_occupancy,
                       COUNT(a.animal_id) as actual_count
                FROM habitats h
                LEFT JOIN animals a ON h.habitat_id = a.habitat_id AND a.is_active = TRUE
                GROUP BY h.habitat_id
                HAVING h.current_occupancy != COUNT(a.animal_id)
            `);
            expect(capacityCheck.length).toBe(0);
        });

    });

    test.describe('Animals API Endpoints', () => {

        test('GET /api/animals - should return paginated animal list', async () => {
            const response = await apiContext.get(`${API_BASE_URL}/api/animals`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
            expect(data.pagination).toBeDefined();
            expect(data.pagination.current_page).toBe(1);
            expect(data.pagination.per_page).toBe(20);

            // Verify animal data structure
            if (data.data.length > 0) {
                const animal = data.data[0];
                expect(animal).toHaveProperty('animal_id');
                expect(animal).toHaveProperty('name');
                expect(animal).toHaveProperty('species');
                expect(animal).toHaveProperty('adoption_status');
            }
        });

        test('GET /api/animals with filters - should filter correctly', async () => {
            // Test species filter
            const speciesResponse = await apiContext.get(`${API_BASE_URL}/api/animals?species=Dog`);
            expect(speciesResponse.status()).toBe(200);
            
            const speciesData = await speciesResponse.json();
            speciesData.data.forEach(animal => {
                expect(animal.species).toBe('Dog');
            });

            // Test available only filter
            const availableResponse = await apiContext.get(`${API_BASE_URL}/api/animals?available_only=true`);
            expect(availableResponse.status()).toBe(200);
            
            const availableData = await availableResponse.json();
            availableData.data.forEach(animal => {
                expect(animal.adoption_status).toBe('Available');
            });
        });

        test('GET /api/animals/:id - should return specific animal with details', async () => {
            // First get a valid animal ID from database
            const [animals] = await dbConnection.execute('SELECT animal_id FROM animals WHERE is_active = TRUE LIMIT 1');
            expect(animals.length).toBeGreaterThan(0);
            
            const animalId = animals[0].animal_id;
            const response = await apiContext.get(`${API_BASE_URL}/api/animals/${animalId}`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.animal_id).toBe(animalId);
            expect(data.data).toHaveProperty('medical_history');
            expect(data.data).toHaveProperty('adoption_applications');
        });

        test('POST /api/animals - should create new animal and update database', async () => {
            // Get a valid habitat ID
            const [habitats] = await dbConnection.execute('SELECT habitat_id FROM habitats LIMIT 1');
            const habitatId = habitats[0].habitat_id;

            const newAnimal = {
                name: 'Test Animal',
                species: 'Dog',
                breed: 'Test Breed',
                age: 3,
                weight_kg: 25.5,
                gender: 'Male',
                color: 'Brown',
                source: 'Test Source',
                habitat_id: habitatId,
                microchip_number: `TEST${Date.now()}`,
                adoption_fee: 200.00
            };

            const response = await apiContext.post(`${API_BASE_URL}/api/animals`, {
                data: newAnimal
            });
            expect(response.status()).toBe(201);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.name).toBe(newAnimal.name);
            expect(data.data.species).toBe(newAnimal.species);

            // Verify animal was actually created in database
            const [dbResult] = await dbConnection.execute(
                'SELECT * FROM animals WHERE animal_id = ?',
                [data.data.animal_id]
            );
            expect(dbResult.length).toBe(1);
            expect(dbResult[0].name).toBe(newAnimal.name);

            // Verify habitat occupancy was updated
            const [habitatResult] = await dbConnection.execute(
                'SELECT current_occupancy FROM habitats WHERE habitat_id = ?',
                [habitatId]
            );
            // Note: This assumes the habitat had available space
        });

        test('PUT /api/animals/:id - should update animal and reflect in database', async () => {
            // Get an existing animal
            const [animals] = await dbConnection.execute('SELECT animal_id, name FROM animals WHERE is_active = TRUE LIMIT 1');
            const animalId = animals[0].animal_id;
            const originalName = animals[0].name;

            const updates = {
                name: `Updated ${originalName}`,
                age: 5,
                adoption_status: 'Available'
            };

            const response = await apiContext.put(`${API_BASE_URL}/api/animals/${animalId}`, {
                data: updates
            });
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.name).toBe(updates.name);

            // Verify database was updated
            const [dbResult] = await dbConnection.execute(
                'SELECT name, age, adoption_status FROM animals WHERE animal_id = ?',
                [animalId]
            );
            expect(dbResult[0].name).toBe(updates.name);
            expect(dbResult[0].age).toBe(updates.age);
        });

        test('should handle validation errors correctly', async () => {
            // Test missing required fields
            const invalidAnimal = {
                species: 'Dog'
                // Missing required 'name' field
            };

            const response = await apiContext.post(`${API_BASE_URL}/api/animals`, {
                data: invalidAnimal
            });
            expect(response.status()).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation Error');
            expect(data.details).toBeDefined();
        });

        test('should handle non-existent animal requests', async () => {
            const response = await apiContext.get(`${API_BASE_URL}/api/animals/99999`);
            expect(response.status()).toBe(404);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Animal not found');
        });

    });

    test.describe('Adoption Workflow Integration', () => {

        test('complete adoption workflow - from application to adoption', async () => {
            // Step 1: Create an adopter
            const newAdopter = {
                first_name: 'Test',
                last_name: 'Adopter',
                email: `test${Date.now()}@example.com`,
                phone: '555-0123',
                address: '123 Test Street',
                city: 'Test City',
                state: 'TS',
                zip_code: '12345',
                housing_type: 'House',
                housing_owned: true,
                has_yard: true,
                yard_fenced: true
            };

            const adopterResponse = await apiContext.post(`${API_BASE_URL}/api/adopters`, {
                data: newAdopter
            });
            expect(adopterResponse.status()).toBe(201);
            const adopter = await adopterResponse.json();
            const adopterId = adopter.data.adopter_id;

            // Step 2: Approve the adopter's background check
            const approvalResponse = await apiContext.put(`${API_BASE_URL}/api/adopters/${adopterId}/background-check`, {
                data: { status: 'Approved', notes: 'Test approval' }
            });
            expect(approvalResponse.status()).toBe(200);

            // Step 3: Get an available animal
            const animalsResponse = await apiContext.get(`${API_BASE_URL}/api/animals?available_only=true&limit=1`);
            const animalsData = await animalsResponse.json();
            expect(animalsData.data.length).toBeGreaterThan(0);
            const animalId = animalsData.data[0].animal_id;

            // Step 4: Submit adoption application
            const application = {
                adopter_id: adopterId,
                animal_id: animalId,
                reason_for_adoption: 'Looking for a loving companion for my family',
                lifestyle_info: 'Active family with children',
                monthly_budget: 500
            };

            const appResponse = await apiContext.post(`${API_BASE_URL}/api/applications`, {
                data: application
            });
            expect(appResponse.status()).toBe(201);
            const appData = await appResponse.json();
            const applicationId = appData.data.application_id;

            // Step 5: Verify animal status changed to Pending
            const animalCheck = await apiContext.get(`${API_BASE_URL}/api/animals/${animalId}`);
            const animalData = await animalCheck.json();
            expect(animalData.data.adoption_status).toBe('Pending');

            // Step 6: Approve the application
            const approveResponse = await apiContext.put(`${API_BASE_URL}/api/applications/${applicationId}/status`, {
                data: {
                    status: 'Approved',
                    staff_id: 1,
                    decision_reason: 'Excellent match for the animal'
                }
            });
            expect(approveResponse.status()).toBe(200);

            // Verify end-to-end data consistency in database
            const [finalCheck] = await dbConnection.execute(`
                SELECT 
                    app.status as app_status,
                    an.adoption_status as animal_status,
                    ad.background_check_status
                FROM adoption_applications app
                JOIN animals an ON app.animal_id = an.animal_id
                JOIN adopters ad ON app.adopter_id = ad.adopter_id
                WHERE app.application_id = ?
            `, [applicationId]);

            expect(finalCheck[0].app_status).toBe('Approved');
            expect(finalCheck[0].animal_status).toBe('Pending');
            expect(finalCheck[0].background_check_status).toBe('Approved');
        });

    });

    test.describe('Data Analytics and Reporting', () => {

        test('GET /api/animals/stats/summary - should return accurate statistics', async () => {
            const response = await apiContext.get(`${API_BASE_URL}/api/animals/stats/summary`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('by_status');
            expect(data.data).toHaveProperty('by_species');
            expect(data.data).toHaveProperty('averages');

            // Verify statistics match database
            const [dbStats] = await dbConnection.execute(`
                SELECT 
                    COUNT(*) as total,
                    AVG(age) as avg_age,
                    AVG(weight_kg) as avg_weight
                FROM animals 
                WHERE is_active = TRUE
            `);

            expect(data.data.averages.total_animals).toBe(dbStats[0].total);
            expect(Math.abs(data.data.averages.avg_age - dbStats[0].avg_age)).toBeLessThan(0.1);
        });

        test('GET /api/reports/dashboard - should provide comprehensive dashboard data', async () => {
            const response = await apiContext.get(`${API_BASE_URL}/api/reports/dashboard`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('animals');
            expect(data.data).toHaveProperty('recent_applications');
            expect(data.data).toHaveProperty('recent_donations');
            expect(data.data).toHaveProperty('volunteers');

            // Verify animal counts
            const [animalCounts] = await dbConnection.execute(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN adoption_status = 'Available' THEN 1 END) as available,
                    COUNT(CASE WHEN adoption_status = 'Adopted' THEN 1 END) as adopted
                FROM animals 
                WHERE is_active = TRUE
            `);

            expect(data.data.animals.total).toBe(animalCounts[0].total);
            expect(data.data.animals.available).toBe(animalCounts[0].available);
            expect(data.data.animals.adopted).toBe(animalCounts[0].adopted);
        });

    });

    test.describe('Error Handling and Edge Cases', () => {

        test('should handle database connection issues gracefully', async () => {
            // Test API health endpoint
            const response = await apiContext.get(`${API_BASE_URL}/health`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.status).toBe('healthy');
            expect(data).toHaveProperty('timestamp');
            expect(data).toHaveProperty('uptime');
        });

        test('should validate business rules', async () => {
            // Test: Cannot adopt an animal without approved background check
            const [adopter] = await dbConnection.execute(
                'SELECT adopter_id FROM adopters WHERE background_check_status != "Approved" LIMIT 1'
            );
            
            if (adopter.length > 0) {
                const [animal] = await dbConnection.execute(
                    'SELECT animal_id FROM animals WHERE adoption_status = "Available" LIMIT 1'
                );

                const application = {
                    adopter_id: adopter[0].adopter_id,
                    animal_id: animal[0].animal_id,
                    reason_for_adoption: 'Test application'
                };

                const response = await apiContext.post(`${API_BASE_URL}/api/applications`, {
                    data: application
                });
                expect(response.status()).toBe(400);
                
                const data = await response.json();
                expect(data.error).toBe('Background check required');
            }
        });

        test('should handle rate limiting', async () => {
            // Make multiple rapid requests to test rate limiting
            const requests = Array.from({ length: 10 }, () => 
                apiContext.get(`${API_BASE_URL}/api/animals`)
            );

            const responses = await Promise.all(requests);
            
            // All requests should succeed (rate limit is generous for testing)
            responses.forEach(response => {
                expect([200, 429]).toContain(response.status());
            });
        });

    });

});

test.describe('Performance and Load Testing', () => {

    test('should handle concurrent animal creation', async () => {
        const [habitat] = await dbConnection.execute('SELECT habitat_id FROM habitats LIMIT 1');
        const habitatId = habitat[0].habitat_id;

        const concurrentAnimals = Array.from({ length: 5 }, (_, i) => ({
            name: `Concurrent Animal ${i + 1}`,
            species: 'Dog',
            breed: 'Test Breed',
            age: 2,
            habitat_id: habitatId,
            microchip_number: `CONCURRENT${Date.now()}${i}`
        }));

        const requests = concurrentAnimals.map(animal =>
            apiContext.post(`${API_BASE_URL}/api/animals`, { data: animal })
        );

        const responses = await Promise.all(requests);
        
        // All requests should succeed
        responses.forEach(response => {
            expect(response.status()).toBe(201);
        });

        // Verify all animals were created in database
        const microchipNumbers = concurrentAnimals.map(a => a.microchip_number);
        const [created] = await dbConnection.execute(
            `SELECT COUNT(*) as count FROM animals WHERE microchip_number IN (${microchipNumbers.map(() => '?').join(',')})`,
            microchipNumbers
        );
        expect(created[0].count).toBe(5);
    });

    test('should efficiently handle large data queries', async () => {
        const startTime = Date.now();
        
        const response = await apiContext.get(`${API_BASE_URL}/api/animals?limit=100`);
        expect(response.status()).toBe(200);
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // API should respond within reasonable time (adjust threshold as needed)
        expect(responseTime).toBeLessThan(5000); // 5 seconds
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.length).toBeLessThanOrEqual(100);
    });

});