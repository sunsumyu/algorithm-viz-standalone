// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateWordBreakSteps,
  WORD_BREAK_CODES,
} from './word-break-ii-step-compiler';
import { renderWordBreakCanvas } from './word-break-ii-canvas-adapter';

describe('WordBreakII Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('能正确执行记忆化回溯并生成合法句子方案', () => {
    const steps = generateWordBreakSteps('catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']);
    expect(steps.length).toBeGreaterThan(4);

    const s0 = steps[0];
    expect(s0.s).toBe('catsanddog');
    expect(s0.codeLine).toBeDefined();

    const last = steps[steps.length - 1];
    expect(last.allSentences).toEqual(['cat sand dog', 'cats and dog']);
  });

  it('代码库定义多语言完整', () => {
    expect(WORD_BREAK_CODES.java).toContain('wordBreak');
    expect(WORD_BREAK_CODES.cpp).toContain('wordBreak');
    expect(WORD_BREAK_CODES.python).toContain('wordBreak');
    expect(WORD_BREAK_CODES.typescript).toContain('wordBreak');
  });

  it('Canvas 适配器 DOM 挂载无崩溃且包含公式卡片', () => {
    const steps = generateWordBreakSteps('catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderWordBreakCanvas(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).toContain('dsp-formula-card');
    }
  });
});
