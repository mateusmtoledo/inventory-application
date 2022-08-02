const express = require('express');
const itemController = require('../controllers/itemsController');

const router = express.Router();

router.get('/', itemController.itemList);

router.get('/create', itemController.newItemGet);

router.post('/create', itemController.newItemPost);

router.get('/:itemId', itemController.itemDetails);

module.exports = router;
