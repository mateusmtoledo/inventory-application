const Item = require('../models/Item');
const Category = require('../models/Category');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.itemList = (req, res, next) => {
  const pageNumber = Number((req.query.page === undefined) || req.query.page);
  if(!pageNumber || pageNumber < 1) {
    res.redirect('/items');
    return;
  }
  const itemsPerPage = 10;
  async.parallel({
    items(callback) {
      Item.find({}).limit(itemsPerPage).skip((pageNumber - 1) * itemsPerPage).exec(callback);
    },
    itemCount(callback) {
      Item.countDocuments({}, callback);
    },
  }, (err, results) => {
    if(err) {
      next(err);
      return;
    }
    const { items, itemCount } = results;
    const totalPages = Math.ceil(itemCount / itemsPerPage);
    if(pageNumber > totalPages) res.redirect(`/items?page=${totalPages}`);
    else res.render('itemList', { title: 'Items', items, pageNumber, totalPages });
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
  body('image', 'Image is required').trim().isLength({ min: 1 }).isURL().withMessage('Image field should have a valid url'),
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
      res.redirect(item.url);
    });
  },
];

exports.updateItemGet = (req, res, next) => {
  const { itemId } = req.params;

  async.parallel({
    item(callback) {
      Item.findById(itemId, callback);
    },
    categories(callback) {
      Category.find(callback);
    },
  }, (err, results) => {
    const { item, categories } = results;
    if(err) {
      next(err);
      return;
    }
    if(!item) res.redirect('/items');
    else {
      Category.find((err, categories) => {
        if(err) {
          next(err);
          return;
        }
        res.render('itemForm', { title: 'Update Item', item, categories });
      });
    }
  });
};

exports.updateItemPost = [
  body('image', 'Image is required').trim().isLength({ min: 1 }).isURL().withMessage('Image field should have a valid url'),
  body('name', 'Name is required').trim().escape().isLength({ min: 1 }),
  body('description').trim().escape(),
  body('category', 'Category is required').trim().escape().isLength({ min: 1 }),
  body('price', 'Price should be a number greater than 0').trim().escape().isFloat({ min: 0 }),
  body('numberInStock', 'Number in stock should be an integer greater than 0').trim().escape().isInt({ min: 0 }),

  (req, res, next) => {
    const errors = validationResult(req);
    const { itemId } = req.params;
    if(!errors.isEmpty()) {
      async.parallel({
        item(callback) {
          Item.findById(itemId, callback);
        },
        categories(callback) {
          Category.find(callback);
        },
      }, (err, results) => {
        const { item, categories } = results;
        if(err) {
          next(err);
          return;
        }
        if(!item) res.redirect('/items');
        else res.render('itemForm', { title: 'Update Item', item, categories, errors: errors.array() });
      });
      return;
    }

    const updates = {
      image: req.body.image,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
    };

    Item.findByIdAndUpdate(itemId, updates, (err, item) => {
      if(err) {
        next(err);
        return;
      }
      res.redirect(item.url);
    });
  }
];

exports.deleteItemGet = (req, res, next) => {
  const { itemId } = req.params;
  Item.findById(itemId, (err, item) => {
    if(err) {
      next(err);
      return;
    }
    if(!item) res.redirect('/items');
    else res.render('itemDelete', { item });
  });
};

exports.deleteItemPost = (req, res, next) => {
  const { itemId } = req.params;
  Item.findByIdAndDelete(itemId, (err) => {
    if(err) {
      next(err);
      return;
    }
    else res.redirect('/items');
  });
};
