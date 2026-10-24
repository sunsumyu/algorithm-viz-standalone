/**
 * 比较器与优先级队列 (Comparator & Priority Queue · Class 039)
 * 全景推演树渲染策略 (ComparatorPriorityQueueDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ComparatorPriorityQueueDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'comparator-priority-queue';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'comparator-priority-queue' ||
      modelId === 'comparator-priority-queue-039' ||
      modelId === 'class039-code01' ||
      modelId === 'class016-code01' ||
      modelId === 'priority-queue-comparator'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '左程云 Class 039. 比较器与优先级队列 (Comparator & Priority Queue) · 全景推演树',
      badge: '左神比较器黄金三大准则 / 谁小谁在前返回负数 / 多字段复合级联排序 / 优先级调度',
      descriptionHtml: `
        核心目标：彻底降服所有语言（Java / C++ / Python / JS）中 <code>Comparator</code> 的正负号混乱痛点，建立永不颠倒的比较器直觉。<br/>
        <strong>左程云算法体系教学核心——比较器黄金三大准则：</strong><br/>
        1. <strong>比较器返回值与先后顺序法则</strong>：<br/>
        调用 <code>compare(o1, o2)</code> 时：<br/>
        • <strong>返回负数（< 0）</strong>：表示认定 <code>o1</code> 的优先级高于 <code>o2</code>，<strong><code>o1</code> 应该排在前面</strong>；<br/>
        • <strong>返回正数（> 0）</strong>：表示认定 <code>o2</code> 的优先级高于 <code>o1</code>，<strong><code>o2</code> 应该排在前面</strong>；<br/>
        • <strong>返回 0（== 0）</strong>：表示两者等价，顺序无关紧要。<br/>
        <strong>“谁想排在前面，谁就作为被减数减出负数！”</strong><br/>
        • 想要从小到大升序排列：<code>o1 - o2</code>（小的减大的得负数，小的排前面）；<br/>
        • 想要从大到小降序排列：<code>o2 - o1</code>（大的作为被减数，大的排前面）。<br/>
        2. <strong>多字段复合级联调度机制</strong>：<br/>
        在优先级调度中，第一关键维度（如任务优先级 <code>priority</code>）若不相等，直接按第一维度分胜负；若第一维度相等，则无缝切换到第二维度（如到达时间戳 <code>timestamp</code> 或 ID）进行决胜。
      `,
      initialStateText: `比较器初始化：装载多字段任务模型，建立 o1 vs o2 严格弱序推演。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '升序与降序口诀 (Ordering Formula)',
        valuesStr: '升序: o1 - o2 < 0 ➔ o1 前置；降序: o2 - o1 < 0 ➔ o2 前置',
      },
      {
        prefix: '└───',
        label: '等价传递性准则 (Strict Weak Ordering)',
        valuesStr: '自反性 (a=a)、反对称性 (a<b ➔ b>a) 与传递性 (a<b && b<c ➔ a<c)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 第一维度优先级主裁比对 (Primary Key: Priority)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Priority Decision</span>',
      detailLines: [
        'if (o1.priority != o2.priority) return o2.priority - o1.priority;',
        '降序规则：高优先级任务优先被调度，差值大于 0 即刻完成判定',
      ],
      fillLine: '主维度决胜：高优先级任务优先出队，无需比较次要字段',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 第二维度时间戳平局决胜 (Secondary Key: Timestamp/ID)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Tie Breaking</span>',
      detailLines: [
        'if (o1.priority == o2.priority) return o1.id - o2.id;',
        '升序规则：同等优先级下，先到达（ID 较小）的任务优先出队',
      ],
      fillLine: '平局决胜：级联进入第二裁判维度，确保全序稳定性',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 接入二叉堆构建优先级队列 (PriorityQueue Dispatch)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Heap Dispatch</span>',
      detailLines: [
        'PriorityQueue<Task> pq = new PriorityQueue<>(comparator);',
        '二叉堆内部上浮 heapInsert 与下沉 heapify 均依托 comparator 执行比较',
        '每次 poll() 严格在 O(log N) 内返回当前最高优先级的合格任务',
      ],
      fillLine: '树上调度：比较器驱动完全二叉堆各节点有序排布，实现 O(1) 窥视与 O(log N) 调度',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '比较器准则与优先队列调度推演流 (Formula ➔ Tie Breaking ➔ Heap Dispatch)',
      subtitle: 'Zuoshen Class 039 Comparator Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return scheduledTasks; // 按照复合比较规则完美调度的执行序列',
      answerDescription: '理解比较器规则是掌握堆排序、贪心区间排布与高级图算法的必备基石。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
