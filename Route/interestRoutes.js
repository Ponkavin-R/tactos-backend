const express = require('express');
const router = express.Router();
const { submitInterest } = require('../controller/interestController');

router.post('/interests', submitInterest);

module.exports = router;
