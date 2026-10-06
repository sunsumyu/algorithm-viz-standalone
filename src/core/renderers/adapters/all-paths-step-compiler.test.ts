import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  AllPathsStepCompiler,
  buildAllPathsStage1BacktrackSteps,
  buildAllPathsStage2FunctionalSteps,
  buildAllPathsStage3BfsSteps,
  buildAllPathsSteps,
} from './all-paths-step-compiler';

describe('AllPathsStepCompiler', () => {
  const treeArr = [1, 2, 3, null, 5];

  it('Stage 1 (回溯法): [1, 2, 3, null, 5] 收集所有路径并带完整 callTrace 快照', () => {
    const root = buildTreeFromArr(treeArr);
    const steps = buildAllPathsStage1BacktrackSteps(root);
    expect(steps.length).toBeGreaterThan(10);
    const last = steps[steps.length - 1];
    expect(last.allPaths).toEqual(['1->2->5', '1->3']);
    expect(last.callTrace).toBeDefined();
    expect(last.callTrace?.finalResult).toBe(2);
  });

  it('Stage 1 边界: 单节点树 [1] 收集 ["1"]', () => {
    const root = buildTreeFromArr([1]);
    const steps = buildAllPathsStage1BacktrackSteps(root);
    expect(steps.pop()?.allPaths).toEqual(['1']);
  });

  it('Stage 2 (纯函数递归): 不可变字符串传递收集相同路径', () => {
    const root = buildTreeFromArr(treeArr);
    const steps = buildAllPathsStage2FunctionalSteps(root);
    expect(steps.length).toBeGreaterThan(10);
    const last = steps[steps.length - 1];
    expect(last.allPaths).toEqual(['1->2->5', '1->3']);
  });

  it('Stage 3 (BFS双队列): 层序队列遍历收集相同路径集合', () => {
    const root = buildTreeFromArr(treeArr);
    const steps = buildAllPathsStage3BfsSteps(root);
    expect(steps.length).toBeGreaterThan(10);
    const last = steps[steps.length - 1];
    expect(last.allPaths.slice().sort()).toEqual(['1->2->5', '1->3'].sort());
  });

  it('空树特判: 所有阶段均安全返回空列表 []', () => {
    expect(buildAllPathsStage1BacktrackSteps(null).pop()?.allPaths).toEqual([]);
    expect(buildAllPathsStage2FunctionalSteps(null).pop()?.allPaths).toEqual([]);
    expect(buildAllPathsStage3BfsSteps(null).pop()?.allPaths).toEqual([]);
    expect(buildAllPathsSteps(null).pop()?.allPaths).toEqual([]);
  });

  it('深模块 AllPathsStepCompiler 门面静态委托调用一致', () => {
    const root = buildTreeFromArr([1]);
    expect(AllPathsStepCompiler.compileBacktrackSteps(root).pop()?.allPaths).toEqual(['1']);
    expect(AllPathsStepCompiler.compileFunctionalSteps(root).pop()?.allPaths).toEqual(['1']);
    expect(AllPathsStepCompiler.compileBfsSteps(root).pop()?.allPaths).toEqual(['1']);
  });
});
