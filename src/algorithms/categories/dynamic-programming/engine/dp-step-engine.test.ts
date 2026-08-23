import { describe, it, expect } from 'vitest';
import { DpStepEngine } from './dp-step-engine';
import '../specs'; // load registrations

describe('DpStepEngine Architecture & Step Generation', () => {
  it('has all registered specs in registry', () => {
    const specs = DpStepEngine.getAll();
    expect(specs.length).toBeGreaterThanOrEqual(6);
    expect(DpStepEngine.get('min-cost')).toBeDefined();
    expect(DpStepEngine.get('climb')).toBeDefined();
    expect(DpStepEngine.get('fibonacci')).toBeDefined();
    expect(DpStepEngine.get('integer-break')).toBeDefined();
    expect(DpStepEngine.get('unique-bst')).toBeDefined();
    expect(DpStepEngine.get('decode-ways')).toBeDefined();
  });

  it('generates strict line-by-line steps for min-cost climbing stairs', () => {
    const steps = DpStepEngine.execute('min-cost', { nums: [10, 15, 20] });
    expect(steps.length).toBe(9);

    // Step 0: Function entry
    expect((steps[0].codeLine as any).java).toBe(2);
    expect((steps[0].codeLine as any).javascript).toBe(1);

    // Step 1: dp[0] = 0
    expect((steps[1].codeLine as any).java).toBe(5);

    // Step 2: dp[1] = 0
    expect((steps[2].codeLine as any).java).toBe(6);

    // Step 3: for loop check i=2
    expect((steps[3].codeLine as any).java).toBe(7);

    // Step 4: loop body dp[2]
    expect((steps[4].codeLine as any).java).toBe(8);

    // Step 8: return
    expect((steps[8].codeLine as any).java).toBe(10);
  });

  it('generates strict line-by-line steps for climb-stairs', () => {
    const steps = DpStepEngine.execute('climb', { n: 4 });
    expect(steps.length).toBe(9);
    expect((steps[0].codeLine as any).java).toBe(2);
    expect((steps[8].codeLine as any).java).toBe(10);
  });

  it('generates strict line-by-line steps for fibonacci', () => {
    const steps = DpStepEngine.execute('fibonacci', { n: 4 });
    expect(steps.length).toBe(11);
    expect((steps[0].codeLine as any).java).toBe(2);
    expect((steps[10].codeLine as any).java).toBe(10);
  });
});
