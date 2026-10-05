/**
 * 删除二叉搜索树中的节点可视化器 (Delete Node in a BST · LeetCode 450)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 *
 * Stage 1: 递归直接嫁接删除 (Recursive Child Grafting · LC 450 优雅指针重连)
 * Stage 2: 递归后继节点值覆盖 (Recursive Successor Replacement · 算法导论经典解法)
 * Stage 3: 双指针显式迭代删除 (Iterative Two-Pointers BST Deletion · O(1) 辅助空间)
 */

import { parseTreeArray, parseNumber } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceAdapter,
  RecursiveCallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  BST_DELETE_PROBLEM_HTML,
  BST_DELETE_ANALYSIS_HTML,
} from './bst-delete-problem-content';
import {
  BST_DELETE_STAGE1_GRAFT_CODE,
  BST_DELETE_STAGE1_LINES,
  BST_DELETE_STAGE2_REPLACE_CODE,
  BST_DELETE_STAGE2_LINES,
  BST_DELETE_STAGE3_ITERATIVE_CODE,
  BST_DELETE_STAGE3_LINES,
} from './bst-delete-stage-codes';

export interface BSTDeleteStep {
  tree: TreeNode | null;
  currentVal: number | null;
  targetKey: number;
  parentVal?: number | null;
  successorVal?: number | null;
  decision: string;
  action: 'search' | 'match' | 'delete' | 'graft' | 'replace' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  callTrace?: RecursiveCallTraceSnapshot;
  stageId?: string;
  highlightedNodes?: number[];
  visitedNodes?: number[];
  secondaryHighlightedNodes?: number[];
  metrics?: Record<string, string | number>;
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

/**
 * 收集树中所有节点值
 */
export function collectTreeValues(node: TreeNode | null): number[] {
  if (!node) return [];
  const res: number[] = [];
  const queue: TreeNode[] = [node];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    res.push(cur.val);
    if (cur.left) queue.push(cur.left);
    if (cur.right) queue.push(cur.right);
  }
  return res;
}

