/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global describe, it, require */

"use strict";

/** # Example Testing For A recipe
  *
  * - test shouldRun under condiations
  * - test run
  * - test validity
  * - test environment around recipe (here, "config")
  */

let { expect } = require("chai");
require("../utils").shimTodo(it);

let recipe = require("../../<%= mainFile %>");
let runner = require("../../src/runner");

describe("recipe", ()=>{
  it("is valid recipe", ()=>{
    expect(runner.validateConfig(recipe)[1]).to.be.true();
  });
  it('.run increments counter', (done)=>{
    let r = Math.floor(1000*Math.random());
    recipe.config.timesCalled = r;  // set!
    let p = Promise.resolve(true);
    for (let ii = 0; ii < 20; ii++) {
      p = p.then(recipe.run).then(
        () => {
          expect(recipe.config.timesCalled).equal(r + ii + 1);
        }
      );
    }
    p.then(done);
  });
  it('.shouldRun recipe true', ()=>{
    expect(recipe.shouldRun({'some': 'random'})).true();
  });
});
