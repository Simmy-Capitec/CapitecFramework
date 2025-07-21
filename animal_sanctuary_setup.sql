CREATE DATABASE animal_sanctuary;
USE animal_sanctuary;

-- Animals table
CREATE TABLE animals (
    animal_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(50),
    age INT,
    weight_kg float,
    arrival_date DATE,
    adoption_status ENUM('Available', 'Adopted', 'Foster', 'Medical Hold') DEFAULT 'Available',
    habitat_id INT
);

-- Habitats table
CREATE TABLE habitats (
    habitat_id INT PRIMARY KEY AUTO_INCREMENT,
    habitat_name VARCHAR(100) NOT NULL,
    habitat_type ENUM('Indoor', 'Outdoor', 'Mixed') NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    temperature_range VARCHAR(20)
);

-- Staff table
CREATE TABLE staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('Veterinarian', 'Caretaker', 'Trainer', 'Administrator') NOT NULL,
    hire_date DATE,
    salary DECIMAL(8,2),
    specialization VARCHAR(100)
);

-- Medical records table
CREATE TABLE medical_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    animal_id INT,
    staff_id INT,
    visit_date DATE NOT NULL,
    diagnosis VARCHAR(200),
    treatment VARCHAR(500),
    medication VARCHAR(100),
    follow_up_required BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- Add foreign key constraint
ALTER TABLE animals ADD FOREIGN KEY (habitat_id) REFERENCES habitats(habitat_id);

-- Insert habitats
INSERT INTO habitats (habitat_name, habitat_type, capacity, current_occupancy, temperature_range) VALUES
('Savanna Enclosure', 'Outdoor', 8, 3, '20-30°C'),
('Tropical Rainforest', 'Mixed', 12, 5, '24-28°C'),
('Arctic Zone', 'Indoor', 6, 2, '0-5°C'),
('Aquatic Center', 'Indoor', 20, 8, '18-22°C'),
('Domestic Animal Shelter', 'Indoor', 50, 23, '18-24°C');

-- Insert animals
INSERT INTO animals (name, species, breed, age, weight_kg, arrival_date, adoption_status, habitat_id) VALUES
('Luna', 'Dog', 'Golden Retriever', 3, 28.5, '2024-01-15', 'Available', 5),
('Simba', 'Cat', 'Maine Coon', 2, 6.2, '2024-02-20', 'Adopted', 5),
('Zara', 'Zebra', 'Plains Zebra', 8, 350.0, '2023-06-10', 'Available', 1),
('Koko', 'Gorilla', 'Western Lowland', 15, 180.0, '2022-03-05', 'Available', 2),
('Splash', 'Dolphin', 'Bottlenose', 12, 250.0, '2021-09-12', 'Available', 4),
('Penny', 'Penguin', 'Emperor Penguin', 5, 22.5, '2023-11-20', 'Available', 3),
('Rex', 'Dog', 'German Shepherd', 4, 32.0, '2024-03-01', 'Foster', 5),
('Whiskers', 'Cat', 'Siamese', 1, 4.1, '2024-05-15', 'Available', 5),
('Ella', 'Elephant', 'African Bush', 25, 4500.0, '2020-08-30', 'Available', 1),
('Chirpy', 'Parrot', 'African Grey', 7, 0.5, '2023-12-01', 'Available', 2);

-- Insert staff
INSERT INTO staff (first_name, last_name, role, hire_date, salary, specialization) VALUES
('Dr. Sarah', 'Johnson', 'Veterinarian', '2020-01-15', 85000.00, 'Large Animal Medicine'),
('Mike', 'Thompson', 'Caretaker', '2021-03-20', 45000.00, 'Aquatic Animals'),
('Lisa', 'Chen', 'Trainer', '2019-07-10', 52000.00, 'Behavioral Training'),
('Dr. Robert', 'Williams', 'Veterinarian', '2018-05-05', 90000.00, 'Exotic Animals'),
('Jenny', 'Davis', 'Administrator', '2022-01-01', 65000.00, 'Operations Management'),
('Tom', 'Martinez', 'Caretaker', '2021-11-15', 42000.00, 'Domestic Animals');

-- Insert medical records
INSERT INTO medical_records (animal_id, staff_id, visit_date, diagnosis, treatment, medication, follow_up_required) VALUES
(1, 1, '2024-01-20', 'Routine Checkup', 'Vaccinations updated, general health good', 'Rabies vaccine', FALSE),
(2, 4, '2024-02-25', 'Dental Cleaning', 'Dental scaling and cleaning performed', 'Pain medication', TRUE),
(3, 1, '2024-03-10', 'Hoof Care', 'Trimmed hooves, applied protective coating', NULL, FALSE),
(5, 4, '2024-04-05', 'Skin Lesion', 'Treated minor skin irritation', 'Antibiotic cream', TRUE),
(9, 1, '2024-05-01', 'Joint Mobility', 'Assessed joint health, recommended exercise plan', 'Joint supplement', FALSE);