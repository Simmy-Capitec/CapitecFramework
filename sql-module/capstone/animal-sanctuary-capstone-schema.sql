-- ===================================================================
-- ANIMAL SANCTUARY CAPSTONE PROJECT - COMPREHENSIVE DATABASE SCHEMA
-- ===================================================================
-- This schema supports:
-- 1. Core animal management
-- 2. Adoption workflow (applications, approvals, adoptions)
-- 3. Donation tracking and donor management
-- 4. Volunteer management and task assignments
-- 5. Staff management and role-based access
-- 6. Audit trails and reporting
-- ===================================================================

DROP DATABASE IF EXISTS animal_sanctuary_capstone;
CREATE DATABASE animal_sanctuary_capstone;
USE animal_sanctuary_capstone;

-- ===================================================================
-- CORE ANIMAL MANAGEMENT TABLES
-- ===================================================================

-- Habitats table - Living environments
CREATE TABLE habitats (
    habitat_id INT AUTO_INCREMENT PRIMARY KEY,
    habitat_name VARCHAR(100) NOT NULL,
    habitat_type ENUM('indoor', 'outdoor', 'mixed') NOT NULL,
    capacity INT NOT NULL DEFAULT 10,
    current_occupancy INT DEFAULT 0,
    temperature_range VARCHAR(50),
    special_features TEXT,
    maintenance_schedule VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_habitat_type (habitat_type),
    INDEX idx_capacity (capacity, current_occupancy)
);

-- Animals table - Core animal information
CREATE TABLE animals (
    animal_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    age INT,
    weight_kg DECIMAL(5,2),
    gender ENUM('Male', 'Female', 'Unknown') DEFAULT 'Unknown',
    color VARCHAR(100),
    arrival_date DATE NOT NULL,
    source VARCHAR(100), -- Where animal came from
    adoption_status ENUM('Available', 'Pending', 'Adopted', 'Not Available', 'Medical Hold') DEFAULT 'Available',
    adoption_fee DECIMAL(8,2) DEFAULT 0.00,
    habitat_id INT,
    dietary_requirements TEXT,
    behavioral_notes TEXT,
    special_needs TEXT,
    microchip_number VARCHAR(50) UNIQUE,
    photos JSON, -- Array of photo URLs
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (habitat_id) REFERENCES habitats(habitat_id),
    INDEX idx_species (species),
    INDEX idx_adoption_status (adoption_status),
    INDEX idx_arrival_date (arrival_date),
    INDEX idx_microchip (microchip_number)
);

-- Staff table - Employee management
CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role ENUM('Veterinarian', 'Caretaker', 'Volunteer Coordinator', 'Adoption Counselor', 'Administrator', 'Manager') NOT NULL,
    specialization VARCHAR(100),
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    emergency_contact JSON, -- Contact details
    certifications JSON, -- Professional certifications
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_email (email)
);

-- Medical records table - Animal health tracking
CREATE TABLE medical_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    staff_id INT NOT NULL,
    visit_date DATE NOT NULL,
    visit_type ENUM('Checkup', 'Vaccination', 'Treatment', 'Surgery', 'Emergency') NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    medication VARCHAR(200),
    dosage VARCHAR(100),
    next_visit_date DATE,
    cost DECIMAL(8,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    INDEX idx_animal (animal_id),
    INDEX idx_visit_date (visit_date),
    INDEX idx_visit_type (visit_type)
);

-- ===================================================================
-- ADOPTION WORKFLOW TABLES
-- ===================================================================

-- Adopters table - Potential and actual adopters
CREATE TABLE adopters (
    adopter_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    date_of_birth DATE,
    occupation VARCHAR(100),
    housing_type ENUM('House', 'Apartment', 'Condo', 'Other') NOT NULL,
    housing_owned BOOLEAN NOT NULL,
    has_yard BOOLEAN DEFAULT FALSE,
    yard_fenced BOOLEAN DEFAULT FALSE,
    has_other_pets BOOLEAN DEFAULT FALSE,
    other_pets_details TEXT,
    previous_pet_experience TEXT,
    household_members JSON, -- Array of household member details
    veterinarian_info JSON, -- Current vet contact info
    references JSON, -- Personal references
    background_check_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approved_date DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_background_check (background_check_status),
    INDEX idx_location (city, state)
);

