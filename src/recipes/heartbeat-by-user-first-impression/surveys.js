

// ideally this would be derived, so tests can do something with these.
// like they would be part of the config file.  This is a canned demo
// that shows the idea without having to fully hack

var US = [
    'https://qsurvey.mozilla.com/s3/68ffc1dd1d8b',
    'https://qsurvey.mozilla.com/s3/Firefox-USE-Survey',
    'https://qsurvey.mozilla.com/s3/PBM-Survey-Genpop-41',
    'https://qsurvey.mozilla.com/s3/Heartbeat-Bright-Spots'
  ];

var DE = [
  'https://qsurvey.mozilla.com/s3/PBM-Survey-Genpop-41-German'
]


// dervied, so that tests can check dates.
module.exports.used = Array.concat(US, DE).map(function (x) {name: x})
