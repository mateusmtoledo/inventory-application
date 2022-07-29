const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String },
  price: { type: Number, required: true },
  numberInStock: { type: Number, required: true },
});

ItemSchema.virtual('url').get(() => {
  return ('/inventory/item/' + this._id);
});

module.exports = mongoose.model('Item', ItemSchema);
