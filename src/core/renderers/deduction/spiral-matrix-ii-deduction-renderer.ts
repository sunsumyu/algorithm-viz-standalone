/**
 * 螺旋矩阵 II (Spiral Matrix II · LeetCode 59)
 * 全景推演树渲染策略 (SpiralMatrixIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SpiralMatrixIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'spiral-matrix-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'spiral-matrix-ii' ||
      modelId === '59' ||
      modelId === 'leetcode-59' ||
      modelId === 'spiral-matrix-2'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 59. 螺旋矩阵 II (Spiral Matrix II) · 全景推演树',
      badge: '顺时针四界动态收缩 · 闭区间循环不变量 · 完美无缝几何推演 · O(N²)',
      descriptionHtml: `
        核心目标：生成一个包含 1 到 $n^2$ 所有元素，且元素按顺时针顺序螺旋排列的 $n \\times n$ 正方形矩阵 <code>matrix</code>。<br/>
        <strong>《代码随想录》核心教研范式——四边界收缩法与闭区间循环不变量：</strong><br/>
        1. <strong>定义四方边界墙（Four-Boundary Enclosure）</strong>：<br/>
        定义上边界 <code>top = 0</code>、下边界 <code>bottom = n - 1</code>、左边界 <code>left = 0</code>、右边界 <code>right = n - 1</code>；<br/>
        2. <strong>四向顺时针循环填充</strong>：<br/>
        • <strong>从左向右（Top Row）</strong>：填充 <code>matrix[top][i] (i: left ➔ right)</code>，填充完毕后上界下移 <code>top++</code>；<br/>
        • <strong>从上向下（Right Col）</strong>：填充 <code>matrix[i][right] (i: top ➔ bottom)</code>，填充完毕后右界左移 <code>right--</code>；<br/>
        • <strong>从右向左（Bottom Row）</strong>：填充 <code>matrix[bottom][i] (i: right ➔ left)</code>，填充完毕后下界上移 <code>bottom--</code>；<br/>
        • <strong>从下向上（Left Col）</strong>：填充 <code>matrix[i][left] (i: bottom ➔ top)</code>，填充完毕后左界右移 <code>left++</code>；<br/>
        3. <strong>边界越界自然刹车</strong>：<br/>
        每完成一条边的填充，对应的边界线向内收缩 1 格。当 <code>num > n * n</code> 或边界交叉时，推演自动优雅刹车，彻底杜绝转角越界。
      `,
      initialStateText: `矩阵入口：generateMatrix(n) ➔ 初始化 int[][] res = new int[n][n]，定义 top=0, bottom=n-1, left=0, right=n-1, num=1。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '一阶矩阵特判 (Single Cell Matrix)',
        valuesStr: 'n == 1 ➔ 直接返回 [[1]]',
      },
      {
        prefix: '└───',
        label: '填满终止判定 (Termination Condition)',
        valuesStr: '当 num > n * n 时，螺旋空间被 100% 填满，立即返回矩阵',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 上横边向右与右竖边向下 (Fill Top & Right)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Top & Right</span>',
      detailLines: [
        'for (int i = left; i <= right; i++) res[top][i] = num++;',
        'top++; // 上边界收缩',
        'for (int i = top; i <= bottom; i++) res[i][right] = num++;',
        'right--; // 右边界收缩',
      ],
      fillLine: '顺流直下：水平填满顶层未访区间并压顶，垂直填满右翼未访区间并收翼',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 下横边向左与左竖边向上 (Fill Bottom & Left)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Bottom & Left</span>',
      detailLines: [
        'for (int i = right; i >= left; i--) res[bottom][i] = num++;',
        'bottom--; // 下边界收缩',
        'for (int i = bottom; i >= top; i--) res[i][left] = num++;',
        'left++; // 左边界收缩',
      ],
      fillLine: '逆流而上：反向铺底抬升下底板，逆向攀缘右移左门槛，完成完整一圈环绕',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 循环向内层推进并返回生成矩阵 (Inward Loop & Return)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Return matrix</span>',
      detailLines: [
        'while (num <= n * n) { /* 重复四向收缩填充 */ }',
        'return res;',
      ],
      fillLine: '向心收敛：四方边界向正中聚拢，最后一圈或中心唯一点填毕，返回二维矩阵',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '螺旋矩阵四界收缩推演流 (Top Right Shrink ➔ Bottom Left Shrink ➔ Inward Loop)',
      subtitle: 'LeetCode 59 Spiral Matrix II Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '螺旋填充完成的二维数组 int[n][n]',
      complexityStr: '时间复杂度: O(N²) 访问并填充 N² 个单元格 · 空间复杂度: O(1) 仅用边界变量',
    });

    return header + baseCase + round + finalReturn;
  }
}
