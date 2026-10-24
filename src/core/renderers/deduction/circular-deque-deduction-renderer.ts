/**
 * 设计循环双端队列 (Design Circular Deque · LeetCode 641 / Class 007)
 * 全景推演树渲染策略 (CircularDequeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CircularDequeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'circular-deque';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'circular-deque' ||
      modelId === 'circular-deque-007' ||
      modelId === '641' ||
      modelId === 'leetcode-641' ||
      modelId === 'design-circular-deque' ||
      modelId === 'design-circular-deque-641' ||
      modelId === 'class007' ||
      modelId === 'class007-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 641. 设计循环双端队列 · 全景推演树',
      badge: '左程云算法通关课 Class 007 · 静态定长数组 + 环形指针 / 杜绝动态扩容与搬移 / 双端纯 O(1)',
      descriptionHtml: `
        核心目标：设计实现双端队列。实现 <code>MyCircularDeque</code> 类，支持头尾插入、头尾删除、查看首尾及满空状态检测。<br/>
        <strong>左程云算法体系教学核心——静态数组与环形首尾指针公理：</strong><br/>
        1. <strong>为什么严禁使用动态列表或链表？</strong><br/>
        • 动态列表（如 <code>ArrayList</code>）在头插时需要将所有元素整体向后搬移 $O(N)$，且扩容时有 GC 抖动；<br/>
        • 链表（如 <code>LinkedList</code>）每个节点都要额外申请指针对象，在底层存在严重的 CPU Cache 命中惩罚；<br/>
        • <strong>工业级极致性能解法</strong>：直接申请大小为 <code>k</code> 的<strong>定长连续数组</strong>，配合 <code>head</code>、<code>tail</code>、<code>size</code> 变量实现完全 $O(1)$ 常数响应！<br/>
        2. <strong>环形首尾指针移动守则（Circular Boundary Wrap）</strong>：<br/>
        • <strong>判满与判空</strong>：引入 <code>size</code> 变量后，<code>size == k</code> 即为满，<code>size == 0</code> 即为空，彻底免除多开一个空槽的复杂取模；<br/>
        • <strong>头插 <code>insertFront(val)</code></strong>：<code>head = (head == 0 ? k - 1 : head - 1); deque[head] = val; size++;</code>；<br/>
        • <strong>尾插 <code>insertLast(val)</code></strong>：<code>deque[tail] = val; tail = (tail == k - 1 ? 0 : tail + 1); size++;</code>；<br/>
        • <strong>头删 <code>deleteFront()</code></strong>：<code>head = (head == k - 1 ? 0 : head + 1); size--;</code>；<br/>
        • <strong>尾删 <code>deleteLast()</code></strong>：<code>tail = (tail == 0 ? k - 1 : tail - 1); size--;</code>；<br/>
        • <strong>取尾 <code>getRear()</code></strong>：尾指针指向的是下一个待写入位置，真正尾部元素位于 <code>tail == 0 ? k - 1 : tail - 1</code>！
      `,
      initialStateText: `队列构造：MyCircularDeque(k) ➔ 初始化 int[] deque = new int[k], head = 0, tail = 0, size = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界容量满空判定 (Capacity Guard)',
        valuesStr: 'isFull(): size == k ➔ 插入失败返回 false; isEmpty(): size == 0 ➔ 弹出失败返回 false',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '操作序列执行完毕 ➔ head 与 tail 环形指针始终落在 [0, k-1] 闭区间内',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 双端入队与环形逆向/顺向滑动 (Dual-Ended Insertion with Wrap)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Insert</span>',
      detailLines: [
        'if (isFull()) return false;',
        '// 头插：head 左移，遇到 0 环绕至 k-1',
        'head = (head == 0 ? limit - 1 : head - 1); deque[head] = val;',
        '// 尾插：写入 tail，tail 右移，遇到 k-1 环绕至 0',
        'deque[tail] = val; tail = (tail == limit - 1 ? 0 : tail + 1);',
        'size++; return true;',
      ],
      fillLine: '环形纳新：首尾指针依据方向在数组两端自然回环，零数据搬迁',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 双端出队与指针顺向/逆向释放 (Dual-Ended Deletion with Wrap)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Delete</span>',
      detailLines: [
        'if (isEmpty()) return false;',
        '// 头删：head 右移释放',
        'head = (head == limit - 1 ? 0 : head + 1);',
        '// 尾删：tail 左移回退',
        'tail = (tail == 0 ? limit - 1 : tail - 1);',
        'size--; return true;',
      ],
      fillLine: '移形换位：仅需 O(1) 拨动指针刻度，逻辑上瞬间完成物理空间回收',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 双端查看与绝对 O(1) 常数交付 (Instant O(1) Front & Rear)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(1) Access</span>',
      detailLines: [
        'public int getFront() { return isEmpty() ? -1 : deque[head]; }',
        'public int getRear() { return isEmpty() ? -1 : deque[tail == 0 ? limit - 1 : tail - 1]; }',
      ],
      fillLine: '秒级探视：头指针直指头，尾指针前驱直指尾，全生命周期稳定如磐石',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '循环双端队列推演流 (Static Ring Buffer ➔ Dual-Ended Wrap Shift ➔ O(1) Extremes Access)',
      subtitle: 'LeetCode 641 & Zuoshen Class 007 Circular Deque Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '双端元素值或操作布尔值 (true / false)',
      complexityStr: '时间复杂度: 所有操作严格纯 O(1) · 空间复杂度: O(K) 连续物理定长数组',
    });

    return header + baseCase + round + finalReturn;
  }
}
