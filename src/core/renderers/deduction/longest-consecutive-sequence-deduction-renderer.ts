/**
 * 最长连续序列 (Longest Consecutive Sequence · LeetCode 128)
 * 全景推演树渲染策略 (LongestConsecutiveSequenceDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LongestConsecutiveSequenceDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'longest-consecutive-sequence';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'longest-consecutive-sequence' ||
      modelId === '128' ||
      modelId === 'leetcode-128' ||
      modelId === 'longest-consecutive'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 128. 最长连续序列 (Longest Consecutive Sequence) · 全景推演树',
      badge: '哈希集合 O(1) 瞬时查询 · 仅从序列起点单向探索 · 严格 O(N) 线性推演',
      descriptionHtml: `
        核心目标：在未排序的整数数组中，找出数字连续的最长序列（不要求在原数组中连续）的长度，要求时间复杂度为严格 $O(N)$。<br/>
        <strong>《代码随想录》核心教研范式——哈希去重与起点判定公理：</strong><br/>
        1. <strong>全量落盘哈希集合（HashSet Deposition）</strong>：<br/>
        将数组所有元素压入 <code>Set<Integer> set</code>，天然去重并赋予 $O(1)$ 包含查询能力；<br/>
        2. <strong>起点特权判定公理（Start-Point Privilege Axiom）</strong>：<br/>
        遍历集合中的每个数字 <code>num</code>：<br/>
        • <strong>若 <code>set.contains(num - 1)</code> 为真</strong>：说明 <code>num</code> 前面还有连续的前驱数字，<code>num</code> 绝不是该连续序列的起点！从 <code>num</code> 开始向后数得到的长度必然严格小于从 <code>num - 1</code> 开始数的长度，因此<strong>必须立即跳过</strong>！<br/>
        • <strong>只有当 <code>!set.contains(num - 1)</code> 为真</strong>：才能确立 <code>num</code> 拥有序列起点的尊贵资格！<br/>
        3. <strong>单向链式延展与严格 O(N) 保证</strong>：<br/>
        从确认的起点 <code>currentNum = num</code> 开始，执行 <code>while (set.contains(currentNum + 1))</code> 持续加一并累加长度 <code>currentStreak++</code>。<br/>
        虽然存在内层 <code>while</code>，但由于非起点数字直接被 $O(1)$ 判定阻断，每个连续序列的元素在整个算法生命周期中<strong>仅被访问常数次</strong>，时间复杂度严格收敛为 $O(N)$。
      `,
      initialStateText: `检索入口：longestConsecutive(nums) ➔ Set<Integer> numSet = new HashSet<>()，int longestStreak = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空数组特判 (Empty Guard)',
        valuesStr: 'nums == null || nums.length == 0 ➔ 数组无元素，直接返回 0',
      },
      {
        prefix: '└───',
        label: '单元素特判 (Single Element)',
        valuesStr: 'nums.length == 1 ➔ 最长连续序列长度天然为 1',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 数组元素全量导入哈希集合 (Build Hash Set)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Set.add()</span>',
      detailLines: [
        'Set<Integer> numSet = new HashSet<>();',
        'for (int num : nums) {',
        '  numSet.add(num);',
        '}',
      ],
      fillLine: '筑牢基石：去重并建立 O(1) 前驱与后继常数级寻址能力',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 序列起点资格判定与非起点瞬断 (Identify Sequence Starters)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">!contains(x-1)</span>',
      detailLines: [
        'for (int num : numSet) {',
        '  if (!numSet.contains(num - 1)) { // 唯一起点判定：前驱不存在！',
        '    int currentNum = num;',
        '    int currentStreak = 1;',
      ],
      fillLine: '降本增效：前驱存在者直接 pass，彻底抹除重复计数的 O(N²) 冗余嵌套',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 起点单向链式延伸与极值刷新 (Extend Chain & Update Max)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Extend while</span>',
      detailLines: [
        '    while (numSet.contains(currentNum + 1)) {',
        '      currentNum += 1;',
        '      currentStreak += 1;',
        '    }',
        '    longestStreak = Math.max(longestStreak, currentStreak);',
        '  }',
        '}',
      ],
      fillLine: '一气呵成：从正规起点单调递增探测，更新全局最长连续序列长度',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '最长连续序列哈希推演流 (Build Set ➔ Identify Starters ➔ Linear Chain Extension)',
      subtitle: 'LeetCode 128 Longest Consecutive Sequence Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '最长连续序列长度 longestStreak',
      complexityStr: '时间复杂度: O(N) 每个元素至多被访问两次 · 空间复杂度: O(N) 哈希集合空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
