/**
 * @fileOverview 这个模块提供了 Shifter 和 GUI 两个类，Shifter 类负责转换逻辑，GUI 负责玩家动作反馈
 */
"use strict";
/**
 * @module shift_player
 * @see module: init
 * @see module: eval_function
 */

import {step, virtual_b, steps_hist, max_dep} from "./init.js";
import {getScore} from "./eval_function.js";
/**
 * Shifter 转换下棋方
 */
class Shifter {
    constructor() {
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
    static indicatorControl(step) {
        let indicator = document.querySelector(".indicator"),
        progress = document.querySelector("p.progress");
        indicator.innerHTML = step.color ? ('<span class="stone-b"></span>' + (step.turn ? '电脑走棋' : '玩家走棋')) : ('<span class="stone-w"></span>' + (step.turn ? '电脑走棋' : '玩家走棋'));
        progress.innerHTML = step.turn ? `电脑思考中： <span class="progress"></span></p>` : `电脑瞌睡中... <span class="progress"></span></p>`;
    }
    
    /**
     * 控制玩家下棋数秒和 AI思考进度反馈
     * @param [id] {number}  计时器ID
     * @see Shifter.inter_id
     */
    clockControl(id) {
        let start = Date.now(), duration, dr_UI = document.querySelector("span.progress"),
        progressUI = document.querySelector("progress.progress"),
        progress = document.querySelector("p.progress");
        if (id !== undefined) {
            clearInterval(id);
        } else {
            this.inter_id = setInterval(function() {
                duration = Math.floor((Date.now() - start) / 1000);
                if (duration < 20) {
                    dr_UI.innerHTML = `${duration}秒`;
                    progressUI.value = duration / 20 * 100;
                } else {
                    progressUI.value = 100;
                    progress.innerHTML = `电脑数着数着睡着了... <span class="progress"></span></p>`;
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
    
    convert(s = step, b = virtual_b, hist = steps_hist) {
        let best_move, score, progress, handler;
        if (!s.turn) {
            if (getScore.isGameOver(s, b)) {
                console.log("Player win");
                gui.showResult(false);
            } else {
                console.log("AI begin to work");
                s.turn = true;
                this.clockControl(this.inter_id);
                Shifter.indicatorControl(s);
                this.cmt_AI.postMessage([s.max_dep, -10000, 10000, s, b, hist]);
                // babel 的新特性在编译时可以给箭头函数name属性，方便函数调用自身的同时不会更改this
                this.cmt_AI.addEventListener("message", handler = (e) => {
                    let progressNum = document.querySelector("p.progress"),
                    progressUI = document.querySelector("progress.progress");
                    if (!e.data[1]) {
                        progressUI.value = e.data[0];
                        progressNum.innerHTML = `电脑思考中：<span class="progress"> ${ Math.ceil(progressUI.value)} %</span></p>`;
                    } else {
                        s.turn = false;
                        [score, best_move] = e.data;
                        s.color = !hist[hist.length - 1][2]
                        b[best_move[0]][best_move[1]] = s.color ? 1 : 0;
                        [s.posY, s.posX] = best_move;
                        if (document.querySelector(".new-step"))
                            document.querySelector(".new-step").classList.remove("new-step");
                        document.querySelector(`.r${best_move[0]} .col${best_move[1]}`).innerHTML = s.color ? '<div class="stone-w new-step"></div>' : '<div class="stone-b new-step"></div>';
                        progressUI.value = 100;
                        progressNum.innerHTML = `电脑思考完成 <span class="progress">${progressUI.value}%</span></p>`;
                        hist.push([best_move[0], best_move[1], s.color, true]);
                        //TODO: 重复代码，逻辑待优化
                        if (getScore.isGameOver(s, b)) {
                            console.log("AI win");
                            s.turn = true;
                            gui.showResult(true);
                        } else {
                            console.log("Player turn");
                            Shifter.indicatorControl(s);
                            s.color = !s.color;
                            this.clockControl(this.inter_id);
                            this.clockControl();
                        }
                        // 停止监听避免多次接受数据
                        this.cmt_AI.removeEventListener("message", handler);
                    }
                });
            }
        } else {
            if (getScore.isGameOver(s, b)) {
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
}
/**
 * UI逻辑处理
 */
class GUI {
    /**
     * 重新开始游戏
     */
    static restart = () => {
        let grid = '', chess_move = document.querySelector(".chess-move");
        document.querySelector(".shade").style.display = "block";
        shift.cmt_AI.terminate();
        shift.clockControl(shift.inter_id);
        [step.turn, step.color, step.posX, step.posY] = [0, 0, 0, 0];
        virtual_b.length = 0;
        for (let i = 15; i--;) {
            virtual_b.push(Array.from({length: 15}));
        }
        steps_hist.length = 0;
        for (let i = 0; i < 15; i++) {
            grid += `<ul class=\"row r${i} \">`;
            for (let j = 0; j < 15; j++) {
                grid += `<li class=\"column col${j}\"></li>`;
            }
            grid += '</ul>';
        }
        chess_move.innerHTML = grid;
        shift = new Shifter();
    }
    
    /**
     * 悔棋删除棋子，同时将最后一步的标记前移
     * @param n {number} 删除棋子的个数
     */
    static remove(n) {
        let stone;
        for (let i = 0; i < n; i++) {
            stone = steps_hist.pop();
            virtual_b[stone[0]][stone[1]] = undefined;
            document.querySelector(`.r${stone[0]} .col${stone[1]}`).innerHTML = '';
            document.querySelector(`.r${stone[0]} .col${stone[1]}`).classList.remove("new-step");
        }
    }
    
    /**
     * 获取玩家下棋的位置
     * @param element {Node}
     * @returns {Array} 返回坐标数组
     */
    static getPlayerPos(element) {
        let class_arr = element.classList,
        parent = element.parentNode,
        class_arr_par = parent.classList,
        target_row, target_col;
        target_row = +class_arr_par[1].substring(1);
        target_col = +class_arr[1].substring(3);
        return [target_row, target_col];
    }
    
    /**
     * 游戏结束，处理界面
     * @param side {boolean} side?'AI赢':'玩家赢'
     */
    static showResult(side) {
        let end_shade = document.createElement("div"),
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
        restart.addEventListener("click", () => {
            end_shade.style.display = 'none';
            GUI.restart();
        });
        //玩家选择取消，可以查看复盘
        cancel.addEventListener("click", () => {
            end_shade.remove();
            for (let i = 0; i < steps_hist.length; i++) {
                document.querySelector(`.r${steps_hist[i][0]}  .col${steps_hist[i][1]} div`).innerHTML = i + 1 + '';
            }
        });
    }
}
/**
 * @see Shifter#shift
 * 导出 Shifter的实例
 * @type {Shifter}
 */
export let shift = new Shifter();
/**
 * 导出GUI类
 * @type {GUI}
 */
export let gui = GUI;


