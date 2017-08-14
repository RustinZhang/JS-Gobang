/**
 * @fileOverview 估值核心，直接影响 AI 的智能程度。
 */
'use strict';
/**
 * 估值核心模块，由 Eval 一个类构成，详见该类
 * @module eval_function
 */
/**
 * 评估核心类
 */
class Eval {
    /**
     * get the position value
     * @returns {Array}
     */
    get pos_val() {
        return this._pos_val;
    }

    constructor() {
        /**
         * 棋盘上每个位置的权重，越靠近中心权重越高
         * @type {Array}
         */
        this._pos_val = [
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0 ],
            [ 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0 ],
            [ 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0 ],
            [ 0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 1, 0 ],
            [ 0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2, 1, 0 ],
            [ 0, 1, 2, 3, 4, 5, 6, 6, 6, 5, 4, 3, 2, 1, 0 ],
            [ 0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0 ],
            [ 0, 1, 2, 3, 4, 5, 6, 6, 6, 5, 4, 3, 2, 1, 0 ],
            [ 0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2, 1, 0 ],
            [ 0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 3, 2, 1, 0 ],
            [ 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0 ],
            [ 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0 ],
            [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
        ];
    }

    /**
     * 行的一维抽象
     * @param posY {number} 当前位置的Y值
     * @param b {Array} 当前棋盘
     * @returns {Array} 当前行的数组
     */
    static getRow( posY, b ) {
        return b[ posY ];
    }

    /**
     * 列的一维抽象，同理
     * @param posX {number}
     * @param b {Array}
     * @returns {Array}
     */
    static getCol( posX, b ) {
        let temp_arr = [];
        for ( let i = 0; i < 15; i++ ) {
            temp_arr.push( b[ i ][ posX ] );
        }
        return temp_arr;
    }

    /**
     *
     * @param origin {number}
     * @param b {Array} 当前棋盘
     * @returns {Array}
     */
    static getRightFalling( origin, b ) {
        let temp_arr = [];
        if ( origin < -10 || origin > 10 ) return undefined;
        for ( let i = origin <= 0 ? 0 : origin; i <= (origin < 0 ? 14 + origin : 14); i++ ) {
            temp_arr.push( b[ i ][ i - origin ] );
        }
        return temp_arr;
    }

