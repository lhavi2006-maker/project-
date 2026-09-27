const express = require('express');
const router = express.Router();
const { generateFAQ } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-faq', protect, generateFAQ);

module.exports = router;
