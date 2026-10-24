/**
 * 满足不等式的最大值 (Max Value of Equation · LeetCode 1499 / Class 055)
 * 全景推演树渲染策略 (MaxValueOfEquationDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MaxValueOfEquationDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'max-value-of-equation';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'max-value-of-equation' ||
      modelId === 'max-value-of-equation-055' ||
      modelId === '1499' ||
      modelId === 'leetcode-1499' ||
      modelId === 'max-value-of-equation-1499' ||
      modelId === 'class055-code02'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 1499. 满足不等式的最大值 · 全景推演树',
      badge: '硬核数学分离 & 左程云 Class 055 · (xj + yj) + (yi - xi) 拆解 / 单调递减队列维护历史最大权值 / 严格 O(N)',
      descriptionHtml: `
        核心目标：给你一个按 <code>x</code> 坐标升序排列的数组 <code>points</code> 和一个整数 <code>k</code>。求 <code>y_i + y_j + |x_i - x_j|</code> 的<strong>最大值</strong>，满足 <code>|x_i - x_j| &le; k</code> 且 <code>i &lt; j</code>。<br/>
        <strong>左程云算法体系教学核心——数学公式分离与单调队列动态极值公理：</strong><br/>
        1. <strong>绝对值破除与变量独立分离</strong>：<br/>
        因为数组点集按 <code>x</code> 坐标严格升序，对于 <code>i &lt; j</code>，必有 <code>x_i &le; x_j</code>，因而 <code>|x_i - x_j| = x_j - x_i</code>。<br/>
        原目标表达式展开重组：<br/>
        <code>y_i + y_j + (x_j - x_i) = (x_j + y_j) + (y_i - x_i)</code>。<br/>
        2. <strong>极值优化模型规约</strong>：<br/>
        当枚举到当前右端点 <code>j</code> 时，<code>(x_j + y_j)</code> 是固定常数！<br/>
        目标转化为：在合法范围 <code>x_j - x_i &le; k</code> 的历史点 <code>i</code> 中，<strong>寻找 <code>(y_i - x_i)</code> 的最大值</strong>！<br/>
        3. <strong>单调递减双端队列工作流</strong>：<br/>
        • <strong>队头过期清除</strong>：若 <code>points[j].x - deque.peekFirst().x &gt; k</code>，距离超标，<code>pollFirst()</code> 弹出；<br/>
        • <strong>瞬时 O(1) 结算</strong>：队头即为当前窗口内 <code>y - x</code> 的绝对王者，与当前点结合刷新全局答案 <code>maxAns</code>；<br/>
        • <strong>队尾劣质淘汰</strong>：当前点 <code>j</code> 的权值为 <code>y_j - x_j</code>。若 <code>y_j - x_j &ge; deque.peekLast().diff</code>，当前点更靠后且权值更大，直接淘汰队尾劣质元素！<br/>
        • 单趟扫描，每个点进出队列各一次，时间复杂度严格为 $O(N)$。
      `,
      initialStateText: `公式分离：findMaxValueOfEquation(points, k) ➔ 初始化单调递减队列 deque = []，maxAns = -∞。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '点集数量退化判定 (points.length < 2)',
        valuesStr: 'points.length < 2 ➔ 无法构成合法配对，无解返回 0 或 -∞',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '遍历点 j 抵达 n ➔ 返回全周期探索到的最大指标值 maxAns',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 队头距离超限剔除 (Head Expiration Check: xj - xi > k)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">pollFirst()</span>',
      detailLines: [
        'while (!deque.isEmpty() && pts[j].x - deque.peekFirst().x > k) {',
        '  deque.pollFirst(); // 距离超标跨出合法保护区，永久淘汰',
        '}',
      ],
      fillLine: '越界清除：历史老点已无法被当前及未来的右侧点所覆盖，优雅退场',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 队头极值结算与全局最大值刷新 (Harvest Max with Head)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(1) Query</span>',
      detailLines: [
        'if (!deque.isEmpty()) {',
        '  maxAns = Math.max(maxAns, pts[j].x + pts[j].y + deque.peekFirst().diff);',
        '}',
      ],
      fillLine: '立功结算：队头 (yi - xi) 独步天下，与当前点 (xj + yj) 结合诞生最优解',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 队尾劣质权值降维淘汰与入队 (Tail Eviction on y-x Domination)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">pollLast()</span>',
      detailLines: [
        'int curDiff = pts[j].y - pts[j].x;',
        'while (!deque.isEmpty() && curDiff >= deque.peekLast().diff) {',
        '  deque.pollLast(); // 弹出既老旧又权值低的队尾劣势点',
        '}',
        'deque.offerLast(new Node(pts[j].x, curDiff));',
      ],
      fillLine: '强势入驻：新点位置更靠右且权值更高，全面压制并驱逐队尾老弱',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '不等式最大值推演流 (Formula Separation ➔ Head Expiry ➔ O(1) Settle ➔ Tail Domination)',
      subtitle: 'LeetCode 1499 & Zuoshen Class 055 Formula Separation Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '满足不等式的最大指标值 maxAns',
      complexityStr: '时间复杂度: O(N) 单趟线性双端队列 · 空间复杂度: O(N) 队列空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
