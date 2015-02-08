//https://github.com/mozilla/buddyup/blob/4a2f3bcee626c67a4d9fc9ff2c7511e7df84e0b1/app/js/sumo_db.js#L22-L45

/**
*/
function request(url, method, data, headers, contentType) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open(method, url, true);  // cors!
    // "application/x-www-form-urlencoded" also sensible
    req.setRequestHeader("Content-Type", contentType || 'application/json');
    for (var field in headers) {
      req.setRequestHeader(field, headers[field]);
    }

    req.onload = function() {
      //console.log(req.status, req.statusText);
      if (req.status >= 200 && req.status < 300 || req.status == 0 ) {
        resolve(req.response);
      } else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = function(e) {
      //console.log(e);
      reject(Error('Network Error'));
    };

    req.send(JSON.stringify(data));
  });
}


exports.request = request;
