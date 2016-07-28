# koa-predicate-factory (WIP)

### Why?

Checking authorization to resources in web-apps usually gets messy, your beautiful succint RESTful API ends up looking like it went through deep spaghettization once you're done applying all the auth logic. 

Usually, something like:

```js
function *postArticle() {
    try {
      let res = yield Article.create(this.params);
      this.body = {success: true}
    } catch(err) {
      this.status = 400;
      this.body = {err: err}
    }
}
app.use(router.post('/article', createArticle);
```

Turns into:

```js
function *postArticle() {
    let permissions = this.req.user && this.req.user.permissions ? this.req.user.permissions : null;
    if ( permissions && permissions.indexOf('create-article') > -1) {
        try {
          let res = yield Article.create(this.params);
          this.body = {success: true}
        } catch(err) {
          this.status = 400;
          this.body = {err: err}
        }    
    } else {
        this.status = 403;
        this.body = {err: 'Unauthorized'};
    }
}
app.use(router.post('/article', createArticle));
```

What's worse is that you end up redoing this permission checking mess over and over again with small changes.  Great place to use the factory pattern. Wouldn't it be nicer to:

```js
function *_postArticle() {
    // .. code ..
}
app.use(router.post('/article', canCreateArticle(postArticle)));
```

### Getting Started

Install:
```bash
npm install koa-predicate-factory
```

Create a predicate:
```js
// predicates.js
'use strict';
const predicateFactory = require('koa-predicate-factory');

function hasValidApiKey() {
    // check something and return a boolean
    return this.request.headers['x-api-key'] == '21GL4hVbxDQz'
}

module.exports = {
    hasValidApiKey: predicateFactory(hasValidApiKey, 403, 'Not authorized');
}
```

Use it:
```js
// index.js
'use strict';

const koa = require('koa')
  , router = require('koa-router')()
  , predicates = require('./predicates')
  ;

var app = koa();

app.use(router.routes())
   .use(router.allowedMethods())
   ;

router.get('/resource', predicates.hasValidApiKey(getResource));

function *getResource() {
    this.body = 'Hello, world!';
}

app.listen(8000);
```







