require('dotenv').config();
const async = require('async');
const Item = require('./models/Item');
const Category = require('./models/Category');

const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const API_URL = 'https://pokeapi.co/api/v2/item/';

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function createItem(item) {
  return {
    _id: item.id,
    name: item.names.find((name) => name.language.name === 'en').name,
    description: item.flavor_text_entries
      .find((item) => item.language.name === 'en')
      .text
      .split('\n')
      .join(' '),
    price: Number(item.cost),
    numberInStock: Math.floor(Math.random() * 3000),
    category: Number(item.category.url.split('/').filter((element) => element).pop()),
    categoryUrl: item.category.url,
    image: item.sprites.default,
  };
}

function createCategory(category) {
  return {
    _id: category.id,
    name: category.names.find((element) => element.language.name === 'en').name,
  }
}

function getItem(id, callback) {
  fetch(API_URL + id)
    .then((response) => response.json())
    .then((item) => {
      if(item.cost !== 0) {
        const newItem = createItem(item);
        const itemInstance = new Item(newItem);
        itemInstance.save((err) => {
          if(err) {
            callback(err, null);
            return;
          }
          callback(null, newItem);
        });
      } else {
        callback(null);
      }
    });
}

function getItems(callback) {
  const functions = [];
  for(let i = 1; i < 50; i++) {
    functions.push(getItem.bind(this, i));
  }
  async.parallel(functions, (err, results) => {
    if(err) {
      console.log(err);
      return;
    }
    const items = results.filter((item) => item);
    callback(null, items);
  });
}

function getCategory(item, callback) {
  fetch(item.categoryUrl)
      .then((response) => response.json())
      .then((category) => {
        const newCategory = createCategory(category);
        const categoryInstance = new Category(newCategory);
        categoryInstance.save((err) => {
          if(err) {
            console.log(err);
            return;
          }
          callback(null, newCategory);
        });
      });
}


function getCategories(items, callback) {
  const categoryIds = [];
  const functions = [];
  for(let i = 0; i < items.length; i++) {
    if(categoryIds.includes(items[i].category)) continue;
    categoryIds.push(items[i].category);
    functions.push(getCategory.bind(this, items[i]));
  }
  async.parallel(functions, (err, results) => {
    if(err) {
      console.log(err);
      return;
    }
    callback(null, [items, results]);
  });
}

async.waterfall([
  getItems,
  getCategories
], (err, results) => {
  if(err) return console.log(err);
  console.log('Finished');
});
