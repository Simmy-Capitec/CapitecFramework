//console.log('Testing subspecs');
//let response = await request.get('http://localhost:3000/secure-data', {
//  headers: { 'Authorization': `Bearer $ {SECRET_TOKEN}` }
//});

//this is a headers example 

//const loginResponse = await request.post('/login', {
// data: {
//   username: 'testuser',
// password: 'testpassword'
// }
//});

//this is a data example

//okay headers trail 1
//this is my testing URL : https://simmyserver.free.beeceptor.com

console.log('I do not know what I am doing');
let request = await request.get('https://simmyserver.free.beeceptor.com/secure-data', {
    headers: { 'Authorization': `Bearer ${Simmy}` }
});

