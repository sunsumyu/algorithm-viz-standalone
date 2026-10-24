/**
 * 有效的括号字符串 (Valid Parenthesis String · LeetCode 678)
 * 全景推演树渲染策略 (ValidParenthesisStringDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ValidParenthesisStringDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'valid-parenthesis-string';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'valid-parenthesis-string' ||
      modelId === '678' ||
      modelId === 'leetcode-678' ||
      modelId === 'valid-string'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 678. 有效的括号字符串 · 全景推演树',
      badge: '大厂高频贪心与双端界定 · 通配符三重形态 / [minOpen, maxOpen] 动态闭区间维护 / 纯 O(1) 空间',
      descriptionHtml: `
        核心目标：给你一个只包含三种字符的字符串：<code>'('</code>、<code>')'</code> 和 <code>'*'</code>。<code>'*'</code> 可以被视为单个右括号 <code>')'</code>，或单个左括号 <code>'('</code>，或一个空字符串 <code>""</code>。判断字符串是否有效。<br/>
        <strong>大厂经典面试范式——未匹配左括号 [minOpen, maxOpen] 动态闭区间推演公理：</strong><br/>
        1. <strong>通配符三重态与不确定性消除</strong>：<br/>
        由于 <code>'*'</code> 具有三重身份，未匹配的左括号数量不是一个固定常数，而是一个<strong>动态浮动的连续闭区间 <code>[minOpen, maxOpen]</code></strong>！<br/>
        • <code>minOpen</code>：把尽可能多的 <code>*</code> 视为 <code>')'</code> 或空串时，所能达到的<strong>最小未匹配左括号数</strong>；<br/>
        • <code>maxOpen</code>：把所有 <code>*</code> 全部视为 <code>'('</code> 时，所能达到的<strong>最大未匹配左括号数</strong>；<br/>
        2. <strong>状态转移三步走</strong>：<br/>
        • 遇到 <code>'('</code>：<code>minOpen++; maxOpen++;</code>；<br/>
        • 遇到 <code>')'</code>：<code>minOpen--; maxOpen--;</code>；<br/>
        • 遇到 <code>'*'</code>：既可消耗左括号也可增加左括号 ➔ <code>minOpen--; maxOpen++;</code>；<br/>
        3. <strong>两大生死红线校验</strong>：<br/>
        • <strong>红线 ①（超额负数兜底）</strong>：<code>minOpen = Math.max(minOpen, 0);</code>（因为多余的 <code>*</code> 可以直接视为空串，未匹配数不能为负）；<br/>
        • <strong>红线 ②（右括号彻底破防）</strong>：若 <code>maxOpen &lt; 0</code>，即使把所有星号都当左括号也挽救不了过量的右括号，<strong>立即断言 false</strong>！<br/>
        • 遍历收官：只要 <code>minOpen == 0</code>（说明 0 落在有效区间内，存在完全抵消方案），判定为 <code>true</code>！
      `,
      initialStateText: `贪心区间入口：checkValidString(s) ➔ 初始化 minOpen = 0, maxOpen = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空串退化判定 (Empty String Case)',
        valuesStr: 's.length() == 0 ➔ 默认完全有效，直接 return true',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '遍历结束 ➔ minOpen == 0 (0 包含在区间 [minOpen, maxOpen] 中即合法)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 扫描字符与贪心区间动态缩放 (Character Ingestion & Range Shift)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Range Shift</span>',
      detailLines: [
        'if (c == \'(\') { minOpen++; maxOpen++; }',
        'else if (c == \')\') { minOpen--; maxOpen--; }',
        'else { minOpen--; maxOpen++; } // 通配符 * 的三重身份',
      ],
      fillLine: '区间伸缩：星号赋予无限弹性，上界全力助攻扩容，下界极力抵消收紧',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 负数截断保护与破防红线拦截 (Negative Clamp & Breakdown Check)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Guard Line</span>',
      detailLines: [
        'if (maxOpen < 0) return false; // 右括号彻底过剩破防，无可挽回',
        'minOpen = Math.max(minOpen, 0); // 截断下界负数，星号视为空串',
      ],
      fillLine: '严格守门：上界破防立即宣判死刑，下界探底则优雅截断归零重整旗鼓',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 零点包容性判定与最终布尔交付 (Verify Zero Inclusion)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">minOpen == 0</span>',
      detailLines: [
        'return minOpen == 0; // 0 是否能够成为合法闭合点',
      ],
      fillLine: '圆满收敛：只要下限能够归零，通配符组合即可实现完美的完全对消闭合',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '通配符括号推演流 (Dynamic Range Shifting ➔ Guard Clamp ➔ Zero-Inclusion Check)',
      subtitle: 'LeetCode 678 Valid Parenthesis String Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '有效布尔值 true / false',
      complexityStr: '时间复杂度: O(N) 线性单趟 · 空间复杂度: O(1) 纯双指针上下界变量',
    });

    return header + baseCase + round + finalReturn;
  }
}
