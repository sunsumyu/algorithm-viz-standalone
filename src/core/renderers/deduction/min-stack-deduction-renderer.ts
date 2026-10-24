/**
 * 最小栈 (Min Stack · LeetCode 155)
 * 全景推演树渲染策略 (MinStackDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MinStackDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'min-stack';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'min-stack' ||
      modelId === '155' ||
      modelId === 'leetcode-155' ||
      modelId === 'min-stack-155'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 155. 最小栈 (Min Stack) · 全景推演树',
      badge: '代码随想录经典栈专题 · 双栈镜像高度同步 / 历史极小值前缀快照 / 全操作纯 O(1) 检索',
      descriptionHtml: `
        核心目标：设计一个支持 <code>push</code>，<code>pop</code>，<code>top</code> 操作，并能在常数时间内检索到最小元素的栈。<br/>
        <strong>《代码随想录》与大厂经典面试范式——双栈镜像同步与历史极小值快照公理：</strong><br/>
        1. <strong>双栈镜像高度绝对同步</strong>：<br/>
        维护一个普通数据栈 <code>dataStack</code> 和一个辅助最小栈 <code>minStack</code>。<strong>两个栈的深度（Size）在任何时刻都必须完全相等</strong>！<br/>
        2. <strong>极小值前缀快照绑定</strong>：<br/>
        • 当执行 <code>push(val)</code> 时：<br/>
          数据栈正常入栈：<code>dataStack.push(val);</code>；<br/>
          最小栈压入<strong>当前值与先前栈顶最小值的极小者</strong>：<br/>
          <code>minStack.push(minStack.isEmpty() ? val : Math.min(val, minStack.peek()));</code>；<br/>
        • 此时 <code>minStack</code> 栈顶元素，恰好代表从栈底至当前深度所有已入栈元素的<strong>全局历史最小值前缀快照</strong>！<br/>
        3. <strong>全操作纯粹 O(1) 瞬时响应</strong>：<br/>
        • <code>pop()</code>：双栈同步弹出 <code>dataStack.pop()</code> 与 <code>minStack.pop()</code>，快照与数据同步回退；<br/>
        • <code>getMin()</code>：直接窥探最小栈栈顶 <code>minStack.peek()</code>，零循环遍历，绝对 $O(1)$！
      `,
      initialStateText: `最小栈初始化：MinStack() ➔ 初始化 dataStack = new ArrayDeque<>(), minStack = new ArrayDeque<>()。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空栈首元素入栈特判 (Initial Push Case)',
        valuesStr: 'minStack.isEmpty() ➔ 首个元素必为当前全局最小，minStack.push(val)',
      },
      {
        prefix: '└───',
        label: '双栈高度守恒定律 (Height Conservation Invariant)',
        valuesStr: '任意状态 ➔ dataStack.size() == minStack.size() 严格成立',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 双栈同步压栈与极小前缀刷新 (Synchronous Push & Min Refresh)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">push(val)</span>',
      detailLines: [
        'dataStack.push(val);',
        'if (minStack.isEmpty() || val < minStack.peek()) {',
        '  minStack.push(val); // 刷新全局最新极小值',
        '} else {',
        '  minStack.push(minStack.peek()); // 沿用上一深度极小快照保持高度同步',
        '}',
      ],
      fillLine: '双轨并行：数据真实入驻，辅助栈同步录入当前深度的历史极小值',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 镜像同步出栈与历史快照回退 (Synchronous Pop & Snapshot Rollback)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">pop()</span>',
      detailLines: [
        'dataStack.pop();',
        'minStack.pop(); // 同步弹出，极小值快照自动回退至上一深度状态',
      ],
      fillLine: '精准还原：弹栈时双栈步调完全一致，无需任何重新遍历重新寻极值',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 栈顶与极值 O(1) 瞬时交付 (Instant O(1) Top & getMin)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">getMin()</span>',
      detailLines: [
        'public int top() { return dataStack.peek(); }',
        'public int getMin() { return minStack.peek(); }',
      ],
      fillLine: '秒级交付：辅助栈顶即当前全局极小值，时间开销恒为 O(1) 绝对纯常数',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '最小栈推演流 (Mirror Push & Prefix Snapshot ➔ Synced Pop ➔ Instant getMin)',
      subtitle: 'LeetCode 155 Min Stack Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '当前栈顶元素或当前栈内全局最小值',
      complexityStr: '时间复杂度: push/pop/top/getMin 全为纯 O(1) · 空间复杂度: O(N) 辅助栈',
    });

    return header + baseCase + round + finalReturn;
  }
}
