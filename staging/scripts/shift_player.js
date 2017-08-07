/**
 * @fileOverview 这个模块提供了 Shifter 和 GUI 两个类，Shifter 类负责转换逻辑，GUI 负责玩家动作反馈
 */
"use strict";
/**
 * @module shift_player
 * @see module: init
 * @see module: eval_function
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.gui = exports.shift = undefined;

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _init = require("./init.js");

var _eval_function = require("./eval_function.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Shifter 转换下棋方
 */
var Shifter = function () {
    function Shifter() {
        (0, _classCallCheck3.default)(this, Shifter);

        /**
         * AI Web Worker
         * @type {Worker}
         */
        this.cmt_AI = new Worker("scripts/AI_worker.js");
        /**
         * 计时器ID
         * @type {number}
         */
        this.inter_id = 0;
    }

    /**
     * 当前玩家提示
     * @param step {object}
     */


    (0, _createClass3.default)(Shifter, [{
        key: "clockControl",


        /**
         * 控制玩家下棋数秒和 AI思考进度反馈
         * @param [id] {number}  计时器ID
         * @see Shifter.inter_id
         */
        value: function clockControl(id) {
            var start = Date.now(),
                duration = void 0,
                dr_UI = document.querySelector("span.progress"),
                progressUI = document.querySelector("progress.progress"),
                progress = document.querySelector("p.progress");
            if (id !== undefined) {
                clearInterval(id);
            } else {
                this.inter_id = setInterval(function () {
                    duration = Math.floor((Date.now() - start) / 1000);
                    if (duration < 20) {
                        dr_UI.innerHTML = duration + "\u79D2";
                        progressUI.value = duration / 20 * 100;
                    } else {
                        progressUI.value = 100;
                        progress.innerHTML = "\u7535\u8111\u6570\u7740\u6570\u7740\u7761\u7740\u4E86... <span class=\"progress\"></span></p>";
                    }
                }, 100);
            }
        }

        /**
         * 转换下棋方逻辑抽象函数
         * @param [s] {object} 最后一步棋
         * @param [b] {Array} 当前虚拟棋盘
         * @param [hist] {Array} 历史记录
         */

    }, {
        key: "convert",
        value: function convert() {
            var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _init.step;

            var _this = this;

            var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _init.virtual_b;
            var hist = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _init.steps_hist;

            var best_move = void 0,
                score = void 0,
                progress = void 0,
                _handler = void 0;
            if (!s.turn) {
                if (_eval_function.getScore.isGameOver(s, b)) {
                    console.log("Player win");
                    gui.showResult(false);
                } else {
                    console.log("AI begin to work");
                    s.turn = true;
                    this.clockControl(this.inter_id);
                    Shifter.indicatorControl(s);
                    this.cmt_AI.postMessage([s.max_dep, -10000, 10000, s, b, hist]);
                    // babel 的新特性在编译时可以给箭头函数name属性，方便函数调用自身的同时不会更改this
                    this.cmt_AI.addEventListener("message", _handler = function handler(e) {
                        var progressNum = document.querySelector("p.progress"),
                            progressUI = document.querySelector("progress.progress");
                        if (!e.data[1]) {
                            progressUI.value = e.data[0];
                            progressNum.innerHTML = "\u7535\u8111\u601D\u8003\u4E2D\uFF1A<span class=\"progress\"> " + Math.ceil(progressUI.value) + " %</span></p>";
                        } else {
                            s.turn = false;

                            var _e$data = (0, _slicedToArray3.default)(e.data, 2);

                            score = _e$data[0];
                            best_move = _e$data[1];

                            s.color = !hist[hist.length - 1][2];
                            b[best_move[0]][best_move[1]] = s.color ? 1 : 0;
                            var _best_move = best_move;

                            var _best_move2 = (0, _slicedToArray3.default)(_best_move, 2);

                            s.posY = _best_move2[0];
                            s.posX = _best_move2[1];

                            if (document.querySelector(".new-step")) document.querySelector(".new-step").classList.remove("new-step");
                            document.querySelector(".r" + best_move[0] + " .col" + best_move[1]).innerHTML = s.color ? '<div class="stone-w new-step"></div>' : '<div class="stone-b new-step"></div>';
                            progressUI.value = 100;
                            progressNum.innerHTML = "\u7535\u8111\u601D\u8003\u5B8C\u6210 <span class=\"progress\">" + progressUI.value + "%</span></p>";
                            hist.push([best_move[0], best_move[1], s.color, true]);
                            //TODO: 重复代码，逻辑待优化
                            if (_eval_function.getScore.isGameOver(s, b)) {
                                console.log("AI win");
                                s.turn = true;
                                gui.showResult(true);
                            } else {
                                console.log("Player turn");
                                Shifter.indicatorControl(s);
                                s.color = !s.color;
                                _this.clockControl(_this.inter_id);
                                _this.clockControl();
                            }
                            // 停止监听避免多次接受数据
                            _this.cmt_AI.removeEventListener("message", _handler);
                        }
                    });
                }
            } else {
                if (_eval_function.getScore.isGameOver(s, b)) {
                    console.log("AI win");
                    s.turn = true;
                    gui.showResult(true);
                } else {
                    console.log("Player turn");
                    s.turn = false;
                    Shifter.indicatorControl(s);
                    s.color = !s.color;
                    this.clockControl(this.inter_id);
                    this.clockControl();
                }
            }
        }
    }], [{
        key: "indicatorControl",
        value: function indicatorControl(step) {
            var indicator = document.querySelector(".indicator"),
                progress = document.querySelector("p.progress");
            indicator.innerHTML = step.color ? '<span class="stone-b"></span>' + (step.turn ? '电脑走棋' : '玩家走棋') : '<span class="stone-w"></span>' + (step.turn ? '电脑走棋' : '玩家走棋');
            progress.innerHTML = step.turn ? "\u7535\u8111\u601D\u8003\u4E2D\uFF1A <span class=\"progress\"></span></p>" : "\u7535\u8111\u778C\u7761\u4E2D... <span class=\"progress\"></span></p>";
        }
    }]);
    return Shifter;
}();
/**
 * UI逻辑处理
 */


