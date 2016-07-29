'use strict';

const expect = require('chai').expect
  , predicateFactory = require('../src/index')
  ;

require('co-mocha');

describe('koa-predicate-factory', function() {

  describe('using a predicate', function() {

    let hasValidApiKey, someFunc, ctx;
    before(function() {
      // create the predicate
      hasValidApiKey = predicateFactory(function() {
              // check something and return a boolean
              return this.request.headers['x-api-key'] == '21GL4hVbxDQz'
          }, 403, 'Not authorized'
      );

      // create a decorated function
      someFunc = hasValidApiKey(function *() {
        this.body = {hello: 'world'}
      })
    });

    describe('calling with a wrong api key', function() {
      before(function *() {
        ctx = {
          request: {
            headers: {
              'x-api-key': '1234'
            }
          }
        };
        yield someFunc.call(ctx);
      });

      it('should set status to 403 with wrong api key', function *() {
        expect(ctx.status).to.eql(403);
      });

      it('should set the body message to Not authorized', function() {
        expect(ctx.body).to.eql({message: 'Not authorized'})
      });
    })

    describe('calling with a correct api key', function() {
      before(function *() {
        ctx = {
          request: {
            headers: {
              'x-api-key': '21GL4hVbxDQz'
            }
          }
        };
        yield someFunc.call(ctx);
      });

      it('should not set status to 403 with wrong api key', function *() {
        expect(ctx.status).not.to.eql(403);
      });

      it('should not set the body message to Not authorized', function() {
        expect(ctx.body).not.to.eql({message: 'Not authorized'})
      });
    })


  });


});
