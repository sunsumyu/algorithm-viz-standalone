import { describe, it, expect } from 'vitest';
import {
  buildRecursiveSteps,
  buildTTSteps,
  buildIterativeSteps,
  parseAndBuild,
  resolveMode,
} from './tree-traversal-step-compiler';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';

describe('tree-traversal-step-compiler', () => {
  const sampleTree = buildTreeFromArr([1, 2, 3, 4, 5, 6, 7]);

  it('buildRecursiveSteps matches preorder traversal', () => {
    const steps = buildRecursiveSteps(sampleTree, 'pre');
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.result).toEqual([1, 2, 4, 5, 3, 6, 7]);
  });

  it('buildRecursiveSteps matches inorder and postorder traversal', () => {
    const inSteps = buildRecursiveSteps(sampleTree, 'in');
    expect(inSteps[inSteps.length - 1].result).toEqual([4, 2, 5, 1, 6, 3, 7]);

    const postSteps = buildRecursiveSteps(sampleTree, 'post');
    expect(postSteps[postSteps.length - 1].result).toEqual([4, 5, 2, 6, 7, 3, 1]);
  });

  it('buildTTSteps alias works identically to buildRecursiveSteps', () => {
    const steps = buildTTSteps(sampleTree, 'pre');
    expect(steps[steps.length - 1].result).toEqual([1, 2, 4, 5, 3, 6, 7]);
  });

  it('buildIterativeSteps matches preorder, inorder, and postorder', () => {
    const preSteps = buildIterativeSteps(sampleTree, 'pre');
    expect(preSteps[preSteps.length - 1].result).toEqual([1, 2, 4, 5, 3, 6, 7]);

    const inSteps = buildIterativeSteps(sampleTree, 'in');
    expect(inSteps[inSteps.length - 1].result).toEqual([4, 2, 5, 1, 6, 3, 7]);

    const postSteps = buildIterativeSteps(sampleTree, 'post');
    expect(postSteps[postSteps.length - 1].result).toEqual([4, 5, 2, 6, 7, 3, 1]);
  });

  it('handles empty tree correctly', () => {
    const emptyStepsRec = buildRecursiveSteps(null, 'pre');
    expect(emptyStepsRec[emptyStepsRec.length - 1].result).toEqual([]);

    const emptyStepsIter = buildIterativeSteps(null, 'pre');
    expect(emptyStepsIter[emptyStepsIter.length - 1].result).toEqual([]);
  });

  it('parseAndBuild and resolveMode utility tests', () => {
    const tree = parseAndBuild({ 'input-tree': '1, 2, 3' });
    expect(tree).not.toBeNull();
    expect(tree?.val).toBe(1);

    expect(resolveMode('in')).toBe('in');
    expect(resolveMode('post')).toBe('post');
    expect(resolveMode('unknown')).toBe('pre');
  });
});
