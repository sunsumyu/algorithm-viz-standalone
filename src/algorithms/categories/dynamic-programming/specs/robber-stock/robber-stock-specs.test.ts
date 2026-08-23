import { describe, it, expect } from 'vitest';
import { DpStepEngine } from '../../engine/dp-step-engine';
import '../index';

describe('Robber & Stock DP Specs Architecture Verification', () => {
  it('HouseRobberSpec calculates maximum stolen amount accurately', () => {
    const spec = DpStepEngine.get('house-robber');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(198);

    const steps = DpStepEngine.generateSteps('house-robber', { nums: [2, 7, 9, 3, 1] });
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.dp1d?.[4]).toBe(12);
    expect(last.message).toContain('12');
  });

  it('HouseRobberIiSpec resolves circular constraint via double range break', () => {
    const spec = DpStepEngine.get('house-robber-ii');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(213);

    const steps = DpStepEngine.generateSteps('house-robber-ii', { nums: [2, 3, 2] });
    const last = steps[steps.length - 1];
    expect(last.vars?.find((v) => v.name.includes('全局最优金额'))?.value).toBe('3');
  });

  it('HouseRobberIiiSpec computes tree post-order DP tuple states', () => {
    const spec = DpStepEngine.get('house-robber-iii');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(337);

    const steps = DpStepEngine.generateSteps('house-robber-iii', {});
    const last = steps[steps.length - 1];
    expect(last.message).toContain('7');
  });

  it('StockISpec computes single transaction profit', () => {
    const spec = DpStepEngine.get('best-time-to-buy-and-sell-stock');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(121);

    const steps = DpStepEngine.generateSteps('best-time-to-buy-and-sell-stock', {
      prices: [7, 1, 5, 3, 6, 4],
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[5]?.[1]).toBe(5);
  });

  it('StockIiSpec computes multiple transaction accumulated profit', () => {
    const spec = DpStepEngine.get('best-time-to-buy-and-sell-stock-ii');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(122);

    const steps = DpStepEngine.generateSteps('best-time-to-buy-and-sell-stock-ii', {
      prices: [7, 1, 5, 3, 6, 4],
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[5]?.[1]).toBe(7);
  });

  it('StockIiiSpec calculates 2-transaction state machine profit', () => {
    const spec = DpStepEngine.get('best-time-to-buy-and-sell-stock-iii');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(123);

    const steps = DpStepEngine.generateSteps('best-time-to-buy-and-sell-stock-iii', {
      prices: [3, 3, 5, 0, 0, 3, 1, 4],
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[7]?.[4]).toBe(6);
  });

  it('StockWithCooldownSpec handles cooldown state transition correctly', () => {
    const spec = DpStepEngine.get('best-time-to-buy-and-sell-stock-with-cooldown');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(309);

    const steps = DpStepEngine.generateSteps('best-time-to-buy-and-sell-stock-with-cooldown', {
      prices: [1, 2, 3, 0, 2],
    });
    const last = steps[steps.length - 1];
    expect(last.message).toContain('3');
  });

  it('StockWithFeeSpec deducts transaction fee per trade', () => {
    const spec = DpStepEngine.get('best-time-to-buy-and-sell-stock-with-transaction-fee');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(714);

    const steps = DpStepEngine.generateSteps('best-time-to-buy-and-sell-stock-with-transaction-fee', {
      prices: [1, 3, 2, 8, 4, 9],
      fee: 2,
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[5]?.[1]).toBe(8);
  });
});
