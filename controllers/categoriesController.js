const Category = require('../models/Category');
const Item = require('../models/Item');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.categoryList = (req, res, next) => {
  Category.find({}).sort('1').limit(60).exec((err, categories) => {
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
      res.redirect(category.url);
    });
  },
];

exports.updateCategoryGet = (req, res, next) => {
  const { categoryId } = req.params;
  Category.findById(categoryId, (err, category) => {
    if(err) {
      next(err);
      return;
    }
    if(!category) res.redirect('/categories');
    else res.render('categoryForm', { title: 'Update Category', category })
  });
};

exports.updateCategoryPost = [
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
    const { categoryId } = req.params;
    const updates = { name: req.body.name, description: req.body.description };
    Category.findByIdAndUpdate(categoryId, updates, (err, category) => {
      if(err) {
        next(err);
        return;
      }
      res.redirect(category.url);
    });
  },
];

exports.deleteCategoryGet = (req, res, next) => {
  const { categoryId } = req.params;
  async.parallel({
    category(callback) {
      Category.findById(categoryId, callback);
    },
    items(callback) {
      Item.find({ category: categoryId }, callback);
    },
  }, (err, results) => {
    if(err) {
      next(err);
      return;
    }
    const { category, items } = results;
    if(!category) res.redirect('/categories');
    else res.render('categoryDelete', { category, items });
  });
};

exports.deleteCategoryPost = (req, res, next) => {
  const { categoryId } = req.params;
  async.parallel({
    category(callback) {
      Category.findById(categoryId, callback);
    },
    items(callback) {
      Item.find({ category: categoryId }, callback);
    },
  }, (err, results) => {
    const { category, items } = results;
    if(err) {
      next(err);
      return;
    }
    if(items.length) res.render('categoryDelete', { category, items });
    else {
      Category.findByIdAndDelete(categoryId, (err) => {
        if(err) {
          next(err);
          return;
        }
        res.redirect('/categories');
      });
    }
  });
};
