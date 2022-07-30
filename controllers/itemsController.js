const Item = require('../models/Item');

exports.itemList = (req, res, next) => {
  Item.find({}).limit(10).exec((err, items) => {
    res.render('itemList', { title: 'Items', items })
  });
}
