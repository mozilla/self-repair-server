/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global describe, it, require, exports, log */

"use strict";

let { expect } = require("chai");
let assert = require("assert");

require("../../utils").shimTodo(it);


let flow = require("../../../src/common/heartbeat/flow");
let Flow = flow.Flow;

describe('hearbeat flow', () => {
  it("flow has methods", function () {
    expect(Flow).to.be.a("function");
    expect(new Flow()).to.be.a("object");
    // have keys, no extras!
    expect(new Flow()).to.have.keys(['data', 'link', 'rate', 'began', 'offered', 'voted', 'engaged']);
  });
  it("locals override base", () => {
    let f = new Flow({flow_id: 13});
    expect(f.data.flow_id).to.equal(13);
  });
  it("locals extras init vars are kept", () => {
    let f = new Flow({not_there: "a"});
    expect(f.data.not_there).to.equal("a");
  });
  it("wrong ordered flows are bad", () => {
    ["offered", "voted", "engaged"].map(function (k) {
      let f = new Flow();
      expect(f[k]).to.throw(Error);
    });
  });
  it("tests right ordered flow steps work", ()=>{
    for (let k in flow.phases) {
      let f = new Flow();
      let reqs = flow.phases[k];
      reqs.map((r) => {  // run all stages
        f[r]();
      });
      f[k]();// do it!
      assert.ok(true, "phase " + k + " works");
    }
    //assert.pass();
  });
  it("link adds links, even for multiple links", () => {
    let f = new Flow();
    ['link1', 'link2'].forEach((L, i)=>{
      f.link(L);
      let d = f.data.flow_links;
      expect(d).to.have.length(i+1);
      expect(d[i][1]).to.equal(L);
    });
  });

  it("rate sets score", () => {
    let f = new Flow();
    [3, 6, 2].forEach((n)=>{
      f.rate(n);
      expect(f.data.score).to.equal(n);
    });
  });

  it("will break if you intentionally and stupidly remove internal keys", () => {
    let f = new Flow();
    f.data = {};
    expect(f.began).to.throw(Error);
  });
});
