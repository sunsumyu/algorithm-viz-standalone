import { describe, it, expect } from 'vitest';
import { verify1BasedCodeLines } from './contract-assertions';

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
});
