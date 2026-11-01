/**
 * 二叉树族群「树上挂树 (Tree of Trees)」通用共享合成器与子视图控制器
 * (Binary Tree of Trees Universal Shared Synthesizer & SubView Controller)
 *
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)：
 * 1. 全量二叉树自动赋能：无需在 45+ 个二叉树单题中逐一手写母树构建逻辑，
 *    自动从任意二叉树步骤序列 (step.tree / step.mergedTree / step.nodes) 合成完整的「树上挂树」全景推演拓扑；
 * 2. 独立状态树快照隔离：每个递归调用节点独立冻结并保留自身处理完成时刻的完整状态树 (Full State Tree Snapshot)；
 * 3. 100% 焦点连续性：保证全步骤推演中始终具备连续唯一的 ⚡ 活跃 焦点，配合恒定缩放运镜消除跳变；
 * 4. 统一子视图切换栏：为全库所有二叉树算法提供统一的「🌳 树上挂树 (全景推演 · 推荐) | 🌲 单树实时沙盘」共享切换器。
 */

import { TreeNode } from '../tree-svg';
import { TreeOfTreesCanvasAdapter, TreeOfTreesNode } from './tree-of-trees-canvas-adapter';
import type { TreeCanvasState } from './tree-canvas-adapter';

/**
 * 空调用探针共享契约 (Step Null Probe Contract)
 * 各递归步骤编译器在空基底步发射，供树上挂树全景渲染 ∅ 虚线探针与方向蚂蚁线：
 * - parentVal/parentId 定位调用帧（重复值树必须按 parentId 精确锚定，值仅作回退）
 * - branch 标记探针落点（调用者的左/右空槽位）
 * - phase 区分进入/返回以翻转蚂蚁线方向；action 命名（null-entry/null-return）亦可隐式推导
 */
export interface StepNullProbe {
  parentVal: number | string;
  parentId?: number | string;
  branch: 'left' | 'right';
  /** 可省略：缺省时由 action 命名（null-entry/null-return）推导，兜底 entry */
  phase?: 'entry' | 'return';
}

/** 树实例 -> 预合成 TreeOfTreesNode 的弱引用映射表，供 TreeCanvasAdapter O(1) 无缝反查 */
const treeInstanceToTotMap = new WeakMap<object, TreeOfTreesNode>();

/** 算法 ID -> 递归函数签名名称映射 */
const ALGO_FUNC_NAME_MAP: Record<string, string> = {
  'bst-to-gst': 'reverseInorder',
  'tree-depth': 'maxDepth',
  'depth-of-binary-tree-036': 'maxDepth',
  'min-depth': 'minDepth',
  'tree-invert': 'invertTree',
  'tree-symmetric': 'isSymmetric',
  'valid-bst': 'isValidBST',
  'validate-bst-037': 'isValidBST',
  'lca': 'lowestCommonAncestor',
  'lowest-common-ancestor-037': 'lowestCommonAncestor',
  'lowest-common-ancestor-bst-037': 'lowestCommonAncestor',
  'tree-lca': 'dfsLCA',
  'all-paths': 'dfsPaths',
  'path-sum': 'hasPathSum',
  'path-sum-ii-037': 'pathSum',
  'sum-root-to-leaf-numbers': 'dfsSum',
  'binary-tree-maximum-path-sum': 'maxGain',
  'bst-search': 'searchBST',
  'bst-delete': 'deleteNode',
  'bst-min-diff': 'inorderDiff',
  'bst-modes': 'inorderMode',
  'trim-bst-037': 'trimBST',
  'bottom-left': 'findBottomLeft',
  'left-leaves': 'sumOfLeftLeaves',
  'balanced-binary-tree-037': 'getHeight',
  'tree-037-balanced-binary-tree': 'getHeight',
  'completeness-binary-tree-036': 'checkComplete',
  'tree-036-completeness-binary-tree': 'checkComplete',
  'count-complete-tree-nodes-036': 'countNodes',
  'tree-036-count-complete-tree-nodes': 'countNodes',
  'width-of-binary-tree-036': 'dfsWidth',
  'tree-036-width-of-binary-tree': 'dfsWidth',
  'binary-tree-level': 'levelOrder',
  'level-order-036': 'levelOrder',
  'zigzag-level-order-036': 'zigzagOrder',
  'tree-036-zigzag-level-order': 'zigzagOrder',
  'house-robber-iii-037': 'robSub',
  'build-tree': 'buildTree',
  'build-tree-preorder-inorder-036': 'buildTree',
  'sorted-array-to-bst': 'buildBST',
  'max-tree': 'constructMaxTree',
  'merge-trees': 'mergeTrees',
  'find-duplicate-subtrees': 'serializeSub',
  'max-sum-bst-036': 'maxSumBST',
  'tree-traversal': 'traverse',
  'tree-traversal-iterative-020': 'traverse',
  'tree-recursion-patterns-019': 'dfsPattern',
  'tree-serialization-021': 'serialize',
  'tree-serialization-037': 'serialize',
  'preorder-serialize-036': 'serialize',
  'levelorder-serialize-036': 'serialize',
  'tree-diameter': 'dfsDiameter',
  'tree-cameras': 'minCameraDFS',
};

