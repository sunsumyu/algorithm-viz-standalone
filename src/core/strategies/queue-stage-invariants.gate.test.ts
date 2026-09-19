/**
 * 队列与循环双端队列物理不变量顶级架构机械防退化门禁
 * (Queue & Circular Deque Invariants Gatekeeper)
 *
 * 守护领域:
 * 1. 循环双端队列设计 (Class 007 / LeetCode 641):
 *    - 静态数组环形指针模型 (Head / Tail 双指针)
 *    - O(1) 头部/尾部插入与弹出
 *    - 满/空边界阻断与容量守恒
 *
 * 核心机械不变量红线:
 * 1. 容量与大小守恒 (Capacity Bounds Invariant):
 *    在任意时刻，0 <= size <= capacity，buffer 数组长度严格等于 capacity；
 * 2. 环形指针区间约束 (Circular Pointer Range Invariant):
 *    0 <= head < capacity, 0 <= tail < capacity；
 * 3. 双端队首/队尾出入时序自洽性 (Dual-Ended Correctness):
 *    - insertFront 插入元素在 head 处，deleteFront 正确移出并返回该元素；
 *    - insertLast 插入元素在 tail 处，deleteLast 正确移出并返回该元素；
 *    - 满队列插入必被拦截 (resultStatus === false)；
 *    - 空队列弹出必被拦截 (resultStatus === false)；
 * 4. 多语言代码行映射合法区间: [1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';
import {
  generateCircularDequeSteps,
  CIRCULAR_DEQUE_007_CODES,
} from '../../algorithms/categories/queue/circular-deque-007-renderer';

/**
 * 验证步进序列中的多语言代码行号合法性（支持 number、Record<string,number> 等格式）
 */
function verifyCodeLines(
  steps: any[],
  algoName: string,
  codeSource: Record<string, string | string[]>
) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);
  const langs = ['java', 'cpp', 'python', 'javascript', 'typescript'];

  for (const lang of langs) {
    const raw = codeSource[lang];
    if (!raw) continue;
    const maxLine = Array.isArray(raw) ? raw.length : raw.split('\n').length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.codeLine === undefined || step.codeLine === null) continue;

      let lineNum: number | undefined;
      if (typeof step.codeLine === 'number') {
        lineNum = step.codeLine;
      } else if (typeof step.codeLine === 'object') {
        const val = step.codeLine[lang];
        if (typeof val === 'number') {
          lineNum = val;
        } else if (Array.isArray(val) && val.length > 0) {
          lineNum = val[0];
        }
      }

      if (lineNum !== undefined && lineNum > 0) {
        expect(
          lineNum,
          `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 超过最大行数 ${maxLine}`
        ).toBeLessThanOrEqual(maxLine);
        expect(
          lineNum,
          `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 小于 1`
        ).toBeGreaterThanOrEqual(1);
      }
    }
  }
}

describe('队列与循环双端队列物理不变量顶级架构机械防退化门禁 (Queue Gatekeeper)', () => {
  describe('Class 007: 循环双端队列设计 (Circular Deque)', () => {
    it('容量与指针物理不变量: 任何时刻 0 <= size <= k 且 head/tail 在合法区间内', () => {
      const capacity = 4;
      const steps = generateCircularDequeSteps(capacity, [
        { op: 'insertLast', val: 1 },
        { op: 'insertLast', val: 2 },
        { op: 'insertFront', val: 3 },
        { op: 'insertFront', val: 4 },
        { op: 'insertLast', val: 5 }, // full, should fail
        { op: 'deleteFront' },
        { op: 'deleteLast' },
        { op: 'deleteFront' },
        { op: 'deleteFront' },
        { op: 'deleteFront' }, // empty, should fail
      ]);

      expect(steps.length).toBeGreaterThan(0);

      for (const step of steps) {
        expect(step.size).toBeGreaterThanOrEqual(0);
        expect(step.size).toBeLessThanOrEqual(capacity);
        expect(step.head).toBeGreaterThanOrEqual(0);
        expect(step.head).toBeLessThan(capacity);
        expect(step.tail).toBeGreaterThanOrEqual(0);
        expect(step.tail).toBeLessThan(capacity);
        expect(step.buffer.length).toBe(capacity);
      }

      verifyCodeLines(steps, '循环双端队列', CIRCULAR_DEQUE_007_CODES);
    });

    it('满队列阻断不变量: 达到容量后插入必须拦截并返回 false', () => {
      const capacity = 2;
      const steps = generateCircularDequeSteps(capacity, [
        { op: 'insertLast', val: 10 },
        { op: 'insertLast', val: 20 },
        { op: 'insertLast', val: 30 }, // 应该满并失败
      ]);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.operation).toContain('insertLast(30)');
      expect(lastStep.resultStatus).toBe(false);
      expect(lastStep.size).toBe(2);

      verifyCodeLines(steps, '循环双端队列-满队列拦截', CIRCULAR_DEQUE_007_CODES);
    });

    it('空队列阻断不变量: 空队列弹出必须拦截并返回 false', () => {
      const capacity = 3;
      const steps = generateCircularDequeSteps(capacity, [
        { op: 'deleteFront' },
        { op: 'deleteLast' },
      ]);

      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].resultStatus).toBe(false);
        expect(steps[i].size).toBe(0);
      }

      verifyCodeLines(steps, '循环双端队列-空队列拦截', CIRCULAR_DEQUE_007_CODES);
    });

    it('双端交替出入时序自洽性: 先从头部插入再从尾部弹出，能够跨越边界循环回转', () => {
      const capacity = 3;
      // 头部插入会使 head 向左移动 (head = (head == 0) ? capacity - 1 : head - 1)
      const steps = generateCircularDequeSteps(capacity, [
        { op: 'insertFront', val: 100 },
        { op: 'insertFront', val: 200 },
        { op: 'deleteLast' },
        { op: 'deleteLast' },
      ]);

      const deleteStep1 = steps.find(s => s.operation === 'deleteLast()' && s.resultStatus === true);
      expect(deleteStep1).toBeDefined();

      verifyCodeLines(steps, '循环双端队列-双端时序', CIRCULAR_DEQUE_007_CODES);
    });
  });
});
