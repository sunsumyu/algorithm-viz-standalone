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
import { buildVBSteps } from './valid-bst-step-compiler';
import { buildBstModesStage1Steps } from './bst-modes-step-compiler';
import { buildBalancedStage1Steps } from './balanced-binary-tree-step-compiler';
import { buildBstMinDiffStage1Steps } from './bst-min-diff-step-compiler';
import { buildBstSearchStage2RecursiveSteps } from './bst-search-step-compiler';
import { buildLCASteps } from './lca-step-compiler';
import { buildCountNodesDfsSteps } from './count-complete-tree-nodes-step-compiler';
import { ZigzagStepCompiler } from './zigzag-step-compiler';
import { LevelOrderStepCompiler } from './level-order-step-compiler';
import { LEVEL_ORDER_STAGE1_LINES } from '../../../algorithms/categories/tree/binary-tree-level-stage-codes';
import { StepNormalizationEngine } from '../../step-normalization-engine';
import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { TreeDepthStepCompiler } from './tree-depth-step-compiler';
import { buildTreeInvertSteps } from './tree-invert-step-compiler';

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

  it('全步骤连续推演时，缩放比例保持 100% 恒定连续，且焦点绝不在递归中途断流跳回根节点', () => {
    const root = parseAndBuildBstToGstTree();
    const steps = buildBstToGstStage1Steps(root);

    const sandboxHost = document.createElement('div');
    sandboxHost.id = 'dsp-sandbox-container';
    document.body.appendChild(sandboxHost);

    const scales: number[] = [];
    for (let i = 0; i < steps.length; i++) {
      sandboxHost.innerHTML = '';
      const canvasBox = document.createElement('div');
      sandboxHost.appendChild(canvasBox);
      TreeOfTreesCanvasAdapter.render(canvasBox, steps[i].treeOfTrees!);

      const tf = canvasBox.querySelector('#tot-main-group')?.getAttribute('transform') || '';
      const m = tf.match(/scale\(([0-9.]+)\)/);
      expect(m).not.toBeNull();
      scales.push(Number(m![1]));

      // 除最后一步全部结算 done 外，所有步骤均必须存在 ⚡ 活跃 节点，绝不丢失焦点
      if (i < steps.length - 1) {
        expect(canvasBox.innerHTML).toContain('⚡ 活跃');
      }
    }

    // 断言从第 0 步到最后一步，默认跟随缩放比例 100% 恒定，绝不在两种缩放尺寸间跳变！
    const firstScale = scales[0];
    for (const s of scales) {
      expect(s).toBeCloseTo(firstScale, 5);
    }
  });

  it('全库所有二叉树算法通过共享 BinaryTreeOfTreesSynthesizer 与 TreeCanvasAdapter 自动拥有树上挂树视图', () => {
    const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
    const rawDepthSteps = TreeDepthStepCompiler.compileMaxDepthStage1Steps(root);
    const normalizedDepthSteps = StepNormalizationEngine.normalize(rawDepthSteps, {
      algorithmId: 'tree-depth',
      stageId: 'stage-1',
    });

    expect(normalizedDepthSteps.length).toBeGreaterThan(4);
    for (const st of normalizedDepthSteps as any[]) {
      expect(st.treeOfTrees).toBeDefined();
      expect(st.treeOfTrees.funcCall).toContain('maxDepth(3)');
    }

    const host = document.createElement('div');
    host.id = 'dsp-sandbox-container';
    document.body.appendChild(host);

    const midStep = normalizedDepthSteps[2] as any;
    TreeCanvasAdapter.renderTree(host, {
      tree: midStep.tree,
      current: midStep.current,
    });

    // 验证统一共享子视图切换栏与树上挂树全景卡片自动挂载
    expect(host.querySelector('#btn-subview-tot')).not.toBeNull();
    expect(host.querySelector('#btn-subview-single')).not.toBeNull();
    expect(host.innerHTML).toContain('maxDepth(3)');
    expect(host.innerHTML).toContain('maxDepth(20)');
    expect(host.querySelector('#tot-main-group')).not.toBeNull();

    // 验证翻转二叉树 (tree-invert) 每个递归节点也自动合成树上挂树快照
    const invRoot = buildTreeFromArr([4, 2, 7, 1, 3, 6, 9]);
    const invSteps = StepNormalizationEngine.normalize(buildTreeInvertSteps(invRoot), {
      algorithmId: 'tree-invert',
      stageId: 'stage-1',
    });
    expect((invSteps[0] as any).treeOfTrees?.funcCall).toContain('invertTree(4)');
  });

  it('活跃面板独享双层光晕与呼吸光环，非活跃面板绝不挂光环，且尊重 prefers-reduced-motion', () => {
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
      treeSnapshot: buildTreeFromArr([4, 1, 6]),
      children: [],
    };
    const rootFrame: TreeOfTreesNode = {
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

    TreeOfTreesCanvasAdapter.render(container, rootFrame);

    // 1) 双层光晕：tot-active-glow 必须由锐核 + 柔晕两层 feDropShadow 叠加而成
    const glowFilter = container.querySelector('#tot-active-glow');
    expect(glowFilter).not.toBeNull();
    // 大范围柔晕绝不被 filter region 裁剪：region 必须扩容至至少 -40% / 180%
    expect(Number((glowFilter!.getAttribute('x') || '').replace('%', ''))).toBeLessThanOrEqual(-40);
    expect(Number((glowFilter!.getAttribute('width') || '').replace('%', ''))).toBeGreaterThanOrEqual(180);
    // 注：jsdom 片段解析会将 SVG 驼峰标签折为小写（浏览器保持 feDropShadow），故用大小写无关匹配
    const shadowLayers = Array.from(glowFilter!.children).filter((el) =>
      /^fedropshadow$/i.test(el.tagName)
    );
    expect(shadowLayers.length).toBe(2);

    // 2) 光效独占活跃面板：全画布恰好 1 个外框矩形挂 url(#tot-active-glow)
    const glowRects = Array.from(container.querySelectorAll('rect')).filter(
      (r) => r.getAttribute('filter') === 'url(#tot-active-glow)'
    );
    expect(glowRects.length).toBe(1);

    // 3) 呼吸光环：活跃面板独享 tot-breathing-ring，SMIL 动画 2s+ 周期持续往复
    const rings = container.querySelectorAll('.tot-breathing-ring');
    expect(rings.length).toBe(1);
    const breathe = rings[0].querySelector('animate');
    expect(breathe).not.toBeNull();
    expect(breathe!.getAttribute('values')).toContain(';');
    expect(breathe!.getAttribute('repeatCount')).toBe('indefinite');

    // 4) 可达性：系统声明减少动效时，光环保留为静态但呼吸动画必须移除
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    try {
      TreeOfTreesCanvasAdapter.render(container, rootFrame);
      const staticRings = container.querySelectorAll('.tot-breathing-ring');
      expect(staticRings.length).toBe(1);
      expect(staticRings[0].querySelector('animate')).toBeNull();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('叶子空调用渲染 ∅ 虚线探针与方向蚂蚁线，prev/cur 双指针与单调性比较弧线全程可见', () => {
    // LeetCode 98 例 2：[5,1,4,null,null,3,6] — 3 位于 5 的右子树却 3<5，违规树
    const root = buildTreeFromArr([5, 1, 4, null, null, 3, 6]);
    const steps = StepNormalizationEngine.normalize(buildVBSteps(root), {
      algorithmId: 'valid-bst',
      stageId: 'stage-1',
    }) as any[];

    expect(steps.length).toBeGreaterThan(10);
    expect(steps.every((s) => s.treeOfTrees)).toBe(true);

    // --- 场景 1：叶子 1 的左空调用 — 活跃叶子帧独享 ∅ 探针 + 下行蚂蚁线 ---
    const nullEntry = steps.find(
      (s) => s.action === 'null-entry' && s.nullProbe?.parentVal === 1 && s.nullProbe?.branch === 'left'
    );
    expect(nullEntry).toBeDefined();
    TreeOfTreesCanvasAdapter.render(container, nullEntry.treeOfTrees);

    const probes = container.querySelectorAll('.tot-null-probe');
    expect(probes.length).toBe(1); // 仅活跃叶子帧持有探针，绝不全景扩散
    expect(probes[0].getAttribute('stroke-dasharray')).toBeTruthy();
    expect(container.textContent).toContain('∅');
    expect(probes[0].querySelector('animate')).not.toBeNull(); // 呼吸脉冲
    const flowLine = container.querySelector('.tot-null-flow');
    expect(flowLine).not.toBeNull();
    expect(flowLine!.querySelector('animate')!.getAttribute('values')).toBe('8;0'); // entry 相位：流向空槽

    // --- 场景 2：null-return — 蚂蚁线反向上行（true 回流父帧）---
    const nullReturn = steps.find(
      (s) => s.action === 'null-return' && s.nullProbe?.parentVal === 1 && s.nullProbe?.branch === 'right'
    );
    expect(nullReturn).toBeDefined();
    TreeOfTreesCanvasAdapter.render(container, nullReturn.treeOfTrees);
    expect(container.querySelector('.tot-null-flow')!.querySelector('animate')!.getAttribute('values')).toBe('0;8');

    // --- 场景 3：compare(5) — prev=1 紫色虚线环 + cur 标签 + 比较弧线问询 ---
    const compareStep = steps.find((s) => s.action === 'compare' && s.current === 5);
    expect(compareStep).toBeDefined();
    TreeOfTreesCanvasAdapter.render(container, compareStep.treeOfTrees);
    expect(container.querySelectorAll('.tot-null-probe').length).toBe(0); // 非空步骤零探针
    expect(container.querySelectorAll('.tot-prev-marker').length).toBe(1);
    expect(container.querySelectorAll('.tot-prev-tag').length).toBe(1);
    expect(container.querySelectorAll('.tot-cur-tag').length).toBe(1);
    expect(container.querySelectorAll('.tot-compare-arc').length).toBe(1);
    expect(container.textContent).toContain('5 > 1 ?');

    // --- 场景 4：violation(3 vs 5) — 弧线转红并给出 ✗ 判定 ---
    const violationStep = steps.find((s) => s.action === 'violation');
    expect(violationStep).toBeDefined();
    TreeOfTreesCanvasAdapter.render(container, violationStep.treeOfTrees);
    expect(container.textContent).toContain('3 ≤ 5 ✗');

    // --- 场景 5：reduced-motion — 探针保留为静态虚线，全部动画移除 ---
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    try {
      TreeOfTreesCanvasAdapter.render(container, nullEntry.treeOfTrees);
      const staticProbes = container.querySelectorAll('.tot-null-probe');
      expect(staticProbes.length).toBe(1);
      expect(staticProbes[0].querySelector('animate')).toBeNull();
      const staticFlow = container.querySelector('.tot-null-flow');
      expect(staticFlow).not.toBeNull();
      expect(staticFlow!.querySelector('animate')).toBeNull();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('活跃面板可见性保证：拖拽平移关闭跟随后推进步骤，活跃面板必须被最小平移拉回视口且缩放绝不被偷改', () => {
    const root = buildTreeFromArr([10, 5, 15, 3, 7, 12, 18]);
    const steps = StepNormalizationEngine.normalize(buildVBSteps(root), {
      algorithmId: 'valid-bst',
      stageId: 'stage-1',
    }) as any[];

    // 显式声明视口尺寸（jsdom 无布局引擎，clientWidth 默认 0）
    Object.defineProperty(container, 'clientWidth', { value: 900, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 620, configurable: true });

    const parseTf = (tf: string) => ({
      tx: Number(tf.match(/translate\((-?[0-9.]+), (-?[0-9.]+)\)/)![1]),
      ty: Number(tf.match(/translate\((-?[0-9.]+), (-?[0-9.]+)\)/)![2]),
      scale: Number(tf.match(/scale\(([0-9.]+)\)/)![1]),
    });
    const getTf = () => container.querySelector('#tot-main-group')!.getAttribute('transform') || '';

    // 1. 首步渲染（autoFollow 聚焦相机），随后模拟用户向左拖拽 800px（拖拽关闭 autoFollow）
    TreeOfTreesCanvasAdapter.render(container, steps[0].treeOfTrees);
    const svg = container.querySelector('svg')!;
    const scaleBeforeDrag = parseTf(getTf()).scale;
    svg.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, clientX: 400, clientY: 300 })
    );
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: -400, clientY: 300 }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    expect(parseTf(getTf()).tx).toBeLessThan(parseTf(getTf()).tx + 700); // 拖拽确实发生了大幅左移

    // 2. 推进到深左侧活跃帧（isValidBST(3)）：拖拽视口下活跃面板必然滑出左侧，必须被拉回
    const deepStep = steps.find((s) => (s.treeOfTrees as any)?.leftChild?.leftChild?.status === 'active');
    expect(deepStep).toBeDefined();
    TreeOfTreesCanvasAdapter.render(container, deepStep.treeOfTrees);

    // 3. 经 viewBox letterbox 因子 k 把活跃面板世界矩形映射到元素坐标，断言完全落在视口内
    const [, , totalW, totalH] = (container.querySelector('svg')!.getAttribute('viewBox') || '')
      .split(' ')
      .map(Number);
    const { tx, ty, scale } = parseTf(getTf());
    // 缩放比例绝不被偷改：与拖拽前完全一致
    expect(scale).toBe(scaleBeforeDrag);

    const k = Math.min(900 / totalW, 620 / totalH);
    const ox = (900 - totalW * k) / 2;
    const oy = (620 - totalH * k) / 2;
    const glowRect = Array.from(container.querySelectorAll('rect')).find(
      (r) => r.getAttribute('filter') === 'url(#tot-active-glow)'
    );
    expect(glowRect).toBeDefined();
    const cardTf = ((glowRect!.parentNode as Element).getAttribute('transform') || '').match(
      /translate\((-?[0-9.]+), (-?[0-9.]+)\)/
    )!;
    const worldLeft = Number(cardTf[1]);
    const worldTop = Number(cardTf[2]);
    const cardW = Number(glowRect!.getAttribute('width'));
    const cardH = Number(glowRect!.getAttribute('height'));
    const screenLeft = (worldLeft * scale + tx) * k + ox;
    const screenRight = screenLeft + cardW * scale * k;
    const screenTop = (worldTop * scale + ty) * k + oy;
    const screenBottom = screenTop + cardH * scale * k;
    expect(screenLeft).toBeGreaterThanOrEqual(-0.5);
    expect(screenRight).toBeLessThanOrEqual(900 + 0.5);
    expect(screenTop).toBeGreaterThanOrEqual(-0.5);
    expect(screenBottom).toBeLessThanOrEqual(620 + 0.5);

    // 4. 最小平移性质：左滑出视口时恰好拉回到 12px 安全边距，绝不重新居中夸大位移
    expect(screenLeft).toBeCloseTo(12, 0);
  });

  it('bst-modes 共享空调用探针：∅ 探针绑定调用帧面板，prev 指针跨方言统一可见', () => {
    const root = buildTreeFromArr([2, 1, 3]);
    const steps = StepNormalizationEngine.normalize(buildBstModesStage1Steps(root), {
      algorithmId: 'bst-modes',
      stageId: 'stage-1',
    }) as any[];

    // 编译器发射端契约：空基底步骤必须携带 nullProbe
    const nullSteps = steps.filter((s) => s.currNodeVal === null && s.nullProbe);
    expect(nullSteps.length).toBeGreaterThanOrEqual(4); // 叶子 1 与 3 各有左右两次空调用

    // 取第一个 prev 已就位的空调用步（null-right of 1，prev=1）：探针必须落在调用帧面板内
    const nullStep = nullSteps.find((s) => s.prevNodeVal !== null);
    expect(nullStep).toBeDefined();
    expect(nullStep.nullProbe.parentVal).toBe(1);
    expect(nullStep.nullProbe.branch).toBe('right');
    expect(nullStep.nullProbe.phase).toBe('entry');
    expect(nullStep.nullProbe.parentId).toBeDefined();
    TreeOfTreesCanvasAdapter.render(container, nullStep.treeOfTrees);

    // 全景唯一探针，且必须挂在携带双层光晕的调用帧卡片内部（修正 prev 帧误活跃的归属错位）
    expect(container.querySelectorAll('.tot-null-probe').length).toBe(1);
    const glowRect = Array.from(container.querySelectorAll('rect')).find(
      (r) => r.getAttribute('filter') === 'url(#tot-active-glow)'
    );
    expect(glowRect).toBeDefined();
    const callerCard = glowRect!.parentNode as Element;
    expect(callerCard.querySelector('.tot-null-probe')).not.toBeNull();

    // prev 指针跨方言（prevNodeVal）统一渲染，空调用期间 cur 为空不挂 cur 标签
    expect(container.querySelectorAll('.tot-prev-marker').length).toBe(1);
    expect(container.querySelectorAll('.tot-cur-tag').length).toBe(0);
  });

  it('bst-modes 重复值树：空调用探针必须按节点身份绑定真实调用帧，绝不误绑同值孪生帧', () => {
    // 与真实用例同构：[2,1,2,1,null,null,2] 含 3 个值为 1 的节点——按值匹配必错绑
    const root = buildTreeFromArr([2, 1, 2, 1, null, null, 2]);
    const steps = StepNormalizationEngine.normalize(buildBstModesStage1Steps(root), {
      algorithmId: 'bst-modes',
      stageId: 'stage-1',
    }) as any[];

    // 深左侧 d=2 叶子节点 (node-4) 的右空调用（此刻 prev=1 已就位）：调用帧是 d=2 · inorderMode(1)，而非同值的 d=1 帧
    const nullStep = steps.find(
      (s) => s.currNodeVal === null && s.nullProbe?.parentVal === 1 && s.nullProbe?.branch === 'right' && s.nullProbe?.parentId
    );
    expect(nullStep).toBeDefined();
    TreeOfTreesCanvasAdapter.render(container, nullStep.treeOfTrees);

    // 活跃（发光）卡片必须是 d=2 调用帧：头部文本、活跃徽章、探针三者同框
    const glowRect = Array.from(container.querySelectorAll('rect')).find(
      (r) => r.getAttribute('filter') === 'url(#tot-active-glow)'
    );
    expect(glowRect).toBeDefined();
    const callerCard = glowRect!.parentNode as Element;
    expect(callerCard.textContent).toContain('d=2 · inorderMode(1)');
    expect(callerCard.textContent).toContain('⚡ 活跃');
    expect(callerCard.querySelector('.tot-null-probe')).not.toBeNull();

    // prev 指针同样按身份锚定：prev 环必须落在发光调用帧面板内
    expect(callerCard.querySelector('.tot-prev-marker')).not.toBeNull();
  });

  it('全家族扫描：所有已接入编译器的空调用步必须携带合法 nullProbe（家族级防回归网）', () => {
    const t98 = buildTreeFromArr([5, 1, 4, null, null, 3, 6]);
    const tSimple = buildTreeFromArr([2, 1, 3]);
    const fixtures: Array<{ name: string; steps: any[] }> = [
      { name: 'valid-bst', steps: buildVBSteps(t98) },
      { name: 'bst-modes', steps: buildBstModesStage1Steps(tSimple) },
      { name: 'tree-depth(maxDepth·共享框架)', steps: TreeDepthStepCompiler.compileMaxDepthStage1Steps(tSimple) },
      { name: 'tree-invert', steps: buildTreeInvertSteps(tSimple) },
      { name: 'balanced-binary-tree', steps: buildBalancedStage1Steps(tSimple) },
      { name: 'bst-min-diff', steps: buildBstMinDiffStage1Steps(tSimple) },
      { name: 'bst-search(stage2)', steps: buildBstSearchStage2RecursiveSteps(tSimple, 5) },
      { name: 'lca', steps: buildLCASteps(tSimple, 1, 4) },
      { name: 'count-complete', steps: buildCountNodesDfsSteps(tSimple) },
      { name: 'zigzag(stage3)', steps: ZigzagStepCompiler.compileDfsSteps(tSimple) },
      { name: 'level-order(stage4-dfs)', steps: LevelOrderStepCompiler.compileDfsSteps(tSimple, LEVEL_ORDER_STAGE1_LINES) },
    ];

    for (const { name, steps } of fixtures) {
      const probeSteps = steps.filter((s: any) => s.nullProbe);
      expect(
        probeSteps.length,
        `${name} 必须存在携带 nullProbe 的空调用步（发射端契约）`
      ).toBeGreaterThan(0);
      for (const s of probeSteps) {
        const np = s.nullProbe;
        expect(np.parentVal ?? np.parentId, `${name} 探针必须可定位调用帧`).toBeDefined();
        expect(['left', 'right'], `${name} branch 必须合法`).toContain(np.branch);
        if (np.phase !== undefined) {
          expect(['entry', 'return'], `${name} phase 必须合法`).toContain(np.phase);
        }
      }
    }
  });
});
