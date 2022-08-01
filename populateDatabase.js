require('dotenv').config();
const async = require('async');
const Item = require('./models/Item');
const Category = require('./models/Category');

const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const ITEM_URL = 'https://pokeapi.co/api/v2/item/';
const CATEGORY_URL = 'https://pokeapi.co/api/v2/item-category/';

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function createCategory(category) {
  return {
    name: category.names.find((element) => element.language.name === 'en').name,
    refName: category.name,
  }
}

function getCategory(url, callback) {
  fetch(url)
      .then((response) => response.json())
      .then((category) => {
        const categoryInstance = new Category(createCategory(category));
        categoryInstance.save((err) => {
          if(err) {
            console.log(err);
            return;
          }
          callback(null, categoryInstance);
        });
      });
}

const categoryFnArray = [];

function getCategories(url, callback) {
  fetch(url)
      .then((response) => response.json())
      .then((list) => {
        list.results.forEach((result) => {
          categoryFnArray.push(getCategory.bind(this, result.url));
        });
        if (list.next) getCategories(list.next, callback);
        else {
          async.parallel(categoryFnArray, (err, categories) => {
            if(err) {
              console.log(err);
              return;
            }
            callback(null, categories);
          });
        }
      });
}

function createItem(item, categoryId) {
  return {
    name: item.names.find((name) => name.language.name === 'en').name,
    description: item.flavor_text_entries
      .find((item) => item.language.name === 'en')
      .text
      .split('\n')
      .join(' '),
    price: Number(item.cost),
    numberInStock: Math.floor(Math.random() * 3000),
    category: categoryId,
    categoryUrl: item.category.url,
    image: item.sprites.default,
  };
}

function getItem(id, callback) {
  fetch(ITEM_URL + id)
    .then((response) => response.json())
    .then((item) => {
        Category.findOne({ refName: item.category.name }, '_id', (err, category) => {
          if(err) {
            callback(err, null);
            return;
          }
          const itemInstance = new Item(createItem(item, category._id));
          itemInstance.save((err) => {
            if(err) {
              callback(err, null);
              return;
            }
            callback(null, itemInstance);
          });
        });
      });
}

function getItems(callback) {
  const functions = [];
  for(let i = 1; i <= 100; i++) {
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

async.series([
  function(callback) {
    getCategories(CATEGORY_URL, callback);
  },
  getItems
], (err, results) => {
  if(err) return console.log(err);
  console.log('Finished');
});
