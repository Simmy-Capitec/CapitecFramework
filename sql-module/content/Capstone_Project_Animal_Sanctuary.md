# SQL Capstone Project: Advanced Animal Sanctuary Management

## 🚀 Project Overview

Welcome to your final capstone project! The animal sanctuary has been so successful that it's expanding its operations. With this growth comes a need for more sophisticated data management. Your mission is to upgrade the `animal_sanctuary_capstone` database to handle new challenges, including managing donors, tracking donations, and organizing volunteer efforts.

This project will test your ability to design, modify, and query a relational database to solve real-world problems.

---

## 🎯 Learning Objectives

By the end of this project, you will be able to:
-   **Design and Implement Schema Changes:** Modify an existing database schema to accommodate new requirements.
-   **Establish Complex Relationships:** Create and manage new tables with foreign key constraints.
-   **Perform Advanced Data Manipulation:** Insert, update, and manage data across multiple related tables.
-   **Write Complex Analytical Queries:** Author advanced SQL queries to extract meaningful insights and generate reports.
-   **Automate Database Operations:** Create stored procedures to streamline common tasks.

---

## 📝 Project Phases

This project is divided into four main phases. Complete them in order.

### Phase 1: Database Schema Expansion

Your first task is to modify the `animal_sanctuary_capstone` database schema. You will need to add new tables and modify an existing one.

**Tasks:**

1.  **Create a `donors` table:** This table will store information about individuals who donate to the sanctuary.
    -   `donor_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
    -   `first_name` (VARCHAR)
    -   `last_name` (VARCHAR)
    -   `email` (VARCHAR, UNIQUE)
    -   `join_date` (DATE)

2.  **Create a `donations` table:** This table will track all monetary contributions.
    -   `donation_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
    -   `donor_id` (INT, FOREIGN KEY referencing `donors.donor_id`)
    -   `amount` (DECIMAL)
    -   `donation_date` (DATE)

3.  **Create a `volunteers` table:** This table will manage volunteer information.
    -   `volunteer_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
    -   `first_name` (VARCHAR)
    -   `last_name` (VARCHAR)
    -   `phone` (VARCHAR)
    -   `start_date` (DATE)

4.  **Create a `volunteer_assignments` table:** This is a linking table to track which volunteer is responsible for which animal.
    -   `assignment_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
    -   `volunteer_id` (INT, FOREIGN KEY referencing `volunteers.volunteer_id`)
    -   `animal_id` (INT, FOREIGN KEY referencing `animals.animal_id`)
    -   `task` (VARCHAR, e.g., 'Feeding', 'Cleaning', 'Exercise')
    -   `assignment_date` (DATE)

5.  **Modify the `animals` table:** Add a new column to track special needs.
    -   Add a `dietary_requirements` (TEXT) column to the `animals` table.

---

### Phase 2: Data Population

With the new structure in place, you need to populate the tables with realistic data.

**Tasks:**

1.  **Add Donors:** Insert at least 5 unique donors into the `donors` table.
2.  **Record Donations:** Insert at least 10 donations, ensuring they are linked to the donors you just created.
3.  **Recruit Volunteers:** Insert at least 4 volunteers into the `volunteers` table.
4.  **Assign Tasks:** Create at least 8 volunteer assignments, linking volunteers to different animals.
5.  **Update Animal Diets:** Update the `dietary_requirements` for at least 5 animals with specific notes (e.g., 'Nut-free diet', 'High-protein feed').

---

### Phase 3: Reporting & Analytics

Now, write SQL queries to answer the following questions. These queries should be included in your final submission.

**Required Reports:**

1.  **Top Donors:** Who are the top 3 donors by total donation amount?
2.  **Recent Donations:** List all donations made in the last 6 months.
3.  **Volunteer Assignments:** Create a report showing each volunteer's full name and the name of the animal they are assigned to, along with the task.
4.  **Unassigned Animals:** Which animals currently have no volunteer assigned to them?
5.  **Animal Care Profile:** Write a query that returns a complete profile for a single animal, including its name, species, habitat, medical history (diagnosis and treatment), and dietary requirements.

---

### Phase 4: Automation with Stored Procedures

To make the sanctuary's operations more efficient, create stored procedures for common tasks.

**Tasks:**

1.  **Create `AddNewAnimal` Procedure:**
    -   This procedure should accept parameters for a new animal's name, species, breed, age, weight, arrival date, and habitat ID.
    -   It should insert the new animal into the `animals` table.

2.  **Create `RecordDonation` Procedure:**
    -   This procedure should take a donor's email, the donation amount, and the donation date as input.
    -   It should first check if the donor exists in the `donors` table.
    -   If the donor exists, it uses their `donor_id` to record the new donation.
    -   If the donor does not exist, it should first create a new donor record and then record the donation.

---

## 📦 Submission Guidelines

-   Submit a single SQL script file named `capstone_submission.sql`.
-   The script should be well-commented and organized by phase.
-   It must contain all `CREATE TABLE`, `ALTER TABLE`, `INSERT`, `UPDATE`, and query statements.
-   The script should be executable and run without errors from top to bottom.

## ⚖️ Evaluation Criteria

Your project will be evaluated based on the following:
-   **Correctness:** All SQL statements execute successfully and produce the correct results.
-   **Schema Design:** The database modifications are logical and use appropriate data types and constraints.
-   **Query Complexity:** The analytical queries correctly use JOINs, aggregate functions, and subqueries where appropriate.
-   **Code Quality:** The SQL code is clean, well-formatted, and includes comments explaining your logic.
