/**
 * 二叉树前中后序遍历可视化器 (Binary Tree Traversal · LeetCode 144/94/145)
 * 多阶段演化 (Multi-Stage Evolution):
 *   Stage 1: 递归遍历 — 系统递归调用栈驱动前序/中序/后序
 *   Stage 2: 迭代栈遍历 — 显式栈结构模拟递归（先序单栈、中序左链下潜、后序双栈法）
 *
 * 双版本综合长处整合 (Bi-Version Synthesis):
 *   旧版: 完善的用户输入框、丰富预设、稳定树画布渲染
 *   新版: 四语言精准行号联动、多阶段演化架构
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  TREE_TRAVERSAL_PROBLEM_HTML,
  TREE_TRAVERSAL_ANALYSIS_HTML,
} from './tree-traversal-problem-content';
import {
  TRAVERSAL_STAGE1_CODES,
  TRAVERSAL_STAGE1_LINES,
  TRAVERSAL_STAGE2_CODES,
  TRAVERSAL_STAGE2_LINES,
} from './tree-traversal-stage-codes';

export type Mode = 'pre' | 'in' | 'post';

// ============================================================
// Common Step Interface (两阶段共用)
// ============================================================
export interface TTStep {
  tree: TreeNode | null;
  mode: Mode;
  current: number | null;
  depth: number;
  visited: number;
  result: number[];
  action: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  /** Stage 2 specific: explicit stack contents */
  stack?: number[];
  /** Stage 2 specific: collect stack for postorder */
  collectStack?: number[];
}

// ============================================================
// Stage 1: 递归遍历步进生成器
// ============================================================
export function buildRecursiveSteps(root: TreeNode | null, mode: Mode): TTStep[] {
  const steps: TTStep[] = [];
  const result: number[] = [];
  let visited = 0;

  const modeName = mode === 'pre' ? '前序（根左右）' : mode === 'in' ? '中序（左根右）' : '后序（左右根）';
  const L = TRAVERSAL_STAGE1_LINES[mode];

  steps.push({
    tree: root,
    mode,
    current: null,
    depth: 0,
    visited: 0,
    result: [],
    action: 'enter',
    message: root ? `开始${modeName}递归遍历：根节点为 ${root.val}。` : '空树，无需遍历。',
    log: root ? `开始${modeName}遍历` : '空树',
    codeLine: L.init,
  });

  if (!root) {
    steps.push({
      tree: null, mode, current: null, depth: 0, visited: 0, result: [],
      action: 'leave',
      message: '✅ 遍历完成，返回空序列 []。',
      log: '遍历完成: []',
      codeLine: L.empty,
    });
    return steps;
  }

  const visit = (node: TreeNode, depth: number) => {
    visited++;
    result.push(node.val);
    steps.push({
      tree: root, mode, current: node.val, depth, visited,
      result: [...result],
      action: 'visit',
      message: `${modeName} 访问节点 ${node.val}（深度 ${depth}），加入结果序列。`,
      log: `访问节点 ${node.val} -> [${result.join(', ')}]`,
      codeLine: L.visit,
    });
  };

  const traverse = (node: TreeNode | null, depth: number) => {
    if (!node) return;
    steps.push({
      tree: root, mode, current: node.val, depth, visited,
      result: [...result],
      action: 'enter',
      message: `进入节点 ${node.val}（当前栈深度 ${depth}）。`,
      log: `进入 ${node.val} (depth ${depth})`,
      codeLine: L.enter,
    });

    if (mode === 'pre') visit(node, depth);

    if (node.left) {
      steps.push({
        tree: root, mode, current: node.val, depth, visited,
        result: [...result],
        action: 'go-left',
        message: `从节点 ${node.val} 递归进入左子树。`,
        log: `${node.val} -> left`,
        codeLine: L.left,
      });
    }
    traverse(node.left, depth + 1);

    if (mode === 'in') visit(node, depth);

    if (node.right) {
      steps.push({
        tree: root, mode, current: node.val, depth, visited,
        result: [...result],
        action: 'go-right',
        message: `从节点 ${node.val} 递归进入右子树。`,
        log: `${node.val} -> right`,
        codeLine: L.right,
      });
    }
    traverse(node.right, depth + 1);

    if (mode === 'post') visit(node, depth);

    steps.push({
      tree: root, mode, current: node.val, depth, visited,
      result: [...result],
      action: 'leave',
      message: `离开节点 ${node.val}（该子树所有分支处理完毕，弹出栈帧）。`,
      log: `离开 ${node.val}`,
      codeLine: L.leave,
    });
  };

  traverse(root, 0);

  steps.push({
    tree: root, mode, current: null, depth: 0, visited,
    result: [...result],
    action: 'done',
    message: `🎉 ${modeName}递归遍历完成！最终序列：[${result.join(', ')}]。`,
    log: `✓ 完成: [${result.join(', ')}]`,
    codeLine: L.init,
  });

  return steps;
}

