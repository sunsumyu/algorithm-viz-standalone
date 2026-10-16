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

export interface StepStreamContractOptions {
  minSteps?: number;
  maxLine?: number;
  codes?: Record<string, string[]>;
  codeArrays?: Record<string, string[]>;
  requiredMetricKeys?: string[];
  requireStatusText?: boolean;
  requireLine?: boolean;
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
    if (step.codeLine && typeof step.codeLine === 'object' && !Array.isArray(step.codeLine)) {
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

/**
 * 校验步骤流的基本契约（消息、日志、代码高亮有效性、指标完整性）
 */
export function assertStepStreamContract(
  steps: readonly any[],
  options: StepStreamContractOptions = {}
): void {
  const { minSteps = 1, maxLine, codes, codeArrays, requiredMetricKeys, requireStatusText, requireLine } = options;
  expect(steps.length).toBeGreaterThanOrEqual(minSteps);

  const effectiveCodes = codes ?? codeArrays;
  if (effectiveCodes) {
    verify1BasedCodeLines(steps, effectiveCodes);
  }

  const effectiveMaxLine = maxLine ?? effectiveCodes?.java?.length;

  for (const step of steps) {
    if (requireStatusText) {
      expect(step.statusText).toBeTruthy();
    } else {
      expect(step.message).toBeTruthy();
    }
    if (step.log !== undefined) {
      expect(step.log).toBeTruthy();
    }
    expect(step.codeLine).toBeDefined();

    if (requireLine) {
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);
    }

    const lineVal =
      typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in step.codeLine
        ? (step.codeLine as any).java
        : step.codeLine;
    const lines = Array.isArray(lineVal) ? lineVal : [lineVal];
    for (const l of lines) {
      if (typeof l === 'number') {
        expect(l).toBeGreaterThan(0);
        if (effectiveMaxLine) {
          expect(l).toBeLessThanOrEqual(effectiveMaxLine);
        }
      }
    }

    if (requiredMetricKeys && requiredMetricKeys.length > 0) {
      expect(step.metrics).toBeDefined();
      for (const k of requiredMetricKeys) {
        expect(step.metrics?.[k]).toBeDefined();
      }
    }
  }
}

/**
 * 校验多语言代码模板完整性与典型关键字覆盖
 */
export function assertMultiLanguageCodeContract(
  codes: Record<string, string[]>,
  options: { minLines?: number; requiredPatterns?: (string | RegExp)[] } = {}
): void {
  const { minLines = 1, requiredPatterns = [] } = options;
  for (const lang of ['cpp', 'java', 'python', 'javascript']) {
    const code = codes[lang];
    expect(code, `Missing code for ${lang}`).toBeDefined();
    expect(code.length).toBeGreaterThanOrEqual(minLines);
    const joined = code.join('\n');
    for (const pat of requiredPatterns) {
      expect(joined).toMatch(pat);
    }
  }
}

/**
 * 校验可视化器沙盘生命周期（初始化与销毁，消除全库各测试中私自手写的 mockRoot）
 */
export async function assertVisualizerLifecycleContract(
  VizClassOrInstance: (new (...args: any[]) => any) | { init: Function; destroy?: Function },
  options: { algorithmId: string; viewId: string }
): Promise<void> {
  const mockElements = new Map<string, any>();
  const mockRoot = {
    querySelector: (sel: string) => mockElements.get(sel) || null,
    querySelectorAll: (_sel: string) => [],
    isConnected: true,
  } as unknown as HTMLElement;

  const viz = typeof VizClassOrInstance === 'function' ? new (VizClassOrInstance as any)() : VizClassOrInstance;
  expect(viz).toBeDefined();
  await viz.init({
    root: mockRoot,
    algorithmId: options.algorithmId,
    viewId: options.viewId,
  });
  expect(viz).toBeDefined();
  if (typeof viz.destroy === 'function') {
    viz.destroy();
  }
}
