// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { TreeDepthStepCompiler } from './tree-depth-step-compiler';
import { TreeDepthCanvasAdapter } from './tree-depth-canvas-adapter';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';

describe('TreeDepthStepCompiler & TreeDepthCanvasAdapter', () => {
  describe('TreeDepthStepCompiler: Max Depth (LC 104 / Class 036)', () => {
    it('handles null root correctly across all stages', () => {
      const s1 = TreeDepthStepCompiler.compileMaxDepthStage1Steps(null);
      expect(s1.length).toBeGreaterThan(0);
      expect(s1[s1.length - 1].maxDepth).toBe(0);

      const s2 = TreeDepthStepCompiler.compileMaxDepthStage2BfsSteps(null);
      expect(s2.length).toBeGreaterThan(0);
      expect(s2[s2.length - 1].maxDepth).toBe(0);

      const s3 = TreeDepthStepCompiler.compileMaxDepthStage3StaticArraySteps(null);
      expect(s3.length).toBeGreaterThan(0);
      expect(s3[s3.length - 1].maxDepth).toBe(0);
    });

    it('computes max depth 3 for [3, 9, 20, null, null, 15, 7]', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const s1 = TreeDepthStepCompiler.compileMaxDepthStage1Steps(root);
      expect(s1[s1.length - 1].maxDepth).toBe(3);

      const s2 = TreeDepthStepCompiler.compileMaxDepthStage2BfsSteps(root);
      expect(s2[s2.length - 1].maxDepth).toBe(3);

      const s3 = TreeDepthStepCompiler.compileMaxDepthStage3StaticArraySteps(root);
      expect(s3[s3.length - 1].maxDepth).toBe(3);
    });
  });

  describe('TreeDepthStepCompiler: Min Depth (LC 111 / Class 036)', () => {
    it('handles single child skew tree [1, 2] correctly (min depth = 2, avoiding 1 trap)', () => {
      const root = buildTreeFromArr([1, 2]);
      const s1 = TreeDepthStepCompiler.compileMinDepthStage1Steps(root);
      expect(s1[s1.length - 1].minDepth).toBe(2);

      const s2 = TreeDepthStepCompiler.compileMinDepthStage2BfsSteps(root);
      expect(s2[s2.length - 1].minDepth).toBe(2);

      const s3 = TreeDepthStepCompiler.compileMinDepthStage3StaticArraySteps(root);
      expect(s3[s3.length - 1].minDepth).toBe(2);
    });

    it('early exits on first leaf encountered in BFS', () => {
      // 根 3, 左 9 (叶子, depth=2), 右 20(15, 7)
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const s2 = TreeDepthStepCompiler.compileMinDepthStage2BfsSteps(root);
      expect(s2[s2.length - 1].minDepth).toBe(2);

      const s3 = TreeDepthStepCompiler.compileMinDepthStage3StaticArraySteps(root);
      expect(s3[s3.length - 1].minDepth).toBe(2);
    });
  });

  describe('TreeDepthCanvasAdapter', () => {
    it('collects tree node values correctly', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const vals = TreeDepthCanvasAdapter.collectTreeValues(root);
      expect(vals).toEqual([1, 2, 3]);
    });

    it('renders max depth canvas without throwing', () => {
      const container = document.createElement('div');
      const root = buildTreeFromArr([1, 2]);
      const steps = TreeDepthStepCompiler.compileMaxDepthStage1Steps(root);
      expect(() => {
        TreeDepthCanvasAdapter.renderTreeDepthCanvas(container, steps[0]);
      }).not.toThrow();
    });

    it('renders min depth canvas without throwing', () => {
      const container = document.createElement('div');
      const root = buildTreeFromArr([1, 2]);
      const steps = TreeDepthStepCompiler.compileMinDepthStage1Steps(root);
      expect(() => {
        TreeDepthCanvasAdapter.renderMinDepthCanvas(container, steps[0]);
      }).not.toThrow();
    });
  });
});
