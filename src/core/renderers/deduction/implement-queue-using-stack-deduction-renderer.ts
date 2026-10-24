/**
 * 用栈实现队列 (Implement Queue using Stacks · LeetCode 232)
 * 全景推演树渲染策略 (ImplementQueueUsingStackDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ImplementQueueUsingStackDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'implement-queue-using-stack';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'implement-queue-using-stack' ||
      modelId === '232' ||
      modelId === 'leetcode-232' ||
      modelId === 'queue-using-stacks'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 232. 用栈实现队列 · 全景推演树',
      badge: '代码随想录经典栈专题 · 双栈负负得正架构 / inStack进 & outStack出 / 均摊 O(1) 倾倒法则',
      descriptionHtml: `
        核心目标：请你仅使用两个栈实现先入先出（FIFO）的队列。支持 <code>push</code>、<code>pop</code>、<code>peek</code> 与 <code>empty</code> 操作。<br/>
        <strong>《代码随想录》核心教学范式——双栈负负得正与均摊 O(1) 倾倒公理：</strong><br/>
        1. <strong>负负得正（LIFO + LIFO = FIFO）</strong>：<br/>
        一个栈的特性是“先进后出”；如果将一个栈内的元素全部倒到另一个栈中，顺序就会<strong>完全颠倒</strong>，最早进入的元素一跃成为第二个栈的栈顶！<br/>
        2. <strong>惰性倾倒两大铁律（Pouring Invariants）</strong>：<br/>
        • <strong>铁律 ①（非空不倒）</strong>：只要 <code>outStack</code> 中还有元素，<strong>绝对不可从 <code>inStack</code> 倒数据</strong>！因为 <code>outStack</code> 里的元素比 <code>inStack</code> 里的更早入队，必须先出完；<br/>
        • <strong>铁律 ②（倒必倒尽）</strong>：一旦 <code>outStack</code> 变空触发倾倒，必须将 <code>inStack</code> 的所有元素<strong>一次性倒空</strong>，确保顺序无间断；<br/>
        3. <strong>均摊 O(1) 线性证明（Amortized Analysis）</strong>：<br/>
        每个元素的一生：进 <code>inStack</code> 一次（$O(1)$）、被倾倒入 <code>outStack</code> 一次（$O(1)$）、出 <code>outStack</code> 一次（$O(1)$）。全周期平均下来每个操作耗时严格为 $O(1)$！
      `,
      initialStateText: `队列初始化：MyQueue() ➔ 初始化 inStack = new ArrayDeque<>(), outStack = new ArrayDeque<>()。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '判空条件判定 (Queue Empty Check)',
        valuesStr: 'empty() ➔ 唯有 inStack.isEmpty() && outStack.isEmpty() 时队列为空',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '所有指令执行完毕 ➔ 状态一致性守恒，双栈容量之和等于当前队列长度',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 入队操作直通输入栈 (Push directly to inStack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">push(x)</span>',
      detailLines: [
        'public void push(int x) {',
        '  inStack.push(x); // 无论何时，push 永远无脑压入 inStack',
        '}',
      ],
      fillLine: '职责纯粹：入队指令只需无条件落入输入栈底，极速 O(1) 响应',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 惰性倒栈与出队窥视 (Lazy Pouring on outStack Empty)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">dump()</span>',
      detailLines: [
        'private void dumpIfNecessary() {',
        '  if (outStack.isEmpty()) {',
        '    while (!inStack.isEmpty()) {',
        '      outStack.push(inStack.pop()); // 倒栈反转顺序',
        '    }',
        '  }',
        '}',
      ],
      fillLine: '铁律守护：仅在输出栈弹尽粮绝时触发倒灌，颠倒顺序还原先入先出',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 输出栈出队与极速常数返回 (Pop / Peek from outStack)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">pop() / peek()</span>',
      detailLines: [
        'public int pop() { dumpIfNecessary(); return outStack.pop(); }',
        'public int peek() { dumpIfNecessary(); return outStack.peek(); }',
      ],
      fillLine: '水到渠成：outStack 栈顶即为真正的队头，瞬时 O(1) 提取',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '双栈队列推演流 (Direct Ingest ➔ Lazy Pouring Invariant ➔ Instant Top Dispatch)',
      subtitle: 'LeetCode 232 Implement Queue using Stacks Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '先入先出 (FIFO) 队头元素或操作结果',
      complexityStr: '时间复杂度: 均摊 O(1) · 空间复杂度: O(N) 双栈总容量',
    });

    return header + baseCase + round + finalReturn;
  }
}
