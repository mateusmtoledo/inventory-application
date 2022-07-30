const Item = require('../models/Item');
const Category = require('../models/Category');

exports.itemList = (req, res, next) => {
  Item.find({}).limit(10).exec((err, items) => {
    if(err) {
      next(err);
      return;
    }
    res.render('itemList', { title: 'Items', items })
  });
}

exports.itemDetails = (req, res, next) => {
  const { itemId } = req.params;
  Item.findById(itemId).populate('category').exec((err, item) => {
    if(err) {
      next(err);
      return;
    }
    res.render('itemDetails', { item });
  });
}
