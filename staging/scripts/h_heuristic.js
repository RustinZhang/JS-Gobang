/**
 * @fileOverview 历史启发模块 简言之在评估节点时，如果该节点引发剪枝，说明先评估该节点可能增加搜索效率，故增加其权重。越靠近根节点引发剪枝的，权重越高。历史启发不像杀手启发那样需要依赖棋类知识。
 */
"use strict";
/**
 * @module h_heuristic
 */

/**
 * @see <a href="https://chessprogramming.wikispaces.com/History+Heuristic">History Heuristic</a>
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.h_heuristic = undefined;

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var H_Heuristic = function () {
    function H_Heuristic() {
        (0, _classCallCheck3.default)(this, H_Heuristic);

        /**
         * @type {Array}
         */
        this.history_score = [];
        /**
         * @type {Array}
         */
        this.m_TargetBuff = [];
    }

    /**
     * 清除历史得分
     */


    (0, _createClass3.default)(H_Heuristic, [{
        key: "clearHistoryScore",
        value: function clearHistoryScore() {
            for (var i = 0; i < 15; i++) {
                if (!this.history_score[i]) this.history_score.push((0, _from2.default)({ length: 15 }));
                for (var j = 0; j < 15; j++) {
                    this.history_score[i][j] = 0;
                }
            }
        }

        /**
         * 增加历史得分记录
         */

    }, {
        key: "enterHistoryScore",
        value: function enterHistoryScore(pos, depth) {
            this.history_score[pos[0]][pos[1]] += Math.pow(2, depth);
        }

        /**
         * 获取历史得分
         * @param pos {Array}
         */

    }, {
        key: "getHistoryScore",
        value: function getHistoryScore(pos) {
            return this.history_score[pos[0]][pos[1]];
        }

        // 以下几个函数排序用，采用的是归并排序 mergeSort 供外部调用，实际上棋盘上一共才225个位置，而且限定了走法范围，排序数组远小于这个规模，冒泡排序问题不大，看到有资料用这个，用来试试

    }, {
        key: "mergeSort",


        /**
         * 供调用的排序API
         * @param source
         * @param n
         * @param direction
         */
        value: function mergeSort(source, n, direction) {
            var s = 1;
            while (s < n) {
                H_Heuristic.mergePass(source, this.m_TargetBuff, s, n, direction);
                s += s;
                H_Heuristic.mergePass(this.m_TargetBuff, source, s, n, direction);
                s += s;
            }
        }
    }], [{
        key: "mergeAZ",
        value: function mergeAZ(source, target, l, m, r) {
            var i = l,
                j = m + 1,
                k = l;
            while (i <= m && j <= r) {
                if (source[i].score <= source[j].score) {
                    target[k++] = source[i++];
                } else {
                    target[k++] = source[j++];
                }
            }
            if (i > m) {
                for (var q = j; q <= r; q++) {
                    target[k++] = source[q];
                }
            } else {
                for (var _q = i; _q <= m; _q++) {
                    target[k++] = source[_q];
                }
            }
        }
    }, {
        key: "mergeZA",
        value: function mergeZA(source, target, l, m, r) {
            var i = l,
                j = m + 1,
                k = l;
            while (i <= m && j <= r) {
                if (source[i].score >= source[j].score) {
                    target[k++] = source[i++];
                } else {
                    target[k++] = source[j++];
                }
            }
            if (i > m) {
                for (var q = j; q <= r; q++) {
                    target[k++] = source[q];
                }
            } else {
                for (var _q2 = i; _q2 <= m; _q2++) {
                    target[k++] = source[_q2];
                }
            }
        }
    }, {
        key: "mergePass",
        value: function mergePass(source, target, s, n, direction) {
            var i = 0;
            while (i <= n - 2 * s) {
                if (direction) {
                    this.mergeAZ(source, target, i, i + s - 1, i + 2 * s - 1);
                } else {
                    this.mergeZA(source, target, i, i + s - 1, i + 2 * s - 1);
                }
                i = i + 2 * s;
            }
            if (i + s < n) {
                if (direction) {
                    this.mergeAZ(source, target, i, i + s - 1, n - 1);
                } else {
                    this.mergeZA(source, target, i, i + s - 1, n - 1);
                }
            } else {
                for (var j = i; j <= n - 1; j++) {
                    target[j] = source[j];
                }
            }
        }
    }]);
    return H_Heuristic;
}();
/**
 * @type {H_Heuristic}
 */


var h_heuristic = exports.h_heuristic = new H_Heuristic();
//# sourceMappingURL=h_heuristic.js.map
