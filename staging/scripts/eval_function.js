/**
 * @fileOverview 估值核心模块，直接影响 AI 的智能程度。
 */
"use strict";
/**
 * @module eval_function
 */

/**
 * 评估核心类
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getScore = undefined;

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Eval = function () {
    (0, _createClass3.default)(Eval, [{
        key: "pos_val",

        /**
         * get the position value
         * @returns {Array}
         */
        get: function get() {
            return this._pos_val;
        }
    }]);

    function Eval() {
        (0, _classCallCheck3.default)(this, Eval);

        /**
         * 棋盘上每个位置的权重，越靠近中心权重越高
         * @type {Array}
         */
        this._pos_val = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0], [0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0], [0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5, 6, 6, 6, 5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5, 6, 6, 6, 5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2, 1, 0], [0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 1, 0], [0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0], [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0], [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    }

    /**
     * 行的一维抽象
     * @param posY {number} 当前位置的Y值
     * @param b {Array} 当前棋盘
     * @returns {Array} 当前行的数组
     */


    (0, _createClass3.default)(Eval, [{
        key: "isGameOver",


        /**
         * 判断游戏是否结束
         * @param pos {object}
         * @param board {Array}
         * @returns {boolean}
         */
        value: function isGameOver(pos, board) {
            return Eval.countFive(pos, "white", board) || Eval.countFive(pos, "black", board);
        }

        /**
         * 计算当前棋盘分数
         * @param pos {object}
         * @param board {Array}
         * @param [p_val] {number}
         * @returns {number}
         */

    }, {
        key: "evaluate",
        value: function evaluate(pos, board) {
            var p_val = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._pos_val;

            var turn_w = !pos.color,
                val_w = 0,
                val_b = 0,
                types_black = {
                color: "black",
                five: 0,
                four: 0,
                sfour: 0,
                three: 0,
                sthree: 0,
                two: 0,
                stwo: 0
            },
                types_white = {
                color: "white",
                five: 0,
                four: 0,
                sfour: 0,
                three: 0,
                sthree: 0,
                two: 0,
                stwo: 0
            };

            Eval.typesCount(types_black, board);
            Eval.typesCount(types_white, board);

            // if already five early return game over
            if (turn_w) {
                if (types_black.five) return -9999;
                if (types_white.five) return 9999;
            } else {
                if (types_white.five) return -9999;
                if (types_black.five) return 9999;
            }

            // 2 sfours equal to 1 four
            if (types_white.sfour > 1) types_white.four++;
            if (types_black.sfour > 1) types_black.four++;

            /*
             * 以下是依据棋型给出评分，这个部分也非常依赖棋类知识，有很大的优化空间，目前这个评分模型参考的是「PC 游戏编程（人机博弈）」一书中的。
             * 活三眠三和活二的逻辑最需要优化
             */
            if (turn_w) {
                if (types_white.four) return 9990;
                if (types_white.sfour) return 9980;
                if (types_black.four) return -9970;
                if (types_black.sfour && types_black.three) return -9960;
                if (types_white.three && types_black.sfour === 0) return 9950;
                if (types_black.three > 1 && types_white.sfour === 0 && types_white.three === 0 && types_white.sthree === 0) return -9940;
                if (types_white.three > 1) val_w += 2000;else if (types_white.three) val_w += 200;
                if (types_black.three > 1) val_b += 500;else if (types_black.three) val_b += 100;
                if (types_white.sthree) val_w += types_white.sthree * 10;
                if (types_black.sthree) val_b += types_black.sthree * 10;
                if (types_black.two) val_b += types_black.two * 4;
                if (types_white.two) val_w += types_white.two * 4;
                if (types_black.stwo) val_b += types_black.stwo;
                if (types_white.stwo) val_w += types_white.stwo;
            } else {
                if (types_black.four) return 9990;
                if (types_black.sfour) return 9980;
                if (types_white.four) return -9970;
                if (types_white.sfour && types_white.three) return -9960;
                if (types_black.three && types_white.sfour === 0) return 9950;
                if (types_white.three > 1 && types_black.sfour === 0 && types_black.three === 0 && types_black.sthree === 0) return -9940;
                if (types_black.three > 1) val_b += 2000;else if (types_black.three) val_b += 200;
                if (types_white.three > 1) val_w += 500;else if (types_white.three) val_w += 100;
                if (types_black.sthree) val_b += types_black.sthree * 10;
                if (types_white.sthree) val_w += types_white.sthree * 10;
                if (types_black.two) val_b += types_black.two * 4;
                if (types_white.two) val_w += types_white.two * 4;
                if (types_black.stwo) val_b += types_black.stwo;
                if (types_white.stwo) val_w += types_white.stwo;
            }

            for (var i = 0; i < 15; i++) {
                for (var j = 0; j < 15; j++) {
                    if (board[i][j] === 0) val_b += p_val[i][j];
                    if (board[i][j] === 1) val_w += p_val[i][j];
                }
            }

            if (turn_w) {
                return val_w - val_b;
            } else {
                return val_b - val_w;
            }
        }
    }], [{
        key: "getRow",
        value: function getRow(posY, b) {
            return b[posY];
        }

        /**
         * 列的一维抽象，同理
         * @param posX {number}
         * @param b {Array}
         * @returns {Array}
         */

    }, {
        key: "getCol",
        value: function getCol(posX, b) {
            var temp_arr = [];
            for (var i = 0; i < 15; i++) {
                temp_arr.push(b[i][posX]);
            }
            return temp_arr;
        }

        /**
         *
         * @param origin {number}
         * @param b {Array} 当前棋盘
         * @returns {Array}
         */

    }, {
        key: "getRightFalling",
        value: function getRightFalling(origin, b) {
            var temp_arr = [];
            if (origin < -10 || origin > 10) return undefined;
            for (var i = origin <= 0 ? 0 : origin; i <= (origin < 0 ? 14 + origin : 14); i++) {
                temp_arr.push(b[i][i - origin]);
            }
            return temp_arr;
        }

        /**
         *
         * @param origin {number}
         * @param b {Array}
         * @returns {Array}
         */

    }, {
        key: "getRising",
        value: function getRising(origin, b) {
            var temp_arr = [];
            if (origin < 4 || origin > 24) return undefined;
            for (var i = origin >= 15 ? origin - 14 : 0; i <= (origin > 14 ? 14 : origin); i++) {
                temp_arr.push(b[i][origin - i]);
            }
            return temp_arr;
        }

        /**
         * lineAnalysis 直线分析函数，负责分析以上四个静态方法得到的数组，计算每种棋型的数量，这是比较容易出错的位置。因为这个部分一开始就使用了自己的逻辑，所以从二维一维化到直线分析函数都没有参考其他资料，也可能会有逻辑上的漏洞，目前来看数据的抽象应该没有大问题，评分逻辑和效率还有待优化，这两个方面耦合得比较深，是无法分开的。
         * @param line_to_analysis {Array}
         * @param color {boolean}
         * @param [game_over=false] {boolean}
         * @returns {*}
         */

    }, {
        key: "lineAnalysis",
        value: function lineAnalysis(line_to_analysis, color) {
            var game_over = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            if (line_to_analysis === undefined) {
                return {
                    five: 0,
                    four: 0,
                    sfour: 0,
                    three: 0,
                    sthree: 0,
                    two: 0,
                    stwo: 0
                };
            }

            var count_five = void 0,
                count_four = 0,
                count_sfour = 0,
                count_three = 0,
                count_sthree = 0,
                count_two = 0,
                count_stwo = 0,
                stone_qty = 0,
                side = typeof color === "string" ? color : color.color,
                line = (0, _from2.default)(line_to_analysis),
                length = line.length;

            for (var i = 0; i < length; i++) {
                if (side === "black") {
                    if (line[i] === 1) {
                        line[i] = 0;
                    } else if (line[i] === 0) {
                        line[i] = 1;
                        stone_qty++;
                    }
                } else {
                    if (line[i] === 1) stone_qty++;
                }
            }

            count_five = function () {
                var l = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : line;
                var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : length;

                if (stone_qty < 5) return 0;
                var temp = 1;
                for (var _i = 0; _i < len; _i++) {
                    if (l[_i] === 1 && l[_i] === l[_i + 1]) temp++;
                    if (l[_i] !== 1) temp = 1;
                    if (temp === 5) return 1;
                }
                return 0;
            }();

            if (game_over) return count_five;

            if (count_five !== 0) {
                return {
                    five: count_five,
                    four: count_four,
                    sfour: count_sfour,
                    three: count_three,
                    sthree: count_sthree,
                    two: count_two,
                    stwo: count_stwo
                };
            }

            count_four = function () {
                var l = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : line;
                var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : length;

                if (stone_qty < 4) return 0;
                var temp = 1,
                    count = 0;
                for (var _i2 = 1; _i2 < len && stone_qty > 3; _i2++) {
                    if (l[_i2] === 1 && l[_i2] === l[_i2 + 1]) temp++;
                    if (l[_i2] !== 1) temp = 1;
                    if (temp === 4 && l[_i2 - 3] !== 0 && l[_i2 + 2] !== 0 && _i2 < len - 2 && l[_i2 + 1] === 1) {
                        l.splice(_i2 - 2, 4, "f", "f", "f", "f");
                        temp = 1;
                        count++;
                        stone_qty -= 4;
                        _i2++;
                    }
                }
                return count;
            }();

            count_sfour = function () {
                var l = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : line;
                var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : length;

                if (stone_qty < 4) return 0;
                var temp = 1,
                    count = 0;
                for (var _i3 = 0; _i3 < len && stone_qty > 3; _i3++) {
                    if (l[_i3] === 1 && l[_i3] === l[_i3 + 1]) temp++;
                    if (l[_i3] !== 1) temp = 1;
                    if (temp === 4 && l[_i3 + 1] === 1) {
                        if (_i3 - 2 !== 0 && l[_i3 - 3] !== 0 || _i3 < len - 2 && l[_i3 + 2] !== 0) {
                            count++;
                            l.splice(_i3 - 2, 4, "sf", "sf", "sf", "sf");
                            temp = 1;
                            stone_qty -= 4;
                            _i3++;
                        }
                        if (temp === 3) {
                            if (l[_i3 - 2] === undefined && l[_i3 - 3] === 1) {
                                count++;
                                l.splice(_i3 - 1, 3, "sf", "sf", "sf");
                                temp = 1;
                                stone_qty -= 3;
                                _i3++;
                            }
                            if (l[_i3 + 2] === undefined && l[_i3 + 3] === 1) {
                                count++;
                                l.splice(_i3 - 1, 3, "sf", "sf", "sf");
                                temp = 1;
                                stone_qty -= 3;
                                _i3 += 2;
                            }
                        }
                        if (temp === 2) {
                            if (l[_i3 + 2] === undefined && l[_i3 + 3] === 1 && l[_i3 + 4] === 1) {
                                count++;
                                l.splice(_i3, 2, "sf", "sf");
                                temp = 1;
                                stone_qty -= 2;
                                _i3 += 2;
                            }
                        }
                    }
                }
                return count;
            }();

            count_three = function () {
                var l = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : line;
                var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : length;

                if (stone_qty < 3) return 0;
                var temp = 1,
                    count = 0;
                for (var _i4 = 1; _i4 < len && stone_qty > 2; _i4++) {
                    if (l[_i4] === 1 && l[_i4] === l[_i4 + 1]) temp++;
                    if (l[_i4] !== 1) temp = 1;
                    if (temp === 3) {
                        if (l[_i4 - 2] === undefined && l[_i4 + 2] === undefined && _i4 < len - 2) {
                            // exclude fake three: 0/border,undefined,1,1,1,undefined,0/border
                            if (!(l[_i4 - 3] === 0 || _i4 - 2 === 0) || !(l[_i4 + 3] === 0 || _i4 === len - 3)) {
                                count++;
                                temp = 1;
                                l.splice(_i4 - 1, 3, "t", "t", "t");
                                stone_qty -= 3;
                            }
                        }
                    }
                    if (temp === 2) {
                        if (l[_i4 + 2] === undefined && l[_i4 + 3] === 1 && l[_i4 + 4] === undefined && l[_i4 - 1] === undefined && _i4 - 1 > 0 && _i4 < len - 5) {
                            count++;
                            temp = 1;
                            l.splice(_i4, 3, "t", "t", "t");
                            stone_qty -= 2;
                        }
                        if (l[_i4 - 1] === undefined && l[_i4 - 2] === 1 && l[_i4 - 3] === undefined && l[_i4 + 2] === undefined && _i4 - 3 > 0 && _i4 < len - 3) {
                            count++;
                            temp = 1;
                            l.splice(_i4 - 1, 3, "t", "t", "t");
                            stone_qty -= 2;
                        }
                    }
                }
                return count;
            }();

            count_sthree = function () {
                var l = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : line;
                var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : length;

                if (stone_qty < 3) return 0;
                var temp = 1,
                    count = 0;
                for (var _i5 = 0; _i5 < len && stone_qty > 2; _i5++) {
                    if (l[_i5] === 1 && l[_i5] === l[_i5 + 1]) temp++;
                    if (l[_i5] !== 1) temp = 1;
                    if (temp === 3) {
                        if (l[_i5 - 3] === undefined && l[_i5 - 2] === undefined && _i5 - 2 > 0 || l[_i5 + 2] === undefined && l[_i5 + 3] === undefined && _i5 < len - 3) {
                            count++;
                            temp = 1;
                            l.splice(_i5 - 1, 3, "st", "st", "st");
                            stone_qty -= 3;
                        }
                        if (temp === 2) {
                            if (l[_i5 - 1] === undefined && l[_i5 - 2] === 1) {
                                if (l[_i5 - 3] === undefined && _i5 - 2 !== 0 || l[_i5 + 2] === undefined && _i5 < len - 2) {
                                    count++;
                                    temp = 1;
                                    l.splice(_i5 - 1, 3, "st", "st", "st");
                                    stone_qty -= 2;
                                }
                            }
                            if (l[_i5 + 2] === undefined && l[_i5 + 3] === 1) {
                                if (l[_i5 - 1] === undefined && _i5 !== 0 || l[_i5 + 4] === undefined && _i5 < len - 4) {
                                    count++;
                                    temp = 1;
                                    l.splice(_i5, 3, "st", "st", "st");
                                    stone_qty -= 2;
                                }
                            }
                        }
                        if (l[_i5] === 1 && l[_i5 + 1] === undefined && l[_i5 + 2] === 1 && l[_i5 + 3] === undefined && l[_i5 + 4] === 1) {
                            count++;
                            l.splice(_i5, 2, "st", "st");
                            stone_qty -= 1;
                        }
                    }
                }
                return count;
            }();

            count_two = function () {
                var l = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : line;
                var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : length;

                if (stone_qty < 2) return 0;
                var count = 0;
                for (var _i6 = 0; _i6 < len && stone_qty > 1; _i6++) {
                    if (l[_i6] === 1 && l[_i6 + 1] === 1) {
                        if (l[_i6 - 1] === undefined && l[_i6 - 2] === undefined && l[_i6 + 2] === undefined && _i6 - 1 > 0 || l[_i6 - 1] === undefined && l[_i6 + 2] === undefined && l[_i6 + 3] === undefined && _i6 < len - 3) {
                            count++;
                            stone_qty -= 2;
                            l.splice(_i6, 2, "w", "w");
                            _i6 = +2;
                        }
                    }
                    if (l[_i6] === 1 && l[_i6 + 1] === undefined && l[_i6 + 2] === 1) {
                        if (l[_i6 - 1] === undefined && _i6 > 0 && l[_i6 + 3] === undefined && _i6 < len - 3) {
                            count++;
                            stone_qty -= 1;
                            l.splice(_i6, 1, "w");
                            _i6++;
                        }
                    }
                    if (l[_i6] === 1 && l[_i6 + 1] === undefined && l[_i6 + 2] === undefined && l[_i6 + 3] === 1) {
                        if (l[_i6 - 1] === undefined && _i6 > 0 || l[_i6 + 4] === undefined && _i6 < len - 4) {
                            count++;
                            stone_qty -= 1;
                            l.splice(_i6, 1, "w");
                            _i6 += 2;
                        }
                    }
                }
                return count;
            }();

            count_stwo = function () {
                var l = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : line;
                var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : length;

                if (stone_qty < 2) return 0;
                var count = 0;
                for (var _i7 = 0; _i7 < len && stone_qty > 1; _i7++) {
                    if (l[_i7] === 1 && l[_i7 + 1] === 1) {
                        if ((l[_i7 - 1] === 0 || _i7 === 0) && l[_i7 + 2] === undefined && l[_i7 + 3] === undefined && l[_i7 + 4] === undefined && _i7 < len - 4 || _i7 - 2 > 0 && l[_i7 - 3] === undefined && l[_i7 - 2] === undefined && l[_i7 - 1] === undefined && (l[_i7 + 2] === 0 || (_i7 = len - 3))) {
                            count++;
                            stone_qty -= 2;
                            _i7++;
                            l.splice(_i7, 2, "sw", "sw");
                        }
                    }
                    if (l[_i7] === 1 && l[_i7 + 1] === undefined && l[_i7 + 2] === 1) {
                        if ((l[_i7 - 1] === 0 || _i7 === 0) && l[_i7 + 3] === undefined && l[_i7 + 4] === undefined && _i7 < len - 4 || (_i7 === len - 3 || l[_i7 + 3] === 0) && l[_i7 - 1] === undefined && l[_i7 - 2] === undefined && _i7 - 1 > 0) {
                            count++;
                            stone_qty -= 2;
                            _i7 += 2;
                            l.splice(_i7, 3, "sw", "sw", "sw");
                        }
                    }
                    if (l[_i7] === 1 && l[_i7 + 1] === undefined && l[_i7 + 2] === undefined && l[_i7 + 3] === 1) {
                        if ((l[_i7 - 1] === 0 || _i7 === 0) && l[_i7 + 4] === undefined && _i7 < len - 4 || (l[_i7 + 4] === 0 || (_i7 = len - 4)) && l[_i7 - 1] === undefined && _i7 > 0) {
                            count++;
                            stone_qty -= 2;
                            _i7 += 3;
                            l.splice(_i7, 4, "sw", "sw", "sw", "sw");
                        }
                    }
                }
                return count;
            }();

            return {
                five: count_five,
                four: count_four,
                sfour: count_sfour,
                three: count_three,
                sthree: count_sthree,
                two: count_two,
                stwo: count_stwo
            };
        }
    }, {
        key: "accumulate",
        value: function accumulate(color, line) {
            color.five += line.five;
            color.four += line.four;
            color.sfour += line.sfour;
            color.three += line.three;
            color.sthree += line.sthree;
            color.two += line.two;
            color.stwo += line.stwo;
        }

        /**
         * 汇总所有棋型的数量，按理说使用数组遍历方法可读性会更好些，但不知道函数调用对性能影响的程度，评估核心对性能要求比较苛刻，暂时直接写出循环，待测试另一种写法的效率
         * @param color {object} 对应颜色棋子的统计
         * @param board {Array} 当前棋盘
         */

    }, {
        key: "typesCount",
        value: function typesCount(color, board) {
            var temp = void 0,
                stones = [],
                row = [],
                col = [],
                right_falling = [],
                rising = [];
            for (var i = 0; i < 15; i++) {
                for (var j = 0; j < 15; j++) {
                    if (board[i][j] === 0 || board[i][j] === 1) {
                        stones.push([i, j]);
                    }
                }
            }

            for (var _i8 = 0; _i8 < stones.length; _i8++) {
                if (!row[-stones[_i8][0]]) {
                    row.push(stones[_i8][0]);
                    row[-stones[_i8][0]] = 1;
                }
                if (!col[-stones[_i8][1]]) {
                    col.push(stones[_i8][1]);
                    col[-stones[_i8][1]] = 1;
                }
                if (!right_falling[-(stones[_i8][0] - stones[_i8][1])]) {
                    right_falling.push(stones[_i8][0] - stones[_i8][1]);
                    right_falling[-(stones[_i8][0] - stones[_i8][1])] = 1;
                }
                if (!rising[-(stones[_i8][0] + stones[_i8][1])]) {
                    rising.push(stones[_i8][0] + stones[_i8][1]);
                    rising[-(stones[_i8][0] + stones[_i8][1])] = 1;
                }
            }

            for (var _i9 = 0; _i9 < row.length; _i9++) {
                temp = this.lineAnalysis(this.getRow(row[_i9], board), color);
                this.accumulate(color, temp);
            }
            for (var _i10 = 0; _i10 < col.length; _i10++) {
                temp = this.lineAnalysis(this.getCol(col[_i10], board), color);
                this.accumulate(color, temp);
            }
            for (var _i11 = 0; _i11 < right_falling.length; _i11++) {
                temp = this.lineAnalysis(this.getRightFalling(right_falling[_i11], board), color);
                this.accumulate(color, temp);
            }
            for (var _i12 = 0; _i12 < rising.length; _i12++) {
                temp = this.lineAnalysis(this.getRising(rising[_i12], board), color);
                this.accumulate(color, temp);
            }
        }
    }, {
        key: "countFive",
        value: function countFive(pos, color, board) {
            var Y = pos.posY,
                X = pos.posX,
                rf = Y - X,
                ri = Y + X;
            return this.lineAnalysis(this.getRow(Y, board), color, true) + this.lineAnalysis(this.getCol(X, board), color, true) + this.lineAnalysis(this.getRightFalling(rf, board), color, true) + this.lineAnalysis(this.getRising(ri, board), color, true) > 0;
        }
    }]);
    return Eval;
}();
/**
 *
 * @type {Eval}
 */


var getScore = exports.getScore = new Eval();
//# sourceMappingURL=eval_function.js.map
