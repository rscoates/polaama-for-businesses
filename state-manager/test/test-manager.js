'use strict';
const expect = require('chai').expect;
const Manager = require('state-manager');

describe("basic tests", function() {
  const stateManager = new Manager("testing", true);
  it("basic", function(done) {
    const promise = stateManager.set("key", "value");
    promise.then(
      function() {
        return stateManager.get("key");
      },
      function(err) {
        console.log(`error: ${JSON.stringify(err)}`);
        done(err);
      }
    ).done(
      function(value) {
        expect(value).to.equal("value");
        done();
      },
      function(err) {
        done(err);
      }
    );
  });

  it("composite key", function(done) {
    const promise = stateManager.set(["key","1234","hi world. how are you?"]);
    promise.then(
      function() {
        return stateManager.get(["key","1234","hi world. how are you?"]);
      },
      function(err) {
        console.log(`error: ${JSON.stringify(err)}`);
        done(err);
      }
    ).done(
      function(value) {
        expect(value).to.equal(true);
        done();
      },
      function(err) {
        done(err);
      }
    );
  });

  it("clear", function(done) {
    const key = ["key","1234","hello world. how are you?"];
    const promise = stateManager.set(key, "value");
    promise.then(
      () => {
        return stateManager.clear(key);
      },
      (err) => {
        done(err);
      }
    ).then(() => {
        return stateManager.get(key);
      },
      (err) => {
        done(err);
    }).done((value) => {
        expect(value).to.be.undefined;
        done();
      },
      (err) => {
        done(err);
    });
  });
});
