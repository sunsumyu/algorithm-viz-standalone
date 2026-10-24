/**
 * 前 K 个高频元素 (Top K Frequent Elements · LeetCode 347)
 * 全景推演树渲染策略 (TopKFrequentDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TopKFrequentDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'top-k-frequent';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'top-k-frequent' ||
      modelId === '347' ||
      modelId === 'leetcode-347' ||
      modelId === 'top-k-frequent-elements'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 347. 前 K 个高频元素 · 全景推演树',
      badge: '代码随想录经典专题 · 哈希频次统计 + 容量为 K 的小顶堆 / 淘汰低频劣势堆顶 / O(N log K)',
      descriptionHtml: `
        核心目标：给你一个整数数组 <code>nums</code> 和一个整数 <code>k</code>，请你返回其中出现频率前 <code>k</code> 高的元素。你可以按任意顺序返回答案。<br/>
        <strong>《代码随想录》核心教学范式——“求前 K 大必用小顶堆”淘汰公理：</strong><br/>
        1. <strong>为什么求前 K 高频绝对不能用大顶堆？</strong><br/>
        • 若使用大顶堆，堆顶永远是当前频次最高的元素；一旦堆满需要弹出时，<strong>直接把最高频次的黄金元素弹出淘汰了</strong>，南辕北辙！<br/>
        • <strong>正解必须用小顶堆（Min-Heap）</strong>：维护大小严格等于 <code>k</code> 的小顶堆，<strong>堆顶永远是当前入围的 $k$ 个候选人中频次最低的弱者</strong>！<br/>
        2. <strong>小顶堆动态优胜劣汰法则</strong>：<br/>
        • 首先用哈希表 <code>Map<Integer, Integer> countMap</code> 统计每个数字的出现频次（$O(N)$）；<br/>
        • 遍历哈希表的每一个 entry：<br/>
          若堆大小 <code>&lt; k</code>，直接入堆；<br/>
          若堆大小 <code>== k</code>：当前元素的频次若大于堆顶 <code>pq.peek().freq</code>，说明新成员更有资格入围，<strong>果断将堆顶弹出淘汰 <code>pq.poll()</code></strong>，然后将新元素入堆 <code>pq.offer()</code>！<br/>
        • 遍历结束后，<strong>堆中留存的 $k$ 个元素，就是全局频次最高的 Top-K 霸主</strong>！<br/>
        3. <strong>O(N log K) 复杂度卓越性</strong>：每个哈希项进出小顶堆开销为 $\log K$，远优于全量排序的 $O(N \log N)$！
      `,
      initialStateText: `统计入口：topKFrequent(nums, k) ➔ 统计频次 countMap，初始化容量为 k 的小顶堆 pq。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '唯一元素规模退化判定 (nums.length == k)',
        valuesStr: 'countMap.size() <= k ➔ 独立数字总数不超过 k，所有数字全量返回',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '哈希 entry 遍历完毕 ➔ 堆内严格保留 k 个高频元素，逐一弹出构建答案数组',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 全数组哈希频次统计 (Hash Map Frequency Aggregation)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Map.put</span>',
      detailLines: [
        'Map<Integer, Integer> map = new HashMap<>();',
        'for (int num : nums) map.put(num, map.getOrDefault(num, 0) + 1);',
      ],
      fillLine: '全量摸底：单趟扫描数组建立频次映射，为 Top-K 遴选准备候选池',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 小顶堆动态淘汰低频项 (Min-Heap Eviction on size > k)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Heap Top Purge</span>',
      detailLines: [
        'PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);',
        'for (var entry : map.entrySet()) {',
        '  pq.offer(new int[]{entry.getKey(), entry.getValue()});',
        '  if (pq.size() > k) pq.poll(); // 始终弹出当前入围者中频次最低的堆顶',
        '}',
      ],
      fillLine: '劣汰留强：小顶堆顶如同门槛，凡无法逾越门槛者全被无情淘汰',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 提取堆内 K 个幸存霸主 (Extract K King Elements)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Deliver Top-K</span>',
      detailLines: [
        'int[] ans = new int[k];',
        'for (int i = 0; i < k; i++) ans[i] = pq.poll()[0];',
        'return ans;',
      ],
      fillLine: '凯旋交付：小顶堆内固若金汤的 K 个幸存者，正是全局最高频次的精英',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: 'Top-K 频次推演流 (Hash Frequency Map ➔ Min-Heap Dynamic Eviction ➔ Top-K Extraction)',
      subtitle: 'LeetCode 347 Top K Frequent Elements Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '出现频率前 K 高的整数数组 ans',
      complexityStr: '时间复杂度: O(N log K) 堆插入调整 · 空间复杂度: O(N) 哈希表与堆空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