// =========================================================================
// Stage 1: 递归直接嫁接删除 (LC 450 指针重连)
// =========================================================================
export function buildBstDeleteStage1Steps(root: TreeNode | null, key: number): BSTDeleteStep[] {
  const steps: BSTDeleteStep[] = [];
  const trace = new RecursiveCallTraceBuilder();

  // 空树防守
  if (!root) {
    trace.addHeader(`deleteNode(root=null, key=${key})`, 0, '空树边界检查');
    trace.addConditionHit('root == null -> return null', 0, '树为空，无节点可删');
    trace.addFinalResult('return null', 0, '结束', 'null');
    steps.push({
      tree: null,
      currentVal: null,
      targetKey: key,
      decision: '二叉树为空，无需删除任何节点',
      action: 'done',
      message: `树为空，目标键 ${key} 无法在空树中找到，直接返回 null。`,
      log: 'root == null -> return null',
      codeLine: BST_DELETE_STAGE1_LINES.baseNull,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      metrics: { '目标键': key, '当前根节点': 'null', '结果状态': '空树直接返回' },
    });
    return steps;
  }

  trace.addHeader(`deleteNode(root=${root.val}, key=${key})`, 0, '启动 Stage 1 递归直接嫁接删除');
  steps.push({
    tree: cloneTree(root),
    currentVal: root.val,
    targetKey: key,
    decision: `开始在 BST 中检索并删除节点 key=${key}`,
    action: 'search',
    message: `准备从根节点 ${root.val} 开始按二叉搜索树性质查找并删除目标键 ${key}。`,
    log: `Start deleteNode with key ${key}`,
    codeLine: BST_DELETE_STAGE1_LINES.entry,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    highlightedNodes: [root.val],
    visitedNodes: [],
    metrics: { '目标键': key, '当前检查': root.val, '操作阶段': '入口初始化' },
  });

  const visitedPath: number[] = [];

  function deleteNodeRec(node: TreeNode | null, depth: number): TreeNode | null {
    if (!node) {
      trace.addConditionHit(`node == null (key=${key} 未找到)`, depth, '遇到空指针，目标不存在');
      steps.push({
        tree: cloneTree(root),
        currentVal: null,
        targetKey: key,
        decision: `遍历到空节点，键值 ${key} 不在树中`,
        action: 'done',
        message: `向深处搜索未找到键值等于 ${key} 的节点，子树返回 null。`,
        log: `Key ${key} not found, return null`,
        codeLine: BST_DELETE_STAGE1_LINES.baseNull,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: [],
        visitedNodes: [...visitedPath],
        metrics: { '目标键': key, '当前状态': '未找到目标键' },
      });
      return null;
    }

    visitedPath.push(node.val);

    if (key < node.val) {
      trace.addRecursePrep(`key(${key}) < node(${node.val})，深入左子树`, depth, `向左分支递归`);
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        decision: `目标 ${key} < 当前节点 ${node.val}，向左子树递归查找`,
        action: 'search',
        message: `根据 BST 性质，${key} 严格小于节点值 ${node.val}，向左子树下潜查找。`,
        log: `${key} < ${node.val} -> go left`,
        codeLine: BST_DELETE_STAGE1_LINES.searchLeft,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: [node.val],
        visitedNodes: visitedPath.filter((v) => v !== node.val),
        metrics: { '目标键': key, '当前比较': `${key} < ${node.val}`, '下潜方向': '左子树' },
      });

      node.left = deleteNodeRec(node.left, depth + 1);

      trace.addUnwindCalc(`左子树递归返回，重挂载到 node(${node.val}).left`, depth, `node.left 更新完毕`, `node(${node.val})`);
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        decision: `左子树删除完成，已重新接回节点 ${node.val} 的左指针`,
        action: 'graft',
        message: `左子树调整完成，父节点 ${node.val} 保持 BST 平衡连接。`,
        log: `Left child updated for ${node.val}`,
        codeLine: BST_DELETE_STAGE1_LINES.returnRoot,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: [node.val],
        visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
        metrics: { '当前根': node.val, '左孩子': node.left ? node.left.val : 'null' },
      });
      return node;
    }

    if (key > node.val) {
      trace.addRecursePrep(`key(${key}) > node(${node.val})，深入右子树`, depth, `向右分支递归`);
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        decision: `目标 ${key} > 当前节点 ${node.val}，向右子树递归查找`,
        action: 'search',
        message: `根据 BST 性质，${key} 严格大于节点值 ${node.val}，向右子树下潜查找。`,
        log: `${key} > ${node.val} -> go right`,
        codeLine: BST_DELETE_STAGE1_LINES.searchRight,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: [node.val],
        visitedNodes: visitedPath.filter((v) => v !== node.val),
        metrics: { '目标键': key, '当前比较': `${key} > ${node.val}`, '下潜方向': '右子树' },
      });

      node.right = deleteNodeRec(node.right, depth + 1);

      trace.addUnwindCalc(`右子树递归返回，重挂载到 node(${node.val}).right`, depth, `node.right 更新完毕`, `node(${node.val})`);
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        decision: `右子树删除完成，已重新接回节点 ${node.val} 的右指针`,
        action: 'graft',
        message: `右子树调整完成，父节点 ${node.val} 保持 BST 平衡连接。`,
        log: `Right child updated for ${node.val}`,
        codeLine: BST_DELETE_STAGE1_LINES.returnRoot,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: [node.val],
        visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
        metrics: { '当前根': node.val, '右孩子': node.right ? node.right.val : 'null' },
      });
      return node;
    }

    // 命中目标节点 key === node.val
    trace.addConditionHit(`命中目标节点 node.val == ${node.val}`, depth, '准备按五种情况之一执行删除');
    steps.push({
      tree: cloneTree(root),
      currentVal: node.val,
      targetKey: key,
      decision: `🎯 命中目标节点 ${node.val}，分析子树形态`,
      action: 'match',
      message: `找到需要删除的节点 ${node.val}。检查左右孩子：左孩子=${node.left ? node.left.val : 'null'}，右孩子=${node.right ? node.right.val : 'null'}。`,
      log: `Found node ${node.val} to delete`,
      codeLine: BST_DELETE_STAGE1_LINES.foundMatch,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val],
      visitedNodes: visitedPath.filter((v) => v !== node.val),
      metrics: {
        '目标节点': node.val,
        '左孩子': node.left ? node.left.val : 'null',
        '右孩子': node.right ? node.right.val : 'null',
      },
    });

    // 情况 1: 左孩子为空（含叶子节点），右孩子直接上位
    if (!node.left) {
      const rep = node.right;
      trace.addReturnLeaf(`左孩子为空，右孩子 ${rep ? rep.val : 'null'} 晋升替代`, depth, rep ? String(rep.val) : 'null');
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        successorVal: rep ? rep.val : undefined,
        decision: `左孩子为空，节点 ${node.val} 被移除，右孩子 ${rep ? rep.val : 'null'} 直接上位`,
        action: 'delete',
        message: `节点 ${node.val} 的左子树为空，将其删除后，右子树直接接管当前位置并向父层返回。`,
        log: `Delete ${node.val}, promote right child ${rep ? rep.val : 'null'}`,
        codeLine: BST_DELETE_STAGE1_LINES.leftNull,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: rep ? [rep.val] : [],
        visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
        metrics: { '被删节点': node.val, '替代晋升节点': rep ? rep.val : 'null' },
      });
      return rep;
    }

    // 情况 2: 右孩子为空，左孩子直接上位
    if (!node.right) {
      const rep = node.left;
      trace.addReturnLeaf(`右孩子为空，左孩子 ${rep.val} 晋升替代`, depth, String(rep.val));
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        successorVal: rep.val,
        decision: `右孩子为空，节点 ${node.val} 被移除，左孩子 ${rep.val} 直接上位`,
        action: 'delete',
        message: `节点 ${node.val} 的右子树为空，将其删除后，左孩子 ${rep.val} 直接接管当前位置并向父层返回。`,
        log: `Delete ${node.val}, promote left child ${rep.val}`,
        codeLine: BST_DELETE_STAGE1_LINES.rightNull,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: [rep.val],
        visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
        metrics: { '被删节点': node.val, '替代晋升节点': rep.val },
      });
      return rep;
    }

    // 情况 3: 左右孩子均非空 -> 寻找右子树最左节点，执行左子树嫁接
    trace.addConditionPass(`左右俱在：定位右子树最左节点`, depth, `查找右子树极左叶子`);
    let cur = node.right;
    steps.push({
      tree: cloneTree(root),
      currentVal: node.val,
      targetKey: key,
      successorVal: cur.val,
      decision: `双子树非空：从右子树根 ${cur.val} 开始寻找最左后继节点`,
      action: 'match',
      message: `左右孩子俱在，进入右子树 ${cur.val}，一路向左查找值最小的极左叶节点。`,
      log: `Start finding min in right subtree of ${node.val}`,
      codeLine: BST_DELETE_STAGE1_LINES.findSuccessor,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val, cur.val],
      visitedNodes: collectTreeValues(root).filter((v) => v !== node.val && v !== cur.val),
      metrics: { '目标节点': node.val, '右子树根': cur.val },
    });

    while (cur.left) {
      cur = cur.left;
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        successorVal: cur.val,
        decision: `沿左指针深入至更小节点 ${cur.val}`,
        action: 'match',
        message: `继续向左移动，当前探测到更小的后继备选节点 ${cur.val}。`,
        log: `Moved left to min node ${cur.val}`,
        codeLine: BST_DELETE_STAGE1_LINES.loopSuccessor,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: [cur.val],
        visitedNodes: collectTreeValues(root).filter((v) => v !== cur.val),
        metrics: { '后继搜寻中': cur.val },
      });
    }

    // 此时 cur 是右子树中最左叶子，把 node.left 挂载到 cur.left
    cur.left = node.left;
    trace.addConditionPass(`将左子树(${node.left.val})嫁接到最左叶子(${cur.val}).left`, depth, `嫁接连接成功`);
    steps.push({
      tree: cloneTree(root),
      currentVal: node.val,
      targetKey: key,
      successorVal: cur.val,
      decision: `🌱 将原左子树(根为 ${node.left.val})整体嫁接到节点 ${cur.val} 的左孩子指针`,
      action: 'graft',
      message: `关键重构：将节点 ${node.val} 的原左子树整体挂在右子树最左节点 ${cur.val} 的左指针上，完全保留中序单调性。`,
      log: `Grafted left subtree to node ${cur.val}.left`,
      codeLine: BST_DELETE_STAGE1_LINES.attachGraft,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [cur.val, node.left.val],
      visitedNodes: collectTreeValues(root).filter((v) => v !== cur.val && v !== node.left!.val),
      metrics: { '嫁接挂载点': cur.val, '被嫁接左子树根': node.left.val },
    });

    // 右孩子节点上位成为新根
    const newSubRoot = node.right;
    trace.addReturnLeaf(`节点 ${node.val} 删除，原右孩子 ${newSubRoot.val} 晋升为子树新根`, depth, String(newSubRoot.val));
    steps.push({
      tree: cloneTree(root),
      currentVal: node.val,
      targetKey: key,
      successorVal: newSubRoot.val,
      decision: `节点 ${node.val} 正式移除，原右孩子 ${newSubRoot.val} 晋升为子树新根`,
      action: 'delete',
      message: `节点 ${node.val} 成功脱离，右孩子 ${newSubRoot.val} 晋升接管原位置并返回。`,
      log: `Node ${node.val} removed, promoted ${newSubRoot.val}`,
      codeLine: BST_DELETE_STAGE1_LINES.promoteRight,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [newSubRoot.val],
      visitedNodes: collectTreeValues(root).filter((v) => v !== newSubRoot.val),
      metrics: { '移除节点': node.val, '晋升新根': newSubRoot.val },
    });

    return newSubRoot;
  }

  const finalTree = deleteNodeRec(root, 0);

  trace.addFinalResult('二叉搜索树节点删除与拓扑重构全部完成', 0, `最终根节点: ${finalTree ? finalTree.val : 'null'}`, finalTree ? finalTree.val : 'null');
  steps.push({
    tree: cloneTree(finalTree),
    currentVal: null,
    targetKey: key,
    decision: 'BST 节点删除与拓扑重构全部完成',
    action: 'done',
    message: `删除操作完成！调整后的二叉搜索树严格维持左小右大不变性，根节点为 ${finalTree ? finalTree.val : 'null'}。`,
    log: 'BST deletion complete',
    codeLine: BST_DELETE_STAGE1_LINES.done,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    highlightedNodes: finalTree ? [finalTree.val] : [],
    visitedNodes: collectTreeValues(finalTree),
    metrics: { '最终根节点': finalTree ? finalTree.val : 'null', '剩余节点总数': collectTreeValues(finalTree).length },
  });

  return steps;
}

