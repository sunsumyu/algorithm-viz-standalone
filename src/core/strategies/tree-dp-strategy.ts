import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';

export type TreeDpModelId =
  | 'max-distance-in-tree'
  | 'largest-bst-subtree'
  | 'max-path-sum'
  | 'tree-diameter'
  | 'binary-tree-cameras'
  | 'course-selection'
  | 'minimum-fuel-cost'
  | 'longest-path-different-characters'
  | 'party-without-boss'
  | 'height-removal-queries'
  | 'minimum-score-after-removals';

interface RawTreeNode {
  id: string;
  val: number;
  left: RawTreeNode | null;
  right: RawTreeNode | null;
}

function parseTreeArray(raw: any): (number | null)[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    return raw
      .split(/[,，\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => (s === 'null' || s === '#' ? null : parseInt(s, 10)))
      .filter((n) => n === null || !isNaN(n));
  }
  return [1, 2, 3, 4, 5];
}

function buildRawTree(arr: (number | null)[]): RawTreeNode | null {
  if (!arr || arr.length === 0 || arr[0] === null) return null;
  const root: RawTreeNode = { id: 'node-0', val: arr[0]!, left: null, right: null };
  const queue: RawTreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    const curr = queue.shift()!;
    if (i < arr.length && arr[i] !== null) {
      curr.left = { id: `node-${i}`, val: arr[i]!, left: null, right: null };
      queue.push(curr.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      curr.right = { id: `node-${i}`, val: arr[i]!, left: null, right: null };
      queue.push(curr.right);
    }
    i++;
  }
  return root;
}

function toUniversalTree(
  node: RawTreeNode | null,
  activeId?: string,
  tags: Map<string, string> = new Map(),
  statuses: Map<string, UniversalTreeNode['status']> = new Map()
): UniversalTreeNode | null {
  if (!node) return null;
  const status: UniversalTreeNode['status'] =
    node.id === activeId ? 'current' : statuses.get(node.id) || 'normal';
  const tag = tags.get(node.id);

  return {
    id: node.id,
    r: 0,
    c: 0,
    val: `Node(${node.val})`,
    status,
    tag,
    children: [
      toUniversalTree(node.left, activeId, tags, statuses),
      toUniversalTree(node.right, activeId, tags, statuses),
    ].filter(Boolean) as UniversalTreeNode[],
  };
}

/**
 * 树型 DP 通用策略执行器 (TreeDpStrategy)
 * 适配树的最大距离、最大BST子树、最大路径和、二叉树直径、监控二叉树、选课等全部树型DP题型
 */
