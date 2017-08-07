/**
 * @fileOverview 玩家的所有操作的DOM操作由这个模块控制
 */
"use strict";
/**
 * @module make_move_GUI
 * @see module: init
 * @see module: shift_player
 */

import {step, virtual_b, steps_hist} from "./init.js";
import {shift, gui} from "./shift_player.js";

let move_fr_UI = document.querySelector(".chess-move"),
shade = document.querySelector(".shade"),
choose_difficulty = document.querySelector(".difficulty"),
retract = document.querySelector(".retract"),
restart = document.querySelector(".restart");

// 玩家选择白色，电脑先手，事件回调一律使用箭头函数避免意外改变this
choose_difficulty.addEventListener("click", (e) => {
    if (e.target.classList.contains('choose-diff')) {
        if (e.target.classList.contains('normal')) step.max_dep = 4;
        if (e.target.classList.contains('easy')) step.max_dep = 2;
        
        shade.style.display = "none";
        step.turn = true;
        step.color = false;
        console.log("AI begin to work");
        virtual_b[7][7] = 0;
        step.posY = 7;
        step.posX = 7;
        document.querySelector(".r7 .col7").innerHTML = '<div class="stone-b"></div>';
        steps_hist.push([7, 7, false]);
        shift.convert();
    }
});


// 玩家落子
move_fr_UI.addEventListener("click", (e) => {
    if (e.target.classList.contains("column") && !step.turn) {
        let pos = gui.getPlayerPos(e.target);
        if (virtual_b[pos[0]][pos[1]] === undefined) {
            if (document.querySelector(".new-step"))
                document.querySelector(".new-step").classList.remove("new-step");
            e.target.innerHTML = step.color ? '<div class="stone-w new-step"></div>' : '<div class="stone-b new-step"></div>';
            virtual_b[pos[0]][pos[1]] = step.color ? 1 : 0;
            [step.posY, step.posX] = pos;
            steps_hist.push([pos[0], pos[1], step.color, false]);
            setTimeout(() => {
                shift.convert();
            }, 0);
        }
    }
});

// 悔棋按钮
retract.addEventListener("click", () => {
    if (steps_hist.length > 2) {
        // 如果 AI 还在思考时玩家反悔，中止运算
        if (step.turn) {
            shift.cmt_AI.terminate();
            shift.cmt_AI = new Worker("scripts/AI_worker.js");
        }
        // 如果最后一步棋是 AI 下的，删两个子
        if (steps_hist[steps_hist.length - 1][3]) {
            gui.remove(2);
        }
        // 如果最后一步是玩家下的，删一个子
        else {
            gui.remove(1);
        }
        [step.posY, step.posX, step.color] = steps_hist[steps_hist.length - 1]
        step.turn = true;
        document.querySelector(`.r${steps_hist[steps_hist.length - 1][0]} .col${steps_hist[steps_hist.length - 1][1]}`).classList.add("new-step");
        shift.convert();
    }
});

/**
 * @see module: shift_player.gui.restart
 */

restart.addEventListener("click", gui.restart);





  
  
  