-- Adoption applications table - Specific animal adoption requests
CREATE TABLE adoption_applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    adopter_id INT NOT NULL,
    animal_id INT NOT NULL,
    application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Submitted', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected', 'Withdrawn') DEFAULT 'Submitted',
    preferred_adoption_date DATE,
    reason_for_adoption TEXT,
    lifestyle_info TEXT,
    work_schedule TEXT,
    travel_frequency VARCHAR(100),
    plan_for_pet_care TEXT,
    monthly_budget DECIMAL(8,2),
    special_requests TEXT,
    interview_date DATETIME,
    interviewer_staff_id INT,
    interview_notes TEXT,
    decision_date DATETIME,
    decision_reason TEXT,
    approved_by_staff_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (adopter_id) REFERENCES adopters(adopter_id),
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id),
    FOREIGN KEY (interviewer_staff_id) REFERENCES staff(staff_id),
    FOREIGN KEY (approved_by_staff_id) REFERENCES staff(staff_id),
    INDEX idx_adopter (adopter_id),
    INDEX idx_animal (animal_id),
    INDEX idx_status (status),
    INDEX idx_application_date (application_date)
);

-- Adoptions table - Completed adoptions
CREATE TABLE adoptions (
    adoption_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    adopter_id INT NOT NULL,
    animal_id INT NOT NULL,
    adoption_date DATETIME NOT NULL,
    adoption_fee_paid DECIMAL(8,2) NOT NULL,
    contract_signed BOOLEAN DEFAULT FALSE,
    microchip_transferred BOOLEAN DEFAULT FALSE,
    follow_up_required BOOLEAN DEFAULT TRUE,
    follow_up_date DATE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    return_policy_explained BOOLEAN DEFAULT FALSE,
    adoption_counselor_id INT,
    special_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES adoption_applications(application_id),
    FOREIGN KEY (adopter_id) REFERENCES adopters(adopter_id),
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id),
    FOREIGN KEY (adoption_counselor_id) REFERENCES staff(staff_id),
    UNIQUE KEY unique_adoption (adopter_id, animal_id),
    INDEX idx_adoption_date (adoption_date),
    INDEX idx_follow_up (follow_up_date, follow_up_completed)
);

-- ===================================================================
-- DONATION AND DONOR MANAGEMENT
-- ===================================================================

-- Donors table - People who donate to the sanctuary
CREATE TABLE donors (
    donor_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    donor_type ENUM('Individual', 'Corporate', 'Foundation', 'Organization') DEFAULT 'Individual',
    company_name VARCHAR(100),
    preferred_contact_method ENUM('Email', 'Phone', 'Mail') DEFAULT 'Email',
    communication_preferences JSON, -- Newsletter, thank you notes, etc.
    tax_id VARCHAR(50), -- For tax receipts
    first_donation_date DATE,
    total_lifetime_donations DECIMAL(12,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_donor_type (donor_type),
    INDEX idx_lifetime_donations (total_lifetime_donations),
    INDEX idx_location (city, state)
);

-- Donations table - Individual donation records
CREATE TABLE donations (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    donation_type ENUM('One-time', 'Monthly', 'Annual', 'Memorial', 'Honor') DEFAULT 'One-time',
    payment_method ENUM('Credit Card', 'Check', 'Cash', 'Bank Transfer', 'PayPal', 'Other') NOT NULL,
    transaction_id VARCHAR(100),
    purpose ENUM('General Fund', 'Medical Care', 'Food', 'Facility Maintenance', 'Emergency Fund', 'Specific Animal') DEFAULT 'General Fund',
    specific_animal_id INT,
    memorial_info JSON, -- Memorial/honor donation details
    receipt_sent BOOLEAN DEFAULT FALSE,
    receipt_date DATETIME,
    tax_deductible BOOLEAN DEFAULT TRUE,
    campaign_source VARCHAR(100), -- Marketing campaign tracking
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (donor_id) REFERENCES donors(donor_id),
    FOREIGN KEY (specific_animal_id) REFERENCES animals(animal_id),
    INDEX idx_donor (donor_id),
    INDEX idx_donation_date (donation_date),
    INDEX idx_amount (amount),
    INDEX idx_purpose (purpose)
);

-- ===================================================================
-- VOLUNTEER MANAGEMENT
-- ===================================================================

-- Volunteers table - People who volunteer their time
CREATE TABLE volunteers (
    volunteer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    date_of_birth DATE,
    emergency_contact JSON, -- Emergency contact details
    start_date DATE NOT NULL,
    status ENUM('Active', 'Inactive', 'On Hold', 'Terminated') DEFAULT 'Active',
    skills JSON, -- Array of skills/interests
    availability JSON, -- Days/times available
    background_check_completed BOOLEAN DEFAULT FALSE,
    background_check_date DATE,
    orientation_completed BOOLEAN DEFAULT FALSE,
    orientation_date DATE,
    certifications JSON, -- Training certifications
    total_hours_logged DECIMAL(8,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_location (city, state)
);

-- Volunteer assignments table - Specific tasks assigned to volunteers
CREATE TABLE volunteer_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id INT NOT NULL,
    animal_id INT,
    task_type ENUM('Feeding', 'Cleaning', 'Exercise', 'Grooming', 'Socialization', 'Training', 'Transport', 'Event Support', 'Administrative', 'Other') NOT NULL,
    task_description TEXT,
    assigned_date DATE NOT NULL,
    scheduled_date DATETIME,
    estimated_hours DECIMAL(4,2),
    actual_hours DECIMAL(4,2),
    status ENUM('Assigned', 'In Progress', 'Completed', 'Cancelled', 'No Show') DEFAULT 'Assigned',
    completion_date DATETIME,
    assigned_by_staff_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id),
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id),
    FOREIGN KEY (assigned_by_staff_id) REFERENCES staff(staff_id),
    INDEX idx_volunteer (volunteer_id),
    INDEX idx_animal (animal_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status)
);

