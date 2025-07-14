-- Animal Sanctuary Capstone Project - Sample Data for PostgreSQL
-- This file populates the database with realistic test data

-- Connect to the database
\c animal_sanctuary_capstone;

-- Insert sample users
INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES
('admin', 'admin@sanctuary.com', '$2b$10$hashedpassword1', 'admin', 'John', 'Smith'),
('staff1', 'staff1@sanctuary.com', '$2b$10$hashedpassword2', 'staff', 'Jane', 'Johnson'),
('staff2', 'staff2@sanctuary.com', '$2b$10$hashedpassword3', 'staff', 'Mike', 'Wilson'),
('volunteer1', 'volunteer1@sanctuary.com', '$2b$10$hashedpassword4', 'volunteer', 'Sarah', 'Davis');

-- Insert sample animals
INSERT INTO animals (name, species, breed, age, weight, color, description, adoption_status, medical_notes, intake_date) VALUES
('Buddy', 'Dog', 'Golden Retriever', 3, 65.5, 'Golden', 'Friendly and energetic dog, loves playing fetch', 'Available', 'Up to date on vaccinations', '2024-01-15'),
('Whiskers', 'Cat', 'Persian', 2, 8.2, 'White', 'Calm and affectionate cat, enjoys quiet environments', 'Available', 'Spayed, healthy', '2024-02-20'),
('Max', 'Dog', 'German Shepherd', 5, 75.0, 'Black and Tan', 'Loyal and intelligent, needs experienced owner', 'Pending', 'Minor hip dysplasia', '2024-01-10'),
('Luna', 'Cat', 'Siamese', 1, 6.8, 'Cream', 'Playful kitten, very social', 'Available', 'All vaccinations current', '2024-03-05'),
('Rocky', 'Dog', 'Bulldog', 4, 55.3, 'Brindle', 'Gentle giant, good with children', 'Adopted', 'Breathing issues monitored', '2023-12-01'),
('Bella', 'Cat', 'Maine Coon', 3, 12.5, 'Tabby', 'Large, gentle cat with beautiful coat', 'Available', 'Healthy, no issues', '2024-02-14'),
('Charlie', 'Dog', 'Labrador', 2, 68.7, 'Yellow', 'High energy, loves water and swimming', 'Available', 'Excellent health', '2024-03-10'),
('Mittens', 'Cat', 'Domestic Shorthair', 6, 9.1, 'Black and White', 'Senior cat, very loving and calm', 'Available', 'Arthritis, on medication', '2024-01-25'),
('Zeus', 'Dog', 'Great Dane', 1, 95.2, 'Blue', 'Giant puppy, still growing', 'Pending', 'Healthy, needs large space', '2024-03-01'),
('Coco', 'Rabbit', 'Holland Lop', 2, 3.5, 'Brown', 'Friendly rabbit, good with gentle handling', 'Available', 'Spayed, healthy', '2024-02-28');

-- Insert sample adopters
INSERT INTO adopters (first_name, last_name, email, phone, address, city, state, zip_code, has_experience, has_other_pets, housing_type) VALUES
('Emily', 'Brown', 'emily.brown@email.com', '555-0101', '123 Main St', 'Springfield', 'IL', '62701', TRUE, FALSE, 'House'),
('David', 'Garcia', 'david.garcia@email.com', '555-0102', '456 Oak Ave', 'Springfield', 'IL', '62702', FALSE, TRUE, 'Apartment'),
('Lisa', 'Martinez', 'lisa.martinez@email.com', '555-0103', '789 Pine Rd', 'Springfield', 'IL', '62703', TRUE, TRUE, 'House'),
('Robert', 'Anderson', 'robert.anderson@email.com', '555-0104', '321 Elm St', 'Springfield', 'IL', '62704', FALSE, FALSE, 'Townhouse'),
('Amanda', 'Taylor', 'amanda.taylor@email.com', '555-0105', '654 Maple Dr', 'Springfield', 'IL', '62705', TRUE, FALSE, 'House'),
('James', 'Wilson', 'james.wilson@email.com', '555-0106', '987 Cedar Ln', 'Springfield', 'IL', '62706', FALSE, TRUE, 'Apartment'),
('Maria', 'Rodriguez', 'maria.rodriguez@email.com', '555-0107', '147 Birch Ave', 'Springfield', 'IL', '62707', TRUE, TRUE, 'House'),
('Kevin', 'Johnson', 'kevin.johnson@email.com', '555-0108', '258 Walnut St', 'Springfield', 'IL', '62708', FALSE, FALSE, 'Condo');