export function cloneTreeNodeDeep(node: TreeNode | null | undefined): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    val: node.val,
    left: cloneTreeNodeDeep(node.left),
    right: cloneTreeNodeDeep(node.right),
  };
}

export function cloneTreeOfTrees(node: TreeOfTreesNode | null | undefined): TreeOfTreesNode | null {
  if (!node) return null;
  const l = cloneTreeOfTrees(node.leftChild);
  const r = cloneTreeOfTrees(node.rightChild);
  const children: TreeOfTreesNode[] = [];
  if (l) children.push(l);
  if (r) children.push(r);
  return {
    ...node,
    footerText: node.footerText,
    valueTransition: node.valueTransition ? { ...node.valueTransition } : undefined,
    treeSnapshot: cloneTreeNodeDeep(node.treeSnapshot),
    children: children.length > 0 ? children : (node.children || []).map((c) => cloneTreeOfTrees(c)!),
    leftChild: l,
    rightChild: r,
  };
}

/**
 * 判断对象是否为合法的递归二叉树节点 (TreeNode)
 */
export function isBinaryTreeNode(obj: unknown): obj is TreeNode {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const rec = obj as Record<string, unknown>;
  return typeof rec.val === 'number' && ('left' in rec || 'right' in rec);
}

/**
 * 将扁平节点数组 (如 TreeNode036 / DuplicateSubtreeNode / BstTreeNode) 转换为标准 TreeNode
 */
function convertFlatNodesToTreeNode(nodes: any[]): TreeNode | null {
  if (!Array.isArray(nodes) || nodes.length === 0) return null;
  const first = nodes[0];
  if (!first || typeof first !== 'object' || typeof first.val !== 'number') return null;
  const hasBinaryLinks = nodes.some(
    (n) => n && ('left' in n || 'right' in n || 'leftId' in n || 'rightId' in n)
  );
  if (!hasBinaryLinks) return null;

  const nodeMap = new Map<string | number, any>();
  const childIds = new Set<string | number>();

  for (const n of nodes) {
    if (!n || n.id == null) continue;
    nodeMap.set(n.id, n);
    const lId = n.left ?? n.leftId;
    const rId = n.right ?? n.rightId;
    if (lId != null) childIds.add(lId);
    if (rId != null) childIds.add(rId);
  }

  if (nodeMap.size === 0) return null;
  const rootRaw = nodes.find((n) => n && n.id != null && !childIds.has(n.id)) || nodes[0];

  const visited = new Set<string | number>();
  const build = (raw: any): TreeNode | null => {
    if (!raw || visited.has(raw.id)) return null;
    visited.add(raw.id);
    const lId = raw.left ?? raw.leftId;
    const rId = raw.right ?? raw.rightId;
    return {
      id: `orig-${raw.id}`,
      val: Number(raw.val),
      left: lId != null && nodeMap.has(lId) ? build(nodeMap.get(lId)) : null,
      right: rId != null && nodeMap.has(rId) ? build(nodeMap.get(rId)) : null,
    };
  };

  return build(rootRaw);
}

