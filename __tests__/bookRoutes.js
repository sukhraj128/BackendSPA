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

describe('Book Routes Integration Tests', () => {
  let token;

  beforeAll(async () => {
    token = await loginUser();
  });

  describe('GET /api/v1/books/:id', () => {
    it('retrieves details of a specific book', async () => {
      const bookId = 33; // ID for Harry Potter 
      const res = await request(app.callback()).get(`/api/v1/books/${bookId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('Title', 'Harry Potter and the Philosophers Stone');
    });
  });
    describe('GET /api/v1/books/:id', () => {
    it('retrieves details of a specific book that doesnt exist', async () => {
      const bookId = 125; // ID for Harry Potter 
      const res = await request(app.callback()).get(`/api/v1/books/${bookId}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/v1/books/:id', () => {
    it('updates a book details', async () => {
      const bookId = 34; // ID for The Shining
      const res = await request(app.callback())
        .put(`/api/v1/books/${bookId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          Title: "The Shining",
          AuthorID : 14,
          PublicationYear: "1977" 
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('updated', true);
    });
  });

  describe('DELETE /api/v1/books/:id', () => {
    it('deletes a book', async () => {
      const bookId = 37; // ID for "Half of a Yellow Sun"
      const res = await request(app.callback())
        .delete(`/api/v1/books/${bookId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('deleted', true);
    });
  });
});
