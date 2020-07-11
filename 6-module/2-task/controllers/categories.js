const Category = require('../models/Category');
const {isArray} = require('lodash');

module.exports.categoryList = async function categoryList(ctx, next) {
  const categories = await Category.find({}).select('title subcategories');

  ctx.body = {categories: normalizeData(categories)};

  next();
};

const normalizeData = (data) => {
  return data.map((item) => {
    const normalizedItem = {
      id: item.id,
      title: item.title,
    };

    if (isArray(item.subcategories)) {
      normalizedItem.subcategories = normalizeData(item.subcategories);
    }

    return normalizedItem;
  });
};
