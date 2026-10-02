/**
 * 二叉搜索树中的搜索可视化器 (Search in a BST · LeetCode 700 / 701)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 *
 * 核心阶段体系:
 * - Stage 1: 迭代单向剪枝查找 (Iterative BST Search · O(1) 空间)
 * - Stage 2: 递归分支剪枝查找 (Recursive Divide & Conquer · O(H) 栈深度)
 * - Stage 3: 搜索未命中定点动态插入 (BST Search & Insert · LC 701 读写闭环)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  BST_SEARCH_PROBLEM_HTML,
  BST_SEARCH_ANALYSIS_HTML,
  BST_SEARCH_CODE_LANGUAGES,
} from './bst-search-problem-content';
import {
  BST_SEARCH_STAGE1_ITERATIVE_CODE,
  BST_SEARCH_STAGE1_LINES,
  BST_SEARCH_STAGE2_RECURSIVE_CODE,
  BST_SEARCH_STAGE2_LINES,
  BST_SEARCH_STAGE3_INSERT_CODE,
  BST_SEARCH_STAGE3_LINES,
} from './bst-search-stage-codes';

export interface BSTSStep {
  tree: TreeNode | null;
  current: number | null;
  val: number;
  decision: string;
  found: boolean;
  path: number[];
  targetSubtree: TreeNode | null;
  action: 'enter' | 'left' | 'right' | 'found' | 'not-found' | 'done' | 'insert';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  stageId?: 'stage-1' | 'stage-2' | 'stage-3';
  insertedVal?: number | null;
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

export const BST_SEARCH_CODE_LINES = BST_SEARCH_STAGE1_LINES;

// ============================================================
// Stage 1: 迭代单向剪枝查找 (Iterative BST Search · LC 700)
// ============================================================
export function buildBSTSearchSteps(root: TreeNode | null, targetVal: number): BSTSStep[] {
  const steps: BSTSStep[] = [];
  const path: number[] = [];
  let found = false;
  let targetSubtree: TreeNode | null = null;

  steps.push({
    tree: root,
    current: null,
    val: targetVal,
    decision: '准备搜索',
    found: false,
    path: [],
    targetSubtree: null,
    action: 'enter',
    stageId: 'stage-1',
    message: root
      ? `初始化迭代 BST 搜索：目标值 val = ${targetVal}，从根节点 ${root.val} 开始迭代定位。`
      : '空树，直接返回 null。',
    log: root ? `开始迭代搜索 val = ${targetVal}` : '空树 -> null',
    codeLine: BST_SEARCH_STAGE1_LINES.init,
    metrics: { '当前比对节点': '—', '分支转向决策': '准备启动', '搜索命中状态': '未开始' },
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      val: targetVal,
      decision: '未找到',
      found: false,
      path: [],
      targetSubtree: null,
      action: 'not-found',
      stageId: 'stage-1',
      message: '❌ 空树中无法找到目标值，返回 null。',
      log: '✓ 未找到目标 (null)',
      codeLine: BST_SEARCH_STAGE1_LINES.notFound,
      metrics: { '当前比对节点': 'null', '分支转向决策': '空树直接退出', '搜索命中状态': '未找到' },
    });
    return steps;
  }

  let curr: TreeNode | null = root;

  while (curr !== null) {
    path.push(curr.val);

    steps.push({
      tree: root,
      current: curr.val,
      val: targetVal,
      decision: `比对当前节点 ${curr.val}`,
      found: false,
      path: [...path],
      targetSubtree: null,
      action: 'enter',
      stageId: 'stage-1',
      message: `到达节点 ${curr.val}，比对目标值 val (${targetVal}) 与节点值 (${curr.val})。`,
      log: `check node: ${curr.val}`,
      codeLine: BST_SEARCH_STAGE1_LINES.whileCheck,
      metrics: { '当前比对节点': curr.val, '分支转向决策': '正在比对', '搜索命中状态': '查找中' },
    });

    if (curr.val === targetVal) {
      found = true;
      targetSubtree = curr;

      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '命中目标',
        found: true,
        path: [...path],
        targetSubtree: curr,
        action: 'found',
        stageId: 'stage-1',
        message: `🎯 命中目标！节点 ${curr.val} == ${targetVal}，返回以此节点为根的子树。`,
        log: `✓ 命中目标: ${curr.val} == ${targetVal}`,
        codeLine: BST_SEARCH_STAGE1_LINES.match,
        metrics: { '当前比对节点': curr.val, '分支转向决策': '精准命中', '搜索命中状态': '已命中' },
      });
      break;
    } else if (targetVal < curr.val) {
      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '转向左子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'left',
        stageId: 'stage-1',
        message: `目标值 ${targetVal} < 当前节点 ${curr.val}，根据 BST 有序性，目标只可能在左子树。`,
        log: `${targetVal} < ${curr.val} -> 搜左子树`,
        codeLine: BST_SEARCH_STAGE1_LINES.goLeft,
        metrics: { '当前比对节点': curr.val, '分支转向决策': '单向左剪枝 (Left)', '搜索命中状态': '查找中' },
      });
      curr = curr.left;
    } else {
      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '转向右子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'right',
        stageId: 'stage-1',
        message: `目标值 ${targetVal} > 当前节点 ${curr.val}，根据 BST 有序性，目标只可能在右子树。`,
        log: `${targetVal} > ${curr.val} -> 搜右子树`,
        codeLine: BST_SEARCH_STAGE1_LINES.goRight,
        metrics: { '当前比对节点': curr.val, '分支转向决策': '单向右剪枝 (Right)', '搜索命中状态': '查找中' },
      });
      curr = curr.right;
    }
  }

  if (!found) {
    steps.push({
      tree: root,
      current: null,
      val: targetVal,
      decision: '未找到',
      found: false,
      path: [...path],
      targetSubtree: null,
      action: 'not-found',
      stageId: 'stage-1',
      message: `❌ 遍历到达空指针 (null)，BST 中不存在值为 ${targetVal} 的节点，返回 null。`,
      log: `✓ 未找到目标 ${targetVal} (null)`,
      codeLine: BST_SEARCH_STAGE1_LINES.notFound,
      metrics: { '当前比对节点': 'null', '分支转向决策': '触底空节点', '搜索命中状态': '未找到' },
    });
  }

  steps.push({
    tree: root,
    current: found ? targetSubtree!.val : null,
    val: targetVal,
    decision: found ? '搜索成功' : '搜索失败',
    found,
    path: [...path],
    targetSubtree,
    action: 'done',
    stageId: 'stage-1',
    message: found
      ? `🎉 搜索完成！在路径 [${path.join(' → ')}] 上成功定位到目标节点 ${targetVal}。`
      : `❌ 搜索完成！未在树中检索到节点 ${targetVal}。`,
    log: found ? `✓ 搜索完成: 命中 ${targetVal}` : `✓ 搜索完成: 未找到 ${targetVal}`,
    codeLine: BST_SEARCH_STAGE1_LINES.done,
    metrics: {
      '当前比对节点': found ? targetSubtree!.val : '—',
      '分支转向决策': found ? '检索成功终止' : '全树无目标',
      '搜索命中状态': found ? '已命中' : '未找到',
    },
  });

  return steps;
}

// ============================================================
// Stage 2: 递归分支剪枝查找 (Recursive BST Search · LC 700)
// ============================================================
export function buildBstSearchStage2RecursiveSteps(root: TreeNode | null, targetVal: number): BSTSStep[] {
  const steps: BSTSStep[] = [];
  const path: number[] = [];
  let found = false;
  let targetSubtree: TreeNode | null = null;

  steps.push({
    tree: root,
    current: null,
    val: targetVal,
    decision: '准备递归搜索',
    found: false,
    path: [],
    targetSubtree: null,
    action: 'enter',
    stageId: 'stage-2',
    message: root
      ? `递归分治搜索启动：目标值 val = ${targetVal}，从根节点 ${root.val} 递归深入。`
      : '空树，直接返回 null。',
    log: root ? `searchBST(root: ${root.val}, val: ${targetVal})` : 'root is null -> return null',
    codeLine: BST_SEARCH_STAGE2_LINES.entry,
    metrics: { '当前比对节点': '—', '分支转向决策': '准备递归', '搜索命中状态': '未开始' },
  });

  function search(node: TreeNode | null): TreeNode | null {
    if (!node) {
      steps.push({
        tree: root,
        current: null,
        val: targetVal,
        decision: '递归基底：空节点',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'not-found',
        stageId: 'stage-2',
        message: '抵达空节点，返回 null。',
        log: 'return null',
        codeLine: BST_SEARCH_STAGE2_LINES.baseCheck,
        metrics: { '当前比对节点': 'null', '分支转向决策': '递归返回 null', '搜索命中状态': '未命中' },
      });
      return null;
    }

    path.push(node.val);

    steps.push({
      tree: root,
      current: node.val,
      val: targetVal,
      decision: `递归检查节点 ${node.val}`,
      found: false,
      path: [...path],
      targetSubtree: null,
      action: 'enter',
      stageId: 'stage-2',
      message: `进入函数栈 searchBST(${node.val}, ${targetVal})，校验是否命中。`,
      log: `visit ${node.val}`,
      codeLine: BST_SEARCH_STAGE2_LINES.baseCheck,
      metrics: { '当前比对节点': node.val, '分支转向决策': '校验节点值', '搜索命中状态': '查找中' },
    });

    if (node.val === targetVal) {
      found = true;
      targetSubtree = node;
      steps.push({
        tree: root,
        current: node.val,
        val: targetVal,
        decision: '🎯 命中目标！直接返回子树',
        found: true,
        path: [...path],
        targetSubtree: node,
        action: 'found',
        stageId: 'stage-2',
        message: `节点 ${node.val} == ${targetVal} 命中目标！返回以此为根的子树。`,
        log: `hit target: ${node.val}`,
        codeLine: BST_SEARCH_STAGE2_LINES.match,
        metrics: { '当前比对节点': node.val, '分支转向决策': '递归终止返回', '搜索命中状态': '已命中' },
      });
      return node;
    }

    if (targetVal < node.val) {
      steps.push({
        tree: root,
        current: node.val,
        val: targetVal,
        decision: '递归进入左子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'left',
        stageId: 'stage-2',
        message: `${targetVal} < ${node.val}，递归下探左孩子 searchBST(node.left, ${targetVal})。`,
        log: `recurse left: ${node.val}`,
        codeLine: BST_SEARCH_STAGE2_LINES.recurseLeft,
        metrics: { '当前比对节点': node.val, '分支转向决策': '向左递归', '搜索命中状态': '查找中' },
      });
      return search(node.left);
    } else {
      steps.push({
        tree: root,
        current: node.val,
        val: targetVal,
        decision: '递归进入右子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'right',
        stageId: 'stage-2',
        message: `${targetVal} > ${node.val}，递归下探右孩子 searchBST(node.right, ${targetVal})。`,
        log: `recurse right: ${node.val}`,
        codeLine: BST_SEARCH_STAGE2_LINES.recurseRight,
        metrics: { '当前比对节点': node.val, '分支转向决策': '向右递归', '搜索命中状态': '查找中' },
      });
      return search(node.right);
    }
  }

  const result = search(root);

  steps.push({
    tree: root,
    current: result ? result.val : null,
    val: targetVal,
    decision: result ? '递归搜索成功' : '递归搜索失败',
    found: !!result,
    path: [...path],
    targetSubtree: result,
    action: 'done',
    stageId: 'stage-2',
    message: result
      ? `✅ 递归搜索成功！返回节点 【${result.val}】 的子树。`
      : '❌ 递归搜索结束，树中不存在该节点，返回 null。',
    log: `done stage-2 result=${result ? result.val : 'null'}`,
    codeLine: BST_SEARCH_STAGE2_LINES.done,
    metrics: {
      '当前比对节点': result ? result.val : '—',
      '分支转向决策': result ? '递归成功返回' : '全树无目标',
      '搜索命中状态': result ? '已命中' : '未找到',
    },
  });

  return steps;
}

// ============================================================
// Stage 3: 搜索未命中定点动态插入 (BST Search & Insert · LC 701)
// ============================================================
export function buildBstSearchStage3InsertSteps(initialRoot: TreeNode | null, targetVal: number): BSTSStep[] {
  const steps: BSTSStep[] = [];
  const path: number[] = [];

  // 克隆树以防修改外部状态
  const root = cloneTree(initialRoot);

  steps.push({
    tree: cloneTree(root),
    current: null,
    val: targetVal,
    decision: '准备动态插入检索',
    found: false,
    path: [],
    targetSubtree: null,
    action: 'enter',
    stageId: 'stage-3',
    message: root
      ? `启动 BST 检索与动态插入：目标值 val = ${targetVal}，沿单向分支定位插入挂载槽位。`
      : `树为空，直接新建根节点 TreeNode(${targetVal})。`,
    log: root ? `insertIntoBST(val=${targetVal})` : 'empty tree -> new TreeNode',
    codeLine: BST_SEARCH_STAGE3_LINES.entry,
    metrics: { '当前比对节点': '—', '分支转向决策': '准备插入检索', '搜索命中状态': '检索槽位中' },
  });

  if (!root) {
    const newRoot: TreeNode = { val: targetVal, left: null, right: null };
    steps.push({
      tree: newRoot,
      current: targetVal,
      val: targetVal,
      decision: '空树插入作为根节点',
      found: true,
      path: [targetVal],
      targetSubtree: newRoot,
      action: 'insert',
      stageId: 'stage-3',
      insertedVal: targetVal,
      message: `树为空，直接创建新根节点 【${targetVal}】。`,
      log: `created root ${targetVal}`,
      codeLine: BST_SEARCH_STAGE3_LINES.emptyRoot,
      metrics: { '当前比对节点': targetVal, '分支转向决策': '创建新根', '搜索命中状态': '已挂载' },
    });
    steps.push({
      tree: newRoot,
      current: targetVal,
      val: targetVal,
      decision: '插入构建完成',
      found: true,
      path: [targetVal],
      targetSubtree: newRoot,
      action: 'done',
      stageId: 'stage-3',
      insertedVal: targetVal,
      message: `🎉 插入完成！新树根节点为 【${targetVal}】。`,
      log: 'done insert',
      codeLine: BST_SEARCH_STAGE3_LINES.done,
      metrics: { '当前比对节点': targetVal, '分支转向决策': '成功退出', '搜索命中状态': '已挂载' },
    });
    return steps;
  }

  let cur: TreeNode = root;

  while (true) {
    path.push(cur.val);

    steps.push({
      tree: cloneTree(root),
      current: cur.val,
      val: targetVal,
      decision: `探查节点 ${cur.val}`,
      found: false,
      path: [...path],
      targetSubtree: null,
      action: 'enter',
      stageId: 'stage-3',
      message: `到达节点 ${cur.val}，比对待插入值 ${targetVal} 与 ${cur.val}。`,
      log: `check slot: ${cur.val}`,
      codeLine: BST_SEARCH_STAGE3_LINES.whileSearch,
      metrics: { '当前比对节点': cur.val, '分支转向决策': '探查槽位', '搜索命中状态': '寻路中' },
    });

    if (cur.val === targetVal) {
      steps.push({
        tree: cloneTree(root),
        current: cur.val,
        val: targetVal,
        decision: '节点已存在，无需插入',
        found: true,
        path: [...path],
        targetSubtree: cur,
        action: 'found',
        stageId: 'stage-3',
        message: `目标值 ${targetVal} 在树中已经存在（节点 ${cur.val}），保持原样直接返回。`,
        log: `already exists: ${cur.val}`,
        codeLine: BST_SEARCH_STAGE3_LINES.done,
        metrics: { '当前比对节点': cur.val, '分支转向决策': '值已存在', '搜索命中状态': '已有节点' },
      });
      break;
    }

    if (targetVal < cur.val) {
      steps.push({
        tree: cloneTree(root),
        current: cur.val,
        val: targetVal,
        decision: '目标偏小，检查左槽位',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'left',
        stageId: 'stage-3',
        message: `${targetVal} < ${cur.val}，检查左子节点是否为空。`,
        log: `check left of ${cur.val}`,
        codeLine: BST_SEARCH_STAGE3_LINES.checkLeft,
        metrics: { '当前比对节点': cur.val, '分支转向决策': '向左校验槽位', '搜索命中状态': '寻路中' },
      });

      if (!cur.left) {
        cur.left = { val: targetVal, left: null, right: null };
        steps.push({
          tree: cloneTree(root),
          current: targetVal,
          val: targetVal,
          decision: `🎉 锁定左空位！挂载新叶子节点 ${targetVal}`,
          found: true,
          path: [...path, targetVal],
          targetSubtree: cur.left,
          action: 'insert',
          stageId: 'stage-3',
          insertedVal: targetVal,
          message: `节点 ${cur.val} 的左孩子为空！将新节点 【${targetVal}】 挂载为 ${cur.val} 的左叶子！`,
          log: `cur.left = new TreeNode(${targetVal})`,
          codeLine: BST_SEARCH_STAGE3_LINES.insertLeft,
          metrics: { '当前比对节点': targetVal, '分支转向决策': '挂载左叶子', '搜索命中状态': '已挂载新节点' },
        });
        break;
      }
      cur = cur.left;
    } else {
      steps.push({
        tree: cloneTree(root),
        current: cur.val,
        val: targetVal,
        decision: '目标偏大，检查右槽位',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'right',
        stageId: 'stage-3',
        message: `${targetVal} > ${cur.val}，检查右子节点是否为空。`,
        log: `check right of ${cur.val}`,
        codeLine: BST_SEARCH_STAGE3_LINES.checkRight,
        metrics: { '当前比对节点': cur.val, '分支转向决策': '向右校验槽位', '搜索命中状态': '寻路中' },
      });

      if (!cur.right) {
        cur.right = { val: targetVal, left: null, right: null };
        steps.push({
          tree: cloneTree(root),
          current: targetVal,
          val: targetVal,
          decision: `🎉 锁定右空位！挂载新叶子节点 ${targetVal}`,
          found: true,
          path: [...path, targetVal],
          targetSubtree: cur.right,
          action: 'insert',
          stageId: 'stage-3',
          insertedVal: targetVal,
          message: `节点 ${cur.val} 的右孩子为空！将新节点 【${targetVal}】 挂载为 ${cur.val} 的右叶子！`,
          log: `cur.right = new TreeNode(${targetVal})`,
          codeLine: BST_SEARCH_STAGE3_LINES.insertRight,
          metrics: { '当前比对节点': targetVal, '分支转向决策': '挂载右叶子', '搜索命中状态': '已挂载新节点' },
        });
        break;
      }
      cur = cur.right;
    }
  }

  steps.push({
    tree: cloneTree(root),
    current: targetVal,
    val: targetVal,
    decision: 'BST 动态插入全部完成',
    found: true,
    path: [...path, targetVal],
    targetSubtree: null,
    action: 'done',
    stageId: 'stage-3',
    insertedVal: targetVal,
    message: `✅ BST 动态插入全部完成！新节点 ${targetVal} 已成功融合至树中且保持严格单调有序。`,
    log: `done insert stage-3`,
    codeLine: BST_SEARCH_STAGE3_LINES.done,
    metrics: { '当前比对节点': targetVal, '分支转向决策': '维护完成', '搜索命中状态': '成功融合' },
  });

  return steps;
}

// ============================================================
// 画布渲染器
// ============================================================
export function renderBstSearchCanvas(
  container: HTMLElement,
  step: BSTSStep,
  stageId: 'stage-1' | 'stage-2' | 'stage-3' = 'stage-1'
) {
  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.insertedVal != null ? step.insertedVal : step.found ? step.current : step.current,
    secondaryHighlightedNodes: step.path,
    primaryColor: step.insertedVal != null ? '#8b5cf6' : step.found ? '#16a34a' : '#3b82f6',
    secondaryColor: '#fbbf24',
  });

  const root = container.closest('#algo-bst-search-view') || container.parentElement;
  if (root) {
    const curEl = root.querySelector('#metric-cur-node');
    const decEl = root.querySelector('#metric-branch-decision');
    const foundEl = root.querySelector('#metric-found-status') as HTMLElement | null;

    if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
    if (decEl) decEl.textContent = step.decision;
    if (foundEl) {
      if (step.insertedVal != null) {
        foundEl.textContent = '已挂载新节点';
        foundEl.style.color = '#8b5cf6';
      } else if (step.found) {
        foundEl.textContent = '已命中目标';
        foundEl.style.color = '#16a34a';
      } else if (step.action === 'not-found') {
        foundEl.textContent = '未找到 (null)';
        foundEl.style.color = '#ef4444';
      } else {
        foundEl.textContent = '检索中';
        foundEl.style.color = '#2563eb';
      }
    }

    // 在 Card 2 中展示检索路径与决策
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      const pathBadges = step.path.map((val) => {
        const isTarget = val === step.val;
        const bg = isTarget ? '#dcfce7' : '#eff6ff';
        const border = isTarget ? '#86efac' : '#bfdbfe';
        const col = isTarget ? '#166534' : '#1e40af';
        return `<span style="padding: 2px 7px; background: ${bg}; border: 1px solid ${border}; border-radius: 4px; font-weight: 700; color: ${col}; font-family: monospace;">${val}</span>`;
      }).join(' → ') || '<span style="color: #94a3b8; font-style: italic;">未开始</span>';

      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
            <span style="font-weight: 700; color: #92400e;">🎯 检索目标数值:</span>
            <span style="font-family: monospace; font-size: 13px; font-weight: 700; color: #b45309;">val = ${step.val}</span>
          </div>

          <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 10.5px; color: #64748b; margin-bottom: 4px;">🛤️ 检索下潜路径 (Path):</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
              ${pathBadges}
            </div>
          </div>

          <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
            <div>${step.message}</div>
          </div>
        </div>
      `;
    }
  }
}

// ============================================================
// 声明式算法注册 (Multi-Stage Evolution)
// ============================================================
export const bstSearchVisualizer = registerDeclarativeAlgorithm<BSTSStep>({
  id: 'bst-search',
  aliases: ['leetcode-700', 'bst-search'],
  name: '二叉搜索树中的搜索',
  category: 'tree',
  icon: '🔍',
  badge: {
    mode: '多阶段演化: 迭代剪枝 · 递归分治 · 动态插入',
    complexity: 'O(log N) · O(1)',
  },
  card1Title: '📊 BST 拓扑结构与检索路径沙盘',
  card2Title: '🧭 单向分支决策与查找状态监视器',
  card2Desc: '当前检查节点、目标比对关系与已走过检索路径',
  legend: [
    { label: '命中目标节点', color: '#16a34a' },
    { label: '新插入节点', color: '#8b5cf6' },
    { label: '搜索路径节点', color: '#fbbf24' },
    { label: '当前比对节点', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: 'BST 树层序',
      type: 'text',
      defaultValue: '4, 2, 7, 1, 3',
      width: '140px',
      placeholder: '4, 2, 7, 1, 3',
    },
    {
      id: 'input-target',
      label: '目标值 val',
      type: 'number',
      defaultValue: 2,
      width: '45px',
    },
  ],
  presets: [
    { label: '命中示例 (val=2)', values: { 'input-tree': '4, 2, 7, 1, 3', 'input-target': 2 } },
    { label: '不存在值 (val=5)', values: { 'input-tree': '4, 2, 7, 1, 3', 'input-target': 5 } },
    { label: '多层大型 BST (val=15)', values: { 'input-tree': '10, 5, 20, 3, 7, 15, 25', 'input-target': 15 } },
  ],
  metrics: [
    { id: 'cur-node', label: '当前比对节点', color: '#3b82f6' },
    { id: 'branch-decision', label: '分支转向决策', color: '#f59e0b' },
    { id: 'found-status', label: '搜索命中状态', color: '#16a34a' },
  ],
  codeLanguages: BST_SEARCH_CODE_LANGUAGES,
  problemHtml: BST_SEARCH_PROBLEM_HTML,
  analysisHtml: BST_SEARCH_ANALYSIS_HTML,

  // 核心多阶段演化体系
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 迭代单向剪枝查找 (Iterative BST Search · O(1) 空间)',
      shortName: '迭代剪枝',
      num: 1,
      badge: {
        mode: '迭代循环 · 零递归开销',
        complexity: 'O(log N) · O(1)',
      },
      card1Title: '📊 BST 迭代检索路径沙盘',
      card2Title: '🧭 单向分支决策与查找状态监视器',
      card2Desc: '当前检查节点、目标比对关系与已走过检索路径',
      codeLanguages: BST_SEARCH_STAGE1_ITERATIVE_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
        const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
        const root = buildTree(arr);
        const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
        return buildBSTSearchSteps(root, target);
      },
      renderCanvas: (container, step) => renderBstSearchCanvas(container, step, 'stage-1'),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 递归分支剪枝查找 (Recursive Divide & Conquer · O(H) 栈深度)',
      shortName: '递归分治',
      num: 2,
      badge: {
        mode: '递归分治 · 函数调用栈',
        complexity: 'O(log N) · O(H)',
      },
      card1Title: '🌲 BST 递归深入与分治拓扑沙盘',
      card2Title: '🧭 递归栈深度与分支下探监视器',
      card2Desc: '自顶向下分治递归，单向分支深入直到基底条件命中',
      codeLanguages: BST_SEARCH_STAGE2_RECURSIVE_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
        const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
        const root = buildTree(arr);
        const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
        return buildBstSearchStage2RecursiveSteps(root, target);
      },
      renderCanvas: (container, step) => renderBstSearchCanvas(container, step, 'stage-2'),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 搜索未命中定点动态插入 (BST Search & Insert · LC 701 读写闭环)',
      shortName: '动态插入',
      num: 3,
      badge: {
        mode: '寻路插入 · 读写闭环',
        complexity: 'O(log N) · O(1)',
      },
      card1Title: '🌱 动态插入与叶子槽位挂载沙盘',
      card2Title: '🧭 空槽位锁定与节点挂载监视器',
      card2Desc: '未命中时顺承下潜路径将新节点作为叶子挂载，维持全局单调性',
      codeLanguages: BST_SEARCH_STAGE3_INSERT_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
        const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
        const root = buildTree(arr);
        const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
        return buildBstSearchStage3InsertSteps(root, target);
      },
      renderCanvas: (container, step) => renderBstSearchCanvas(container, step, 'stage-3'),
    },
  ],

  // 遗留兜底
  generateSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
    const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
    const root = buildTree(arr);
    const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
    return buildBSTSearchSteps(root, target);
  },
  buildSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
    const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
    const root = buildTree(arr);
    const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
    return buildBSTSearchSteps(root, target);
  },
  renderCanvas: (container, step) => renderBstSearchCanvas(container, step, 'stage-1'),
});