-- ===================================================================
-- AUDIT AND SYSTEM TABLES
-- ===================================================================

-- Activity log table - Tracks all significant actions
CREATE TABLE activity_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    user_type ENUM('Staff', 'System', 'Volunteer', 'Adopter') NOT NULL,
    user_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_user (user_type, user_id),
    INDEX idx_created_at (created_at)
);

-- System settings table - Configuration settings
CREATE TABLE system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    description TEXT,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_setting (category, setting_key),
    INDEX idx_category (category)
);

-- ===================================================================
-- SAMPLE DATA INSERTION
-- ===================================================================

-- Insert sample habitats
INSERT INTO habitats (habitat_name, habitat_type, capacity, current_occupancy, temperature_range, special_features) VALUES
('Dog Kennel Block A', 'indoor', 12, 8, '18-24°C', 'Climate controlled, individual runs with outdoor access'),
('Cat Colony Room 1', 'indoor', 15, 12, '20-25°C', 'Multi-level cat trees, windows, separate feeding areas'),
('Exotic Bird Aviary', 'mixed', 25, 18, '22-26°C', 'Large flight space, natural branches, water features'),
('Farm Animal Pasture', 'outdoor', 8, 5, 'Ambient', '2-acre fenced area with shelter, water troughs'),
('Quarantine Facility', 'indoor', 6, 2, '20-23°C', 'Isolated units, specialized ventilation, medical equipment'),
('Puppy Nursery', 'indoor', 10, 6, '22-25°C', 'Whelping boxes, heat lamps, easy-clean surfaces');

-- Insert sample staff
INSERT INTO staff (employee_id, first_name, last_name, email, phone, role, specialization, hire_date, salary) VALUES
('VET001', 'Dr. Sarah', 'Williams', 'sarah.williams@sanctuary.org', '555-0101', 'Veterinarian', 'Small Animal Medicine', '2020-03-15', 85000.00),
('CAR001', 'Mike', 'Johnson', 'mike.johnson@sanctuary.org', '555-0102', 'Caretaker', 'Dog Care', '2021-06-01', 38000.00),
('VOL001', 'Lisa', 'Chen', 'lisa.chen@sanctuary.org', '555-0103', 'Volunteer Coordinator', 'Program Management', '2019-09-20', 45000.00),
('ADO001', 'Jennifer', 'Davis', 'jennifer.davis@sanctuary.org', '555-0104', 'Adoption Counselor', 'Family Matching', '2020-11-10', 42000.00),
('ADM001', 'Robert', 'Brown', 'robert.brown@sanctuary.org', '555-0105', 'Administrator', 'Operations', '2018-01-15', 55000.00),
('CAR002', 'Emily', 'Rodriguez', 'emily.rodriguez@sanctuary.org', '555-0106', 'Caretaker', 'Cat Care', '2022-02-28', 36000.00);

