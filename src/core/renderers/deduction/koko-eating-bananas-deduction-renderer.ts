/**
 * 爱吃香蕉的珂珂 (Koko Eating Bananas · LeetCode 875)
 * 全景推演树渲染策略 (KokoEatingBananasDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class KokoEatingBananasDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'koko-eating-bananas';

  public canHandle(modelId: string): boolean {
    return modelId === 'koko-eating-bananas' || modelId === '875' || modelId === 'leetcode-875';
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 875. 爱吃香蕉的珂珂 (Koko Eating Bananas) · 全景推演树',
      badge: '二分答案法母题 · 耗时关于速度单调不增 · 向上取整技巧 · O(N log M)',
      descriptionHtml: `
        核心目标：<code>piles[i]</code> 堆香蕉，警卫 <code>h</code> 小时后回来。珂珂每小时选一堆吃 <code>k</code> 根（不足 k 则吃完该堆并休息），求能在 h 小时内吃完的<strong>最小速度 k</strong>。<br/>
        <strong>二分答案法三步：</strong><br/>
        1. <strong>确定答案范围</strong>：速度 k ∈ <code>[1, max(piles)]</code>，速度超过最大堆没有意义；<br/>
        2. <strong>单调性</strong>：<code>hours(k) = Σ ⌈piles[i] / k⌉</code> 随 k 增大而单调不增 ⇒ “可行”区间是一段后缀；<br/>
        3. <strong>求可行的最左端</strong>：<code>hours(mid) &lt;= h</code> 时记录 <code>ans = mid</code> 并向左压缩，否则向右。<br/>
        向上取整写法：<code>(p + k - 1) / k</code>，避免浮点。
      `,
      initialStateText: `二分答案入口：minEatingSpeed(piles, h) ➔ l = 1, r = max(piles), ans = r。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '上界必可行 (Upper Bound Feasible)',
        valuesStr: 'k = max(piles) ➔ 每堆 1 小时，总耗时 n <= h（题目保证），ans 初值安全',
      },
      {
        prefix: '└───',
        label: '区间耗尽 (Exhausted)',
        valuesStr: 'l > r ➔ ans 即为最小可行速度',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 试探中间速度 (Probe Speed)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">mid</span>',
      detailLines: [
        'while (l <= r) {',
        '  int mid = l + ((r - l) >> 1);',
      ],
      fillLine: '在答案空间上二分：探针不再是数组下标，而是候选速度值',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 计算该速度下总耗时 (Evaluate Hours)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Σ ceil</span>',
      detailLines: [
        '  long hours = 0;',
        '  for (int p : piles) hours += (p + mid - 1) / mid; // 向上取整',
      ],
      fillLine: '可行性判定：O(N) 模拟一遍，得到以 mid 速度吃完所需总小时数',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 可行则记录并向左压缩 (Record & Shrink)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">ans</span>',
      detailLines: [
        '  if (hours <= h) { ans = mid; r = mid - 1; }',
        '  else l = mid + 1;',
        '}',
        'return ans;',
      ],
      fillLine: '最左可行：可行时继续尝试更慢的速度，不可行时只能加速',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '二分答案推演流 (Probe Speed ➔ Evaluate Hours ➔ Record & Shrink)',
      subtitle: 'LeetCode 875 Koko Eating Bananas Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '最小可行速度 ans',
      complexityStr: '时间复杂度: O(N log M)，M = max(piles) · 空间复杂度: O(1)',
    });

    return header + baseCase + round + finalReturn;
  }
}
