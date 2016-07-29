'use strict';

const koa = require('koa')
  , app = koa()
  , predicateFactory = require('../src/index')
  ;

function checkApiKey() {
  // check something and return a boolean
  return this.request.headers['x-api-key'] == '21GL4hVbxDQz';
}

let hasValidApiKey = predicateFactory(checkApiKey, 403, 'Invalid API key');

function* main() {
  this.body = 'Hello, world!'
}

app.use(hasValidApiKey(main));

app.listen(3000);

// try it:
// curl -X GET -H "x-api-key: 21GL4hVbxDQz" "http://localhost:3000"
// Hello, world!
//
// curl -X GET -H "x-api-key: 1234" "http://localhost:3000"
// {"message":"Invalid API key"}
