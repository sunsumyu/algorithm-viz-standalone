import { describe, it, expect } from 'vitest';
import {
  buildDynamicSegTreeSteps,
  DYNAMIC_SEGMENT_TREE_CODES,
  DYNAMIC_SEGMENT_TREE_LINES,
} from './dynamic-segment-tree-step-compiler';
import { renderDynamicSegmentTreeCanvas } from './dynamic-segment-tree-canvas-adapter';

describe('DynamicSegmentTree 111 Step Compiler & Canvas Adapter', () => {
  const ql = 120;
  const qr = 350;
  const val = 5;
  const domain = 1000;

  it('should generate valid dynamic allocation steps', () => {
    const steps = buildDynamicSegTreeSteps(ql, qr, val, domain);

    expect(steps.length).toBeGreaterThan(3);

    // Initial step
    expect(steps[0].codeLine).toEqual(DYNAMIC_SEGMENT_TREE_LINES.entry);
    expect(steps[0].queryL).toBe(ql);
    expect(steps[0].queryR).toBe(qr);
    expect(steps[0].totalAllocated).toBe(1);

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.decision).toContain('动态开点修改完成');
    expect(lastStep.statusBadge?.type).toBe('success');
    expect(lastStep.totalAllocated).toBeLessThan(100);

    // All steps have nodes and valid codeLine
    for (const step of steps) {
      expect(step.nodes.length).toBeGreaterThan(0);
      expect(step.activeNodeId).toBeGreaterThan(0);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('should contain 1-based code lines across languages', () => {
    expect(DYNAMIC_SEGMENT_TREE_CODES.java.join('\n')).toContain('updateDynamic');
    expect(DYNAMIC_SEGMENT_TREE_CODES.cpp.join('\n')).toContain('updateDynamic');
    expect(DYNAMIC_SEGMENT_TREE_CODES.python.join('\n')).toContain('update_dynamic');
    expect(DYNAMIC_SEGMENT_TREE_CODES.javascript.join('\n')).toContain('updateDynamic');

    for (const [, line] of Object.entries(DYNAMIC_SEGMENT_TREE_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildDynamicSegTreeSteps(ql, qr, val, domain);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderDynamicSegmentTreeCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('动态开点内存监控');
  });
});
