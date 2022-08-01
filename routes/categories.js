const express = require('express');
const categoriesController = require('../controllers/categoriesController');

const router = express.Router();

router.get('/', categoriesController.categoryList);

router.get('/create', categoriesController.addCategoryGet);

router.post('/create', categoriesController.addCategoryPost);

router.get('/:categoryId', categoriesController.categoryDetails);

module.exports = router;
