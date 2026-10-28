/**
 * 树上挂树全景推演画板适配器单元测试 (Tree of Trees Canvas Adapter Tests)
 * 验证母树调用拓扑、微缩二叉树沙盘内嵌、深层递归分支展开与 Card 1 纯净契约
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  TreeOfTreesCanvasAdapter,
  TreeOfTreesNode,
} from './tree-of-trees-canvas-adapter';
import {
  buildBstToGstStage1Steps,
  parseAndBuildBstToGstTree,
  cloneTreeOfTrees,
} from './bst-to-gst-step-compiler';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';

describe('TreeOfTreesCanvasAdapter & StepCompiler Integration', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  it('当 rootNode 为 null 时，优雅渲染空占位状态且无异常崩溃', () => {
    TreeOfTreesCanvasAdapter.render(container, null);
    expect(container.innerHTML).toContain('暂无调用推演数据');
    expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6').length).toBe(0);
  });

  it('单节点母树渲染高保真卡片与微缩二叉树 SVG', () => {
    const singleNode: TreeOfTreesNode = {
      id: 'call-1',
      funcCall: 'convertBST(4)',
      depth: 0,
      branch: 'root',
      status: 'active',
      activeNodeVal: 4,
      sum: 0,
      treeSnapshot: buildTreeFromArr([4, 1, 6]),
      children: [],
    };

    TreeOfTreesCanvasAdapter.render(container, singleNode);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(container.innerHTML).toContain('d=0 · convertBST(4)');
    expect(container.innerHTML).toContain('⚡ 活跃');
    expect(container.innerHTML).toContain('sum = 0');
    // 微缩树中的节点值
    expect(container.innerHTML).toContain('4');
    expect(container.innerHTML).toContain('1');
    expect(container.innerHTML).toContain('6');
    // 零 h1~h6 违规
    expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6').length).toBe(0);
  });

  it('多层级分支母树正确绘制平滑连接枝干与分支走向标签', () => {
    const multiNode: TreeOfTreesNode = {
      id: 'call-1',
      funcCall: 'convertBST(4)',
      depth: 0,
      branch: 'root',
      status: 'waiting',
      activeNodeVal: 4,
      sum: 0,
      treeSnapshot: buildTreeFromArr([4, 1, 6]),
      children: [
        {
          id: 'call-2',
          funcCall: 'reverseInorder(6)',
          depth: 1,
          branch: 'right',
          status: 'active',
          activeNodeVal: 6,
          sum: 6,
          valueTransition: { oldVal: 6, newVal: 6 },
          treeSnapshot: buildTreeFromArr([4, 1, 6]),
          children: [],
        },
        {
          id: 'call-3',
          funcCall: 'reverseInorder(null)',
          depth: 1,
          branch: 'left',
          status: 'base-null',
          activeNodeVal: null,
          sum: 0,
          treeSnapshot: buildTreeFromArr([4, 1, 6]),
          children: [],
        },
      ],
    };

    TreeOfTreesCanvasAdapter.render(container, multiNode);

    expect(container.innerHTML).toContain('右深入 ➔');
    expect(container.innerHTML).toContain('左深入 ➔');
    expect(container.innerHTML).toContain('🍃 触底返回 null');
    expect(container.innerHTML).toContain('6 ➔ 6 (sum=6)');

    // 缩放控制按钮存在
    expect(container.querySelector('#tot-zoom-in')).not.toBeNull();
    expect(container.querySelector('#tot-zoom-out')).not.toBeNull();
    expect(container.querySelector('#tot-reset')).not.toBeNull();
  });

  it('buildBstToGstStage1Steps 必须为经典用例的全量步骤生成合法的 treeOfTrees 数据', () => {
    const root = parseAndBuildBstToGstTree();
    const steps = buildBstToGstStage1Steps(root);

    expect(steps.length).toBeGreaterThan(10);

    // 步骤 0 具备初始根节点
    expect(steps[0].treeOfTrees).toBeDefined();
    expect(steps[0].treeOfTrees?.funcCall).toContain('convertBST');

    // 最终步骤包含所有子调用帧且状态为 done
    const lastStep = steps[steps.length - 1];
    expect(lastStep.treeOfTrees).toBeDefined();
    expect(lastStep.treeOfTrees?.status).toBe('done');
    expect(lastStep.treeOfTrees?.children.length).toBeGreaterThan(0);

    // 验证深度克隆完全隔离，不产生跨步骤引用污染
    const step1Tot = steps[0].treeOfTrees;
    const stepLastTot = lastStep.treeOfTrees;
    expect(step1Tot).not.toBe(stepLastTot);
  });

  it('cloneTreeOfTrees 能够实现深层递归结构完整克隆', () => {
    const original: TreeOfTreesNode = {
      id: 'c1',
      funcCall: 'fn()',
      depth: 0,
      branch: 'root',
      status: 'active',
      activeNodeVal: 10,
      sum: 20,
      valueTransition: { oldVal: 10, newVal: 30 },
      treeSnapshot: buildTreeFromArr([10]),
      children: [
        {
          id: 'c2',
          funcCall: 'fn_child()',
          depth: 1,
          branch: 'right',
          status: 'done',
          activeNodeVal: null,
          sum: 20,
          treeSnapshot: null,
          children: [],
        },
      ],
    };

    const cloned = cloneTreeOfTrees(original);
    expect(cloned).not.toBe(original);
    expect(cloned?.children[0]).not.toBe(original.children[0]);
    expect(cloned?.treeSnapshot).not.toBe(original.treeSnapshot);
    expect(cloned?.valueTransition).toEqual(original.valueTransition);
    expect(cloned?.valueTransition).not.toBe(original.valueTransition);
  });
});
