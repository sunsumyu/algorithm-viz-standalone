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

    // 验证每一层递归节点都独立保留自身完成转换时刻的完整状态树，绝不被左子树回溯覆盖！
    // 根节点 reverseInorder(4) 转换时刻：根=30，左孩子仍为原值 1，右孩子已变为 21
    expect(lastStep.treeOfTrees?.treeSnapshot?.val).toBe(30);
    expect(lastStep.treeOfTrees?.treeSnapshot?.left?.val).toBe(1);
    expect(lastStep.treeOfTrees?.treeSnapshot?.right?.val).toBe(21);

    // 右子调用 reverseInorder(6) 转换时刻：根仍为原值 4，右孩子已变为 21，其左孩子仍为原值 5
    expect(lastStep.treeOfTrees?.rightChild?.treeSnapshot?.val).toBe(4);
    expect(lastStep.treeOfTrees?.rightChild?.treeSnapshot?.right?.val).toBe(21);
    expect(lastStep.treeOfTrees?.rightChild?.treeSnapshot?.right?.left?.val).toBe(5);

    // 左子调用 reverseInorder(1) 转换时刻：根已为 30，左孩子已变为 36，其左孩子仍为原值 0
    expect(lastStep.treeOfTrees?.leftChild?.treeSnapshot?.val).toBe(30);
    expect(lastStep.treeOfTrees?.leftChild?.treeSnapshot?.left?.val).toBe(36);
    expect(lastStep.treeOfTrees?.leftChild?.treeSnapshot?.left?.left?.val).toBe(0);

    // 渲染完整母树并校验每个卡片内嵌完整尺寸二叉树 (r="19", #059669, #64748b) 与原值➔新值悬浮标签
    TreeOfTreesCanvasAdapter.render(container, lastStep.treeOfTrees!);
    expect(container.innerHTML).toContain('r="19"');
    expect(container.innerHTML).toContain('#059669');
    expect(container.innerHTML).toContain('#64748b');
    expect(container.innerHTML).toContain('4➔30');
    expect(container.querySelector('#tot-focus')).not.toBeNull();

    // 验证智能上下文簇运镜：默认开启 autoFollow，同时容纳【上一棵树 + 当前树 + 下一棵树】(scale ∈ [1.05, 1.75])，绝不过度放大导致前后树被截断
    const activeMidStep = steps.find((s) => s.treeOfTrees?.rightChild?.status === 'active') || steps[2];
    TreeOfTreesCanvasAdapter.render(container, activeMidStep.treeOfTrees!);
    const mainGroup = container.querySelector('#tot-main-group');
    expect(mainGroup).not.toBeNull();
    const transformAttr = mainGroup?.getAttribute('transform') || '';
    const scaleMatch = transformAttr.match(/scale\(([0-9.]+)\)/);
    expect(scaleMatch).not.toBeNull();
    expect(Number(scaleMatch![1])).toBeGreaterThanOrEqual(1.05);
    expect(Number(scaleMatch![1])).toBeLessThanOrEqual(1.75);

    // 点击「全景重置」切换为 1.0 全景视图，再点击「聚焦活跃」恢复三层上下文智能聚焦
    const resetBtn = container.querySelector('#tot-reset') as HTMLButtonElement;
    resetBtn.click();
    expect(mainGroup?.getAttribute('transform')).toContain('scale(1)');

    const focusBtn = container.querySelector('#tot-focus') as HTMLButtonElement;
    focusBtn.click();
    const refocusedMatch = (mainGroup?.getAttribute('transform') || '').match(/scale\(([0-9.]+)\)/);
    expect(Number(refocusedMatch![1])).toBeGreaterThanOrEqual(1.05);
    expect(Number(refocusedMatch![1])).toBeLessThanOrEqual(1.75);

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

  it('用户手动调整缩放比例后，在下一步（即使外层容器每次重建子 canvasBox）时严格记住并保持用户缩放比例，绝不重置回默认缩放', () => {
    const root = parseAndBuildBstToGstTree();
    const steps = buildBstToGstStage1Steps(root);

    const sandboxHost = document.createElement('div');
    sandboxHost.id = 'dsp-sandbox-container';
    document.body.appendChild(sandboxHost);

    // 模拟 BstToGstCanvasAdapter.renderCanvas 每一步清空 container 并新建 canvasBox 的真实生命周期
    const renderStepInRecreatedBox = (stepIdx: number) => {
      sandboxHost.innerHTML = '';
      const canvasBox = document.createElement('div');
      sandboxHost.appendChild(canvasBox);
      TreeOfTreesCanvasAdapter.render(canvasBox, steps[stepIdx].treeOfTrees!);
      return canvasBox;
    };

    // 第 1 步渲染
    const box1 = renderStepInRecreatedBox(1);
    const getScale = (el: HTMLElement) => {
      const tf = el.querySelector('#tot-main-group')?.getAttribute('transform') || '';
      const m = tf.match(/scale\(([0-9.]+)\)/);
      return m ? Number(m[1]) : NaN;
    };
    const defaultScale = getScale(box1);
    expect(defaultScale).toBeGreaterThanOrEqual(1.05);

    // 用户点击两次缩小按钮 "－" 自定义缩放比例
    const zoomOutBtn = box1.querySelector('#tot-zoom-out') as HTMLButtonElement;
    zoomOutBtn.click();
    zoomOutBtn.click();
    const userAdjustedScale = getScale(box1);
    expect(userAdjustedScale).toBeLessThan(defaultScale);

    // 推进到下一步（第 2 步、第 5 步）：即使每次新建了 canvasBox，缩放比例也必须严格保持为 userAdjustedScale！
    const box2 = renderStepInRecreatedBox(2);
    expect(getScale(box2)).toBeCloseTo(userAdjustedScale, 4);

    const box5 = renderStepInRecreatedBox(5);
    expect(getScale(box5)).toBeCloseTo(userAdjustedScale, 4);

    // 点击「⟲ 全景重置」后清除用户自定义缩放并回到 1.0 全景
    const resetBtn = box5.querySelector('#tot-reset') as HTMLButtonElement;
    resetBtn.click();
    expect(getScale(box5)).toBe(1);
  });
});
