/**
 * 解数独 (Sudoku Solver · LeetCode 37)
 * 全景推演树渲染策略 (SudokuDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SudokuDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sudoku';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sudoku' ||
      modelId === '37' ||
      modelId === 'leetcode-37' ||
      modelId === 'sudoku-solver'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 37. 解数独 (Sudoku Solver) · 全景推演树',
      badge: '二维棋盘双重遍历回溯 · 行/列/3x3九宫格三维约束 · 布尔截断单解极速返回',
      descriptionHtml: `
        核心目标：编写一个程序，通过填充空格来解决数独问题，空白格用 <code>'.'</code> 表示。<br/>
        <strong>《代码随想录》核心教研范式——布尔截断与二维双重遍历回溯公理：</strong><br/>
        1. <strong>布尔返回值与极速剪枝截断（Boolean Fast Return）</strong>：<br/>
        数独题目只要求找到<strong>唯一一个合法解</strong>。因此递归函数定义为 <code>boolean backtracking(char[][] board)</code>！只要深层返回 <code>true</code>，上层<strong>无须任何多余探索，直接一路返回 <code>true</code> 贯通截断</strong>！<br/>
        2. <strong>二维坐标双重循环定位空格</strong>：<br/>
        使用双重 <code>for (int i = 0; i < 9; i++) for (int j = 0; j < 9; j++)</code> 寻觅未填空格；若全盘无空格，说明数独解算大功告成，直接返回 <code>true</code>；<br/>
        3. <strong>九宫格与行列三维校验 <code>isValid(row, col, k, board)</code></strong>：<br/>
        尝试填入 <code>'1' ~ '9'</code>，必须同时满足：同行不重复、同列不重复、所在的 $3 \times 3$ 宫格不重复（<code>(row/3)*3 + i/3, (col/3)*3 + i%3</code>）。
      `,
      initialStateText: `数独求解入口：solveSudoku(board) ➔ backtracking(board)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '棋盘填满直接成冠 (All Cells Filled)',
        valuesStr: '双重循环未搜寻到任何 \'.\' ➔ 棋盘全员合法填满，立即 return true 提前终止',
      },
      {
        prefix: '└───',
        label: '穷尽 1~9 无法填入穷途末路 (No Valid Number)',
        valuesStr: '尝试 \'1\' ~ \'9\' 均无法合法填入当前空白格 ➔ 判定当前分支为死胡同，return false 触发回溯',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 二维巡检空格并试探数字 1~9 (Inspect Cell & Try Digits)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">isValid 3D</span>',
      detailLines: [
        'for (int i = 0; i < 9; i++) {',
        '  for (int j = 0; j < 9; j++) {',
        '    if (board[i][j] != \'.\') continue;',
        '    for (char k = \'1\'; k <= \'9\'; k++) {',
        '      if (!isValid(i, j, k, board)) continue; // 行列九宫格冲突校验',
        '      board[i][j] = k;',
      ],
      fillLine: '坐标锁定：遍历锁定首个空白格，试填 1~9 并严密校验行列及九宫格三维排他性',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵深递推与布尔单解极速击穿 (Fast Boolean Penetration)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">if (backtrack) return true</span>',
      detailLines: [
        '      if (backtracking(board)) return true; // 命中解！一路贯通直接返回',
        '      board[i][j] = \'.\'; // 失败回溯',
        '    }',
        '    return false; // 9 个数字皆不行，无解',
        '  }',
        '}',
      ],
      fillLine: '贯通返回：一旦找到解一路 return true 瞬间穿透所有递归层级，不再回溯多余分支',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 棋盘全员填满大获全胜 (Full Board Settled)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">return true</span>',
      detailLines: [
        'return true; // 循环顺利结束无未填格，宣告解算圆满完成',
      ],
      fillLine: '功德圆满：81 个格子全数填入唯一和谐的合法解，原地修改棋盘并交差',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '解数独二维回溯推演流 (Find Dot ➔ Try 1~9 ➔ 3D Validate ➔ Fast Return)',
      subtitle: 'LeetCode 37 Sudoku Solver Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '原地完成 9x9 数独填补的棋盘 char[9][9]',
      complexityStr: '时间复杂度: 剪枝后通常在毫秒级内完成 · 空间复杂度: O(1) 原地修改棋盘与固定递归栈',
    });

    return header + baseCase + round + finalReturn;
  }
}
