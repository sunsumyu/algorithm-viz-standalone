// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  buildPSSteps,
  buildPathSumStage2BacktrackSteps,
  buildPathSumStage3BfsSteps,
  collectTreeValues,
  parsePathSumInputs,
} from './path-sum-step-compiler';
import {
  PathSumCanvasAdapter,
  renderPathSumCanvas,
  renderStage1CustomMetrics,
  renderStage2CustomMetrics,
  renderStage3CustomMetrics,
} from './path-sum-canvas-adapter';
import {
  PATH_SUM_STAGE1_CODE,
  PATH_SUM_STAGE2_BACKTRACK_CODE,
  PATH_SUM_STAGE3_BFS_CODE,
} from '../../../algorithms/categories/tree/path-sum-stage-codes';

describe('PathSumStepCompiler & CanvasAdapter (Deep Module Contracts)', () => {
  it('collectTreeValues 正确收集树的所有节点值', () => {
    const root = buildTreeFromArr([5, 4, 8, 11, null, 13, 4]);
    const vals = collectTreeValues(root);
    expect(vals).toEqual([5, 4, 11, 8, 13, 4]);
    expect(collectTreeValues(null)).toEqual([]);
  });

  it('parsePathSumInputs 支持默认参数与自定义传参', () => {
    const parsedDefault = parsePathSumInputs({});
    expect(parsedDefault.root).not.toBeNull();
    expect(parsedDefault.targetSum).toBe(22);

    const parsedCustom = parsePathSumInputs({
      'input-tree': '1, 2, 3',
      'input-target-sum': 4,
    });
    expect(parsedCustom.root?.val).toBe(1);
    expect(parsedCustom.targetSum).toBe(4);
  });

  describe('Stage 1: 递归减法回溯 (LC 112)', () => {
    it('空树返回安全判定与 callTrace', () => {
      const steps = buildPSSteps(null, 10);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.found).toBe(false);
      expect(last.action).toBe('done');
      expect(last.callTrace).toBeDefined();
    });

    it('有效路径存在时返回 found=true 且覆盖四语言行号与五段式生命周期', () => {
      const root = buildTreeFromArr([5, 4, 8, 11, null, 13, 4, 7, 2]);
      const steps = buildPSSteps(root, 22);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.found).toBe(true);
      expect(last.action).toBe('done');
      expect(last.highlightedNodes).toEqual([5, 4, 11, 2]);

      const javaLines = steps.map((s) => (s.codeLine as Record<string, number>)?.java);
      expect(javaLines).toContain(2); // entry
      expect(javaLines).toContain(3); // nullCheck
      expect(javaLines).toContain(4); // leafCheck
      expect(javaLines).toContain(5); // match
      expect(javaLines).toContain(7); // recurseLeft / leftDone
      expect(javaLines).toContain(10); // done

      steps.forEach((step, idx) => {
        expect(step.callTrace, `Step ${idx} 必须具有 callTrace`).toBeDefined();
      });
    });

    it('无匹配路径时返回 found=false', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildPSSteps(root, 10);
      const last = steps[steps.length - 1];
      expect(last.found).toBe(false);
      expect(last.action).toBe('done');
    });
  });

  describe('Stage 2: 回溯现场恢复与全解收集 (LC 113 / Class 037)', () => {
    it('空树返回空解集', () => {
      const steps = buildPathSumStage2BacktrackSteps(null, 22);
      const last = steps[steps.length - 1];
      expect(last.found).toBe(false);
      expect(last.allPaths).toEqual([]);
    });

    it('正确收集全部有效解路径并执行显式现场恢复', () => {
      const root = buildTreeFromArr([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]);
      const steps = buildPathSumStage2BacktrackSteps(root, 22);
      expect(steps.length).toBeGreaterThan(0);

      const hasBacktrack = steps.some((s) => s.action === 'backtrack');
      expect(hasBacktrack).toBe(true);

      const last = steps[steps.length - 1];
      expect(last.found).toBe(true);
      expect(last.allPaths).toEqual([
        [5, 4, 11, 2],
        [5, 8, 4, 5],
      ]);
      expect(last.highlightedNodes).toEqual(expect.arrayContaining([5, 4, 11, 2, 8, 4, 5]));
    });
  });

  describe('Stage 3: 迭代 BFS 双队列 (Iterative BFS)', () => {
    it('空树返回 false', () => {
      const steps = buildPathSumStage3BfsSteps(null, 22);
      const last = steps[steps.length - 1];
      expect(last.found).toBe(false);
    });

    it('队列 BFS 命中叶子节点并正确追踪 nodeQueue 和 sumQueue', () => {
      const root = buildTreeFromArr([5, 4, 8, 11, null, 13, 4, 7, 2]);
      const steps = buildPathSumStage3BfsSteps(root, 22);
      expect(steps.length).toBeGreaterThan(0);

      const initStep = steps.find((s) => s.action === 'init');
      expect(initStep?.nodeQueue).toEqual([5]);
      expect(initStep?.sumQueue).toEqual([5]);

      const last = steps[steps.length - 1];
      expect(last.found).toBe(true);
      expect(last.highlightedNodes).toEqual([5, 4, 11, 2]);
    });

    it('队列 BFS 搜索完全无解时安全返回 false', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildPathSumStage3BfsSteps(root, 100);
      const last = steps[steps.length - 1];
      expect(last.found).toBe(false);
      expect(last.action).toBe('done');
    });
  });

  describe('PathSumCanvasAdapter 表现层渲染契约', () => {
    it('renderCanvas 能正常挂载与更新 SVG 节点', () => {
      const container = document.createElement('div');
      const root = buildTreeFromArr([5, 4, 8]);
      const steps = buildPSSteps(root, 9);

      renderPathSumCanvas(container, steps[0]);
      expect(container.querySelector('svg')).not.toBeNull();

      renderPathSumCanvas(container, steps[steps.length - 1]);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renderStage1CustomMetrics 正常渲染调用栈与差额指标', () => {
      const container = document.createElement('div');
      const root = buildTreeFromArr([5, 4, 8]);
      const steps = buildPSSteps(root, 9);
      renderStage1CustomMetrics(container, steps[0]);
      expect(container.innerHTML).toContain('当前节点');
      expect(container.innerHTML).toContain('剩余需求');
    });

    it('renderStage2CustomMetrics 正常渲染回溯现场栈与解集指标', () => {
      const container = document.createElement('div');
      const root = buildTreeFromArr([5, 4, 8]);
      const steps = buildPathSumStage2BacktrackSteps(root, 9);
      renderStage2CustomMetrics(container, steps[steps.length - 1]);
      expect(container.innerHTML).toContain('当前路径栈');
      expect(container.innerHTML).toContain('已收集有效路径总集');
    });

    it('renderStage3CustomMetrics 正常渲染双队列监视器', () => {
      const container = document.createElement('div');
      const root = buildTreeFromArr([5, 4, 8]);
      const steps = buildPathSumStage3BfsSteps(root, 9);
      renderStage3CustomMetrics(container, steps[0]);
      expect(container.innerHTML).toContain('nodeQueue');
      expect(container.innerHTML).toContain('sumQueue');
    });
  });
});
