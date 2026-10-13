import { assertStepStreamContract } from '../../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { buildGroupBuyTicketsSteps } from './group-buy-tickets-step-compiler';
import { GROUP_BUY_TICKETS_CODES } from './greedy-091-stage-codes';

describe('GroupBuyTicketsStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings', () => {
    const n = 8;
    const games: [number, number][] = [
      [2, 10],
      [1, 15],
      [3, 20],
    ];
    const steps = buildGroupBuyTicketsSteps(n, games);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    assertStepStreamContract(steps, {
      codeArrays: GROUP_BUY_TICKETS_CODES,
      requireLine: true,
    });

    const last = steps[steps.length - 1];
    expect(last.totalCost).toBeGreaterThan(0);
  });
});
