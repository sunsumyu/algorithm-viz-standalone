/**
 * 重复的子字符串 (Repeated Substring Pattern · LeetCode 459)
 * 全景推演树渲染策略 (RepeatedSubstringDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RepeatedSubstringDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'repeated-substring';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'repeated-substring' ||
      modelId === '459' ||
      modelId === 'leetcode-459' ||
      modelId === 'repeated-substring-pattern'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 459. 重复的子字符串 (Repeated Substring Pattern) · 全景推演树',
      badge: 'KMP 最小周期元公理 · 最长相等前后缀整除判定 · 纯数论拓扑映射 · 严格 O(N)',
      descriptionHtml: `
        核心目标：给定一个非空的字符串 <code>s</code>，检查是否可以通过由它的一个子串重复多次构成。<br/>
        <strong>《代码随想录》核心教研范式——KMP 前缀表与周期元整除公理：</strong><br/>
        1. <strong>最长相等前后缀与周期子串的几何对偶性</strong>：<br/>
        若一个长度为 $n$ 的字符串由一个重复周期元子串重复多次拼接而成，则该字符串的最长相等前缀和最长相等后缀必定有重叠！其最长相等前后缀长度恰好等于：<br/>
        <code>next[n - 1] = n - len</code>（其中 <code>len</code> 为最小重复周期单元的长度）；<br/>
        2. <strong>最小重复单元长度求法</strong>：<br/>
        由上式移项可知，最小可能重复子串的长度必然为：<code>len = n - next[n - 1]</code>；<br/>
        3. <strong>充要整除判定公理（Divisibility Criterion）</strong>：<br/>
        该字符串能够被其子串完全重复覆盖的<strong>充分必要条件</strong>是：<br/>
        • <strong>条件 ①（非空公共前后缀）</strong>：<code>next[n - 1] > 0</code>（保证至少存在一个相等前后缀）；<br/>
        • <strong>条件 ②（全长被周期元整除）</strong>：<code>n % (n - next[n - 1]) == 0</code>！<br/>
        若同时满足这两个条件，则说明无空隙无交错，整个字符串严格由最小周期元重复拼装而成！
      `,
      initialStateText: `判定入口：repeatedSubstringPattern(s) ➔ 构建 next 数组 ➔ 萃取尾项 next[n-1] ➔ 执行整除验证。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单字符判非 (Single Char Guard)',
        valuesStr: 's.length() <= 1 ➔ 题目要求由子串重复多次，单字符无法拆分多次，返回 false',
      },
      {
        prefix: '└───',
        label: '无公共前后缀拦截 (No Prefix Fallback)',
        valuesStr: 'next[n - 1] == 0 ➔ 首尾无任何相同结构，不可能由重复子串构成，直接判定 false',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 编译全串 KMP 前缀表 (Compute Next Array for String)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Build next</span>',
      detailLines: [
        'int n = s.length();',
        'int[] next = new int[n];',
        'for (int i = 1, j = 0; i < n; i++) {',
        '  while (j > 0 && s.charAt(i) != s.charAt(j)) j = next[j - 1];',
        '  if (s.charAt(i) == s.charAt(j)) j++;',
        '  next[i] = j;',
        '}',
      ],
      fillLine: '解构几何：推导全串所有前缀的最长相等前后缀长度，锁定末尾关键指标 next[n-1]',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 萃取末位指标并推导候选最小周期元 (Derive Period Length)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Period = n - next[n-1]</span>',
      detailLines: [
        'int lps = next[n - 1]; // 最长相等前后缀长度',
        'int period = n - lps;  // 潜在最小周期元长度',
      ],
      fillLine: '精准算差：若由周期元构成，则全长扣除重叠前后缀后，留下的刚好是最小周期元长度',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 执行充要条件数论整除判定 (Divisibility Assertion)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">n % period == 0</span>',
      detailLines: [
        'if (lps > 0 && n % period == 0) {',
        '  return true; // 完美无缝整除！',
        '}',
        'return false;',
      ],
      fillLine: '一锤定音：前后缀存在且全长被周期元整除，代数几何完全封闭，判定为真',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '重复子串 KMP 周期推演流 (Build Next ➔ Extract Period ➔ Divisibility Check)',
      subtitle: 'LeetCode 459 Repeated Substring Pattern Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '是否可由重复子串构成 true / false',
      complexityStr: '时间复杂度: O(N) 单趟构建 next 数组 · 空间复杂度: O(N) 前缀表数组空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
