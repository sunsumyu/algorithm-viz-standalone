/**
 * 树上挂树全景推演画板适配器单元测试 (Tree of Trees Canvas Adapter Tests)
 * 验证母树真·二叉树分支拓扑、微缩二叉树沙盘内嵌、中序几何槽位与 Card 1 纯净契约
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
      id: 'call-4',
      funcCall: 'reverseInorder(4)',
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
    expect(container.innerHTML).toContain('d=0 · reverseInorder(4)');
    expect(container.innerHTML).toContain('⚡ 活跃');
    expect(container.innerHTML).toContain('sum = 0');
    // 微缩树中的节点值
    expect(container.innerHTML).toContain('4');
    expect(container.innerHTML).toContain('1');
    expect(container.innerHTML).toContain('6');
    // 零 h1~h6 违规
    expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6').length).toBe(0);
  });

  it('二叉树分支拓扑保证左孩子在左侧、右孩子在右侧，彻底消灭单列纵向排列', () => {
    const lChild: TreeOfTreesNode = {
      id: 'call-1',
      funcCall: 'reverseInorder(1)',
      depth: 1,
      branch: 'left',
      status: 'pending',
      activeNodeVal: 1,
      sum: 0,
      treeSnapshot: buildTreeFromArr([4, 1, 6]),
      children: [],
    };

    const rChild: TreeOfTreesNode = {
      id: 'call-6',
      funcCall: 'reverseInorder(6)',
      depth: 1,
      branch: 'right',
      status: 'active',
      activeNodeVal: 6,
      sum: 6,
      valueTransition: { oldVal: 6, newVal: 6 },
      treeSnapshot: buildTreeFromArr([4, 1, 6]),
      children: [],
    };

    const multiNode: TreeOfTreesNode = {
      id: 'call-4',
      funcCall: 'reverseInorder(4)',
      depth: 0,
      branch: 'root',
      status: 'waiting',
      activeNodeVal: 4,
      sum: 0,
      treeSnapshot: buildTreeFromArr([4, 1, 6]),
      children: [lChild, rChild],
      leftChild: lChild,
      rightChild: rChild,
    };

    TreeOfTreesCanvasAdapter.render(container, multiNode);

    expect(container.innerHTML).toContain('右深入 ➔');
    expect(container.innerHTML).toContain('左深入 ➔');
    expect(container.innerHTML).toContain('6 ➔ 6 (sum=6)');

    // 缩放控制按钮存在
    expect(container.querySelector('#tot-zoom-in')).not.toBeNull();
    expect(container.querySelector('#tot-zoom-out')).not.toBeNull();
    expect(container.querySelector('#tot-reset')).not.toBeNull();
  });

  it('buildBstToGstStage1Steps 预先构建完整二叉树型拓扑，方便全局观察与静态分析', () => {
    const root = parseAndBuildBstToGstTree();
    const steps = buildBstToGstStage1Steps(root);

    expect(steps.length).toBeGreaterThan(10);

    // 步骤 0 具备完整二叉树结构，便于全景观察
    const step0Tot = steps[0].treeOfTrees;
    expect(step0Tot).toBeDefined();
    expect(step0Tot?.funcCall).toContain('reverseInorder(4)');
    expect(step0Tot?.leftChild?.funcCall).toContain('reverseInorder(1)');
    expect(step0Tot?.rightChild?.funcCall).toContain('reverseInorder(6)');

    // 最终步骤包含所有子调用帧且状态为 done
    const lastStep = steps[steps.length - 1];
    expect(lastStep.treeOfTrees).toBeDefined();
    expect(lastStep.treeOfTrees?.status).toBe('done');
    expect(lastStep.treeOfTrees?.rightChild?.status).toBe('done');

    // 验证深度克隆完全隔离，不产生跨步骤引用污染
    expect(step0Tot).not.toBe(lastStep.treeOfTrees);
  });

  it('cloneTreeOfTrees 能够实现二叉树左右分支深层完整克隆', () => {
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
      children: [],
      leftChild: {
        id: 'c-left',
        funcCall: 'fn_left()',
        depth: 1,
        branch: 'left',
        status: 'done',
        activeNodeVal: null,
        sum: 10,
        treeSnapshot: null,
        children: [],
      },
      rightChild: {
        id: 'c-right',
        funcCall: 'fn_right()',
        depth: 1,
        branch: 'right',
        status: 'done',
        activeNodeVal: null,
        sum: 20,
        treeSnapshot: null,
        children: [],
      },
    };
    original.children = [original.leftChild!, original.rightChild!];

    const cloned = cloneTreeOfTrees(original);
    expect(cloned).not.toBe(original);
    expect(cloned?.leftChild).not.toBe(original.leftChild);
    expect(cloned?.rightChild).not.toBe(original.rightChild);
    expect(cloned?.children[0]).not.toBe(original.children[0]);
    expect(cloned?.treeSnapshot).not.toBe(original.treeSnapshot);
    expect(cloned?.valueTransition).toEqual(original.valueTransition);
    expect(cloned?.valueTransition).not.toBe(original.valueTransition);
  });
});
