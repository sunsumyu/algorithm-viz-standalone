/**
 * 滑动窗口最大值 (Sliding Window Maximum · LeetCode 239 / Class 054)
 * 全景推演树渲染策略 (SlidingWindowMaxDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SlidingWindowMaxDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sliding-window-max';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sliding-window-max' ||
      modelId === 'sliding-window-max-054' ||
      modelId === '239' ||
      modelId === 'leetcode-239' ||
      modelId === 'sliding-window-maximum' ||
      modelId === 'sliding-window-maximum-239' ||
      modelId === 'class054-code01' ||
      modelId === 'monotonic-queue-basic-054'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 239. 滑动窗口最大值 (Sliding Window Maximum) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 054 · 单调双端队列 (Deque) / 淘汰劣质老旧元素 / O(1) 瞬时队首取极值 / 严格 O(N)',
      descriptionHtml: `
        核心目标：给你一个整数数组 <code>nums</code>，有一个大小为 <code>k</code> 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 <code>k</code> 个数字。滑动窗口每次只向右移动一位。返回滑动窗口中的最大值。<br/>
        <strong>《代码随想录》与左程云算法体系教学核心——单调双端队列支配公理：</strong><br/>
        1. <strong>支配公理（“比你年轻还比你强，你就可以退休了”）</strong>：<br/>
        对于新滑入窗口的元素 <code>nums[i]</code>，如果它比当前队尾的元素 <code>nums[deque.back()]</code> 更大或相等；<br/>
        因为 <code>nums[i]</code> 不仅数值更大，而且其在后续滑窗中存活的时间更久，队尾的较小元素在有生之年<strong>绝不可能再成为任何窗口的最大值</strong>，被彻底劣势淘汰！<br/>
        2. <strong>单调双端队列工作流三部曲</strong>：<br/>
        • <strong>第 ① 步（队尾淘汰）</strong>：<code>while (!deque.isEmpty() && nums[i] >= nums[deque.peekLast()]) deque.pollLast();</code>；<br/>
        • <strong>第 ② 步（当天下标压入队尾）</strong>：<code>deque.offerLast(i);</code>，维持队首到队尾单调严格递减；<br/>
        • <strong>第 ③ 步（队头过期剔除）</strong>：若队头下标 <code>deque.peekFirst() &le; i - k</code>（已经滑出窗口范围），从队首弹出：<code>deque.pollFirst();</code>；<br/>
        • <strong>第 ④ 步（记录答案）</strong>：当 <code>i &ge; k - 1</code> 时，窗口成型，<strong>队首即为当前窗口最大值</strong>：<code>ans[idx++] = nums[deque.peekFirst()];</code>！<br/>
        3. <strong>O(N) 线性摊销证明</strong>：每个下标最多进队尾一次、出队列一次，总时间开销为常数摊销的 $O(N)$。
      `,
      initialStateText: `滑窗入口：maxSlidingWindow(nums, k) ➔ 初始化 Deque deque = new ArrayDeque<>()，ans = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界退化判定 (k <= 1 or Single Element)',
        valuesStr: 'nums.length <= 1 || k == 1 ➔ 无须滑窗比对，直接 return nums',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '右边界 i == n ➔ 滑动窗口抵达数组终点，返回答案数组 ans',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 队尾逆序淘汰劣质元素 (Purge Dominated Tail)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Tail Eviction</span>',
      detailLines: [
        'while (!deque.isEmpty() && nums[i] >= nums[deque.peekLast()]) {',
        '  deque.pollLast(); // 弹出既老又小的队尾无用元素',
        '}',
        'deque.offerLast(i); // 维持队首到队尾数值严格递减',
      ],
      fillLine: '强势入驻：新元素以更持久的生命力与更高数值肃清队尾弱者',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 队首生命周期过期检查 (Head Expiration Check)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Expire i - k</span>',
      detailLines: [
        'if (deque.peekFirst() <= i - k) {',
        '  deque.pollFirst(); // 队首最大值已滑出左边界，合法退场',
        '}',
      ],
      fillLine: '窗口推进：检查队首绝对王者是否已跨出窗口寿命期，超时则优雅让贤',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 窗口成型与极值提取交付 (Extract Window Maximum)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(1) Query</span>',
      detailLines: [
        'if (i >= k - 1) {',
        '  ans[i - k + 1] = nums[deque.peekFirst()]; // O(1) 瞬时获取极值',
        '}',
        'return ans;',
      ],
      fillLine: '瞬时交付：每滑动一步仅需 O(1) 提取队首，构造全周期滑动极值数组',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '滑动窗口推演流 (Tail Domination ➔ Head Expiration ➔ O(1) Extreme Harvesting)',
      subtitle: 'LeetCode 239 & Zuoshen Class 054 Monotonic Deque Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '各滑动窗口最大值数组 ans',
      complexityStr: '时间复杂度: O(N) 严格双端单调队列线性摊销 · 空间复杂度: O(K) 队列上限',
    });

    return header + baseCase + round + finalReturn;
  }
}
