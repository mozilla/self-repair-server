var number = function (value, offset) {
  if (isNaN(value)) throw new Error("'" + value + "' isn't a number.");
  return value - (offset || 0);
};
var plural = function (value, offset, lcfunc, data, isOrdinal) {
  if ({}.hasOwnProperty.call(data, value)) return data[value]();
  if (offset) value -= offset;
  var key = lcfunc(value, isOrdinal);
  if (key in data) return data[key]();
  return data.other();
};
var select = function (value, data) {
  if ({}.hasOwnProperty.call(data, value)) return data[value]();
  return data.other()
};
var pluralFuncs = {
  cs: function (n, ord) {
    var s = String(n).split('.'), i = s[0], v0 = !s[1];
    if (ord) return 'other';
    return (n == 1 && v0) ? 'one'
        : ((i >= 2 && i <= 4) && v0) ? 'few'
        : (!v0) ? 'many'
        : 'other';
  }
};
var fmt = {};

module.exports = {
  heartbeat: {
    question_text: function(d) { return "Ohodnoťte prosím Firefox"; },
    learnmore: function(d) { return "Zjistit více"; },
    thankyou: function(d) { return "Děkujeme!"; }
  }
}
