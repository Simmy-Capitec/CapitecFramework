const axios = require('axios');
const { expect } = require('chai');

describe('Reqres API Tests with x-api-key header', function () {
     this.timeout(5000);

     // Axios instance with base URL and header
     const api = axios.create({
          baseURL: 'https://reqres.in/',
          headers: {
               'x-api-key': 'reqres-free-v1'
          }
     });

     it('GET /api/users?page=1 should return list of users', async () => {
          const response = await api.get('/api/users?page=1');

          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('data').that.is.an('array');
     });

     it('GET /api/users/2 should return user data', async () => {
          const response = await api.get('/api/users/2');

          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('data');
          expect(response.data.data).to.have.property('id', 2);
     });

     it('GET /api/users/23 should return 404 for user not found', async () => {
          try {
               await api.get('/api/users/23');
               // If request does NOT throw, fail the test:
               throw new Error('Expected 404 error but request succeeded');
          } catch (error) {
               expect(error.response.status).to.equal(404);
          }
     });
});