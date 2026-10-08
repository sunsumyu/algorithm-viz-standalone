/**
 * Floyd 全源最短路伴生测试
 */

import { describe, it, expect } from 'vitest';
import { buildFloydSteps, INF } from './floyd-step-compiler';

describe('Floyd Step Compiler 伴生测试', () => {
  it('正确生成全源最短路步进与 1-based 行号', () => {
    const steps = buildFloydSteps();
    expect(steps.length).toBeGreaterThan(10);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps.every((s) => typeof s.statusText === 'string' && s.statusText.length > 0)).toBe(true);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    // 0->3: 0->1(5) + 1->2(3) + 2->3(1) = 9 < 10
    expect(last.matrix[0][3]).toBe(9);
    expect(last.matrix[0][0]).toBe(0);
    expect(last.matrix[3][0]).toBe(INF);
  });
});
