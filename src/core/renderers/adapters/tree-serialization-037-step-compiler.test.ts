import { describe, it, expect } from 'vitest';
import {
  collectTreeValues,
  buildStage1PostorderSteps,
  buildStage2LevelorderSteps,
  buildStage3AmbiguitySteps,
  generateSerializationSteps,
} from './tree-serialization-037-step-compiler';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';

describe('tree-serialization-037-step-compiler', () => {
  it('collectTreeValues collects all non-null values via BFS', () => {
    const tree = buildTreeFromArr([1, 2, 3, 4, null, null, 5]);
    const vals = collectTreeValues(tree);
    expect(vals).toEqual([1, 2, 3, 4, 5]);
  });

  it('buildStage1PostorderSteps (serialize) outputs correct tokens', () => {
    const steps = buildStage1PostorderSteps('serialize');
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.tokenStream).toEqual(['#', '#', '4', '#', '2', '#', '#', '5', '3', '1']);
    expect(last.mode).toBe('serialize');
    expect(last.stageId).toBe('stage-1');
  });

  it('buildStage1PostorderSteps (deserialize) completes tree reconstruction', () => {
    const steps = buildStage1PostorderSteps('deserialize');
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.tree).not.toBeNull();
    expect(last.tree?.val).toBe(1);
    expect(last.constructedNodes.length).toBe(5);
  });

  it('generateSerializationSteps aliases to buildStage1PostorderSteps', () => {
    const steps = generateSerializationSteps('deserialize');
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].constructedNodes.length).toBe(5);
  });

  it('buildStage2LevelorderSteps outputs correct level tokens', () => {
    const steps = buildStage2LevelorderSteps();
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.tokenStream).toEqual(['1', '2', '3', '#', '4', '5', '#', '#', '#', '#', '#']);
    expect(last.stageId).toBe('stage-2');
  });

  it('buildStage3AmbiguitySteps demonstrates non-injective counterexample', () => {
    const steps = buildStage3AmbiguitySteps();
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.decision).toContain('中序序列化不具备单射性');
    expect(last.stageId).toBe('stage-3');
  });
});