/** Backward-compatible alias for tests */
export const buildTTSteps = buildRecursiveSteps;

// ============================================================
// Stage 2: 迭代栈遍历步进生成器
// ============================================================
export function buildIterativeSteps(root: TreeNode | null, mode: Mode): TTStep[] {
  const steps: TTStep[] = [];
  const result: number[] = [];
  const LP = TRAVERSAL_STAGE2_LINES.pre;
  const LI = TRAVERSAL_STAGE2_LINES.in;
  const LPO = TRAVERSAL_STAGE2_LINES.post;
  const entryLine = mode === 'pre' ? LP.entry : mode === 'in' ? LI.entry : LPO.entry;
  const emptyLine = mode === 'pre' ? LP.empty : mode === 'in' ? LI.empty : LPO.empty;
  const initLine = mode === 'pre' ? LP.init : mode === 'in' ? LI.init : LPO.init;
  const doneLine = mode === 'pre' ? LP.done : mode === 'in' ? LI.done : LPO.done;

  const modeName = mode === 'pre' ? '先序' : mode === 'in' ? '中序' : '后序（双栈法）';

  steps.push({
    tree: root, mode, current: null, depth: 0, visited: 0,
    result: [], stack: [], collectStack: mode === 'post' ? [] : undefined,
    action: 'init',
    message: root
      ? `开始${modeName}迭代遍历：使用显式栈替代递归系统栈。`
      : '空树，直接返回空列表 []。',
    log: `iterative ${modeName} traversal`,
    codeLine: entryLine,
  });

  if (!root) {
    steps.push({
      tree: null, mode, current: null, depth: 0, visited: 0,
      result: [], stack: [],
      action: 'done',
      message: '✅ 空树，返回 []。',
      log: 'return []',
      codeLine: emptyLine,
    });
    return steps;
  }

  if (mode === 'pre') {
    // ── 先序: 弹出打印，先压右再压左 ──
    const stack: TreeNode[] = [root];
    steps.push({
      tree: root, mode, current: root.val, depth: 0, visited: 0,
      result: [], stack: [root.val],
      action: 'init',
      message: `根节点 ${root.val} 入栈，stack = [${root.val}]。`,
      log: `stack.push(${root.val})`,
      codeLine: initLine,
    });

    while (stack.length > 0) {
      const cur = stack.pop()!;
      result.push(cur.val);

      steps.push({
        tree: root, mode, current: cur.val, depth: 0, visited: result.length,
        result: [...result], stack: stack.map(n => n.val),
        action: 'pop-visit',
        message: `弹出栈顶节点 ${cur.val} 并打印，当前序列: [${result.join(', ')}]。`,
        log: `pop ${cur.val}, ans = [${result.join(', ')}]`,
        codeLine: LP.popVisit,
      });

      if (cur.right) {
        stack.push(cur.right);
        steps.push({
          tree: root, mode, current: cur.val, depth: 0, visited: result.length,
          result: [...result], stack: stack.map(n => n.val),
          action: 'push-right',
          message: `右子节点 ${cur.right.val} 先入栈（保证后出栈）。`,
          log: `push right ${cur.right.val}`,
          codeLine: LP.pushRight,
        });
      }
      if (cur.left) {
        stack.push(cur.left);
        steps.push({
          tree: root, mode, current: cur.val, depth: 0, visited: result.length,
          result: [...result], stack: stack.map(n => n.val),
          action: 'push-left',
          message: `左子节点 ${cur.left.val} 后入栈（保证先出栈，满足先序左优先）。`,
          log: `push left ${cur.left.val}`,
          codeLine: LP.pushLeft,
        });
      }
    }
  } else if (mode === 'in') {
    // ── 中序: 整条左边界下潜，弹出打印后转右子树 ──
    const stack: TreeNode[] = [];
    let cur: TreeNode | null = root;

    steps.push({
      tree: root, mode, current: root.val, depth: 0, visited: 0,
      result: [], stack: [],
      action: 'init',
      message: `初始化: cur 指向根节点 ${root.val}，显式栈为空。`,
      log: `cur = ${root.val}, stack = []`,
      codeLine: initLine,
    });

    while (stack.length > 0 || cur !== null) {
      if (cur !== null) {
        stack.push(cur);
        steps.push({
          tree: root, mode, current: cur.val, depth: 0, visited: result.length,
          result: [...result], stack: stack.map(n => n.val),
          action: 'push-left',
          message: `节点 ${cur.val} 入栈，继续沿左边界下潜。`,
          log: `push ${cur.val}, go left`,
          codeLine: LI.pushLeft,
        });
        cur = cur.left;
      } else {
        cur = stack.pop()!;
        result.push(cur.val);
        steps.push({
          tree: root, mode, current: cur.val, depth: 0, visited: result.length,
          result: [...result], stack: stack.map(n => n.val),
          action: 'pop-visit-right',
          message: `左链尽头，弹出 ${cur.val} 打印并转向右子树。序列: [${result.join(', ')}]。`,
          log: `pop ${cur.val}, visit, go right`,
          codeLine: LI.popVisitRight,
        });
        cur = cur.right;
      }
    }
  } else {
    // ── 后序（双栈法）: s1 按中右左弹入 s2，s2 弹出即为左右中 ──
    const s1: TreeNode[] = [root];
    const s2: number[] = [];

    steps.push({
      tree: root, mode, current: root.val, depth: 0, visited: 0,
      result: [], stack: [root.val], collectStack: [],
      action: 'init',
      message: `双栈法：根节点 ${root.val} 入工作栈 s1。`,
      log: `s1.push(${root.val})`,
      codeLine: initLine,
    });

    while (s1.length > 0) {
      const cur = s1.pop()!;
      s2.push(cur.val);

      steps.push({
        tree: root, mode, current: cur.val, depth: 0, visited: 0,
        result: [...result], stack: s1.map(n => n.val), collectStack: [...s2],
        action: 's1-pop-s2-push',
        message: `s1 弹出 ${cur.val}，压入收集栈 s2 = [${s2.join(', ')}]。`,
        log: `s1 pop ${cur.val} -> s2`,
        codeLine: LPO.s1PopS2Push,
      });

      if (cur.left) {
        s1.push(cur.left);
        steps.push({
          tree: root, mode, current: cur.val, depth: 0, visited: 0,
          result: [...result], stack: s1.map(n => n.val), collectStack: [...s2],
          action: 'push-left',
          message: `左子节点 ${cur.left.val} 入 s1（后序关键：先压左再压右）。`,
          log: `s1 push left ${cur.left.val}`,
          codeLine: LPO.pushLeft,
        });
      }
      if (cur.right) {
        s1.push(cur.right);
        steps.push({
          tree: root, mode, current: cur.val, depth: 0, visited: 0,
          result: [...result], stack: s1.map(n => n.val), collectStack: [...s2],
          action: 'push-right',
          message: `右子节点 ${cur.right.val} 入 s1。`,
          log: `s1 push right ${cur.right.val}`,
          codeLine: LPO.pushRight,
        });
      }
    }

    // Collect from s2
    const finalResult = [...s2].reverse();
    result.push(...finalResult);

    steps.push({
      tree: root, mode, current: null, depth: 0, visited: result.length,
      result: [...result], stack: [], collectStack: [...s2],
      action: 's2-collect',
      message: `s1 已空，将收集栈 s2 反序弹出得到后序序列: [${result.join(', ')}]。`,
      log: `s2 reverse -> [${result.join(', ')}]`,
      codeLine: LPO.s2Collect,
    });
  }

  // Final step
  steps.push({
    tree: root, mode, current: null, depth: 0, visited: result.length,
    result: [...result], stack: [],
    action: 'done',
    message: `🎉 ${modeName}迭代遍历完成！最终序列：[${result.join(', ')}]。`,
    log: `✓ 完成: [${result.join(', ')}]`,
    codeLine: doneLine,
  });

  return steps;
}