-- Insert sample adoption applications
INSERT INTO adoption_applications (animal_id, adopter_id, status, application_date, notes, interview_date, decision_date) VALUES
((SELECT id FROM animals WHERE name = 'Max'), (SELECT id FROM adopters WHERE email = 'emily.brown@email.com'), 'Approved', '2024-03-15', 'Excellent match, experienced with large dogs', '2024-03-20', '2024-03-22'),
((SELECT id FROM animals WHERE name = 'Zeus'), (SELECT id FROM adopters WHERE email = 'david.garcia@email.com'), 'Under Review', '2024-03-18', 'Needs to verify apartment size for large dog', '2024-03-25', NULL),
((SELECT id FROM animals WHERE name = 'Whiskers'), (SELECT id FROM adopters WHERE email = 'lisa.martinez@email.com'), 'Interview Scheduled', '2024-03-12', 'Good application, scheduled for home visit', '2024-03-28', NULL),
((SELECT id FROM animals WHERE name = 'Luna'), (SELECT id FROM adopters WHERE email = 'amanda.taylor@email.com'), 'Approved', '2024-03-10', 'Perfect match for young cat', '2024-03-15', '2024-03-17'),
((SELECT id FROM animals WHERE name = 'Buddy'), (SELECT id FROM adopters WHERE email = 'maria.rodriguez@email.com'), 'Submitted', '2024-03-20', 'Recently submitted application', NULL, NULL),
((SELECT id FROM animals WHERE name = 'Rocky'), (SELECT id FROM adopters WHERE email = 'robert.anderson@email.com'), 'Approved', '2024-02-15', 'Adopted successfully', '2024-02-20', '2024-02-22');

-- Insert sample volunteers
INSERT INTO volunteers (first_name, last_name, email, phone, skills, availability, status, start_date, background_check_completed) VALUES
('Jennifer', 'Thompson', 'jennifer.thompson@email.com', '555-0201', ARRAY['Dog Walking', 'Animal Care', 'Event Planning'], '{"weekdays": ["Monday", "Wednesday", "Friday"], "hours": "9AM-2PM"}', 'Active', '2024-01-15', TRUE),
('Michael', 'Lee', 'michael.lee@email.com', '555-0202', ARRAY['Veterinary Assistant', 'Medical Care'], '{"weekdays": ["Tuesday", "Thursday"], "hours": "10AM-4PM"}', 'Active', '2024-02-01', TRUE),
('Anna', 'White', 'anna.white@email.com', '555-0203', ARRAY['Cat Socialization', 'Administrative'], '{"weekdays": ["Saturday", "Sunday"], "hours": "8AM-12PM"}', 'Active', '2024-01-20', TRUE),
('Christopher', 'Davis', 'christopher.davis@email.com', '555-0204', ARRAY['Fundraising', 'Social Media'], '{"weekdays": ["Monday", "Tuesday", "Wednesday"], "hours": "6PM-9PM"}', 'Active', '2024-02-10', TRUE),
('Rachel', 'Miller', 'rachel.miller@email.com', '555-0205', ARRAY['Dog Training', 'Behavioral Assessment'], '{"weekdays": ["Thursday", "Friday", "Saturday"], "hours": "1PM-5PM"}', 'Pending', '2024-03-01', FALSE),
('Daniel', 'Garcia', 'daniel.garcia@email.com', '555-0206', ARRAY['Maintenance', 'Facility Care'], '{"weekdays": ["Monday", "Wednesday", "Friday"], "hours": "7AM-11AM"}', 'Active', '2024-01-25', TRUE);

-- Insert sample volunteer schedules
INSERT INTO volunteer_schedules (volunteer_id, scheduled_date, start_time, end_time, activity, notes) VALUES
((SELECT id FROM volunteers WHERE email = 'jennifer.thompson@email.com'), '2024-03-25', '09:00', '14:00', 'Dog Walking', 'Walking large breed dogs'),
((SELECT id FROM volunteers WHERE email = 'michael.lee@email.com'), '2024-03-26', '10:00', '16:00', 'Medical Check-ups', 'Assisting with routine health checks'),
((SELECT id FROM volunteers WHERE email = 'anna.white@email.com'), '2024-03-24', '08:00', '12:00', 'Cat Socialization', 'Working with shy cats'),
((SELECT id FROM volunteers WHERE email = 'christopher.davis@email.com'), '2024-03-25', '18:00', '21:00', 'Social Media', 'Creating adoption posts'),
((SELECT id FROM volunteers WHERE email = 'daniel.garcia@email.com'), '2024-03-26', '07:00', '11:00', 'Facility Maintenance', 'Cleaning and repairs'),
((SELECT id FROM volunteers WHERE email = 'jennifer.thompson@email.com'), '2024-03-27', '09:00', '14:00', 'Dog Walking', 'Walking medium breed dogs'),
((SELECT id FROM volunteers WHERE email = 'anna.white@email.com'), '2024-03-28', '08:00', '12:00', 'Administrative', 'Filing and data entry');

