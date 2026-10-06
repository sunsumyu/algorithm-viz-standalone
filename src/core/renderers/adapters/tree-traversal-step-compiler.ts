/**
 * Tree Traversal Step Compiler
 * 二叉树前中后序遍历递归与显式栈迭代推演编译器
 * 深模块核心编译器 (Deep Module)
 */

import { parseTreeArray } from '../../input-primitives';
import { HighlightTarget } from '../../step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from '../../../algorithms/categories/tree/tree-template';
import {
  TRAVERSAL_STAGE1_LINES,
  TRAVERSAL_STAGE2_LINES,
} from '../../../algorithms/categories/tree/tree-traversal-stage-codes';

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
      tree: null,
      mode,
      current: null,
      depth: 0,
      visited: 0,
      result: [],
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
      tree: root,
      mode,
      current: node.val,
      depth,
      visited,
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
      tree: root,
      mode,
      current: node.val,
      depth,
      visited,
      result: [...result],
      action: 'enter',
      message: `进入节点 ${node.val}（当前栈深度 ${depth}）。`,
      log: `进入 ${node.val} (depth ${depth})`,
      codeLine: L.enter,
    });

    if (mode === 'pre') visit(node, depth);

    if (node.left) {
      steps.push({
        tree: root,
        mode,
        current: node.val,
        depth,
        visited,
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
        tree: root,
        mode,
        current: node.val,
        depth,
        visited,
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
      tree: root,
      mode,
      current: node.val,
      depth,
      visited,
      result: [...result],
      action: 'leave',
      message: `离开节点 ${node.val}（该子树所有分支处理完毕，弹出栈帧）。`,
      log: `离开 ${node.val}`,
      codeLine: L.leave,
    });
  };

  traverse(root, 0);

  steps.push({
    tree: root,
    mode,
    current: null,
    depth: 0,
    visited,
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
    tree: root,
    mode,
    current: null,
    depth: 0,
    visited: 0,
    result: [],
    stack: [],
    collectStack: mode === 'post' ? [] : undefined,
    action: 'init',
    message: root
      ? `开始${modeName}迭代遍历：使用显式栈替代递归系统栈。`
      : '空树，直接返回空列表 []。',
    log: `iterative ${modeName} traversal`,
    codeLine: entryLine,
  });

  if (!root) {
    steps.push({
      tree: null,
      mode,
      current: null,
      depth: 0,
      visited: 0,
      result: [],
      stack: [],
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
      tree: root,
      mode,
      current: root.val,
      depth: 0,
      visited: 0,
      result: [],
      stack: [root.val],
      action: 'init',
      message: `根节点 ${root.val} 入栈，stack = [${root.val}]。`,
      log: `stack.push(${root.val})`,
      codeLine: initLine,
    });

    while (stack.length > 0) {
      const cur = stack.pop()!;
      result.push(cur.val);

      steps.push({
        tree: root,
        mode,
        current: cur.val,
        depth: 0,
        visited: result.length,
        result: [...result],
        stack: stack.map((n) => n.val),
        action: 'pop-visit',
        message: `弹出栈顶节点 ${cur.val} 并打印，当前序列: [${result.join(', ')}]。`,
        log: `pop ${cur.val}, ans = [${result.join(', ')}]`,
        codeLine: LP.popVisit,
      });

      if (cur.right) {
        stack.push(cur.right);
        steps.push({
          tree: root,
          mode,
          current: cur.val,
          depth: 0,
          visited: result.length,
          result: [...result],
          stack: stack.map((n) => n.val),
          action: 'push-right',
          message: `右子节点 ${cur.right.val} 先入栈（保证后出栈）。`,
          log: `push right ${cur.right.val}`,
          codeLine: LP.pushRight,
        });
      }
      if (cur.left) {
        stack.push(cur.left);
        steps.push({
          tree: root,
          mode,
          current: cur.val,
          depth: 0,
          visited: result.length,
          result: [...result],
          stack: stack.map((n) => n.val),
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
      tree: root,
      mode,
      current: root.val,
      depth: 0,
      visited: 0,
      result: [],
      stack: [],
      action: 'init',
      message: `初始化: cur 指向根节点 ${root.val}，显式栈为空。`,
      log: `cur = ${root.val}, stack = []`,
      codeLine: initLine,
    });

    while (stack.length > 0 || cur !== null) {
      if (cur !== null) {
        stack.push(cur);
        steps.push({
          tree: root,
          mode,
          current: cur.val,
          depth: 0,
          visited: result.length,
          result: [...result],
          stack: stack.map((n) => n.val),
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
          tree: root,
          mode,
          current: cur.val,
          depth: 0,
          visited: result.length,
          result: [...result],
          stack: stack.map((n) => n.val),
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
      tree: root,
      mode,
      current: root.val,
      depth: 0,
      visited: 0,
      result: [],
      stack: [root.val],
      collectStack: [],
      action: 'init',
      message: `双栈法：根节点 ${root.val} 入工作栈 s1。`,
      log: `s1.push(${root.val})`,
      codeLine: initLine,
    });

    while (s1.length > 0) {
      const cur = s1.pop()!;
      s2.push(cur.val);

      steps.push({
        tree: root,
        mode,
        current: cur.val,
        depth: 0,
        visited: 0,
        result: [...result],
        stack: s1.map((n) => n.val),
        collectStack: [...s2],
        action: 's1-pop-s2-push',
        message: `s1 弹出 ${cur.val}，压入收集栈 s2 = [${s2.join(', ')}]。`,
        log: `s1 pop ${cur.val} -> s2`,
        codeLine: LPO.s1PopS2Push,
      });

      if (cur.left) {
        s1.push(cur.left);
        steps.push({
          tree: root,
          mode,
          current: cur.val,
          depth: 0,
          visited: 0,
          result: [...result],
          stack: s1.map((n) => n.val),
          collectStack: [...s2],
          action: 'push-left',
          message: `左子节点 ${cur.left.val} 入 s1（后序关键：先压左再压右）。`,
          log: `s1 push left ${cur.left.val}`,
          codeLine: LPO.pushLeft,
        });
      }
      if (cur.right) {
        s1.push(cur.right);
        steps.push({
          tree: root,
          mode,
          current: cur.val,
          depth: 0,
          visited: 0,
          result: [...result],
          stack: s1.map((n) => n.val),
          collectStack: [...s2],
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
      tree: root,
      mode,
      current: null,
      depth: 0,
      visited: result.length,
      result: [...result],
      stack: [],
      collectStack: [...s2],
      action: 's2-collect',
      message: `s1 已空，将收集栈 s2 反序弹出得到后序序列: [${result.join(', ')}]。`,
      log: `s2 reverse -> [${result.join(', ')}]`,
      codeLine: LPO.s2Collect,
    });
  }

  // Final step
  steps.push({
    tree: root,
    mode,
    current: null,
    depth: 0,
    visited: result.length,
    result: [...result],
    stack: [],
    action: 'done',
    message: `🎉 ${modeName}迭代遍历完成！最终序列：[${result.join(', ')}]。`,
    log: `✓ 完成: [${result.join(', ')}]`,
    codeLine: doneLine,
  });

  return steps;
}

// ============================================================
// Input parser
// ============================================================
export function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['input-tree'] || '1, 2, 3, 4, 5, 6, 7';
  const arr = parseTreeArray(raw, [1, 2, 3, 4, 5, 6, 7]);
  return buildTree(arr);
}

export function resolveMode(mode?: string): Mode {
  if (mode === 'in' || mode === 'post') return mode;
  return 'pre';
}
