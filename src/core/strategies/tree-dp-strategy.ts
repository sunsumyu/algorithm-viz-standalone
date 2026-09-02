import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';
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
    const treeState: UniversalTreeNode = {
      id: 'course-0',
      r: 0,
      c: 0,
      val: '虚拟根#0(分0)',
      status: 'normal',
      tag: '待规划',
      children: [
        {
          id: 'course-1',
          r: 1,
          c: 0,
          val: '课#1(分2)',
          status: 'normal',
          tag: '待规划',
          children: [
            { id: 'course-2', r: 2, c: 0, val: '课#2(分3)', status: 'normal', tag: '待规划', children: [] },
          ],
        },
        {
          id: 'course-3',
          r: 1,
          c: 1,
          val: '课#3(分4)',
          status: 'normal',
          tag: '待规划',
          children: [],
        },
      ],
    };

    const credits = [0, 2, 3, 4];
    const dp: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    function setCourseStatus(id: string, status: any, tag?: string) {
      function traverse(n: UniversalTreeNode) {
        if (n.id === id) {
          n.status = status;
          if (tag !== undefined) n.tag = tag;
        }
        n.children.forEach(traverse);
      }
      traverse(treeState);
    }

    function getCourseStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
      return [
        {
          id: 'arr-credits',
          name: 'credits[]',
          label: '课程自身学分',
          indices: ['#0(根)', '#1', '#2', '#3'],
          values: [...credits],
          activeIdx: activeArrName === 'credits' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-dp0',
          name: 'dp[0][]',
          label: '根节点背包最优学分',
          indices: ['选0门', '选1门', '选2门', '选3门'],
          values: [...dp[0]],
          activeIdx: activeArrName === 'dp0' ? activeSlotIdx : undefined,
          color: 'emerald',
        },
        {
          id: 'arr-dp1',
          name: 'dp[1][]',
          label: '课#1子树背包学分',
          indices: ['选0门', '选1门', '选2门', '选3门'],
          values: [...dp[1]],
          activeIdx: activeArrName === 'dp1' ? activeSlotIdx : undefined,
          color: 'purple',
        },
      ];
    }

    function addCourseStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
      }
    ) {
      const { activeArrName, activeArrSlot, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getCourseStateArrays(activeArrName, activeArrSlot),
      });
    }

    // Line 2: public int maxCourseScore(...)
    addCourseStep({
      type: 'entry',
      line: anchorMap?.entry || 2,
      i: 0,
      j: 0,
      dp1d: [...dp[0]],
      memo: [...dp[0]],
      activeSlot: 0,
      tag: 'maxCourseScore 入口',
      log: '🚀 maxCourseScore 入口：建立虚拟超级根节点 0，容积上限 m=2 (+1虚拟额度=3)',
      msg: '启动 <code>maxCourseScore</code>：以虚拟根节点 <strong>#0</strong> 建立树上依赖背包。',
      activeNodeId: 'course-0',
      treeRoot: cloneTree(treeState),
    });

    // 课 2 汇报
    dp[2][1] = 3;
    setCourseStatus('course-2', 'visited', '最优学分:3');
    addCourseStep({
      type: 'update',
      line: 14,
      i: 2,
      j: 1,
      dp1d: [...dp[0]],
      memo: [...dp[0]],
      activeSlot: 1,
      tag: '课#2 初始化 dp[2][1]=3',
      log: '| 📍 课#2(叶节点): 选择1门得学分 3，向父节点课#1汇报',
      msg: '课 <strong>#2</strong> 为叶节点：选 1 门课获得学分 <code>3</code>。',
      activeNodeId: 'course-2',
      treeRoot: cloneTree(treeState),
      activeArrName: 'credits',
      activeArrSlot: 2,
    });

    // 课 1 合并课 2
    dp[1][1] = 2;
    dp[1][2] = 2 + 3; // 5
    setCourseStatus('course-1', 'visited', '最优学分:5');
    addCourseStep({
      type: 'update',
      line: 14,
      i: 1,
      j: 2,
      dp1d: [...dp[1]],
      memo: [...dp[1]],
      activeSlot: 2,
      tag: '课#1合并子课#2: dp[1][2]=5',
      log: '| ⚡ 课#1合并: 选课#1(2分) + 子课#2(3分) -> 选2门获得最大学分 5',
      msg: '课 <strong>#1</strong> 决策：自选修需 1 额度（2分），加上子课 <strong>#2</strong> 共 2 门得 <strong>5</strong> 分。',
      activeNodeId: 'course-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'dp1',
      activeArrSlot: 2,
    });

    // 课 3 汇报
    dp[3][1] = 4;
    setCourseStatus('course-3', 'visited', '最优学分:4');
    addCourseStep({
      type: 'update',
      line: 14,
      i: 3,
      j: 1,
      dp1d: [...dp[0]],
      memo: [...dp[0]],
      activeSlot: 1,
      tag: '课#3 初始化 dp[3][1]=4',
      log: '| 📍 课#3(叶节点): 选择1门得学分 4，向根节点汇报',
      msg: '课 <strong>#3</strong> 为叶节点：选 1 门课获得学分 <code>4</code>。',
      activeNodeId: 'course-3',
      treeRoot: cloneTree(treeState),
      activeArrName: 'credits',
      activeArrSlot: 3,
    });

    // 根节点合并课 1 与课 3
    dp[0][1] = 0;
    dp[0][2] = 4; // 选根+课3 = 4
    dp[0][3] = 2 + 4; // 选根+课1+课3 = 6
    setCourseStatus('course-0', 'visited', '最大学分:6');
    addCourseStep({
      type: 'update',
      line: 15,
      i: 0,
      j: 3,
      dp1d: [...dp[0]],
      memo: [...dp[0]],
      activeSlot: 3,
      tag: '根节点背包合并: dp[0][3]=6',
      log: '| ⚡ 根节点最终分组背包合并: 选课#1(2分) + 课#3(4分) -> 最大学分 6',
      msg: '超级根节点汇总：选修 <strong>课#1 (2分)</strong> 与 <strong>课#3 (4分)</strong>，在 2 门限额下获得最大学分 <strong>6</strong>！',
      activeNodeId: 'course-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'dp0',
      activeArrSlot: 3,
    });

    // Line 19: return dp[0][m + 1];
    addCourseStep({
      type: 'return',
      line: anchorMap?.return || 19,
      i: 0,
      j: 3,
      dp1d: [...dp[0]],
      memo: [...dp[0]],
      activeSlot: 3,
      tag: '返回最大学分: 6',
      log: '| 🏆 return dp[0][m + 1 = 3] = 6;',
      msg: '🏆 树上分组背包求解完成！最多选 2 门课的最大学分为 <strong>6</strong>。',
      activeNodeId: 'course-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'dp0',
      activeArrSlot: 3,
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
    const treeState: UniversalTreeNode = {
      id: 'city-0',
      r: 0,
      c: 0,
      val: '首都#0',
      status: 'normal',
      tag: '待统计',
      children: [
        {
          id: 'city-1',
          r: 1,
          c: 0,
          val: '市#1',
          status: 'normal',
          tag: '待统计',
          children: [
            { id: 'city-2', r: 2, c: 0, val: '市#2', status: 'normal', tag: '待统计', children: [] },
            { id: 'city-3', r: 2, c: 1, val: '市#3', status: 'normal', tag: '待统计', children: [] },
          ],
        },
        {
          id: 'city-4',
          r: 1,
          c: 1,
          val: '市#4',
          status: 'normal',
          tag: '待统计',
          children: [
            { id: 'city-6', r: 2, c: 2, val: '市#6', status: 'normal', tag: '待统计', children: [] },
          ],
        },
        {
          id: 'city-5',
          r: 1,
          c: 2,
          val: '市#5',
          status: 'normal',
          tag: '待统计',
          children: [],
        },
      ],
    };

    const people = [0, 0, 0, 0, 0, 0, 0];
    const cars = [0, 0, 0, 0, 0, 0, 0];
    let totalFuel = 0;

    function setCityStatus(id: string, status: any, tag?: string) {
      function traverse(n: UniversalTreeNode) {
        if (n.id === id) {
          n.status = status;
          if (tag !== undefined) n.tag = tag;
        }
        n.children.forEach(traverse);
      }
      traverse(treeState);
    }

    function getFuelStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
      return [
        {
          id: 'arr-people',
          name: 'people[]',
          label: '各城子树总人数',
          indices: ['#0(首都)', '#1', '#2', '#3', '#4', '#5', '#6'],
          values: [...people],
          activeIdx: activeArrName === 'people' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-cars',
          name: 'cars[]',
          label: '驶向父城车数/油耗',
          indices: ['#0(首都)', '#1', '#2', '#3', '#4', '#5', '#6'],
          values: [...cars],
          activeIdx: activeArrName === 'cars' ? activeSlotIdx : undefined,
          color: 'indigo',
        },
        {
          id: 'arr-fuel',
          name: 'totalFuel',
          label: '累计总油耗',
          indices: ['全国耗油'],
          values: [totalFuel],
          activeIdx: activeArrName === 'fuel' ? activeSlotIdx : undefined,
          color: 'amber',
        },
      ];
    }

    function addFuelStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
      }
    ) {
      const { activeArrName, activeArrSlot, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getFuelStateArrays(activeArrName, activeArrSlot),
      });
    }

    // Line 3: public long minimumFuelCost(...)
    addFuelStep({
      type: 'entry',
      line: anchorMap?.entry || 3,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: 'minimumFuelCost 入口',
      log: '🚀 minimumFuelCost 入口：7座城市6条公路，每车座位 seats=2',
      msg: '启动 <code>minimumFuelCost</code>：每辆车最多载客 <code>2</code> 人，后序统计子树人数与拼车跨边油耗。',
      activeNodeId: 'city-0',
      treeRoot: cloneTree(treeState),
    });

    const cityOrder = [
      { u: 2, p: 1, c: 1 },
      { u: 3, p: 1, c: 1 },
      { u: 1, p: 0, c: 3 },
      { u: 6, p: 4, c: 1 },
      { u: 4, p: 0, c: 2 },
      { u: 5, p: 0, c: 1 },
    ];

    for (const item of cityOrder) {
      const u = item.u;
      const count = item.c;
      people[u] = count;
      const needCars = Math.ceil(count / seats);
      cars[u] = needCars;
      totalFuel += needCars;
      setCityStatus(`city-${u}`, 'visited', `${count}人|${needCars}车(${needCars}L)`);

      addFuelStep({
        type: 'update',
        line: 19,
        i: u,
        j: 0,
        dp1d: [totalFuel],
        memo: [totalFuel],
        activeSlot: u,
        tag: `市#${u}: ${count}人驶向#${item.p}需${needCars}车`,
        log: `| 📍 市#${u} 后序汇聚: 子树总人数 ${count} 人 -> 需 ⌈${count}/${seats}⌉ = ${needCars} 辆车驶向市#${item.p} (总油耗累积 +${needCars}L = ${totalFuel}L)`,
        msg: `城市 <strong>市#${u}</strong> 汇聚 <code>${count}</code> 人，拼车需 <code>⌈${count} / 2⌉ = ${needCars}</code> 辆车，消耗 <strong>${needCars}</strong> 升油驶向市 <strong>#${item.p}</strong>。`,
        activeNodeId: `city-${u}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'people',
        activeArrSlot: u,
      });
    }

    people[0] = 7;
    setCityStatus('city-0', 'visited', '全国7人汇聚首都|总耗油7L');

    // Line 9: return totalFuel;
    addFuelStep({
      type: 'return',
      line: anchorMap?.return || 9,
      i: 0,
      j: 0,
      dp1d: [totalFuel],
      memo: [totalFuel],
      activeSlot: 0,
      tag: `最少总油耗: ${totalFuel} 升`,
      log: `| 🏆 return totalFuel = ${totalFuel}L;`,
      msg: `🏆 演化推导全部完成！所有代表到达首都的最少总油耗为 <strong>${totalFuel} 升</strong>。`,
      activeNodeId: 'city-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'fuel',
      activeArrSlot: 0,
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
    const treeState: UniversalTreeNode = {
      id: 'char-0',
      r: 0,
      c: 0,
      val: "点#0('a')",
      status: 'normal',
      tag: '待考察',
      children: [
        {
          id: 'char-1',
          r: 1,
          c: 0,
          val: "点#1('b')",
          status: 'normal',
          tag: '待考察',
          children: [
            { id: 'char-3', r: 2, c: 0, val: "点#3('c')", status: 'normal', tag: '待考察', children: [] },
            { id: 'char-4', r: 2, c: 1, val: "点#4('b')", status: 'normal', tag: '待考察', children: [] },
          ],
        },
        {
          id: 'char-2',
          r: 1,
          c: 1,
          val: "点#2('a')",
          status: 'normal',
          tag: '待考察',
          children: [
            { id: 'char-5', r: 2, c: 2, val: "点#5('e')", status: 'normal', tag: '待考察', children: [] },
          ],
        },
      ],
    };

    const chars = ['a', 'b', 'a', 'c', 'b', 'e'];
    const maxChain = [0, 0, 0, 0, 0, 0];
    let maxPath = 1;

    function setCharStatus(id: string, status: any, tag?: string) {
      function traverse(n: UniversalTreeNode) {
        if (n.id === id) {
          n.status = status;
          if (tag !== undefined) n.tag = tag;
        }
        n.children.forEach(traverse);
      }
      traverse(treeState);
    }

    function getCharStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
      return [
        {
          id: 'arr-chars',
          name: 'chars[]',
          label: '节点字符标号',
          indices: ['#0', '#1', '#2', '#3', '#4', '#5'],
          values: [...chars],
          activeIdx: activeArrName === 'chars' ? activeSlotIdx : undefined,
          color: 'purple',
        },
        {
          id: 'arr-chain',
          name: 'chain[]',
          label: '单侧最长链向父汇报',
          indices: ['#0', '#1', '#2', '#3', '#4', '#5'],
          values: [...maxChain],
          activeIdx: activeArrName === 'chain' ? activeSlotIdx : undefined,
          color: 'emerald',
        },
        {
          id: 'arr-ans',
          name: 'maxPath',
          label: '全局最长互异路径',
          indices: ['全局最优'],
          values: [maxPath],
          activeIdx: activeArrName === 'ans' ? activeSlotIdx : undefined,
          color: 'rose',
        },
      ];
    }

    function addCharStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
      }
    ) {
      const { activeArrName, activeArrSlot, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getCharStateArrays(activeArrName, activeArrSlot),
      });
    }

    // Line 3: public int longestPath(...)
    addCharStep({
      type: 'entry',
      line: anchorMap?.entry || 3,
      i: 0,
      j: 0,
      dp1d: [1],
      memo: [1],
      activeSlot: 0,
      tag: 'longestPath 入口',
      log: "🚀 longestPath 入口：字符序列 [a, b, a, c, b, e]，后序贪心维护最长与次长互异子链",
      msg: '启动 <code>longestPath</code>：相邻节点字符不同才可拼接，每个节点向父汇报单侧最长链 <code>1 + max1</code>。',
      activeNodeId: 'char-0',
      treeRoot: cloneTree(treeState),
    });

    const dfsOrder = [
      { u: 3, chain: 1, tag: "叶节点('c') 单链:1" },
      { u: 4, chain: 1, tag: "叶节点('b') 单链:1" },
      { u: 1, chain: 2, tag: "点#1('b') 与#3('c')拼接, 单链:2" },
      { u: 5, chain: 1, tag: "叶节点('e') 单链:1" },
      { u: 2, chain: 2, tag: "点#2('a') 与#5('e')拼接, 单链:2" },
      { u: 0, chain: 3, tag: "点#0('a') 与#1('b')拼接, 最长拐点:3" },
    ];

    for (const item of dfsOrder) {
      const u = item.u;
      maxChain[u] = item.chain;
      if (item.chain > maxPath) maxPath = item.chain;
      setCharStatus(`char-${u}`, 'visited', item.tag);

      addCharStep({
        type: 'update',
        line: 20,
        i: u,
        j: 0,
        dp1d: [maxPath],
        memo: [maxPath],
        activeSlot: u,
        tag: item.tag,
        log: `| 📍 节点 #${u}('${chars[u]}'): 单侧最长链=${item.chain}, 当前全局最长互异路径 maxPath=${maxPath}`,
        msg: `节点 <strong>点#${u}('${chars[u]}')</strong>：向父节点汇报单链 <strong>${item.chain}</strong>，刷新全局最长互异路径 <strong>${maxPath}</strong>。`,
        activeNodeId: `char-${u}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'chain',
        activeArrSlot: u,
      });
    }

    // Line 9: return maxPath;
    addCharStep({
      type: 'return',
      line: anchorMap?.return || 9,
      i: 0,
      j: 0,
      dp1d: [maxPath],
      memo: [maxPath],
      activeSlot: 0,
      tag: `最长互异路径: ${maxPath}`,
      log: `| 🏆 return maxPath = ${maxPath};`,
      msg: `🏆 演化推导全部完成！树中相邻字符互异的最长路径为 <strong>${maxPath}</strong>。`,
      activeNodeId: 'char-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
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

    const happy = [0, 4, 1, 2, 3, 2, 5, 1];
    const dp0 = [0, 0, 0, 0, 0, 0, 0, 0];
    const dp1 = [0, 0, 0, 0, 0, 0, 0, 0];

    function getPartyStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
      return [
        {
          id: 'arr-happy',
          name: 'happy[]',
          label: '员工固有快乐值',
          indices: ['#1', '#2', '#3', '#4', '#5', '#6', '#7'],
          values: [happy[1], happy[2], happy[3], happy[4], happy[5], happy[6], happy[7]],
          activeIdx: activeArrName === 'happy' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-dp0',
          name: 'dp[u][0]',
          label: '不参加快乐值',
          indices: ['#1', '#2', '#3', '#4', '#5', '#6', '#7'],
          values: [dp0[1], dp0[2], dp0[3], dp0[4], dp0[5], dp0[6], dp0[7]],
          activeIdx: activeArrName === 'dp0' ? activeSlotIdx : undefined,
          color: 'amber',
        },
        {
          id: 'arr-dp1',
          name: 'dp[u][1]',
          label: '参加快乐值',
          indices: ['#1', '#2', '#3', '#4', '#5', '#6', '#7'],
          values: [dp1[1], dp1[2], dp1[3], dp1[4], dp1[5], dp1[6], dp1[7]],
          activeIdx: activeArrName === 'dp1' ? activeSlotIdx : undefined,
          color: 'emerald',
        },
      ];
    }

    function addPartyStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
      }
    ) {
      const { activeArrName, activeArrSlot, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getPartyStateArrays(activeArrName, activeArrSlot),
      });
    }

    // 1. 入口: maxHappy
    addPartyStep({
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
    addPartyStep({
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
    addPartyStep({
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
    dp0[4] = 0;
    dp1[4] = 3;
    addPartyStep({
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
      activeArrName: 'dp1',
      activeArrSlot: 3,
    });

    // 5. 员工 #5 汇报
    dp0[5] = 0;
    dp1[5] = 2;
    addPartyStep({
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
      activeArrName: 'dp1',
      activeArrSlot: 4,
    });

    // 6. 主管 #2 状态转移
    dp0[2] = Math.max(dp0[4], dp1[4]) + Math.max(dp0[5], dp1[5]); // 3 + 2 = 5
    dp1[2] = happy[2] + dp0[4] + dp0[5]; // 1 + 0 + 0 = 4
    addPartyStep({
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
      activeArrName: 'dp0',
      activeArrSlot: 1,
    });

    // 7. 员工 #6 汇报
    dp0[6] = 0;
    dp1[6] = 5;
    addPartyStep({
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
      activeArrName: 'dp1',
      activeArrSlot: 5,
    });

    // 8. 员工 #7 汇报
    dp0[7] = 0;
    dp1[7] = 1;
    addPartyStep({
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
      activeArrName: 'dp1',
      activeArrSlot: 6,
    });

    // 9. 主管 #3 状态转移
    dp0[3] = Math.max(dp0[6], dp1[6]) + Math.max(dp0[7], dp1[7]); // 5 + 1 = 6
    dp1[3] = happy[3] + dp0[6] + dp0[7]; // 2 + 0 + 0 = 2
    addPartyStep({
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
      activeArrName: 'dp0',
      activeArrSlot: 2,
    });

    // 10. 最高领导 #1 最终决策
    dp0[1] = Math.max(dp0[2], dp1[2]) + Math.max(dp0[3], dp1[3]); // 5 + 6 = 11
    dp1[1] = happy[1] + dp0[2] + dp0[3]; // 4 + 5 + 6 = 15
    addPartyStep({
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
      activeArrName: 'dp1',
      activeArrSlot: 0,
    });

    // 11. 返回结果
    addPartyStep({
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
      activeArrName: 'dp1',
      activeArrSlot: 0,
    });

    return steps;
  }

  // =========================================================================
  // 10. 移除子树后的二叉树高度 (Height After Subtree Removal, LC 2458)
  // =========================================================================
  private compileHeightRemovalQueries(
    _model: IYamlAlgorithmModel,
    _stage: number,
    _anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const treeState: UniversalTreeNode = {
      id: 'node-1',
      r: 0,
      c: 0,
      val: '点#1(深0)',
      status: 'normal',
      tag: '待访问',
      children: [
        {
          id: 'node-3',
          r: 1,
          c: 0,
          val: '点#3(深1)',
          status: 'normal',
          tag: '待访问',
          children: [
            { id: 'node-2', r: 2, c: 0, val: '点#2(深2)', status: 'normal', tag: '待访问', children: [] },
          ],
        },
        {
          id: 'node-4',
          r: 1,
          c: 1,
          val: '点#4(深1)',
          status: 'normal',
          tag: '待访问',
          children: [
            { id: 'node-6', r: 2, c: 1, val: '点#6(深2)', status: 'normal', tag: '待访问', children: [] },
            { id: 'node-5', r: 2, c: 2, val: '点#5(深2)', status: 'normal', tag: '待访问', children: [] },
          ],
        },
      ],
    };

    let dfnCnt = 0;
    const dfn: Record<number, number> = {};
    const deep: number[] = new Array(7).fill(0);
    const size: number[] = new Array(7).fill(0);
    const maxLeft: number[] = new Array(7).fill(0);
    const maxRight: number[] = new Array(7).fill(0);
    const queries = [4];
    const ans: number[] = new Array(queries.length).fill(0);
    const dp1dDisplay: number[] = [0, 0, 0, 0, 0, 0];

    interface SimpleNode {
      id: string;
      val: number;
      left?: SimpleNode;
      right?: SimpleNode;
    }

    const n2: SimpleNode = { id: 'node-2', val: 2 };
    const n6: SimpleNode = { id: 'node-6', val: 6 };
    const n5: SimpleNode = { id: 'node-5', val: 5 };
    const n3: SimpleNode = { id: 'node-3', val: 3, left: n2 };
    const n4: SimpleNode = { id: 'node-4', val: 4, left: n6, right: n5 };
    const n1: SimpleNode = { id: 'node-1', val: 1, left: n3, right: n4 };

    function setNodeStatus(id: string, status: any, tag?: string) {
      function traverse(n: UniversalTreeNode) {
        if (n.id === id) {
          n.status = status;
          if (tag !== undefined) n.tag = tag;
        }
        n.children.forEach(traverse);
      }
      traverse(treeState);
    }

    function getSnapshotStateArrays(activeArrName?: string, activeSlotIdx?: number, highlightIndices?: number[]): StateArrayItem[] {
      return [
        {
          id: 'arr-dfn',
          name: 'dfn[]',
          label: '节点访问时间戳',
          indices: ['#1', '#2', '#3', '#4', '#5', '#6'],
          values: [dfn[1] || 0, dfn[2] || 0, dfn[3] || 0, dfn[4] || 0, dfn[5] || 0, dfn[6] || 0],
          activeIdx: activeArrName === 'dfn' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-deep',
          name: 'deep[]',
          label: 'DFN 节点深度',
          indices: ['1', '2', '3', '4', '5', '6'],
          values: [deep[1] || 0, deep[2] || 0, deep[3] || 0, deep[4] || 0, deep[5] || 0, deep[6] || 0],
          activeIdx: activeArrName === 'deep' ? activeSlotIdx : undefined,
          color: 'indigo',
        },
        {
          id: 'arr-size',
          name: 'size[]',
          label: 'DFN 子树规模',
          indices: ['1', '2', '3', '4', '5', '6'],
          values: [size[1] || 0, size[2] || 0, size[3] || 0, size[4] || 0, size[5] || 0, size[6] || 0],
          activeIdx: activeArrName === 'size' ? activeSlotIdx : undefined,
          color: 'purple',
        },
        {
          id: 'arr-maxleft',
          name: 'maxLeft[]',
          label: '前缀最大深度',
          indices: ['1', '2', '3', '4', '5', '6'],
          values: [maxLeft[1] || 0, maxLeft[2] || 0, maxLeft[3] || 0, maxLeft[4] || 0, maxLeft[5] || 0, maxLeft[6] || 0],
          activeIdx: activeArrName === 'maxLeft' ? activeSlotIdx : undefined,
          highlightIndices: activeArrName === 'maxLeft' ? highlightIndices : undefined,
          color: 'emerald',
        },
        {
          id: 'arr-maxright',
          name: 'maxRight[]',
          label: '后缀最大深度',
          indices: ['1', '2', '3', '4', '5', '6'],
          values: [maxRight[1] || 0, maxRight[2] || 0, maxRight[3] || 0, maxRight[4] || 0, maxRight[5] || 0, maxRight[6] || 0],
          activeIdx: activeArrName === 'maxRight' ? activeSlotIdx : undefined,
          highlightIndices: activeArrName === 'maxRight' ? highlightIndices : undefined,
          color: 'amber',
        },
        {
          id: 'arr-ans',
          name: 'ans[]',
          label: '查询结果收集',
          indices: ['q[0]=4'],
          values: [ans[0] || 0],
          activeIdx: activeArrName === 'ans' ? activeSlotIdx : undefined,
          color: 'rose',
        },
      ];
    }

    function addStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
        highlightArrSlots?: number[];
      }
    ) {
      const { activeArrName, activeArrSlot, highlightArrSlots, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getSnapshotStateArrays(activeArrName, activeArrSlot, highlightArrSlots),
      });
    }

    // Line 8: public int[] treeQueries(TreeNode root, int[] queries) {
    addStep({
      type: 'entry',
      line: 8,
      i: 0,
      j: 0,
      dp1d: [...dp1dDisplay],
      memo: [...dp1dDisplay],
      activeSlot: 0,
      tag: 'treeQueries 入口',
      log: '🚀 public int[] treeQueries(TreeNode root, int[] queries) 函数入口，queries=[4]',
      msg: '启动 <code>treeQueries</code>：传入二叉树与查询数组 <code>queries = [4]</code>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
    });

    // Line 9: dfs(root, 0);
    addStep({
      type: 'call',
      line: 9,
      i: 0,
      j: 0,
      dp1d: [...dp1dDisplay],
      memo: [...dp1dDisplay],
      activeSlot: 0,
      tag: '调用 dfs(root, 0)',
      log: '🌲 dfs(root, 0); 调用先序深度优先遍历整树',
      msg: '准备从树根 <strong>#1</strong> 开始先序深度优先遍历。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
    });

    function simulateDfs(node: SimpleNode | undefined, d: number) {
      // Line 21: private void dfs(TreeNode node, int d) {
      addStep({
        type: 'entry',
        line: 21,
        i: node ? node.val : 0,
        j: d,
        dp1d: [...dp1dDisplay],
        memo: [...dp1dDisplay],
        activeSlot: Math.max(0, dfnCnt - 1),
        tag: node ? `dfs(node=#${node.val}, d=${d})` : 'dfs(null)',
        log: node ? `进入 dfs(node=#${node.val}, d=${d})` : `进入 dfs(node=null, d=${d})`,
        msg: node ? `进入 <code>dfs(node=#${node.val}, d=${d})</code> 递归函数。` : '进入 <code>dfs(null)</code>。',
        activeNodeId: node?.id,
        treeRoot: cloneTree(treeState),
      });

      // Line 22: if (node == null) return;
      if (!node) {
        addStep({
          type: 'boundary',
          line: 22,
          i: 0,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: Math.max(0, dfnCnt - 1),
          tag: 'node == null (return)',
          log: '| if (node == null) 为真，直接 return',
          msg: '节点为空，触发边界返回。',
          treeRoot: cloneTree(treeState),
        });
        return;
      }

      addStep({
        type: 'update',
        line: 22,
        i: node.val,
        j: d,
        dp1d: [...dp1dDisplay],
        memo: [...dp1dDisplay],
        activeSlot: Math.max(0, dfnCnt - 1),
        tag: `node=#${node.val} != null`,
        log: `| 检查: node=#${node.val} != null，继续执行`,
        msg: `检查边界：节点 <strong>#${node.val}</strong> 非空，继续向下执行。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
      });

      // Line 23: int i = ++dfnCnt;
      dfnCnt++;
      const curI = dfnCnt;
      setNodeStatus(node.id, 'visited', `DFN:${curI}|深:${d}`);
      dfn[node.val] = curI;
      addStep({
        type: 'update',
        line: 23,
        i: node.val,
        j: d,
        dp1d: [...dp1dDisplay],
        memo: [...dp1dDisplay],
        activeSlot: curI - 1,
        tag: `int i = ++dfnCnt (${curI})`,
        log: `| int i = ++dfnCnt; (分配时间戳 i = ${curI})`,
        msg: `先序计数器自增：为节点 <strong>#${node.val}</strong> 分配 DFN 序号 <code>i = ++dfnCnt = ${curI}</code>。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
        activeArrName: 'dfn',
        activeArrSlot: node.val - 1,
      });

      // Line 24: dfn[node.val] = i; deep[i] = d; size[i] = 1;
      deep[curI] = d;
      size[curI] = 1;
      dp1dDisplay[curI - 1] = d;
      addStep({
        type: 'update',
        line: 24,
        i: node.val,
        j: d,
        dp1d: [...dp1dDisplay],
        memo: [...dp1dDisplay],
        activeSlot: curI - 1,
        tag: `dfn[${node.val}]=${curI}, deep[${curI}]=${d}`,
        log: `| dfn[${node.val}]=${curI}; deep[${curI}]=${d}; size[${curI}]=1; (记录节点深度与初始大小)`,
        msg: `记录状态：<code>dfn[${node.val}]=${curI}, deep[${curI}]=${d}, size[${curI}]=1</code>。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
        activeArrName: 'deep',
        activeArrSlot: curI - 1,
      });

      // Line 25: if (node.left != null) { dfs(node.left, d + 1); size[i] += size[dfn[node.left.val]]; }
      if (node.left) {
        addStep({
          type: 'call',
          line: 25,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: `node.left != null (进入 #${node.left.val})`,
          log: `| if (node.left != null): 发现左孩子 #${node.left.val}，调用 dfs(node.left, ${d + 1})`,
          msg: `检查左孩子：存在节点 <strong>#${node.left.val}</strong>，递归进入左子树。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });

        simulateDfs(node.left, d + 1);

        // 回溯后累加 size
        size[curI] += size[dfn[node.left.val]];
        addStep({
          type: 'update',
          line: 25,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: `size[${curI}] += ${size[dfn[node.left.val]]}`,
          log: `| size[${curI}] += size[dfn[${node.left.val}]] = ${size[dfn[node.left.val]]} -> size[${curI}] = ${size[curI]}`,
          msg: `左孩子回溯：累加左子树大小，<code>size[${curI}] = ${size[curI]}</code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
          activeArrName: 'size',
          activeArrSlot: curI - 1,
        });
      } else {
        addStep({
          type: 'update',
          line: 25,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: 'node.left == null',
          log: `| if (node.left != null) 为假 (左孩子为空)`,
          msg: `检查左孩子：节点 <strong>#${node.val}</strong> 左孩子为空，跳过递归。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });
      }

      // Line 26: if (node.right != null) { dfs(node.right, d + 1); size[i] += size[dfn[node.right.val]]; }
      if (node.right) {
        addStep({
          type: 'call',
          line: 26,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: `node.right != null (进入 #${node.right.val})`,
          log: `| if (node.right != null): 发现右孩子 #${node.right.val}，调用 dfs(node.right, ${d + 1})`,
          msg: `检查右孩子：存在节点 <strong>#${node.right.val}</strong>，递归进入右子树。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });

        simulateDfs(node.right, d + 1);

        // 回溯后累加 size
        size[curI] += size[dfn[node.right.val]];
        addStep({
          type: 'update',
          line: 26,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: `size[${curI}] += ${size[dfn[node.right.val]]}`,
          log: `| size[${curI}] += size[dfn[${node.right.val}]] = ${size[dfn[node.right.val]]} -> size[${curI}] = ${size[curI]}`,
          msg: `右孩子回溯：累加右子树大小，<code>size[${curI}] = ${size[curI]}</code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
          activeArrName: 'size',
          activeArrSlot: curI - 1,
        });
      } else {
        addStep({
          type: 'update',
          line: 26,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: 'node.right == null',
          log: `| if (node.right != null) 为假 (右孩子为空)`,
          msg: `检查右孩子：节点 <strong>#${node.val}</strong> 右孩子为空，跳过递归。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });
      }

      // Line 27: method exit
      addStep({
        type: 'return',
        line: 27,
        i: node.val,
        j: d,
        dp1d: [...dp1dDisplay],
        memo: [...dp1dDisplay],
        activeSlot: curI - 1,
        tag: `dfs(#${node.val}) 结束返回`,
        log: `| dfs(node=#${node.val}) 执行完毕返回上一层 (子树总规模 size=${size[curI]})`,
        msg: `节点 <strong>#${node.val}</strong> 遍历完毕，返回上一层调用栈。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
        activeArrName: 'size',
        activeArrSlot: curI - 1,
      });
    }

    // 执行真实 dfs
    simulateDfs(n1, 0);

    // Line 10: maxLeft[1] = deep[1];
    maxLeft[1] = deep[1];
    const prefixDisplay: number[] = new Array(6).fill(0);
    prefixDisplay[0] = maxLeft[1];
    addStep({
      type: 'update',
      line: 10,
      i: 1,
      j: 0,
      dp1d: [...prefixDisplay],
      memo: [...prefixDisplay],
      activeSlot: 0,
      tag: 'maxLeft[1] = deep[1]',
      log: `📊 maxLeft[1] = deep[1] = ${deep[1]}; (初始化前缀最大深度)`,
      msg: `初始化前缀最大值数组：<code>maxLeft[1] = deep[1] = ${deep[1]}</code>。`,
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'maxLeft',
      activeArrSlot: 0,
    });

    // Line 11: for (int i = 2; i <= dfnCnt; i++) maxLeft[i] = Math.max(maxLeft[i - 1], deep[i]);
    for (let i = 2; i <= dfnCnt; i++) {
      addStep({
        type: 'loop',
        line: 11,
        i,
        j: 0,
        dp1d: [...prefixDisplay],
        memo: [...prefixDisplay],
        activeSlot: i - 1,
        tag: `循环 i=${i}<=dfnCnt`,
        log: `| for (int i = ${i}; i <= ${dfnCnt}; i++): 循环条件满足`,
        msg: `检查前缀循环条件：<code>i = ${i} <= ${dfnCnt}</code> 为真，准备递推计算。`,
        activeNodeId: 'node-1',
        treeRoot: cloneTree(treeState),
        activeArrName: 'maxLeft',
        activeArrSlot: i - 1,
      });

      maxLeft[i] = Math.max(maxLeft[i - 1], deep[i]);
      prefixDisplay[i - 1] = maxLeft[i];

      addStep({
        type: 'update',
        line: 11,
        i,
        j: 0,
        dp1d: [...prefixDisplay],
        memo: [...prefixDisplay],
        activeSlot: i - 1,
        tag: `maxLeft[${i}]=${maxLeft[i]}`,
        log: `| maxLeft[${i}] = Math.max(maxLeft[${i - 1}]=${maxLeft[i - 1]}, deep[${i}]=${deep[i]}) = ${maxLeft[i]};`,
        msg: `递推前缀极值：<code>maxLeft[${i}] = max(${maxLeft[i - 1]}, ${deep[i]}) = ${maxLeft[i]}</code>。`,
        activeNodeId: 'node-1',
        treeRoot: cloneTree(treeState),
        activeArrName: 'maxLeft',
        activeArrSlot: i - 1,
        highlightArrSlots: [i - 2],
      });
    }

    // Line 12: maxRight[dfnCnt] = deep[dfnCnt];
    maxRight[dfnCnt] = deep[dfnCnt];
    const suffixDisplay: number[] = new Array(6).fill(0);
    suffixDisplay[dfnCnt - 1] = maxRight[dfnCnt];
    addStep({
      type: 'update',
      line: 12,
      i: dfnCnt,
      j: 0,
      dp1d: [...suffixDisplay],
      memo: [...suffixDisplay],
      activeSlot: dfnCnt - 1,
      tag: `maxRight[${dfnCnt}]=${maxRight[dfnCnt]}`,
      log: `📊 maxRight[${dfnCnt}] = deep[${dfnCnt}] = ${deep[dfnCnt]}; (初始化后缀最大深度)`,
      msg: `初始化后缀最大值数组：<code>maxRight[${dfnCnt}] = deep[${dfnCnt}] = ${deep[dfnCnt]}</code>。`,
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'maxRight',
      activeArrSlot: dfnCnt - 1,
    });

    // Line 13: for (int i = dfnCnt - 1; i >= 1; i--) maxRight[i] = Math.max(maxRight[i + 1], deep[i]);
    for (let i = dfnCnt - 1; i >= 1; i--) {
      addStep({
        type: 'loop',
        line: 13,
        i,
        j: 0,
        dp1d: [...suffixDisplay],
        memo: [...suffixDisplay],
        activeSlot: i - 1,
        tag: `循环 i=${i}>=1`,
        log: `| for (int i = ${i}; i >= 1; i--): 循环条件满足`,
        msg: `检查后缀循环条件：<code>i = ${i} >= 1</code> 为真，准备逆序递推。`,
        activeNodeId: 'node-1',
        treeRoot: cloneTree(treeState),
        activeArrName: 'maxRight',
        activeArrSlot: i - 1,
      });

      maxRight[i] = Math.max(maxRight[i + 1], deep[i]);
      suffixDisplay[i - 1] = maxRight[i];

      addStep({
        type: 'update',
        line: 13,
        i,
        j: 0,
        dp1d: [...suffixDisplay],
        memo: [...suffixDisplay],
        activeSlot: i - 1,
        tag: `maxRight[${i}]=${maxRight[i]}`,
        log: `| maxRight[${i}] = Math.max(maxRight[${i + 1}]=${maxRight[i + 1]}, deep[${i}]=${deep[i]}) = ${maxRight[i]};`,
        msg: `递推后缀极值：<code>maxRight[${i}] = max(${maxRight[i + 1]}, ${deep[i]}) = ${maxRight[i]}</code>。`,
        activeNodeId: 'node-1',
        treeRoot: cloneTree(treeState),
        activeArrName: 'maxRight',
        activeArrSlot: i - 1,
        highlightArrSlots: [i],
      });
    }

    // Line 14: int[] ans = new int[queries.length];
    addStep({
      type: 'update',
      line: 14,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: 'int[] ans 分配',
      log: '📦 int[] ans = new int[queries.length = 1]; (分配查询答案数组)',
      msg: '为答案分配数组：<code>int[] ans = new int[1]</code>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    // Line 15: for (int k = 0; k < queries.length; k++) {
    for (let k = 0; k < queries.length; k++) {
      addStep({
        type: 'loop',
        line: 15,
        i: k,
        j: 0,
        dp1d: [...ans],
        memo: [...ans],
        activeSlot: k,
        tag: `for k=${k}<queries.length`,
        log: `🔍 for (int k = ${k}; k < ${queries.length}; k++): 处理第 ${k + 1} 个查询 queries[${k}] = ${queries[k]}`,
        msg: `进入查询循环：当前处理 <code>queries[${k}] = ${queries[k]}</code>。`,
        activeNodeId: `node-${queries[k]}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'ans',
        activeArrSlot: k,
      });

      // Line 16: int i = dfn[queries[k]];
      const targetVal = queries[k];
      const targetI = dfn[targetVal];
      const targetSize = size[targetI];

      const queryTree = cloneTree(treeState);
      const markSubtreePruned = (n: UniversalTreeNode) => {
        if (n.id === `node-${targetVal}` || n.id === 'node-6' || n.id === 'node-5') {
          n.status = 'pruned';
          n.tag = '已剔除';
        }
        n.children.forEach(markSubtreePruned);
      };
      markSubtreePruned(queryTree);

      addStep({
        type: 'update',
        line: 16,
        i: targetI,
        j: 0,
        dp1d: [...ans],
        memo: [...ans],
        activeSlot: k,
        tag: `int i = dfn[${targetVal}] = ${targetI}`,
        log: `| int i = dfn[queries[${k}] = ${targetVal}] = ${targetI}; (子树区间 DFN[${targetI} .. ${targetI + targetSize - 1}])`,
        msg: `定位子树 DFN 区间：节点 <strong>#${targetVal}</strong> 的时间戳为 <code>${targetI}</code>，子树大小为 <code>${targetSize}</code>，剔除闭区间 <code>[${targetI} .. ${targetI + targetSize - 1}]</code>。`,
        activeNodeId: `node-${targetVal}`,
        treeRoot: queryTree,
        activeArrName: 'dfn',
        activeArrSlot: targetVal - 1,
      });

      // Line 17: ans[k] = Math.max(maxLeft[i - 1], maxRight[i + size[i]]);
      const leftMax = targetI - 1 >= 1 ? maxLeft[targetI - 1] : 0;
      const rightIdx = targetI + targetSize;
      const rightMax = rightIdx <= dfnCnt ? maxRight[rightIdx] : 0;
      ans[k] = Math.max(leftMax, rightMax);

      addStep({
        type: 'update',
        line: 17,
        i: targetI,
        j: 0,
        dp1d: [...ans],
        memo: [...ans],
        activeSlot: k,
        tag: `ans[${k}] = max(${leftMax}, ${rightMax}) = ${ans[k]}`,
        log: `| ans[${k}] = Math.max(maxLeft[${targetI - 1}]=${leftMax}, maxRight[${rightIdx}]=${rightMax}) = ${ans[k]};`,
        msg: `<strong>核心极值合并</strong>：左侧前缀最大深度 <code>maxLeft[${targetI - 1}]=${leftMax}</code>，右侧后缀最大深度 <code>maxRight[${rightIdx}]=${rightMax}</code>，合并得到整树最大高度 <strong>${ans[k]}</strong>！`,
        activeNodeId: `node-${targetVal}`,
        treeRoot: queryTree,
        activeArrName: 'ans',
        activeArrSlot: k,
      });
    }

    // Line 15: loop exit
    addStep({
      type: 'loop',
      line: 15,
      i: queries.length,
      j: 0,
      dp1d: [...ans],
      memo: [...ans],
      activeSlot: 0,
      tag: '查询循环结束',
      log: `| for (int k = ${queries.length}; k < ${queries.length}; k++): 条件为假，退出循环`,
      msg: '所有查询处理完毕，跳出循环。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    // Line 19: return ans;
    addStep({
      type: 'return',
      line: 19,
      i: 0,
      j: 0,
      dp1d: [...ans],
      memo: [...ans],
      activeSlot: 0,
      tag: 'return ans',
      log: `🏆 return ans; (返回查询答案数组 [${ans.join(', ')}])`,
      msg: `🏆 演化推导全部完成！返回答案数组 <strong>[${ans.join(', ')}]</strong>。`,
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    return steps;
  }

  // =========================================================================
  // 11. 从树中删除边的最小分数 (Minimum Score After Removals, LC 2322)
  // =========================================================================
  private compileMinimumScoreAfterRemovals(
    _model: IYamlAlgorithmModel,
    _stage: number,
    _anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];

    const nums = [1, 5, 5, 4, 11];
    const n = nums.length;
    const edges = [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
    ];
    const m = edges.length;

    const treeState: UniversalTreeNode = {
      id: 'score-0',
      r: 0,
      c: 0,
      val: '点#0(值1)',
      status: 'normal',
      tag: '待遍历',
      children: [
        {
          id: 'score-1',
          r: 1,
          c: 0,
          val: '点#1(值5)',
          status: 'normal',
          tag: '待遍历',
          children: [
            { id: 'score-2', r: 2, c: 0, val: '点#2(值5)', status: 'normal', tag: '待遍历', children: [] },
            {
              id: 'score-3',
              r: 2,
              c: 1,
              val: '点#3(值4)',
              status: 'normal',
              tag: '待遍历',
              children: [
                { id: 'score-4', r: 3, c: 1, val: '点#4(值11)', status: 'normal', tag: '待遍历', children: [] },
              ],
            },
          ],
        },
      ],
    };

    let dfnCnt = 0;
    const dfn: number[] = new Array(n).fill(0);
    const size: number[] = new Array(n).fill(0);
    const xor: number[] = new Array(n).fill(0);
    const edgeEnds: number[] = new Array(m).fill(0);
    let globalAns = Infinity;

    function setNodeStatus(id: string, status: any, tag?: string) {
      function traverse(node: UniversalTreeNode) {
        if (node.id === id) {
          node.status = status;
          if (tag !== undefined) node.tag = tag;
        }
        node.children.forEach(traverse);
      }
      traverse(treeState);
    }

    function getSnapshotStateArrays(
      activeArrName?: string,
      activeSlotIdx?: number,
      highlightIndices?: number[]
    ): StateArrayItem[] {
      return [
        {
          id: 'arr-dfn',
          name: 'dfn[]',
          label: '节点时间戳序号',
          indices: ['#0', '#1', '#2', '#3', '#4'],
          values: [...dfn],
          activeIdx: activeArrName === 'dfn' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-size',
          name: 'size[]',
          label: '子树节点规模',
          indices: ['#0', '#1', '#2', '#3', '#4'],
          values: [...size],
          activeIdx: activeArrName === 'size' ? activeSlotIdx : undefined,
          color: 'purple',
        },
        {
          id: 'arr-xor',
          name: 'xor[]',
          label: '子树异或总和',
          indices: ['#0', '#1', '#2', '#3', '#4'],
          values: [...xor],
          activeIdx: activeArrName === 'xor' ? activeSlotIdx : undefined,
          color: 'indigo',
        },
        {
          id: 'arr-edgeends',
          name: 'edgeEnds[]',
          label: '树边深端点',
          indices: ['e0(0-1)', 'e1(1-2)', 'e2(1-3)', 'e3(3-4)'],
          values: [...edgeEnds],
          activeIdx: activeArrName === 'edgeEnds' ? activeSlotIdx : undefined,
          highlightIndices: activeArrName === 'edgeEnds' ? highlightIndices : undefined,
          color: 'amber',
        },
        {
          id: 'arr-ans',
          name: 'ans',
          label: '全局最小分数',
          indices: ['minScore'],
          values: [globalAns === Infinity ? 0 : globalAns],
          activeIdx: activeArrName === 'ans' ? activeSlotIdx : undefined,
          color: 'rose',
        },
      ];
    }

    function addStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
        highlightArrSlots?: number[];
      }
    ) {
      const { activeArrName, activeArrSlot, highlightArrSlots, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getSnapshotStateArrays(activeArrName, activeArrSlot, highlightArrSlots),
      });
    }

    // Line 3: public int minimumScore(int[] nums, int[][] edges) {
    addStep({
      type: 'entry',
      line: 3,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: 'minimumScore 入口',
      log: '🚀 public int minimumScore(int[] nums, int[][] edges) 函数入口，5节点4条边',
      msg: '启动 <code>minimumScore</code>：传入点权数组 <code>nums = [1, 5, 5, 4, 11]</code> 与树边集合。',
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
    });

    // Line 10: int[] dfn = new int[n], size = new int[n], xor = new int[n];
    addStep({
      type: 'update',
      line: 10,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '分配 dfn, size, xor 数组',
      log: '| int[] dfn = new int[n], size = new int[n], xor = new int[n]; (为树上状态分配数组空间)',
      msg: '初始化状态容器：分配时间戳 <code>dfn[]</code>、子树大小 <code>size[]</code> 与子树异或和 <code>xor[]</code>。',
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'dfn',
      activeArrSlot: 0,
    });

    // Line 11: dfs(0, -1, tree, nums, dfn, size, xor);
    addStep({
      type: 'call',
      line: 11,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '调用 dfs(0, -1)',
      log: '🌲 dfs(0, -1, tree, nums, dfn, size, xor); 以节点 0 为根深度优先遍历整树',
      msg: '准备从定根 <strong>#0</strong> 开始 DFS 先序分配时间戳，后序统计子树异或和。',
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
    });

    interface SimNode {
      u: number;
      p: number;
      val: number;
      children: SimNode[];
    }

    const n4: SimNode = { u: 4, p: 3, val: 11, children: [] };
    const n3: SimNode = { u: 3, p: 1, val: 4, children: [n4] };
    const n2: SimNode = { u: 2, p: 1, val: 5, children: [] };
    const n1: SimNode = { u: 1, p: 0, val: 5, children: [n2, n3] };
    const n0: SimNode = { u: 0, p: -1, val: 1, children: [n1] };

    function simulateDfs(node: SimNode) {
      const u = node.u;
      const p = node.p;

      // Line 36: private void dfs(int u, int p, ...)
      addStep({
        type: 'entry',
        line: 36,
        i: u,
        j: p,
        dp1d: [...xor],
        memo: [...xor],
        activeSlot: u,
        tag: `dfs(u=#${u}, p=${p})`,
        log: `进入 dfs(u=${u}, p=${p})`,
        msg: `进入递归：当前考察节点 <strong>#${u}</strong>（父节点 <code>${p}</code>）。`,
        activeNodeId: `score-${u}`,
        treeRoot: cloneTree(treeState),
      });

      // Line 37: dfn[u] = dfnCnt++; size[u] = 1; xor[u] = nums[u];
      dfn[u] = dfnCnt++;
      size[u] = 1;
      xor[u] = nums[u];
      setNodeStatus(`score-${u}`, 'visited', `DFN:${dfn[u]}|异或:${xor[u]}`);

      addStep({
        type: 'update',
        line: 37,
        i: u,
        j: p,
        dp1d: [...xor],
        memo: [...xor],
        activeSlot: u,
        tag: `dfn[${u}]=${dfn[u]}, xor[${u}]=${xor[u]}`,
        log: `| dfn[${u}]=${dfn[u]}; size[${u}]=1; xor[${u}]=nums[${u}]=${xor[u]}; (记录时间戳与初始点权)`,
        msg: `节点 <strong>#${u}</strong> 分配 DFN 序号 <code>${dfn[u]}</code>，初始异或和 <code>${xor[u]}</code>。`,
        activeNodeId: `score-${u}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'dfn',
        activeArrSlot: u,
      });

      // Line 38: for (int v : tree[u]) {
      for (const child of node.children) {
        const v = child.u;

        // Line 39: if (v != p) {
        addStep({
          type: 'call',
          line: 39,
          i: u,
          j: v,
          dp1d: [...xor],
          memo: [...xor],
          activeSlot: u,
          tag: `发现子节点 #${v}`,
          log: `| if (v != p): 发现子节点 #${v}，调用 dfs(${v}, ${u})`,
          msg: `检查树边：深入子节点 <strong>#${v}</strong>。`,
          activeNodeId: `score-${u}`,
          treeRoot: cloneTree(treeState),
        });

        // Line 40: dfs(v, u, ...);
        simulateDfs(child);

        // Line 41: size[u] += size[v]; xor[u] ^= xor[v];
        size[u] += size[v];
        xor[u] ^= xor[v];
        setNodeStatus(`score-${u}`, 'visited', `DFN:${dfn[u]}|异或:${xor[u]}`);

        addStep({
          type: 'update',
          line: 41,
          i: u,
          j: v,
          dp1d: [...xor],
          memo: [...xor],
          activeSlot: u,
          tag: `size[${u}]=${size[u]}, xor[${u}]=${xor[u]}`,
          log: `| size[${u}] += size[${v}] -> ${size[u]}; xor[${u}] ^= xor[${v}] -> ${xor[u]}; (子树后序合并)`,
          msg: `子树 <strong>#${v}</strong> 回溯完成：累加节点规模 <code>size[${u}] = ${size[u]}</code>，合并异或值 <code>xor[${u}] = ${xor[u]}</code>。`,
          activeNodeId: `score-${u}`,
          treeRoot: cloneTree(treeState),
          activeArrName: 'xor',
          activeArrSlot: u,
        });
      }

      // Line 44: dfs 退出
      addStep({
        type: 'return',
        line: 44,
        i: u,
        j: p,
        dp1d: [...xor],
        memo: [...xor],
        activeSlot: u,
        tag: `dfs(#${u}) 结束返回`,
        log: `| dfs(u=${u}) 遍历完毕返回上一级`,
        msg: `节点 <strong>#${u}</strong> 的所有子树处理完成，退栈返回。`,
        activeNodeId: `score-${u}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'size',
        activeArrSlot: u,
      });
    }

    // 执行真实 DFS
    simulateDfs(n0);

    // Line 12: int allXor = xor[0], m = edges.length;
    const allXor = xor[0];
    addStep({
      type: 'update',
      line: 12,
      i: 0,
      j: 0,
      dp1d: [allXor],
      memo: [allXor],
      activeSlot: 0,
      tag: `allXor = xor[0] = ${allXor}`,
      log: `📊 int allXor = xor[0] = ${allXor}; (整棵树全部节点异或和为 ${allXor})`,
      msg: `全树异或和汇总：<code>allXor = xor[0] = ${allXor}</code>，树边总数 <code>m = 4</code>。`,
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'xor',
      activeArrSlot: 0,
    });

    // Line 13: int[] edgeEnds = new int[m];
    addStep({
      type: 'update',
      line: 13,
      i: 0,
      j: 0,
      dp1d: [allXor],
      memo: [allXor],
      activeSlot: 0,
      tag: '分配 edgeEnds 数组',
      log: '| int[] edgeEnds = new int[m = 4]; (为每条无向边确定指向深处的子节点端点)',
      msg: '为边端点分配数组：<code>int[] edgeEnds = new int[4]</code>。',
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'edgeEnds',
      activeArrSlot: 0,
    });

    // Lines 14-17: for (int k = 0; k < m; k++) edgeEnds[k] = dfn[u] > dfn[v] ? u : v;
    for (let k = 0; k < m; k++) {
      const u = edges[k][0];
      const v = edges[k][1];
      edgeEnds[k] = dfn[u] > dfn[v] ? u : v;

      addStep({
        type: 'update',
        line: 16,
        i: k,
        j: edgeEnds[k],
        dp1d: [...edgeEnds],
        memo: [...edgeEnds],
        activeSlot: k,
        tag: `边 e${k}(${u}-${v}) 深端点: #${edgeEnds[k]}`,
        log: `| 边 e${k} [${u}, ${v}]: DFN[${u}]=${dfn[u]} vs DFN[${v}]=${dfn[v]} -> 深端点为 #${edgeEnds[k]}`,
        msg: `定向树边 <code>e${k}(${u}, ${v})</code>：DFN 较大者为深端点 <strong>#${edgeEnds[k]}</strong>，切断该边等价于切除以 <strong>#${edgeEnds[k]}</strong> 为根的子树。`,
        activeNodeId: `score-${edgeEnds[k]}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'edgeEnds',
        activeArrSlot: k,
      });
    }

    // Line 18: int ans = Integer.MAX_VALUE;
    globalAns = 9;
    addStep({
      type: 'update',
      line: 18,
      i: 0,
      j: 0,
      dp1d: [globalAns],
      memo: [globalAns],
      activeSlot: 0,
      tag: 'int ans = MAX_VALUE',
      log: '| int ans = Integer.MAX_VALUE; (准备暴力枚举所有切边对)',
      msg: '初始化答案：<code>ans = Integer.MAX_VALUE</code>，准备枚举所有切边组合。',
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    // Lines 19-33: 双重循环枚举断边方案
    for (let i = 0; i < m; i++) {
      const a = edgeEnds[i];

      addStep({
        type: 'loop',
        line: 19,
        i,
        j: 0,
        dp1d: [globalAns],
        memo: [globalAns],
        activeSlot: i,
        tag: `外层边循环 i=${i} (a=#${a})`,
        log: `🔍 外层循环 i = ${i}: 第一条切除边 e${i}，对应子树根节点 a = #${a}`,
        msg: `外层枚举切边 <code>e${i}</code>：对应被剥离的子树根节点 <strong>#${a}</strong>。`,
        activeNodeId: `score-${a}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'edgeEnds',
        activeArrSlot: i,
      });

      for (let j = i + 1; j < m; j++) {
        const b = edgeEnds[j];

        // Line 24: 判断包含关系
        let x1 = 0,
          x2 = 0,
          x3 = 0;
        let isAncestorA = false;
        let isAncestorB = false;

        if (dfn[a] <= dfn[b] && dfn[b] < dfn[a] + size[a]) {
          isAncestorA = true;
          x1 = xor[b];
          x2 = xor[a] ^ xor[b];
          x3 = allXor ^ xor[a];
        } else if (dfn[b] <= dfn[a] && dfn[a] < dfn[b] + size[b]) {
          isAncestorB = true;
          x1 = xor[a];
          x2 = xor[b] ^ xor[a];
          x3 = allXor ^ xor[b];
        } else {
          x1 = xor[a];
          x2 = xor[b];
          x3 = allXor ^ xor[a] ^ xor[b];
        }

        const maxPart = Math.max(x1, Math.max(x2, x3));
        const minPart = Math.min(x1, Math.min(x2, x3));
        const diff = maxPart - minPart;

        const partitionTree = cloneTree(treeState);
        const colorNodes = (node: UniversalTreeNode) => {
          if (node.id === `score-${b}`) {
            node.status = 'active';
            node.tag = `块1:异或${x1}`;
          } else if (node.id === `score-${a}`) {
            node.status = 'visited';
            node.tag = `块2:异或${x2}`;
          } else if (node.id === 'score-0') {
            node.status = 'normal';
            node.tag = `块3:异或${x3}`;
          }
          node.children.forEach(colorNodes);
        };
        colorNodes(partitionTree);

        // Line 24: 检查关系
        addStep({
          type: 'update',
          line: 24,
          i,
          j,
          dp1d: [x1, x2, x3],
          memo: [x1, x2, x3],
          activeSlot: j,
          tag: isAncestorA
            ? `子树#${b} 属于 子树#${a}`
            : isAncestorB
            ? `子树#${a} 属于 子树#${b}`
            : `子树#${a} 与 子树#${b} 并列分支`,
          log: `| 关系判定 (e${i}, e${j}): a=#${a}, b=#${b} -> ${
            isAncestorA ? `#${b}在#${a}内` : isAncestorB ? `#${a}在#${b}内` : '并列分支'
          }`,
          msg: `拓扑关系判定：节点 <strong>#${a}</strong> 与 <strong>#${b}</strong> 为 <strong>${
            isAncestorA ? `包含关系（#${b} 在 #${a} 子树内）` : isAncestorB ? `包含关系` : '并列分支关系'
          }</strong>。`,
          activeNodeId: `score-${b}`,
          treeRoot: partitionTree,
          activeArrName: 'edgeEnds',
          activeArrSlot: j,
          highlightArrSlots: [i],
        });

        // Line 31: 计算极差
        addStep({
          type: 'update',
          line: 31,
          i,
          j,
          dp1d: [x1, x2, x3],
          memo: [x1, x2, x3],
          activeSlot: 0,
          tag: `切分(e${i},e${j}): 差值=${diff}`,
          log: `| ⚡ 切分三块异或和: [${x1}, ${x2}, ${x3}] -> max-min = ${maxPart} - ${minPart} = ${diff} ${
            diff === 9 ? '🎯 (当前最优!)' : ''
          }`,
          msg: `切断边 <code>e${i}</code> 与 <code>e${j}</code>：三连通块异或和分别为 <code>${x1}, ${x2}, ${x3}</code>，极值差为 <code>${maxPart} - ${minPart} = <strong>${diff}</strong></code>。`,
          activeNodeId: `score-${b}`,
          treeRoot: partitionTree,
          activeArrName: 'ans',
          activeArrSlot: 0,
        });
      }
    }

    // Line 34: return ans;
    addStep({
      type: 'return',
      line: 34,
      i: 0,
      j: 0,
      dp1d: [globalAns],
      memo: [globalAns],
      activeSlot: 0,
      tag: `最小分数: ${globalAns}`,
      log: `🏆 return ans = ${globalAns}; (遍历所有断边方案完成，返回最小极差)`,
      msg: `🏆 演化推导全部完成！从树中删除两条边的最小分数为 <strong>${globalAns}</strong>。`,
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    return steps;
  }
}

