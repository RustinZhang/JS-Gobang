/**
 * @fileOverview 玩家的所有操作的DOM操作由这个模块控制
 */
"use strict";
/**
 * @module make_move_GUI
 * @see module: init
 * @see module: shift_player
 */

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _init = require("./init.js");

var _shift_player = require("./shift_player.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var move_fr_UI = document.querySelector(".chess-move"),
    shade = document.querySelector(".shade"),
    choose_difficulty = document.querySelector(".difficulty"),
    retract = document.querySelector(".retract"),
    restart = document.querySelector(".restart");

// 玩家选择白色，电脑先手，事件回调一律使用箭头函数避免意外改变this
choose_difficulty.addEventListener("click", function (e) {
    if (e.target.classList.contains('choose-diff')) {
        if (e.target.classList.contains('normal')) _init.step.max_dep = 4;
        if (e.target.classList.contains('easy')) _init.step.max_dep = 2;

        shade.style.display = "none";
        _init.step.turn = true;
        _init.step.color = false;
        console.log("AI begin to work");
        _init.virtual_b[7][7] = 0;
        _init.step.posY = 7;
        _init.step.posX = 7;
        document.querySelector(".r7 .col7").innerHTML = '<div class="stone-b"></div>';
        _init.steps_hist.push([7, 7, false]);
        _shift_player.shift.convert();
    }
});

// 玩家落子
move_fr_UI.addEventListener("click", function (e) {
    if (e.target.classList.contains("column") && !_init.step.turn) {
        var pos = _shift_player.gui.getPlayerPos(e.target);
        if (_init.virtual_b[pos[0]][pos[1]] === undefined) {
            if (document.querySelector(".new-step")) document.querySelector(".new-step").classList.remove("new-step");
            e.target.innerHTML = _init.step.color ? '<div class="stone-w new-step"></div>' : '<div class="stone-b new-step"></div>';
            _init.virtual_b[pos[0]][pos[1]] = _init.step.color ? 1 : 0;

            var _pos = (0, _slicedToArray3.default)(pos, 2);

            _init.step.posY = _pos[0];
            _init.step.posX = _pos[1];

            _init.steps_hist.push([pos[0], pos[1], _init.step.color, false]);
            setTimeout(function () {
                _shift_player.shift.convert();
            }, 0);
        }
    }
});

// 悔棋按钮
retract.addEventListener("click", function () {
    if (_init.steps_hist.length > 2) {
        // 如果 AI 还在思考时玩家反悔，中止运算
        if (_init.step.turn) {
            _shift_player.shift.cmt_AI.terminate();
            _shift_player.shift.cmt_AI = new Worker("scripts/AI_worker.js");
        }
        // 如果最后一步棋是 AI 下的，删两个子
        if (_init.steps_hist[_init.steps_hist.length - 1][3]) {
            _shift_player.gui.remove(2);
        }
        // 如果最后一步是玩家下的，删一个子
        else {
                _shift_player.gui.remove(1);
            }

        var _steps_hist = (0, _slicedToArray3.default)(_init.steps_hist[_init.steps_hist.length - 1], 3);

        _init.step.posY = _steps_hist[0];
        _init.step.posX = _steps_hist[1];
        _init.step.color = _steps_hist[2];

        _init.step.turn = true;
        document.querySelector(".r" + _init.steps_hist[_init.steps_hist.length - 1][0] + " .col" + _init.steps_hist[_init.steps_hist.length - 1][1]).classList.add("new-step");
        _shift_player.shift.convert();
    }
});

/**
 * @see module: shift_player.gui.restart
 */

restart.addEventListener("click", _shift_player.gui.restart);
//# sourceMappingURL=make_move_GUI.js.map
