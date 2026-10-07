// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildPalindromePartitionSteps,
  PALINDROME_PARTITION_CODES,
  PALINDROME_PARTITION_CODE_LINES,
} from './palindrome-partitioning-ii-step-compiler';
import { renderPalindromePartitionCanvas } from './palindrome-partitioning-ii-canvas-adapter';

describe('PalindromePartitioningII Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('能正确计算回文分割步骤与最少分割数', () => {
    // "aabcb" -> 最优分割为 "aa" | "bcb", 切 1 刀
    const steps = buildPalindromePartitionSteps('aabcb');
    expect(steps.length).toBeGreaterThan(4);

    const s0 = steps[0];
    expect(s0.phase).toBe('init');
    expect(s0.codeLine).toEqual(PALINDROME_PARTITION_CODE_LINES.init);

    const last = steps[steps.length - 1];
    expect(last.phase).toBe('finish');
    expect(last.dp[last.s.length - 1]).toBe(1);
  });

  it('多语言代码齐全', () => {
    expect(PALINDROME_PARTITION_CODES.java).toContain('minCut');
    expect(PALINDROME_PARTITION_CODES.cpp).toContain('minCut');
    expect(PALINDROME_PARTITION_CODES.python).toContain('minCut');
    expect(PALINDROME_PARTITION_CODES.typescript).toContain('minCut');
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无未定义泄漏', () => {
    const steps = buildPalindromePartitionSteps('aabcb');
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      container.innerHTML = renderPalindromePartitionCanvas(step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
    }
  });
});