-- Insert sample animals with comprehensive details
INSERT INTO animals (name, species, breed, age, weight_kg, gender, color, arrival_date, source, adoption_status, adoption_fee, habitat_id, dietary_requirements, behavioral_notes, special_needs, microchip_number) VALUES
('Bella', 'Dog', 'Labrador Mix', 3, 28.5, 'Female', 'Golden', '2024-01-15', 'Owner Surrender', 'Available', 250.00, 1, 'Standard dog food, no allergies', 'Friendly with children, needs daily exercise', 'None', 'MC001234567'),
('Max', 'Dog', 'German Shepherd', 5, 35.2, 'Male', 'Black and Tan', '2024-02-10', 'Stray Rescue', 'Available', 300.00, 1, 'High-protein diet, grain-free preferred', 'Protective, requires experienced owner', 'Hip dysplasia monitoring needed', 'MC002345678'),
('Luna', 'Cat', 'Domestic Shorthair', 2, 4.1, 'Female', 'Calico', '2024-01-20', 'Abandoned', 'Adopted', 150.00, 2, 'Indoor cat food, wet and dry mix', 'Shy initially, loves to play with toys', 'Declawed (front paws)', 'MC003456789'),
('Shadow', 'Cat', 'Maine Coon Mix', 4, 6.8, 'Male', 'Black', '2024-03-01', 'Owner Surrender', 'Available', 175.00, 2, 'Senior cat formula', 'Very social, gets along with other cats', 'Dental issues, regular cleanings needed', 'MC004567890'),
('Rio', 'Bird', 'Cockatiel', 6, 0.09, 'Male', 'Gray and Yellow', '2024-02-15', 'Owner Surrender', 'Available', 75.00, 3, 'Seed mix with fresh fruits and vegetables', 'Very vocal, knows several phrases', 'Molting season requires extra care', 'MC005678901'),
('Rosie', 'Pig', 'Potbellied Pig', 8, 45.0, 'Female', 'Pink and Black', '2024-01-30', 'Rescue Organization', 'Not Available', 0.00, 4, 'Specialized pig feed, limited treats', 'Intelligent, house-trained', 'Arthritis in hind legs', 'MC006789012'),
('Charlie', 'Dog', 'Beagle Mix', 1, 12.3, 'Male', 'Brown and White', '2024-03-10', 'Puppy Mill Rescue', 'Pending', 200.00, 6, 'Puppy formula, 3 meals daily', 'Very energetic, still learning house training', 'Requires puppy vaccinations', 'MC007890123'),
('Whiskers', 'Cat', 'Persian Mix', 7, 5.5, 'Female', 'White', '2024-02-25', 'Owner Deceased', 'Medical Hold', 200.00, 5, 'Kidney diet, prescription food only', 'Gentle, prefers quiet environments', 'Chronic kidney disease', 'MC008901234'),
('Buddy', 'Dog', 'Golden Retriever', 9, 32.1, 'Male', 'Golden', '2024-01-05', 'Owner Surrender', 'Available', 150.00, 1, 'Senior dog food, easy to digest', 'Calm temperament, great with kids', 'Age-related joint stiffness', 'MC009012345'),
('Mia', 'Rabbit', 'Holland Lop', 3, 1.8, 'Female', 'Brown and White', '2024-03-05', 'Stray Rescue', 'Available', 50.00, 2, 'Timothy hay, pellets, fresh vegetables', 'Curious and active, enjoys exploring', 'Spayed, up to date on vaccines', 'MC010123456');

-- Insert sample medical records
INSERT INTO medical_records (animal_id, staff_id, visit_date, visit_type, diagnosis, treatment, medication, next_visit_date, cost) VALUES
(1, 1, '2024-01-16', 'Checkup', 'Healthy', 'Routine examination, vaccinations updated', 'None', '2025-01-16', 85.00),
(2, 1, '2024-02-11', 'Checkup', 'Hip dysplasia confirmed', 'Joint supplement recommended, exercise modification', 'Glucosamine supplement', '2024-05-11', 120.00),
(3, 1, '2024-01-21', 'Checkup', 'Healthy', 'Spay surgery completed, routine vaccinations', 'Pain medication (3 days)', NULL, 180.00),
(4, 1, '2024-03-02', 'Treatment', 'Dental disease', 'Dental cleaning performed, 2 teeth extracted', 'Antibiotics (7 days)', '2024-09-02', 245.00),
(8, 1, '2024-02-26', 'Checkup', 'Chronic kidney disease', 'Blood work, kidney function monitoring', 'Kidney support supplement', '2024-05-26', 95.00);

