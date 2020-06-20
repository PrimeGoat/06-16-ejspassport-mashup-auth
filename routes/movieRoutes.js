const express = require('express');
const router = express.Router();

const thirdPartyController = require('../controllers/thirdPartyController');

router.get('/', thirdPartyController.movies);

module.exports = router;