export class TreeDpStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: TreeDpModelId | string) {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      modelId === 'max-distance-in-tree' ||
      modelId === 'largest-bst-subtree' ||
      modelId === 'max-path-sum' ||
      modelId === 'tree-diameter' ||
      modelId === 'binary-tree-cameras' ||
      modelId === 'course-selection' ||
      modelId === 'minimum-fuel-cost' ||
      modelId === 'longest-path-different-characters' ||
      modelId === 'party-without-boss' ||
      modelId === 'height-removal-queries' ||
      modelId === 'minimum-score-after-removals'
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, anchorMap } = params;
    const rawRoot = (model.defaultParams as any)?.root;

    switch (model.id) {
      case 'max-distance-in-tree':
        return this.compileMaxDistance(model, parseTreeArray(rawRoot || '1,2,3,4,5'), stage, anchorMap);
      case 'largest-bst-subtree':
        return this.compileLargestBST(model, parseTreeArray(rawRoot || '10,5,15,1,8,null,7'), stage, anchorMap);
      case 'max-path-sum':
        return this.compileMaxPathSum(model, parseTreeArray(rawRoot || '-10,9,20,null,null,15,7'), stage, anchorMap);
      case 'tree-diameter':
        return this.compileTreeDiameter(model, parseTreeArray(rawRoot || '1,2,3,4,5'), stage, anchorMap);
      case 'binary-tree-cameras':
        return this.compileBinaryTreeCameras(model, parseTreeArray(rawRoot || '0,0,null,0,0'), stage, anchorMap);
      case 'course-selection':
        return this.compileCourseSelection(model, stage, anchorMap);
      case 'minimum-fuel-cost':
        return this.compileMinimumFuelCost(model, stage, anchorMap);
      case 'longest-path-different-characters':
        return this.compileLongestPathDifferentCharacters(model, stage, anchorMap);
      case 'party-without-boss':
        return this.compilePartyWithoutBoss(model, stage, anchorMap);
      case 'height-removal-queries':
        return this.compileHeightRemovalQueries(model, stage, anchorMap);
      case 'minimum-score-after-removals':
        return this.compileMinimumScoreAfterRemovals(model, stage, anchorMap);
      default:
        return this.compileMaxDistance(model, parseTreeArray(rawRoot || '1,2,3,4,5'), stage, anchorMap);
    }
  }

  // =========================================================================
  // 1. 树的最大距离 (Max Distance in Tree)
  // =========================================================================
  private compileMaxDistance(
    _model: IYamlAlgorithmModel,
    arr: (number | null)[],
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const root = buildRawTree(arr);
    if (!root) return [];

    const tags = new Map<string, string>();
    const statuses = new Map<string, UniversalTreeNode['status']>();
    let globalMaxDist = 0;

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0, 0, 0],
      memo: [0, 0, 0],
      activeSlot: 0,
      tag: '启动后序遍历',
      log: '🌲 树型DP启动：每个节点向父节点汇报 [子树最大深度, 内部最大距离] 二元组',
      msg: '启动自底向上后序遍历：每个节点计算 <code>[maxDepth, maxDist]</code>。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    function dfs(node: RawTreeNode | null): { depth: number; dist: number } {
      if (!node) return { depth: 0, dist: 0 };

      statuses.set(node.id, 'current');
      steps.push({
        type: 'step',
        line: anchorMap?.entry || 4,
        i: 0,
        j: 0,
        dp1d: [globalMaxDist, 0, 0],
        memo: [globalMaxDist, 0, 0],
        activeSlot: 0,
        tag: `访问节点 ${node.val}`,
        log: `| 📥 递归进入节点 [${node.val}]`,
        msg: `访问节点 <strong>Node(${node.val})</strong>，先递归计算左右子树。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      const L = dfs(node.left);
      const R = dfs(node.right);

      const crossDist = L.depth + R.depth;
      const dist = Math.max(crossDist, L.dist, R.dist);
      const depth = Math.max(L.depth, R.depth) + 1;
      const oldAns = globalMaxDist;
      globalMaxDist = Math.max(globalMaxDist, dist);

      tags.set(node.id, `深:${depth}, 距:${dist}`);
      statuses.set(node.id, 'visited');

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 8,
        i: 0,
        j: 0,
        dp1d: [globalMaxDist, depth, dist],
        memo: [globalMaxDist, depth, dist],
        activeSlot: 0,
        tag: `穿越:${crossDist}, 子树距:${dist}`,
        log: `| ⚡ 节点 [${node.val}] 计算: 左深=${L.depth}, 右深=${R.depth} -> 穿越=${crossDist}, 内部最大距=${dist}, 深度=${depth} (全局最大: ${oldAns} -> ${globalMaxDist})`,
        msg: `节点 <strong>Node(${node.val})</strong>：左深度=${L.depth}，右深度=${R.depth}，穿越路径长 <code>${crossDist} = ${L.depth} + ${R.depth}</code>，子树最大距离 <strong>${dist}</strong>，向父汇报深度 <strong>${depth}</strong>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return { depth, dist };
    }

    dfs(root);

    steps.push({
      type: 'return',
      line: anchorMap?.return || 13,
      i: 0,
      j: 0,
      dp1d: [globalMaxDist, globalMaxDist, globalMaxDist],
      memo: [globalMaxDist, globalMaxDist, globalMaxDist],
      activeSlot: 0,
      tag: `最大距离: ${globalMaxDist}`,
      log: `| 🏆 树型DP推导完成！整棵树中任意两节点间最大距离为 ${globalMaxDist}`,
      msg: `🏆 树型 DP 推导完成！整棵树任意两节点间最大距离为 <strong>${globalMaxDist}</strong>。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps;
  }

  // =========================================================================
  // 2. 最大 BST 子树 (Largest BST Subtree)
  // =========================================================================
  private compileLargestBST(
    _model: IYamlAlgorithmModel,
    arr: (number | null)[],
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const root = buildRawTree(arr);
    if (!root) return [];

    const tags = new Map<string, string>();
    const statuses = new Map<string, UniversalTreeNode['status']>();
    let maxSize = 0;

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '启动四元组汇报',
      log: '🌲 最大BST子树：每个节点汇报 [isBST, minVal, maxVal, size] 四元组',
      msg: '启动自底向上后序遍历：融合左右子树四元组，判定当前子树是否构成 BST。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    function dfs(node: RawTreeNode | null): { isBST: boolean; min: number; max: number; size: number } {
      if (!node) return { isBST: true, min: Infinity, max: -Infinity, size: 0 };

      statuses.set(node.id, 'current');
      const L = dfs(node.left);
      const R = dfs(node.right);

      const isBST = L.isBST && R.isBST && L.max < node.val && node.val < R.min;
      const size = isBST ? L.size + R.size + 1 : 0;
      if (isBST) maxSize = Math.max(maxSize, size);

      const minVal = Math.min(L.min === Infinity ? node.val : L.min, node.val);
      const maxVal = Math.max(R.max === -Infinity ? node.val : R.max, node.val);

      tags.set(node.id, isBST ? `✅BST(${size})` : '❌非BST');
      statuses.set(node.id, isBST ? 'visited' : 'base');

      const lMaxStr = L.max === -Infinity ? '-∞' : String(L.max);
      const rMinStr = R.min === Infinity ? '+∞' : String(R.min);

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 8,
        i: 0,
        j: 0,
        dp1d: [maxSize, size],
        memo: [maxSize, size],
        activeSlot: 0,
        tag: isBST ? `✅BST 节点数:${size}` : '❌不满足BST条件',
        log: `| ⚡ 节点 [${node.val}]: 左BST=${L.isBST}(最大=${lMaxStr}), 右BST=${R.isBST}(最小=${rMinStr}) -> 当前${isBST ? '是BST' : '非BST'}(size=${size}), 全局maxSize=${maxSize}`,
        msg: `节点 <strong>Node(${node.val})</strong>：左最大值=<code>${lMaxStr}</code> < 节点值 <code>${node.val}</code> < 右最小值 <code>${rMinStr}</code> → <strong>${isBST ? `✅ 是合法 BST (包含 ${size} 个节点)` : '❌ 无法构成 BST'}</strong>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return { isBST, min: minVal, max: maxVal, size };
    }

    dfs(root);

    steps.push({
      type: 'return',
      line: anchorMap?.return || 17,
      i: 0,
      j: 0,
      dp1d: [maxSize],
      memo: [maxSize],
      activeSlot: 0,
      tag: `最大BST大小: ${maxSize}`,
      log: `| 🏆 遍历完成！整棵二叉树中最大 BST 子树共有 ${maxSize} 个节点`,
      msg: `🏆 演化推导完成！最大 BST 子树节点数为 <strong>${maxSize}</strong>。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps;
  }

  // =========================================================================
  // 3. 二叉树最大路径和 (Binary Tree Maximum Path Sum, LC 124)
  // =========================================================================
  private compileMaxPathSum(
    _model: IYamlAlgorithmModel,
    arr: (number | null)[],
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const root = buildRawTree(arr);
    if (!root) return [];

    const tags = new Map<string, string>();
    const statuses = new Map<string, UniversalTreeNode['status']>();
    let maxPath = -Infinity;

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '启动后序收益汇聚',
      log: '🌲 最大路径和：每个节点向父节点汇报【单侧最大延伸收益】(负收益截断取0)',
      msg: '启动后序遍历：以每个节点为拱顶结算拐点路径和，向上回溯单侧最大收益。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    function dfs(node: RawTreeNode | null): number {
      if (!node) return 0;

      statuses.set(node.id, 'current');
      const leftGain = Math.max(0, dfs(node.left));
      const rightGain = Math.max(0, dfs(node.right));

      const archSum = node.val + leftGain + rightGain;
      const oldMax = maxPath;
      maxPath = Math.max(maxPath, archSum);

      const returnGain = node.val + Math.max(leftGain, rightGain);
      tags.set(node.id, `拐:${archSum}, 益:${returnGain}`);
      statuses.set(node.id, 'visited');

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: 0,
        dp1d: [maxPath, archSum, returnGain],
        memo: [maxPath, archSum, returnGain],
        activeSlot: 0,
        tag: `拱顶路径和:${archSum}`,
        log: `| ⚡ 节点 [${node.val}]: 左收益=${leftGain}, 右收益=${rightGain} -> 拱顶闭合路径=${archSum}, 向父返回=${returnGain} (全局最大: ${oldMax} -> ${maxPath})`,
        msg: `节点 <strong>Node(${node.val})</strong>：左单侧增益=${leftGain}，右单侧增益=${rightGain}，以当前节点为顶点的拱形路径和 <code>${archSum} = ${node.val} + ${leftGain} + ${rightGain}</code>，向父汇报单向增益 <strong>${returnGain}</strong>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return returnGain;
    }

    dfs(root);

    steps.push({
      type: 'return',
      line: anchorMap?.return || 12,
      i: 0,
      j: 0,
      dp1d: [maxPath],
      memo: [maxPath],
      activeSlot: 0,
      tag: `最大路径和: ${maxPath}`,
      log: `| 🏆 演化完成！整棵二叉树最大路径和为 ${maxPath}`,
      msg: `🏆 演化推导完成！整棵二叉树最大路径和为 <strong>${maxPath}</strong>。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps;
  }

  // =========================================================================
  // 4. 二叉树的直径 (Diameter of Binary Tree, LC 543)
  // =========================================================================
  private compileTreeDiameter(
    _model: IYamlAlgorithmModel,
    arr: (number | null)[],
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const root = buildRawTree(arr);
    if (!root) return [];

    const tags = new Map<string, string>();
    const statuses = new Map<string, UniversalTreeNode['status']>();
    let maxDiameter = 0;

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '启动直径统计',
      log: '🌲 二叉树直径：拐点路径边数 = 左深度 + 右深度',
      msg: '启动后序遍历：计算每个节点的最大深度并结算穿过当前节点的最长路径。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    function dfs(node: RawTreeNode | null): number {
      if (!node) return 0;

      statuses.set(node.id, 'current');
      const left = dfs(node.left);
      const right = dfs(node.right);
      const currentDiameter = left + right;

      maxDiameter = Math.max(maxDiameter, currentDiameter);
      const depth = Math.max(left, right) + 1;

      tags.set(node.id, `深:${depth}, 直:${currentDiameter}`);
      statuses.set(node.id, 'visited');

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 7,
        i: 0,
        j: 0,
        dp1d: [maxDiameter, depth, currentDiameter],
        memo: [maxDiameter, depth, currentDiameter],
        activeSlot: 0,
        tag: `拐点直径:${currentDiameter}`,
        log: `| ⚡ 节点 [${node.val}]: 左深度=${left}, 右深度=${right} -> 当前拐点路径边数=${currentDiameter}, 全局直径=${maxDiameter}`,
        msg: `节点 <strong>Node(${node.val})</strong>：左深度=${left}，右深度=${right}，拐点路径长 <code>${currentDiameter} = ${left} + ${right}</code>，向父汇报单侧深度 <strong>${depth}</strong>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return depth;
    }

    dfs(root);

    steps.push({
      type: 'return',
      line: anchorMap?.return || 12,
      i: 0,
      j: 0,
      dp1d: [maxDiameter],
      memo: [maxDiameter],
      activeSlot: 0,
      tag: `最大直径: ${maxDiameter}`,
      log: `| 🏆 演化完成！二叉树的最大直径为 ${maxDiameter}`,
      msg: `🏆 演化推导完成！二叉树的最大直径为 <strong>${maxDiameter}</strong>。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps;
  }

  // =========================================================================
  // 5. 监控二叉树 (Binary Tree Cameras, LC 968)
  // =========================================================================
  private compileBinaryTreeCameras(
    _model: IYamlAlgorithmModel,
    arr: (number | null)[],
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const root = buildRawTree(arr);
    if (!root) return [];

    const tags = new Map<string, string>();
    const statuses = new Map<string, UniversalTreeNode['status']>();
    let cameras = 0;

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '启动三状态机后序遍历',
      log: '🌲 监控二叉树：0-无覆盖, 1-被覆盖无相机, 2-已安放相机',
      msg: '启动后序遍历：叶子节点优先不放相机，由其父节点放相机以获得最大覆盖效益。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    // 0: 无覆盖, 1: 有覆盖无相机, 2: 安放相机
    function dfs(node: RawTreeNode | null): number {
      if (!node) return 1; // 空节点视为被覆盖

      statuses.set(node.id, 'current');
      const left = dfs(node.left);
      const right = dfs(node.right);

      let state = 1;
      if (left === 0 || right === 0) {
        // 子节点至少有一个未覆盖，当前必须安放相机
        cameras++;
        state = 2;
        tags.set(node.id, '📷 已放相机');
        statuses.set(node.id, 'visited');
      } else if (left === 2 || right === 2) {
        // 子节点有相机，当前已被覆盖
        state = 1;
        tags.set(node.id, '🛡️ 已被覆盖');
        statuses.set(node.id, 'base');
      } else {
        // 左右子节点都被覆盖但无相机，当前处于未覆盖状态
        state = 0;
        tags.set(node.id, '⚠️ 待覆盖');
        statuses.set(node.id, 'normal');
      }

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: 0,
        dp1d: [cameras, state],
        memo: [cameras, state],
        activeSlot: 0,
        tag: state === 2 ? '📷 安放相机' : state === 1 ? '🛡️ 被覆盖' : '⚠️ 待覆盖',
        log: `| ⚡ 节点 [${node.val}]: 左状态=${left}, 右状态=${right} -> 当前状态=${state} (相机数: ${cameras})`,
        msg: `节点 <strong>Node(${node.val})</strong>：左子状态=${left}，右子状态=${right} → 判定当前状态为 <strong>${state === 2 ? '📷 安放相机 (累加相机数)' : state === 1 ? '🛡️ 已被子节点相机覆盖' : '⚠️ 未被覆盖 (留给父节点处理)'}</strong>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return state;
    }

    const rootState = dfs(root);
    if (rootState === 0) {
      cameras++;
      tags.set(root.id, '📷 根节点补相机');
      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 10,
        i: 0,
        j: 0,
        dp1d: [cameras],
        memo: [cameras],
        activeSlot: 0,
        tag: '根节点未覆盖，补充相机',
        log: `| ⚡ 根节点最终未被覆盖，在根节点追加 1 个相机 -> 总数 = ${cameras}`,
        msg: `根节点处于未覆盖状态，在根节点追加 1 个相机，总相机数更新为 <strong>${cameras}</strong>。`,
        activeNodeId: root.id,
        treeRoot: toUniversalTree(root, root.id, tags, statuses),
      });
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 13,
      i: 0,
      j: 0,
      dp1d: [cameras],
      memo: [cameras],
      activeSlot: 0,
      tag: `最少相机数: ${cameras}`,
      log: `| 🏆 演化完成！覆盖整棵树最少需要 ${cameras} 个摄像头`,
      msg: `🏆 演化推导完成！覆盖整棵树最少需要 <strong>${cameras}</strong> 个摄像头。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps;
  }

  // =========================================================================
  // 6. 选课 (Course Selection / 树上背包 DP, 洛谷 P2014)
  // =========================================================================
  private compileCourseSelection(
    _model: IYamlAlgorithmModel,
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const treeRootNode: UniversalTreeNode = {
      id: 'course-0',
      r: 0,
      c: 0,
      val: '虚拟根(0)',
      status: 'visited',
      tag: '学分:0',
      children: [
        {
          id: 'course-1',
          r: 1,
          c: 0,
          val: '课1(学分2)',
          status: 'visited',
          tag: '最优学分:5',
          children: [
            { id: 'course-2', r: 2, c: 0, val: '课2(学分3)', status: 'base', tag: '最优学分:3', children: [] }
          ]
        },
        {
          id: 'course-3',
          r: 1,
          c: 1,
          val: '课3(学分4)',
          status: 'visited',
          tag: '最优学分:4',
          children: []
        }
      ]
    };

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0, 2, 3, 4],
      memo: [0, 2, 3, 4],
      activeSlot: 0,
      tag: '树上分组背包',
      log: '🌲 树上有依赖背包：以虚拟超级根节点 0 建立依赖拓扑树',
      msg: '将课程依赖关系转化为以虚拟超级根 <code>0</code> 为根的树，进行树上分组背包倒序转移。',
      activeNodeId: treeRootNode.id,
      treeRoot: cloneTree(treeRootNode),
    });

    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 6,
      i: 0,
      j: 0,
      dp1d: [0, 2, 5, 6],
      memo: [0, 2, 5, 6],
      activeSlot: 3,
      tag: '合并子树背包 dp[0][m+1] = 6',
      log: '| ⚡ 子树合并: 选修课1(2分) + 课3(4分) -> 最大学分 = 6',
      msg: '在容量限制下合并子树：选择 <strong>课程 1</strong> 与 <strong>课程 3</strong>，获得最大学分 <strong>6</strong>。',
      activeNodeId: 'course-1',
      treeRoot: cloneTree(treeRootNode),
    });

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: 0,
      dp1d: [6, 6, 6, 6],
      memo: [6, 6, 6, 6],
      activeSlot: 0,
      tag: '最大学分: 6',
      log: '| 🏆 树上背包计算完成！最多选 m 门课所能获得的最大学分为 6',
      msg: '🏆 演化推导完成！最多选 m 门课所能获得的最大学分为 <strong>6</strong>。',
      activeNodeId: treeRootNode.id,
      treeRoot: cloneTree(treeRootNode),
    });

    return steps;
  }

  // =========================================================================
  // 7. 到达首都的最少油耗 (Minimum Fuel Cost to Capital, LC 2477)
  // =========================================================================
  private compileMinimumFuelCost(
    _model: IYamlAlgorithmModel,
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const seats = 2;
    const treeRootNode: UniversalTreeNode = {
      id: 'city-0',
      r: 0,
      c: 0,
      val: '首都(0)',
      status: 'visited',
      tag: '全国7人|总耗油7L',
      children: [
        {
          id: 'city-1',
          r: 1,
          c: 0,
          val: '市#1',
          status: 'visited',
          tag: '3人|跨边2车(2L)',
          children: [
            { id: 'city-2', r: 2, c: 0, val: '市#2', status: 'base', tag: '1人|跨边1车(1L)', children: [] },
            { id: 'city-3', r: 2, c: 1, val: '市#3', status: 'base', tag: '1人|跨边1车(1L)', children: [] },
          ],
        },
        {
          id: 'city-4',
          r: 1,
          c: 1,
          val: '市#4',
          status: 'visited',
          tag: '2人|跨边1车(1L)',
          children: [
            { id: 'city-6', r: 2, c: 2, val: '市#6', status: 'base', tag: '1人|跨边1车(1L)', children: [] },
          ],
        },
        {
          id: 'city-5',
          r: 1,
          c: 2,
          val: '市#5',
          status: 'base',
          tag: '1人|跨边1车(1L)',
          children: [],
        },
      ],
    };

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '启动后序拼车统计',
      log: `🌲 到达首都最少油耗：自底向上统计子树人数 size，每条边消耗 ⌈size / ${seats}⌉ 升油`,
      msg: `启动后序遍历：每辆车最多坐 <code>${seats}</code> 人，统计各子树代表总人数并计算跨边车数。`,
      activeNodeId: treeRootNode.id,
      treeRoot: cloneTree(treeRootNode),
    });

    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 8,
      i: 0,
      j: 0,
      dp1d: [7, 3, 2],
      memo: [7, 3, 2],
      activeSlot: 0,
      tag: '汇总全树代表跨边油耗',
      log: '| ⚡ 跨边油耗累加: 市#1子树3人需2车(2L), 市#4子树2人需1车(1L), 叶节点各需1车(1L) -> 总耗油 = 7L',
      msg: `子树汇聚：节点 <strong>市#1</strong> 汇聚 3 人驶向首都需要 <code>⌈3 / 2⌉ = 2</code> 辆车，累计全国总油耗为 <strong>7</strong> 升。`,
      activeNodeId: 'city-1',
      treeRoot: cloneTree(treeRootNode),
    });

    steps.push({
      type: 'return',
      line: anchorMap?.return || 15,
      i: 0,
      j: 0,
      dp1d: [7],
      memo: [7],
      activeSlot: 0,
      tag: '最少总油耗: 7 升',
      log: '| 🏆 计算完成！所有代表到达首都的最少总油耗为 7 升',
      msg: `🏆 演化推导完成！所有代表到达首都的最少总油耗为 <strong>7 升</strong>。`,
      activeNodeId: treeRootNode.id,
      treeRoot: cloneTree(treeRootNode),
    });

    return steps;
  }

  // =========================================================================
  // 8. 相邻字符不同的最长路径 (Longest Path with Different Chars, LC 2246)
  // =========================================================================
  private compileLongestPathDifferentCharacters(
    _model: IYamlAlgorithmModel,
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const treeRootNode: UniversalTreeNode = {
      id: 'char-0',
      r: 0,
      c: 0,
      val: "点#0('a')",
      status: 'visited',
      tag: '单链:2|拐点:3',
      children: [
        {
          id: 'char-1',
          r: 1,
          c: 0,
          val: "点#1('b')",
          status: 'visited',
          tag: '单链:2|拐点:2',
          children: [
            { id: 'char-3', r: 2, c: 0, val: "点#3('c')", status: 'base', tag: '单链:1|拐点:1', children: [] },
            { id: 'char-4', r: 2, c: 1, val: "点#4('b')", status: 'base', tag: '单链:1|拐点:1', children: [] },
          ],
        },
        {
          id: 'char-2',
          r: 1,
          c: 1,
          val: "点#2('a')",
          status: 'base',
          tag: '单链:1|拐点:1',
          children: [
            { id: 'char-5', r: 2, c: 2, val: "点#5('e')", status: 'base', tag: '单链:1|拐点:1', children: [] },
          ],
        },
      ],
    };

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [1],
      memo: [1],
      activeSlot: 0,
      tag: '启动字符互异路径搜索',
      log: "🌲 相邻字符不同最长路径：子节点字符不同时，贪心维护最长子链 max1 与次长子链 max2",
      msg: '启动后序遍历：寻找满足相邻节点字符互异的最长拐点路径 <code>1 + max1 + max2</code>。',
      activeNodeId: treeRootNode.id,
      treeRoot: cloneTree(treeRootNode),
    });

    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 7,
      i: 0,
      j: 0,
      dp1d: [3, 2, 1],
      memo: [3, 2, 1],
      activeSlot: 0,
      tag: '拐点路径融合: 1+1+1=3',
      log: "| ⚡ 节点 #0('a'): 左子树#1('b')提供最长链1，路径 3('c') -> 1('b') -> 0('a') 构成最长合法路径",
      msg: "节点 <strong>点#0('a')</strong>：与子节点 <strong>点#1('b')</strong> 字符互异，成功拼接单链并形成全局最长路径 <strong>3</strong>。",
      activeNodeId: 'char-0',
      treeRoot: cloneTree(treeRootNode),
    });

    steps.push({
      type: 'return',
      line: anchorMap?.return || 16,
      i: 0,
      j: 0,
      dp1d: [3],
      memo: [3],
      activeSlot: 0,
      tag: '最长路径: 3',
      log: '| 🏆 计算完成！相邻字符不同的最长路径长度为 3',
      msg: '🏆 演化推导完成！相邻字符不同的最长路径长度为 <strong>3</strong>。',
      activeNodeId: treeRootNode.id,
      treeRoot: cloneTree(treeRootNode),
    });

    return steps;
  }

  // =========================================================================
  // 9. 没有上司的舞会 (Happy Party / 树上最大独立集, 洛谷 P1352)
  // =========================================================================
  private compilePartyWithoutBoss(
    _model: IYamlAlgorithmModel,
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const treeRootNode: UniversalTreeNode = {
      id: 'emp-1',
      r: 0,
      c: 0,
      val: '领导#1(乐4)',
      status: 'visited',
      tag: '不来:7|来:8',
      children: [
        {
          id: 'emp-2',
          r: 1,
          c: 0,
          val: '主管#2(乐1)',
          status: 'visited',
          tag: '不来:5|来:4',
          children: [
            { id: 'emp-4', r: 2, c: 0, val: '员工#4(乐3)', status: 'base', tag: '不来:0|来:3', children: [] },
            { id: 'emp-5', r: 2, c: 1, val: '员工#5(乐2)', status: 'base', tag: '不来:0|来:2', children: [] },
          ],
        },
        {
          id: 'emp-3',
          r: 1,
          c: 1,
          val: '主管#3(乐2)',
          status: 'visited',
          tag: '不来:6|来:2',
          children: [
            { id: 'emp-6', r: 2, c: 2, val: '员工#6(乐5)', status: 'base', tag: '不来:0|来:5', children: [] },
            { id: 'emp-7', r: 2, c: 3, val: '员工#7(乐1)', status: 'base', tag: '不来:0|来:1', children: [] },
          ],
        },
      ],
    };

    // 1. 入口: maxHappy
    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 2,
      i: 0,
      j: 0,
      dp1d: [0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: '入口: maxHappy',
      log: '🚀 进入 maxHappy：准备寻找最高上司根节点并构建树型依赖结构',
      msg: '算法启动：寻找没有上司的最高管理者（根节点 <strong>#1</strong>）。',
      activeNodeId: 'emp-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 2. 定位根节点
    steps.push({
      type: 'init',
      line: anchorMap?.init || 8,
      i: 1,
      j: 0,
      dp1d: [0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: '找到根节点: #1',
      log: '👑 寻根完成：节点 #1 没有上司，为整棵公司树的最高上司 (root=1)',
      msg: '定位最高上司根节点 <strong>#1</strong>，准备对其子树执行后序 DFS。',
      activeNodeId: 'emp-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 3. 调用 dfs(root=1)
    steps.push({
      type: 'call',
      line: 9,
      i: 1,
      j: 0,
      dp1d: [0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: '调用 dfs(root=1)',
      log: '🌲 调用 dfs(u=1)：深入后序遍历，递归各级主管与员工汇报决策',
      msg: '调用 <code>dfs(root=1)</code>，向左右子部门递归，收集子树汇报。',
      activeNodeId: 'emp-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 4. 员工 #4 汇报
    steps.push({
      type: 'update',
      line: 15,
      i: 4,
      j: 0,
      dp1d: [0, 3],
      memo: [0, 3],
      activeSlot: 1,
      tag: '员工#4: [不来:0, 来:3]',
      log: '| 📍 员工#4(快乐值3)为叶子: 不来=0, 参加=3，向主管#2汇报 [0, 3]',
      msg: '员工 <strong>#4</strong> 为叶节点：不来得 <code>0</code>，参加得 <code>3</code>，汇报 <code>[0, 3]</code>。',
      activeNodeId: 'emp-4',
      treeRoot: cloneTree(treeRootNode),
    });

    // 5. 员工 #5 汇报
    steps.push({
      type: 'update',
      line: 15,
      i: 5,
      j: 0,
      dp1d: [0, 2],
      memo: [0, 2],
      activeSlot: 1,
      tag: '员工#5: [不来:0, 来:2]',
      log: '| 📍 员工#5(快乐值2)为叶子: 不来=0, 参加=2，向主管#2汇报 [0, 2]',
      msg: '员工 <strong>#5</strong> 为叶节点：不来得 <code>0</code>，参加得 <code>2</code>，汇报 <code>[0, 2]</code>。',
      activeNodeId: 'emp-5',
      treeRoot: cloneTree(treeRootNode),
    });

    // 6. 主管 #2 状态转移
    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 18,
      i: 2,
      j: 0,
      dp1d: [5, 4],
      memo: [5, 4],
      activeSlot: 0,
      tag: '主管#2决策: [不来:5, 来:4]',
      log: '| ⚡ 主管#2合并下属决策: 不来=max(0,3)+max(0,2)=5; 参加=1+0+0=4，汇报 [5, 4]',
      msg: '主管 <strong>#2</strong> 汇总：若不来，下属 4 与 5 自选最优 <code>3 + 2 = 5</code>；若参加，下属均不能来，得 <code>1 + 0 + 0 = 4</code>。',
      activeNodeId: 'emp-2',
      treeRoot: cloneTree(treeRootNode),
    });

    // 7. 员工 #6 汇报
    steps.push({
      type: 'update',
      line: 15,
      i: 6,
      j: 0,
      dp1d: [0, 5],
      memo: [0, 5],
      activeSlot: 1,
      tag: '员工#6: [不来:0, 来:5]',
      log: '| 📍 员工#6(快乐值5)为叶子: 不来=0, 参加=5，向主管#3汇报 [0, 5]',
      msg: '员工 <strong>#6</strong> 为叶节点：不来得 <code>0</code>，参加得 <code>5</code>，汇报 <code>[0, 5]</code>。',
      activeNodeId: 'emp-6',
      treeRoot: cloneTree(treeRootNode),
    });

    // 8. 员工 #7 汇报
    steps.push({
      type: 'update',
      line: 15,
      i: 7,
      j: 0,
      dp1d: [0, 1],
      memo: [0, 1],
      activeSlot: 1,
      tag: '员工#7: [不来:0, 来:1]',
      log: '| 📍 员工#7(快乐值1)为叶子: 不来=0, 参加=1，向主管#3汇报 [0, 1]',
      msg: '员工 <strong>#7</strong> 为叶节点：不来得 <code>0</code>，参加得 <code>1</code>，汇报 <code>[0, 1]</code>。',
      activeNodeId: 'emp-7',
      treeRoot: cloneTree(treeRootNode),
    });

    // 9. 主管 #3 状态转移
    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 18,
      i: 3,
      j: 0,
      dp1d: [6, 2],
      memo: [6, 2],
      activeSlot: 0,
      tag: '主管#3决策: [不来:6, 来:2]',
      log: '| ⚡ 主管#3合并下属决策: 不来=max(0,5)+max(0,1)=6; 参加=2+0+0=2，汇报 [6, 2]',
      msg: '主管 <strong>#3</strong> 汇总：若不来，下属 6 与 7 自选最优 <code>5 + 1 = 6</code>；若参加，下属均不能来，得 <code>2 + 0 + 0 = 2</code>。',
      activeNodeId: 'emp-3',
      treeRoot: cloneTree(treeRootNode),
    });

    // 10. 最高领导 #1 最终决策
    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 18,
      i: 1,
      j: 0,
      dp1d: [11, 15],
      memo: [11, 15],
      activeSlot: 1,
      tag: '领导#1决策: [不来:11, 来:15]',
      log: '| ⚡ 领导#1决策: 不来 = max(5,4)+max(6,2) = 11; 参加 = 4 + 5 + 6 = 15',
      msg: '最高领导 <strong>#1</strong>：若不来得 <code>5 + 6 = 11</code>；若参加则直接下属不能来，总快乐值为 <code>4 + 5 + 6 = 15</code>。',
      activeNodeId: 'emp-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 11. 返回结果
    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 1,
      j: 0,
      dp1d: [15],
      memo: [15],
      activeSlot: 0,
      tag: '舞会最大快乐值: 15',
      log: '| 🏆 计算完成！max(res[0], res[1]) = max(11, 15) = 15',
      msg: '🏆 演化推导完成！舞会最大快乐指数为 <strong>15</strong>。',
      activeNodeId: 'emp-1',
      treeRoot: cloneTree(treeRootNode),
    });

    return steps;
  }

  // =========================================================================
  // 10. 移除子树后的二叉树高度 (Height After Subtree Removal, LC 2458)
  // =========================================================================
  private compileHeightRemovalQueries(
    _model: IYamlAlgorithmModel,
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const treeRootNode: UniversalTreeNode = {
      id: 'node-1',
      r: 0,
      c: 0,
      val: '点#1(深0)',
      status: 'visited',
      tag: 'DFN:1|深:0',
      children: [
        {
          id: 'node-3',
          r: 1,
          c: 0,
          val: '点#3(深1)',
          status: 'visited',
          tag: 'DFN:2|深:1',
          children: [
            { id: 'node-2', r: 2, c: 0, val: '点#2(深2)', status: 'visited', tag: 'DFN:3|深:2', children: [] },
          ],
        },
        {
          id: 'node-4',
          r: 1,
          c: 1,
          val: '点#4(深1)',
          status: 'visited',
          tag: 'DFN:4|深:1',
          children: [
            { id: 'node-6', r: 2, c: 1, val: '点#6(深2)', status: 'visited', tag: 'DFN:5|深:2', children: [] },
            { id: 'node-5', r: 2, c: 2, val: '点#5(深2)', status: 'visited', tag: 'DFN:6|深:2', children: [] },
          ],
        },
      ],
    };

    const queryTree = cloneTree(treeRootNode);
    const markDisabled = (node: UniversalTreeNode) => {
      if (node.id === 'node-4' || node.id === 'node-6' || node.id === 'node-5') {
        node.status = 'pruned';
        node.tag = '已剔除';
      }
      node.children?.forEach(markDisabled);
    };
    markDisabled(queryTree);

    // 1. 入口: treeQueries
    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 8,
      i: 0,
      j: 0,
      dp1d: [0, 0, 0, 0, 0, 0],
      memo: [0, 0, 0, 0, 0, 0],
      activeSlot: 0,
      tag: '入口: treeQueries',
      log: '🚀 进入 treeQueries(root, queries=[4])，准备执行先序遍历与 DFN 序打平',
      msg: '算法启动：接收二叉树与查询数组 <code>queries = [4]</code>，准备建立 DFN 序号映射与深度数组。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 2. 调用 dfs(root, 0)
    steps.push({
      type: 'call',
      line: anchorMap?.init || 9,
      i: 0,
      j: 0,
      dp1d: [0, 0, 0, 0, 0, 0],
      memo: [0, 0, 0, 0, 0, 0],
      activeSlot: 0,
      tag: '调用: dfs(root, 0)',
      log: '🌲 执行 dfs(root, 0)：先序遍历整树建立 DFN 序号与深度映射',
      msg: '调用 <code>dfs(root, 0)</code>，开始为每个二叉树节点分配先序访问时间戳（DFN 序）。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 3. DFS 根节点 #1 记录
    steps.push({
      type: 'update',
      line: 24,
      i: 1,
      j: 0,
      dp1d: [0, 0, 0, 0, 0, 0],
      memo: [0, 0, 0, 0, 0, 0],
      activeSlot: 0,
      tag: '点#1: DFN=1, 深=0',
      log: '| 📍 访问根节点 #1: 分配 dfn[1]=1, deep[1]=0, size[1]=1',
      msg: '到达根节点 <strong>#1</strong>：时间戳 <code>dfnCnt=1</code>，记录深度 <code>deep[1]=0</code>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 4. DFS 深入左孩子 #3
    steps.push({
      type: 'call',
      line: 25,
      i: 3,
      j: 1,
      dp1d: [0, 1, 0, 0, 0, 0],
      memo: [0, 1, 0, 0, 0, 0],
      activeSlot: 1,
      tag: '深入左子树: 点#3',
      log: '| 🌲 节点 #1.left != null: 递归调用 dfs(node=3, d=1)',
      msg: '节点 1 存在左孩子，递归进入 <code>dfs(node=3, d=1)</code>。',
      activeNodeId: 'node-3',
      treeRoot: cloneTree(treeRootNode),
    });

    // 5. DFS 记录点 #3 状态
    steps.push({
      type: 'update',
      line: 24,
      i: 3,
      j: 1,
      dp1d: [0, 1, 0, 0, 0, 0],
      memo: [0, 1, 0, 0, 0, 0],
      activeSlot: 1,
      tag: '点#3: DFN=2, 深=1',
      log: '| 📍 访问节点 #3: 分配 dfn[3]=2, deep[2]=1, size[2]=1',
      msg: '到达节点 <strong>#3</strong>：时间戳 <code>dfnCnt=2</code>，记录深度 <code>deep[2]=1</code>。',
      activeNodeId: 'node-3',
      treeRoot: cloneTree(treeRootNode),
    });

    // 6. DFS 深入左孩子 #2
    steps.push({
      type: 'call',
      line: 25,
      i: 2,
      j: 2,
      dp1d: [0, 1, 2, 0, 0, 0],
      memo: [0, 1, 2, 0, 0, 0],
      activeSlot: 2,
      tag: '深入左子树: 点#2',
      log: '| 🌲 节点 #3.left != null: 递归调用 dfs(node=2, d=2)',
      msg: '节点 3 存在左孩子，递归进入叶子节点 <code>dfs(node=2, d=2)</code>。',
      activeNodeId: 'node-2',
      treeRoot: cloneTree(treeRootNode),
    });

    // 7. DFS 记录点 #2 状态
    steps.push({
      type: 'update',
      line: 24,
      i: 2,
      j: 2,
      dp1d: [0, 1, 2, 0, 0, 0],
      memo: [0, 1, 2, 0, 0, 0],
      activeSlot: 2,
      tag: '点#2: DFN=3, 深=2',
      log: '| 📍 访问叶子节点 #2: 分配 dfn[2]=3, deep[3]=2, size[3]=1',
      msg: '到达叶子节点 <strong>#2</strong>：时间戳 <code>dfnCnt=3</code>，记录深度 <code>deep[3]=2</code>。',
      activeNodeId: 'node-2',
      treeRoot: cloneTree(treeRootNode),
    });

    // 8. DFS 回溯至 #3 累加子树大小
    steps.push({
      type: 'update',
      line: 25,
      i: 3,
      j: 1,
      dp1d: [0, 1, 2, 0, 0, 0],
      memo: [0, 1, 2, 0, 0, 0],
      activeSlot: 1,
      tag: '点#3回溯: size[2]=2',
      log: '| ↩ 回溯至节点 #3: 累加左子树大小，size[2] = 1 + size[3] = 2',
      msg: '叶子节点 2 遍历完成返回，节点 3 累加左子树大小：<code>size[dfn[3]] = 2</code>。',
      activeNodeId: 'node-3',
      treeRoot: cloneTree(treeRootNode),
    });

    // 9. DFS 深入右孩子 #4
    steps.push({
      type: 'call',
      line: 26,
      i: 4,
      j: 1,
      dp1d: [0, 1, 2, 1, 0, 0],
      memo: [0, 1, 2, 1, 0, 0],
      activeSlot: 3,
      tag: '深入右子树: 点#4',
      log: '| 🌲 节点 #1.right != null: 递归调用 dfs(node=4, d=1)',
      msg: '回溯至根节点 1，转向右子树：递归进入 <code>dfs(node=4, d=1)</code>。',
      activeNodeId: 'node-4',
      treeRoot: cloneTree(treeRootNode),
    });

    // 10. DFS 记录点 #4 状态
    steps.push({
      type: 'update',
      line: 24,
      i: 4,
      j: 1,
      dp1d: [0, 1, 2, 1, 0, 0],
      memo: [0, 1, 2, 1, 0, 0],
      activeSlot: 3,
      tag: '点#4: DFN=4, 深=1',
      log: '| 📍 访问节点 #4: 分配 dfn[4]=4, deep[4]=1, size[4]=1',
      msg: '到达节点 <strong>#4</strong>：时间戳 <code>dfnCnt=4</code>，记录深度 <code>deep[4]=1</code>。',
      activeNodeId: 'node-4',
      treeRoot: cloneTree(treeRootNode),
    });

    // 11. DFS 记录点 #6 (4的左孩子)
    steps.push({
      type: 'update',
      line: 24,
      i: 6,
      j: 2,
      dp1d: [0, 1, 2, 1, 2, 0],
      memo: [0, 1, 2, 1, 2, 0],
      activeSlot: 4,
      tag: '点#6: DFN=5, 深=2',
      log: '| 📍 访问节点 #6: 分配 dfn[6]=5, deep[5]=2, size[5]=1',
      msg: '到达叶子节点 <strong>#6</strong>：时间戳 <code>dfnCnt=5</code>，记录深度 <code>deep[5]=2</code>。',
      activeNodeId: 'node-6',
      treeRoot: cloneTree(treeRootNode),
    });

    // 12. DFS 记录点 #5 (4的右孩子)
    steps.push({
      type: 'update',
      line: 24,
      i: 5,
      j: 2,
      dp1d: [0, 1, 2, 1, 2, 2],
      memo: [0, 1, 2, 1, 2, 2],
      activeSlot: 5,
      tag: '点#5: DFN=6, 深=2',
      log: '| 📍 访问节点 #5: 分配 dfn[5]=6, deep[6]=2, size[6]=1',
      msg: '到达叶子节点 <strong>#5</strong>：时间戳 <code>dfnCnt=6</code>，记录深度 <code>deep[6]=2</code>。',
      activeNodeId: 'node-5',
      treeRoot: cloneTree(treeRootNode),
    });

    // 13. DFS 回溯至 #4 累加子树大小
    steps.push({
      type: 'update',
      line: 26,
      i: 4,
      j: 1,
      dp1d: [0, 1, 2, 1, 2, 2],
      memo: [0, 1, 2, 1, 2, 2],
      activeSlot: 3,
      tag: '点#4回溯: size[4]=3',
      log: '| ↩ 回溯至节点 #4: 累加左右子树，size[4] = 1 + 1 + 1 = 3（子树区间 DFN[4..6]）',
      msg: '节点 4 左右子树全部遍历完毕，子树大小 <code>size=3</code>，子树在 DFN 序中为闭区间 <code>[4..6]</code>！',
      activeNodeId: 'node-4',
      treeRoot: cloneTree(treeRootNode),
    });

    // 14. 初始化前缀数组 maxLeft[1]
    steps.push({
      type: 'update',
      line: 10,
      i: 1,
      j: 0,
      dp1d: [0, 0, 0, 0, 0, 0],
      memo: [0, 0, 0, 0, 0, 0],
      activeSlot: 0,
      tag: '前缀初始化 maxLeft[1]=0',
      log: '📊 初始化前缀最大深度: maxLeft[1] = deep[1] = 0',
      msg: 'DFS 遍历全部完成。开始顺序构建前缀极值数组：<code>maxLeft[1] = deep[1] = 0</code>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 15. 循环递推 maxLeft[2..6]
    steps.push({
      type: 'update',
      line: 11,
      i: 2,
      j: 0,
      dp1d: [0, 1, 2, 2, 2, 2],
      memo: [0, 1, 2, 2, 2, 2],
      activeSlot: 5,
      tag: '前缀递推: maxLeft[1..6]',
      log: '| 📈 递推 maxLeft: [0, 1, 2, 2, 2, 2]',
      msg: '顺序递推前缀最大深度：<code>maxLeft[i] = max(maxLeft[i - 1], deep[i])</code>，得到 <code>[0, 1, 2, 2, 2, 2]</code>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 16. 初始化后缀数组 maxRight[6]
    steps.push({
      type: 'update',
      line: 12,
      i: 6,
      j: 0,
      dp1d: [0, 1, 2, 2, 2, 2],
      memo: [0, 1, 2, 2, 2, 2],
      activeSlot: 5,
      tag: '后缀初始化 maxRight[6]=2',
      log: '📊 初始化后缀最大深度: maxRight[6] = deep[6] = 2',
      msg: '自右向左构建后缀极值数组：<code>maxRight[6] = deep[6] = 2</code>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 17. 逆序递推 maxRight[5..1]
    steps.push({
      type: 'update',
      line: 13,
      i: 5,
      j: 0,
      dp1d: [2, 2, 2, 2, 2, 2],
      memo: [2, 2, 2, 2, 2, 2],
      activeSlot: 0,
      tag: '后缀递推: maxRight[6..1]',
      log: '| 📉 递推 maxRight: [2, 2, 2, 2, 2, 2]',
      msg: '逆序递推后缀最大深度：<code>maxRight[i] = max(maxRight[i + 1], deep[i])</code>，得到 <code>[2, 2, 2, 2, 2, 2]</code>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 18. 分配查询结果数组 ans
    steps.push({
      type: 'update',
      line: 14,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '分配结果数组 ans',
      log: '📦 分配查询结果数组: int[] ans = new int[queries.length]',
      msg: '为查询收集结果分配数组：<code>ans = new int[1]</code>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeRootNode),
    });

    // 19. 进入查询遍历循环
    steps.push({
      type: 'loop',
      line: 15,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '处理查询: k=0, query=4',
      log: '🔍 遍历查询: queries[0] = 4',
      msg: '进入查询遍历循环：当前处理 <code>queries[0] = 4</code>，要求剔除以节点 4 为根的子树。',
      activeNodeId: 'node-4',
      treeRoot: cloneTree(treeRootNode),
    });

    // 20. 定位子树 DFN 区间并执行剔除
    steps.push({
      type: 'update',
      line: 16,
      i: 4,
      j: 1,
      dp1d: [2],
      memo: [2],
      activeSlot: 0,
      tag: '定位子树 DFN 区间',
      log: '| 🎯 定位节点 4: i = dfn[4] = 4, size[4] = 3 → 剔除闭区间 [4..6]',
      msg: '获取节点 4 时间戳 <code>i = dfn[4] = 4</code>，该子树占据连续区间 <code>[4, 6]</code>（包含节点 4, 6, 5）。',
      activeNodeId: 'node-4',
      treeRoot: queryTree,
    });

    // 21. 核心推导：O(1) 前后缀合并
    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 17,
      i: 4,
      j: 2,
      dp1d: [2],
      memo: [2],
      activeSlot: 0,
      tag: 'O(1)极值合并: 答案=2',
      log: '| ⚡ ans[0] = max(maxLeft[3], maxRight[7]) = max(2, 0) = 2',
      msg: '<strong>核心推导</strong>：剔除区间 <code>[4..6]</code>，左侧前缀取 <code>maxLeft[3]=2</code>，右侧越界取 <code>0</code>，合并极值 <code>ans[0] = max(2, 0) = 2</code>！',
      activeNodeId: 'node-4',
      treeRoot: queryTree,
    });

    // 22. 返回结果
    steps.push({
      type: 'return',
      line: anchorMap?.return || 19,
      i: 0,
      j: 0,
      dp1d: [2],
      memo: [2],
      activeSlot: 0,
      tag: '返回结果 ans=[2]',
      log: '🏆 全部查询计算完成，返回最终答案 ans = [2]',
      msg: '🏆 演化推导完成！每个独立查询均以 $O(1)$ 时间极值合并完成，返回 <strong>[2]</strong>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeRootNode),
    });

    return steps;
  }

  // =========================================================================
  // 11. 从树中删除边的最小分数 (Minimum Score After Removals, LC 2322)
  // =========================================================================
  private compileMinimumScoreAfterRemovals(
    _model: IYamlAlgorithmModel,
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const treeRootNode: UniversalTreeNode = {
      id: 'score-0',
      r: 0,
      c: 0,
      val: '点#0(值1)',
      status: 'visited',
      tag: '异或:14|总',
      children: [
        {
          id: 'score-1',
          r: 1,
          c: 0,
          val: '点#1(值5)',
          status: 'visited',
          tag: '异或:15',
          children: [
            { id: 'score-2', r: 2, c: 0, val: '点#2(值5)', status: 'visited', tag: '异或:5', children: [] },
            {
              id: 'score-3',
              r: 2,
              c: 1,
              val: '点#3(值4)',
              status: 'visited',
              tag: '异或:15',
              children: [
                { id: 'score-4', r: 3, c: 1, val: '点#4(值11)', status: 'visited', tag: '异或:11', children: [] },
              ],
            },
          ],
        },
      ],
    };

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 3,
      i: 0,
      j: 0,
      dp1d: [14],
      memo: [14],
      activeSlot: 0,
      tag: 'DFS后序统计子树异或',
      log: '🌲 从树中删除边：以节点 0 为根建树，DFS 统计各节点 DFN 序、子树规模与子树全部异或和（allXor = 14）',
      msg: '启动后序遍历：预处理出各子树节点异或总和，整树全部节点异或值为 <code>14</code>。',
      activeNodeId: treeRootNode.id,
      treeRoot: cloneTree(treeRootNode),
    });

    const cutTree = cloneTree(treeRootNode);
    // Component 3 (root): score-0
    cutTree.status = 'normal';
    cutTree.tag = '块3(异或1)';
    // Component 2 (mid): score-1, score-3, score-4
    if (cutTree.children?.[0]) {
      cutTree.children[0].status = 'visited';
      cutTree.children[0].tag = '块2(异或10)';
      // Component 1 (deep): score-2
      if (cutTree.children[0].children?.[0]) {
        cutTree.children[0].children[0].status = 'active';
        cutTree.children[0].children[0].tag = '块1(异或5)';
      }
    }

    steps.push({
      type: 'update',
      line: anchorMap?.transfer || 31,
      i: 1,
      j: 2,
      dp1d: [5, 10, 1],
      memo: [5, 10, 1],
      activeSlot: 1,
      tag: '断边(0-1)与(1-2): 差值9',
      log: '| ⚡ 测试断边方案：切除以 #1 与 #2 为根的两子树。#2 在 #1 子树内，三块异或和分别为 5, 10, 1 → 极差 10 - 1 = 9 (最优！)',
      msg: '枚举断边 <strong>(0,1)</strong> 与 <strong>(1,2)</strong>：子树 #2 包含在子树 #1 中，三个组件异或和分别为 <code>5, 10, 1</code>，最大与最小之差为 <code>10 - 1 = 9</code>，刷新全局最小分数！',
      activeNodeId: 'score-1',
      treeRoot: cutTree,
    });

    steps.push({
      type: 'return',
      line: anchorMap?.return || 34,
      i: 0,
      j: 0,
      dp1d: [9],
      memo: [9],
      activeSlot: 0,
      tag: '最小分数: 9',
      log: '| 🏆 枚举完成！删除两条边切分 3 连通块的最小分数极差为 9',
      msg: '🏆 演化推导完成！所有边对切分方案中，最小分数为 <strong>9</strong>。',
      activeNodeId: treeRootNode.id,
      treeRoot: cloneTree(treeRootNode),
    });

    return steps;
  }
}

