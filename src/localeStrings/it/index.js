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
  it: function (n, ord) {
    var s = String(n).split('.'), v0 = !s[1];
    if (ord) return ((n == 11 || n == 8 || n == 80
            || n == 800)) ? 'many' : 'other';
    return (n == 1 && v0) ? 'one' : 'other';
  }
};
var fmt = {};

module.exports = {
  heartbeat: {
    question_text: function(d) { return "Per favore vota Firefox"; },
    learnmore: function(d) { return "Ulteriori informazioni"; },
    thankyou: function(d) { return "Grazie!"; }
  }
}