-- Insert sample adopters
INSERT INTO adopters (first_name, last_name, email, phone, address, city, state, zip_code, housing_type, housing_owned, has_yard, yard_fenced, has_other_pets, background_check_status, approved_date) VALUES
('John', 'Smith', 'john.smith@email.com', '555-1001', '123 Oak Street', 'Springfield', 'IL', '62701', 'House', TRUE, TRUE, TRUE, FALSE, 'Approved', '2024-02-01 10:30:00'),
('Maria', 'Garcia', 'maria.garcia@email.com', '555-1002', '456 Elm Avenue', 'Chicago', 'IL', '60601', 'Apartment', FALSE, FALSE, FALSE, TRUE, 'Approved', '2024-02-15 14:20:00'),
('David', 'Wilson', 'david.wilson@email.com', '555-1003', '789 Maple Drive', 'Rockford', 'IL', '61101', 'House', TRUE, TRUE, FALSE, FALSE, 'Approved', '2024-03-01 09:15:00');

-- Insert sample adoption applications
INSERT INTO adoption_applications (adopter_id, animal_id, application_date, status, reason_for_adoption, monthly_budget, interview_date, interviewer_staff_id, approved_by_staff_id) VALUES
(1, 1, '2024-02-05 11:00:00', 'Approved', 'Looking for a family companion dog', 200.00, '2024-02-08 14:00:00', 4, 4),
(2, 3, '2024-02-20 09:30:00', 'Approved', 'Want to provide a loving home for a cat', 150.00, '2024-02-22 16:00:00', 4, 4),
(3, 7, '2024-03-15 13:45:00', 'Under Review', 'Ready to care for a young dog', 300.00, '2024-03-18 10:00:00', 4, NULL);

-- Insert completed adoptions
INSERT INTO adoptions (application_id, adopter_id, animal_id, adoption_date, adoption_fee_paid, contract_signed, microchip_transferred, adoption_counselor_id, follow_up_date) VALUES
(2, 2, 3, '2024-02-25 15:30:00', 150.00, TRUE, TRUE, 4, '2024-03-25');

-- Insert sample donors
INSERT INTO donors (first_name, last_name, email, phone, donor_type, first_donation_date, total_lifetime_donations) VALUES
('Robert', 'Johnson', 'robert.johnson@email.com', '555-2001', 'Individual', '2023-06-15', 450.00),
('Sarah', 'Lee', 'sarah.lee@email.com', '555-2002', 'Individual', '2023-08-20', 275.00),
('Green Valley Corp', '', 'donations@greenvalley.com', '555-2003', 'Corporate', '2023-05-10', 2500.00),
('Animal Friends Foundation', '', 'grants@animalfriends.org', '555-2004', 'Foundation', '2024-01-15', 5000.00);

-- Insert sample donations
INSERT INTO donations (donor_id, amount, donation_date, donation_type, payment_method, purpose) VALUES
(1, 50.00, '2023-06-15 12:00:00', 'One-time', 'Credit Card', 'General Fund'),
(1, 100.00, '2023-12-20 15:30:00', 'One-time', 'Check', 'Medical Care'),
(1, 25.00, '2024-01-15 10:00:00', 'Monthly', 'Credit Card', 'General Fund'),
(2, 75.00, '2023-08-20 14:15:00', 'One-time', 'PayPal', 'Food'),
(2, 200.00, '2023-11-25 09:45:00', 'One-time', 'Check', 'Emergency Fund'),
(3, 1000.00, '2023-05-10 11:00:00', 'One-time', 'Bank Transfer', 'Facility Maintenance'),
(3, 1500.00, '2023-12-31 16:00:00', 'Annual', 'Bank Transfer', 'General Fund'),
(4, 5000.00, '2024-01-15 13:30:00', 'One-time', 'Bank Transfer', 'Medical Care');

