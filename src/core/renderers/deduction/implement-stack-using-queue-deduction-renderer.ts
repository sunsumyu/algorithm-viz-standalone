/**
 * 用队列实现栈 (Implement Stack using Queues · LeetCode 225)
 * 全景推演树渲染策略 (ImplementStackUsingQueueDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ImplementStackUsingQueueDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'implement-stack-using-queue';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'implement-stack-using-queue' ||
      modelId === '225' ||
      modelId === 'leetcode-225' ||
      modelId === 'stack-using-queues'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 225. 用队列实现栈 · 全景推演树',
      badge: '代码随想录经典栈专题 · 单队列自环旋转法 / push 时循环倒出再入队 / pop 与 top 纯 O(1)',
      descriptionHtml: `
        核心目标：请你仅使用一个或两个队列实现一个后入先出（LIFO）的栈。支持 <code>push</code>、<code>pop</code>、<code>top</code> 和 <code>empty</code> 操作。<br/>
        <strong>《代码随想录》核心教学范式——单队列自环旋转与栈顶对齐公理：</strong><br/>
        1. <strong>告别双队列冗余，单队列自环旋转即可化神</strong>：<br/>
        很多人以为必须两个队列互相倒腾，实际上<strong>一个单向队列（Queue）</strong>足矣！<br/>
        2. <strong>自环旋转核心法则（Size - 1 Rotation）</strong>：<br/>
        • 当执行 <code>push(x)</code> 时，先将 <code>x</code> 放入队尾：<code>queue.offer(x);</code>；<br/>
        • 此时队列中一共有 <code>sz</code> 个元素，刚刚新入队的 <code>x</code> 在队尾，但它在逻辑上是<strong>最后进入、理应最先出栈的栈顶</strong>；<br/>
        • <strong>将新元素前面的 <code>sz - 1</code> 个老元素逐个出队，并重新入队尾</strong>：<br/>
          <code>for (int i = 0; i &lt; sz - 1; i++) queue.offer(queue.poll());</code>；<br/>
        • 旋转结束后，新元素 <code>x</code> 被完美推到了<strong>队头位置</strong>！<br/>
        3. <strong>极速 O(1) 出栈与取顶</strong>：<br/>
        因为队头始终严格对齐最新栈顶，<code>pop()</code> 与 <code>top()</code> 只需要直接调用 <code>queue.poll()</code> 和 <code>queue.peek()</code>，时间复杂度为纯粹的 $O(1)$！
      `,
      initialStateText: `栈初始化：MyStack() ➔ 初始化 Queue<Integer> queue = new ArrayDeque<>()。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '判空条件判定 (Stack Empty Check)',
        valuesStr: 'empty() ➔ queue.isEmpty() 返回当前逻辑栈是否为空',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '指令执行完毕 ➔ 队头元素与逻辑栈顶严格同位一致',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 新元素直入队尾待命 (Offer New Element to Tail)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">offer(x)</span>',
      detailLines: [
        'int sz = queue.size();',
        'queue.offer(x); // 新元素先落入队列尾端',
      ],
      fillLine: '初来乍到：记录当前入队前元素规模，新成员在队尾候命',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 前置老元素自环旋转推进 (Rotate sz - 1 Preceding Elements)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Self-Rotation</span>',
      detailLines: [
        'for (int i = 0; i < sz; i++) {',
        '  queue.offer(queue.poll()); // 前方老旧元素全部循环移至队尾',
        '}',
      ],
      fillLine: '颠倒乾坤：老的元素循环让位，硬生生将最新入队的成员顶上队头宝座',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 队头对齐栈顶 O(1) 瞬时交付 (Instant O(1) Pop & Top)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">pop() / top()</span>',
      detailLines: [
        'public int pop() { return queue.poll(); }',
        'public int top() { return queue.peek(); }',
      ],
      fillLine: '坐享其成：队列头部永远是最新栈顶，出栈与窥视仅需 O(1) 纯常数开销',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '单队列自环旋转推演流 (Offer to Tail ➔ Self-Rotation ➔ Instant O(1) Dispatch)',
      subtitle: 'LeetCode 225 Implement Stack using Queues Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '后入先出 (LIFO) 栈顶元素或操作布尔值',
      complexityStr: '时间复杂度: push 为 O(N)，pop/top 为 O(1) · 空间复杂度: O(N) 单队列',
    });

    return header + baseCase + round + finalReturn;
  }
}
