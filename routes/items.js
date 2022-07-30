const express = require('express');
const itemController = require('../controllers/itemsController');

const router = express.Router();

router.get('/', itemController.itemList);

module.exports = router;
