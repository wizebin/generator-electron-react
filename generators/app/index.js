"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _yeomanGenerator = _interopRequireDefault(require("yeoman-generator"));

var _yoOptionOrPrompt = _interopRequireDefault(require("yo-option-or-prompt"));

var _prompting2 = _interopRequireDefault(require("./prompting"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Gen = /*#__PURE__*/function (_Generator) {
  _inherits(Gen, _Generator);

  var _super = _createSuper(Gen);

  function Gen() {
    _classCallCheck(this, Gen);

    return _super.apply(this, arguments);
  }

  _createClass(Gen, [{
    key: "initializing",
    value: function initializing() {
      this.optionOrPrompt = _yoOptionOrPrompt["default"];
      this.context = {};
    }
  }, {
    key: "prompting",
    value: function prompting() {
      return (0, _prompting2["default"])(this);
    }
  }, {
    key: "configuring",
    value: function configuring() {
      this.destinationRoot(this.answers.destination);
    }
  }, {
    key: "writing",
    value: function () {
      var _writing = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.fs.copyTpl(this.templatePath('rootTemplated'), this.destinationPath(), this.context, {}, {
                  globOptions: {
                    dot: true
                  }
                });
                _context.next = 3;
                return _fsExtra["default"].copy(this.templatePath('rootNonTemplated'), this.destinationPath(), {
                  globOptions: {
                    dot: true
                  }
                });

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function writing() {
        return _writing.apply(this, arguments);
      }

      return writing;
    }()
  }, {
    key: "conflicts",
    value: function conflicts() {
      return this;
    }
  }, {
    key: "install",
    value: function install() {
      var installChar = this.options.install ? this.options.install[0].toLowerCase() : 'y';

      if (!this.answers.install || installChar === 'n' || installChar === 'f') {
        return false;
      }

      return this.installDependencies({
        bower: false
      });
    }
  }, {
    key: "end",
    value: function end() {
      return this;
    }
  }]);

  return Gen;
}(_yeomanGenerator["default"]);

exports["default"] = Gen;