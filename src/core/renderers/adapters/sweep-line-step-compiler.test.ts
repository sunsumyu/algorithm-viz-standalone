import { describe, it, expect } from 'vitest';
import {
  buildSweepLineSteps,
  SWEEP_LINE_CODES,
  SWEEP_LINE_LINES,
} from './sweep-line-step-compiler';
import { renderSweepLineCanvas } from './sweep-line-canvas-adapter';

describe('SweepLine 115 Step Compiler & Canvas Adapter', () => {
  const singleRect = [{ x1: 0, y1: 0, x2: 10, y2: 10 }];
  const overlappingRects = [
    { x1: 0, y1: 0, x2: 10, y2: 10 },
    { x1: 5, y1: 5, x2: 15, y2: 15 },
  ];

  it('should compute area correctly for single rectangle', () => {
    const steps = buildSweepLineSteps(singleRect);

    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0].codeLine).toEqual(SWEEP_LINE_LINES.entry);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.totalArea).toBe(100);
    expect(lastStep.decision).toContain('扫描线全部扫描完成');
    expect(lastStep.statusBadge?.type).toBe('success');
  });

  it('should compute union area correctly for overlapping rectangles', () => {
    // 10x10 + 10x10 - 5x5 = 175
    const steps = buildSweepLineSteps(overlappingRects);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.totalArea).toBe(175);
  });

  it('should contain 1-based code lines across languages', () => {
    expect(SWEEP_LINE_CODES.java.join('\n')).toContain('totalArea');
    expect(SWEEP_LINE_CODES.cpp.join('\n')).toContain('totalArea');
    expect(SWEEP_LINE_CODES.python.join('\n')).toContain('total_area');
    expect(SWEEP_LINE_CODES.javascript.join('\n')).toContain('totalArea');

    for (const [, line] of Object.entries(SWEEP_LINE_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildSweepLineSteps(singleRect);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderSweepLineCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('二维平面矩形投影与扫描线位置');
    expect(container.innerHTML).toContain('扫描线切片积分计算');
  });
});
