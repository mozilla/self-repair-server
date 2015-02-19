'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var path = require('path');

/*
  ... other post setup?
  ... tell about what next
  ... give command to editor?
  ... open editor?
  ... how to run tests / edit, whatever?
  ... single.html/?recipe=monkey-butt.packled.js?
  ...

  ... cp gitignores /workdir/.gitignores
       -- built
  ... /recipes/<recipe>/built/index.html... (called packed.js) <
  where should --progress --watch happen, if anywhere?

*/

// for maintainers:
// recall that all methods are run in order on extended Base object.

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    //this.pkg = require('../package.json');
    this.uname = this.user.git.name() || 'Your Name';
    this.email = this.user.git.email() || 'me@wherever.com';
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Generating new ' + chalk.red('Self Repair Recipe')
    ));

    var prompts = [{
      type: 'text',
      name: 'fullname',
      message: 'Name of your recipe',
      default: 'monkeys everywhere'
    },
    {
      type: 'text',
      name: 'owner',
      message: 'Owner',
      default: this.uname + ' <' + this.email + '>'
    },
    {
      type: 'text',
      name: 'filter_conditions',
      message: 'Filter Conditions (plain text)',
      default: 'run under these conditions'
    },
    ];

    this.prompt(prompts, function (props) {
      this.props = props;
      this.props.shortname = this._.camelize(this.props.fullname);
      done();
    }.bind(this));
  },

  writing: {
    first: function () {
    },

    app: function () {
      var that = this;
      var name = this.props.shortname;
      var rdir = path.join('src/recipes/', name);
      var tdir = path.join('test/recipes');
      var mainFile = this.props.mainFile = path.join(rdir, name + '.js');
      var testFile = this.props.testFile = path.join(tdir, 'test-' + name + '.js');

      [
        // helpers
        ['gitignore',path.join(rdir,'.gitignore')],
        ['jshintrc', path.join(rdir,'.jshintrc')],

        // debug
        ['debug/**/*', path.join(rdir, 'debug')], // whole dir

        // renamed files
        ['recipe/_README.md',path.join(rdir,'README.md')],
        ['recipe/_recipe.js', mainFile],
        ['test/_test_recipe.js', testFile],
      ].forEach(function (pair) {
        that.fs.copyTpl(
          that.templatePath(pair[0]),
          that.destinationPath(pair[1] || pair[0]),
          pair[2] || that.props
        );
      });

    },

    projectfiles: function () {
    }


  },

  install: function () {
    //this.installDependencies({
    //  skipInstall: this.options['skip-install']
    //});
  },

  end:  {
    postinstall: function () {
      var l = this.log.bind(this);
      l("\n",chalk.red.bold.underline('Next Steps'),"\n");
      l("  ", chalk.blue('edit'), this.props.mainFile);
      l("  ", chalk.blue('edit'), this.props.testFile);
      l("  ", 'RECIPE=' + this.props.shortname, 'npm run recipe:open', chalk.grey('// will pack, watch and open'));
      l("\n")
    }
  }


});
