/**
 * 左神算法通关课 Class 043 ~ 046 经典归并与快速排序专题 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildMergeSort043Steps } from './merge-sort-043-renderer';
import { buildSmallSum044Steps } from './small-sum-merge-044-renderer';
import { buildQuickSortDutchFlag045Steps } from './quick-sort-dutch-flag-045-renderer';
import { buildQuickSelect046Steps } from './quick-select-046-renderer';
import {
  MERGE_SORT_043_CODES,
  SMALL_SUM_MERGE_044_CODES,
  QUICK_SORT_DUTCH_FLAG_045_CODES,
  QUICK_SELECT_046_CODES,
} from './sort-043-046-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神经典归并与快速排序专题 (Class 043 ~ 046) 综合测试套件', () => {
  // 1. Class 043: 归并排序
  describe('Class 043: 归并排序 (Merge Sort)', () => {
    it('分治二分划分与双指针合并，最终生成完整升序序列', () => {
      const steps = buildMergeSort043Steps();
      const last = steps[steps.length - 1];
      expect(last.arr).toEqual([1, 2, 4, 5]);
      verify1BasedCodeLines(steps, MERGE_SORT_043_CODES);
    });
  });

  // 2. Class 044: 小和问题
  describe('Class 044: 小和问题 (Small Sum Merge)', () => {
    it('跨区间批量贡献累加，精准求出小和总值 16', () => {
      const steps = buildSmallSum044Steps();
      const last = steps[steps.length - 1];
      expect(last.totalSmallSum).toBe(16);
      verify1BasedCodeLines(steps, SMALL_SUM_MERGE_044_CODES);
    });
  });

  // 3. Class 045: 快速排序与荷兰国旗三路划分
  describe('Class 045: 快速排序与荷兰国旗三路划分 (QuickSort Dutch Flag)', () => {
    it('三向切分将小于区、等于区、大于区清晰划分', () => {
      const steps = buildQuickSortDutchFlag045Steps();
      const last = steps[steps.length - 1];
      expect(last.less).toBe(0);
      expect(last.more).toBe(4);
      expect(last.arr.slice(1, 4)).toEqual([3, 3, 3]); // 等于区
      verify1BasedCodeLines(steps, QUICK_SORT_DUTCH_FLAG_045_CODES);
    });
  });

  // 4. Class 046: 快速选择算法
  describe('Class 046: 快速选择算法 (QuickSelect)', () => {
    it('单侧剪枝直接命中等于区，返回第 3 小元素 3', () => {
      const steps = buildQuickSelect046Steps();
      const last = steps[steps.length - 1];
      expect(last.hit).toBe(true);
      expect(last.arr[last.targetK]).toBe(3);
      verify1BasedCodeLines(steps, QUICK_SELECT_046_CODES);
    });
  });
});
