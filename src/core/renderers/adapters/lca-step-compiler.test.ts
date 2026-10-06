import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  LcaStepCompiler,
  buildLCASteps,
  buildLcaStage2ParentMapSteps,
  buildLcaStage3PathSteps,
} from './lca-step-compiler';

describe('LcaStepCompiler', () => {
  const treeArr = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4];

  it('Stage 1 (后序汇聚): 标准双侧节点 p=5, q=1 汇聚至根节点 3', () => {
    const root = buildTreeFromArr(treeArr);
    const steps = buildLCASteps(root, 5, 1);
    expect(steps.length).toBeGreaterThan(10);
    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.lcaResult).toBe(3);
    expect(last.callTrace).toBeDefined();
    expect(last.callTrace?.finalResult).toBe('Node(3)');
  });

  it('Stage 1 (后序汇聚): 同侧包含 p=5, q=4 应收敛于 5', () => {
    const root = buildTreeFromArr(treeArr);
    const steps = buildLCASteps(root, 5, 4);
    const last = steps[steps.length - 1];
    expect(last.lcaResult).toBe(5);
  });

  it('Stage 2 (父指针哈希表): p=5, q=1 正确记录父节点并在 visited 集合相交于 3', () => {
    const root = buildTreeFromArr(treeArr);
    const steps = buildLcaStage2ParentMapSteps(root, 5, 1);
    expect(steps.length).toBeGreaterThan(5);
    const last = steps[steps.length - 1];
    expect(last.lcaResult).toBe(3);
    expect(last.visitedAncestors).toContain(5);
    expect(last.parentMap?.[5]).toBe(3);
    expect(last.parentMap?.[1]).toBe(3);
  });

  it('Stage 2 (父指针哈希表): 同侧包含 p=5, q=4 应锁定 5 为 LCA', () => {
    const root = buildTreeFromArr(treeArr);
    const steps = buildLcaStage2ParentMapSteps(root, 5, 4);
    const last = steps[steps.length - 1];
    expect(last.lcaResult).toBe(5);
  });

  it('Stage 3 (显式双路径交汇): p=5, q=1 正确提取 Path P 与 Path Q 并于 3 处分叉', () => {
    const root = buildTreeFromArr(treeArr);
    const steps = buildLcaStage3PathSteps(root, 5, 1);
    expect(steps.length).toBeGreaterThan(5);
    const last = steps[steps.length - 1];
    expect(last.lcaResult).toBe(3);
    expect(last.pathP).toEqual([3, 5]);
    expect(last.pathQ).toEqual([3, 1]);
  });

  it('Stage 3 (显式双路径交汇): 同侧包含 p=5, q=4 正确比对且前缀收敛于 5', () => {
    const root = buildTreeFromArr(treeArr);
    const steps = buildLcaStage3PathSteps(root, 5, 4);
    const last = steps[steps.length - 1];
    expect(last.lcaResult).toBe(5);
    expect(last.pathP).toEqual([3, 5]);
    expect(last.pathQ).toEqual([3, 5, 2, 4]);
  });

  it('空树特判: root=null 时所有阶段均安全返回 null', () => {
    expect(buildLCASteps(null, 5, 1).pop()?.lcaResult).toBeNull();
    expect(buildLcaStage2ParentMapSteps(null, 5, 1).pop()?.lcaResult).toBeNull();
    expect(buildLcaStage3PathSteps(null, 5, 1).pop()?.lcaResult).toBeNull();
  });

  it('深模块 LcaStepCompiler 门面静态委托调用一致', () => {
    const root = buildTreeFromArr([1, 2, 3]);
    const s1 = LcaStepCompiler.compilePostorderSteps(root, 2, 3);
    expect(s1.pop()?.lcaResult).toBe(1);

    const s2 = LcaStepCompiler.compileParentMapSteps(root, 2, 3);
    expect(s2.pop()?.lcaResult).toBe(1);

    const s3 = LcaStepCompiler.compilePathTraceSteps(root, 2, 3);
    expect(s3.pop()?.lcaResult).toBe(1);
  });
});
