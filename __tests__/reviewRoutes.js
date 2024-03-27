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
      const reviewId = 1; 
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
