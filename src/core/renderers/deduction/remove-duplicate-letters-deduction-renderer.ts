/**
 * 去除重复字母 (Remove Duplicate Letters · LeetCode 316 / Class 053)
 * 全景推演树渲染策略 (RemoveDuplicateLettersDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RemoveDuplicateLettersDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'remove-duplicate-letters';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'remove-duplicate-letters' ||
      modelId === 'remove-duplicate-letters-053' ||
      modelId === '316' ||
      modelId === 'leetcode-316' ||
      modelId === '1081' ||
      modelId === 'leetcode-1081' ||
      modelId === 'class053-code04'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 316. 去除重复字母 (Remove Duplicate Letters) · 全景推演树',
      badge: '左程云 Class 053 & 代码随想录 · 字典序贪心单调栈 / 字符剩余频次计数器 / inStack 布尔去重 / O(N) 线性规约',
      descriptionHtml: `
        核心目标：给你一个字符串 <code>s</code>，请你去除字符串中重复的字母，使得每个字母只出现一次。需保证<strong>返回结果的字典序最小</strong>（不能打乱其他字符的相对位置）。<br/>
        <strong>左程云算法体系教学核心——频次倒计时与贪心单调栈让位公理：</strong><br/>
        1. <strong>两大约束双轨并进</strong>：<br/>
        • <strong>唯一性约束</strong>：每个字符最终必须有且仅出现一次（使用 <code>inStack[26]</code> 布尔集合去重）；<br/>
        • <strong>字典序最小约束</strong>：前面的字符越小越好（使用<strong>单调递增栈</strong>尽量让较小字母排在高位）；<br/>
        2. <strong>让位公理（后续尚存方可弹出）</strong>：<br/>
        • 遍历前预先统计每个字符的<strong>总出现次数 <code>count[26]</code></strong>；<br/>
        • 若当前字符已经在栈中（<code>inStack[c] == true</code>），根据贪心原则直接跳过；<br/>
        • 若当前字符 <code>c &lt; stack.top()</code>，且栈顶字符在后续字符串中还会再次出现（<code>count[stack.top()] &gt; 0</code>）：<br/>
          <strong>果断弹出栈顶 <code>p = stack.pop(); inStack[p] = false;</code>！</strong>因为弹出后，栈顶字符未来还能以更靠后的位置补齐，而当前较小的 <code>c</code> 抢占了更靠前的高位，字典序显著变小！<br/>
        • 若 <code>count[stack.top()] == 0</code>（这是该字符在全串中的绝版独苗），<strong>绝对严禁弹出</strong>，必须保留！
      `,
      initialStateText: `去重入口：removeDuplicateLetters(s) ➔ 统计频次 count，初始化 inStack = false 与栈。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界判空退化 (Empty or Single)',
        valuesStr: 's.length() <= 1 ➔ 无重复字母，直接 return s',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '全字符串扫描完毕 ➔ 栈底到栈顶字符即为最小字典序，组装返回',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 查重拦截与频次扣减 (inStack Check & Decrement)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Skip In-Stack</span>',
      detailLines: [
        'count[c - \'a\']--; // 消耗一个剩余名额',
        'if (inStack[c - \'a\']) continue; // 栈内已存在，跳过保持唯一性',
      ],
      fillLine: '唯一守卫：已在栈中的字符维持原有较优位次，不再重复推入',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 逆序峰值贪心让位 (Greedy Pop if Later Exists)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Pop if count > 0</span>',
      detailLines: [
        'while (!stack.isEmpty() && stack.peek() > c && count[stack.peek() - \'a\'] > 0) {',
        '  char top = stack.pop();',
        '  inStack[top - \'a\'] = false; // 释放占用标记，允许未来重新入栈',
        '}',
        'stack.push(c); inStack[c - \'a\'] = true;',
      ],
      fillLine: '有后路则让位：若栈顶较大字母后面还会出现，弹出腾位使当前小字母居前',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 栈内字符正序组装 (Assemble Result)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N) Total</span>',
      detailLines: [
        'StringBuilder sb = new StringBuilder();',
        'for (char ch : stack) sb.append(ch);',
        'return sb.toString();',
      ],
      fillLine: '完美结晶：每个字母仅进出栈至多一次，常数级字符集开销 O(26)',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '去重字母推演流 (Frequency Countdown ➔ InStack Filter ➔ Monotonic Greedy Yield)',
      subtitle: 'LeetCode 316/1081 & Zuoshen Class 053 Monotonic Stack Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '去重后最小字典序字符串 (String minLexicographicalStr)',
      complexityStr: '时间复杂度: O(N) 仅历经单趟线性出入栈 · 空间复杂度: O(26) = O(1) 字符集哈希',
    });

    return header + baseCase + round + finalReturn;
  }
}
