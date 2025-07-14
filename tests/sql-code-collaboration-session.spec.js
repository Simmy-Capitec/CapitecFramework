import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * 🎯 COLLABORATIVE SESSION: SQL + CODE INTEGRATION
 * 
 * Learning Goals:
 * ✅ Write SQL queries to get data
 * ✅ Use that data in JavaScript code
 * ✅ Practice basic coding with real database results
 * ✅ Learn to debug and problem-solve together
 * 
 * 🚀 Session Format:
 * - Each checkpoint has a goal
 * - We'll discuss and write the code together
 * - No pre-made solutions - we build it live!
 */

// Database connection setup
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password123',
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

test.describe('🏥 SQL + Code Integration Practice', () => {

    test('CHECKPOINT 1: Get all animals and count them', async () => {
        //console.log('🔍 CHECKPOINT 1: Let\'s get some basic animal data...');

        // GOAL: Write a SQL query to get all active animals
        // DISCUSSION: What should our SELECT statement include?
        // DISCUSSION: What WHERE clause do we need?

        // TODO: Write SQL query here
        const [animals] = await connection.execute(`SELECT name, species, age FROM animals WHERE is_active = TRUE`);
        expect(Array.isArray(animals)).toBe(true);
        // GOAL: Display the results and count them
        // We'll keep everything in the for loop as requested
        for (let i = 0; i < animals.length; i++) {
            // Show each animal's name, species, and age
            console.log(`${animals[i].name}`);
        }
        // Also show the total count after the loop
        console.log(`Total active animals: ${animals.length}`);
        //console.log(animals[i].name);

        // DISCUSSION: How do we count how many we found?
        // We used Array.length method, in this case animals.length - thanks LR


        // TODO: Check that we found some animals

        expect(animals.length).toBeGreaterThan(0);
        if (animals.length > 0) {

            console.log("There's data! And the table is not empty!");
        }
        // TODO: Loop through animals and display their names

        //console.log('✅ CHECKPOINT 1 DISCUSSION: What did we learn about querying?');
    });

    test.only('CHECKPOINT 2: Find animals by species', async () => {


        // GOAL: Find all dogs in our database
        // DISCUSSION: How do we filter by species?
        // DISCUSSION: Should we order the results?

        // TODO: Write query to find all dogs




        // GOAL: Do something with the dog data
        // DISCUSSION: What information about each dog would be useful?
        // Let's find the dogs and I want to list them in alphabetical order

        const [dogs] = await connection.execute(`SELECT name, species, age, breed FROM animals WHERE species = 'Dog' AND is_active = TRUE ORDER BY name ASC`);
        // DISCUSSION: How do we handle the results in our code?


        //Display dog information
        // dogs.forEach(dog => {
        //     console.log(` ${dog.name} - ${dog.breed} - ${dog.age} `);
        // })


        // TODO: Count how many dogs we have
        // console.log(`Found ${dogs.length} dogs`);

        // TODO: Find the youngest dog
        if (dogs.length > 0) {
            const youngestDog = dogs.reduce((youngest, current) => current.age < youngest.age ? current : youngest);
            console.log(`Youngest dog: ${youngestDog.name} at ${youngestDog.age} years old`);
        }
        // TODO : Find the oldest dog
        if (dogs.length > 0) {
            const oldestDog = dogs.reduce((oldest, current) => current.age > oldest.age ? current : oldest);
            console.log(`Oldest dog: ${oldestDog.name} at ${oldestDog.age} years old`);
        }




    });

    // //
    // if (dogs.length > 0) {
    //     const oldestDog = dogs.reduce((oldest, current) => current.age > oldest.age ? current : oldest);
    //     console.log(`Oldest dog: ${oldestDog.name} at ${oldestDog.age} years old`);
    // }

    // if (dogs.length > 0) {
    //     const youngestDog = dogs.reduce((youngest, current) => current.age < youngest.age ? current : youngest);
    //     console.log(`Youngest dog: ${youngestDog.name} at ${youngestDog.age} years old`);
    // }

    test('CHECKPOINT 3: Calculate simple statistics', async () => {
        console.log('📊 CHECKPOINT 3: Let\'s do some math with our data...');

        // GOAL: Count animals by species
        // DISCUSSION: What SQL function helps us count?
        // DISCUSSION: How do we group data?

        // TODO: Write query to count animals by species
        // const [speciesCount] = await connection.execute(`
        //     SQL query with counting and grouping
        // `);

        // GOAL: Display the statistics nicely
        // DISCUSSION: How do we loop through the results?
        // DISCUSSION: What should we show for each species?

        // TODO: Loop through species and show counts
        // TODO: Find which species has the most animals
        // TODO: Calculate total animals across all species

        console.log('✅ CHECKPOINT 3 DISCUSSION: What did GROUP BY do?');
    });

    test('CHECKPOINT 4: Work with ages and numbers', async () => {
        console.log('🎂 CHECKPOINT 4: Let\'s look at animal ages...');

        // GOAL: Find age-related information
        // DISCUSSION: What age calculations might be useful?
        // DISCUSSION: How do we work with numbers in SQL?

        // TODO: Query for animals with their ages
        // const [animalAges] = await connection.execute(`
        //     SQL query to get animals and ages
        // `);

        // GOAL: Calculate age statistics using JavaScript
        // DISCUSSION: How do we find the average age?
        // DISCUSSION: How do we find the oldest and youngest?

        // TODO: Calculate average age using JavaScript
        // TODO: Find the oldest animal
        // TODO: Find the youngest animal
        // TODO: Count how many animals are older than 5 years

        console.log('✅ CHECKPOINT 4 DISCUSSION: SQL vs JavaScript calculations?');
    });

    test('CHECKPOINT 5: Search for specific animals', async () => {
        console.log('🔍 CHECKPOINT 5: Let\'s search for animals...');

        // GOAL: Find animals with names containing certain letters
        // DISCUSSION: How do we search for partial matches?
        // DISCUSSION: What SQL operator helps with pattern matching?

        // TODO: Find animals with 'a' in their name
        // const [animalsWithA] = await connection.execute(`
        //     SQL query for names containing 'a'
        // `);

        // GOAL: Work with the search results
        // DISCUSSION: What should we do with the results?
        // DISCUSSION: How do we verify our search worked?

        // TODO: Display the matching animals
        // TODO: Check that all names actually contain 'a'
        // TODO: Count how many we found

        console.log('✅ CHECKPOINT 5 DISCUSSION: How does LIKE work?');
    });

    test('CHECKPOINT 6: Compare and sort data', async () => {
        console.log('⚖️ CHECKPOINT 6: Let\'s compare and organize data...');

        // GOAL: Get animals sorted by age
        // DISCUSSION: How do we sort in SQL?
        // DISCUSSION: Oldest first or youngest first?

        // TODO: Get animals sorted by age (you decide the order)
        // const [sortedAnimals] = await connection.execute(`
        //     SQL query with sorting
        // `);

        // GOAL: Do comparisons with the sorted data
        // DISCUSSION: What comparisons make sense?
        // DISCUSSION: How do we work with sorted arrays?

        // TODO: Show the first 3 animals (oldest or youngest)
        // TODO: Compare the first and last animal ages
        // TODO: Find animals older than the average age

        console.log('✅ CHECKPOINT 6 DISCUSSION: Why is sorting useful?');
    });

    test('BONUS CHALLENGE: Put it all together', async () => {
        console.log('🚀 BONUS: Let\'s combine what we learned...');

        // GOAL: Create a "report" using multiple queries and calculations
        // DISCUSSION: What would make a good animal sanctuary report?
        // DISCUSSION: How do we organize multiple pieces of information?

        // TODO: Write 2-3 different SQL queries
        // TODO: Combine the results into a summary
        // TODO: Display a nice report format

        // IDEAS FOR DISCUSSION:
        // - Total number of animals
        // - Breakdown by species
        // - Average age
        // - Oldest and youngest animals
        // - Animals needing attention (very old or very young)

        console.log('✅ BONUS DISCUSSION: What else could we add to our report?');
    });

});

