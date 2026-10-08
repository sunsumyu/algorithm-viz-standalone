import { describe, it, expect } from 'vitest';
import {
  parseTreeFromArray,
  buildTreeCameraSteps,
  TREE_CAMERAS_CODE_LINES,
} from './tree-cameras-step-compiler';

describe('Tree Cameras Step Compiler', () => {
  it('handles empty tree', () => {
    const steps = buildTreeCameraSteps(null);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].cameraCount).toBe(0);
  });

  it('correctly places cameras for standard tree [0, 0, null, 0, 0]', () => {
    const root = parseTreeFromArray([0, 0, null, 0, 0]);
    expect(root).not.toBeNull();
    const steps = buildTreeCameraSteps(root);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.cameraCount).toBe(1);
  });

  it('correctly handles root without coverage requiring extra camera [0]', () => {
    const root = parseTreeFromArray([0]);
    const steps = buildTreeCameraSteps(root);
    const last = steps[steps.length - 1];
    expect(last.cameraCount).toBe(1);
  });

  it('has code lines defined for all four languages', () => {
    expect(TREE_CAMERAS_CODE_LINES.guard).toBeDefined();
    expect(TREE_CAMERAS_CODE_LINES.enter).toBeDefined();
    expect(TREE_CAMERAS_CODE_LINES.placeCamera).toBeDefined();
  });
});
