/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true,
  asi:true
  */

/*global describe, it, require */

'use strict';


/* this code mostly exists
   - for coverage sake
   - catch when new actions are added
*/
let { expect } = require('chai');
let clientUtils = require('../../src/common/client-utils');
require('../utils').shimTodo(it);

let uuid = require('uuid').v4;

describe('window-utils', () => {
  describe('module', () => {
    let wanted = ['paramsToObj', 'guessLocale'];
    it('export keys, as methods', ()=>{
      expect(clientUtils).keys(wanted);
      wanted.forEach((k)=>{
        expect(clientUtils).respondTo(k)
      })
    })
  });

  describe('paramsToObj', () => {
    let pto = clientUtils.paramsToObj;
    let good = {a:1, b:[1,2,3]};
    it('empty gives object', () => {
      expect(pto()).deep.equal({});
    })
    it('intial ? ignored', () => {
      expect(pto('?'+JSON.stringify(good))).deep.equal(good);
    })
    it('final / ignored', () => {
      expect(pto(JSON.stringify(good)+'/')).deep.equal(good);
    })
    it('? + / ignored', () => {
      expect(pto('?' + JSON.stringify(good)+'/')).deep.equal(good);
    })
    it('bad json gives undefined', () => {
      expect(pto(JSON.stringify(good).substring(1))).to.be.a('undefined');
    })
    it('good json gives object', () => {
      expect(pto(JSON.stringify(good))).deep.equal(good);
    })

    it('robust to url encoding', () => {
      expect(pto('{%22a%22:1,%22b%22:[1,2,3]}')).deep.equal(good);
    })
  })

  describe('guessLocale', () => {
    let guess = clientUtils.guessLocale;
    it('unknown is unknown', () => {
      let ans = guess("a",{});
      expect(ans).a("undefined");
    })

    it('guess rightmost', () => {
      expect(guess("/en-US/it/", {language: 'en-GB'})).equal('it');
    })

    it('guess location.language last', () => {
      expect(guess("/something/", {language: 'en-GB'})).equal('en-GB');
    })

    it('handle upper sorbian in path (3 letter locales)', () => {
      let ans = guess("/hsb/", {language: 'en-GB'});
      expect(ans).equal("hsb");
    })

    it('handle `de` locale (2 letter locales)', () => {
      let ans = guess("/de/", {language: 'en-GB'});
      expect(ans).equal("de");
    })
  })
})
