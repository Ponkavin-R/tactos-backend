const express = require('express');
const router = express.Router();
const clientsayController = require('../controller/clientsayController');

router.get('/clientsay', clientsayController.getToggle);
router.put('/clientsay', clientsayController.updateToggle);

module.exports = router;
