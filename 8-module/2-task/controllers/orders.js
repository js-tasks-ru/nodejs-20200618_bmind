const Order = require('../models/Order');
const Product = require('../models/Product');
const sendMail = require('../libs/sendMail');

module.exports.checkout = async function checkout(ctx, next) {
  const {product: productId, phone, address} = ctx.request.body;
  const {user} = ctx;

  try {
    const order = await Order.create({user, product: productId, phone, address});
    const product = await Product.findById(productId);

    await sendMail({
      template: 'order-confirmation',
      locals: {id: productId, product},
      to: user.email,
      subject: 'Подтвердите почту',
    });

    ctx.response.body = {order: order._id};
  } catch (err) {
    const errors = Object.entries(err.errors).reduce((errors, [key, value]) => {
      errors[key] = value && value.properties && value.properties.message;
      return errors;
    }, {});

    ctx.response.status = 400;
    ctx.response.body = {errors};
  }
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const orders = await Order.find({user: ctx.user.id});

  ctx.response.body = {orders};
};
