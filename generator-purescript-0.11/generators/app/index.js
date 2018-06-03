const Generator = require('yeoman-generator');
const _ = require('lodash');

module.exports = class extends Generator {
  _jsonReadMergeWrite(path, mergeObj) {
    const obj = this.fs.readJSON(path, {});
    _.merge(obj, mergeObj);
    this.fs.writeJSON(path, obj);
  }

  initializing() {
    this.props = {};

    const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    _.merge(this.props, _.pick(pkg, 'name', 'license'));
  }

  prompting() {
    return this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the project?',
        default: this.props.name
      }, {
        type: 'input',
        name: 'license',
        message: 'License?',
        default: this.props.license || 'UNLICENSED'
      }

    ]).then(props => {
      this.props = props;
    })
  }

  writing() {
    const bowerPath = this.destinationPath('bower.json');
    const packagePath = this.destinationPath('package.json');

    // package.json
    const pkg = this.fs.readJSON(packagePath, {});

    _.merge(pkg, {
      name: this.props.name,
      license: this.props.license,
      scripts: {
        build: 'pulp build',
        start: 'pulp run',
        test: 'pulp test'
      }
    });

    this.fs.writeJSON(packagePath, pkg);

    // bower.json
    const bower = this.fs.readJSON(bowerPath, {});

    _.merge(bower, {
      name: this.props.name,
      ignore: [
        '**/.*',
        'node_modules',
        'bower_components',
        'output'
      ]
    });

    this.fs.writeJSON(bowerPath, bower);
    // .vscode/settings.json
    this._jsonReadMergeWrite(this.destinationPath('.vscode/settings.json'), {
      'purescript.addNpmPath': true
    });

    // other template files
    this.fs.copy(this.templatePath('**'), this.destinationPath())
  }

  install() {
    this.npmInstall([
      'purescript@^0.11.7',
      'pulp@^11.0.2',
      'bower'
    ], { 'save-dev': true });

    this.bowerInstall([
      'purescript-prelude@^3.3.0',
      'purescript-console@^3.0.0'
    ], { save: true });

    this.bowerInstall([
      'purescript-psci-support@^3.0.0',
    ], { 'save-dev': true });
  }
};