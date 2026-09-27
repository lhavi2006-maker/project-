const express = require('express');
const router = express.Router();
const {
  createFAQ,
  getFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  searchFAQs,
} = require('../controllers/faqController');
const { protect } = require('../middleware/authMiddleware');

// IMPORTANT: /search must come before /:id or Express will treat "search" as an :id
router.get('/search', searchFAQs);

router.route('/').get(getFAQs).post(protect, createFAQ);

router.route('/:id').get(getFAQById).put(protect, updateFAQ).delete(protect, deleteFAQ);

module.exports = router;
