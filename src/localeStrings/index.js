/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:false, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:false, browser:true,
  unused:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext: true, moz: true  */

/*global require, module */

/* Notes from #l10n
10:58 < gregglind> and double check me... which is our main spanish, tagalog and chinese locales
10:58 <@pascalc> We don't do tagalog
10:58 <@pascalc> we do es-ES, es-MX, es-CL, es-AR for spanishes, we can also do 'neutral' spanish
10:59 <@pascalc> for chinese we do zh-TW and zh-CN
*/

// how to do find strings:
// https://transvision.mozfr.org/string/?entity=mobile/android/chrome/aboutFeedback.dtd:sad.thanksHeader2&repo=aurora
// https://transvision.mozfr.org/string/?entity=browser/chrome/browser/preferences/advanced.dtd:telemetryLearnMore.label&repo=aurora

"use strict";

var supported = {
    'de'   : require("./de"),
    'en-us': require("./en"),  // break up 'en' if needful.
    'en-gb': require("./en"),
    'es':    require("./es"),  // should not exist
    'es-es': require("./es"),  // break up 'es' if needful.
    'es-mx': require("./es"),
    'fr'   : require("./fr"),
    'zh-cn': require("./zh-cn"),  // chose simplified chinese.  TW has traditional.

    'unk'  : require("./en") // just in case
};

// this is optimistic, and will return the 'en-us' (via 'unk') if it can't do better.
var getTranslation = function (locale) {
  locale = locale.toLowerCase();
  return supported[locale] || supported['unk'];
};


module.exports = {
  supported: supported,
  getTranslation: getTranslation
};

