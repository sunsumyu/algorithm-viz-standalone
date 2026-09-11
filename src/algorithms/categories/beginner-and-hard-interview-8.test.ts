import { describe, it, expect } from 'vitest';
import { buildTaskSchedulerSteps, TASK_SCHEDULER_CODES } from './greedy/task-scheduler-renderer';
import { buildShuffleSteps, SHUFFLE_CODES } from './array/shuffle-an-array-renderer';
import { buildDuplicateSubtreesSteps, FIND_DUPLICATE_SUBTREES_CODES } from './tree/find-duplicate-subtrees-renderer';
import { buildVerifyPreorderBstSteps, VERIFY_PREORDER_BST_CODES } from './monotonic-stack/verify-preorder-sequence-in-bst-renderer';
import { buildMinStackSteps, MIN_STACK_CODES } from './stack/min-stack-renderer';

describe('大厂面试高频真题扩展 08 测试套件 (突破 605 门)', () => {
  // 1. 任务调度器 (Task Scheduler - LC 621)
  describe('大厂真题: 任务调度器 (Task Scheduler)', () => {
    it('桶思想最短时间片排布计算 (冷却间隔 n=2)', () => {
      const steps = buildTaskSchedulerSteps('AAABBB', 2);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      expect(last.totalTime).toBe(8); // A -> B -> idle -> A -> B -> idle -> A -> B (总耗时 8)
      expect(last.idleCount).toBe(2);

      // 验证四语言行号映射合法性
      for (const step of steps) {
        for (const [lang, line] of Object.entries(step.codeLine)) {
          const lines = TASK_SCHEDULER_CODES[lang as keyof typeof TASK_SCHEDULER_CODES].split('\n');
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeGreaterThanOrEqual(1);
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeLessThanOrEqual(lines.length);
        }
      }
    });

    it('任务种类丰富无空闲槽情境', () => {
      const steps = buildTaskSchedulerSteps('AAABBBCCCDDDEEE', 2);
      const last = steps[steps.length - 1];
      expect(last.totalTime).toBe(15);
      expect(last.idleCount).toBe(0);
    });
  });

  // 2. 打乱数组 (Shuffle an Array - LC 384)
  describe('大厂真题: 打乱数组 (Shuffle an Array - Fisher-Yates)', () => {
    it('严格置乱且保持所有原元素集合完整', () => {
      const nums = [1, 2, 3, 4, 5];
      // 固定测试随机种子
      const steps = buildShuffleSteps(nums, [1, 0, 2, 0]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      expect(last.current.length).toBe(nums.length);
      expect([...last.current].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);

      // 验证四语言行号映射
      for (const step of steps) {
        for (const [lang, line] of Object.entries(step.codeLine)) {
          const lines = SHUFFLE_CODES[lang as keyof typeof SHUFFLE_CODES].split('\n');
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeGreaterThanOrEqual(1);
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeLessThanOrEqual(lines.length);
        }
      }
    });

    it('边界长度 1 的退化场景', () => {
      const steps = buildShuffleSteps([42]);
      expect(steps.length).toBe(2);
      expect(steps[1].current).toEqual([42]);
    });
  });

  // 3. 寻找重复的子树 (Find Duplicate Subtrees - LC 652)
  describe('大厂真题: 寻找重复的子树 (Find Duplicate Subtrees)', () => {
    it('后序序列化识别两组重复子树根节点', () => {
      const steps = buildDuplicateSubtreesSteps();
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      expect(last.duplicateRoots.length).toBe(2); // 节点 6 (val 4) 和 节点 5 (val 2)

      // 验证四语言行号映射
      for (const step of steps) {
        for (const [lang, line] of Object.entries(step.codeLine)) {
          const lines = FIND_DUPLICATE_SUBTREES_CODES[lang as keyof typeof FIND_DUPLICATE_SUBTREES_CODES].split('\n');
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeGreaterThanOrEqual(1);
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeLessThanOrEqual(lines.length);
        }
      }
    });
  });

  // 4. 验证二叉搜索树的前序遍历序列 (Verify Preorder Sequence in BST - LC 255)
  describe('大厂真题: 验证二叉搜索树的前序遍历序列 (Verify Preorder Sequence in BST)', () => {
    it('合法 BST 前序遍历序列单调栈推演', () => {
      const steps = buildVerifyPreorderBstSteps([5, 2, 1, 3, 6]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.isValidSoFar).toBe(true);

      // 验证四语言行号映射
      for (const step of steps) {
        for (const [lang, line] of Object.entries(step.codeLine)) {
          const lines = VERIFY_PREORDER_BST_CODES[lang as keyof typeof VERIFY_PREORDER_BST_CODES].split('\n');
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeGreaterThanOrEqual(1);
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeLessThanOrEqual(lines.length);
        }
      }
    });

    it('非法序列违背下界立即拦截', () => {
      const steps = buildVerifyPreorderBstSteps([5, 2, 6, 1, 3]);
      const last = steps[steps.length - 1];
      expect(last.isValidSoFar).toBe(false);
      expect(last.decision).toContain('违规');
    });
  });

  // 5. 最小栈 (Min Stack - LC 155)
  describe('大厂真题: 最小栈 (Min Stack)', () => {
    it('双栈同步维护 O(1) 检索全局最小值', () => {
      const commands = ['push(-2)', 'push(0)', 'push(-3)', 'getMin()', 'pop()', 'top()', 'getMin()'];
      const steps = buildMinStackSteps(commands);
      expect(steps.length).toBeGreaterThan(0);

      // 找到第一个 getMin()
      const getMin1 = steps.find(s => s.op === 'getMin()');
      expect(getMin1?.returnedVal).toBe(-3);

      // 找到第二个 getMin()
      const getMinSteps = steps.filter(s => s.op === 'getMin()');
      expect(getMinSteps[1]?.returnedVal).toBe(-2);

      // 验证 top()
      const topStep = steps.find(s => s.op === 'top()');
      expect(topStep?.returnedVal).toBe(0);

      // 验证四语言行号映射
      for (const step of steps) {
        for (const [lang, line] of Object.entries(step.codeLine)) {
          const lines = MIN_STACK_CODES[lang as keyof typeof MIN_STACK_CODES].split('\n');
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeGreaterThanOrEqual(1);
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeLessThanOrEqual(lines.length);
        }
      }
    });
  });
});