// =========================================================================
// Stage 2: 递归后继节点值覆盖 (Recursive Successor Replacement)
// =========================================================================
export function buildBstDeleteStage2Steps(root: TreeNode | null, key: number): BSTDeleteStep[] {
  const steps: BSTDeleteStep[] = [];
  const trace = new RecursiveCallTraceBuilder();

  if (!root) {
    trace.addHeader(`deleteNode(root=null, key=${key})`, 0, '空树校验');
    trace.addConditionHit('root == null -> return null', 0, '空树退出');
    trace.addFinalResult('return null', 0, '退出', 'null');
    steps.push({
      tree: null,
      currentVal: null,
      targetKey: key,
      decision: '二叉树为空，无需删除任何节点',
      action: 'done',
      message: `树为空，目标键 ${key} 无法在空树中找到，直接返回 null。`,
      log: 'root == null -> return null',
      codeLine: BST_DELETE_STAGE2_LINES.baseNull,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      metrics: { '目标键': key, '当前状态': '空树直接退出' },
    });
    return steps;
  }

  trace.addHeader(`deleteNode(root=${root.val}, key=${key})`, 0, '启动 Stage 2 递归后继值替换删除');
  steps.push({
    tree: cloneTree(root),
    currentVal: root.val,
    targetKey: key,
    decision: `开始在 BST 中以“后继值替换法”删除 key=${key}`,
    action: 'search',
    message: `从根节点 ${root.val} 开始递归查找键值 ${key}。命中双子树节点时将以右子树极小值覆盖并递归清除。`,
    log: `Start deleteNode replace with key ${key}`,
    codeLine: BST_DELETE_STAGE2_LINES.entry,
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
    highlightedNodes: [root.val],
    visitedNodes: [],
    metrics: { '目标键': key, '策略模式': '后继值覆盖', '当前检查': root.val },
  });

  function deleteNodeRec(node: TreeNode | null, depth: number): TreeNode | null {
    if (!node) {
      trace.addConditionHit(`node == null (key=${key} 未找到)`, depth, '遇到空指针');
      steps.push({
        tree: cloneTree(root),
        currentVal: null,
        targetKey: key,
        decision: `遍历到空节点，键值 ${key} 不在树中`,
        action: 'done',
        message: `向深处搜索未找到键值等于 ${key} 的节点，子树返回 null。`,
        log: `Key ${key} not found in replace mode`,
        codeLine: BST_DELETE_STAGE2_LINES.baseNull,
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        metrics: { '目标键': key, '结果状态': '未找到目标键' },
      });
      return null;
    }

    if (key < node.val) {
      trace.addRecursePrep(`key(${key}) < node(${node.val})，深入左子树`, depth, `向左递归`);
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        decision: `目标 ${key} < 当前节点 ${node.val}，向左子树递归查找`,
        action: 'search',
        message: `根据 BST 性质，${key} < ${node.val}，向左子树下潜查找。`,
        log: `${key} < ${node.val} -> go left`,
        codeLine: BST_DELETE_STAGE2_LINES.searchLeft,
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        highlightedNodes: [node.val],
        visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
        metrics: { '目标键': key, '比较关系': `${key} < ${node.val}` },
      });

      node.left = deleteNodeRec(node.left, depth + 1);

      trace.addUnwindCalc(`左子树删除完成，重连到 node(${node.val}).left`, depth, `node.left 更新完毕`, `node(${node.val})`);
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        decision: `左子树删除完成，重连节点 ${node.val} 的左指针`,
        action: 'graft',
        message: `左子树处理完毕，父节点 ${node.val} 保持引用连接。`,
        log: `Left branch updated for ${node.val}`,
        codeLine: BST_DELETE_STAGE2_LINES.returnRoot,
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        highlightedNodes: [node.val],
        visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
        metrics: { '当前根': node.val, '左孩子': node.left ? node.left.val : 'null' },
      });
      return node;
    }

    if (key > node.val) {
      trace.addRecursePrep(`key(${key}) > node(${node.val})，深入右子树`, depth, `向右递归`);
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        decision: `目标 ${key} > 当前节点 ${node.val}，向右子树递归查找`,
        action: 'search',
        message: `根据 BST 性质，${key} > ${node.val}，向右子树下潜查找。`,
        log: `${key} > ${node.val} -> go right`,
        codeLine: BST_DELETE_STAGE2_LINES.searchRight,
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        highlightedNodes: [node.val],
        visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
        metrics: { '目标键': key, '比较关系': `${key} > ${node.val}` },
      });

      node.right = deleteNodeRec(node.right, depth + 1);

      trace.addUnwindCalc(`右子树删除完成，重连到 node(${node.val}).right`, depth, `node.right 更新完毕`, `node(${node.val})`);
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        decision: `右子树删除完成，重连节点 ${node.val} 的右指针`,
        action: 'graft',
        message: `右子树处理完毕，父节点 ${node.val} 保持引用连接。`,
        log: `Right branch updated for ${node.val}`,
        codeLine: BST_DELETE_STAGE2_LINES.returnRoot,
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        highlightedNodes: [node.val],
        visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
        metrics: { '当前根': node.val, '右孩子': node.right ? node.right.val : 'null' },
      });
      return node;
    }

    // 命中目标节点 key === node.val
    trace.addConditionHit(`🎯 命中目标节点 node.val == ${node.val}`, depth, '分析孩子情况');
    steps.push({
      tree: cloneTree(root),
      currentVal: node.val,
      targetKey: key,
      decision: `🎯 命中目标节点 ${node.val}，准备后继值替换`,
      action: 'match',
      message: `找到需要删除的节点 ${node.val}。`,
      log: `Hit target ${node.val}`,
      codeLine: BST_DELETE_STAGE2_LINES.foundMatch,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [node.val],
      visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
      metrics: { '目标节点': node.val, '左孩子': node.left ? node.left.val : 'null', '右孩子': node.right ? node.right.val : 'null' },
    });

    if (!node.left) {
      const rep = node.right;
      trace.addReturnLeaf(`左孩子为空，右孩子 ${rep ? rep.val : 'null'} 直接替代`, depth, rep ? String(rep.val) : 'null');
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        decision: `左空：节点 ${node.val} 被移除，右孩子 ${rep ? rep.val : 'null'} 上位`,
        action: 'delete',
        message: `左子树为空，直接将右孩子提升上位。`,
        log: `Promote right child ${rep ? rep.val : 'null'}`,
        codeLine: BST_DELETE_STAGE2_LINES.leftNull,
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        highlightedNodes: rep ? [rep.val] : [],
        visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
        metrics: { '被删节点': node.val, '新晋上位': rep ? rep.val : 'null' },
      });
      return rep;
    }

    if (!node.right) {
      const rep = node.left;
      trace.addReturnLeaf(`右孩子为空，左孩子 ${rep.val} 直接替代`, depth, String(rep.val));
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        decision: `右空：节点 ${node.val} 被移除，左孩子 ${rep.val} 上位`,
        action: 'delete',
        message: `右子树为空，直接将左孩子提升上位。`,
        log: `Promote left child ${rep.val}`,
        codeLine: BST_DELETE_STAGE2_LINES.rightNull,
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        highlightedNodes: [rep.val],
        visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
        metrics: { '被删节点': node.val, '新晋上位': rep.val },
      });
      return rep;
    }

    // 左右均在：查找右子树极小节点
    trace.addRecursePrep(`左右俱在：调用 findMin(node.right=${node.right.val})`, depth, `查找右子树后继极小值`);
    steps.push({
      tree: cloneTree(root),
      currentVal: node.val,
      targetKey: key,
      decision: `双子树非空：调用 findMin 搜寻右子树(${node.right.val})极小后继`,
      action: 'search',
      message: `左右孩子均非空，开始探查右子树中的最小节点（后继节点）。`,
      log: `Find min in right subtree of ${node.val}`,
      codeLine: BST_DELETE_STAGE2_LINES.findMinCall,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [node.val, node.right!.val],
      visitedNodes: collectTreeValues(root).filter((v) => v !== node.val && v !== node.right!.val),
      metrics: { '目标节点': node.val, '右子树根': node.right!.val },
    });

    let minNode = node.right!;
    while (minNode.left) {
      minNode = minNode.left;
      steps.push({
        tree: cloneTree(root),
        currentVal: node.val,
        targetKey: key,
        successorVal: minNode.val,
        decision: `探查到更小后继节点 ${minNode.val}`,
        action: 'search',
        message: `一路向左探查，当前后继节点为 ${minNode.val}。`,
        log: `findMin at ${minNode.val}`,
        codeLine: BST_DELETE_STAGE2_LINES.findMinLoop,
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        highlightedNodes: [minNode.val],
        visitedNodes: collectTreeValues(root).filter((v) => v !== minNode.val),
        metrics: { '当前极小备选': minNode.val },
      });
    }

    const successorVal = minNode.val;
    const oldVal = node.val;
    node.val = successorVal;

    trace.addConditionPass(`以极小后继值覆盖当前节点: node.val = ${successorVal}`, depth, `覆盖成功`);
    steps.push({
      tree: cloneTree(root),
      currentVal: successorVal,
      targetKey: key,
      successorVal,
      decision: `🔄 节点值覆盖：用后继值 ${successorVal} 替代原目标值 ${oldVal}`,
      action: 'replace',
      message: `将右子树最小节点值 ${successorVal} 赋值给当前节点（原值 ${oldVal} 被覆盖），保持 BST 中序有序。`,
      log: `Replace node value from ${oldVal} to ${successorVal}`,
      codeLine: BST_DELETE_STAGE2_LINES.replaceVal,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [successorVal],
      visitedNodes: collectTreeValues(root).filter((v) => v !== successorVal),
      metrics: { '旧节点值': oldVal, '新覆盖值(后继)': successorVal },
    });

    // 递归在右子树中删除后继节点
    trace.addRecursePrep(`递归删除右子树中的后继节点(${successorVal})`, depth, `深入右子树清除原后继`);
    steps.push({
      tree: cloneTree(root),
      currentVal: successorVal,
      targetKey: successorVal,
      successorVal,
      decision: `准备递归删除右子树中的后继副本 key=${successorVal}`,
      action: 'search',
      message: `后继节点值已复制完毕，现在递归在右子树中安全清除原后继节点 ${successorVal}。`,
      log: `Delete successor ${successorVal} from right subtree`,
      codeLine: BST_DELETE_STAGE2_LINES.deleteSuccessor,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [successorVal],
      visitedNodes: collectTreeValues(root).filter((v) => v !== successorVal),
      metrics: { '当前节点': successorVal, '待清除副本键': successorVal },
    });

    node.right = deleteNodeRec(node.right, depth + 1);

    trace.addReturnLeaf(`后继节点清除完毕，返回调整后的节点 ${node.val}`, depth, String(node.val));
    steps.push({
      tree: cloneTree(root),
      currentVal: node.val,
      targetKey: key,
      decision: `后继节点清除完毕，节点 ${node.val} 完成平衡修复`,
      action: 'done',
      message: `右子树中的后继副本清除完毕，节点 ${node.val} 左右子树连接健康。`,
      log: `Successor deleted, return node ${node.val}`,
      codeLine: BST_DELETE_STAGE2_LINES.returnRoot,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [node.val],
      visitedNodes: collectTreeValues(root).filter((v) => v !== node.val),
      metrics: { '完成节点': node.val },
    });

    return node;
  }

  const finalTree = deleteNodeRec(root, 0);

  trace.addFinalResult('二叉搜索树后继值替换删除全部完成', 0, `根节点: ${finalTree ? finalTree.val : 'null'}`, finalTree ? finalTree.val : 'null');
  steps.push({
    tree: cloneTree(finalTree),
    currentVal: null,
    targetKey: key,
    decision: 'BST 后继值替换删除全部完成',
    action: 'done',
    message: `删除操作顺利完成！整棵 BST 结构规整，根节点值为 ${finalTree ? finalTree.val : 'null'}。`,
    log: 'BST successor replacement complete',
    codeLine: BST_DELETE_STAGE2_LINES.done,
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
    highlightedNodes: finalTree ? [finalTree.val] : [],
    visitedNodes: collectTreeValues(finalTree),
    metrics: { '最终根节点': finalTree ? finalTree.val : 'null', '剩余节点数': collectTreeValues(finalTree).length },
  });

  return steps;
}

