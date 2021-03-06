/**
 * @fileOverview 采用深度搜索，会面临很多相同的局面，将评估过的局面存入置换表，下次遇到可以直接从表中调取得分。事实上抽象的数据结构是一个哈希表，这里采用 Object 实现，用 Map 会更直观一些，待有时间重构时可能会考虑更改。置换表采用的策略是用内存空间换取CPU计算时间。
 */
/**
 * 置换表模块，由 T_Tbale 一个类构成，详见该类
 * @module t_table
 */

'use strict';
/**
 * 置换表类
 * @see <a href='https://en.wikipedia.org/wiki/Transposition_table'>Transposition_table</a>
 */
class T_Table {
    /**
     * Create a t_table
     * 数据结构方面，散列查找使用哈希表，连续小数据采用数组
     */
    constructor() {
        this.trans_table = new Map();
        this.hash_key = 0;
        this.hash_checksum = 0;
        this.size = 50e7;
        this.hash_lookup = T_Table.zobristInit();
    }

    /**
     * 使用置换表最大的问题是如何设计一套规则表示独特的局面避免冲突，Zobrist 算法是实现之一。该算法首先对棋盘所有位置相应的棋子类型分别生成32位和64位两组随机数，并将所有棋盘上的棋子两组随机数分别相加，32位的随机数%哈希表作为键，64位的随机数作为 checksum，存在值的对象中。之后每走一步就只针对最后一步变化做增量减量计算，可以使用位运算，也可以使用加减（这里是抽象的算法，不涉及语言）。
     * @see <a href='https://en.wikipedia.org/wiki/Zobrist_hashing'>Zobrist Hashing on wiki</a>
     * @returns {Array}
     */
    static zobristInit() {
        let zobrist = [];
        for ( let i = 15; i--; ) {
            zobrist.push( Array.from( { length: 15 } ) );
        }
        for ( let i = 0; i < 15; i++ ) {
            for ( let j = 0; j < 15; j++ ) {
                zobrist[ i ][ j ] = [ [], [] ];
                for ( let k = 0; k < 2; k++ ) {
                    zobrist[ i ][ j ][ k ][ 0 ] = Math.floor( Math.random() * 10e12 );
                    zobrist[ i ][ j ][ k ][ 1 ] = Math.floor( Math.random() * 10e12 );
                }
            }
        }
        return zobrist;
    }

    /**
     * 调用搜索函数前，先计算当前棋盘的哈希值，每次下棋前都对棋盘重新计算，因为只进行一次，代价不会太高，可以少保存一个变量，也可以让玩家下子和AI计算之间的耦合更松，方便悔棋等的操作
     * @param board {array} 当前棋盘
     */
    calculateInitHashKey( board ) {
        let stone;
        this.hash_key = 0;
        this.hash_checksum = 0;
        for ( let i = 0; i < 15; i++ ) {
            for ( let j = 0; j < 15; j++ ) {
                stone = board[ i ][ j ];
                if ( stone !== undefined ) {
                    this.hash_key += stone ? this.hash_lookup[ i ][ j ][ 1 ][ 0 ] : this.hash_lookup[ i ][ j ][ 0 ][ 0 ];
                    this.hash_checksum += stone ? this.hash_lookup[ i ][ j ][ 1 ][ 1 ] : this.hash_lookup[ i ][ j ][ 0 ][ 1 ];
                }
            }
        }
    }

    /**
     * 新下一个棋子，计算新的棋盘哈希值，采用加法计算，JS在位运算时需要转换数值类型，且目前位数超过32位，未采用位运算, 本程序中还加了一层判断，在键相同的同时只有搜索深度相等时才算命中（有的程序采用的是奇偶相同（敌我）算命中），这样会减少一定的命中次数，但相同层数的命中才是更普遍的。而且这样有一个好处即是能够减少冲突，也避免了两个随机数拼接成字符串对性能的影响
     * @param entry {Array}  当前棋子坐标
     * @param board {Array}  当前棋盘
     */
    hashMakeMove( entry, board ) {
        let i = entry[ 0 ], j = entry[ 1 ], stone = board[ i ][ j ];
        this.hash_key += stone ? this.hash_lookup[ i ][ j ][ 1 ][ 0 ] : this.hash_lookup[ i ][ j ][ 0 ][ 0 ];
        this.hash_checksum += stone ? this.hash_lookup[ i ][ j ][ 1 ][ 1 ] : this.hash_lookup[ i ][ j ][ 0 ][ 1 ];
    }

    /**
     * AI取消一个棋子
     * @param entry {Array}
     * @param board {Array}
     */
    hashUnMakeMove( entry, board ) {
        let i = entry[ 0 ], j = entry[ 1 ], stone = board[ i ][ j ];
        this.hash_key -= stone ? this.hash_lookup[ i ][ j ][ 1 ][ 0 ] : this.hash_lookup[ i ][ j ][ 0 ][ 0 ];
        this.hash_checksum -= stone ? this.hash_lookup[ i ][ j ][ 1 ][ 1 ] : this.hash_lookup[ i ][ j ][ 0 ][ 1 ];
    }

    /**
     * 查看当前局面是否在哈希表中，存储的节点分为三种，即精确计算过的值和剪枝得到的上下边界
     * @param alpha {number}
     * @param beta  {number}
     * @param depth {number}
     * @returns {number}
     */
    lookUpHashTable( alpha, beta, depth ) {
        let n = this.hash_key % this.size, entry;
        if ( !this.trans_table.has( n ) ) return 404404; //
        entry = this.trans_table.get( n );
        if ( entry[ 3 ] !== depth ) return 404404;
        if ( entry[ 0 ] === this.hash_checksum ) {
            switch ( entry[ 1 ] ) {
                case 0:
                    return entry[ 2 ];
                    break;
                case 1: // lower_bound
                    if ( entry[ 2 ] >= beta ) {
                        return entry[ 2 ];
                    }
                    break;
                case -1: //upper_bound
                    if ( entry[ 2 ] <= alpha ) {
                        return entry[ 2 ];
                    }
                    break;
            }
        }
        return 404404; // 不存在，返回一个不在评分范围内的约定值
    }

    /**
     * 将数据存入哈希表
     * @param type {string}
     * @param value {number}
     * @param depth {number}
     */
    enterHashTable( type, value, depth ) {
        let n = this.hash_key % this.size;
        this.trans_table.set( n, [ this.hash_checksum, type, value, depth ] );
    }
}
/** export the instance of T_Table  */
export let t_table = new T_Table();