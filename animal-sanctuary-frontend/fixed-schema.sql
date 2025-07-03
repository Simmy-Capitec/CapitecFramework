-- ===================================================================
-- ANIMAL SANCTUARY CAPSTONE PROJECT - FIXED DATABASE SCHEMA
-- ===================================================================

DROP DATABASE IF EXISTS animal_sanctuary_capstone;
CREATE DATABASE animal_sanctuary_capstone;
USE animal_sanctuary_capstone;

-- ===================================================================
-- CORE TABLES (keeping what already exists and adding missing ones)
-- ===================================================================

-- Copy existing tables structure from original schema
-- These tables already exist and work fine:
-- habitats, animals, staff, medical_records, donors, donations, volunteers, volunteer_assignments

-- Adding the missing tables with fixes:

-- Adopters table - Fixed 'references' keyword issue
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
    household_members JSON, 
    veterinarian_info JSON, 
    adopter_references JSON,  -- Changed from 'references' to 'adopter_references'
    background_check_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approved_date DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_background_check (background_check_status),
    INDEX idx_location (city, state)
);

-- Adoption Applications table
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

-- Adoptions (completed) table
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

-- Activity Log table
CREATE TABLE activity_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    user_id INT,
    old_data JSON,
    new_data JSON,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user (user_type, user_id)
);

-- System Settings table
CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('adoption_fee_dog', '250', 'number', 'Standard adoption fee for dogs'),
('adoption_fee_cat', '150', 'number', 'Standard adoption fee for cats'),
('adoption_fee_other', '50', 'number', 'Standard adoption fee for other animals'),
('max_capacity_percentage', '90', 'number', 'Maximum habitat capacity percentage before alerts'),
('follow_up_days', '30', 'number', 'Days after adoption for follow-up'),
('application_expiry_days', '90', 'number', 'Days before application expires');

-- Sample Data for Adopters
INSERT INTO adopters (first_name, last_name, email, phone, address, city, state, zip_code, housing_type, housing_owned, has_yard, yard_fenced, has_other_pets, background_check_status, approved_date) VALUES
('John', 'Smith', 'john.smith@email.com', '555-1001', '123 Oak Street', 'Springfield', 'IL', '62701', 'House', TRUE, TRUE, TRUE, FALSE, 'Approved', '2024-02-01 10:30:00'),
('Maria', 'Garcia', 'maria.garcia@email.com', '555-1002', '456 Elm Avenue', 'Chicago', 'IL', '60601', 'Apartment', FALSE, FALSE, FALSE, TRUE, 'Approved', '2024-02-15 14:20:00'),
('David', 'Wilson', 'david.wilson@email.com', '555-1003', '789 Maple Drive', 'Rockford', 'IL', '61101', 'House', TRUE, TRUE, FALSE, FALSE, 'Approved', '2024-03-01 09:15:00'),
('Sarah', 'Johnson', 'sarah.j@email.com', '555-1004', '321 Pine Lane', 'Peoria', 'IL', '61602', 'Condo', TRUE, FALSE, FALSE, FALSE, 'Pending', NULL),
('Michael', 'Brown', 'mbrown@email.com', '555-1005', '654 Cedar Court', 'Naperville', 'IL', '60540', 'House', TRUE, TRUE, TRUE, TRUE, 'Approved', '2024-03-10 11:45:00');

-- Sample Adoption Applications
INSERT INTO adoption_applications (adopter_id, animal_id, application_date, status, reason_for_adoption, monthly_budget, interview_date, interviewer_staff_id, approved_by_staff_id) VALUES
(1, 1, '2024-02-05 11:00:00', 'Approved', 'Looking for a family companion dog', 200.00, '2024-02-08 14:00:00', 4, 4),
(2, 3, '2024-02-20 09:30:00', 'Approved', 'Want to provide a loving home for a cat', 150.00, '2024-02-22 16:00:00', 4, 4),
(3, 7, '2024-03-15 13:45:00', 'Under Review', 'Ready to care for a young dog', 300.00, '2024-03-18 10:00:00', 4, NULL),
(4, 2, '2024-03-20 10:15:00', 'Submitted', 'Love cats and have experience', 180.00, NULL, NULL, NULL),
(5, 8, '2024-03-12 15:30:00', 'Interview Scheduled', 'Looking for a rabbit as a companion', 100.00, '2024-03-25 13:00:00', 4, NULL);

-- Sample Completed Adoptions
INSERT INTO adoptions (application_id, adopter_id, animal_id, adoption_date, adoption_fee_paid, contract_signed, microchip_transferred, adoption_counselor_id, follow_up_date) VALUES
(1, 1, 1, '2024-02-10 14:30:00', 250.00, TRUE, TRUE, 4, '2024-03-10'),
(2, 2, 3, '2024-02-25 15:30:00', 150.00, TRUE, TRUE, 4, '2024-03-25');

-- Update animal status for adopted animals
UPDATE animals SET adoption_status = 'Adopted' WHERE animal_id IN (1, 3);

SELECT 'Database setup complete!' as Status;