// =========================================================================
// Stage 3: 双指针显式迭代删除 (Iterative Two-Pointers BST Deletion)
// =========================================================================
export function buildBstDeleteStage3Steps(root: TreeNode | null, key: number): BSTDeleteStep[] {
  const steps: BSTDeleteStep[] = [];

  if (!root) {
    steps.push({
      tree: null,
      currentVal: null,
      targetKey: key,
      decision: '二叉树为空，无需删除任何节点',
      action: 'done',
      message: `树为空，目标键 ${key} 无法在空树中找到，直接返回 null。`,
      log: 'root == null -> return null',
      codeLine: BST_DELETE_STAGE3_LINES.notFound,
      stageId: 'stage-3',
      metrics: { '目标键': key, '当前状态': '空树直接退出' },
    });
    return steps;
  }

  let cur: TreeNode | null = root;
  let pre: TreeNode | null = null;

  steps.push({
    tree: cloneTree(root),
    currentVal: cur.val,
    targetKey: key,
    parentVal: null,
    decision: `初始化迭代双指针：cur=${cur.val}, pre=null`,
    action: 'search',
    message: `启动显式双指针迭代法，不使用任何递归栈空间 (O(1) 辅助空间)。`,
    log: `Init iterative deletion with cur=${cur.val}, pre=null`,
    codeLine: BST_DELETE_STAGE3_LINES.init,
    stageId: 'stage-3',
    highlightedNodes: [cur.val],
    visitedNodes: [],
    metrics: { '目标键': key, '当前 cur': cur.val, '父指针 pre': 'null' },
  });

  const visitedPath: number[] = [];

  while (cur && cur.val !== key) {
    const curVal = cur.val;
    visitedPath.push(curVal);
    pre = cur;

    if (key < curVal) {
      steps.push({
        tree: cloneTree(root),
        currentVal: curVal,
        targetKey: key,
        parentVal: pre.val,
        decision: `目标 ${key} < 当前 ${curVal}，向左子树步进`,
        action: 'search',
        message: `当前节点 ${curVal} > 目标 ${key}，令 pre=${curVal}，cur 向左孩子步进。`,
        log: `cur=${curVal} > ${key} -> step left`,
        codeLine: BST_DELETE_STAGE3_LINES.stepLeft,
        stageId: 'stage-3',
        highlightedNodes: [curVal],
        visitedNodes: visitedPath.filter((v) => v !== curVal),
        metrics: { '目标键': key, '当前 cur': curVal, '父指针 pre': pre.val, '步进方向': '左子树' },
      });
      cur = cur.left;
    } else {
      steps.push({
        tree: cloneTree(root),
        currentVal: curVal,
        targetKey: key,
        parentVal: pre.val,
        decision: `目标 ${key} > 当前 ${curVal}，向右子树步进`,
        action: 'search',
        message: `当前节点 ${curVal} < 目标 ${key}，令 pre=${curVal}，cur 向右孩子步进。`,
        log: `cur=${curVal} < ${key} -> step right`,
        codeLine: BST_DELETE_STAGE3_LINES.stepRight,
        stageId: 'stage-3',
        highlightedNodes: [curVal],
        visitedNodes: visitedPath.filter((v) => v !== curVal),
        metrics: { '目标键': key, '当前 cur': curVal, '父指针 pre': pre.val, '步进方向': '右子树' },
      });
      cur = cur.right;
    }
  }

  // 检查是否未命中
  if (!cur) {
    steps.push({
      tree: cloneTree(root),
      currentVal: null,
      targetKey: key,
      parentVal: pre ? pre.val : null,
      decision: `遍历到空指针，目标键 ${key} 不在树中`,
      action: 'done',
      message: `树中无键值为 ${key} 的节点，无需进行任何结构调整，直接返回原树。`,
      log: `Key ${key} not found, return root`,
      codeLine: BST_DELETE_STAGE3_LINES.notFound,
      stageId: 'stage-3',
      highlightedNodes: [],
      visitedNodes: [...visitedPath],
      metrics: { '目标键': key, '查找结果': '未找到' },
    });
    return steps;
  }

  // 命中目标节点 cur
  steps.push({
    tree: cloneTree(root),
    currentVal: cur.val,
    targetKey: key,
    parentVal: pre ? pre.val : null,
    decision: `🎯 命中目标节点 ${cur.val}，父节点 pre=${pre ? pre.val : 'null (根节点)'}`,
    action: 'match',
    message: `定位到目标节点 ${cur.val}，准备调用 deleteOneNode 进行指针单步接管。`,
    log: `Hit target ${cur.val} with parent ${pre ? pre.val : 'null'}`,
    codeLine: pre === null ? BST_DELETE_STAGE3_LINES.matchRoot : (pre.left === cur ? BST_DELETE_STAGE3_LINES.matchLeft : BST_DELETE_STAGE3_LINES.matchRight),
    stageId: 'stage-3',
    highlightedNodes: [cur.val],
    visitedNodes: visitedPath.filter((v) => v !== cur.val),
    metrics: { '目标节点 cur': cur.val, '父节点 pre': pre ? pre.val : 'null' },
  });

  // 单节点删除子函数（嫁接重连）
  function deleteOneNode(target: TreeNode): TreeNode | null {
    if (!target.left) {
      steps.push({
        tree: cloneTree(root),
        currentVal: target.val,
        targetKey: key,
        decision: `目标节点 ${target.val} 无左孩子，右孩子直接晋升`,
        action: 'delete',
        message: `target.left == null，直接返回 target.right。`,
        log: `target ${target.val} left is null`,
        codeLine: BST_DELETE_STAGE3_LINES.deleteLeftNull,
        stageId: 'stage-3',
        highlightedNodes: target.right ? [target.right.val] : [],
        metrics: { '删除节点': target.val, '上位接管': target.right ? target.right.val : 'null' },
      });
      return target.right;
    }
    if (!target.right) {
      steps.push({
        tree: cloneTree(root),
        currentVal: target.val,
        targetKey: key,
        decision: `目标节点 ${target.val} 无右孩子，左孩子直接晋升`,
        action: 'delete',
        message: `target.right == null，直接返回 target.left。`,
        log: `target ${target.val} right is null`,
        codeLine: BST_DELETE_STAGE3_LINES.deleteRightNull,
        stageId: 'stage-3',
        highlightedNodes: [target.left.val],
        metrics: { '删除节点': target.val, '上位接管': target.left.val },
      });
      return target.left;
    }

    let s = target.right;
    while (s.left) {
      s = s.left;
    }
    s.left = target.left;

    steps.push({
      tree: cloneTree(root),
      currentVal: target.val,
      targetKey: key,
      successorVal: s.val,
      decision: `将左子树(${target.left.val})嫁接到右子树极左叶子(${s.val}).left`,
      action: 'graft',
      message: `双子树俱在，将 target 的左子树挂载到其右子树最左节点 ${s.val} 的左孩子上。`,
      log: `Grafted target.left to s(${s.val}).left`,
      codeLine: BST_DELETE_STAGE3_LINES.deleteGraft,
      stageId: 'stage-3',
      highlightedNodes: [s.val, target.left.val],
      metrics: { '极左叶子': s.val, '被嫁接左根': target.left.val },
    });

    return target.right;
  }

  let newRoot = root;
  if (pre === null) {
    newRoot = deleteOneNode(cur)!;
  } else if (pre.left === cur) {
    pre.left = deleteOneNode(cur);
  } else {
    pre.right = deleteOneNode(cur);
  }

  steps.push({
    tree: cloneTree(newRoot),
    currentVal: null,
    targetKey: key,
    decision: '双指针迭代删除全部完成',
    action: 'done',
    message: `显式双指针调整完毕！全程保持 O(1) 辅助空间，新树根为 ${newRoot ? newRoot.val : 'null'}。`,
    log: 'Iterative BST delete done',
    codeLine: BST_DELETE_STAGE3_LINES.done,
    stageId: 'stage-3',
    highlightedNodes: newRoot ? [newRoot.val] : [],
    visitedNodes: collectTreeValues(newRoot),
    metrics: { '最终根节点': newRoot ? newRoot.val : 'null', '空间复杂度': 'O(1)' },
  });

  return steps;
}

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================
export const bstDeleteVisualizer = registerDeclarativeAlgorithm<BSTDeleteStep>({
  id: 'bst-delete',
  name: '二叉搜索树中的删除',
  category: 'tree',
  aliases: ['leetcode-450', 'delete-node-in-a-bst'],
  icon: '🗑️',
  badge: {
    mode: '多阶段演化: 递归直接嫁接 · 递归后继值替换 · 双指针迭代',
    complexity: 'O(H) · O(1)',
  },
  card1Title: '📊 BST 拓扑重构与节点移除沙盘',
  card2Title: '🧭 五大场景分支决策与调用栈监视器',
  card2Desc: '当前比对节点、命中状态、后继嫁接点与调整前后树形对比',
  legend: [
    { label: '目标被删节点', color: '#ef4444' },
    { label: '后继/替换节点', color: '#10b981' },
    { label: '探查路径节点', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: 'BST 树层序 (逗号分隔)',
      type: 'text',
      defaultValue: '5, 3, 6, 2, 4, null, 7',
      placeholder: '例如: 5, 3, 6, 2, 4, null, 7',
    },
    {
      id: 'input-key',
      label: '待删除键值 key',
      type: 'number',
      defaultValue: 3,
      placeholder: '例如: 3',
    },
  ],
  presets: [
    {
      label: 'LC 450 经典双子树节点 (删 3)',
      values: {
        'input-tree': '5, 3, 6, 2, 4, null, 7',
        'input-key': 3,
      },
      description: '目标节点 3 拥有完整左右子树 (2 和 4)，测试双子树嫁接与后继替换',
    },
    {
      label: '删除根节点 (删 5)',
      values: {
        'input-tree': '5, 3, 6, 2, 4, null, 7',
        'input-key': 5,
      },
      description: '直接删除整棵树的根节点 5，验证新根晋升与整树重构',
    },
    {
      label: '删除叶子节点 (删 7)',
      values: {
        'input-tree': '5, 3, 6, 2, 4, null, 7',
        'input-key': 7,
      },
      description: '叶子节点无任何子树，测试直接置 null 回退',
    },
    {
      label: '删除单子树节点 (删 6)',
      values: {
        'input-tree': '5, 3, 6, 2, 4, null, 7',
        'input-key': 6,
      },
      description: '节点 6 仅有右孩子 7，测试单孩子直接上位',
    },
    {
      label: '键不存在 (删 0)',
      values: {
        'input-tree': '5, 3, 6, 2, 4, null, 7',
        'input-key': 0,
      },
      description: '目标值 0 不在树中，测试未命中安全返回',
    },
    {
      label: '单节点树 (删 1)',
      values: {
        'input-tree': '1',
        'input-key': 1,
      },
      description: '仅有根节点 1，删除后树彻底变为空树 null',
    },
  ],
  metrics: [
    { id: 'target-key', label: '待删目标键', color: '#ef4444' },
    { id: 'cur-node', label: '当前探查节点', color: '#3b82f6' },
    { id: 'successor', label: '极小后继节点', color: '#10b981' },
  ],
  codeLanguages: BST_DELETE_STAGE1_GRAFT_CODE,
  problemHtml: BST_DELETE_PROBLEM_HTML,
  analysisHtml: BST_DELETE_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 递归直接嫁接删除 (LC 450 指针重连)',
      shortName: '递归直接嫁接',
      num: 1,
      codeLanguages: BST_DELETE_STAGE1_GRAFT_CODE,
      buildSteps: (inputs) => {
        const rawTree = parseTreeArray(inputs?.['input-tree'] || '5, 3, 6, 2, 4, null, 7', [5, 3, 6, 2, 4, null, 7]);
        const root = buildTreeFromArr(rawTree);
        const key = Number(inputs?.['input-key'] ?? 3);
        return buildBstDeleteStage1Steps(root, key);
      },
      renderCanvas: (container, step) => renderBstDeleteCanvas(container, step),
      renderCustomMetrics: (container, step) => renderBstDeleteCustomMetrics(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 递归后继节点值覆盖 (算法导论经典解法)',
      shortName: '后继值覆盖',
      num: 2,
      codeLanguages: BST_DELETE_STAGE2_REPLACE_CODE,
      buildSteps: (inputs) => {
        const rawTree = parseTreeArray(inputs?.['input-tree'] || '5, 3, 6, 2, 4, null, 7', [5, 3, 6, 2, 4, null, 7]);
        const root = buildTreeFromArr(rawTree);
        const key = Number(inputs?.['input-key'] ?? 3);
        return buildBstDeleteStage2Steps(root, key);
      },
      renderCanvas: (container, step) => renderBstDeleteCanvas(container, step),
      renderCustomMetrics: (container, step) => renderBstDeleteCustomMetrics(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 双指针显式迭代删除 (O(1) 辅助空间)',
      shortName: '双指针迭代',
      num: 3,
      codeLanguages: BST_DELETE_STAGE3_ITERATIVE_CODE,
      buildSteps: (inputs) => {
        const rawTree = parseTreeArray(inputs?.['input-tree'] || '5, 3, 6, 2, 4, null, 7', [5, 3, 6, 2, 4, null, 7]);
        const root = buildTreeFromArr(rawTree);
        const key = Number(inputs?.['input-key'] ?? 3);
        return buildBstDeleteStage3Steps(root, key);
      },
      renderCanvas: (container, step) => renderBstDeleteCanvas(container, step),
      renderCustomMetrics: (container, step) => renderBstDeleteCustomMetrics(container, step),
    },
  ],
  generateSteps: (inputs) => {
    const rawTree = parseTreeArray(inputs?.['input-tree'] || '5, 3, 6, 2, 4, null, 7', [5, 3, 6, 2, 4, null, 7]);
    const root = buildTreeFromArr(rawTree);
    const key = Number(inputs?.['input-key'] ?? 3);
    return buildBstDeleteStage1Steps(root, key);
  },
  buildSteps: (inputs) => {
    const rawTree = parseTreeArray(inputs?.['input-tree'] || '5, 3, 6, 2, 4, null, 7', [5, 3, 6, 2, 4, null, 7]);
    const root = buildTreeFromArr(rawTree);
    const key = Number(inputs?.['input-key'] ?? 3);
    return buildBstDeleteStage1Steps(root, key);
  },
  renderCanvas: (container, step) => renderBstDeleteCanvas(container, step),
  renderCustomMetrics: (container, step) => renderBstDeleteCustomMetrics(container, step),
});

