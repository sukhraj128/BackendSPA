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

async function loginUser2() {
  const loginResponse = await request(app.callback())
    .post('/api/v1/users/login')
    .send({
      username: 'patrick', // with the role user
      password : 'password',
    });
  return loginResponse.body.token;
}

describe('Author Routes Integration Tests', () => {
  let token;

  beforeAll(async () => {
    token = await loginUser();
  });


  describe('GET /api/v1/authors/:id', () => {
    it('retrieves details of a specific author', async () => {
      const authorId = 1; // Example author ID
      const res = await request(app.callback()).get(`/api/v1/authors/${authorId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ID', authorId);
    });

    it('returns 404 for a non-existent author', async () => {
      const authorId = 9999; // Assuming this author ID does not exist
      const res = await request(app.callback()).get(`/api/v1/authors/${authorId}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /api/v1/authors', () => {
    it('creates a new author', async () => {
      const res = await request(app.callback())
        .post('/api/v1/authors')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'New',
          lastName: 'Author',
          bio: 'A new author bio',
          profilePicURL: 'http://example.com/pic.jpg',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('ID');
    });
  });

  describe('PUT /api/v1/authors/:id', () => {
    it('updates an author details', async () => {
      const authorId = 21; // Example author ID
      const res = await request(app.callback())
        .put(`/api/v1/authors/${authorId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Updated',
          lastName: 'Author',
          bio: 'Updated bio',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('updated', true);
    });
  });

  describe('DELETE /api/v1/authors/:id', () => {
    it('deletes an author', async () => {
      const authorId = 3; // Example author ID
      const res = await request(app.callback())
        .delete(`/api/v1/authors/${authorId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('deleted', true);
    });
  });

  describe('GET /api/v1/authors/by-book/:BookID', () => {
    it('retrieves the author of a specific book', async () => {
      const bookId = 3; // Example book ID
      const res = await request(app.callback()).get(`/api/v1/authors/by-book/${bookId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ID');
    });

    it('returns 404 for a book with no associated author', async () => {
      const bookId = 9999; // Assuming this book ID has no associated author
      const res = await request(app.callback()).get(`/api/v1/authors/by-book/${bookId}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});


describe('Author Routes Integration Tests with User 2', () => {
  let token;

  beforeAll(async () => {
    token = await loginUser2();
  });
  describe('GET /api/v1/authors/:id', () => {
    it('allows retrieving details of a specific author', async () => {
      const authorId = 1; // Example author ID
      const res = await request(app.callback()).get(`/api/v1/authors/${authorId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ID', authorId);
    });
  });

  describe('POST /api/v1/authors', () => {
    it('prevents creating a new author', async () => {
      const res = await request(app.callback())
        .post('/api/v1/authors')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'New',
          lastName: 'Author',
          bio: 'A new author bio',
          profilePicURL: 'http://example.com/pic.jpg',
        });
      expect(res.statusCode).toEqual(403); // Expecting Forbidden due to insufficient permissions
    });
  });

  describe('PUT /api/v1/authors/:id', () => {
    it('prevents updating an author\'s details', async () => {
      const authorId = 21; // Example author ID
      const res = await request(app.callback())
        .put(`/api/v1/authors/${authorId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Updated',
          lastName: 'Author',
          bio: 'Updated bio',
        });
      expect(res.statusCode).toEqual(403); // Expecting Forbidden due to insufficient permissions
    });
  });

  describe('DELETE /api/v1/authors/:id', () => {
    it('prevents deleting an author', async () => {
      const authorId = 9; // Example author ID
      const res = await request(app.callback())
        .delete(`/api/v1/authors/${authorId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(403); // Expecting Forbidden due to insufficient permissions
    });
  });

  describe('GET /api/v1/authors/by-book/:BookID', () => {
    it('allows retrieving the author of a specific book', async () => {
      const bookId = 3; // Example book ID
      const res = await request(app.callback()).get(`/api/v1/authors/by-book/${bookId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('ID');
    });
  });
});