import { describe, it, expect } from 'vitest';
import { buildBracketSteps } from './bracket-renderer';
import { buildRemoveAdjacentDuplicatesSteps } from './remove-adjacent-duplicates-renderer';
import { buildEvalRPNSteps } from './eval-rpn-renderer';
import { buildImplementQueueUsingStackSteps } from './implement-queue-using-stack-renderer';
import { buildImplementStackUsingQueueSteps } from './implement-stack-using-queue-renderer';
import { buildSlidingWindowMaxSteps } from './sliding-window-max-renderer';
import { buildTopKFrequentSteps } from './top-k-frequent-renderer';
import { buildStackSteps, buildQueueSteps } from './stack-queue-theory-renderer';

describe('Stack & Queue Algorithms Step Generation (栈与队列核心算法推导测试)', () => {
  describe('1. Valid Parentheses (有效的括号 · LC 20)', () => {
    it('合法括号 "()[]{}" 判定为 valid=true', () => {
      const steps = buildBracketSteps('()[]{}');
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.isValid).toBe(true);
      expect(last.matchedPairs).toBe(3);
    });

    it('嵌套括号 "{[()]}" 判定为 valid=true', () => {
      const steps = buildBracketSteps('{[()]}');
      const last = steps[steps.length - 1];
      expect(last.isValid).toBe(true);
      expect(last.matchedPairs).toBe(3);
    });

    it('不匹配括号 "(]" 判定为 invalid', () => {
      const steps = buildBracketSteps('(]');
      const last = steps[steps.length - 1];
      expect(last.isValid).toBe(false);
      expect(last.action).toBe('mismatch');
    });

    it('奇数长度 "(((" 快速判定为 invalid', () => {
      const steps = buildBracketSteps('(((');
      expect(steps[0].isValid).toBe(false);
    });
  });

  describe('2. Remove All Adjacent Duplicates (删除相邻重复项 · LC 1047)', () => {
    it('处理 "abbaca" 消除得到 "ca"', () => {
      const steps = buildRemoveAdjacentDuplicatesSteps('abbaca');
      const last = steps[steps.length - 1];
      expect(last.currentString).toBe('ca');
      expect(last.eliminatedPairs).toBe(2);
      expect(last.action).toBe('done');
    });

    it('处理全消除 "abccba" 得到空字符串', () => {
      const steps = buildRemoveAdjacentDuplicatesSteps('abccba');
      const last = steps[steps.length - 1];
      expect(last.currentString).toBe('');
      expect(last.eliminatedPairs).toBe(3);
    });
  });

  describe('3. Evaluate RPN (逆波兰表达式求值 · LC 150)', () => {
    it('计算 ["2", "1", "+", "3", "*"] 得到 9', () => {
      const steps = buildEvalRPNSteps(['2', '1', '+', '3', '*']);
      const last = steps[steps.length - 1];
      expect(last.calcResult).toBe(9);
      expect(last.action).toBe('done');
    });

    it('计算 ["4", "13", "5", "/", "+"] 得到 6 (整数向零截断)', () => {
      const steps = buildEvalRPNSteps(['4', '13', '5', '/', '+']);
      const last = steps[steps.length - 1];
      expect(last.calcResult).toBe(6);
    });
  });

  describe('4. Implement Queue using Stacks (用栈实现队列 · LC 232)', () => {
    it('执行 push 1, push 2, peek, pop, empty 得到正确输出与倒栈', () => {
      const ops = 'push 1, push 2, peek, pop, empty';
      const steps = buildImplementQueueUsingStackSteps(ops);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.outputs).toEqual([
        { op: 'peek', value: 1 },
        { op: 'pop', value: 1 },
        { op: 'empty', value: false },
      ]);
    });
  });

  describe('5. Implement Stack using Queues (用队列实现栈 · LC 225)', () => {
    it('执行 push 1, push 2, top, pop, empty 循环旋转保持队头为栈顶', () => {
      const ops = 'push 1, push 2, top, pop, empty';
      const steps = buildImplementStackUsingQueueSteps(ops);
      const last = steps[steps.length - 1];
      expect(last.outputs).toEqual([
        { op: 'top', value: 2 },
        { op: 'pop', value: 2 },
        { op: 'empty', value: false },
      ]);
    });
  });

  describe('6. Sliding Window Maximum (滑动窗口最大值 · LC 239)', () => {
    it('单调队列滑动计算 [1,3,-1,-3,5,3,6,7], k=3 得到 [3,3,5,5,6,7]', () => {
      const nums = [1, 3, -1, -3, 5, 3, 6, 7];
      const steps = buildSlidingWindowMaxSteps(nums, 3);
      const last = steps[steps.length - 1];
      expect(last.result).toEqual([3, 3, 5, 5, 6, 7]);
      expect(last.action).toBe('done');
    });
  });

  describe('7. Top K Frequent Elements (前 K 个高频元素 · LC 347)', () => {
    it('小顶堆求 [1,1,1,2,2,3], k=2 得到 [1, 2]', () => {
      const nums = [1, 1, 1, 2, 2, 3];
      const steps = buildTopKFrequentSteps(nums, 2);
      const last = steps[steps.length - 1];
      expect(last.result).toEqual([1, 2]);
      expect(last.action).toBe('done');
    });
  });

  describe('8. Stack & Queue Theory (栈与队列基础)', () => {
    it('栈 LIFO 推导步骤完整', () => {
      const steps = buildStackSteps();
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].mode).toBe('stack');
    });

    it('队列 FIFO 推导步骤完整', () => {
      const steps = buildQueueSteps();
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].mode).toBe('queue');
    });
  });
});
