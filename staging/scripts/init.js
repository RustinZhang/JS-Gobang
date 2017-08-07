/**
 * @fileOverview 程序加载初始化, step / virtual_board / steps_hist / max_step 将在模块间传递。
 * 命名约定：class: Class; variable: my_variable(noun); function: handleData (verb);
 */
"use strict";
/**
 * @module init
 */

/**
 * 初始化棋盘，开局DOM结构建立
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.steps_hist = exports.virtual_b = exports.step = undefined;

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Init = function () {
    function Init() {
        (0, _classCallCheck3.default)(this, Init);
    }

    (0, _createClass3.default)(Init, null, [{
        key: "drawUI",

        // 选棋遮罩，DOM棋盘绘制
        value: function drawUI() {
            var grid = '',
                shade = document.createElement("div"),
                container = document.querySelector("body"),
                chess_move = document.querySelector(".chess-move");
            shade.className = "shade";
            shade.innerHTML = "<div class=\"dialog difficulty\"><p class=\"title\">\u8BF7\u9009\u96BE\u5EA6\uFF0C\u96BE\u5EA6\u589E\u9AD8\u7535\u8111\u601D\u8003\u65F6\u95F4\u52A0\u957F</p><div class=\"easy choose-diff\">\u5BB9\u6613</div><div class=\"normal choose-diff\">\u666E\u901A</div>";
            container.appendChild(shade);
            for (var i = 0; i < 15; i++) {
                grid += "<ul class=\"row r" + i + "\">";
                for (var j = 0; j < 15; j++) {
                    grid += '<li class="column col' + j + '"></li>';
                }
                grid += '</ul>';
            }
            chess_move.innerHTML = grid;
        }

        // 抽象棋盘建立

    }, {
        key: "chessBoard",
        value: function chessBoard() {
            var board = [];
            for (var i = 15; i--;) {
                board.push((0, _from2.default)({ length: 15 }));
            }
            return board;
        }
    }]);
    return Init;
}();

Init.drawUI();
/**
 * @type {{turn: boolean, color: boolean, posX: number, posY: number, max_dep: number}}
 */
var step = {
    turn: false,
    color: false,
    posX: 0,
    posY: 0,
    max_dep: 2
},

/**
 * @type {Array}
 */
virtual_b = Init.chessBoard(),

/**
 * @type {Array}
 */
steps_hist = [];
/**
 * @type {number}
 */

exports.step = step;
exports.virtual_b = virtual_b;
exports.steps_hist = steps_hist;
//# sourceMappingURL=init.js.map
