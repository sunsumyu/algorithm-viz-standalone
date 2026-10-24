/**
 * 移除无效的括号 (Minimum Remove to Make Valid Parentheses · LeetCode 1249)
 * 全景推演树渲染策略 (MinRemoveValidParenthesesDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MinRemoveValidParenthesesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'min-remove-valid-parentheses';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'min-remove-valid-parentheses' ||
      modelId === '1249' ||
      modelId === 'leetcode-1249' ||
      modelId === 'min-remove-parentheses'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 1249. 移除无效的括号 · 全景推演树',
      badge: '大厂高频字符串重构 · 下标索引栈 + 布尔标记数组 / 双趟线性精准滤除 / 严格 O(N)',
      descriptionHtml: `
        核心目标：给你一个由 <code>'('</code>、<code>')'</code> 和小写字母组成的字符串 <code>s</code>。你需要从字符串中删除最少数目的 <code>'('</code> 或 <code>')'</code>，使得剩下的括号字符串有效。返回任意有效字符串。<br/>
        <strong>大厂经典高频解题范式——“下标栈定位与布尔阵列标记”公理：</strong><br/>
        1. <strong>两类非法括号定位原则</strong>：<br/>
        • <strong>多余的右括号</strong>：在扫描过程中，遇到 <code>')'</code> 时若栈已空，该右括号<strong>绝对无可挽回，必须标记删除</strong>！<br/>
        • <strong>多余的左括号</strong>：在整串扫描完毕后，栈中残留下来的所有 <code>'('</code> 都是<strong>无匹配的孤儿，必须标记删除</strong>！<br/>
        2. <strong>下标索引栈核心流程</strong>：<br/>
        • 栈内存储的不是字符，而是<strong>字符在原串中的绝对下标 <code>index</code></strong>；<br/>
        • <code>invalid = new boolean[n]</code> 记录每个位置是否需要被删除；<br/>
        • 遇到 <code>'('</code>：<code>stack.push(i);</code>；<br/>
        • 遇到 <code>')'</code>：若 <code>!stack.isEmpty()</code> 则 <code>stack.pop();</code> 配对；若为空则 <code>invalid[i] = true;</code>；<br/>
        • 遍历结束：将栈中所有残留下标逐一弹出，<code>invalid[stack.pop()] = true;</code>；<br/>
        3. <strong>第二趟单趟重构</strong>：只需线遍历原串，跳过所有 <code>invalid[i] == true</code> 的字符，即可拼装出最少删除的最长合法字符串！
      `,
      initialStateText: `重构入口：minRemoveToMakeValid(s) ➔ 初始化栈 stack 存下标，布尔数组 invalid = new boolean[n]。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '纯字母无括号退化判定 (No Parentheses Case)',
        valuesStr: 's 中不含任何 ( 或 ) ➔ 无须任何删除，直接返回原串 s',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '两趟线性扫描执行完毕 ➔ 拼装的有效串满足括号完全平衡合法',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 第一趟扫描定位孤儿右括号 (Scan & Tag Rogue Right Parentheses)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Pass 1</span>',
      detailLines: [
        'if (c == \'(\') stack.push(i);',
        'else if (c == \')\') {',
        '  if (!stack.isEmpty()) stack.pop(); // 成功配对',
        '  else invalid[i] = true; // 孤儿右括号直接打标删除',
        '}',
      ],
      fillLine: '精准侦测：右括号失配立判死刑，左括号以绝对下标押入栈中待验',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 清算栈内残留孤立左括号 (Tag Remaining Orphan Left Parentheses)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Flush Stack</span>',
      detailLines: [
        'while (!stack.isEmpty()) {',
        '  invalid[stack.pop()] = true; // 欠下的闭合债无法兑现，全量打标',
        '}',
      ],
      fillLine: '彻底清账：栈内残存的左括号无人闭合，全部作为待剔除赘余清退',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 第二趟跳过标记字符极速拼装 (Pass 2: Filter & Rebuild)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Deliver</span>',
      detailLines: [
        'StringBuilder sb = new StringBuilder();',
        'for (int i = 0; i < n; i++) if (!invalid[i]) sb.append(s.charAt(i));',
        'return sb.toString();',
      ],
      fillLine: '去芜存菁：第二趟扫描跳过所有毒丸标记，无缝重组最长有效合法字串',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '无效括号剔除推演流 (Index Stack Tagging ➔ Orphan Left Flushing ➔ Filtered Reconstruction)',
      subtitle: 'LeetCode 1249 Minimum Remove to Make Valid Parentheses Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '移除最少括号后的有效括号字符串',
      complexityStr: '时间复杂度: O(N) 双趟线性扫描 · 空间复杂度: O(N) 下标栈与标记数组',
    });

    return header + baseCase + round + finalReturn;
  }
}
