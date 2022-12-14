const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  numberInStock: { type: Number, required: true },
  image: { type: String, required: true },
});

ItemSchema.virtual('url').get(function() {
  return ('/items/' + this._id);
});

module.exports = mongoose.model('Item', ItemSchema);
