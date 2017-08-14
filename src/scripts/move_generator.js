/**
 * @fileOverview 在启动搜索后负责生成、撤销棋子。
 */
'use strict';
/**
 * 走法生成模块，由 MoveGenerator 一个类构成，详见该类
 * @module move_generator
 */
/**
 * 走法生成类
 */
class MoveGenerator {
    /**
     * 生成一步走法，为了避免web worker 那边有太多的依赖甚至状态混乱，没有引如init模块，这个函数传参有点多
     * @param entry {Array} 坐标
     * @param dep {number} 搜索层深度
     * @param step {object}
     * @param board {Array} 当前棋盘
     * @param max_dep {number} 最大搜索深度
     * @param hist {Array} 历史记录
     */
    static moveForward( entry, dep, step, board, max_dep, hist ) {
        step.color = (max_dep - dep) % 2 ? hist[ hist.length - 1 ][ 2 ] : !hist[ hist.length - 1 ][ 2 ];
        if ( entry !== undefined ) {
            board[ entry[ 0 ] ][ entry[ 1 ] ] = step.color ? 1 : 0;
            [ step.posY, step.posX ] = entry;
        }
    }

    /**
     * 撤销之前的走法
     * @param entry {array} 坐标
     * @param step {object}
     * @param board {Array} 棋盘
     * @param hist {Array} 历史记录
     */
    static moveBack( entry, step, board, hist ) {
        if ( entry !== undefined ) {
            board[ entry[ 0 ] ][ entry[ 1 ] ] = undefined;
            [ step.posY, step.posX ] = hist[ hist.length - 1 ];
        }
    }

    /**
     * 获得所有的可走位置，在实际情况中，很少出现远离现存棋子的下子，因此这里限定了搜索范围在现有棋子的两个范围内，这个限定对AI思考能力是有影响的，但是从不限制到三格，三格到两格，两格到一格都对AI的速度有可感知的影响，且棋力的提高与范围的关系必然不是线性的。
     * @param board {Array} 当前棋盘
     * @param hist {Array} 历史记录
     * @returns {entry[]}
     */
    static getAvail( board, hist ) {
        let temp_b = Array.from( { length: 15 } ),
        min_row, max_row, min_col, max_col, avails = [];
        for ( let i = 0; i < temp_b.length; i++ ) {
            temp_b[ i ] = Array.from( board[ i ] );
        }
        if ( hist.length === 0 ) {
            return [ [ 7, 7 ] ];
        }
        else {
            for ( let i = 0; i < hist.length; i++ ) {
                min_row = hist[ i ][ 0 ] - 2 < 0 ? 0 : hist[ i ][ 0 ] - 2;
                max_row = hist[ i ][ 0 ] + 2 > 14 ? 14 : hist[ i ][ 0 ] + 2;
                min_col = hist[ i ][ 1 ] - 2 < 0 ? 0 : hist[ i ][ 1 ] - 2;
                max_col = hist[ i ][ 1 ] + 2 > 14 ? 14 : hist[ i ][ 1 ] + 2;
                for ( let j = min_row; j <= max_row; j++ ) {
                    for ( let k = min_col; k <= max_col; k++ ) {
                        if ( temp_b[ j ][ k ] === undefined ) {
                            avails.push( [ j, k ] );
                            temp_b[ j ][ k ] = -1;
                        }
                    }
                }
            }
            return avails;
        }
    }
}
/**
 * 将类本身导出
 * @type {MoveGenerator}
 */
export let m_gen = MoveGenerator;