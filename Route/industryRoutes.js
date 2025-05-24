const express = require('express');
const router = express.Router();
const industryController = require('../controller/industryController');

// POST create new industry
router.post('/industry', industryController.createIndustry);

// GET all industries
router.get('/industry', industryController.getAllIndustries);

// PUT update industry by id
router.put('/industry/:id', industryController.updateIndustry);

// DELETE industry by id
router.delete('/industry/:id', industryController.deleteIndustry);

module.exports = router;
