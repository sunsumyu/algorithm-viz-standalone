/**
 * Tests for Stable Marriage (Gale-Shapley) 声明式可视化器
 * 验证：≥21 步、两预设均覆盖、codeLine 合法、稳定匹配结果、4 语言非 stub 完整实现
 */

import { describe, it, expect } from 'vitest';
import { buildStableMarriageSteps } from './stable-marriage-renderer';
import { STABLE_MARRIAGE_CODE_LANGUAGES } from './stable-marriage-problem-content';

describe('stable-marriage: classic_3pair preset', () => {
  const steps = buildStableMarriageSteps('classic_3pair');

  it('should produce at least 21 steps', () => {
    expect(steps.length).toBeGreaterThanOrEqual(21);
  });

  it('should end with stable matching (M1,W2), (M2,W1), (M3,W3)', () => {
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.currentEngagements).toMatchObject({
      W1: 'M2',
      W2: 'M1',
      W3: 'M3',
    });
    expect(last.freeMen).toHaveLength(0);
  });

  it('should have valid codeLine bounds (1-58) on every step', () => {
    for (const step of steps) {
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const ln of lines) {
        expect(ln).toBeGreaterThanOrEqual(1);
        expect(ln).toBeLessThanOrEqual(58);
      }
    }
  });

  it('should contain at least one accept and one reject step', () => {
    const accepts = steps.filter((s) => s.status === 'accept');
    const rejects = steps.filter((s) => s.status === 'reject');
    expect(accepts.length).toBeGreaterThanOrEqual(1);
    expect(rejects.length).toBeGreaterThanOrEqual(1);
  });

  it('should have metrics on every step', () => {
    for (const step of steps) {
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-cur-prop']).toBeDefined();
      expect(step.metrics?.['metric-matched-pairs']).toBeDefined();
    }
  });
});

describe('stable-marriage: cyclic_4pair preset', () => {
  const steps = buildStableMarriageSteps('cyclic_4pair');

  it('should produce at least 21 steps', () => {
    expect(steps.length).toBeGreaterThanOrEqual(21);
  });

  it('should end with 4 pairs fully matched', () => {
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(Object.keys(last.currentEngagements).length).toBe(4);
    expect(last.freeMen).toHaveLength(0);
  });

  it('should have valid codeLine bounds on every step', () => {
    for (const step of steps) {
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const ln of lines) {
        expect(ln).toBeGreaterThanOrEqual(1);
        expect(ln).toBeLessThanOrEqual(58);
      }
    }
  });
});

describe('stable-marriage: code language completeness', () => {
  it('all 4 languages should have ≥35 lines of non-stub code', () => {
    const langs = ['cpp', 'java', 'python', 'javascript'] as const;
    for (const lang of langs) {
      const raw = STABLE_MARRIAGE_CODE_LANGUAGES[lang];
      expect(raw).toBeDefined();
      // code languages may be string[] or string
      const codeStr = Array.isArray(raw) ? raw.join('\n') : (raw as string);
      const lines = codeStr.trim().split('\n').length;
      expect(lines).toBeGreaterThanOrEqual(35);
    }
  });
});
