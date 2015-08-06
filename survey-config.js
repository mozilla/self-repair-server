// survey config js     // this page is JS, not json.

const DEPLOYVERSION = 1;   // increment this please when you make changes.

const percent = .01;


// define a survey
SurveyAliases = {
  GamesV1:  {
    surveyUrl:  "http://sg.com/something",
    testingUrl:  "",   // optional?
    reportUrl:   "" // needs to exist
  },

  EngagementURL:  {
    surveyUrl:  "http://sg.com/something",
    testingUrl:  "",   // optional?
    reportUrl:   "" // needs to exist
  },

  "Nielson USE":  {
    surveyUrl:  "http://sg.com/something",
    testingUrl:  "" ,   // optional?
    reportUrl:   "", // needs to exist
    queryArgs:  ["fxVersion"] // todo
  },

  MapleLeaf:  {
    surveyUrl:  "http://sg.com/something",
    testingUrl:  "",   // optional?
    reportUrl:   "" // needs to exist
  },

};


// Deploy.

var deployment = {
  'en-US': {
    'us': [
      {
        which:   SurveyAliases.GamesV1,
        pct: 50*percent,
      },
      {
        which:   SurveyAliases.Engagement,
        pct: 20*percent,
      },
      { which:   SurveyAliases["Nielson USE"],
        pct: 30*percent,
      }
    ],
    'ca': [
      {
        which: SurveyAliases.MapleLeaf,
        pct: 100*percent,
      }
    ]
  },

  'es-MX': {
    'us':
      [
        [{which: SurveyAliases.Engagement  ,
          pct: 100*percent,
        }]
      ],
    'mx':
      [
        [{which: SurveyAliases.Engagement  ,
          pct: 100*percent,
        }]
      ],
  },

  'some-weird-locale': {
    'us':
      function (personInfo) {
        // note this should return <something>?
        // exceptions first.
        if (hasWindows10(personInfo)) {
          return Windows10Survey;
        }
        // then return something more... "normal";
        return SurveyAliases.Engagement;
      },
  },
  // this one use like phase of the moon, radioactive decay
  // and current box office gross to do things.
  'even-weirder-locale':  require("./even-weirder-locale.js")

};


var ValidateDeployments = function () {

};

var ChooseSurvey = function (personInfo, deployment, overrides={}) {
  let D = deployment[personInfo.locale][personInfo.geo];
  if (isFunction(D)) return D(personInfo);  // answer, no checking
  else {

  }
}

/*
HOWTO / faq:

## handling weirder conditional deploys?



(Windows 10?)

## deploy everywhere in a locale?

You can't.  Countries are the entities here.

## deploy to all langs in a country?

You can't.  Country + Locale *pairs* are *actually the entities.

## how fancy do I need to get with percentages.

Not that fancy.  As long as it all adds up to (99%, 101%), we good.

## what template vars are in urls?

A few.  (TODO)

## what query args come back?

Well, up for debate.
Idea is:  some query args are just passed.  Your survery tool should handle this correctly, or tough bananas.

## But I want <feature X>

Cool.  Hit Github Issues for this project


*/



/*  # rejected designs

- allow "all countries in locale" deploy.  No. interacts non-explicitly with by language ones.
  Hard to eyeball percentages.


- no relationships with pervious surveys.  it's allowed, but not encouraged.

*/



exports.deployment = deployment;
exports.DEPLOYVERSION = DEPLOYVERSION;
exports.SurveyAliases = SurveyAliases;
