/**
 * @fileOverview 程序加载初始化, step / virtual_board / steps_hist / max_step 将在模块间传递。
 * 命名约定：class: Class; variable: my_variable(noun); function: handleData (verb);
 */
'use strict';
/**
 * 初始化模块，由 Init 一个类构成，详见该类
 * @module init
 */
/**
 * 初始化棋盘，开局DOM结构建立
 */
class Init {
    /**
     * 选棋遮罩，DOM棋盘绘制
     */
    static drawUI() {
        let grid = '',
        shade = document.createElement( 'div' ),
        container = document.querySelector( 'body' ),
        chess_move = document.querySelector( '.chess-move' );
        shade.className = 'shade';
        shade.innerHTML = `<div class="dialog difficulty"><p class="title">请选难度，难度增高电脑思考时间加长</p><div class="easy choose-diff">容易</div><div class="normal choose-diff">普通</div>`;
        container.appendChild( shade );
        for ( let i = 0; i < 15; i++ ) {
            grid += `<ul class=\"row r${i}\">`;
            for ( let j = 0; j < 15; j++ ) {
                grid += '<li class="column col' + j + '"></li>';
            }
            grid += '</ul>';
        }
        chess_move.innerHTML = grid;
    }

    /**
     * 抽象棋盘建立
     * @returns {Array} 抽象棋盘
     */
    static chessBoard() {
        let board = [];
        for ( let i = 15; i--; ) {
            board.push( Array.from( { length: 15 } ) );
        }
        return board;
    }
}
Init.drawUI();
/**
 * @type {{turn: boolean, color: boolean, posX: number, posY: number, max_dep: number}}
 */
let step = {
    turn   : false,
    color  : false,
    posX   : 0,
    posY   : 0,
    max_dep: 2
},
/**
 * @type {Array}
 */
virtual_b = Init.chessBoard(),
/**
 * @type {Array}
 */
steps_hist = [];
/**
 * @type {number}
 */
export {
    /** 当前走的棋 */
    step,
    /**  抽象棋盘 */
    virtual_b,
    /** 下棋历史的栈*/
    steps_hist
};




