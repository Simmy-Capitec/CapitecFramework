# Gemini's Creative SQL Scenarios - Animal Sanctuary

## 🚀 Overview

This file contains a collection of fun and imaginative SQL queries designed to showcase creative problem-solving using the animal sanctuary database. These scenarios go beyond typical operational reports and explore more playful, "what-if" situations.

---

## 1. The Great Escape Caper

**Goal:** Identify animals that might be potential escape risks based on a combination of their size, species, and habitat characteristics. This is a playful scenario for risk assessment.

**Logic:**
- We'll define "at-risk" animals as those weighing less than 400kg.
- We'll consider habitats with a "weakness" if they are of type 'Outdoor' or have a large temperature range.
- The query will find at-risk animals in these habitats.

```sql
-- Query to find potential escapees
WITH AtRiskHabitats AS (
    SELECT habitat_id
    FROM habitats
    WHERE habitat_type = 'Outdoor' OR (CAST(REPLACE(SUBSTRING_INDEX(temperature_range, '-', -1), '°C', '') AS SIGNED) - CAST(SUBSTRING_INDEX(temperature_range, '-', 1) AS SIGNED)) > 20
)
SELECT
    a.name AS AnimalName,
    a.species,
    a.weight_kg,
    h.habitat_name AS HabitatName,
    h.habitat_type
FROM
    animals a
JOIN
    habitats h ON a.habitat_id = h.habitat_id
WHERE
    a.weight_kg < 400
    AND a.habitat_id IN (SELECT habitat_id FROM AtRiskHabitats);
```

---

## 2. Operation: Animal Friendship

**Goal:** Play matchmaker and find potential friends for lonely animals. We'll look for animals of the same species who are in the same habitat.

**Logic:**
- The query will self-join the `animals` table to compare every animal with every other animal.
- It will filter for pairs of the same species in the same habitat.
- We'll also ensure we don't match an animal with itself.

```sql
-- Query to find potential animal friends
SELECT
    a1.name AS Animal1,
    a1.species,
    h1.habitat_name AS Habitat1,
    a2.name AS Animal2
FROM
    animals a1
JOIN
    animals a2 ON a1.species = a2.species AND a1.animal_id < a2.animal_id
JOIN
    habitats h1 ON a1.habitat_id = h1.habitat_id
WHERE
    a1.habitat_id = a2.habitat_id;
```

---

## 3. The "A-Team" Project

**Goal:** Assemble a specialized "A-Team" of staff for a critical upcoming project (e.g., a new animal arrival). The team needs a vet, a trainer, and a caretaker.

**Logic:**
- We'll use a `CROSS JOIN` to create all possible combinations of staff members.
- Then, we'll filter these combinations to find teams that have one of each required role.
- This is a great example of how to solve complex permutation problems with SQL.

```sql
-- Query to assemble the "A-Team"
SELECT
    vet.first_name AS Veterinarian,
    trainer.first_name AS Trainer,
    caretaker.first_name AS Caretaker
FROM
    staff vet
CROSS JOIN
    staff trainer
CROSS JOIN
    staff caretaker
WHERE
    vet.role = 'Veterinarian'
    AND trainer.role = 'Trainer'
    AND caretaker.role = 'Caretaker'
    AND vet.staff_id != trainer.staff_id
    AND vet.staff_id != caretaker.staff_id
    AND trainer.staff_id != caretaker.staff_id;
```