/**
 * 从任意算法步骤中提取标准二叉树结构
 */
export function extractBinaryTreeFromStep(step: any): TreeNode | null {
  if (!step || typeof step !== 'object') return null;
  if (isBinaryTreeNode(step.tree)) return step.tree;
  if (isBinaryTreeNode(step.mergedTree)) return step.mergedTree;
  if (isBinaryTreeNode(step.tree1)) return step.tree1;
  if (isBinaryTreeNode(step.root)) return step.root;
  if (Array.isArray(step.nodes) && step.nodes.length > 0) {
    return convertFlatNodesToTreeNode(step.nodes);
  }
  return null;
}

function countTreeNodes(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + countTreeNodes(root.left) + countTreeNodes(root.right);
}

/**
 * 为树快照标记已访问/未访问节点身份：
 * - 未访问节点 id 以 'orig-' 开头（渲染经典白底板岩色描边）
 * - 已访问/已归约节点 id 以 'visited-' 开头（渲染薄荷绿已结算样式）
 */
function cloneAndMarkVisitedTree(
  root: TreeNode | null,
  visitedVals: Set<number | string>,
  path = 'root'
): TreeNode | null {
  if (!root) return null;
  const rawId = root.id != null ? String(root.id).replace(/^(orig-|visited-)/, '') : `${path}-${root.val}`;
  const isVisited =
    visitedVals.has(root.val) ||
    (root.id != null && visitedVals.has(root.id)) ||
    visitedVals.has(rawId);

  return {
    id: isVisited ? `visited-${rawId}` : `orig-${rawId}`,
    val: root.val,
    left: cloneAndMarkVisitedTree(root.left, visitedVals, `${path}.L`),
    right: cloneAndMarkVisitedTree(root.right, visitedVals, `${path}.R`),
  };
}

/**
 * 提取当前步骤中的已访问/已结算节点集合
 */
function extractVisitedSetFromStep(step: any): Set<number | string> {
  const set = new Set<number | string>();
  if (!step || typeof step !== 'object') return set;

  const addIterable = (items: any) => {
    if (!items) return;
    if (items instanceof Set || Array.isArray(items)) {
      for (const v of items) {
        if (typeof v === 'number' || typeof v === 'string') set.add(v);
      }
    } else if (items instanceof Map) {
      for (const k of items.keys()) {
        if (typeof k === 'number' || typeof k === 'string') set.add(k);
      }
    }
  };

  addIterable(step.visitedNodes);
  addIterable(step.sequence);
  addIterable(step.depthsMap);
  addIterable(step.duplicateRoots);
  addIterable(step.visitedAncestors);
  if (Array.isArray(step.result) && step.result.every((x: any) => typeof x === 'number')) {
    addIterable(step.result);
  }
  if (Array.isArray(step.reverseSeq)) {
    for (const item of step.reverseSeq) {
      if (item && typeof item.newVal === 'number') set.add(item.newVal);
    }
  }
  return set;
}

/**
 * 提取当前步骤聚焦的主节点值或 ID
 */
function extractActiveValFromStep(step: any): number | string | null {
  if (!step || typeof step !== 'object') return null;
  const candidates = [
    step.currNewVal,
    step.currOldVal,
    step.invalidNode,
    step.lcaResult,
    step.current,
    step.activeNodeId,
    step.currentNodeId,
    step.nodeVal,
    step.focus1,
    step.focus2,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== '') return c;
  }
  if (Array.isArray(step.highlightedNodes) && step.highlightedNodes.length > 0) {
    return step.highlightedNodes[0];
  }
  return null;
}

