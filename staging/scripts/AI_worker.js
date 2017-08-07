/**
 * @fileOverview AI的主模块，依赖历史启发模块、置换表模块、走法生成模块和评估核心模块。接收主进程传递的数据后启动搜索函数，返回最佳走法和得分给主进程
 */
/**
 * Web Worker
 * @module AI_worker
 * @see module: h_heuristic
 * @see module: t_table
 * @see module: move_generator
 * @see moduel: eval_function
 */

"use strict";

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _h_heuristic = require('./h_heuristic.js');

var _t_table = require('./t_table.js');

var _move_generator = require('./move_generator.js');

var _eval_function = require('./eval_function.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 和主进程的变量名相同，只是为了方便，是值相同的副本，但不共享状态
var max_dep = void 0,
    alpha = void 0,
    beta = void 0,
    step = void 0,
    steps_hist = void 0,
    virtual_b = void 0,
    best_move = void 0,
    score = void 0;

addEventListener("message", function (e) {
    var _e$data = (0, _slicedToArray3.default)(e.data, 6);

    max_dep = _e$data[0];
    alpha = _e$data[1];
    beta = _e$data[2];
    step = _e$data[3];
    virtual_b = _e$data[4];
    steps_hist = _e$data[5];

    _h_heuristic.h_heuristic.clearHistoryScore();
    _t_table.t_table.calculateInitHashKey(virtual_b);
    _promise2.default.resolve(negaScout(max_dep, alpha, beta)).then(function (e) {
        score = e;
        postMessage([score, best_move]);
    });
});

/**
 * 搜索函数
 * @see <a href='https://en.wikipedia.org/wiki/Minimax'>Minimax</a>
 * @see <a href='https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning'>Alpha-beta pruning</a>
 * @see <a href='https://en.wikipedia.org/wiki/Principal_variation_search'>Principal_variation_search</a>
 * @param depth {number} 最大搜索深度，可以扩展由玩家选择难度
 * @param alpha {number} 下边界
 * @param beta {number} 上边界
 * @returns {number} 返回评分，最佳走法在函数中生成
 */
function negaScout(depth, alpha, beta) {
    var to_try = void 0,
        a = void 0,
        b = void 0,
        t = void 0,
        bestIndex = void 0,
        score = void 0,
        exact = void 0;
    // 越靠近根节点，分数权重越高
    // 如果游戏结束，停止这一分支的搜索，返回极值
    if (_eval_function.getScore.isGameOver(step, virtual_b)) return _eval_function.getScore.evaluate(step, virtual_b) * (1 - (max_dep - depth) * .05);
    score = _t_table.t_table.lookUpHashTable(alpha, beta, depth);
    if (score !== 404404) return score;
    if (depth === 0) {
        score = _eval_function.getScore.evaluate(step, virtual_b) * (1 - (max_dep - depth) * .05);
        _t_table.t_table.enterHashTable(0, score, depth);
        return score;
    }
    to_try = _move_generator.m_gen.getAvail(virtual_b, steps_hist);
    for (var i = 0; i < to_try.length; i++) {
        to_try[i].score = _h_heuristic.h_heuristic.getHistoryScore(to_try[i]);
    }
    _h_heuristic.h_heuristic.mergeSort(to_try, to_try.length, 0);
    bestIndex = -1;
    a = alpha;
    b = beta;
    exact = 0;
    for (var _i = 0; _i < to_try.length; _i++) {
        // 如果是根节点，发送进度数据给主进程
        if (depth === max_dep) postMessage([_i / to_try.length * 100, false]);
        _move_generator.m_gen.moveForward(to_try[_i], depth, step, virtual_b, max_dep, steps_hist);
        _t_table.t_table.hashMakeMove(to_try[_i], virtual_b);
        t = -negaScout(depth - 1, -b, -a);
        if (t > a && t < beta && _i > 0) {
            a = -negaScout(depth - 1, -beta, -t);
            exact = 1;
            if (depth === max_dep) best_move = to_try[_i];
            bestIndex = _i;
        }
        _t_table.t_table.hashUnMakeMove(to_try[_i], virtual_b);
        _move_generator.m_gen.moveBack(to_try[_i], step, virtual_b, steps_hist);
        if (a < t) {
            exact = 1;
            a = t;
            if (depth === max_dep) best_move = to_try[_i];
        }
        if (a >= beta) {
            _t_table.t_table.enterHashTable(1, a, depth);
            _h_heuristic.h_heuristic.enterHistoryScore(to_try[_i], depth);
            return a;
        }
        b = a + 1;
    }
    if (bestIndex !== -1) _h_heuristic.h_heuristic.enterHistoryScore(to_try[bestIndex], depth);
    // 操作历史记录表
    if (exact) {
        _t_table.t_table.enterHashTable(0, a, depth);
    } else {
        _t_table.t_table.enterHashTable(-1, a, depth);
    }
    return a;
}
//# sourceMappingURL=AI_worker.js.map
