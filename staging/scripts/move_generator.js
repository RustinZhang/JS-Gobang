/**
 * @fileOverview 走法生成模块，在启动搜索后负责生成、撤销棋子。
 */
"use strict";
/**
 * @module move_generator
 */
/**
 * 走法生成类
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.m_gen = undefined;

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MoveGenerator = function () {
    function MoveGenerator() {
        (0, _classCallCheck3.default)(this, MoveGenerator);
    }

    (0, _createClass3.default)(MoveGenerator, null, [{
        key: "moveForward",

        /**
         * 生成一步走法，为了避免web worker 那边有太多的依赖甚至状态混乱，没有引如init模块，这个函数传参有点多
         * @param entry {Array} 坐标
         * @param dep {number} 搜索层深度
         * @param step {object}
         * @param board {Array} 当前棋盘
         * @param max_dep {number} 最大搜索深度
         * @param hist {Array} 历史记录
         */
        value: function moveForward(entry, dep, step, board, max_dep, hist) {
            step.color = (max_dep - dep) % 2 ? hist[hist.length - 1][2] : !hist[hist.length - 1][2];
            if (entry !== undefined) {
                board[entry[0]][entry[1]] = step.color ? 1 : 0;

                var _entry = (0, _slicedToArray3.default)(entry, 2);

                step.posY = _entry[0];
                step.posX = _entry[1];
            }
        }

        /**
         * 撤销之前的走法
         * @param entry {array} 坐标
         * @param step {object}
         * @param board {Array} 棋盘
         * @param hist {Array} 历史记录
         */

    }, {
        key: "moveBack",
        value: function moveBack(entry, step, board, hist) {
            if (entry !== undefined) {
                board[entry[0]][entry[1]] = undefined;

                var _hist = (0, _slicedToArray3.default)(hist[hist.length - 1], 2);

                step.posY = _hist[0];
                step.posX = _hist[1];
            }
        }

        /**
         * 获得所有的可走位置，在实际情况中，很少出现远离现存棋子的下子，因此这里限定了搜索范围在现有棋子的两个范围内，这个限定对AI思考能力是有影响的，但是从不限制到三格，三格到两格，两格到一格都对AI的速度有可感知的影响，且棋力的提高与范围的关系必然不是线性的。
         * @param board {Array} 当前棋盘
         * @param hist {Array} 历史记录
         * @returns {entry[]}
         */

    }, {
        key: "getAvail",
        value: function getAvail(board, hist) {
            var temp_b = (0, _from2.default)({ length: 15 }),
                min_row = void 0,
                max_row = void 0,
                min_col = void 0,
                max_col = void 0,
                avails = [];
            for (var i = 0; i < temp_b.length; i++) {
                temp_b[i] = (0, _from2.default)(board[i]);
            }
            if (hist.length === 0) {
                return [[7, 7]];
            } else {
                for (var _i = 0; _i < hist.length; _i++) {
                    min_row = hist[_i][0] - 2 < 0 ? 0 : hist[_i][0] - 2;
                    max_row = hist[_i][0] + 2 > 14 ? 14 : hist[_i][0] + 2;
                    min_col = hist[_i][1] - 2 < 0 ? 0 : hist[_i][1] - 2;
                    max_col = hist[_i][1] + 2 > 14 ? 14 : hist[_i][1] + 2;
                    for (var j = min_row; j <= max_row; j++) {
                        for (var k = min_col; k <= max_col; k++) {
                            if (temp_b[j][k] === undefined) {
                                avails.push([j, k]);
                                temp_b[j][k] = -1;
                            }
                        }
                    }
                }
                return avails;
            }
        }
    }]);
    return MoveGenerator;
}();
/**
 * 将类本身导出
 * @type {MoveGenerator}
 */


var m_gen = exports.m_gen = MoveGenerator;
//# sourceMappingURL=move_generator.js.map