/**
 * 提取简明、无违规字符的卡片底部实时指标摘要
 */
function extractFooterSummary(step: any, nodeVal: number | null): string {
  if (!step || typeof step !== 'object') return `node = ${nodeVal ?? 'null'}`;

  // 1. 若有结构化 metrics 字典，提取前 2 个关键指标（同值去重，消灭 cur/当前考察 类重复展示）
  if (step.metrics && typeof step.metrics === 'object') {
    const seenVals = new Set<string>();
    const entries = Object.entries(step.metrics)
      .filter(([k, v]) => {
        if (k.startsWith('metric-') || v === undefined || v === null || v === '—' || v === '-') return false;
        const valKey = String(v);
        if (seenVals.has(valKey)) return false;
        seenVals.add(valKey);
        return true;
      })
      .slice(0, 2);
    if (entries.length > 0) {
      return entries
        .map(([k, v]) => `${k}=${String(v).replace(/🎯/g, '')}`)
        .join(' · ')
        .slice(0, 34);
    }
  }

  // 2. 常见二叉树领域特征字段提取
  if (typeof step.leftDepth === 'number' && typeof step.rightDepth === 'number') {
    return `L=${step.leftDepth} · R=${step.rightDepth} (depth=${step.depth ?? 0})`;
  }
  if (Array.isArray(step.path) && step.path.length > 0) {
    return `path: ${step.path.join('→')}`.slice(0, 34);
  }
  if (Array.isArray(step.sequence) && step.sequence.length > 0) {
    return `seq: [${step.sequence.join(', ')}]`.slice(0, 34);
  }
  if (Array.isArray(step.result) && step.result.length > 0 && typeof step.result[0] === 'number') {
    return `ans: [${step.result.join(', ')}]`.slice(0, 34);
  }
  if (typeof step.sum === 'number') {
    return `sum = ${step.sum}`;
  }

  // 3. 退化提取 decision 简短摘要（严格过滤 🎯 以捍卫 Card 1 表现层门禁）
  const rawDecision = String(step.decision || step.message || '')
    .replace(/🎯/g, '')
    .replace(/(状态|决策)\s*[:：]/g, '')
    .trim();
  if (rawDecision) {
    return rawDecision.length > 26 ? `${rawDecision.slice(0, 25)}…` : rawDecision;
  }

  return `node = ${nodeVal ?? 'null'}`;
}

export class BinaryTreeOfTreesSynthesizer {
  /** 当前二叉树全局共享的 Card 1 子视图模式（默认展示树上挂树全景推演） */
  public static activeSubView: 'tree-of-trees' | 'single-tree' = 'tree-of-trees';

  /**
   * 查询某个 TreeNode 实例绑定的 TreeOfTreesNode
   */
  public static getTreeOfTreesForTree(tree: TreeNode | null | undefined): TreeOfTreesNode | undefined {
    if (!tree || typeof tree !== 'object') return undefined;
    return treeInstanceToTotMap.get(tree);
  }

  /**
   * 绑定 TreeNode 实例与对应的 TreeOfTreesNode
   */
  public static bindTreeToTot(tree: TreeNode | null | undefined, tot: TreeOfTreesNode | null | undefined): void {
    if (tree && typeof tree === 'object' && tot) {
      treeInstanceToTotMap.set(tree, tot);
    }
  }