-- Insert sample volunteers
INSERT INTO volunteers (first_name, last_name, email, phone, start_date, status, background_check_completed, orientation_completed, total_hours_logged) VALUES
('Amanda', 'Thompson', 'amanda.thompson@email.com', '555-3001', '2023-09-01', 'Active', TRUE, TRUE, 145.50),
('Kevin', 'Martinez', 'kevin.martinez@email.com', '555-3002', '2024-01-15', 'Active', TRUE, TRUE, 68.25),
('Susan', 'Anderson', 'susan.anderson@email.com', '555-3003', '2023-11-10', 'Active', TRUE, TRUE, 92.75),
('Michael', 'Taylor', 'michael.taylor@email.com', '555-3004', '2024-02-01', 'Active', TRUE, FALSE, 12.00);

-- Insert sample volunteer assignments
INSERT INTO volunteer_assignments (volunteer_id, animal_id, task_type, task_description, assigned_date, scheduled_date, estimated_hours, actual_hours, status, assigned_by_staff_id) VALUES
(1, 1, 'Exercise', 'Daily walk and playtime', '2024-03-01', '2024-03-01 09:00:00', 1.0, 1.25, 'Completed', 2),
(1, 2, 'Socialization', 'Basic training and socialization', '2024-03-02', '2024-03-02 14:00:00', 2.0, 2.0, 'Completed', 2),
(2, 4, 'Grooming', 'Brush and basic grooming', '2024-03-01', '2024-03-01 10:00:00', 1.5, 1.75, 'Completed', 6),
(3, NULL, 'Administrative', 'Update animal profiles online', '2024-03-05', '2024-03-05 13:00:00', 3.0, NULL, 'Assigned', 5),
(4, 7, 'Feeding', 'Morning and evening meals', '2024-03-10', '2024-03-10 08:00:00', 0.5, NULL, 'Assigned', 2);

-- Insert system settings
INSERT INTO system_settings (category, setting_key, setting_value, description, data_type) VALUES
('adoption', 'min_age_requirement', '18', 'Minimum age for adopters', 'number'),
('adoption', 'application_fee', '25.00', 'Non-refundable application processing fee', 'number'),
('donation', 'min_online_donation', '5.00', 'Minimum online donation amount', 'number'),
('volunteer', 'min_volunteer_age', '16', 'Minimum age for volunteers', 'number'),
('system', 'maintenance_mode', 'false', 'Enable maintenance mode', 'boolean'),
('notifications', 'email_enabled', 'true', 'Enable email notifications', 'boolean');

-- ===================================================================
-- USEFUL VIEWS FOR REPORTING
-- ===================================================================

-- Available animals view
CREATE VIEW available_animals AS
SELECT 
    a.animal_id,
    a.name,
    a.species,
    a.breed,
    a.age,
    a.gender,
    a.adoption_fee,
    h.habitat_name,
    a.arrival_date,
    DATEDIFF(CURDATE(), a.arrival_date) as days_in_sanctuary,
    a.special_needs,
    a.photos
FROM animals a
LEFT JOIN habitats h ON a.habitat_id = h.habitat_id
WHERE a.adoption_status = 'Available' AND a.is_active = TRUE;

-- Adoption statistics view
CREATE VIEW adoption_stats AS
SELECT 
    DATE_FORMAT(adoption_date, '%Y-%m') as month,
    COUNT(*) as adoptions_count,
    SUM(adoption_fee_paid) as revenue,
    AVG(adoption_fee_paid) as avg_fee
FROM adoptions
GROUP BY DATE_FORMAT(adoption_date, '%Y-%m')
ORDER BY month DESC;

-- Volunteer activity summary
CREATE VIEW volunteer_activity AS
SELECT 
    v.volunteer_id,
    CONCAT(v.first_name, ' ', v.last_name) as volunteer_name,
    v.status,
    COUNT(va.assignment_id) as total_assignments,
    SUM(va.actual_hours) as total_hours_worked,
    COUNT(CASE WHEN va.status = 'Completed' THEN 1 END) as completed_assignments
FROM volunteers v
LEFT JOIN volunteer_assignments va ON v.volunteer_id = va.volunteer_id
GROUP BY v.volunteer_id, v.first_name, v.last_name, v.status;

