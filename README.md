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
function *postArticle() {
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

### API

#### predicateFactory(compareFn, errorCode, errorMessage)

Parameters

* __compareFn__ - a function that return true if the request should be processed
* __errorCode__ - an HTTP code to return if the check fails, i.e 403, 401, etc
* __errorMessage__ - if the check fails, this error message will be returned to
the user like ```{"message": "<errorMessage>"}```

#### Returns: function
__predicateFactory__ returns a function which you can use to wrap your controller methods to decorate them with the permissions checking functionality.

__Example__
```js
let isLoggedIn = predicateFactory(function() { /* ... */}, 401, 'Must be logged in');
app.use(isLoggedIn(controllers.home))
```