  /**
   * 为整个步骤序列自动合成「树上挂树 (TreeOfTreesNode)」全景拓扑快照
   */
  public static enrichStepsWithTreeOfTrees<TStep = any>(
    steps: TStep[],
    context?: { algorithmId?: string; stageId?: string }
  ): TStep[] {
    if (!Array.isArray(steps) || steps.length === 0) return steps;

    // 1. 若步骤自身已原生构建了 treeOfTrees（如 bst-to-gst Stage 1），仅绑定映射表并直接返回
    const alreadyHasTot = steps.some((s: any) => s && s.treeOfTrees);
    if (alreadyHasTot) {
      for (const s of steps as any[]) {
        const t = extractBinaryTreeFromStep(s);
        if (t && s.treeOfTrees) {
          this.bindTreeToTot(t, s.treeOfTrees);
        }
      }
      return steps;
    }

    // 2. 扫描全步骤提取最大节点数的完整基准二叉树 (兼容自顶向下遍历与自底向上建树)
    let canonicalTree: TreeNode | null = null;
    let maxNodes = 0;
    let firstValidTree: TreeNode | null = null;

    for (const s of steps as any[]) {
      const t = extractBinaryTreeFromStep(s);
      if (t) {
        if (!firstValidTree) firstValidTree = t;
        const cnt = countTreeNodes(t);
        if (cnt > maxNodes) {
          maxNodes = cnt;
          canonicalTree = t;
        }
      }
    }

    if (!canonicalTree || maxNodes === 0) {
      return steps;
    }

    const algoId = context?.algorithmId || '';
    const fnName = ALGO_FUNC_NAME_MAP[algoId] || 'dfs';
    const initialSnapshot = cloneAndMarkVisitedTree(firstValidTree || canonicalTree, new Set());

    // 3. 预构建完整二叉递归母树骨架 (Mother Tree Skeleton)
    interface CallEntry {
      callNode: TreeOfTreesNode;
      parentEntry: CallEntry | null;
      origVal: number;
      origId: string;
      path: string;
    }
    const allEntries: CallEntry[] = [];

    const buildMotherSkeleton = (
      node: TreeNode | null,
      depth: number,
      branch: 'root' | 'left' | 'right',
      path: string,
      parentEntry: CallEntry | null
    ): TreeOfTreesNode | null => {
      if (!node) return null;
      const origId = node.id != null ? String(node.id).replace(/^(orig-|visited-)/, '') : `${path}-${node.val}`;
      const callNode: TreeOfTreesNode = {
        id: `call-${path}`,
        funcCall: `${fnName}(${node.val})`,
        depth,
        branch,
        status: 'pending',
        activeNodeVal: node.val,
        activeNodeId: `orig-${origId}`,
        sum: 0,
        footerText: '等待递归深入...',
        treeSnapshot: cloneTreeNodeDeep(initialSnapshot),
        children: [],
        leftChild: null,
        rightChild: null,
      };

      const entry: CallEntry = {
        callNode,
        parentEntry,
        origVal: node.val,
        origId,
        path,
      };
      allEntries.push(entry);

      const lChild = buildMotherSkeleton(node.left, depth + 1, 'left', `${path}.L`, entry);
      const rChild = buildMotherSkeleton(node.right, depth + 1, 'right', `${path}.R`, entry);
      const children: TreeOfTreesNode[] = [];
      if (lChild) children.push(lChild);
      if (rChild) children.push(rChild);
      callNode.leftChild = lChild;
      callNode.rightChild = rChild;
      callNode.children = children;

      return callNode;
    };

    const motherRoot = buildMotherSkeleton(canonicalTree, 0, 'root', 'root', null);
    if (!motherRoot || allEntries.length === 0) return steps;

    const isAncestorOf = (ancestor: CallEntry, target: CallEntry): boolean => {
      let cur = target.parentEntry;
      while (cur) {
        if (cur === ancestor) return true;
        cur = cur.parentEntry;
      }
      return false;
    };

    // 4. 沿步骤序列推进状态演进，确保每一步拥有唯一连续的 active 节点，且每个节点独立锁定自身状态树快照
    let lastActiveEntry: CallEntry = allEntries[0];

    for (let idx = 0; idx < steps.length; idx++) {
      const step = steps[idx] as any;
      const stepTree = extractBinaryTreeFromStep(step) || canonicalTree;
      const visitedSet = extractVisitedSetFromStep(step);
      const activeRaw = extractActiveValFromStep(step);
      const isFinalStep = idx === steps.length - 1 && (step.action === 'done' || step.opType === 'complete');

      // 匹配当前步骤对应的递归调用帧（优先匹配上一步活跃节点的直系亲属，妥善处理同值节点）
      let matchedEntry: CallEntry | undefined;
      if (activeRaw !== null) {
        const candidates = allEntries.filter(
          (e) =>
            e.origVal === activeRaw ||
            String(e.origVal) === String(activeRaw) ||
            e.origId === String(activeRaw) ||
            `node-${e.origId}` === String(activeRaw)
        );
        if (candidates.length === 1) {
          matchedEntry = candidates[0];
        } else if (candidates.length > 1) {
          matchedEntry =
            candidates.find(
              (c) =>
                c.parentEntry === lastActiveEntry ||
                lastActiveEntry.parentEntry === c ||
                c === lastActiveEntry
            ) ||
            candidates.find((c) => c.callNode.status !== 'done') ||
            candidates[0];
        }
      }

      // 空调用探针方言归一：优先编译器内联 phase，其次 action 命名约定（null-entry / null-return），兜底 entry
      const probePhase: 'entry' | 'return' | null = step.nullProbe
        ? (step.nullProbe.phase ??
          (step.action === 'null-return' ? 'return' : 'entry'))
        : null;

      // 空调用步骤归属调用帧：探针语义上绑定 parentVal/parentId 对应的调用者。
      // 重复值树（如众数题）中同值帧众多，必须优先按节点身份 (parentId→origId) 精确解析，值仅作回退，
      // 修正空调用期间焦点回退导致 prev 帧误活跃、调用帧闪断为 done 的错位
      let effectiveEntry = matchedEntry || lastActiveEntry;
      if (probePhase && step.nullProbe) {
        const np = step.nullProbe;
        const caller =
          (np.parentId != null && np.parentId !== ''
            ? allEntries.find((e) => e.origId === String(np.parentId))
            : undefined) ||
          allEntries.find((e) => String(e.origVal) === String(np.parentVal));
        if (caller) effectiveEntry = caller;
      }

      const currentEntry = effectiveEntry;

      // 瞬态归零：∅ 探针与 prev/cur 指针是每步瞬态，仅活跃帧持有，必须清除全部帧的上一步残留
      for (const entry of allEntries) {
        entry.callNode.nullProbeState = null;
        entry.callNode.pointerState = null;
      }

      // 更新所有已访问/祖先/当前节点的状态
      for (const entry of allEntries) {
        if (entry === currentEntry) {
          entry.callNode.status = isFinalStep ? 'done' : 'active';
        } else if (isAncestorOf(entry, currentEntry)) {
          if (entry.callNode.status === 'active' || entry.callNode.status === 'pending') {
            entry.callNode.status = 'waiting';
          }
        } else if (
          entry.callNode.status === 'active' ||
          entry.callNode.status === 'waiting' ||
          visitedSet.has(entry.origVal) ||
          visitedSet.has(entry.origId)
        ) {
          entry.callNode.status = 'done';
        }
      }

      // 更新当前活跃节点的独立完整状态树快照与底部指标摘要
      const markedTree = cloneAndMarkVisitedTree(stepTree, visitedSet);
      currentEntry.callNode.treeSnapshot = markedTree;
      currentEntry.callNode.activeNodeVal = currentEntry.origVal;
      currentEntry.callNode.activeNodeId = visitedSet.has(currentEntry.origVal)
        ? `visited-${currentEntry.origId}`
        : `orig-${currentEntry.origId}`;
      currentEntry.callNode.footerText = extractFooterSummary(step, currentEntry.origVal);

      // 每步独立快照：空调用探针与 prev/cur 双指针状态（仅活跃帧持有；无此字段的算法方言防御性跳过）
      if (probePhase && step.nullProbe) {
        currentEntry.callNode.nullProbeState = {
          parentVal: step.nullProbe.parentVal,
          branch: step.nullProbe.branch,
          phase: probePhase,
        };
      }
      // 指针方言归一：valid-bst 系 (prev/current) 与 bst-modes 系 (prevNodeVal/currNodeVal) 统一消费
      const prevDialect =
        step.prev !== undefined
          ? step.prev
          : step.prevVal !== undefined
            ? step.prevVal
            : step.prevNodeVal;
      const curDialect =
        step.current !== undefined
          ? step.current
          : step.currVal !== undefined
            ? step.currVal
            : step.currNodeVal;
      currentEntry.callNode.pointerState =
        prevDialect !== undefined
          ? {
              curVal: curDialect ?? null,
              prevVal: prevDialect ?? null,
              curId: step.currNodeId ?? step.curId ?? null,
              prevId: step.prevNodeId ?? step.prevId ?? null,
              compare:
                step.action === 'compare'
                  ? 'pending'
                  : step.action === 'violation'
                    ? 'fail'
                    : step.action === 'update-prev'
                      ? 'pass'
                      : null,
            }
          : null;

      if (isFinalStep) {
        for (const entry of allEntries) {
          if (entry.callNode.status !== 'pending') {
            entry.callNode.status = 'done';
          }
        }
      }

      lastActiveEntry = currentEntry;

      const snapshotTot = cloneTreeOfTrees(motherRoot)!;
      step.treeOfTrees = snapshotTot;
      if (isBinaryTreeNode(step.tree)) {
        if (treeInstanceToTotMap.has(step.tree)) {
          // 共享树实例方言（如 LCA 全步复用同一 root 引用）：同一实例会被逐步重复绑定，
          // 直接覆盖会使映射最终指向最后一步的终态快照，导致推演子视图全程冻结在终态。
          // 为本步克隆出独立实例再绑定，保证渲染时按实例反查到的是当前步快照。
          step.tree = cloneTreeNodeDeep(step.tree);
        }
        this.bindTreeToTot(step.tree, snapshotTot);
      }
      if (isBinaryTreeNode(step.mergedTree)) {
        if (treeInstanceToTotMap.has(step.mergedTree)) {
          step.mergedTree = cloneTreeNodeDeep(step.mergedTree);
        }
        this.bindTreeToTot(step.mergedTree, snapshotTot);
      }
    }

    return steps;
  }

