const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const Session = require('./models/Session');
const uuid = require('uuid/v4');
const handleMongooseValidationError = require('./libs/validationErrors');
const mustBeAuthenticated = require('./libs/mustBeAuthenticated');
const {login} = require('./controllers/login');
const {oauth, oauthCallback} = require('./controllers/oauth');
const {me} = require('./controllers/me');

const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = {error: err.message};
    } else {
      console.error(err);
      ctx.status = 500;
      ctx.body = {error: 'Internal server error'};
    }
  }
});

app.use((ctx, next) => {
  ctx.login = async function (user) {
    const token = uuid();

    const session = new Session({
      token,
      lastVisit: new Date(),
      user: user._id,
    });

    session.save();

    return token;
  };

  return next();
});

app.use(async (ctx, next) => {
  const {url, headers} = ctx.req;

  if (!url.startsWith('/api/')) return next();
  if (!headers.authorization) return next();

  const token = headers.authorization.split(' ')[1];
  const session = await Session.findOne({token}).populate('user');

  if (session === null) {
    ctx.throw(401, 'Неверный аутентификационный токен');
  }

  session.lastVisit = new Date();
  await session.save();

  ctx.user = session.user;

  return next();
});

const router = new Router({prefix: '/api'});

router.use(async (ctx, next) => {
  const header = ctx.request.get('Authorization');
  if (!header) return next();

  return next();
});

router.post('/login', login);

router.get('/oauth/:provider', oauth);
router.post('/oauth_callback', handleMongooseValidationError, oauthCallback);

router.get('/me', mustBeAuthenticated, me);

app.use(router.routes());

// this for HTML5 history in browser
const fs = require('fs');

const index = fs.readFileSync(path.join(__dirname, 'public/index.html'));
app.use(async (ctx) => {
  if (ctx.url.startsWith('/api') || ctx.method !== 'GET') return;

  ctx.set('content-type', 'text/html');
  ctx.body = index;
});

module.exports = app;
