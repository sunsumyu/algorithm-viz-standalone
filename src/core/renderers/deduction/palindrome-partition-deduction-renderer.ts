/**
 * 分割回文串 (Palindrome Partitioning · LeetCode 131)
 * 全景推演树渲染策略 (PalindromePartitionDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PalindromePartitionDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'palindrome-partition';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'palindrome-partition' ||
      modelId === '131' ||
      modelId === 'leetcode-131' ||
      modelId === 'palindrome-partitioning'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 131. 分割回文串 (Palindrome Partitioning) · 全景推演树',
      badge: '切割线推进公理 · 子串 [startIndex, i] 回文校验 · 状态回退 · 回溯树',
      descriptionHtml: `
        核心目标：将字符串 <code>s</code> 分割成一些子串，使每个子串都是回文串，返回所有可能的分割方案。<br/>
        <strong>《代码随想录》核心教研范式——切割线推进与回文剪枝：</strong><br/>
        1. <strong>切割问题的组合本质（Cutting Line Axiom）</strong>：<br/>
        切割问题的本质是在字符串的所有空隙中放置切割线。参数 <code>startIndex</code> 锚定当前切割段的起始位置，循环变量 <code>i</code> 确定当前切割段的结束边界，切出子串 <code>s[startIndex..i]</code>；<br/>
        2. <strong>即时回文验证与剪枝（Instant Palindrome Pruning）</strong>：<br/>
        若当前切出的子串 <code>[startIndex, i]</code> 是回文串，则将该子串压入 <code>path</code>，并递归深入切分后半部分 <code>backtracking(s, i + 1)</code>；<br/>
        若不是回文串，则说明以此线切割无法达成全回文，<strong>直接 <code>continue</code> 跳过该切点</strong>！<br/>
        3. <strong>切割到底收割（Exhausted Line Hit）</strong>：<br/>
        当 <code>startIndex >= s.length()</code> 时，说明切割线已经完整推移到了字符串末尾，整串已被成功切分为若干全回文子段，收割结果并 <code>return</code>。
      `,
      initialStateText: `分割入口：partition(s) ➔ backtracking(s, startIndex=0)，path = [], res = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '串尾切割满贯 (Reached End)',
        valuesStr: 'startIndex >= s.length() ➔ 成功将全串切分为完整回文子段，res.add(new ArrayList<>(path))，返回',
      },
      {
        prefix: '└───',
        label: '非回文无效切割截断 (Non-Palindrome Pruning)',
        valuesStr: '!isPalindrome(s, startIndex, i) ➔ 当前子串不是回文，continue 尝试向后扩大切割窗口',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 扫描切割线并验证候选子串回文性 (Probe & Verify Palindrome)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">isPalindrome</span>',
      detailLines: [
        'for (int i = startIndex; i < s.length(); i++) {',
        '  if (!isPalindrome(s, startIndex, i)) continue; // 非回文直接跳过',
        '  path.add(s.substring(startIndex, i + 1)); // 截取合法回文段',
      ],
      fillLine: '精准下刀：在 startIndex 到 i 之间切割，双指针验证该闭区间是否对称，回文方可入径',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵深递推至下一切割起点 (Recurse to i + 1)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">i + 1</span>',
      detailLines: [
        '  backtracking(s, i + 1); // 推进切割线，处理剩余子串',
      ],
      fillLine: '接力切割：以 i + 1 作为下一个子段的起点，向字符串尾部继续递推分割',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与撤销切割段 (Backtrack & Pop)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">path.remove()</span>',
      detailLines: [
        '  path.remove(path.size() - 1);',
        '}',
      ],
      fillLine: '抹除刀痕：撤销当前回文段，回退切割现场，继续尝试切出更长的回文子串',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '分割回文串回溯推演流 (Check Palindrome ➔ Recurse i+1 ➔ Undo Cut)',
      subtitle: 'LeetCode 131 Palindrome Partitioning Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有全回文子串分割方案列表 List<List<String>>',
      complexityStr: '时间复杂度: O(N * 2^N) 最坏全单字符情况 · 空间复杂度: O(N) 递归树深度',
    });

    return header + baseCase + round + finalReturn;
  }
}
