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

    it('renderCustomMetrics 能正常挂载扁平化后序信息流转沙盘与显式栈', () => {
      const container = document.createElement('div');
      const root = buildTreeFromArr([3, 9, 20]);
      const s1Steps = buildBalancedStage1Steps(root);
      renderBalancedCustomMetrics(container, s1Steps[0]);
      expect(container.innerHTML).toContain('左子树汇报');
      expect(container.innerHTML).toContain('右子树汇报');
      expect(container.innerHTML).toContain('本层后序判定');
      expect(container.innerHTML).toContain('向上交付行为');

      const s3Steps = buildBalancedStage3StackSteps(root);
      renderBalancedCustomMetrics(container, s3Steps.find((s) => s.stackState && s.stackState.length > 0)!);
      expect(container.innerHTML).toContain('后序显式栈');
      expect(container.innerHTML).toContain('节点高度映射表');
    });
  });

  describe('TreeLogGrammar 黄金日志规范校验 (严格对齐图 1)', () => {
    it('Stage 2 全量步骤日志必须具备树形导轨缩进、语义 Emoji 与全中文解说', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBalancedStage2PruneSteps(root);

      expect(steps.length).toBeGreaterThan(5);

      steps.forEach((step, idx) => {
        expect(step.log, `第 ${idx + 1} 步日志不能为空`).toBeTruthy();
        expect(step.log.startsWith('|'), `第 ${idx + 1} 步日志必须以树形导轨 '|' 开头: "${step.log}"`).toBe(true);
        expect(
          /^(check relax|skip\s+\d|return\s+dist|checking left|checking right|prune and return)/i.test(step.log),
          `第 ${idx + 1} 步日志严禁泄露粗糙机器调试英文: "${step.log}"`
        ).toBe(false);
      });

      // 验证第 1 步到第 8 步（对应用户截图 2 场景）具备丰富生动图标
      const emojis = ['📥', '⬇️', '🔍', '➡️', '🔄', '🛡️', '🎯'];
      const hasEmojis = steps.some((s) => emojis.some((e) => s.log.includes(e)));
      expect(hasEmojis, '日志流必须包含五段式语义 Emoji 图标').toBe(true);
    });

    it('Stage 1 与 Stage 3 同样严格遵循 TreeLogGrammar 树形导轨与 Emoji 规范', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const s1Steps = buildBalancedStage1Steps(root);
      const s3Steps = buildBalancedStage3StackSteps(root);

      s1Steps.forEach((s, idx) => {
        expect(s.log.startsWith('|'), `Stage 1 第 ${idx + 1} 步必须以 '|' 开头`).toBe(true);
      });

      s3Steps.forEach((s, idx) => {
        expect(s.log.startsWith('|'), `Stage 3 第 ${idx + 1} 步必须以 '|' 开头`).toBe(true);
      });
    });
  });

  describe('路线 B: 动态生命树推演与呈现契约 (Dynamic Tree Growth, Null Probe & Capsule Badges)', () => {
    it('Stage 1 能够动态捕捉 nullProbe 探针并在推演过程中自底向上填充 heightMap', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBalancedStage1Steps(root);

      // 验证存在 nullProbe 探针 (如 9 的左子节点或右子节点)
      const probeStep = steps.find((s) => s.nullProbe);
      expect(probeStep, '推演过程中必须捕获到空节点物理探针 nullProbe').toBeDefined();
      expect(probeStep?.nullProbe?.branch).toMatch(/left|right/);

      // 验证 heightMap 逐步自底向上回填 (初始为空，后序归纳后增多)
      expect(Object.keys(steps[0].heightMap || {}).length).toBe(0);
      const doneStep = steps[steps.length - 1];
      expect(Object.keys(doneStep.heightMap || {}).length).toBeGreaterThan(0);
      expect(doneStep.heightMap?.[15]).toBe(1);
      expect(doneStep.heightMap?.[3]).toBe(3);
    });

    it('Stage 2 剪枝场景下能动态记录 -1 熔断并在画布渲染 🚨 -1 徽章与 null 探针', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 3, null, null, 4, 4]);
      const steps = buildBalancedStage2PruneSteps(root);

      const pruneStep = steps.find((s) => s.heightMap && Object.values(s.heightMap).includes(-1));
      expect(pruneStep, 'Stage 2 剪枝发生时 heightMap 必须记录 -1 熔断值').toBeDefined();

      // 表现层渲染验证：包含 🚨 -1 熔断胶囊徽章
      const container = document.createElement('div');
      renderBalancedTreeCanvas(container, pruneStep!);
      expect(container.innerHTML).toContain('🚨 -1 熔断');

      // 探针渲染验证：包含 null:0 物理小方框
      const probeStep = steps.find((s) => s.nullProbe);
      expect(probeStep).toBeDefined();
      renderBalancedTreeCanvas(container, probeStep!);
      expect(container.innerHTML).toContain('null:0');
    });

    it('renderCanvas 能正确将 heightMap 转化为胶囊徽章并启用 dimUnvisited 呼吸态', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBalancedStage1Steps(root);
      const container = document.createElement('div');

      // 渲染中间带有 heightMap 的步骤
      const midStep = steps.find((s) => s.heightMap && Object.keys(s.heightMap).length > 0)!;
      renderBalancedTreeCanvas(container, midStep);

      // 应该含有 h= 徽章
      expect(container.innerHTML).toContain('h=');
      // 应该含有 opacity 探索态 (dimUnvisited)
      expect(container.innerHTML).toContain('opacity');
    });
  });

  describe('路线 C: 递归调用展开树 (Recursive Call Tree) 与子视图切换契约', () => {
    it('Stage 1 步骤必须具备动态生长的 callTree 拓扑快照与活跃帧 activeCallId', () => {
      const root = buildTreeFromArr([3, 9, 20]);
      const steps = buildBalancedStage1Steps(root);

      expect(steps.length).toBeGreaterThan(4);

      // 验证存在 callTree 的步骤
      const stepsWithCallTree = steps.filter((s) => s.callTree);
      expect(stepsWithCallTree.length).toBeGreaterThan(0);

      // 验证根调用节点为 process(3)
      const firstTree = stepsWithCallTree[0].callTree!;
      expect(firstTree.val).toContain('process');
      expect(firstTree.val).toContain('3');

      // 验证最终完成步骤中 callTree 已经完整展开左右分支并打上返回值 tag
      const lastStep = steps[steps.length - 1];
      expect(lastStep.callTree).toBeDefined();
      expect(lastStep.callTree!.children?.length).toBe(2);
      expect(lastStep.callTree!.tag).toBeDefined();
    });

    it('Stage 2 剪枝场景下 callTree 必须正确标记 pruned 剪枝截断状态与 -1 熔断 tag', () => {
      const root = buildTreeFromArr([1, 2, 2, 3, 3, null, null, 4, 4]);
      const steps = buildBalancedStage2PruneSteps(root);

      const prunedStep = steps.find((s) => {
        if (!s.callTree) return false;
        const checkPrune = (node: any): boolean => {
          if (node.status === 'pruned' || (node.tag && node.tag.includes('-1'))) return true;
          return (node.children || []).some(checkPrune);
        };
        return checkPrune(s.callTree);
      });

      expect(prunedStep, '剪枝用例推演中 callTree 必须包含 pruned 节点或 -1 熔断 tag').toBeDefined();
    });

    it('路线 E: 按递归深度显示 N 个树 (随调用栈动态增减)', () => {
      const root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
      const steps = buildBalancedStage1Steps(root);

      // 1. 验证推演过程中生成了 treeStackFrames，且最大深度为 3
      const depth3Steps = steps.filter((s) => s.treeStackFrames && s.treeStackFrames.length === 3);
      expect(depth3Steps.length, '树高为3时必须存在深度为3的栈帧步骤').toBeGreaterThan(0);

      const sampleD3 = depth3Steps[0];
      expect(sampleD3.treeStackFrames![0].funcCall).toBe('process(3)');
      expect(sampleD3.treeStackFrames!.length).toBe(3);
      expect(sampleD3.treeStackFrames![2].isCurrent).toBe(true);

      // 验证深入到 15 时的栈帧调用链
      const step15 = steps.find((s) => s.current === 15 && s.treeStackFrames && s.treeStackFrames.length === 3);
      expect(step15).toBeDefined();
      expect(step15!.treeStackFrames!.map((f) => f.funcCall)).toEqual([
        'process(3)',
        'process(20)',
        'process(15)',
      ]);

      // 2. 验证 renderCanvas 在默认 stack-depth 模式下挂载 3 棵树
      const container = document.createElement('div');
      BalancedBinaryTreeCanvasAdapter.activeSubView = 'stack-depth';
      renderBalancedTreeCanvas(container, sampleD3);

      expect(container.innerHTML).toContain('btn-subview-stack');
      expect(container.innerHTML).toContain('d=1');
      expect(container.innerHTML).toContain('d=2');
      expect(container.innerHTML).toContain('d=3');
      // 必须渲染了 3 棵完整的二叉树 SVG
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(3);
    });

    it('renderCanvas 支持在 stack-depth、split、data-tree 与 call-tree 四种视图模式间自由无缝切换', () => {
      const root = buildTreeFromArr([3, 9, 20]);
      const steps = buildBalancedStage1Steps(root);
      const container = document.createElement('div');
      const midStep = steps[steps.length - 2];

      // 1. 默认 stack-depth 模式
      BalancedBinaryTreeCanvasAdapter.activeSubView = 'stack-depth';
      renderBalancedTreeCanvas(container, midStep);
      expect(container.innerHTML).toContain('btn-subview-stack');
      expect(container.innerHTML).toContain('btn-subview-split');
      expect(container.innerHTML).toContain('btn-subview-data');
      expect(container.innerHTML).toContain('btn-subview-call');
      expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1);

      // 2. 切换至 split 模式
      BalancedBinaryTreeCanvasAdapter.activeSubView = 'split';
      renderBalancedTreeCanvas(container, midStep);
      expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1);

      // 3. 切换至 call-tree 模式
      BalancedBinaryTreeCanvasAdapter.activeSubView = 'call-tree';
      renderBalancedTreeCanvas(container, midStep);
      expect(container.querySelector('svg')).not.toBeNull();

      // 4. 切换至 data-tree 模式
      BalancedBinaryTreeCanvasAdapter.activeSubView = 'data-tree';
      renderBalancedTreeCanvas(container, midStep);
      expect(container.querySelector('svg')).not.toBeNull();

      // 切回 stack-depth 默认
      BalancedBinaryTreeCanvasAdapter.activeSubView = 'stack-depth';
    });
  });
});

