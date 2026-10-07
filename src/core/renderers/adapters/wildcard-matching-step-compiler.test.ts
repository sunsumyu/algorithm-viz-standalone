// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildWildcardMatchingSteps,
  parseWildcardMatchingInputs,
} from './wildcard-matching-step-compiler';
import {
  renderWildcardStringMatcher,
  renderWildcardDpMatrix,
} from './wildcard-matching-canvas-adapter';

describe('WildcardMatching Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并编译典型案例 s="cb", p="?a"', () => {
    const { s, p } = parseWildcardMatchingInputs({
      'input-s': 'cb',
      'input-p': '?a',
    });
    expect(s).toBe('cb');
    expect(p).toBe('?a');

    const steps = buildWildcardMatchingSteps(s, p);
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧: cb 与 ?a 失配
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.matched).toBe(false);
  });

  it('通配星号案例 s="adceb", p="*a*b" 能够正确匹配成功', () => {
    const steps = buildWildcardMatchingSteps('adceb', '*a*b');
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.matched).toBe(true);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const steps = buildWildcardMatchingSteps('adceb', '*a*b');
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderWildcardStringMatcher(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderWildcardDpMatrix(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }
  });
});