/**
 * 🎓 DISCUSSION TOPICS FOR EACH CHECKPOINT:
 * 
 * CHECKPOINT 1:
 * - Basic SELECT syntax
 * - WHERE clauses
 * - Working with query results in JavaScript
 * 
 * CHECKPOINT 2:
 * - Filtering data
 * - String comparisons
 * - Organizing results
 * 
 * CHECKPOINT 3:
 * - COUNT() function
 * - GROUP BY clause
 * - Aggregating data
 * 
 * CHECKPOINT 4:
 * - Working with numbers
 * - SQL vs JavaScript calculations
 * - When to use which approach
 * 
 * CHECKPOINT 5:
 * - LIKE operator
 * - Pattern matching
 * - Searching strategies
 * 
 * CHECKPOINT 6:
 * - ORDER BY clause
 * - ASC vs DESC
 * - Working with sorted data
 * 
 * BONUS:
 * - Combining multiple concepts
 * - Real-world applications
 * - Building useful reports
 */

/**
 * 🛠️ DEBUGGING TIPS TO DISCUSS:
 * 
 * 1. Always console.log your query results first
 * 2. Check the length of your result arrays
 * 3. Look at the structure of your data
 * 4. Test small parts before combining
 * 5. Use simple SQL first, then add complexity
 */