"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _yeomanGenerator = _interopRequireDefault(require("yeoman-generator"));

var _yoOptionOrPrompt = _interopRequireDefault(require("yo-option-or-prompt"));

var _prompting = _interopRequireDefault(require("./prompting"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Gen extends _yeomanGenerator.default {
  initializing() {
    this.optionOrPrompt = _yoOptionOrPrompt.default;
    this.context = {};
  }

  prompting() {
    return (0, _prompting.default)(this);
  }

  configuring() {
    this.destinationRoot(this.answers.destination);
  }

  writing() {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.fs.copyTpl(_this.templatePath('rootTemplated'), _this.destinationPath(), _this.context);

      yield _fsExtra.default.copy(_this.templatePath('rootNonTemplated'), _this.destinationPath()); // this.directory(this.templatePath(), './');
    })();
  }

  conflicts() {
    return this;
  }

  install() {
    const installChar = this.options.install ? this.options.install[0].toLowerCase() : 'y';

    if (!this.answers.install || installChar === 'n' || installChar === 'f') {
      return false;
    }

    return this.installDependencies({
      bower: false
    });
  }

  end() {
    return this;
  }

}

exports.default = Gen;
module.exports = exports.default;