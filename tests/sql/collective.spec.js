import { test, expect } from "@playwright/test";
import mysql from 'mysql2/promise';

//Set up the db connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password123',
    database: 'animal_sanctuary'
};

//Establish the db connection
let connection;

//Set up the connection before each test
test.beforeEach(async () => {
    connection = await mysql.createConnection(dbConfig);
});
//Close the connection after each test
test.afterEach(async () => {
    if (connection) {
        await connection.end();
    }
});

//Test 1 : Should find all dogs that has a weight between x and y
test("should find all animals ", async () => {

    //Make the query
    const [rows] = await connection.execute('SELECT * FROM animals');

    //From my side - I would expect the data to be returned in an array

    //Let's get the weight of all dogs

    //20 - lower limit
    //30 - upper limit

    const array = [];

    for (let i = 0; i < rows.length; i++) {

        //So here we're checking the weight that it's between what Petro said - meaning between 20 and 30
        if (rows[i].weight_kg > 0 && rows[i].weight_kg <= 100 && rows[i].species === 'Dog') {
            array[i] = rows[i]
            console.log(`FOUND ONE for Name: ${rows[i].name} and weight ${rows[i].weight_kg}! :)`);
        }
    }



    //We've found the dogs and now we need to sort them weight_kg descending
    array.sort((b, a) => a.weight_kg + b.weight_kg);
    const filteredArray = array.filter(element => element !== undefined);
    console.log(`This is what it looks like after sorting them by descending ${JSON.stringify(filteredArray, null, 2)}`);







    // const demonstratei = rows[0].weight_kg > 20;

    // const findAnimalWeight = rows[0].weight_kg
    // console.log("This is the first row's animal weight " + findAnimalWeight);

    // const findAnimalType = rows[0].species;
    // console.log("This is the first row's animal type " + findAnimalType);






    //We can add sorting - we want to sort weight from ascending to descending

    //We'll need to count how many dogs (animals) is returned



});