// ============================================================
// Canvas renderers
// ============================================================

/** 通用二叉树画布渲染 */
function renderTraversalCanvas(container: HTMLElement, step: TTStep): void {
  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.current,
    secondaryHighlightedNodes: step.result,
    primaryColor: '#fbbf24',
    secondaryColor: '#34d399',
  });
}

// ============================================================
// Custom metrics renderers
// ============================================================

/** Stage 1 递归指标 — 调用栈深度 + 输出序列 */
function renderRecursiveMetrics(container: HTMLElement, step: TTStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 4px 0;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="padding: 4px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
          <span style="font-size: 10px; color: #64748b;">递归栈深度</span>
          <span style="font-size: 14px; font-weight: 700; color: #1d4ed8; margin-left: 6px;">${step.depth}</span>
        </div>
        <div style="padding: 4px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
          <span style="font-size: 10px; color: #64748b;">已访问</span>
          <span style="font-size: 14px; font-weight: 700; color: #15803d; margin-left: 6px;">${step.visited}</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569;">已输出序列:</span>
        <div style="padding: 4px 8px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 700; color: #16a34a;">
          [ ${step.result.join(', ')} ]
        </div>
      </div>
      <div style="padding: 6px 8px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
        ${step.message}
      </div>
    </div>
  `;
}

/** Stage 2 迭代指标 — 显式栈内容 + 输出序列 */
function renderIterativeMetrics(container: HTMLElement, step: TTStep): void {
  const stackChips = step.stack && step.stack.length > 0
    ? step.stack.map((v, i) => `
        <span style="padding: 3px 8px; background: ${i === step.stack!.length - 1 ? '#fef3c7' : '#f1f5f9'}; border: 1px solid ${i === step.stack!.length - 1 ? '#f59e0b' : '#e2e8f0'}; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace; color: ${i === step.stack!.length - 1 ? '#92400e' : '#475569'};">${v}${i === step.stack!.length - 1 ? ' ⬆' : ''}</span>
      `).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">栈为空</span>';

  const collectHtml = step.collectStack
    ? `<div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569;">📥 收集栈 s2:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 8px; background: #fef2f2; border: 1px dashed #fca5a5; border-radius: 6px;">
          ${step.collectStack.length > 0
            ? step.collectStack.map(v => `<span style="padding: 2px 6px; background: #fff; border: 1px solid #fca5a5; border-radius: 4px; font-size: 11px; font-weight: 600; font-family: monospace; color: #dc2626;">${v}</span>`).join('')
            : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">空</span>'}
        </div>
      </div>`
    : '';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 4px 0;">
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569;">🥞 工作栈 (底→顶):</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">
          ${stackChips}
        </div>
      </div>
      ${collectHtml}
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569;">📜 输出序列:</span>
        <div style="padding: 4px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 700; color: #15803d;">
          [ ${step.result.join(', ')} ]
        </div>
      </div>
      <div style="padding: 6px 8px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
        ${step.message}
      </div>
    </div>
  `;
}

// ============================================================
// Input parser
// ============================================================
function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['input-tree'] || '1, 2, 3, 4, 5, 6, 7';
  const arr = parseTreeArray(raw, [1, 2, 3, 4, 5, 6, 7]);
  return buildTree(arr);
}

