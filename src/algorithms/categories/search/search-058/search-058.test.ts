/**
 * 左神算法通关课 Class 058 洪水填充高频扩展 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildLargeIsland058Steps } from './making-large-island-058-renderer';
import { MAKING_LARGE_ISLAND_058_CODES } from './search-058-stage-codes';

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

describe('左神洪水填充高频扩展 (Class 058) 综合测试套件', () => {
  it('两次遍历染色桥接，求出 3x3 网格最大人工岛面积为 5', () => {
    const steps = buildLargeIsland058Steps();
    const last = steps[steps.length - 1];
    expect(last.maxArea).toBe(5);
    verify1BasedCodeLines(steps, MAKING_LARGE_ISLAND_058_CODES);
  });
});