var GUI = function () {
    function GUI() {
        (0, _classCallCheck3.default)(this, GUI);
    }

    (0, _createClass3.default)(GUI, null, [{
        key: "remove",


        /**
         * 悔棋删除棋子，同时将最后一步的标记前移
         * @param n {number} 删除棋子的个数
         */
        value: function remove(n) {
            var stone = void 0;
            for (var i = 0; i < n; i++) {
                stone = _init.steps_hist.pop();
                _init.virtual_b[stone[0]][stone[1]] = undefined;
                document.querySelector(".r" + stone[0] + " .col" + stone[1]).innerHTML = '';
                document.querySelector(".r" + stone[0] + " .col" + stone[1]).classList.remove("new-step");
            }
        }

        /**
         * 获取玩家下棋的位置
         * @param element {Node}
         * @returns {Array} 返回坐标数组
         */

        /**
         * 重新开始游戏
         */

    }, {
        key: "getPlayerPos",
        value: function getPlayerPos(element) {
            var class_arr = element.classList,
                parent = element.parentNode,
                class_arr_par = parent.classList,
                target_row = void 0,
                target_col = void 0;
            target_row = +class_arr_par[1].substring(1);
            target_col = +class_arr[1].substring(3);
            return [target_row, target_col];
        }

        /**
         * 游戏结束，处理界面
         * @param side {boolean} side?'AI赢':'玩家赢'
         */

    }, {
        key: "showResult",
        value: function showResult(side) {
            var end_shade = document.createElement("div"),
                dialog = document.createElement("div"),
                message = document.createElement("p"),
                cancel = document.createElement("div"),
                restart = document.createElement("div"),
                container = document.querySelector("body");
            end_shade.className = "end-shade";
            dialog.className = "end-window";
            message.className = "message";
            cancel.className = "review";
            restart.className = "new-game";
            message.innerHTML = side ? "你输了，AI偷偷鄙视了人类" : "你赢了，但AI觉得机器太慢了";
            cancel.innerHTML = "取 消";
            restart.innerHTML = "再 来";
            end_shade.appendChild(dialog);
            dialog.appendChild(message);
            dialog.appendChild(cancel);
            dialog.appendChild(restart);
            container.appendChild(end_shade);
            // 玩家选择再来一局
            restart.addEventListener("click", function () {
                end_shade.style.display = 'none';
                GUI.restart();
            });
            //玩家选择取消，可以查看复盘
            cancel.addEventListener("click", function () {
                end_shade.remove();
                for (var i = 0; i < _init.steps_hist.length; i++) {
                    document.querySelector(".r" + _init.steps_hist[i][0] + "  .col" + _init.steps_hist[i][1] + " div").innerHTML = i + 1 + '';
                }
            });
        }
    }]);
    return GUI;
}();
/**
 * @see Shifter#shift
 * 导出 Shifter的实例
 * @type {Shifter}
 */


GUI.restart = function () {
    var grid = '',
        chess_move = document.querySelector(".chess-move");
    document.querySelector(".shade").style.display = "block";
    shift.cmt_AI.terminate();
    shift.clockControl(shift.inter_id);
    var _ref = [0, 0, 0, 0];
    _init.step.turn = _ref[0];
    _init.step.color = _ref[1];
    _init.step.posX = _ref[2];
    _init.step.posY = _ref[3];

    _init.virtual_b.length = 0;
    for (var i = 15; i--;) {
        _init.virtual_b.push((0, _from2.default)({ length: 15 }));
    }
    _init.steps_hist.length = 0;
    for (var _i = 0; _i < 15; _i++) {
        grid += "<ul class=\"row r" + _i + " \">";
        for (var j = 0; j < 15; j++) {
            grid += "<li class=\"column col" + j + "\"></li>";
        }
        grid += '</ul>';
    }
    chess_move.innerHTML = grid;
    exports.shift = shift = new Shifter();
};

var shift = exports.shift = new Shifter();
/**
 * 导出GUI类
 * @type {GUI}
 */
var gui = exports.gui = GUI;
//# sourceMappingURL=shift_player.js.map
