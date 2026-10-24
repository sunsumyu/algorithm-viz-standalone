/**
 * 接取落水的最小花盆 (Falling Water Flowerpot · 洛谷 P2698 / USACO 2012 Mar Silver / Class 054)
 * 全景推演树渲染策略 (FallingWaterFlowerPotDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class FallingWaterFlowerPotDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'falling-water-flower-pot';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'falling-water-flower-pot' ||
      modelId === 'falling-water-flower-pot-054' ||
      modelId === 'falling-water-flowerpot' ||
      modelId === 'falling-water-flowerpot-054' ||
      modelId === 'luogu-p2698' ||
      modelId === 'usaco-flowerpot' ||
      modelId === 'class054-code03'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P2698. 接取落水的最小花盆 · 全景推演树',
      badge: 'USACO 经典几何建模 & 左程云 Class 054 · 水滴坐标排序 + 双指针滑窗 + 双单调队列极差维护 / O(N log N)',
      descriptionHtml: `
        核心目标：农夫约翰想用一个宽为 <code>W</code> 的花盆接水。有 <code>N</code> 滴水滴从天上掉落，坐标为 <code>(x, y)</code>，<code>y</code> 代表落地所需时间。花盆可以放在 <code>[x, x + W]</code> 的任意区间。求能够接住两滴落地时间差 <code>&ge; D</code> 的<strong>最小花盆宽度 W</strong>。若无法实现返回 <code>-1</code>。<br/>
        <strong>左程云算法体系教学核心——几何排序与极差滑窗转化公理：</strong><br/>
        1. <strong>X 轴单调化规约</strong>：<br/>
        将所有水滴按照 <code>x</code> 坐标从小到大排序。花盆覆盖的水滴序列在数组中必为<strong>一段连续子区间 <code>[l..r]</code></strong>，其宽度即为 <code>x[r] - x[l]</code>。<br/>
        2. <strong>Y 轴极差双单调队列</strong>：<br/>
        • 目标约束为区间时间差 <code>y_max - y_min &ge; D</code>；<br/>
        • 用 <code>maxDeque</code> 维护区间 <code>y</code> 的最大值，<code>minDeque</code> 维护区间 <code>y</code> 的最小值；<br/>
        3. <strong>双指针求极小花盆宽度流程</strong>：<br/>
        • <strong>右边界扩展（r++）</strong>：将水滴 <code>r</code> 压入双队列；<br/>
        • <strong>达标判定与左边界贪心收缩（l++）</strong>：<br/>
          只要 <code>y[maxQ.first] - y[minQ.first] &ge; D</code>，当前花盆宽度 <code>x[r] - x[l]</code> 达标！<br/>
          更新 <code>minW = Math.min(minW, x[r] - x[l])</code>，并尝试将 <code>l</code> 右移收缩花盆，同时弹出过期的队头水滴；<br/>
        • 排序开销 $O(N \log N)$，双指针滑窗与队列维护严格 $O(N)$。
      `,
      initialStateText: `几何入口：minFlowerpotWidth(points, D) ➔ 排序 points by x，初始化 maxQ, minQ, l=0, r=0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '水滴不足或时间差为 0 退化判定',
        valuesStr: 'points.length < 2 ➔ 无法形成时间差对，返回 -1；D == 0 ➔ 宽度为 0',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '右指针 r 遍历完毕 ➔ 若 minW == ∞ 返回 -1，否则返回 minW',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 水滴纳入与双单调队列队尾维护 (Push Point r into Deques)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Push r</span>',
      detailLines: [
        'while (!maxQ.isEmpty() && pts[r].y >= pts[maxQ.peekLast()].y) maxQ.pollLast();',
        'while (!minQ.isEmpty() && pts[r].y <= pts[minQ.peekLast()].y) minQ.pollLast();',
        'maxQ.offerLast(r); minQ.offerLast(r);',
      ],
      fillLine: '水滴入窗：新水滴按时间 y 分别淘汰较大/较小劣质队尾，刷新极值',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 时间差达标与花盆宽度极小化 (Settle minW & Contract l)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Δy >= D</span>',
      detailLines: [
        'while (pts[maxQ.peekFirst()].y - pts[minQ.peekFirst()].y >= d) {',
        '  minW = Math.min(minW, pts[r].x - pts[l].x); // 记录最小花盆宽度',
        '  if (maxQ.peekFirst() == l) maxQ.pollFirst();',
        '  if (minQ.peekFirst() == l) minQ.pollFirst();',
        '  l++; // 贪心收紧左边界追求更窄花盆',
        '}',
      ],
      fillLine: '贪心收束：一旦时间差满足 D，记录有效宽度并收缩左边界试探极限',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 最小花盆宽度交付 (Deliver Minimum Flowerpot Width)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Result</span>',
      detailLines: [
        'return minW == Integer.MAX_VALUE ? -1 : minW;',
      ],
      fillLine: '收官交付：成功探寻接取时间差 ≥ D 的物理极限花盆宽度',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '落水花盆推演流 (X-Sort ➔ Dual Deque Ingestion ➔ Diff >= D Greed Contract ➔ minW Settle)',
      subtitle: 'Luogu P2698 & Zuoshen Class 054 Dual Deque Geometry Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '最小花盆宽度 minW 或 -1',
      complexityStr: '时间复杂度: O(N log N) 坐标排序 + O(N) 单调队列 · 空间复杂度: O(N)',
    });

    return header + baseCase + round + finalReturn;
  }
}
