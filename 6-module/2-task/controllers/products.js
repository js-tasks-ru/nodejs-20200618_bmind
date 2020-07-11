const mongoose = require('mongoose');
const Product = require('../models/Product');

module.exports.productsBySubcategory = async function productsBySubcategory(
  ctx,
  next
) {
  const {subcategory} = ctx.query;

  if (!subcategory) return next();

  const products = await Product.find({
    subcategory: new mongoose.Types.ObjectId(subcategory),
  });

  ctx.body = {products: normalizeData(products)};
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.find({});

  ctx.body = {products: normalizeData(products)};

  return next();
};

module.exports.productById = async function productById(ctx, next) {
  const {id} = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.res.statusCode = 400;
    ctx.res.end('Invalid product id');

    return next();
  }

  const product = await Product.findById(id);

  if (product === null) ctx.statusCode = 404;
  else ctx.body = {product: normalizeData(product)};

  return next();
};

const normalizeData = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeData(item));
  }

  const {
    _id: id,
    title,
    description,
    price,
    category,
    subcategory,
    images,
  } = data;

  return {id, title, description, price, category, subcategory, images};
};
