/**
 * N 皇后 (N-Queens · LeetCode 51)
 * 全景推演树渲染策略 (NQueenDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class NQueenDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'nqueen';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'nqueen' ||
      modelId === '51' ||
      modelId === 'leetcode-51' ||
      modelId === 'n-queens'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 51. N 皇后 (N-Queens) · 全景推演树',
      badge: '二维棋盘行级单向递推 · 列与 45°/135° 对角线冲突校验 · 状态剪枝 · O(N!)',
      descriptionHtml: `
        核心目标：在 $n \times n$ 的棋盘上放置 $n$ 个皇后，使其不能相互攻击（同行、同列、同对角线不能存在两个皇后）。<br/>
        <strong>《代码随想录》核心教研范式——棋盘回溯与三维冲突校验公理：</strong><br/>
        1. <strong>行级单向递推天然免疫同行冲突</strong>：<br/>
        递归参数 <code>row</code> 锚定当前正在放置第几行的皇后，每层递归只在当前行选择一列落子，<strong>天然规避同行冲突</strong>；<br/>
        2. <strong>三维冲突严密校验 <code>isValid(row, col, n, board)</code></strong>：<br/>
        因为是由上至下一行一行落子，棋盘下方空空如也，因此只需检查<strong>已落子的上方空间</strong>：<br/>
        • <strong>正上方同一列</strong>：检查是否有 <code>'Q'</code>；<br/>
        • <strong>135° 左上方对角线</strong>：检查是否有 <code>'Q'</code>；<br/>
        • <strong>45° 右上方对角线</strong>：检查是否有 <code>'Q'</code>；<br/>
        3. <strong>棋盘填满收割</strong>：当 <code>row == n</code> 时，说明 $n$ 个皇后全部安全就位，将二维棋盘转化为字符串列表收入结果。
      `,
      initialStateText: `棋盘入口：solveNQueens(n) ➔ 初始化全 '.' 棋盘，backtracking(n, row=0, board)。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '底行满员收割 (Hit Board Bottom)',
        valuesStr: 'row == n ➔ n 个皇后安全部署完毕，res.add(convert(board))，执行 return',
      },
      {
        prefix: '└───',
        label: '三维冲突拦截 (Collision Pruning)',
        valuesStr: '!isValid(row, col, n, board) ➔ 列或左右对角线冲突，continue 跳过该列',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 扫描当前行所有列并执行三维安全校验 (Probe Col & isValid)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">isValid Check</span>',
      detailLines: [
        'for (int col = 0; col < n; col++) {',
        '  if (!isValid(row, col, n, board)) continue; // 冲突剪枝：上方、左上、右上不可有皇后',
        '  board[row][col] = \'Q\'; // 放置皇后',
      ],
      fillLine: '列向寻优：逐列探测当前行安全性，若无列冲突和双对角线冲突则落子 Q',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵深递推进入下一行棋盘 (Recurse to row + 1)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">row + 1</span>',
      detailLines: [
        '  backtracking(n, row + 1, board); // 递进至下一行',
      ],
      fillLine: '行级推进：当前行已安置妥当，递归进入下一行寻找新皇后的安身之所',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与撤回棋子 (Backtrack & Reset Dot)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">board=\'.\'</span>',
      detailLines: [
        '  board[row][col] = \'.\'; // 撤销皇后，恢复为空白格',
        '}',
      ],
      fillLine: '恢复棋盘：抹去当前格子的皇后重新置为点号，尝试当前行的下一列',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: 'N 皇后棋盘回溯推演流 (Check 3D ➔ Place Q ➔ Recurse row+1 ➔ Undo Reset)',
      subtitle: 'LeetCode 51 N-Queens Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有互不攻击的合法棋盘布阵方案 List<List<String>>',
      complexityStr: '时间复杂度: O(N!) 剪枝大幅压缩状态树 · 空间复杂度: O(N) 递归树深度',
    });

    return header + baseCase + round + finalReturn;
  }
}
