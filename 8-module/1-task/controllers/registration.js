const uuid = require('uuid/v4');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
  const {email, displayName, password} = ctx.request.body;
  const verificationToken = uuid();

  try {
    const user = new User({email, displayName, verificationToken});
    await user.setPassword(password);
    await user.save();

    await sendMail({
      template: 'confirmation',
      locals: {token: verificationToken},
      to: email,
      subject: 'Подтвердите почту',
    });

    ctx.response.body = {status: 'ok'};
  } catch (err) {
    const errors = Object.entries(err.errors).reduce((errors, [key, value]) => {
      errors[key] = value && value.properties && value.properties.message;
      return errors;
    }, {});

    ctx.response.status = 400;
    ctx.response.body = {errors};
  }
};

module.exports.confirm = async (ctx, next) => {
  const {verificationToken} = ctx.request.body;
  const user = await User.findOne({verificationToken});

  if (user === null) {
    ctx.response.code = 400;
    ctx.response.body = {
      error: 'Ссылка подтверждения недействительна или устарела',
    };

    return next();
  }

  user.set('verificationToken');
  await user.save();

  await ctx.login(user);

  ctx.body = {token: verificationToken};

  next();
};
