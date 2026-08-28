import { describe, it, expect } from 'vitest';
import { bracketMatchingSteps } from './bracket-renderer';
import { evalRPNSteps } from './eval-rpn-renderer';
import { removeDuplicatesSteps } from './remove-adjacent-duplicates-renderer';

describe('Stack Algorithms Step Generation (栈与队列核心算法推导测试)', () => {
  describe('Bracket Matching (有效的括号)', () => {
    it('1. 合法匹配 "()[]{}" 返回 isValid=true', () => {
      const result = bracketMatchingSteps('()[]{}');
      expect(result.isValid).toBe(true);
      expect(result.steps.length).toBeGreaterThan(0);
      const lastStep = result.steps[result.steps.length - 1];
      expect(lastStep.action).toBe('complete');
      expect(lastStep.stack.length).toBe(0);
    });

    it('2. 嵌套合法匹配 "{[()]}" 返回 isValid=true', () => {
      const result = bracketMatchingSteps('{[()]}');
      expect(result.isValid).toBe(true);
    });

    it('3. 括号不匹配 "(]" 和 "([)]" 返回 isValid=false', () => {
      expect(bracketMatchingSteps('(]').isValid).toBe(false);
      expect(bracketMatchingSteps('([)]').isValid).toBe(false);
    });

    it('4. 未闭合的括号 "(((" 返回 isValid=false', () => {
      const result = bracketMatchingSteps('(((');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Evaluate Reverse Polish Notation (逆波兰表达式求值)', () => {
    it('5. 计算 ["2", "1", "+", "3", "*"] 得到结果 9', () => {
      const tokens = ['2', '1', '+', '3', '*'];
      const steps = evalRPNSteps(tokens);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.result).toBe(9);
      expect(lastStep.stack).toEqual([9]);
    });

    it('6. 计算 ["4", "13", "5", "/", "+"] 得到结果 6 (整数除法)', () => {
      const tokens = ['4', '13', '5', '/', '+'];
      const steps = evalRPNSteps(tokens);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.result).toBe(6);
      expect(lastStep.stack).toEqual([6]);
    });
  });

  describe('Remove All Adjacent Duplicates In String (删除字符串中的所有相邻重复项)', () => {
    it('7. 处理 "abbaca" 最终得到 "ca"', () => {
      const result = removeDuplicatesSteps('abbaca');
      expect(result.finalString).toBe('ca');
      expect(result.steps.length).toBeGreaterThan(0);
      const lastStep = result.steps[result.steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.stack).toEqual(['c', 'a']);
    });

    it('8. 处理 "azxxzy" 最终得到 "ay"', () => {
      const result = removeDuplicatesSteps('azxxzy');
      expect(result.finalString).toBe('ay');
    });

    it('9. 空字符串安全处理', () => {
      const result = removeDuplicatesSteps('');
      expect(result.finalString).toBe('');
    });
  });
});
