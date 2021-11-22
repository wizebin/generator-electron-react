"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prompting;

var _yoBasePrompts = _interopRequireDefault(require("yo-base-prompts"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { if (i % 2) { var source = arguments[i] != null ? arguments[i] : {}; ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(arguments[i])); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(arguments[i], key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function prompting(_x) {
  return _prompting.apply(this, arguments);
}

function _prompting() {
  _prompting = _asyncToGenerator(function* (yo) {
    var yoBasePrompts = new _yoBasePrompts.default(yo);
    yo.answers = yield yoBasePrompts.prompt({
      authorEmail: true,
      authorName: true,
      authorUrl: true,
      description: true,
      destination: true,
      githubUsername: true,
      homepage: true,
      license: true,
      name: true,
      repository: true,
      version: true
    });
    var {
      install,
      main,
      use_asar_bool,
      github_action_publish
    } = yield yo.optionOrPrompt([{
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies',
      default: true
    }, {
      type: 'confirm',
      name: 'use_asar_bool',
      message: 'Use ASAR?',
      default: true
    }, {
      type: 'confirm',
      name: 'github_action_publish',
      message: 'Include github publish script?',
      default: false
    }]);
    yo.answers.install = install;
    yo.answers.use_asar_bool = use_asar_bool;
    yo.answers.github_action_publish = github_action_publish;
    yo.answers.main = main;

    if (github_action_publish) {
      var {
        bucket
      } = yield yo.optionOrPrompt([{
        type: 'input',
        name: 'bucket',
        message: 'S3 bucket to publish to (remember to allow public ACLs on this bucket!)',
        default: yo.answers.name
      }]);
      yo.answers.bucket = bucket;
    } else {
      yo.answers.bucket = '';
    }

    yo.context = _objectSpread({}, yo.context, {}, yo.answers);
  });
  return _prompting.apply(this, arguments);
}