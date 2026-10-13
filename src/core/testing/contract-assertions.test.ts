import { describe, it, expect } from 'vitest';
import {
  verify1BasedCodeLines,
  assertStepStreamContract,
  assertMultiLanguageCodeContract,
  assertVisualizerLifecycleContract,
} from './contract-assertions';

describe('contract-assertions (测试契约断言深模块)', () => {
  const codes = {
    java: ['line1', 'line2'],
    cpp: ['line1', 'line2'],
    python: ['line1', 'line2'],
    javascript: ['line1', 'line2'],
  };

  it('有效 1-based 行号步骤通过校验', () => {
    const steps = [
      { codeLine: { java: 1, cpp: 1, python: 1, javascript: 1 } },
      { codeLine: { java: 2, cpp: 2, python: 2, javascript: 2 } },
    ];
    expect(() => verify1BasedCodeLines(steps, codes)).not.toThrow();
  });

  it('行号为 0 或越界时抛出明确断言异常', () => {
    const invalidZero = [
      { codeLine: { java: 0, cpp: 1, python: 1, javascript: 1 } },
    ];
    expect(() => verify1BasedCodeLines(invalidZero, codes)).toThrow();

    const invalidOverflow = [
      { codeLine: { java: 3, cpp: 1, python: 1, javascript: 1 } },
    ];
    expect(() => verify1BasedCodeLines(invalidOverflow, codes)).toThrow();
  });

  it('assertStepStreamContract 校验步骤流契约', () => {
    const validSteps = [
      {
        message: 'step 1',
        log: 'log 1',
        codeLine: { java: 1, cpp: 1 },
        metrics: { 'metric-val': '10' },
      },
    ];
    expect(() =>
      assertStepStreamContract(validSteps, {
        minSteps: 1,
        maxLine: 2,
        requiredMetricKeys: ['metric-val'],
      })
    ).not.toThrow();

    expect(() =>
      assertStepStreamContract(validSteps, { minSteps: 2 })
    ).toThrow();
  });

  it('assertMultiLanguageCodeContract 校验多语言契约', () => {
    expect(() =>
      assertMultiLanguageCodeContract(codes, {
        minLines: 2,
        requiredPatterns: ['line1'],
      })
    ).not.toThrow();

    expect(() =>
      assertMultiLanguageCodeContract(codes, { minLines: 5 })
    ).toThrow();
  });

  it('assertVisualizerLifecycleContract 校验沙盘容器初始化与销毁生命周期', async () => {
    class DummyVisualizer {
      public inited = false;
      public destroyed = false;
      async init(_options: any) {
        this.inited = true;
      }
      destroy() {
        this.destroyed = true;
      }
    }

    await expect(
      assertVisualizerLifecycleContract(DummyVisualizer, {
        algorithmId: 'dummy-algo',
        viewId: 'dummy-view',
      })
    ).resolves.not.toThrow();
  });
});
