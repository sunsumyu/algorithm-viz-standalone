// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  buildDuplicateSubtreesStage1Steps,
  buildDuplicateSubtreesSteps,
  buildDuplicateSubtreesStage2Steps,
  buildDuplicateSubtreesStage3Steps,
  treeToNodeData,
} from './duplicate-subtrees-step-compiler';
import {
  renderDuplicateSubtreesCanvas,
  renderDuplicateSubtreesCard2,
} from './duplicate-subtrees-canvas-adapter';

describe('DuplicateSubtreesStepCompiler Deep Module Test Suite', () => {
  describe('Stage 1: 经典后序序列化与哈希查重', () => {
    it('预设案例生成有效步骤，捕获至少两组重复子树根节点', () => {
      const steps = buildDuplicateSubtreesStage1Steps();
      expect(steps.length).toBeGreaterThan(15);

      const step0 = steps[0];
      expect(step0.currentNodeId).toBeNull();
      expect(step0.duplicateRoots).toEqual([]);

      const last = steps[steps.length - 1];
      expect(last.duplicateRoots.length).toBeGreaterThanOrEqual(2);
      expect(last.decision).toContain('遍历完成');

      for (const step of steps) {
        expect(step.callTrace).toBeDefined();
        expect(step.codeLine).toBeDefined();
      }
    });

    it('别名 buildDuplicateSubtreesSteps 与 buildDuplicateSubtreesStage1Steps 行为完全一致', () => {
      const steps = buildDuplicateSubtreesSteps();
      expect(steps.length).toBeGreaterThan(15);
      const last = steps[steps.length - 1];
      expect(last.duplicateRoots.length).toBeGreaterThanOrEqual(2);
    });

    it('空树安全防御处理', () => {
      const steps = buildDuplicateSubtreesStage1Steps(null, [], null);
      expect(steps.length).toBe(2);
      expect(steps[1].decision).toContain('根节点为空');
      expect(steps[1].duplicateRoots).toEqual([]);
    });
  });

  describe('Stage 2: 三元组 UID 编码极速哈希', () => {
    it('正确生成三元组映射与 UID 频次表，精确识别重复根', () => {
      const steps = buildDuplicateSubtreesStage2Steps();
      expect(steps.length).toBeGreaterThan(15);

      const step0 = steps[0];
      expect(step0.currentNodeId).toBeNull();
      expect(step0.duplicateRoots).toEqual([]);

      const last = steps[steps.length - 1];
      expect(last.stageId).toBe('stage2');
      expect(last.duplicateRoots.length).toBeGreaterThanOrEqual(2);
      expect(last.tripletMap).toBeDefined();
      expect(Object.keys(last.tripletMap!).length).toBeGreaterThan(0);
    });

    it('空树输入安全防御处理', () => {
      const steps = buildDuplicateSubtreesStage2Steps(null, [], null);
      expect(steps.length).toBe(2);
      expect(steps[1].decision).toContain('根节点为空');
    });
  });

  describe('Stage 3: 显式单调栈迭代', () => {
    it('模拟调用栈压栈与出栈，精确完成子树签名与重复识别', () => {
      const steps = buildDuplicateSubtreesStage3Steps();
      expect(steps.length).toBeGreaterThan(15);

      const step0 = steps[0];
      expect(step0.currentNodeId).toBeNull();
      expect(step0.duplicateRoots).toEqual([]);

      const last = steps[steps.length - 1];
      expect(last.stageId).toBe('stage3');
      expect(last.duplicateRoots.length).toBeGreaterThanOrEqual(2);

      const stepsWithStack = steps.filter((s) => s.stackFrames && s.stackFrames.length > 0);
      expect(stepsWithStack.length).toBeGreaterThan(0);
    });

    it('空树输入安全防御处理', () => {
      const steps = buildDuplicateSubtreesStage3Steps(null, [], null);
      expect(steps.length).toBe(2);
      expect(steps[1].decision).toContain('空树特判');
    });
  });

  describe('自适应树布局与自定义二叉树输入', () => {
    it('treeToNodeData 正确处理任意树结构', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const res = treeToNodeData(root);
      expect(res.nodes.length).toBe(3);
      expect(res.rootId).toBe(1);

      const emptyRes = treeToNodeData(null);
      expect(emptyRes.nodes).toEqual([]);
      expect(emptyRes.rootId).toBeNull();
    });

    it('自定义无重复二叉树不产生重复结果', () => {
      const root = buildTreeFromArr([1, 2, 3]);
      const steps = buildDuplicateSubtreesStage1Steps(root);
      const last = steps[steps.length - 1];
      expect(last.duplicateRoots).toEqual([]);
    });
  });

  describe('Canvas Adapter 表现层挂载与各 Stage Card 2 渲染契约', () => {
    it('renderDuplicateSubtreesCanvas 与 renderDuplicateSubtreesCard2 正常工作无报错', () => {
      const steps1 = buildDuplicateSubtreesStage1Steps();
      const container1 = document.createElement('div');
      const container2 = document.createElement('div');

      renderDuplicateSubtreesCanvas(container1, steps1[5]);
      expect(container1.querySelector('svg')).not.toBeNull();
      expect(container1.innerHTML).toContain('● 当前遍历点');

      // Stage 1 Card 2
      renderDuplicateSubtreesCard2(container2, steps1[steps1.length - 1]);
      expect(container2.innerHTML).toContain('序列签名频次表');

      // Stage 2 Card 2
      const steps2 = buildDuplicateSubtreesStage2Steps();
      renderDuplicateSubtreesCard2(container2, steps2[steps2.length - 1]);
      expect(container2.innerHTML).toContain('三元组 (val, leftUID, rightUID) 编码表');

      // Stage 3 Card 2
      const steps3 = buildDuplicateSubtreesStage3Steps();
      renderDuplicateSubtreesCard2(container2, steps3[steps3.length - 1]);
      expect(container2.innerHTML).toContain('显式迭代栈帧');
    });
  });
});
