const FAQ = require('../models/FAQ');

// @route POST /api/faqs (private)
const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer || !category) {
      res.status(400);
      throw new Error('Please provide question, answer and category');
    }

    const faq = await FAQ.create({
      question,
      answer,
      category,
      createdBy: req.user._id,
    });

    res.status(201).json(faq);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/faqs (public)
const getFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/faqs/:id (public)
const getFAQById = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id).populate('createdBy', 'name email');
    if (!faq) {
      res.status(404);
      throw new Error('FAQ not found');
    }
    res.json(faq);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/faqs/:id (private, owner or admin)
const updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      res.status(404);
      throw new Error('FAQ not found');
    }

    if (faq.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this FAQ');
    }

    faq.question = req.body.question || faq.question;
    faq.answer = req.body.answer || faq.answer;
    faq.category = req.body.category || faq.category;

    const updatedFAQ = await faq.save();
    res.json(updatedFAQ);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/faqs/:id (private, owner or admin)
const deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      res.status(404);
      throw new Error('FAQ not found');
    }

    if (faq.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this FAQ');
    }

    await faq.deleteOne();
    res.json({ message: 'FAQ removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/faqs/search?q=keyword (public)
const searchFAQs = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400);
      throw new Error('Please provide a search query using ?q=');
    }

    const faqs = await FAQ.find({
      $or: [
        { question: { $regex: q, $options: 'i' } },
        { answer: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
    }).populate('createdBy', 'name email');

    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

module.exports = { createFAQ, getFAQs, getFAQById, updateFAQ, deleteFAQ, searchFAQs };
