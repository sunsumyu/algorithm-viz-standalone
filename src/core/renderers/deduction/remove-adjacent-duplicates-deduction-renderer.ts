/**
 * 删除字符串中的所有相邻重复项 (Remove All Adjacent Duplicates In String · LeetCode 1047)
 * 全景推演树渲染策略 (RemoveAdjacentDuplicatesDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class RemoveAdjacentDuplicatesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'remove-adjacent-duplicates';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'remove-adjacent-duplicates' ||
      modelId === '1047' ||
      modelId === 'leetcode-1047' ||
      modelId === 'remove-duplicates'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 1047. 删除字符串中的所有相邻重复项 · 全景推演树',
      badge: '代码随想录经典栈专题 · 栈消消乐模型 / 栈顶即动态左前驱 / 连锁反应自然折叠 / 严格 O(N)',
      descriptionHtml: `
        核心目标：给出由小写字母组成的字符串 <code>s</code>，重复项删除操作会选择两个相邻且相同的字母并删除。在 <code>s</code> 上反复执行重复项删除操作，直到无法继续删除为止。返回最终的字符串。<br/>
        <strong>《代码随想录》核心教学范式——“栈顶作为动态前驱”的消消乐公理：</strong><br/>
        1. <strong>为什么栈是解决“消除相邻”的绝配武器？</strong><br/>
        当你在消除一对相邻字符时，它们被抹除后，<strong>原本被隔开的左右两端字符会瞬间变成新的“相邻”字符</strong>！<br/>
        2. <strong>栈顶动态前驱公理</strong>：<br/>
        • 遍历当前扫描字符 <code>c</code> 时，当前栈顶 <code>stack.peek()</code> 就是此前存活下来的<strong>最近左侧邻居</strong>；<br/>
        • 若 <code>!stack.isEmpty() && stack.peek() == c</code>：<br/>
          两者完全相同，命中相邻重复对！<strong>直接执行 <code>stack.pop()</code> 消除栈顶</strong>！<br/>
          此时前驱字符被消解，栈中露出更早存入的更深层字符，等待与后续字符继续对消，<strong>自然实现连环连锁消除</strong>（例如 <code>"azxxzy"</code> ➔ 消除 <code>xx</code> 变成 <code>azzy</code> ➔ 自动触发 <code>zz</code> 消除 ➔ 最终剩下 <code>ay</code>）！<br/>
        • 若 <code>stack.isEmpty() || stack.peek() != c</code>：<br/>
          不重复，安全入栈：<code>stack.push(c);</code>；<br/>
        3. <strong>直接使用 StringBuilder 代替栈</strong>：尾部字符充当栈顶，避免遍历出栈后再进行倒置字符串拼接，极致优化常数。
      `,
      initialStateText: `消消乐入口：removeDuplicates(s) ➔ 初始化 StringBuilder sb = new StringBuilder()。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空串或单字符特判 (Length <= 1 Case)',
        valuesStr: 's.length() <= 1 ➔ 绝无相邻字符可对消，直接返回 s 原串',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '字符串扫描指针抵达串尾 ➔ sb.toString() 即为最终彻底消解后的纯净串',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 字符扫描与栈顶动态前驱比对 (Scan & Peek Dynamic Predecessor)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Peek</span>',
      detailLines: [
        'char c = s.charAt(i);',
        'if (sb.length() > 0 && sb.charAt(sb.length() - 1) == c) {',
        '  // 命中相邻重复项，准备触发湮灭',
        '}',
      ],
      fillLine: '敏锐侦测：检查栈顶前驱是否与当前滑入字符相同，准备对消反应',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 命中相邻成双即时出栈消解 (Instant Pop on Matched Pair)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Eliminate</span>',
      detailLines: [
        'sb.deleteCharAt(sb.length() - 1); // 弹出栈顶前驱，双双湮灭',
      ],
      fillLine: '成双即逝：相同字符相互抵消，露出的新栈顶自动成为新的待匹配前驱',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 存活字符入栈与最终精简串交付 (Push Survivor & Deliver Result)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Append</span>',
      detailLines: [
        'else { sb.append(c); } // 不重复则安全入驻栈中',
        'return sb.toString();',
      ],
      fillLine: '大浪淘沙：经过全生命周期碰撞消解，栈中沉淀出最终无法继续消除的纯净字串',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '相邻重复项消消乐推演流 (Dynamic Predecessor Peek ➔ Instant Elimination ➔ Survivor Delivery)',
      subtitle: 'LeetCode 1047 Remove All Adjacent Duplicates Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '彻底消除相邻重复项后的最终字符串',
      complexityStr: '时间复杂度: O(N) 单趟线性扫描 · 空间复杂度: O(N) 栈存储空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