-- Insert sample donations
INSERT INTO donations (donor_name, donor_email, amount, donation_date, payment_method, is_anonymous, purpose, notes) VALUES
('John Smith', 'john.smith@email.com', 500.00, '2024-01-15', 'Credit Card', FALSE, 'General Fund', 'Monthly recurring donation'),
('Anonymous Donor', NULL, 1000.00, '2024-02-01', 'Check', TRUE, 'Medical Fund', 'Large one-time donation'),
('Sarah Johnson', 'sarah.johnson@email.com', 250.00, '2024-02-14', 'PayPal', FALSE, 'Food and Supplies', 'Valentine''s Day donation'),
('Pet Lovers Inc', 'info@petlovers.com', 2000.00, '2024-03-01', 'Bank Transfer', FALSE, 'Facility Upgrade', 'Corporate sponsorship'),
('Mary Williams', 'mary.williams@email.com', 75.00, '2024-03-10', 'Credit Card', FALSE, 'General Fund', 'In memory of beloved pet'),
('Anonymous Donor', NULL, 150.00, '2024-03-15', 'Cash', TRUE, 'Medical Fund', 'Cash donation at event'),
('Tom Brown', 'tom.brown@email.com', 300.00, '2024-03-18', 'Credit Card', FALSE, 'Emergency Fund', 'Emergency medical assistance'),
('Local Business', 'contact@localbiz.com', 800.00, '2024-03-20', 'Check', FALSE, 'Food and Supplies', 'Quarterly business donation');

-- Insert sample medical records
INSERT INTO medical_records (animal_id, visit_date, veterinarian, diagnosis, treatment, medications, follow_up_date, cost) VALUES
((SELECT id FROM animals WHERE name = 'Buddy'), '2024-01-20', 'Dr. Sarah Peterson', 'Routine Check-up', 'Vaccinations updated', 'None', '2025-01-20', 150.00),
((SELECT id FROM animals WHERE name = 'Whiskers'), '2024-02-25', 'Dr. Michael Chen', 'Spaying Surgery', 'Spay procedure completed', 'Pain medication for 5 days', '2024-03-05', 350.00),
((SELECT id FROM animals WHERE name = 'Max'), '2024-01-15', 'Dr. Sarah Peterson', 'Hip Dysplasia Check', 'X-rays and examination', 'Joint supplements', '2024-04-15', 425.00),
((SELECT id FROM animals WHERE name = 'Luna'), '2024-03-08', 'Dr. Jennifer Adams', 'Kitten Vaccinations', 'First round of vaccinations', 'None', '2024-04-08', 125.00),
((SELECT id FROM animals WHERE name = 'Rocky'), '2024-02-01', 'Dr. Michael Chen', 'Breathing Assessment', 'Respiratory examination', 'Bronchodilator', '2024-05-01', 275.00),
((SELECT id FROM animals WHERE name = 'Bella'), '2024-02-20', 'Dr. Jennifer Adams', 'Dental Cleaning', 'Dental cleaning and check', 'Antibiotics', '2024-08-20', 400.00),
((SELECT id FROM animals WHERE name = 'Charlie'), '2024-03-15', 'Dr. Sarah Peterson', 'Routine Check-up', 'Health assessment', 'None', '2025-03-15', 175.00),
((SELECT id FROM animals WHERE name = 'Mittens'), '2024-02-01', 'Dr. Michael Chen', 'Arthritis Treatment', 'Joint examination and treatment', 'Anti-inflammatory medication', '2024-04-01', 225.00),
((SELECT id FROM animals WHERE name = 'Zeus'), '2024-03-05', 'Dr. Jennifer Adams', 'Puppy Check-up', 'Growth assessment and vaccinations', 'None', '2024-04-05', 200.00),
((SELECT id FROM animals WHERE name = 'Coco'), '2024-03-03', 'Dr. Sarah Peterson', 'Spaying Surgery', 'Spay procedure for rabbit', 'Pain medication', '2024-03-15', 275.00);

-- Update some animals to show adoption status changes
UPDATE animals SET adoption_status = 'Adopted' WHERE name = 'Rocky';
UPDATE animals SET adoption_status = 'Pending' WHERE name IN ('Max', 'Zeus');

-- Update last login for some users
UPDATE users SET last_login = CURRENT_TIMESTAMP - INTERVAL '2 hours' WHERE username = 'admin';
UPDATE users SET last_login = CURRENT_TIMESTAMP - INTERVAL '1 day' WHERE username = 'staff1';
UPDATE users SET last_login = CURRENT_TIMESTAMP - INTERVAL '3 days' WHERE username = 'staff2';

-- Success message
SELECT 'Sample data inserted successfully!' as status,
       (SELECT COUNT(*) FROM animals) as animals_count,
       (SELECT COUNT(*) FROM adopters) as adopters_count,
       (SELECT COUNT(*) FROM adoption_applications) as applications_count,
       (SELECT COUNT(*) FROM volunteers) as volunteers_count,
       (SELECT COUNT(*) FROM donations) as donations_count,
       (SELECT COUNT(*) FROM medical_records) as medical_records_count,
       (SELECT COUNT(*) FROM users) as users_count;