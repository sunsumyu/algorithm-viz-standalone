/**
 * 栈与队列互模拟专题物理不变量顶级架构机械防退化门禁
 * (Stack & Queue Invariants Gatekeeper)
 *
 * 守护领域 (11 algorithms):
 * 1. 括号匹配 (LeetCode 20): 遇左压右单调匹配策略
 * 2. 逆波兰表达式求值 (LeetCode 150): 操作数压栈+弹栈计算
 * 3. 用栈实现队列 (LeetCode 232): 双栈翻转 FIFO 模拟
 * 4. 用队列实现栈 (LeetCode 225): 旋转队列 LIFO 模拟
 * 5. 移除无效括号使字符串有效 (LeetCode 1249): 两遍扫描+标记删除
 * 6. 最小栈 (LeetCode 155): 数据栈+辅助最小栈同步
 * 7. 删除相邻重复字符 (LeetCode 1047): 栈消消乐
 * 8. 滑动窗口最大值 (LeetCode 239): 单调递减双端队列
 * 9. 前 K 个高频元素 (LeetCode 347): 哈希频次+小顶堆
 * 10. 有效的括号字符串 (LeetCode 678): 贪心双端界定
 * 11. 栈与队列理论 (Theory): 教学概念步进
 *
 * 核心机械不变量红线:
 * 1. 栈的 LIFO 时序不变量: push/pop 序列严格后进先出
 * 2. 队列的 FIFO 时序不变量: enqueue/dequeue 序列严格先进先出
 * 3. 最小栈辅助栈同步不变量: 辅助栈栈顶始终等于数据栈全局最小值
 * 4. 单调双端队列递减不变量: deque 中索引对应值严格递减
 * 5. 多语言代码行映射合法区间: [1, totalLines]，严禁越界与 0 偏移
 */

import { describe, it, expect } from 'vitest';

// 1. Bracket
import { buildBracketSteps } from '../../algorithms/categories/stack/bracket-renderer';
import { BRACKET_CODE_LANGUAGES } from '../../algorithms/categories/stack/bracket-problem-content';

// 2. Eval RPN
import { buildEvalRPNSteps } from '../../algorithms/categories/stack/eval-rpn-renderer';
import { EVAL_RPN_CODE_LANGUAGES } from '../../algorithms/categories/stack/eval-rpn-problem-content';

// 3. Implement Queue Using Stack
import { buildImplementQueueUsingStackSteps } from '../../algorithms/categories/stack/implement-queue-using-stack-renderer';
import { IMPLEMENT_QUEUE_USING_STACK_CODE_LANGUAGES } from '../../algorithms/categories/stack/implement-queue-using-stack-problem-content';

// 4. Implement Stack Using Queue
import { buildImplementStackUsingQueueSteps } from '../../algorithms/categories/stack/implement-stack-using-queue-renderer';
import { IMPLEMENT_STACK_USING_QUEUE_CODE_LANGUAGES } from '../../algorithms/categories/stack/implement-stack-using-queue-problem-content';

// 5. Min Remove Valid Parentheses
import { buildMinRemoveSteps, MIN_REMOVE_PARENTHESES_CODES } from '../../algorithms/categories/stack/min-remove-valid-parentheses-renderer';

// 6. Min Stack
import { buildMinStackSteps, MIN_STACK_CODES } from '../../algorithms/categories/stack/min-stack-renderer';

// 7. Remove Adjacent Duplicates
import { buildRemoveAdjacentDuplicatesSteps } from '../../algorithms/categories/stack/remove-adjacent-duplicates-renderer';
import { REMOVE_ADJACENT_DUPLICATES_CODE_LANGUAGES } from '../../algorithms/categories/stack/remove-adjacent-duplicates-problem-content';

// 8. Sliding Window Max
import { buildSlidingWindowMaxSteps } from '../../algorithms/categories/stack/sliding-window-max-renderer';
import { SLIDING_WINDOW_MAX_CODE_LANGUAGES } from '../../algorithms/categories/stack/sliding-window-max-problem-content';

// 9. Top K Frequent
import { buildTopKFrequentSteps } from '../../algorithms/categories/stack/top-k-frequent-renderer';
import { TOP_K_FREQUENT_CODE_LANGUAGES } from '../../algorithms/categories/stack/top-k-frequent-problem-content';

// 10. Valid Parenthesis String
import { buildValidParenthesisStringSteps, VALID_PARENTHESIS_STRING_CODES } from '../../algorithms/categories/stack/valid-parenthesis-string-renderer';

// 11. Stack/Queue Theory
import { buildStackSteps, buildQueueSteps } from '../../algorithms/categories/stack/stack-queue-theory-renderer';
import { STACK_QUEUE_THEORY_CODE_LANGUAGES } from '../../algorithms/categories/stack/stack-queue-theory-problem-content';

