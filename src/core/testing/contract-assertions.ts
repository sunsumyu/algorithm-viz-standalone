/**
 * 核心测试契约断言深模块 (Contract Assertions Deep Module)
 * 统一管理 1-based 代码高亮行号、多语言覆盖度与阶段推演断言，消除全库几十个测试文件的重复复刻
 */

import { expect } from 'vitest';

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

/**
 * 校验步骤流中的多语言 1-based 代码高亮行号完整性与合法性
 */
export function verify1BasedCodeLines(
  steps: readonly { codeLine?: any }[],
  codes: Record<string, string[]>,
  _context?: string
): void {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine && typeof step.codeLine === 'object') {
      const lineMap = step.codeLine as Record<string, number>;
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = lineMap[lang];
        expect(line, `Missing line mapping for ${lang}${_context ? ` in ${_context}` : ''}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}${_context ? ` in ${_context}` : ''}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `Line ${line} exceeds code length ${codes[lang].length} for ${lang}${_context ? ` in ${_context}` : ''}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}
