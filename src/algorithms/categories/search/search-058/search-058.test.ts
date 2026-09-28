/**
 * 左神算法通关课 Class 058 洪水填充高频实战 自动化测试套件
 * 覆盖 Code01 (图像渲染 Flood Fill) 与 Code05 (最大人工岛)
 */

import { describe, it, expect } from 'vitest';
import { buildLargeIsland058Steps } from './making-large-island-058-renderer';
import { buildFloodFillSteps } from './flood-fill-058-renderer';
import {
  MAKING_LARGE_ISLAND_058_CODES,
  FLOOD_FILL_058_CODES,
} from './search-058-stage-codes';
import { renderFloodFillBoard } from './search-058-shared';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>, desc: string) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `${desc}: Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `${desc}: Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `${desc}: Line ${line} exceeds code length ${codes[lang].length} for ${lang}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神洪水填充高频实战 (Class 058) 综合测试套件', () => {
  describe('Code01: 图像渲染 (Flood Fill / LeetCode 733)', () => {
    it('标准用例 3x3 网格从 (1,1) 将 1 染成 2', () => {
      const img = [
        [1, 1, 1],
        [1, 1, 0],
        [1, 0, 1],
      ];
      const steps = buildFloodFillSteps(img, 1, 1, 2);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      // 验证最终矩阵
      expect(last.image[1][1]).toBe(2);
      expect(last.image[0][0]).toBe(2);
      expect(last.image[1][2]).toBe(0); // 孤立 0 未变
      expect(last.image[2][0]).toBe(2);
      expect(last.image[2][2]).toBe(1); // 孤立 1 未连通不变

      verify1BasedCodeLines(steps, FLOOD_FILL_058_CODES, 'Code01');
    });

    it('同色防御特判: 旧色与新色相同时安全提前退出，杜绝死循环', () => {
      const img = [
        [1, 1, 1],
        [1, 1, 0],
      ];
      const steps = buildFloodFillSteps(img, 0, 0, 1);
      // 应触发 guard exit
      expect(steps.length).toBe(2);
      expect(steps[1].statusBadge?.type).toBe('warning');
      expect(steps[1].title).toContain('同色防御特判');
    });

    it('沙盘渲染纯净契约: 零 h1~h6, 零 [object Object]', () => {
      const steps = buildFloodFillSteps();
      for (const step of steps) {
        const html = renderFloodFillBoard(
          step.image,
          step.curR,
          step.curC,
          step.origColor,
          step.newColor,
          step.sr,
          step.sc
        );
        expect(html).not.toMatch(/<h[1-6]/i);
        expect(html).not.toContain('[object Object]');
      }
    });
  });

  describe('Code05: 最大人工岛 (Making A Large Island / LeetCode 827)', () => {
    it('两次遍历染色桥接，求出 3x3 网格最大人工岛面积为 5', () => {
      const steps = buildLargeIsland058Steps();
      const last = steps[steps.length - 1];
      expect(last.maxArea).toBe(5);
      verify1BasedCodeLines(steps, MAKING_LARGE_ISLAND_058_CODES, 'Code05');
    });
  });
});