function resolveMode(mode?: string): Mode {
  if (mode === 'in' || mode === 'post') return mode;
  return 'pre';
}

// ============================================================
// 声明式算法注册 — 多阶段演化
// ============================================================
export const treeTraversalVisualizer = registerDeclarativeAlgorithm<TTStep>({
  id: 'tree-traversal',
  aliases: ['class018-code01', 'binary-tree-traversal', 'preorder-inorder-postorder'],
  name: '二叉树遍历',
  category: 'tree',
  icon: '🌲',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '彻底掌握二叉树前中后序遍历的递归与迭代两种实现，理解访问时机与栈操作的本质',
  badge: {
    mode: '前序 / 中序 / 后序',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉树拓扑结构与遍历沙盘',
  card2Title: '🧭 遍历指标与输出序列监视器',
  card2Desc: '当前访问节点、递归/迭代栈状态与输出序列',
  legend: [
    { label: '当前访问节点', color: '#fbbf24' },
    { label: '已输出节点', color: '#34d399' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5, 6, 7',
      width: '150px',
      placeholder: '1, 2, 3, 4, 5...',
    },
  ],
  modes: [
    { id: 'pre', label: '前序遍历 (根-左-右)' },
    { id: 'in', label: '中序遍历 (左-根-右)' },
    { id: 'post', label: '后序遍历 (左-右-根)' },
  ],
  presets: [
    { label: '完美满二叉树', values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7' } },
    { label: '单侧偏斜树', values: { 'input-tree': '1, 2, null, 3, null, null, null' } },
    { label: '不规则二叉树', values: { 'input-tree': '1, 2, 3, null, 4, 5, null' } },
    { label: '单节点', values: { 'input-tree': '1' } },
  ],
  metrics: [
    { id: 'cur-node', label: '当前访问节点', color: '#f59e0b' },
    { id: 'depth', label: '调用栈深度 depth', color: '#2563eb' },
    { id: 'visited-count', label: '已访问节点数', color: '#0f172a' },
  ],
  problemHtml: TREE_TRAVERSAL_PROBLEM_HTML,
  analysisHtml: TREE_TRAVERSAL_ANALYSIS_HTML,

  // ========================
  // 多阶段演化配置
  // ========================
  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 递归遍历',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(n)',
      theme: 'bg-blue' as const,
      badge: {
        mode: '前中后序 · 递归系统栈',
        complexity: 'O(n) · O(h) 栈深',
      },
      card1Title: '🌲 二叉树拓扑与递归遍历沙盘',
      card2Title: '📚 递归调用栈与遍历序列监视器',
      codeLanguages: TRAVERSAL_STAGE1_CODES.pre,
      modeCodeLanguages: TRAVERSAL_STAGE1_CODES,
      buildSteps: (inputs: Record<string, any>, mode?: string) => {
        const root = parseAndBuild(inputs);
        return buildRecursiveSteps(root, resolveMode(mode));
      },
      renderCanvas: (container: HTMLElement, step: TTStep) => renderTraversalCanvas(container, step),
      renderCustomMetrics: (container: HTMLElement, step: TTStep) => renderRecursiveMetrics(container, step),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 迭代栈遍历',
      shortName: '迭代栈',
      num: 2,
      timeBadge: 'O(n)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '前中后序 · 显式栈迭代',
        complexity: 'O(n) · O(h) 栈深',
      },
      card1Title: '📊 二叉树拓扑与迭代栈遍历沙盘',
      card2Title: '🥞 显式栈状态与遍历序列监视器',
      codeLanguages: TRAVERSAL_STAGE2_CODES.pre,
      modeCodeLanguages: TRAVERSAL_STAGE2_CODES,
      buildSteps: (inputs: Record<string, any>, mode?: string) => {
        const root = parseAndBuild(inputs);
        return buildIterativeSteps(root, resolveMode(mode));
      },
      renderCanvas: (container: HTMLElement, step: TTStep) => renderTraversalCanvas(container, step),
      renderCustomMetrics: (container: HTMLElement, step: TTStep) => renderIterativeMetrics(container, step),
    },
  ],

  // Legacy fallback
  codeLanguages: TRAVERSAL_STAGE1_CODES.pre,
  buildSteps: (inputs, mode) => {
    const root = parseAndBuild(inputs);
    return buildRecursiveSteps(root, resolveMode(mode));
  },
  renderCanvas: (container, step) => {
    renderTraversalCanvas(container, step);

    const root = container.closest('#algo-tree-traversal-view') || container.parentElement;
    if (root) {
      const curEl = root.querySelector('#metric-cur-node');
      const depthEl = root.querySelector('#metric-depth');
      const visitedEl = root.querySelector('#metric-visited-count');

      if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
      if (depthEl) depthEl.textContent = `${step.depth}`;
      if (visitedEl) visitedEl.textContent = `${step.visited}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        renderRecursiveMetrics(customMetricsContainer as HTMLElement, step);
      }
    }
  },
});