/**
 * 验证步进序列中的多语言代码行号合法性（支持 number、Record<string,number>、数组等格式）
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

describe('栈与队列互模拟专题物理不变量顶级架构机械防退化门禁 (Stack Gatekeeper)', () => {
  // ═══════════════════════════════════════════════════════════════════
  // 1. 括号匹配 (LeetCode 20)
  // ═══════════════════════════════════════════════════════════════════
  describe('1. 括号匹配 (Valid Parentheses)', () => {
    it('有效括号: 栈清空且 isValid === true', () => {
      const steps = buildBracketSteps('()[]{}');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.isValid).toBe(true);
      expect(last.stack.length).toBe(0);

      verifyCodeLines(steps, '括号匹配', BRACKET_CODE_LANGUAGES);
    });

    it('无效括号: 检测到 mismatch', () => {
      const steps = buildBracketSteps('([)]');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.isValid).toBe(false);

      verifyCodeLines(steps, '括号匹配-无效', BRACKET_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 2. 逆波兰表达式求值 (LeetCode 150)
  // ═══════════════════════════════════════════════════════════════════
  describe('2. 逆波兰表达式求值 (Evaluate RPN)', () => {
    it('标准 RPN 求值: 最终栈顶为唯一结果 = 9', () => {
      // ["2","1","+","3","*"] → (2+1)*3 = 9
      const steps = buildEvalRPNSteps(['2', '1', '+', '3', '*']);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.stack.length).toBe(1);
      expect(last.stack[0]).toBe(9);

      verifyCodeLines(steps, '逆波兰表达式', EVAL_RPN_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 3. 用栈实现队列 (LeetCode 232)
  // ═══════════════════════════════════════════════════════════════════
  describe('3. 用栈实现队列 (Implement Queue Using Stack)', () => {
    it('FIFO 不变量: push 1,2,3 后 peek 返回 1', () => {
      const steps = buildImplementQueueUsingStackSteps('push(1),push(2),push(3),peek(),pop()');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      const peekOut = last.outputs.find(o => o.op === 'peek()');
      if (peekOut) {
        expect(peekOut.value).toBe(1);
      }

      verifyCodeLines(steps, '用栈实现队列', IMPLEMENT_QUEUE_USING_STACK_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 4. 用队列实现栈 (LeetCode 225)
  // ═══════════════════════════════════════════════════════════════════
  describe('4. 用队列实现栈 (Implement Stack Using Queue)', () => {
    it('LIFO 不变量: push 1,2,3 后 top 返回 3', () => {
      const steps = buildImplementStackUsingQueueSteps('push(1),push(2),push(3),top(),pop()');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      const topOut = last.outputs.find(o => o.op === 'top()');
      if (topOut) {
        expect(topOut.value).toBe(3);
      }

      verifyCodeLines(steps, '用队列实现栈', IMPLEMENT_STACK_USING_QUEUE_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 5. 移除无效括号 (LeetCode 1249)
  // ═══════════════════════════════════════════════════════════════════
  describe('5. 移除无效括号 (Min Remove Valid Parentheses)', () => {
    it('结果字符串括号匹配合法', () => {
      const steps = buildMinRemoveSteps('lee(t(c)o)de)');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      // 最终结果应该是合法括号
      if (last.resultStr !== undefined) {
        const result = last.resultStr;
        let balance = 0;
        for (const ch of result) {
          if (ch === '(') balance++;
          else if (ch === ')') balance--;
          expect(balance, `结果 "${result}" 中出现未匹配右括号`).toBeGreaterThanOrEqual(0);
        }
        expect(balance, `结果 "${result}" 中存在未闭合左括号`).toBe(0);
      }

      verifyCodeLines(steps, '移除无效括号', MIN_REMOVE_PARENTHESES_CODES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 6. 最小栈 (LeetCode 155)
  // ═══════════════════════════════════════════════════════════════════
  describe('6. 最小栈 (Min Stack)', () => {
    it('辅助栈同步不变量: 每步 minStack 栈顶 === min(dataStack)', () => {
      const steps = buildMinStackSteps(['push(-2)', 'push(0)', 'push(-3)', 'getMin()', 'pop()', 'top()', 'getMin()']);
      expect(steps.length).toBeGreaterThan(0);

      for (const step of steps) {
        // 两栈高度在操作收敛时同步，在入栈/出栈中转微步骤高度差至多为 1
        expect(Math.abs(step.dataStack.length - step.minStack.length)).toBeLessThanOrEqual(1);

        if (step.dataStack.length === step.minStack.length && step.dataStack.length > 0) {
          const dataMin = Math.min(...step.dataStack);
          const minTop = step.minStack[step.minStack.length - 1];
          expect(
            minTop,
            `辅助栈栈顶 ${minTop} ≠ 数据栈最小值 ${dataMin}，dataStack=${JSON.stringify(step.dataStack)}`
          ).toBe(dataMin);
        }
      }

      verifyCodeLines(steps, '最小栈', MIN_STACK_CODES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 7. 删除相邻重复字符 (LeetCode 1047)
  // ═══════════════════════════════════════════════════════════════════
  describe('7. 删除相邻重复字符 (Remove Adjacent Duplicates)', () => {
    it('"abbaca" → 最终结果无相邻重复', () => {
      const steps = buildRemoveAdjacentDuplicatesSteps('abbaca');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');

      // 栈内容应无相邻重复
      const finalStack = last.stack as string[];
      for (let i = 1; i < finalStack.length; i++) {
        expect(
          finalStack[i],
          `结果栈位置 ${i} 出现相邻重复: "${finalStack[i-1]}${finalStack[i]}"`
        ).not.toBe(finalStack[i - 1]);
      }

      // "abbaca" → "ca"
      expect(finalStack.join('')).toBe('ca');

      verifyCodeLines(steps, '删除相邻重复', REMOVE_ADJACENT_DUPLICATES_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 8. 滑动窗口最大值 (LeetCode 239)
  // ═══════════════════════════════════════════════════════════════════
  describe('8. 滑动窗口最大值 (Sliding Window Maximum)', () => {
    it('result[i] === max(nums[i..i+k-1]) 逐窗口最大值正确性', () => {
      const nums = [1, 3, -1, -3, 5, 3, 6, 7];
      const k = 3;
      const steps = buildSlidingWindowMaxSteps(nums, k);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');

      // 标准答案: [3, 3, 5, 5, 6, 7]
      const expected = [3, 3, 5, 5, 6, 7];
      expect(last.result).toEqual(expected);

      // 逐窗口暴力验证
      for (let i = 0; i <= nums.length - k; i++) {
        const windowMax = Math.max(...nums.slice(i, i + k));
        expect(
          last.result[i],
          `窗口 [${i}, ${i + k - 1}] 最大值应为 ${windowMax}，实际 ${last.result[i]}`
        ).toBe(windowMax);
      }

      verifyCodeLines(steps, '滑动窗口最大值', SLIDING_WINDOW_MAX_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 9. 前 K 个高频元素 (LeetCode 347)
  // ═══════════════════════════════════════════════════════════════════
  describe('9. 前 K 个高频元素 (Top K Frequent Elements)', () => {
    it('结果集包含恰好 k 个元素且为最高频', () => {
      const nums = [1, 1, 1, 2, 2, 3];
      const k = 2;
      const steps = buildTopKFrequentSteps(nums, k);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.result.length).toBe(k);

      // 结果应包含 1 和 2（频次最高的两个）
      const sorted = [...last.result].sort((a: number, b: number) => a - b);
      expect(sorted).toEqual([1, 2]);

      verifyCodeLines(steps, '前K个高频元素', TOP_K_FREQUENT_CODE_LANGUAGES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 10. 有效的括号字符串 (LeetCode 678)
  // ═══════════════════════════════════════════════════════════════════
  describe('10. 有效的括号字符串 (Valid Parenthesis String)', () => {
    it('"(*)" 判定合法: 最终 minOpen === 0', () => {
      const steps = buildValidParenthesisStringSteps('(*)');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.minOpen).toBe(0);
      expect(last.isValidSoFar).toBe(true);

      verifyCodeLines(steps, '有效括号字符串', VALID_PARENTHESIS_STRING_CODES);
    });

    it('"(*))" 默认输入判定合法', () => {
      const steps = buildValidParenthesisStringSteps('(*))');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.minOpen).toBe(0);

      verifyCodeLines(steps, '有效括号字符串-默认', VALID_PARENTHESIS_STRING_CODES);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 11. 栈与队列理论 (Theory)
  // ═══════════════════════════════════════════════════════════════════
  describe('11. 栈与队列理论 (Stack & Queue Theory)', () => {
    it('栈理论步进序列非空且包含 push/pop 操作', () => {
      const steps = buildStackSteps();
      expect(steps.length).toBeGreaterThan(0);

      // 应包含 push 和 pop 动作
      const hasPush = steps.some(s => s.action === 'push');
      const hasPop = steps.some(s => s.action === 'pop');
      expect(hasPush, '栈理论应包含 push 操作').toBe(true);
      expect(hasPop, '栈理论应包含 pop 操作').toBe(true);

      verifyCodeLines(steps, '栈理论', STACK_QUEUE_THEORY_CODE_LANGUAGES);
    });

    it('队列理论步进序列非空且包含 enqueue/dequeue 操作', () => {
      const steps = buildQueueSteps();
      expect(steps.length).toBeGreaterThan(0);

      const hasEnqueue = steps.some(s => s.action === 'enqueue');
      const hasDequeue = steps.some(s => s.action === 'dequeue');
      expect(hasEnqueue, '队列理论应包含 enqueue 操作').toBe(true);
      expect(hasDequeue, '队列理论应包含 dequeue 操作').toBe(true);

      verifyCodeLines(steps, '队列理论', STACK_QUEUE_THEORY_CODE_LANGUAGES);
    });
  });
});
