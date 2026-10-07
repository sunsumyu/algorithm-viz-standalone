// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  generateRandomGenSteps,
  RANDOM_GEN_035_CODES,
  RANDOM_GEN_035_CODE_LINES,
} from './random-generator-035-step-compiler';
import { renderRandomGenCanvas } from './random-generator-035-canvas-adapter';

describe('random-generator-035 step compiler & canvas adapter', () => {
  it('generates valid steps for 2 samples', () => {
    const steps = generateRandomGenSteps(2);
    expect(steps.length).toBeGreaterThan(2);

    // Initial step check
    expect(steps[0].decision).toContain('启动随机发生器转化');
    expect(steps[0].line).toBe(RANDOM_GEN_035_CODE_LINES.rand01.typescript);

    // Final result validity
    const lastStep = steps[steps.length - 1];
    expect(lastStep.finalResult).toBeGreaterThanOrEqual(1);
    expect(lastStep.finalResult).toBeLessThanOrEqual(7);
    expect(lastStep.line).toBe(RANDOM_GEN_035_CODE_LINES.returnAns.typescript);
  });

  it('renders canvas correctly without errors', () => {
    const steps = generateRandomGenSteps(1);
    const container = document.createElement('div');
    renderRandomGenCanvas(container, steps[steps.length - 1]);
    expect(container.innerHTML).toContain('冯·诺依曼偏置对称消除天平');
    expect(container.innerHTML).toContain('双掷试验');
  });

  it('validates multi-language code templates and lines', () => {
    expect(RANDOM_GEN_035_CODES.java).toBeDefined();
    expect(RANDOM_GEN_035_CODES.cpp).toBeDefined();
    expect(RANDOM_GEN_035_CODES.python).toBeDefined();
    expect(RANDOM_GEN_035_CODES.typescript).toBeDefined();
  });
});
