/**
 * 不申请额外数据结构逆序一个栈 (Reverse Stack Using Recursive · 左程云 Class 036)
 * 全景推演树渲染策略 (ReverseStackRecursiveDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ReverseStackRecursiveDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'reverse-stack-using-recursive';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'reverse-stack-using-recursive' ||
      modelId === 'reverse-stack-using-recursive-036' ||
      modelId === 'reverse-stack' ||
      modelId === 'reverse-stack-recursive' ||
      modelId === 'reverse-stack-036' ||
      modelId === 'class036-reverse-stack'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '程序员代码面试指南 & 左程云 Class 036: 逆序一个栈 · 全景推演树',
      badge: '双递归分治大师课 · 严禁任何额外辅助容器 / bottomOut抽取栈底 / 系统调用栈暂存状态 / O(N²)',
      descriptionHtml: `
        核心目标：给你一个栈，请你将这个栈<strong>完全逆序</strong>。要求：严禁申请任何额外数据结构（严禁数组、队列、其他辅助栈），只能利用递归函数与系统调用栈本身的局部变量。<br/>
        <strong>左程云算法体系教学核心——双递归原语（bottomOut 与 reverse）组合公理：</strong><br/>
        1. <strong>原语 ①：抽取并移除栈底元素 <code>bottomOut(stack)</code></strong>：<br/>
        • 弹出栈顶 <code>int result = stack.pop();</code>；<br/>
        • 若 <code>stack.isEmpty()</code>（说明刚才弹出的恰好是最后一个元素，即栈底！），直接返回 <code>result</code>；<br/>
        • 若非空，递归调用 <code>int last = bottomOut(stack);</code> 深入挖掘真正栈底；<br/>
        • <strong>在函数回溯返回时，将刚才弹出的 <code>result</code> 原样压回栈中</strong>：<code>stack.push(result);</code>！<br/>
        • 作用：<strong>神不知鬼不觉地拔除真正栈底元素，同时让其余上方所有元素保持原样相对顺序</strong>！<br/>
        2. <strong>原语 ②：宏观主递归函数 <code>reverse(stack)</code></strong>：<br/>
        • 若 <code>stack.isEmpty()</code>，直接返回基底；<br/>
        • <code>int i = bottomOut(stack);</code>：用原语 ① 拔出当前栈底，暂存于当前栈帧的局部变量 <code>i</code> 中；<br/>
        • <code>reverse(stack);</code>：递归调用自己，逆序剩下的所有上方元素；<br/>
        • <strong>关键一击</strong>：<code>stack.push(i);</code>，把刚才拔出的原栈底压回栈顶！<br/>
        • 最终：最底部的元素成功晋升为栈顶，其余元素也全部在内部递归中依次完成逆转！
      `,
      initialStateText: `逆序入口：reverse(stack) ➔ 递归提取栈底并反转。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空栈终止递归基底 (Empty Stack Base Case)',
        valuesStr: 'stack.isEmpty() ➔ 无元素需要逆转，直接 return',
      },
      {
        prefix: '└───',
        label: 'bottomOut 栈底命中基底 (Bottom Out Base Case)',
        valuesStr: 'stack.isEmpty() ➔ 刚弹出的元素即为真正栈底，直接返回该数值',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: bottomOut 递归潜行拔除栈底 (Sub-Recursion Extracts Bottom)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">bottomOut()</span>',
      detailLines: [
        'int result = stack.pop();',
        'if (stack.isEmpty()) return result; // 命中栈底并拔除',
        'int last = bottomOut(stack); // 深入下层挖掘',
        'stack.push(result); // 回溯将上方元素原样压回',
        'return last;',
      ],
      fillLine: '精准抽底：探入栈的最深处拔除基石，并在回溯中完美复原上方结构',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 主递归逆序剩余子栈 (Recurse to Reverse Remaining Stack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">reverse()</span>',
      detailLines: [
        'int i = bottomOut(stack); // 栈底抽离并暂存于栈帧 i',
        'reverse(stack); // 宏观递归：令剩余子栈自身完成逆序',
      ],
      fillLine: '系统借力：将抽出的底存入系统调用栈局部变量，对剩余残栈执行逆序',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 栈底登顶压入与完全反转交付 (Push Extracted Bottom onto Top)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">stack.push(i)</span>',
      detailLines: [
        'stack.push(i); // 将原本的最底元素，压在已逆序栈的最顶端！',
      ],
      fillLine: '反客为主：原栈底最终落座于最新栈顶，零辅助数据结构完成彻底翻转',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '递归逆序推演流 (bottomOut Extraction ➔ Recursive Reversal ➔ Bottom to Top Push)',
      subtitle: 'Class 036 Pure Recursive In-Place Stack Reversal Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '完全逆序后的目标栈',
      complexityStr: '时间复杂度: O(N²) 双重递归遍历 · 空间复杂度: O(N) 系统调用栈深度',
    });

    return header + baseCase + round + finalReturn;
  }
}
