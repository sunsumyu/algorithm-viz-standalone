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

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = GROUP_BUY_TICKETS_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.totalCost).toBeGreaterThan(0);
  });
});
