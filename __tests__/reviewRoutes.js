const request = require('supertest');
const app = require('../app');


async function loginUser() {
  const loginResponse = await request(app.callback())
    .post('/api/v1/users/login')
    .send({
      username: 'alice',
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

describe('Review Routes Integration Tests', () => {
  let token;

  beforeAll(async () => {
    token = await loginUser();
  });

  describe('GET /api/v1/reviews/books/:BookID', () => {
    it('retrieves all reviews for a specific book', async () => {
      const bookId = 33; 
      const res = await request(app.callback()).get(`/api/v1/reviews/books/${bookId}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/v1/reviews/books/:BookID', () => {
    it('creates a new review for a book', async () => {
      const bookId = 34; 
      const reviewData = {
        Rating: 5,
        ReviewText: "Excellent read!"
      };
      const res = await request(app.callback())
        .post(`/api/v1/reviews/books/${bookId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('ID');
    });
  });

  describe('PUT /api/v1/reviews/:id', () => {
    it('updates a review', async () => {
      const reviewId = 2; 
      const updatedReviewData = {
        Rating: 4,
        ReviewText: "Still good, but found some issues on second reading."
      };
      const res = await request(app.callback())
        .put(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedReviewData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('updated', true);
    });
  });

  describe('DELETE /api/v1/reviews/:id', () => {
    it('deletes a review', async () => {
      const reviewId = 2; // 
      const res = await request(app.callback())
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('deleted', true);
    });
  });
  
});

describe('Review Routes Integration Tests for User Role', () => {
  let token;

  beforeAll(async () => {
    token = await loginUser2();
  });

  describe('GET /api/v1/reviews/books/:BookID', () => {
    it('allows a user to retrieve all reviews for a specific book', async () => {
      const bookId = 33; // Example Book ID
      const res = await request(app.callback())
        .get(`/api/v1/reviews/books/${bookId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/v1/reviews/books/:BookID', () => {
    it('allows a user to create a new review for a book', async () => {
      const bookId = 34; // Example Book ID for creating a review
      const reviewData = {
        Rating: 5,
        ReviewText: "Excellent read!",
      };
      const res = await request(app.callback())
        .post(`/api/v1/reviews/books/${bookId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData);

      expect(res.statusCode).toEqual(201); // Assuming 201 is used for successful creation
      expect(res.body).toHaveProperty('ID');
    });
  });

  // Assuming we simulate ownership by creating a review first and then trying to update it
  describe('PUT /api/v1/reviews/:id', () => {
    it('allows a user to update their own review', async () => {
      // Example review ID that this user owns
      const reviewId = 22; 
      const updatedReviewData = {
        Rating: 4,
        ReviewText: "Still good, but found some issues on second reading."
      };
      const res = await request(app.callback())
        .put(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedReviewData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('updated', true);
    });
  });

  describe('DELETE /api/v1/reviews/:id', () => {
    it('allows a user to delete their own review', async () => {
      // Example review ID that this user owns
      const reviewId = 22; // Adjust based on the actual ID after creating a review
      const res = await request(app.callback())
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('deleted', true);
    });
  });
    describe('DELETE /api/v1/reviews/:id', () => {
    it('should return 403 Forbidden when trying to delete someone else\'s review', async () => {
      // Example review ID that this user does not own
      const reviewId = 14; // Assuming this ID belongs to another user's review
      const res = await request(app.callback())
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(403); // Expecting Forbidden status code
      
    });
  });

  describe('PUT /api/v1/reviews/:id', () => {
    it('should return 403 Forbidden when trying to update someone else\'s review', async () => {
      // Example review ID that this user does not own
      const reviewId = 14; // Assuming this ID belongs to another user's review
      const updatedReviewData = {
        Rating: 4,
        ReviewText: "Trying to update someone else's review."
      };
      const res = await request(app.callback())
        .put(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedReviewData);

      expect(res.statusCode).toEqual(403); // Expecting Forbidden status code
      
    });
  });

});