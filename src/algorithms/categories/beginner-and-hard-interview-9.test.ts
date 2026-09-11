import { describe, it, expect } from 'vitest';
import { buildPalindromePairsSteps, PALINDROME_PAIRS_CODES } from './string/palindrome-pairs-renderer';
import { buildReorderListSteps, REORDER_LIST_CODES } from './linked-list/reorder-list-renderer';
import { buildFrequencySortSteps, FREQ_SORT_CODES } from './hash-table/sort-characters-by-frequency-renderer';
import { buildProvincesSteps, NUMBER_OF_PROVINCES_CODES } from './graph/number-of-provinces-renderer';
import { generateSumNumbersSteps, SUM_ROOT_TO_LEAF_NUMBERS_CODES } from './tree/sum-root-to-leaf-numbers-renderer';

describe('大厂面试高频真题扩展 09 测试套件 (突破 610 门)', () => {
  // 1. 回文对 (Palindrome Pairs - LC 336 / Hard)
  describe('大厂真题: 回文对 (Palindrome Pairs)', () => {
    it('哈希+前后缀切分正确识别所有对偶回文', () => {
      const words = ['abcd', 'dcba', 'lls', 's', 'sssll'];
      const steps = buildPalindromePairsSteps(words);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      // 期望找出的回文对包含: [0,1], [1,0], [3,2], [2,4]
      expect(last.foundPairs.length).toBe(4);

      // 验证四语言行号映射合法性
      for (const step of steps) {
        for (const [lang, line] of Object.entries(step.codeLine)) {
          const lines = PALINDROME_PAIRS_CODES[lang as keyof typeof PALINDROME_PAIRS_CODES].split('\n');
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeGreaterThanOrEqual(1);
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeLessThanOrEqual(lines.length);
        }
      }
    });

    it('空串配对测试', () => {
      const words = ['a', ''];
      const steps = buildPalindromePairsSteps(words);
      const last = steps[steps.length - 1];
      expect(last.foundPairs.length).toBe(2); // ["a",""] -> [0,1] 和 ["","a"] -> [1,0]
    });
  });

  // 2. 重排链表 (Reorder List - LC 143 / Medium)
  describe('大厂真题: 重排链表 (Reorder List)', () => {
    it('中点快慢针 + 反转后半段 + 交叉穿针引线合并', () => {
      const values = [1, 2, 3, 4, 5];
      const steps = buildReorderListSteps(values);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      const mergedVals = last.mergedList.map(n => n.val);
      expect(mergedVals).toEqual([1, 5, 2, 4, 3]);

      // 验证四语言行号映射
      for (const step of steps) {
        for (const [lang, line] of Object.entries(step.codeLine)) {
          const lines = REORDER_LIST_CODES[lang as keyof typeof REORDER_LIST_CODES].split('\n');
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeGreaterThanOrEqual(1);
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeLessThanOrEqual(lines.length);
        }
      }
    });

    it('偶数长度链表重排', () => {
      const values = [1, 2, 3, 4];
      const steps = buildReorderListSteps(values);
      const last = steps[steps.length - 1];
      expect(last.mergedList.map(n => n.val)).toEqual([1, 4, 2, 3]);
    });
  });

  // 3. 根据字符出现频率排序 (Sort Characters By Frequency - LC 451 / Medium)
  describe('大厂真题: 根据字符出现频率排序 (Sort Characters By Frequency)', () => {
    it('词频统计 + 桶排序线性输出', () => {
      const s = 'tree';
      const steps = buildFrequencySortSteps(s);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      // 'e' 出现 2 次，'r' 和 't' 各 1 次 -> 结果为 'eert' 或 'eetr'
      expect(last.resultStr.startsWith('ee')).toBe(true);
      expect(last.resultStr.length).toBe(4);

      // 验证四语言行号映射
      for (const step of steps) {
        for (const [lang, line] of Object.entries(step.codeLine)) {
          const lines = FREQ_SORT_CODES[lang as keyof typeof FREQ_SORT_CODES].split('\n');
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeGreaterThanOrEqual(1);
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeLessThanOrEqual(lines.length);
        }
      }
    });

    it('单字符全等高频退化场景', () => {
      const steps = buildFrequencySortSteps('aaaa');
      const last = steps[steps.length - 1];
      expect(last.resultStr).toBe('aaaa');
    });
  });

  // 4. 省份数量 (Number of Provinces - LC 547 / Medium)
  describe('大厂真题: 省份数量 (Number of Provinces)', () => {
    it('并查集连通分量正确归并与计数', () => {
      // 城市 0 和 1 相连，城市 2 独立
      const matrix = [
        [1, 1, 0],
        [1, 1, 0],
        [0, 0, 1]
      ];
      const steps = buildProvincesSteps(matrix);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('主函数入口');

      const last = steps[steps.length - 1];
      expect(last.provincesCount).toBe(2);

      // 验证四语言行号映射
      for (const step of steps) {
        for (const [lang, line] of Object.entries(step.codeLine)) {
          const lines = NUMBER_OF_PROVINCES_CODES[lang as keyof typeof NUMBER_OF_PROVINCES_CODES].split('\n');
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeGreaterThanOrEqual(1);
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeLessThanOrEqual(lines.length);
        }
      }
    });

    it('所有城市互不相连的情形', () => {
      const matrix = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
      const steps = buildProvincesSteps(matrix);
      const last = steps[steps.length - 1];
      expect(last.provincesCount).toBe(3);
    });
  });

  // 5. 求根节点到叶节点数字之和 (Sum Root to Leaf Numbers - LC 129 / Medium)
  describe('大厂真题: 求根节点到叶节点数字之和 (Sum Root to Leaf Numbers)', () => {
    it('二叉树前序路径累乘与叶子求和', () => {
      const steps = generateSumNumbersSteps();
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('求根到叶节点数字之和');

      const last = steps[steps.length - 1];
      // 树由 1->2 (12), 1->3->4 (134), 1->3->5 (135) 构成，总和应为 281
      expect(last.totalSum).toBe(281);
      expect(last.completedPaths.length).toBe(3);

      // 验证四语言行号映射
      for (const step of steps) {
        for (const [lang, line] of Object.entries(step.codeLine)) {
          const lines = SUM_ROOT_TO_LEAF_NUMBERS_CODES[lang as keyof typeof SUM_ROOT_TO_LEAF_NUMBERS_CODES].split('\n');
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeGreaterThanOrEqual(1);
          expect(line, `语言 ${lang} 行号 ${line} 超出范围 [1, ${lines.length}]`).toBeLessThanOrEqual(lines.length);
        }
      }
    });
  });
});