    /**
     *
     * @param origin {number}
     * @param b {Array}
     * @returns {Array}
     */
    static getRising( origin, b ) {
        let temp_arr = [];
        if ( origin < 4 || origin > 24 ) return undefined;
        for ( let i = origin >= 15 ? origin - 14 : 0; i <= (origin > 14 ? 14 : origin); i++ ) {
            temp_arr.push( b[ i ][ origin - i ] );
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
    static lineAnalysis( line_to_analysis, color, game_over = false ) {
        if ( line_to_analysis === undefined ) {
            return {
                five  : 0,
                four  : 0,
                sfour : 0,
                three : 0,
                sthree: 0,
                two   : 0,
                stwo  : 0
            };
        }
        let count_five,
        count_four = 0,
        count_sfour = 0,
        count_three = 0,
        count_sthree = 0,
        count_two = 0,
        count_stwo = 0,
        stone_qty = 0,
        side = typeof color === 'string' ? color : color.color,
        line = Array.from( line_to_analysis ),
        length = line.length;
        for ( let i = 0; i < length; i++ ) {
            if ( side === 'black' ) {
                if ( line[ i ] === 1 ) {
                    line[ i ] = 0;
                }
                else if ( line[ i ] === 0 ) {
                    line[ i ] = 1;
                    stone_qty++;
                }
            }
            else {
                if ( line[ i ] === 1 ) stone_qty++;
            }
        }
        count_five = (function( l = line, len = length ) {
            if ( stone_qty < 5 ) return 0;
            let temp = 1;
            for ( let i = 0; i < len; i++ ) {
                if ( (l[ i ] === 1) && (l[ i ] === l[ i + 1 ]) ) temp++;
                if ( l[ i ] !== 1 ) temp = 1;
                if ( temp === 5 ) return 1;
            }
            return 0;
        })();
        if ( game_over ) return count_five;
        if ( count_five !== 0 ) {
            return {
                five  : count_five,
                four  : count_four,
                sfour : count_sfour,
                three : count_three,
                sthree: count_sthree,
                two   : count_two,
                stwo  : count_stwo
            };
        }
        count_four = (function( l = line, len = length ) {
            if ( stone_qty < 4 ) return 0;
            let temp = 1, count = 0;
            for ( let i = 1; i < len && stone_qty > 3; i++ ) {
                if ( (l[ i ] === 1) && (l[ i ] === l[ i + 1 ]) ) temp++;
                if ( l[ i ] !== 1 ) temp = 1;
                if ( temp === 4 && l[ i - 3 ] !== 0 && l[ i + 2 ] !== 0 && i < len - 2 && l[ i + 1 ] === 1 ) {
                    l.splice( i - 2, 4, 'f', 'f', 'f', 'f' );
                    temp = 1;
                    count++;
                    stone_qty -= 4;
                    i++;
                }
            }
            return count;
        })();
        count_sfour = (function( l = line, len = length ) {
            if ( stone_qty < 4 ) return 0;
            let temp = 1, count = 0;
            for ( let i = 0; i < len && stone_qty > 3; i++ ) {
                if ( (l[ i ] === 1) && (l[ i ] === l[ i + 1 ]) ) temp++;
                if ( l[ i ] !== 1 ) temp = 1;
                if ( temp === 4 && l[ i + 1 ] === 1 ) {
                    if ( (i - 2 !== 0 && l[ i - 3 ] !== 0) || ((i < len - 2) && l[ i + 2 ] !== 0) ) {
                        count++;
                        l.splice( i - 2, 4, 'sf', 'sf', 'sf', 'sf' );
                        temp = 1;
                        stone_qty -= 4;
                        i++;
                    }
                    if ( temp === 3 ) {
                        if ( l[ i - 2 ] === undefined && l[ i - 3 ] === 1 ) {
                            count++;
                            l.splice( i - 1, 3, 'sf', 'sf', 'sf' );
                            temp = 1;
                            stone_qty -= 3;
                            i++;
                        }
                        if ( l[ i + 2 ] === undefined && l[ i + 3 ] === 1 ) {
                            count++;
                            l.splice( i - 1, 3, 'sf', 'sf', 'sf' );
                            temp = 1;
                            stone_qty -= 3;
                            i += 2;
                        }
                    }
                    if ( temp === 2 ) {
                        if ( l[ i + 2 ] === undefined && l[ i + 3 ] === 1 && l[ i + 4 ] === 1 ) {
                            count++;
                            l.splice( i, 2, 'sf', 'sf' );
                            temp = 1;
                            stone_qty -= 2;
                            i += 2;
                        }
                    }
                }
            }
            return count;
        })();
        count_three = (function( l = line, len = length ) {
            if ( stone_qty < 3 ) return 0;
            let temp = 1, count = 0;
            for ( let i = 1; i < len && stone_qty > 2; i++ ) {
                if ( l[ i ] === 1 && l[ i ] === l[ i + 1 ] ) temp++;
                if ( l[ i ] !== 1 ) temp = 1;
                if ( temp === 3 ) {
                    if ( l[ i - 2 ] === undefined && l[ i + 2 ] === undefined && (i < len - 2) ) {
                        // exclude fake three: 0/border,undefined,1,1,1,undefined,0/border
                        if ( !(l[ i - 3 ] === 0 || i - 2 === 0) || !(l[ i + 3 ] === 0 || i === len - 3) ) {
                            count++;
                            temp = 1;
                            l.splice( i - 1, 3, 't', 't', 't' );
                            stone_qty -= 3;
                        }
                    }
                }
                if ( temp === 2 ) {
                    if ( l[ i + 2 ] === undefined && l[ i + 3 ] === 1 && l[ i + 4 ] === undefined && l[ i - 1 ] === undefined && (i - 1 > 0) && (i < len - 5) ) {
                        count++;
                        temp = 1;
                        l.splice( i, 3, 't', 't', 't' );
                        stone_qty -= 2;
                    }
                    if ( (l[ i - 1 ] === undefined && l[ i - 2 ] === 1 && l[ i - 3 ] === undefined && l[ i + 2 ] === undefined && (i - 3 > 0) && (i < len - 3)) ) {
                        count++;
                        temp = 1;
                        l.splice( i - 1, 3, 't', 't', 't' );
                        stone_qty -= 2;
                    }
                }
            }
            return count;
        })();
        count_sthree = (function( l = line, len = length ) {
            if ( stone_qty < 3 ) return 0;
            let temp = 1, count = 0;
            for ( let i = 0; i < len && stone_qty > 2; i++ ) {
                if ( l[ i ] === 1 && l[ i ] === l[ i + 1 ] ) temp++;
                if ( l[ i ] !== 1 ) temp = 1;
                if ( temp === 3 ) {
                    if ( (l[ i - 3 ] === undefined && l[ i - 2 ] === undefined && (i - 2) > 0) || (l[ i + 2 ] === undefined && l[ i + 3 ] === undefined && (i < len - 3)) ) {
                        count++;
                        temp = 1;
                        l.splice( i - 1, 3, 'st', 'st', 'st' );
                        stone_qty -= 3;
                    }
                    if ( temp === 2 ) {
                        if ( l[ i - 1 ] === undefined && l[ i - 2 ] === 1 ) {
                            if ( (l[ i - 3 ] === undefined && (i - 2) !== 0) || (l[ i + 2 ] === undefined && (i < len - 2)) ) {
                                count++;
                                temp = 1;
                                l.splice( i - 1, 3, 'st', 'st', 'st' );
                                stone_qty -= 2;
                            }
                        }
                        if ( l[ i + 2 ] === undefined && l[ i + 3 ] === 1 ) {
                            if ( (l[ i - 1 ] === undefined && i !== 0) || (l[ i + 4 ] === undefined && (i < len - 4)) ) {
                                count++;
                                temp = 1;
                                l.splice( i, 3, 'st', 'st', 'st' );
                                stone_qty -= 2;
                            }
                        }
                    }
                    if ( l[ i ] === 1 && l[ i + 1 ] === undefined && l[ i + 2 ] === 1 && l[ i + 3 ] === undefined && l[ i + 4 ] === 1 ) {
                        count++;
                        l.splice( i, 2, 'st', 'st' );
                        stone_qty -= 1;
                    }
                }
            }
            return count;
        })();
        count_two = (function( l = line, len = length ) {
            if ( stone_qty < 2 ) return 0;
            let count = 0;
            for ( let i = 0; i < len && stone_qty > 1; i++ ) {
                if ( l[ i ] === 1 && l[ i + 1 ] === 1 ) {
                    if ( (l[ i - 1 ] === undefined && l[ i - 2 ] === undefined && l[ i + 2 ] === undefined && (i - 1 > 0)) || (l[ i - 1 ] === undefined && l[ i + 2 ] === undefined && l[ i + 3 ] === undefined && i < len - 3) ) {
                        count++;
                        stone_qty -= 2;
                        l.splice( i, 2, 'w', 'w' );
                        i = +2;
                    }
                }
                if ( l[ i ] === 1 && l[ i + 1 ] === undefined && l[ i + 2 ] === 1 ) {
                    if ( l[ i - 1 ] === undefined && (i > 0) && l[ i + 3 ] === undefined && (i < len - 3) ) {
                        count++;
                        stone_qty -= 1;
                        l.splice( i, 1, 'w' );
                        i++;
                    }
                }
                if ( l[ i ] === 1 && l[ i + 1 ] === undefined && l[ i + 2 ] === undefined && l[ i + 3 ] === 1 ) {
                    if ( (l[ i - 1 ] === undefined && i > 0) || (l[ i + 4 ] === undefined && i < len - 4) ) {
                        count++;
                        stone_qty -= 1;
                        l.splice( i, 1, 'w' );
                        i += 2;
                    }
                }
            }
            return count;
        })();
        count_stwo = (function( l = line, len = length ) {
            if ( stone_qty < 2 ) return 0;
            let count = 0;
            for ( let i = 0; i < len && stone_qty > 1; i++ ) {
                if ( l[ i ] === 1 && l[ i + 1 ] === 1 ) {
                    if ( ((l[ i - 1 ] === 0 || i === 0) && l[ i + 2 ] === undefined && l[ i + 3 ] === undefined && l[ i + 4 ] === undefined && (i < len - 4)) || ((i - 2 > 0) && l[ i - 3 ] === undefined && l[ i - 2 ] === undefined && l[ i - 1 ] === undefined && (l[ i + 2 ] === 0 || (i = len - 3))) ) {
                        count++;
                        stone_qty -= 2;
                        i++;
                        l.splice( i, 2, 'sw', 'sw' );
                    }
                }
                if ( l[ i ] === 1 && l[ i + 1 ] === undefined && l[ i + 2 ] === 1 ) {
                    if ( ((l[ i - 1 ] === 0 || i === 0) && l[ i + 3 ] === undefined && l[ i + 4 ] === undefined && (i < len - 4)) || (((i === len - 3) || l[ i + 3 ] === 0) && l[ i - 1 ] === undefined && l[ i - 2 ] === undefined && (i - 1 > 0)) ) {
                        count++;
                        stone_qty -= 2;
                        i += 2;
                        l.splice( i, 3, 'sw', 'sw', 'sw' );
                    }
                }
                if ( l[ i ] === 1 && l[ i + 1 ] === undefined && l[ i + 2 ] === undefined && l[ i + 3 ] === 1 ) {
                    if ( ((l[ i - 1 ] === 0 || i === 0) && l[ i + 4 ] === undefined && (i < len - 4)) || (((l[ i + 4 ] === 0) || (i = len - 4)) && l[ i - 1 ] === undefined && i > 0) ) {
                        count++;
                        stone_qty -= 2;
                        i += 3;
                        l.splice( i, 4, 'sw', 'sw', 'sw', 'sw' );
                    }
                }
            }
            return count;
        })();
        return {
            five  : count_five,
            four  : count_four,
            sfour : count_sfour,
            three : count_three,
            sthree: count_sthree,
            two   : count_two,
            stwo  : count_stwo
        };
    }

    static accumulate( color, line ) {
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
    static typesCount( color, board ) {
        let temp, stones = [], row = [], col = [], right_falling = [], rising = [];
        for ( let i = 0; i < 15; i++ ) {
            for ( let j = 0; j < 15; j++ ) {
                if ( board[ i ][ j ] === 0 || board[ i ][ j ] === 1 ) {
                    stones.push( [ i, j ] );
                }
            }
        }
        for ( let i = 0; i < stones.length; i++ ) {
            if ( !row[ -stones[ i ][ 0 ] ] ) {
                row.push( stones[ i ][ 0 ] );
                row[ -stones[ i ][ 0 ] ] = 1;
            }
            if ( !col[ -stones[ i ][ 1 ] ] ) {
                col.push( stones[ i ][ 1 ] );
                col[ -stones[ i ][ 1 ] ] = 1;
            }
            if ( !right_falling[ -(stones[ i ][ 0 ] - stones[ i ][ 1 ]) ] ) {
                right_falling.push( stones[ i ][ 0 ] - stones[ i ][ 1 ] );
                right_falling[ -(stones[ i ][ 0 ] - stones[ i ][ 1 ]) ] = 1;
            }
            if ( !rising[ -(stones[ i ][ 0 ] + stones[ i ][ 1 ]) ] ) {
                rising.push( stones[ i ][ 0 ] + stones[ i ][ 1 ] );
                rising[ -(stones[ i ][ 0 ] + stones[ i ][ 1 ]) ] = 1;
            }
        }
        for ( let i = 0; i < row.length; i++ ) {
            temp = this.lineAnalysis( this.getRow( row[ i ], board ), color );
            this.accumulate( color, temp );
        }
        for ( let i = 0; i < col.length; i++ ) {
            temp = this.lineAnalysis( this.getCol( col[ i ], board ), color );
            this.accumulate( color, temp );
        }
        for ( let i = 0; i < right_falling.length; i++ ) {
            temp = this.lineAnalysis( this.getRightFalling( right_falling[ i ], board ), color );
            this.accumulate( color, temp );
        }
        for ( let i = 0; i < rising.length; i++ ) {
            temp = this.lineAnalysis( this.getRising( rising[ i ], board ), color );
            this.accumulate( color, temp );
        }
    }

    static countFive( pos, color, board ) {
        let Y = pos.posY, X = pos.posX, rf = Y - X, ri = Y + X;
        return (this.lineAnalysis( this.getRow( Y, board ), color, true ) + this.lineAnalysis( this.getCol( X, board ), color, true ) + this.lineAnalysis( this.getRightFalling( rf, board ), color, true ) + this.lineAnalysis( this.getRising( ri, board ), color, true )) > 0;
    }

    /**
     * 判断游戏是否结束
     * @param pos {object}
     * @param board {Array}
     * @returns {boolean}
     */
    isGameOver( pos, board ) {
        return (Eval.countFive( pos, 'white', board ) || Eval.countFive( pos, 'black', board ));
    }

    /**
     * 计算当前棋盘分数
     * @param pos {object}
     * @param board {Array}
     * @param [p_val] {number}
     * @returns {number}
     */
    evaluate( pos, board, p_val = this._pos_val ) {
        let turn_w = !pos.color,
        val_w = 0,
        val_b = 0,
        types_black = {
            color : 'black',
            five  : 0,
            four  : 0,
            sfour : 0,
            three : 0,
            sthree: 0,
            two   : 0,
            stwo  : 0
        },
        types_white = {
            color : 'white',
            five  : 0,
            four  : 0,
            sfour : 0,
            three : 0,
            sthree: 0,
            two   : 0,
            stwo  : 0
        };
        Eval.typesCount( types_black, board );
        Eval.typesCount( types_white, board );
        // if already five early return game over
        if ( turn_w ) {
            if ( types_black.five ) return -9999;
            if ( types_white.five ) return 9999;
        }
        else {
            if ( types_white.five ) return -9999;
            if ( types_black.five ) return 9999;
        }
        // 2 sfours equal to 1 four
        if ( types_white.sfour > 1 ) types_white.four++;
        if ( types_black.sfour > 1 ) types_black.four++;
        /*
         * 以下是依据棋型给出评分，这个部分也非常依赖棋类知识，有很大的优化空间，目前这个评分模型参考的是「PC 游戏编程（人机博弈）」一书中的。
         * 活三眠三和活二的逻辑最需要优化
         */
        if ( turn_w ) {
            if ( types_white.four ) return 9990;
            if ( types_white.sfour ) return 9980;
            if ( types_black.four ) return -9970;
            if ( types_black.sfour && types_black.three ) return -9960;
            if ( types_white.three && types_black.sfour === 0 ) return 9950;
            if ( types_black.three > 1 && types_white.sfour === 0 && types_white.three === 0 && types_white.sthree === 0 ) return -9940;
            if ( types_white.three > 1 ) val_w += 2000;
            else if ( types_white.three ) val_w += 200;
            if ( types_black.three > 1 ) val_b += 500;
            else if ( types_black.three ) val_b += 100;
            if ( types_white.sthree ) val_w += types_white.sthree * 10;
            if ( types_black.sthree ) val_b += types_black.sthree * 10;
            if ( types_black.two ) val_b += types_black.two * 4;
            if ( types_white.two ) val_w += types_white.two * 4;
            if ( types_black.stwo ) val_b += types_black.stwo;
            if ( types_white.stwo ) val_w += types_white.stwo;
        }
        else {
            if ( types_black.four ) return 9990;
            if ( types_black.sfour ) return 9980;
            if ( types_white.four ) return -9970;
            if ( types_white.sfour && types_white.three ) return -9960;
            if ( types_black.three && types_white.sfour === 0 ) return 9950;
            if ( types_white.three > 1 && types_black.sfour === 0 && types_black.three === 0 && types_black.sthree === 0 ) return -9940;
            if ( types_black.three > 1 ) val_b += 2000;
            else if ( types_black.three ) val_b += 200;
            if ( types_white.three > 1 ) val_w += 500;
            else if ( types_white.three ) val_w += 100;
            if ( types_black.sthree ) val_b += types_black.sthree * 10;
            if ( types_white.sthree ) val_w += types_white.sthree * 10;
            if ( types_black.two ) val_b += types_black.two * 4;
            if ( types_white.two ) val_w += types_white.two * 4;
            if ( types_black.stwo ) val_b += types_black.stwo;
            if ( types_white.stwo ) val_w += types_white.stwo;
        }
        for ( let i = 0; i < 15; i++ ) {
            for ( let j = 0; j < 15; j++ ) {
                if ( board[ i ][ j ] === 0 ) val_b += p_val[ i ][ j ];
                if ( board[ i ][ j ] === 1 ) val_w += p_val[ i ][ j ];
            }
        }
        if ( turn_w ) {
            return val_w - val_b;
        }
        else {
            return val_b - val_w;
        }
    }
}
/**
 *
 * @type {Eval}
 */
export let getScore = new Eval();