  /**
   * 当单步直接调用 TreeCanvasAdapter.renderTree 且未经过 StepNormalizationEngine 时，即时合成单步母树
   */
  public static buildFromTreeCanvasState(state: TreeCanvasState): TreeOfTreesNode | null {
    if (!state.tree) return null;
    const visitedSet = new Set<number | string>(state.visitedNodes || []);
    const activeTarget =
      state.activeNodeId ??
      state.current ??
      (state.highlightedNodes && state.highlightedNodes.length > 0 ? state.highlightedNodes[0] : state.tree.val);

    const markedSnapshot = cloneAndMarkVisitedTree(state.tree, visitedSet);

    const buildNode = (
      node: TreeNode | null,
      depth: number,
      branch: 'root' | 'left' | 'right',
      path: string
    ): TreeOfTreesNode | null => {
      if (!node) return null;
      const origId = node.id != null ? String(node.id).replace(/^(orig-|visited-)/, '') : `${path}-${node.val}`;
      const isCurrent = node.val === activeTarget || node.id === activeTarget;
      const isVisited = visitedSet.has(node.val) || (node.id != null && visitedSet.has(node.id));

      const lChild = buildNode(node.left, depth + 1, 'left', `${path}.L`);
      const rChild = buildNode(node.right, depth + 1, 'right', `${path}.R`);
      const children: TreeOfTreesNode[] = [];
      if (lChild) children.push(lChild);
      if (rChild) children.push(rChild);

      const hasActiveDescendant =
        lChild?.status === 'active' ||
        lChild?.status === 'waiting' ||
        rChild?.status === 'active' ||
        rChild?.status === 'waiting';

      const status: TreeOfTreesNode['status'] = isCurrent
        ? 'active'
        : hasActiveDescendant
        ? 'waiting'
        : isVisited
        ? 'done'
        : 'pending';

      return {
        id: `call-${path}`,
        funcCall: `dfs(${node.val})`,
        depth,
        branch,
        status,
        activeNodeVal: node.val,
        activeNodeId: isVisited ? `visited-${origId}` : `orig-${origId}`,
        sum: 0,
        footerText: isCurrent
          ? `当前考察节点 ${node.val}`
          : isVisited
          ? `节点 ${node.val} 已处理`
          : '等待递归深入...',
        treeSnapshot: cloneTreeNodeDeep(markedSnapshot),
        children,
        leftChild: lChild,
        rightChild: rChild,
      };
    };

    return buildNode(state.tree, 0, 'root', 'root');
  }

