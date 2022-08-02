const express = require('express');
const itemController = require('../controllers/itemsController');

const router = express.Router();

router.get('/', itemController.itemList);

router.get('/create', itemController.newItemGet);

router.post('/create', itemController.newItemPost);

router.get('/:itemId/delete', itemController.deleteItemGet);

router.post('/:itemId/delete', itemController.deleteItemPost);

router.get('/:itemId/update', itemController.updateItemGet);

router.post('/:itemId/update', itemController.updateItemPost);

router.get('/:itemId', itemController.itemDetails);

module.exports = router;
