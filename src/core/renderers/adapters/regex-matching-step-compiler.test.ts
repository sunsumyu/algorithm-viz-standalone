// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildRegexMatchingSteps,
  parseRegexMatchingInputs,
} from './regex-matching-step-compiler';
import {
  renderRegexStringMatcher,
  renderRegexDpMatrix,
} from './regex-matching-canvas-adapter';

describe('RegexMatching Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并编译经典案例 s="aab", p="c*a*b"', () => {
    const { s, p } = parseRegexMatchingInputs({
      'input-s': 'aab',
      'input-p': 'c*a*b',
    });
    expect(s).toBe('aab');
    expect(p).toBe('c*a*b');

    const steps = buildRegexMatchingSteps(s, p);
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.matched).toBe(true);
  });

  it('失配案例能够正确得到 false', () => {
    const steps = buildRegexMatchingSteps('mississippi', 'mis*is*p*.');
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.matched).toBe(false);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const steps = buildRegexMatchingSteps('aab', 'c*a*b');
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderRegexStringMatcher(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderRegexDpMatrix(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }
  });
});
