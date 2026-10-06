// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  buildBalancedStage1Steps,
  buildBalancedStage2PruneSteps,
  buildBalancedStage3StackSteps,
  buildBalancedTree037Steps,
  collectTreeValues,
  parseBalancedTreeInputs,
} from './balanced-binary-tree-step-compiler';
import {
  BalancedBinaryTreeCanvasAdapter,
  renderBalancedTreeCanvas,
  renderBalancedCustomMetrics,
} from './balanced-binary-tree-canvas-adapter';

describe('BalancedBinaryTreeStepCompiler & CanvasAdapter (Deep Module Contracts)', () => {
  it('collectTreeValues 正确收集树中有效节点值', () => {
    const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
    expect(collectTreeValues(root)).toEqual([3, 9, 20, 15, 7]);
    expect(collectTreeValues(null)).toEqual([]);
  });

  it('parseBalancedTreeInputs 正确解析输入参数与默认值', () => {
    const def = parseBalancedTreeInputs({});
    expect(def?.val).toBe(3);

    const custom = parseBalancedTreeInputs({ tree: '1, 2, 3' });
    expect(custom?.val).toBe(1);
  });

  describe('Stage 1: Tree DP Info 二元组递归', () => {
    it('空树返回严格 3 步且判定为 true', () => {
      const steps = buildBalancedStage1Steps(null);
      expect(steps.length).toBe(3);
      expect(steps[steps.length - 1].decision).toContain('平衡 (TRUE)');
    });

    it('平衡二叉树 [3, 9, 20, null, null, 15, 7] 正确判定为 true 且全步注入 callTrace', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBalancedStage1Steps(root);
      expect(steps.length).toBeGreaterThan(6);

      steps.forEach((step, idx) => {
        expect(step.callTrace, `Step ${idx} 必须具备 callTrace 快照`).toBeDefined();
      });

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.decision).toContain('严格平衡 (TRUE)');
    });

    it('失衡二叉树 [1, 2, 2, 3, 3, null, null, 4, 4] 正确判定为 false', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 3, null, null, 4, 4]);
      const steps = buildBalancedStage1Steps(root);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.decision).toContain('严重失衡 (FALSE)');
    });
  });

  describe('Stage 2: -1 剪枝返回值优化', () => {
    it('空树返回合法步骤', () => {
      const steps = buildBalancedStage2PruneSteps(null);
      expect(steps.length).toBe(3);
      expect(steps[steps.length - 1].decision).toContain('最终判定为平衡');
    });

    it('平衡二叉树返回有效高度', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBalancedStage2PruneSteps(root);
      const last = steps[steps.length - 1];
      expect(last.decision).toContain('全树平衡 (TRUE)');
    });

    it('失衡二叉树触发提前剪枝', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 3, null, null, 4, 4]);
      const steps = buildBalancedStage2PruneSteps(root);
      const pruneStep = steps.find((s) => s.pruned);
      expect(pruneStep).toBeDefined();

      const last = steps[steps.length - 1];
      expect(last.decision).toContain('全树失衡 (FALSE)');
    });
  });

  describe('Stage 3: 显式后序遍历与深度表映射', () => {
    it('空树安全退出', () => {
      const steps = buildBalancedStage3StackSteps(null);
      expect(steps.length).toBe(3);
      expect(steps[steps.length - 1].decision).toContain('返回 true');
    });

    it('平衡二叉树入栈出栈计算高度', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBalancedStage3StackSteps(root);
      expect(steps.length).toBeGreaterThan(6);

      const stackStep = steps.find((s) => s.stackState && s.stackState.length > 0);
      expect(stackStep).toBeDefined();

      const last = steps[steps.length - 1];
      expect(last.decision).toContain('返回 true');
    });

    it('失衡二叉树检测到高度差越界提前退出', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 3, null, null, 4, 4]);
      const steps = buildBalancedStage3StackSteps(root);
      const last = steps[steps.length - 1];
      expect(last.decision).toContain('立即返回 false');
    });
  });

  describe('向下兼容入口 buildBalancedTree037Steps', () => {
    it('无参数调用默认执行官方用例', () => {
      const steps = buildBalancedTree037Steps();
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].decision).toContain('严格平衡 (TRUE)');
    });

    it('支持非平衡用例与空树字符串', () => {
      expect(buildBalancedTree037Steps('[]').length).toBe(3);
      expect(buildBalancedTree037Steps('1,2,2,3,3,null,null,4,4')[0]).toBeDefined();
    });
  });

  describe('BalancedBinaryTreeCanvasAdapter 表现层渲染契约', () => {
    it('renderCanvas 能正常挂载 SVG 树形与空树 SVG', () => {
      const container = document.createElement('div');
      const root = buildTreeFromArr([3, 9, 20]);
      const steps = buildBalancedStage1Steps(root);

      renderBalancedTreeCanvas(container, steps[0]);
      expect(container.querySelector('svg')).not.toBeNull();

      renderBalancedTreeCanvas(container, buildBalancedStage1Steps(null)[0]);
      expect(container.innerHTML).toContain('空树 (Null)');
    });

    it('renderCustomMetrics 能正常挂载指标卡、栈状态与决策卡', () => {
      const container = document.createElement('div');
      const root = buildTreeFromArr([3, 9, 20]);
      const s1Steps = buildBalancedStage1Steps(root);
      renderBalancedCustomMetrics(container, s1Steps[0]);
      expect(container.innerHTML).toContain('当前操作动作');

      const s3Steps = buildBalancedStage3StackSteps(root);
      renderBalancedCustomMetrics(container, s3Steps.find((s) => s.stackState && s.stackState.length > 0)!);
      expect(container.innerHTML).toContain('后序显式栈');
    });
  });
});
