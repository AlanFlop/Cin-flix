import api from './api.service';

const reviewService = {
  async getMovieReviews(movieId) {
    const response = await api.get(`/reviews/movie/${movieId}`);
    return response.data;
  },
  
  async addReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
  
  async updateReview(id, reviewData) {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data;
  },
  
  async deleteReview(id) {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }
};

export default reviewService;