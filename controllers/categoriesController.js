const Category = require('../models/Category');

exports.categoryList = (req, res, next) => {
  Category.find({}).limit(10).exec((err, categories) => {
    res.render('categoryList', { title: 'Categories', categories })
  });
}