-- Donation summary by donor
CREATE VIEW donor_summary AS
SELECT 
    d.donor_id,
    CONCAT(d.first_name, ' ', d.last_name) as donor_name,
    d.donor_type,
    COUNT(dn.donation_id) as total_donations,
    SUM(dn.amount) as total_amount,
    MAX(dn.donation_date) as last_donation_date,
    AVG(dn.amount) as avg_donation
FROM donors d
LEFT JOIN donations dn ON d.donor_id = dn.donor_id
GROUP BY d.donor_id, d.first_name, d.last_name, d.donor_type;

-- ===================================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ===================================================================

DELIMITER //

-- Procedure to process a new animal intake
CREATE PROCEDURE ProcessAnimalIntake(
    IN p_name VARCHAR(100),
    IN p_species VARCHAR(50),
    IN p_breed VARCHAR(100),
    IN p_age INT,
    IN p_weight_kg DECIMAL(5,2),
    IN p_gender ENUM('Male', 'Female', 'Unknown'),
    IN p_color VARCHAR(100),
    IN p_source VARCHAR(100),
    IN p_habitat_id INT,
    IN p_microchip_number VARCHAR(50),
    IN p_staff_id INT
)
BEGIN
    DECLARE v_animal_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLOUT;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insert new animal
    INSERT INTO animals (name, species, breed, age, weight_kg, gender, color, arrival_date, source, habitat_id, microchip_number)
    VALUES (p_name, p_species, p_breed, p_age, p_weight_kg, p_gender, p_color, CURDATE(), p_source, p_habitat_id, p_microchip_number);
    
    SET v_animal_id = LAST_INSERT_ID();
    
    -- Update habitat occupancy
    UPDATE habitats SET current_occupancy = current_occupancy + 1 WHERE habitat_id = p_habitat_id;
    
    -- Create initial medical record
    INSERT INTO medical_records (animal_id, staff_id, visit_date, visit_type, diagnosis, treatment)
    VALUES (v_animal_id, p_staff_id, CURDATE(), 'Checkup', 'Initial intake examination', 'Health assessment completed');
    
    -- Log the activity
    INSERT INTO activity_log (table_name, record_id, action, user_type, user_id)
    VALUES ('animals', v_animal_id, 'INSERT', 'Staff', p_staff_id);
    
    COMMIT;
    
    SELECT v_animal_id as new_animal_id;
END//

-- Procedure to complete an adoption
CREATE PROCEDURE CompleteAdoption(
    IN p_application_id INT,
    IN p_adoption_fee_paid DECIMAL(8,2),
    IN p_adoption_date DATETIME,
    IN p_counselor_id INT
)
BEGIN
    DECLARE v_adopter_id INT;
    DECLARE v_animal_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Get adopter and animal info
    SELECT adopter_id, animal_id INTO v_adopter_id, v_animal_id
    FROM adoption_applications 
    WHERE application_id = p_application_id;
    
    -- Update application status
    UPDATE adoption_applications 
    SET status = 'Approved', decision_date = p_adoption_date
    WHERE application_id = p_application_id;
    
    -- Update animal status
    UPDATE animals 
    SET adoption_status = 'Adopted'
    WHERE animal_id = v_animal_id;
    
    -- Create adoption record
    INSERT INTO adoptions (application_id, adopter_id, animal_id, adoption_date, adoption_fee_paid, adoption_counselor_id, follow_up_date)
    VALUES (p_application_id, v_adopter_id, v_animal_id, p_adoption_date, p_adoption_fee_paid, p_counselor_id, DATE_ADD(p_adoption_date, INTERVAL 30 DAY));
    
    -- Update habitat occupancy
    UPDATE habitats h
    JOIN animals a ON h.habitat_id = a.habitat_id
    SET h.current_occupancy = h.current_occupancy - 1
    WHERE a.animal_id = v_animal_id;
    
    COMMIT;
    
    SELECT 'Adoption completed successfully' as result;
END//

DELIMITER ;

-- ===================================================================
-- FINAL STATUS MESSAGE
-- ===================================================================
SELECT 'Animal Sanctuary Capstone Database Setup Complete!' as Status,
       (SELECT COUNT(*) FROM animals) as Animals,
       (SELECT COUNT(*) FROM adopters) as Adopters,
       (SELECT COUNT(*) FROM volunteers) as Volunteers,
       (SELECT COUNT(*) FROM donors) as Donors,
       (SELECT SUM(amount) FROM donations) as Total_Donations;