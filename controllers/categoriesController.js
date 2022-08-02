const Category = require('../models/Category');
const Item = require('../models/Item');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.categoryList = (req, res, next) => {
  Category.find({}).limit(10).exec((err, categories) => {
    if(err) {
      next(err);
      return;
    }
    res.render('categoryList', { title: 'Categories', categories })
  });
};

exports.categoryDetails = (req, res, next) => {
  const { categoryId } = req.params;
  async.parallel({
    category(callback) {
      Category.findById(categoryId, (err, category) => {
        if(err) {
          callback(err, null);
          return;
        }
        callback(null, category);
      })
    },
    items(callback) {
      Item.find({ category: categoryId }).limit(10).exec((err, items) => {
        if(err) {
          callback(err,null);
          return;
        }
        callback(null, items);
      });
    },
  }, (err, results) => {
    if(err) {
      next(err);
      return;
    }
    const { category, items } = results
    res.render('categoryDetails', { category, items });
  });
};

exports.addCategoryGet = (req, res, next) => {
  res.render('categoryForm', { title: 'New Category' });
};

exports.addCategoryPost = [
  body('name')
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage('You must enter a category name')
      .custom((value) => {
        return Category.findOne({ name: value }).then((category) => {
          if(category) return Promise.reject('Category already exists');
        });
      }),
  body('description').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      res.render('categoryForm', { title: 'New Category', errors: errors.array()});
      return;
    }
    const category = new Category(req.body);
    category.save((err) => {
      if(err) {
        next(err);
        return;
      };
      res.redirect('/categories');
    });
  },
];
