import { describe, it, expect } from 'vitest';
import { StepExecutionSynchronizer } from './step-execution-synchronizer';
import type { ResolvedVariable } from './variable-context-resolver';

describe('StepExecutionSynchronizer Deep Module', () => {
  it('should normalize entity labels consistently', () => {
    expect(StepExecutionSynchronizer.formatEntityLabel('pile', 1, true)).toBe('硬币栈 #1');
    expect(StepExecutionSynchronizer.formatEntityLabel('pile', 2, true)).toBe('硬币栈 #2');
    expect(StepExecutionSynchronizer.formatEntityLabel('pile', 0, false)).toBe('硬币栈 #1');
    expect(StepExecutionSynchronizer.formatEntityLabel('group', 1, true)).toBe('第 1 组');
  });

  it('should extract action phase badge for loop stepping and self-increment', () => {
    const badgeInc = StepExecutionSynchronizer.extractActionPhaseBadge('for (int k = 1; k <= t; k++)', {
      type: 'loop-step',
      prevK: 1,
      k: 2,
    });
    expect(badgeInc).toBe('[自增 k++] 1 ➔ 2');

    const badgeTrial = StepExecutionSynchronizer.extractActionPhaseBadge('for (int k = 1; k <= t; k++)', {
      type: 'loop-coins',
      k: 1,
    });
    expect(badgeTrial).toBe('[试选 k=1 枚]');
  });

  it('should format action-aware inline hint with action badge and variables', () => {
    const varsMap = new Map<string, ResolvedVariable>([
      ['i', { name: 'i', value: '2', type: 'number' }],
      ['j', { name: 'j', value: '2', type: 'number' }],
      ['k', { name: 'k', value: '1', type: 'number' }],
    ]);

    const hint = StepExecutionSynchronizer.formatActionInlineHint(
      varsMap,
      'for (int k = 1; k <= Math.min(t, j); k++)',
      { type: 'loop-coins', k: 1 }
    );

    expect(hint).toContain('[试选 k=1 枚]');
    expect(hint).toContain('k: 1');
    expect(hint).toContain('i: 2');
  });

  it('should NOT leak inner loop variable k into outer capacity loop header', () => {
    const varsMap = new Map<string, ResolvedVariable>([
      ['i', { name: 'i', value: '1', type: 'number' }],
      ['j', { name: 'j', value: '2', type: 'number' }],
      ['m', { name: 'm', value: '2', type: 'number' }],
      ['k', { name: 'k', value: '2', type: 'number' }], // 残留的上一轮 k
      ['t', { name: 't', value: '1', type: 'number' }],
    ]);

    const hint = StepExecutionSynchronizer.formatActionInlineHint(
      varsMap,
      'for (int j = m; j > 0; j--)',
      { type: 'inner-cap', j: 2, i: 1 }
    );

    expect(hint).toContain('[考察容量 j=2]');
    expect(hint).toContain('j: 2');
    expect(hint).not.toContain('k:');
  });
});
