const express = require('express');
const router = express.Router();
const investorToggleController = require('../controller/investorToggleController');

router.get('/investortoggle', investorToggleController.getToggle);
router.put('/investortoggle', investorToggleController.updateToggle);

module.exports = router;
