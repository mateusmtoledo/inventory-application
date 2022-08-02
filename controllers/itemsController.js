const Item = require('../models/Item');
const Category = require('../models/Category');
const { body, validationResult } = require('express-validator');

exports.itemList = (req, res, next) => {
  Item.find({}).limit(10).exec((err, items) => {
    if(err) {
      next(err);
      return;
    }
    res.render('itemList', { title: 'Items', items })
  });
};

exports.itemDetails = (req, res, next) => {
  const { itemId } = req.params;
  Item.findById(itemId).populate('category').exec((err, item) => {
    if(err) {
      next(err);
      return;
    }
    res.render('itemDetails', { item });
  });
};

exports.newItemGet = (req, res, next) => {
  Category.find().exec((err, categories) => {
    if(err) {
      next(err);
      return;
    }
    res.render('itemForm', { title: 'New Item', categories });
  });
};

exports.newItemPost = [
  body('image', 'Image is required').trim().escape().isLength({ min: 1 }),
  body('name', 'Name is required').trim().escape().isLength({ min: 1 }),
  body('description').trim().escape(),
  body('category', 'Category is required').trim().escape().isLength({ min: 1 }),
  body('price', 'Price should be a number greater than 0').trim().escape().isFloat({ min: 0 }),
  body('numberInStock', 'Number in stock should be an integer greater than 0').trim().escape().isInt({ min: 0 }),

  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      Category.find().exec((err, categories) => {
        if(err) {
          next(err);
          return;
        }
        res.render('itemForm', { title: 'New Item', categories, errors: errors.array() });
      });
      return;
    }
    const item = new Item(req.body);
    item.save((err) => {
      if(err) {
        next(err);
        return;
      }
      res.redirect('/items');
    });
  },
];
