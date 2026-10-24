/**
 * 用一个辅助栈对栈进行排序 (Sort Stack · 左程云 Class 036)
 * 全景推演树渲染策略 (SortStackRecursiveDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SortStackRecursiveDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sort-stack-using-recursive';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sort-stack-using-recursive' ||
      modelId === 'sort-stack-using-recursive-036' ||
      modelId === 'sort-stack' ||
      modelId === 'sort-stack-036' ||
      modelId === 'class036-sort-stack'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '程序员代码面试指南 & 左程云 Class 036: 辅助栈排序 · 全景推演树',
      badge: '经典辅助栈插入排序 · 仅允许一个辅助栈 / 局部有序不变性维护 / 倒灌回溯与最终收束 / O(N²)',
      descriptionHtml: `
        核心目标：一个栈中元素的类型为整型，将该栈从顶到底按<strong>从小到大</strong>的顺序排序。要求：只许申请一个额外辅助栈，除普通变量外，严禁申请任何额外数据结构。<br/>
        <strong>左程云算法体系教学核心——辅助栈单调不变性与倒灌回溯公理：</strong><br/>
        1. <strong>辅助栈 help 的单调不变性（Invariant）</strong>：<br/>
        设原始栈为 <code>stack</code>，辅助栈为 <code>help</code>。<br/>
        我们在整个处理过程中，必须时刻让 <strong><code>help</code> 保持自底向上递减（即 <code>help</code> 的栈顶始终为当前已排序集合的最小值）</strong>！<br/>
        2. <strong>元素插入与倒灌回溯流程</strong>：<br/>
        • 弹出待排栈顶：<code>int cur = stack.pop();</code>；<br/>
        • <strong>情况 ①（顺应单调性）</strong>：若 <code>help.isEmpty() || help.peek() &gt;= cur</code>，<code>cur</code> 比 <code>help</code> 栈顶更小，直接压入 <code>help.push(cur);</code>；<br/>
        • <strong>情况 ②（破坏单调性，倒灌腾位）</strong>：若 <code>help.peek() &lt; cur</code>，说明 <code>cur</code> 更大，若强行压栈将破坏单调性！<br/>
          <strong>果断将 <code>help</code> 栈顶小于 <code>cur</code> 的所有元素弹出，重新压回 <code>stack</code></strong>：<br/>
          <code>while (!help.isEmpty() && help.peek() &lt; cur) stack.push(help.pop());</code>；<br/>
          腾出合适卡位后，将 <code>cur</code> 压入 <code>help</code>；<br/>
        3. <strong>最终归位交付</strong>：<br/>
        当 <code>stack</code> 彻底排空时，<code>help</code> 栈中元素自底向上严格递减；将 <code>help</code> 全部倒回 <code>stack</code>，<code>stack</code> 栈顶即为全局最小值，完成完全有序排序！
      `,
      initialStateText: `排序入口：sort(stack) ➔ 申请辅助栈 Stack<Integer> help = new Stack<>()。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单元素或空栈退化判定 (Length <= 1 Case)',
        valuesStr: 'stack.size() <= 1 ➔ 天生有序，直接无需任何操作返回',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '待排栈 stack.isEmpty() ➔ help 栈内全量有序，倒回 stack 完成排序',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 待排元素弹出与辅助栈单调检查 (Pop cur & Check Invariant)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Pop cur</span>',
      detailLines: [
        'int cur = stack.pop();',
        '// 若 help 栈顶比 cur 大或等于，可以直接压入',
        'if (help.isEmpty() || help.peek() >= cur) {',
        '  help.push(cur);',
        '}',
      ],
      fillLine: '平稳过渡：当前元素小于等于辅助栈顶，无缝入驻维持自底向上递减',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 辅助栈回倒腾位与单调性维持 (Back-Pour to Stack on Violation)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Back-Pour</span>',
      detailLines: [
        'while (!help.isEmpty() && help.peek() < cur) {',
        '  stack.push(help.pop()); // 违规较小元素回倒原栈暂存',
        '}',
        'help.push(cur); // 顺利卡入正确有序槽位',
      ],
      fillLine: '破局腾位：回倒较小元素重置空间，将当前较大元素沉底奠定单调根基',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 辅助栈全量倒回与原栈正序交付 (Pour All Back to Stack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Final Pour</span>',
      detailLines: [
        'while (!help.isEmpty()) {',
        '  stack.push(help.pop()); // 倒出后 stack 栈顶至栈底严格升序',
        '}',
      ],
      fillLine: '完全收官：辅助栈逐一倒出，原栈自顶向底按从大到小（或从小到大）完美有序',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '辅助栈排序推演流 (Pop Element ➔ Back-Pour Insertion Invariant ➔ Final Re-alignment)',
      subtitle: 'Class 036 Single Helper Stack Insertion Sort Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '完全排好序的目标栈 stack',
      complexityStr: '时间复杂度: O(N²) 类似插入排序倒栈 · 空间复杂度: O(N) 单一辅助栈',
    });

    return header + baseCase + round + finalReturn;
  }
}
