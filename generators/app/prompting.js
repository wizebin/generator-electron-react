"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prompting;

var _yoBasePrompts = _interopRequireDefault(require("yo-base-prompts"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function prompting(_x) {
  return _prompting.apply(this, arguments);
}

function _prompting() {
  _prompting = _asyncToGenerator(function* (yo) {
    const yoBasePrompts = new _yoBasePrompts.default(yo);
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

    const _yield$yo$optionOrPro = yield yo.optionOrPrompt([{
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies',
      default: true
    }, {
      type: 'confirm',
      name: 'use_asar_bool',
      message: 'Use ASAR? (kinda sucks)',
      default: false
    }]),
          install = _yield$yo$optionOrPro.install,
          main = _yield$yo$optionOrPro.main,
          use_asar_bool = _yield$yo$optionOrPro.use_asar_bool;

    yo.answers.install = install;
    yo.answers.use_asar_bool = use_asar_bool;
    yo.answers.main = main;
    yo.context = _objectSpread(_objectSpread({}, yo.context), yo.answers);
  });
  return _prompting.apply(this, arguments);
}

module.exports = exports.default;