  /**
   * 统一挂载全库二叉树共享的「🌳 树上挂树 (全景推演 · 推荐) | 🌲 单树实时沙盘」子视图容器
   */
  public static renderWithSubViewToggle(
    container: HTMLElement,
    treeOfTrees: TreeOfTreesNode,
    renderSingleTree: (singleBox: HTMLElement) => void
  ): void {
    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.boxSizing = 'border-box';
    container.style.position = 'relative';

    const toolbar = document.createElement('div');
    toolbar.style.cssText =
      'display: flex; justify-content: flex-end; align-items: center; width: 100%; padding: 2px 6px; flex-shrink: 0; z-index: 10; margin-bottom: 4px;';
    const curMode = this.activeSubView;
    const isTot = curMode === 'tree-of-trees';
    const isSingle = curMode === 'single-tree';

    toolbar.innerHTML = `
      <div style="display: inline-flex; background: #f1f5f9; padding: 2px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 11px;">
        <button id="btn-subview-tot" style="border: none; background: ${isTot ? '#ffffff' : 'transparent'}; color: ${isTot ? '#1d4ed8' : '#64748b'}; font-weight: ${isTot ? '700' : '500'}; padding: 2px 8px; border-radius: 4px; cursor: pointer; box-shadow: ${isTot ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'}; font-size: 10.5px;">🌳 树上挂树 (全景推演 · 推荐)</button>
        <button id="btn-subview-single" style="border: none; background: ${isSingle ? '#ffffff' : 'transparent'}; color: ${isSingle ? '#1d4ed8' : '#64748b'}; font-weight: ${isSingle ? '700' : '500'}; padding: 2px 8px; border-radius: 4px; cursor: pointer; box-shadow: ${isSingle ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'}; font-size: 10.5px;">🌲 单树实时沙盘</button>
      </div>
    `;

    const btnTot = toolbar.querySelector('#btn-subview-tot') as HTMLButtonElement | null;
    const btnSingle = toolbar.querySelector('#btn-subview-single') as HTMLButtonElement | null;

    if (btnTot) {
      btnTot.onclick = (e) => {
        e.stopPropagation();
        this.activeSubView = 'tree-of-trees';
        this.renderWithSubViewToggle(container, treeOfTrees, renderSingleTree);
      };
    }
    if (btnSingle) {
      btnSingle.onclick = (e) => {
        e.stopPropagation();
        this.activeSubView = 'single-tree';
        this.renderWithSubViewToggle(container, treeOfTrees, renderSingleTree);
      };
    }
    container.appendChild(toolbar);

    const canvasBox = document.createElement('div');
    canvasBox.style.cssText =
      'flex: 1; width: 100%; height: 100%; min-height: 0; display: flex; align-items: center; justify-content: center; position: relative;';
    container.appendChild(canvasBox);

    if (this.activeSubView === 'tree-of-trees') {
      TreeOfTreesCanvasAdapter.render(canvasBox, treeOfTrees);
    } else {
      renderSingleTree(canvasBox);
    }
  }
}