/**
 * Card 1: 纯粹的树形沙盘渲染 (Pure SVG Sandbox)
 * 绝对零套娃、零直接修改 #dsp-custom-metrics-container、零内联样式污染
 */
function renderBstDeleteCanvas(container: HTMLElement, step: BSTDeleteStep) {
  if (step.tree) {
    const allVals = collectTreeValues(step.tree);
    const isDone = step.action === 'done';
    const visited = isDone ? allVals : (step.visitedNodes ?? []);
    const highlights = step.highlightedNodes && step.highlightedNodes.length > 0
      ? step.highlightedNodes
      : (step.currentVal != null ? [step.currentVal] : []);

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.currentVal,
      highlightedNodes: highlights,
      visitedNodes: visited,
      primaryColor: '#ef4444', // 鲜红目标
      visitedColor: '#3b82f6', // 天蓝访问路径
      secondaryColor: '#10b981', // 翡翠绿后继
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#fef2f2" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#ef4444" font-weight="bold">空二叉树 (null)</text>
        </svg>
        <span style="font-size: 11px; color: #94a3b8; margin-top: 8px;">二叉搜索树为空，无节点可被删除</span>
      </div>
    `;
  }
}

/**
 * Card 2: 领域指标监控与递归调用栈沙盘 (Custom Metrics & Recursive Call Trace)
 */
export function renderBstDeleteCustomMetrics(container: HTMLElement, step: BSTDeleteStep) {
  container.innerHTML = '';
  container.className = 'p-3 flex flex-col gap-3 min-h-[300px] overflow-y-auto';

  // 1. 顶部 4 维核心指标卡片网格
  const metricGrid = document.createElement('div');
  metricGrid.className = 'grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0';
  metricGrid.innerHTML = `
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">待删目标键:</span>
      <span class="text-sm font-bold text-rose-400 font-mono">${step.targetKey}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">当前探查节点:</span>
      <span class="text-sm font-bold text-sky-400 font-mono">${step.currentVal != null ? `${step.currentVal}` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">极小后继节点:</span>
      <span class="text-sm font-bold text-emerald-400 font-mono">${step.successorVal != null ? `${step.successorVal}` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">当前操作动作:</span>
      <span class="text-sm font-bold text-amber-400 font-mono">${step.action.toUpperCase()}</span>
    </div>
  `;
  container.appendChild(metricGrid);

  // 2. 中部：结构化调用栈踪迹沙盘 (Stage 1 & 2) 或迭代状态沙盘 (Stage 3)
  if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-[160px] max-h-[260px] overflow-hidden flex flex-col rounded-lg bg-slate-800/60 border border-slate-700/50';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
    container.appendChild(traceBox);
  } else {
    const iterBox = document.createElement('div');
    iterBox.className = 'p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs flex flex-col gap-2';
    iterBox.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300">⚡ 双指针迭代状态监视器 (O(1) 空间)</div>
      <div class="flex items-center gap-4 text-xs font-mono">
        <div><span class="text-slate-400">父节点 pre:</span> <span class="text-amber-400 font-bold">${step.parentVal != null ? step.parentVal : 'null (根)'}</span></div>
        <div><span class="text-slate-400">当前游标 cur:</span> <span class="text-sky-400 font-bold">${step.currentVal != null ? step.currentVal : 'null'}</span></div>
      </div>
    `;
    container.appendChild(iterBox);
  }

  // 3. 底部推演决策卡片
  const isDone = step.action === 'done';
  const summaryBox = document.createElement('div');
  summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed flex-shrink-0 ${
    isDone ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-slate-800/50 border-slate-700/40 text-slate-300'
  }`;
  summaryBox.innerHTML = `
    <div class="font-bold mb-1 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}">⚡ 决策推演: ${step.decision}</div>
    <div class="text-slate-400">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}
