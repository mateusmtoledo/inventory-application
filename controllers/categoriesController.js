const Category = require('../models/Category');
const Item = require('../models/Item');
const async = require('async');

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
      Item.find({ category: categoryId }, 'name image').limit(10).exec((err, items) => {
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
