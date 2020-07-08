const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let appendNewMessage;
const getNewPromise = () =>
  new Promise((resolve) => {
    appendNewMessage = resolve;
  });
let promise = getNewPromise();

router.get('/subscribe', async (ctx, next) => {
  ctx.response.body = await promise;
  promise = getNewPromise();

  return next();
});

router.post('/publish', async (ctx, next) => {
  const {message} = ctx.request.body;

  if (message) {
    appendNewMessage(message);
    ctx.response.status = 200;
  }

  return next();
});

app.use(router.routes());

module.exports = app;
