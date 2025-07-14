# DBeaver MySQL Local Database Setup Guide

## Overview
This guide will help you set up a local MySQL database using DBeaver with an animal-themed sample database for practice and testing. This setup works entirely on your local machine and doesn't require external network connections.

---

## Step 1: Install MySQL Server

### Windows
1. **Download MySQL Installer:**
   - Go to https://dev.mysql.com/downloads/installer/
   - Download "MySQL Installer for Windows" (mysql-installer-web-community)

2. **Install MySQL:**
   - Run the installer as Administrator
   - Choose "Developer Default" setup type
   - Click "Execute" to download and install components
   - **Important:** During configuration, set a root password you'll remember (e.g., `password123`)
   - Keep default port 3306
   - Complete the installation

3. **Verify Installation:**
   - Open Command Prompt as Administrator
   - Type: `mysql --version`
   - You should see MySQL version information

### macOS
1. **Install using Homebrew (Recommended):**
   ```bash
   # Install Homebrew if you don't have it
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MySQL
   brew install mysql
   
   # Start MySQL service
   brew services start mysql
   
   # Secure installation (set root password)
   mysql_secure_installation
   ```

2. **Alternative: Download MySQL Installer:**
   - Go to https://dev.mysql.com/downloads/mysql/
   - Download "MySQL Community Server" for macOS
   - Install the .dmg file
   - Start MySQL from System Preferences → MySQL

3. **Verify Installation:**
   - Open Terminal
   - Type: `mysql --version`

---

## Step 2: Configure DBeaver Connection

### Connect to MySQL
1. **Open DBeaver**
2. **Create New Connection:**
   - Click "New Database Connection" (plug icon) or File → New → Database Connection
   - Select "MySQL" from the list
   - Click "Next"

3. **Connection Settings:**
   - **Server Host:** `localhost`
   - **Port:** `3306` (default)
   - **Database:** Leave empty for now
   - **Username:** `root`
   - **Password:** Enter the password you set during MySQL installation
   - **Save password:** Check this box

Go to driver properties tab, look for 'allowPublicKeyRetrieval' and set that to true

4. **Test Connection:**
   - Click "Test Connection"
   - If prompted, download MySQL driver (click "Download")
   - Should show "Connected" message

5. **Finish Setup:**
   - Click "Finish"
   - You should see "MySQL - localhost" in the Database Navigator

---

## Step 3: Create Animal-Themed Database

### Create Database and Tables
1. **Create New Database:**
   ```sql
   CREATE DATABASE animal_sanctuary;
   USE animal_sanctuary;
   ```

2. **Create Tables:**
   ```sql
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
   ```

### Insert Sample Data
```sql
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
```

---

## Step 4: Practice Queries

### Basic Queries to Try
```sql
-- View all animals
SELECT * FROM animals;

-- Find available animals for adoption
SELECT name, species, breed, age 
FROM animals 
WHERE adoption_status = 'Available';

-- Count animals by species
SELECT species, COUNT(*) as count 
FROM animals 
GROUP BY species;

-- Find animals and their habitats
SELECT a.name, a.species, h.habitat_name, h.habitat_type
FROM animals a
JOIN habitats h ON a.habitat_id = h.habitat_id;

-- Show medical records with animal and staff details
SELECT a.name as animal_name, 
       CONCAT(s.first_name, ' ', s.last_name) as veterinarian,
       mr.visit_date, mr.diagnosis, mr.treatment
FROM medical_records mr
JOIN animals a ON mr.animal_id = a.animal_id
JOIN staff s ON mr.staff_id = s.staff_id
ORDER BY mr.visit_date DESC;

-- Find overcrowded habitats
SELECT habitat_name, capacity, current_occupancy,
       (current_occupancy / capacity * 100) as occupancy_percentage
FROM habitats
WHERE current_occupancy > capacity * 0.8;
```

---

## Step 5: DBeaver Tips & Features

### Useful DBeaver Features
1. **SQL Editor:**
   - Create new SQL script: Right-click connection → SQL Editor → New SQL Script
   - Execute query: Ctrl+Enter (Windows) or Cmd+Enter (Mac)
   - Execute all: Ctrl+Alt+X (Windows) or Cmd+Option+X (Mac)

2. **Data Viewer:**
   - Double-click any table to view data
   - Right-click to add/edit/delete rows
   - Use filters in column headers

3. **ER Diagram:**
   - Right-click database → View Diagram
   - Visualize table relationships

4. **Export Data:**
   - Right-click query results → Export Data
   - Multiple formats available (CSV, Excel, JSON, etc.)

### Keyboard Shortcuts
- **Ctrl+Space** (Cmd+Space on Mac): Auto-complete
- **F4**: Show table/column properties
- **Ctrl+Shift+F** (Cmd+Shift+F on Mac): Format SQL
- **Ctrl+/** (Cmd+/ on Mac): Comment/uncomment lines

---

## Troubleshooting

### Common Issues

**Connection Failed:**
- Verify MySQL service is running
- Check username/password
- Ensure port 3306 is not blocked

**"Access denied for user 'root'@'localhost'":**
- Reset MySQL root password:
  ```bash
  # Windows (run as Administrator)
  mysqld --skip-grant-tables
  mysql -u root
  ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
  
  # Mac
  sudo mysql_secure_installation
  ```

**MySQL service won't start:**
- Windows: Check Services app, restart MySQL80 service
- Mac: `brew services restart mysql`

### Getting Help
- Check MySQL error logs (usually in MySQL data directory)
- DBeaver logs: Help → Open Log Folder
- Test connection in DBeaver before creating scripts

---

## Next Steps

Once you have this setup working, you can:
1. Practice complex queries with JOINs, subqueries, and window functions
2. Create stored procedures and functions
3. Set up users with different privileges
4. Practice database design with additional tables
5. Learn about indexes and query optimization

The animal sanctuary database provides realistic data relationships for practicing SQL skills while keeping the content engaging and memorable!