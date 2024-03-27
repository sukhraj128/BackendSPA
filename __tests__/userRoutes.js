const request = require('supertest');
const app = require('../app'); 

async function loginUser() {
  const loginResponse = await request(app.callback())
    .post('/api/v1/users/login')
    .send({
      username: 'alice', // admin user
      password: 'password', 
    });

  return loginResponse.body.token;
}


describe('User Routes Integration Tests', () => {
  let token;

  beforeAll(async () => {
    token = await loginUser();
  });

  describe('User authentication and operations', () => {
    it('successfully logs in a user', async () => {
      const loginResponse = await request(app.callback())
        .post('/api/v1/users/login')
        .send({
          username: 'alice', // 'alice' is an existing user
          password: 'password',
        });

      expect(loginResponse.statusCode).toEqual(200);
      expect(loginResponse.body).toHaveProperty('token');
      token = loginResponse.body.token; // Store token for future requests
    });

    it('fails to log in with incorrect password', async () => {
      const loginResponse = await request(app.callback())
        .post('/api/v1/users/login')
        .send({
          username: 'alice',
          password: 'wrongPassword',
        });

      expect(loginResponse.statusCode).toEqual(401);
      expect(loginResponse.body).toHaveProperty('message', 'Authentication failed');
    });

    it('creates a new user', async () => {
      const newUser = {
        username: 'newUser',
        password: 'newUserPassword',
        email: 'newuser@example.com',
      };

      const createResponse = await request(app.callback())
        .post('/api/v1/users')
        .send(newUser);

      expect(createResponse.statusCode).toEqual(201);
      expect(createResponse.body).toHaveProperty('created', true);
    });

    it('retrieves details of a specific user', async () => {
      const userId = 1; // ID for an existing user
      const res = await request(app.callback())
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('username');
    });

    it('fails to retrieve a non-existing user', async () => {
      const nonExistingUserId = 9999;
      const res = await request(app.callback())
        .get(`/api/v1/users/${nonExistingUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
    });

    it('updates user details', async () => {
      const userId = 1; 
      const updatedUserData = {
        email: 'updateduser@example.com',
      };

      const updateResponse = await request(app.callback())
        .put(`/api/v1/users/${userId}/update`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedUserData);

      expect(updateResponse.statusCode).toEqual(200);
      expect(updateResponse.body).toHaveProperty('updated', true);
    });
    it('updates user details that does not exist', async () => {
      const userId = 9999999999; // ID not existing user
      const updatedUserData = {
        email: 'updateduser@example.com',
      };

      const updateResponse = await request(app.callback())
        .put(`/api/v1/users/${userId}/update`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedUserData);

      expect(updateResponse.statusCode).toEqual(404);
    });

    it('deletes a user', async () => {
      const userId = 10; 
      const deleteResponse = await request(app.callback())
        .del(`/api/v1/users/${userId}/delete`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.statusCode).toEqual(200);
      expect(deleteResponse.body).toHaveProperty('deleted', true);
    });
    it('deletes a user that does not exist', async () => {
      const userId = 999999; 
      const deleteResponse = await request(app.callback())
        .del(`/api/v1/users/${userId}/delete`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.statusCode).toEqual(404);
    });
  });
  
});

describe('Unauthorized access to user operations', () => {
  it('fails to retrieve user details without authorization token', async () => {
    const userId = 1; 
    const res = await request(app.callback())
      .get(`/api/v1/users/${userId}`);
    
    expect(res.statusCode).toEqual(401); 
    expect(res.body).toHaveProperty('error', 'No token provided');
  });

  it('fails to retrieve user details with invalid authorization token', async () => {
    const userId = 1; 
    const res = await request(app.callback())
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer invalidTokenHere`);
    
    expect(res.statusCode).toEqual(401); // invalid token
    expect(res.body).toHaveProperty('error', 'Invalid token');
  });

});
