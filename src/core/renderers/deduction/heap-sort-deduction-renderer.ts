/**
 * 堆结构与堆排序 (Heap Structure & Heap Sort · Class 040 / 洛谷 P1177)
 * 全景推演树渲染策略 (HeapSortDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class HeapSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'heap-sort';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'heap-sort' ||
      modelId === 'heap-sort-040' ||
      modelId === 'class040-code01' ||
      modelId === 'class014-code01' ||
      modelId === 'heapify' ||
      modelId === 'p1177'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '左程云 Class 040. 堆结构与堆排序 (Heap Sort) · 全景推演树',
      badge: '完全二叉树大根堆 / 自底向上 O(N) 极速建堆 / 原地 swap 沉淀最大值 / 严格 O(1) 额外空间',
      descriptionHtml: `
        核心目标：给定无序连续数组 <code>arr</code>，在严格 <code>O(1)</code> 额外辅助空间内将其升序排列。<br/>
        <strong>左程云算法体系教学核心——完全二叉树数组映射与双向调整：</strong><br/>
        1. <strong>数组与完全二叉树的零开销寻址映射</strong>：<br/>
        • 节点 <code>i</code> 的左孩子：<code>2 * i + 1</code>；<br/>
        • 节点 <code>i</code> 的右孩子：<code>2 * i + 2</code>；<br/>
        • 节点 <code>i</code> 的父节点：<code>(i - 1) / 2</code>。<br/>
        2. <strong>建堆的两种时空境界（heapInsert vs heapify）</strong>：<br/>
        • 自顶向下不断 <code>heapInsert</code>：复杂度为 $\\sum_{i=1}^{N} \\log i = O(N \\log N)$；<br/>
        • <strong>自底向上倒序 <code>heapify</code>（左神极力推崇）</strong>：从最后一个非叶子节点 <code>(N - 1) / 2</code> 倒序下沉，错位相减法严格证明总代价为 $\\sum k \\frac{N}{2^{k+1}} = \\mathbf{O(N)}$！建堆时间减半！<br/>
        3. <strong>原地堆排序主循环（沉淀与下沉）</strong>：<br/>
        • 堆顶 <code>arr[0]</code> 永远是当前堆中最大值；<br/>
        • 将堆顶与堆末尾 <code>arr[heapSize - 1]</code> 原地交换，最大值即被锁定沉淀在数组末尾；<br/>
        • <code>heapSize--</code> 缩小堆视窗，随后对新堆顶 0 号位置执行 <code>heapify(0, heapSize)</code> 恢复大根堆；<br/>
        • 循环 $N-1$ 次，全数组自然呈现升序，空间复杂度严格为 <strong>O(1)</strong>！
      `,
      initialStateText: `堆排序初始化：输入原始无序数组，准备自底向上建立大根堆并原地排序。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '数组退化基准 (Base Array)',
        valuesStr: 'arr == null || arr.length < 2 ➔ 天然有序，直接 return',
      },
      {
        prefix: '└───',
        label: '完全二叉树父子索引 (Index Mapping)',
        valuesStr: 'left = 2 * i + 1, right = 2 * i + 2, parent = (i - 1) / 2',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 自底向上线性 O(N) 建大根堆 (Bottom-Up Heapify)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(N) Build</span>',
      detailLines: [
        'for (int i = (n - 1) / 2; i >= 0; i--) heapify(arr, i, n);',
        '下沉逻辑：若左右孩子存在且较大者大于当前节点，swap(cur, largest) 并继续下沉',
        '错位相减数学收敛：底层节点多但下沉高度小，高层节点少高度大，总时间严格 O(N)',
      ],
      fillLine: '大根堆就绪：整棵完全二叉树所有父节点均不小于其左右孩子，堆顶锁定全局最大值',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 堆顶与末尾交换 ➔ 最大值原地锁定 (Swap & Sink)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">In-Place Swap</span>',
      detailLines: [
        'swap(arr, 0, --heapSize); // 堆顶最大值沉淀至末尾，堆视窗收缩',
        '此时末尾元素已经就位，严禁再参与后续 heapify',
      ],
      fillLine: '原地锁定：零额外空间消耗，借用数组末端作为已排序区域',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 堆顶下沉恢复大根堆 ➔ 迭代循环直至堆空 (Heapify Root)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(log N) Step</span>',
      detailLines: [
        'heapify(arr, 0, heapSize); // 从 0 号根节点向下渗透',
        'while (heapSize > 0) { swap(arr, 0, --heapSize); heapify(arr, 0, heapSize); }',
      ],
      fillLine: '全局升序：重复 N-1 次，数组从左至右自然升序排列完成',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '堆排序全景推演流 (Linear Build Heap ➔ Root Swap ➔ Heapify Loop)',
      subtitle: 'Zuoshen Class 040 In-Place Heap Sort Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return arr; // 原地升序排列完成的数组',
      answerDescription: '时间复杂度严格为 O(N log N)，空间复杂度为 O(1)，无任何递归栈空间开销。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
