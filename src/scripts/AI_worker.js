/**
 * @fileOverview AI的模块联结文件
 */
/**
 * Web Worker 这个类主要由一个搜索函数组成，依赖历史启发、置换表、走法生成、估值核心几个模块
 * @module AI_worker
 * @see module: h_heuristic
 * @see module: t_table
 * @see module: move_generator
 * @see moduel: eval_function
 */

'use strict';
import { h_heuristic } from './h_heuristic.js';
import { t_table } from './t_table.js';
import { m_gen } from './move_generator.js';
import { getScore } from './eval_function.js';
// 和主进程的变量名相同，只是为了方便，是值相同的副本，但不共享状态
let max_dep, alpha, beta, step, steps_hist, virtual_b, best_move, score;
addEventListener( 'message', ( e ) => {
    [ max_dep, alpha, beta, step, virtual_b, steps_hist ] = e.data;
    h_heuristic.clearHistoryScore();
    t_table.calculateInitHashKey( virtual_b );
    Promise.resolve( negaScout( max_dep, alpha, beta ) )
    .then(
    function( e ) {
        score = e;
        postMessage( [ score, best_move ] );
    }
    );
} );
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
function negaScout( depth, alpha, beta ) {
    let to_try, a, b, t, bestIndex, score, exact;
    // 越靠近根节点，分数权重越高
    // 如果游戏结束，停止这一分支的搜索，返回极值
    if ( getScore.isGameOver( step, virtual_b ) ) return getScore.evaluate( step, virtual_b ) * (1 - (max_dep - depth) * .05);
    score = t_table.lookUpHashTable( alpha, beta, depth );
    if ( score !== 404404 ) return score;
    if ( depth === 0 ) {
        score = getScore.evaluate( step, virtual_b ) * (1 - (max_dep - depth) * .05);
        t_table.enterHashTable( 0, score, depth );
        return score;
    }
    to_try = m_gen.getAvail( virtual_b, steps_hist );
    for ( let i = 0; i < to_try.length; i++ ) {
        to_try[ i ].score = h_heuristic.getHistoryScore( to_try[ i ] );
    }
    h_heuristic.mergeSort( to_try, to_try.length, 0 );
    bestIndex = -1;
    a = alpha;
    b = beta;
    exact = 0;
    for ( let i = 0; i < to_try.length; i++ ) {
        // 如果是根节点，发送进度数据给主进程
        if ( depth === max_dep ) postMessage( [ i / to_try.length * 100, false ] );
        m_gen.moveForward( to_try[ i ], depth, step, virtual_b, max_dep, steps_hist );
        t_table.hashMakeMove( to_try[ i ], virtual_b );
        t = -negaScout( depth - 1, -b, -a );
        if ( t > a && t < beta && i > 0 ) {
            a = -negaScout( depth - 1, -beta, -t );
            exact = 1;
            if ( depth === max_dep ) best_move = to_try[ i ];
            bestIndex = i;
        }
        t_table.hashUnMakeMove( to_try[ i ], virtual_b );
        m_gen.moveBack( to_try[ i ], step, virtual_b, steps_hist );
        if ( a < t ) {
            exact = 1;
            a = t;
            if ( depth === max_dep ) best_move = to_try[ i ];
        }
        if ( a >= beta ) {
            t_table.enterHashTable( 1, a, depth );
            h_heuristic.enterHistoryScore( to_try[ i ], depth );
            return a;
        }
        b = a + 1;
    }
    if ( bestIndex !== -1 ) h_heuristic.enterHistoryScore( to_try[ bestIndex ], depth );
    // 操作历史记录表
    if ( exact ) {
        t_table.enterHashTable( 0, a, depth );
    }
    else {
        t_table.enterHashTable( -1, a, depth );
    }
    return a;
}