/**
 * 寻找重复的子树可视化器 (Find Duplicate Subtrees · LeetCode 652)
 *
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution):
 *   Stage 1: 经典后序遍历字符串序列化哈希查重 (Postorder Serialization)
 *   Stage 2: 唯一三元组 UID 编码极速哈希 (Triplet UID Compression, O(N))
 *   Stage 3: 显式后序遍历与单调栈迭代 (Explicit Stack Iteration)
 *
 * 设计模式应用:
 *   建造者模式 (RecursiveCallTraceBuilder): 追踪后序遍历状态演化与子树序列归约
 *   适配器模式 (TreeCanvasAdapter): 桥接纯净 SVG 树沙盘与 Card 2 序列签名频次表
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { parseTreeArray } from '../../../core/input-primitives';
import { TreeNode, buildTreeFromArr } from './tree-template';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import {
  FIND_DUPLICATE_SUBTREES_PROBLEM_HTML,
  FIND_DUPLICATE_SUBTREES_ANALYSIS_HTML,
} from './find-duplicate-subtrees-problem-content';
import {
  FIND_DUPLICATE_SUBTREES_CODES,
  FIND_DUPLICATE_SUBTREES_STAGE1_CODES,
  FIND_DUPLICATE_SUBTREES_STAGE2_CODES,
  FIND_DUPLICATE_SUBTREES_STAGE3_CODES,
  FIND_DUPLICATE_SUBTREES_STAGE1_LINES,
  FIND_DUPLICATE_SUBTREES_STAGE2_LINES,
  FIND_DUPLICATE_SUBTREES_STAGE3_LINES,
} from './find-duplicate-subtrees-stage-codes';

export { FIND_DUPLICATE_SUBTREES_CODES };

export interface TreeNodeData {
  id: number;
  val: number;
  leftId: number | null;
  rightId: number | null;
  x: number;
  y: number;
}

export interface DuplicateSubtreeStep extends StepBase {
  nodes: TreeNodeData[];
  currentNodeId: number | null;
  subtreeSerialMap: Record<number, string>; // 节点 ID -> 其子树序列化串
  serialCountMap: Record<string, number>;    // 序列化串 -> 出现次数
  duplicateRoots: number[];                 // 重复子树的根节点 ID 列表
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  stageId?: string;
  tripletMap?: Record<string, number>;      // Stage 2 专用: triplet -> uid
  uidCountMap?: Record<number, number>;     // Stage 2 专用: uid -> freq
  nodeUidMap?: Record<number, number>;      // Stage 2 专用: nodeId -> uid
  stackFrames?: number[];                   // Stage 3 专用: 当前迭代栈
  callTrace?: RecursiveCallTraceSnapshot;
}

// 预制经典用例节点坐标（完美保持 100% 像素对齐）
const DEFAULT_PRESET_NODES: TreeNodeData[] = [
  { id: 1, val: 1, leftId: 2, rightId: 3, x: 250, y: 40 },
  { id: 2, val: 2, leftId: 4, rightId: null, x: 140, y: 110 },
  { id: 3, val: 3, leftId: 5, rightId: 6, x: 360, y: 110 },
  { id: 4, val: 4, leftId: null, rightId: null, x: 80, y: 180 },
  { id: 5, val: 2, leftId: 7, rightId: null, x: 300, y: 180 },
  { id: 6, val: 4, leftId: null, rightId: null, x: 420, y: 180 },
  { id: 7, val: 4, leftId: null, rightId: null, x: 260, y: 250 },
];

/** 动态自适应树布局：将任意 TreeNode 转换为带渲染坐标与唯一 ID 的 TreeNodeData 数组 */
function treeToNodeData(root: TreeNode | null): { nodes: TreeNodeData[]; rootId: number | null } {
  if (!root) return { nodes: [], rootId: null };

  interface InternalNode {
    id: number;
    val: number;
    left: InternalNode | null;
    right: InternalNode | null;
    x: number;
    y: number;
  }

  let nextId = 1;
  function buildInternal(node: TreeNode | null): InternalNode | null {
    if (!node) return null;
    return {
      id: nextId++,
      val: node.val,
      left: buildInternal(node.left),
      right: buildInternal(node.right),
      x: 0,
      y: 0,
    };
  }

  const rootInternal = buildInternal(root);
  if (!rootInternal) return { nodes: [], rootId: null };

  function layout(node: InternalNode | null, depth: number, left: number, right: number) {
    if (!node) return;
    node.x = Math.round((left + right) / 2);
    node.y = 40 + depth * 65;
    const mid = node.x;
    layout(node.left, depth + 1, left, mid);
    layout(node.right, depth + 1, mid, right);
  }

  layout(rootInternal, 0, 40, 460);

  const nodes: TreeNodeData[] = [];
  function collect(node: InternalNode | null) {
    if (!node) return;
    nodes.push({
      id: node.id,
      val: node.val,
      leftId: node.left ? node.left.id : null,
      rightId: node.right ? node.right.id : null,
      x: node.x,
      y: node.y,
    });
    collect(node.left);
    collect(node.right);
  }

  collect(rootInternal);
  return { nodes, rootId: rootInternal.id };
}

// ============================================================
// Stage 1: 经典后序序列化与哈希查重 (兼容历史测试入口)
// ============================================================
export function buildDuplicateSubtreesStage1Steps(
  root?: TreeNode | null,
  customNodes?: TreeNodeData[],
  rootId?: number | null
): DuplicateSubtreeStep[] {
  const steps: DuplicateSubtreeStep[] = [];
  const trace = new RecursiveCallTraceBuilder();

  let nodes: TreeNodeData[];
  let startNodeId: number | null;

  if (customNodes && customNodes.length > 0 && rootId != null) {
    nodes = customNodes;
    startNodeId = rootId;
  } else if (root) {
    const layoutRes = treeToNodeData(root);
    nodes = layoutRes.nodes;
    startNodeId = layoutRes.rootId;
  } else {
    nodes = DEFAULT_PRESET_NODES;
    startNodeId = 1;
  }

  const nodeMap = new Map<number, TreeNodeData>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const subtreeSerialMap: Record<number, string> = {};
  const serialCountMap: Record<string, number> = {};
  const duplicateRoots: number[] = [];

  // Step 0: 主函数入口
  steps.push({
    nodes,
    currentNodeId: null,
    subtreeSerialMap: {},
    serialCountMap: {},
    duplicateRoots: [],
    decision: `主函数入口：findDuplicateSubtrees(root=${startNodeId ?? 'null'})`,
    message: '利用自底向上后序遍历（左-右-根）递归序列化子树形态，并通过哈希表统计频次',
    log: 'enter findDuplicateSubtrees(root)',
    codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.entry,
    stageId: 'stage1',
    metrics: { '当前阶段': 'Stage 1 字符串序列化', '重复子树数': '0', '已记录签名': '0' },
    callTrace: trace.snapshot(),
  });

  if (startNodeId == null) {
    steps.push({
      nodes,
      currentNodeId: null,
      subtreeSerialMap: {},
      serialCountMap: {},
      duplicateRoots: [],
      decision: '根节点为空，直接返回空列表',
      message: '空树无任何重复子树',
      log: 'root is null -> return empty',
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.returnAns,
      stageId: 'stage1',
      metrics: { '重复子树数': '0', '状态': '完成' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  function dfs(nodeId: number | null, depth: number): string {
    if (nodeId === null) {
      trace.addRecursePrep('dfs(null)', depth, '遇到空指针，返回基底 "#"');
      steps.push({
        nodes,
        currentNodeId: null,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: { ...serialCountMap },
        duplicateRoots: [...duplicateRoots],
        decision: '遇到空节点 null，返回序列化基底 "#"',
        message: '空指针统一标记为 "#" 作为子树结构分隔符',
        log: 'dfs(null) -> "#"',
        codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.dfsNull,
        stageId: 'stage1',
        metrics: { '当前节点': 'null', '返回值': '#', '重复子树数': String(duplicateRoots.length) },
        callTrace: trace.snapshot(),
      });
      return '#';
    }

    const node = nodeMap.get(nodeId)!;
    trace.addRecursePrep(`dfs(node=${node.val})`, depth, `进入节点 [${node.val}]，准备遍历子树`);

    // 进入节点
    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `进入节点 [${node.val}] (ID:${nodeId})，开始探索其左子树`,
      message: '后序遍历优先自底向上收集子节点签名，以合成当前子树全景序列',
      log: `enter dfs(node=${node.val}, id=${nodeId})`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.dfsEntry,
      stageId: 'stage1',
      metrics: { '当前节点': `${node.val}`, '节点ID': `${nodeId}`, '重复子树数': String(duplicateRoots.length) },
      callTrace: trace.snapshot(),
    });

    // 递归左子树
    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `递归下潜节点 [${node.val}] 的左子树`,
      message: '自底向上计算左子树序列化签名',
      log: `dfs left child of ${node.val}`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.dfsLeft,
      stageId: 'stage1',
      metrics: { '当前节点': `${node.val}`, '方向': '左子树' },
      callTrace: trace.snapshot(),
    });
    const leftSerial = dfs(node.leftId, depth + 1);

    // 递归右子树
    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `递归下潜节点 [${node.val}] 的右子树`,
      message: '自底向上计算右子树序列化签名',
      log: `dfs right child of ${node.val}`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.dfsRight,
      stageId: 'stage1',
      metrics: { '当前节点': `${node.val}`, '方向': '右子树' },
      callTrace: trace.snapshot(),
    });
    const rightSerial = dfs(node.rightId, depth + 1);

    // 序列化拼接
    const serial = `${leftSerial},${rightSerial},${node.val}`;
    subtreeSerialMap[nodeId] = serial;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `子调用返回，合成节点 [${node.val}] 的子树序列: "${serial}"`,
      message: `公式: left("${leftSerial}") + "," + right("${rightSerial}") + "," + val(${node.val})`,
      log: `serialized node ${node.val} -> "${serial}"`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.serial,
      stageId: 'stage1',
      metrics: { '子树序列': serial, '当前节点': `${node.val}` },
      callTrace: trace.snapshot(),
    });

    // 哈希频次自增
    const freq = (serialCountMap[serial] || 0) + 1;
    serialCountMap[serial] = freq;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `更新哈希表：序列 "${serial}" 频次累加至 ${freq}`,
      message: `子树形态出现频次: ${freq}`,
      log: `count["${serial}"] = ${freq}`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.count,
      stageId: 'stage1',
      metrics: { '签名频次': String(freq), '唯一子树形态数': String(Object.keys(serialCountMap).length) },
      callTrace: trace.snapshot(),
    });

    // 命中重复 (恰好等于 2 时收集，避免多次添加)
    if (freq === 2) {
      duplicateRoots.push(nodeId);
      trace.addUnwindCalc(`addRes(node=${node.val})`, depth, `发现重复子树！根节点 ID=${nodeId}, val=${node.val}`, `freq == 2`);
      steps.push({
        nodes,
        currentNodeId: nodeId,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: { ...serialCountMap },
        duplicateRoots: [...duplicateRoots],
        decision: `🎯 命中重复！序列 "${serial}" 出现第 2 次，将根节点 [${node.val}] (ID:${nodeId}) 加入结果集`,
        message: '为防止重复子树被多次添加，仅在频次严格等于 2 时录入答案池',
        log: `duplicate detected: node ${node.val} (id=${nodeId}) added to res`,
        codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.addRes,
        stageId: 'stage1',
        metrics: { '重复子树数': String(duplicateRoots.length), '最新命中': `节点 ${node.val}` },
        callTrace: trace.snapshot(),
      });
    }

    // 返回序列
    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `当前栈帧弹出，向父节点返回序列化表达: "${serial}"`,
      message: '回传当前子树完整形态，供上层继续自底向上组装',
      log: `return serial "${serial}" for node ${nodeId}`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.dfsReturn,
      stageId: 'stage1',
      metrics: { '回传签名': serial, '重复子树数': String(duplicateRoots.length) },
      callTrace: trace.snapshot(),
    });

    return serial;
  }

  dfs(startNodeId, 0);

  // 终态收尾
  steps.push({
    nodes,
    currentNodeId: null,
    subtreeSerialMap: { ...subtreeSerialMap },
    serialCountMap: { ...serialCountMap },
    duplicateRoots: [...duplicateRoots],
    decision: `🎉 遍历完成！共检测并收集到 ${duplicateRoots.length} 个重复子树根节点`,
    message: `收集到的重复子树根节点 ID: [${duplicateRoots.join(', ')}]，算法圆满结束`,
    log: `finished findDuplicateSubtrees, duplicates: ${duplicateRoots.join(',')}`,
    codeLine: FIND_DUPLICATE_SUBTREES_STAGE1_LINES.returnAns,
    stageId: 'stage1',
    metrics: { '重复子树数': String(duplicateRoots.length), '状态': '已完成', '总子树数': String(nodes.length) },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// 历史测试别名兼容
export const buildDuplicateSubtreesSteps = buildDuplicateSubtreesStage1Steps;

// ============================================================
// Stage 2: 唯一三元组 UID 编码极速哈希 (O(N) 工业级)
// ============================================================
export function buildDuplicateSubtreesStage2Steps(
  root?: TreeNode | null,
  customNodes?: TreeNodeData[],
  rootId?: number | null
): DuplicateSubtreeStep[] {
  const steps: DuplicateSubtreeStep[] = [];
  const trace = new RecursiveCallTraceBuilder();

  let nodes: TreeNodeData[];
  let startNodeId: number | null;

  if (customNodes && customNodes.length > 0 && rootId != null) {
    nodes = customNodes;
    startNodeId = rootId;
  } else if (root) {
    const layoutRes = treeToNodeData(root);
    nodes = layoutRes.nodes;
    startNodeId = layoutRes.rootId;
  } else {
    nodes = DEFAULT_PRESET_NODES;
    startNodeId = 1;
  }

  const nodeMap = new Map<number, TreeNodeData>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const tripletMap: Record<string, number> = {};
  const uidCountMap: Record<number, number> = {};
  const nodeUidMap: Record<number, number> = {};
  const subtreeSerialMap: Record<number, string> = {};
  const duplicateRoots: number[] = [];
  let nextUid = 1;

  steps.push({
    nodes,
    currentNodeId: null,
    subtreeSerialMap: {},
    serialCountMap: {},
    duplicateRoots: [],
    decision: `主函数入口：getUid(root=${startNodeId ?? 'null'}) (Stage 2 三元组 UID 压缩)`,
    message: '将每棵子树抽象为三元组 (val, leftUID, rightUID)，分配自增整数 UID，将比较开销降维到 O(1)',
    log: 'enter getUid(root) [Triplet UID mode]',
    codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.entry,
    stageId: 'stage2',
    tripletMap: {},
    uidCountMap: {},
    nodeUidMap: {},
    metrics: { '当前阶段': 'Stage 2 三元组 UID', '已分配 UID 种数': '0', '重复子树数': '0' },
    callTrace: trace.snapshot(),
  });

  if (startNodeId == null) {
    steps.push({
      nodes,
      currentNodeId: null,
      subtreeSerialMap: {},
      serialCountMap: {},
      duplicateRoots: [],
      decision: '空树无任何节点，直接返回空答案集',
      message: '已完成空树特判',
      log: 'root null -> return empty',
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.returnAns,
      stageId: 'stage2',
      tripletMap: {},
      uidCountMap: {},
      nodeUidMap: {},
      metrics: { '重复子树数': '0', '状态': '完成' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  function getUid(nodeId: number | null, depth: number): number {
    if (nodeId === null) {
      trace.addRecursePrep('getUid(null)', depth, '空节点分配保留 UID = 0');
      steps.push({
        nodes,
        currentNodeId: null,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: {},
        duplicateRoots: [...duplicateRoots],
        decision: '遇到空节点 null，返回固定保留 UID = 0',
        message: '空树统一约定全局 UID 为 0',
        log: 'getUid(null) -> 0',
        codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.dfsNull,
        stageId: 'stage2',
        tripletMap: { ...tripletMap },
        uidCountMap: { ...uidCountMap },
        nodeUidMap: { ...nodeUidMap },
        metrics: { '当前节点': 'null', '分配 UID': '0', '重复子树数': String(duplicateRoots.length) },
        callTrace: trace.snapshot(),
      });
      return 0;
    }

    const node = nodeMap.get(nodeId)!;
    trace.addRecursePrep(`getUid(node=${node.val})`, depth, `进入节点 [${node.val}] 获取子树 UID`);

    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: {},
      duplicateRoots: [...duplicateRoots],
      decision: `进入节点 [${node.val}] (ID:${nodeId})，准备获取左右孩子 UID`,
      message: '后序自底向上，先获取左右子树的压缩 UID 编码',
      log: `enter getUid(node=${node.val}, id=${nodeId})`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.dfsEntry,
      stageId: 'stage2',
      tripletMap: { ...tripletMap },
      uidCountMap: { ...uidCountMap },
      nodeUidMap: { ...nodeUidMap },
      metrics: { '当前节点': `${node.val}`, '节点ID': `${nodeId}` },
      callTrace: trace.snapshot(),
    });

    // 递归左
    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: {},
      duplicateRoots: [...duplicateRoots],
      decision: `获取节点 [${node.val}] 左孩子的压缩 UID`,
      message: '递归探查左子树',
      log: `getUid left child of ${node.val}`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.dfsLeft,
      stageId: 'stage2',
      tripletMap: { ...tripletMap },
      uidCountMap: { ...uidCountMap },
      nodeUidMap: { ...nodeUidMap },
      metrics: { '当前节点': `${node.val}`, '方向': '左子树' },
      callTrace: trace.snapshot(),
    });
    const leftUid = getUid(node.leftId, depth + 1);

    // 递归右
    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: {},
      duplicateRoots: [...duplicateRoots],
      decision: `获取节点 [${node.val}] 右孩子的压缩 UID`,
      message: '递归探查右子树',
      log: `getUid right child of ${node.val}`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.dfsRight,
      stageId: 'stage2',
      tripletMap: { ...tripletMap },
      uidCountMap: { ...uidCountMap },
      nodeUidMap: { ...nodeUidMap },
      metrics: { '当前节点': `${node.val}`, '方向': '右子树' },
      callTrace: trace.snapshot(),
    });
    const rightUid = getUid(node.rightId, depth + 1);

    // 构造三元组
    const triplet = `${node.val},${leftUid},${rightUid}`;
    subtreeSerialMap[nodeId] = `UID#(?)[${triplet}]`;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: {},
      duplicateRoots: [...duplicateRoots],
      decision: `合成节点 [${node.val}] 的子树三元组: (${triplet})`,
      message: `三元组定义: (val=${node.val}, leftUID=${leftUid}, rightUID=${rightUid})`,
      log: `triplet for node ${node.val} = (${triplet})`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.triplet,
      stageId: 'stage2',
      tripletMap: { ...tripletMap },
      uidCountMap: { ...uidCountMap },
      nodeUidMap: { ...nodeUidMap },
      metrics: { '三元组签名': `(${triplet})`, '当前节点': `${node.val}` },
      callTrace: trace.snapshot(),
    });

    // 分配 UID
    let uid = tripletMap[triplet];
    const isNew = uid === undefined;
    if (isNew) {
      uid = nextUid++;
      tripletMap[triplet] = uid;
    }
    nodeUidMap[nodeId] = uid;
    subtreeSerialMap[nodeId] = `UID #${uid}`;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: {},
      duplicateRoots: [...duplicateRoots],
      decision: isNew
        ? `🆕 首次出现该形态！为三元组 (${triplet}) 分配全新 UID: #${uid}`
        : `🔄 该形态已存在！三元组 (${triplet}) 对应既有 UID: #${uid}`,
      message: `通过三元组到 UID 的双射，将子树比较开销稳定在 O(1)`,
      log: `triplet (${triplet}) -> UID #${uid} (${isNew ? 'NEW' : 'EXISTING'})`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.uidAssign,
      stageId: 'stage2',
      tripletMap: { ...tripletMap },
      uidCountMap: { ...uidCountMap },
      nodeUidMap: { ...nodeUidMap },
      metrics: { '分配 UID': `#${uid}`, '形态状态': isNew ? '新形态' : '重复形态' },
      callTrace: trace.snapshot(),
    });

    // 频次统计
    const freq = (uidCountMap[uid] || 0) + 1;
    uidCountMap[uid] = freq;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: {},
      duplicateRoots: [...duplicateRoots],
      decision: `更新 UID 频次表：UID #${uid} 频次增至 ${freq}`,
      message: `UID #${uid} 当前出现次数为 ${freq}`,
      log: `uidCount[#${uid}] = ${freq}`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.count,
      stageId: 'stage2',
      tripletMap: { ...tripletMap },
      uidCountMap: { ...uidCountMap },
      nodeUidMap: { ...nodeUidMap },
      metrics: { 'UID 频次': String(freq), '总 UID 数': String(Object.keys(tripletMap).length) },
      callTrace: trace.snapshot(),
    });

    // 命中重复
    if (freq === 2) {
      duplicateRoots.push(nodeId);
      trace.addUnwindCalc(`addRes(node=${node.val})`, depth, `发现重复子树！UID=#${uid}`, `freq == 2`);
      steps.push({
        nodes,
        currentNodeId: nodeId,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: {},
        duplicateRoots: [...duplicateRoots],
        decision: `🎯 命中重复！UID #${uid} 出现第 2 次，将根节点 [${node.val}] (ID:${nodeId}) 加入答案集`,
        message: '以常数时间判定重复，避免字符串比较的长延时',
        log: `duplicate detected: node ${node.val} (id=${nodeId}, uid=#${uid}) added to res`,
        codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.addRes,
        stageId: 'stage2',
        tripletMap: { ...tripletMap },
        uidCountMap: { ...uidCountMap },
        nodeUidMap: { ...nodeUidMap },
        metrics: { '重复子树数': String(duplicateRoots.length), '命中 UID': `#${uid}` },
        callTrace: trace.snapshot(),
      });
    }

    // 返回 UID
    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: {},
      duplicateRoots: [...duplicateRoots],
      decision: `当前栈帧弹出，向父节点返回子树 UID: #${uid}`,
      message: '回传整数 UID 编码',
      log: `return uid #${uid} for node ${nodeId}`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.dfsReturn,
      stageId: 'stage2',
      tripletMap: { ...tripletMap },
      uidCountMap: { ...uidCountMap },
      nodeUidMap: { ...nodeUidMap },
      metrics: { '回传 UID': `#${uid}`, '重复子树数': String(duplicateRoots.length) },
      callTrace: trace.snapshot(),
    });

    return uid;
  }

  getUid(startNodeId, 0);

  steps.push({
    nodes,
    currentNodeId: null,
    subtreeSerialMap: { ...subtreeSerialMap },
    serialCountMap: {},
    duplicateRoots: [...duplicateRoots],
    decision: `🎉 Stage 2 完成！共识别出 ${duplicateRoots.length} 组重复子树`,
    message: `全部节点以 O(N) 线性时间完成三元组 UID 编码归约`,
    log: `finished getUid, duplicates: ${duplicateRoots.join(',')}`,
    codeLine: FIND_DUPLICATE_SUBTREES_STAGE2_LINES.returnAns,
    stageId: 'stage2',
    tripletMap: { ...tripletMap },
    uidCountMap: { ...uidCountMap },
    nodeUidMap: { ...nodeUidMap },
    metrics: { '重复子树数': String(duplicateRoots.length), '状态': '已完成', '总唯一UID': String(Object.keys(tripletMap).length) },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// ============================================================
// Stage 3: 显式后序遍历与单调栈迭代 (无系统栈)
// ============================================================
export function buildDuplicateSubtreesStage3Steps(
  root?: TreeNode | null,
  customNodes?: TreeNodeData[],
  rootId?: number | null
): DuplicateSubtreeStep[] {
  const steps: DuplicateSubtreeStep[] = [];
  const trace = new RecursiveCallTraceBuilder();

  let nodes: TreeNodeData[];
  let startNodeId: number | null;

  if (customNodes && customNodes.length > 0 && rootId != null) {
    nodes = customNodes;
    startNodeId = rootId;
  } else if (root) {
    const layoutRes = treeToNodeData(root);
    nodes = layoutRes.nodes;
    startNodeId = layoutRes.rootId;
  } else {
    nodes = DEFAULT_PRESET_NODES;
    startNodeId = 1;
  }

  const nodeMap = new Map<number, TreeNodeData>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const subtreeSerialMap: Record<number, string> = {};
  const serialCountMap: Record<string, number> = {};
  const duplicateRoots: number[] = [];
  const stack: number[] = [];

  steps.push({
    nodes,
    currentNodeId: null,
    subtreeSerialMap: {},
    serialCountMap: {},
    duplicateRoots: [],
    decision: `主函数入口：显式单调栈后序迭代 (Stage 3 零系统递归栈)`,
    message: '利用显式栈与 prev 标记指针，模拟后序遍历的左链压栈与右子树返回过程',
    log: 'enter explicit stack iterative postorder',
    codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.entry,
    stageId: 'stage3',
    stackFrames: [],
    metrics: { '当前阶段': 'Stage 3 显式栈迭代', '栈深度': '0', '重复子树数': '0' },
    callTrace: trace.snapshot(),
  });

  if (startNodeId == null) {
    steps.push({
      nodes,
      currentNodeId: null,
      subtreeSerialMap: {},
      serialCountMap: {},
      duplicateRoots: [],
      decision: '空树特判，直接返回空结果集',
      message: '完成',
      log: 'root null -> return empty',
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.checkEmpty,
      stageId: 'stage3',
      stackFrames: [],
      metrics: { '重复子树数': '0', '状态': '完成' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  let curr: number | null = startNodeId;
  let prev: number | null = null;

  while (curr !== null || stack.length > 0) {
    // 左链一直下潜入栈
    while (curr !== null) {
      stack.push(curr);
      const currNode = nodeMap.get(curr)!;
      trace.addRecursePrep(`push(${currNode.val})`, stack.length, `左链下潜：节点 [${currNode.val}] 压入栈`);
      steps.push({
        nodes,
        currentNodeId: curr,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: { ...serialCountMap },
        duplicateRoots: [...duplicateRoots],
        decision: `沿左子树链深入，将节点 [${currNode.val}] (ID:${curr}) 压入显式栈`,
        message: `模拟系统调用栈：push(node=${currNode.val})`,
        log: `stack push ${currNode.val}`,
        codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.pushLeftChain,
        stageId: 'stage3',
        stackFrames: [...stack],
        metrics: { '当前节点': `${currNode.val}`, '栈顶': `${currNode.val}`, '栈深度': String(stack.length) },
        callTrace: trace.snapshot(),
      });
      curr = currNode.leftId;
    }

    // 观察栈顶
    const topId = stack[stack.length - 1];
    const topNode = nodeMap.get(topId)!;

    steps.push({
      nodes,
      currentNodeId: topId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `窥视栈顶节点 [${topNode.val}] (ID:${topId})，检查其右子树是否已处理`,
      message: '如果右子树存在且未曾访问过，则优先转向右子树',
      log: `peek stack top ${topNode.val}`,
      codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.peekTop,
      stageId: 'stage3',
      stackFrames: [...stack],
      metrics: { '栈顶': `${topNode.val}`, '右孩子ID': String(topNode.rightId) },
      callTrace: trace.snapshot(),
    });

    if (topNode.rightId !== null && topNode.rightId !== prev) {
      curr = topNode.rightId;
      const rightNode = nodeMap.get(curr)!;
      steps.push({
        nodes,
        currentNodeId: curr,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: { ...serialCountMap },
        duplicateRoots: [...duplicateRoots],
        decision: `栈顶 [${topNode.val}] 的右子树尚未处理，转向右孩子 [${rightNode.val}] (ID:${curr})`,
        message: '深入右分支继续展开',
        log: `turn to right child ${rightNode.val}`,
        codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.gotoRight,
        stageId: 'stage3',
        stackFrames: [...stack],
        metrics: { '当前节点': `${rightNode.val}`, '转向': '右子树' },
        callTrace: trace.snapshot(),
      });
    } else {
      // 左右子树均已处理，弹出栈顶并结算
      stack.pop();
      steps.push({
        nodes,
        currentNodeId: topId,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: { ...serialCountMap },
        duplicateRoots: [...duplicateRoots],
        decision: `节点 [${topNode.val}] 的左右子树均已就绪，弹出栈顶开始后序结算`,
        message: '从后序状态表中聚合左右子树序列',
        log: `pop stack top ${topNode.val}`,
        codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.popStack,
        stageId: 'stage3',
        stackFrames: [...stack],
        metrics: { '出栈节点': `${topNode.val}`, '剩余栈深': String(stack.length) },
        callTrace: trace.snapshot(),
      });

      const leftS = topNode.leftId !== null ? subtreeSerialMap[topNode.leftId] || '#' : '#';
      const rightS = topNode.rightId !== null ? subtreeSerialMap[topNode.rightId] || '#' : '#';
      const s = `${leftS},${rightS},${topNode.val}`;
      subtreeSerialMap[topId] = s;

      steps.push({
        nodes,
        currentNodeId: topId,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: { ...serialCountMap },
        duplicateRoots: [...duplicateRoots],
        decision: `聚合节点 [${topNode.val}] 的子树序列串: "${s}"`,
        message: `计算签名: left("${leftS}") + right("${rightS}") + val(${topNode.val})`,
        log: `serialMap[${topNode.val}] = "${s}"`,
        codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.calcSerial,
        stageId: 'stage3',
        stackFrames: [...stack],
        metrics: { '序列签名': s, '当前节点': `${topNode.val}` },
        callTrace: trace.snapshot(),
      });

      const c = (serialCountMap[s] || 0) + 1;
      serialCountMap[s] = c;

      steps.push({
        nodes,
        currentNodeId: topId,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: { ...serialCountMap },
        duplicateRoots: [...duplicateRoots],
        decision: `频次表中记录序列 "${s}" 出现第 ${c} 次`,
        message: `频次状态: ${c}`,
        log: `count["${s}"] = ${c}`,
        codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.count,
        stageId: 'stage3',
        stackFrames: [...stack],
        metrics: { '出现频次': String(c), '签名表大小': String(Object.keys(serialCountMap).length) },
        callTrace: trace.snapshot(),
      });

      if (c === 2) {
        duplicateRoots.push(topId);
        trace.addUnwindCalc(`addRes(node=${topNode.val})`, stack.length, `检测到重复子树！根节点 ID=${topId}`, `c == 2`);
        steps.push({
          nodes,
          currentNodeId: topId,
          subtreeSerialMap: { ...subtreeSerialMap },
          serialCountMap: { ...serialCountMap },
          duplicateRoots: [...duplicateRoots],
          decision: `🎯 命中重复！节点 [${topNode.val}] (ID:${topId}) 所在子树出现第 2 次，加入答案集`,
          message: '已捕获重复子树根节点',
          log: `duplicate detected: ${topNode.val} (id=${topId})`,
          codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.addRes,
          stageId: 'stage3',
          stackFrames: [...stack],
          metrics: { '重复子树数': String(duplicateRoots.length), '命中节点': `${topNode.val}` },
          callTrace: trace.snapshot(),
        });
      }

      prev = topId;
      curr = null;

      steps.push({
        nodes,
        currentNodeId: topId,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: { ...serialCountMap },
        duplicateRoots: [...duplicateRoots],
        decision: `标记 prev = [${topNode.val}]，继续回溯驱动外层迭代`,
        message: '标记当前节点已完成回溯，避免父节点重复探查',
        log: `set prev = ${topNode.val}, curr = null`,
        codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.setPrev,
        stageId: 'stage3',
        stackFrames: [...stack],
        metrics: { 'prev': `${topNode.val}`, '重复子树数': String(duplicateRoots.length) },
        callTrace: trace.snapshot(),
      });
    }
  }

  steps.push({
    nodes,
    currentNodeId: null,
    subtreeSerialMap: { ...subtreeSerialMap },
    serialCountMap: { ...serialCountMap },
    duplicateRoots: [...duplicateRoots],
    decision: `🎉 显式后序遍历完成！共检测到 ${duplicateRoots.length} 个重复子树根节点`,
    message: '全流程在非递归显式栈中顺利完成',
    log: `finished iterative duplicate subtrees, duplicates: ${duplicateRoots.join(',')}`,
    codeLine: FIND_DUPLICATE_SUBTREES_STAGE3_LINES.returnAns,
    stageId: 'stage3',
    stackFrames: [],
    metrics: { '重复子树数': String(duplicateRoots.length), '状态': '已完成' },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// ============================================================
// Card 1 纯净 SVG 树画布渲染 (零标题、零指标镜像、零套娃)
// ============================================================
export function renderDuplicateSubtreesCanvas(container: HTMLElement, step: DuplicateSubtreeStep): void {
  const { nodes, currentNodeId, subtreeSerialMap, duplicateRoots } = step;

  // 连接线 SVG
  const linesHtml = nodes
    .map((node) => {
      const leftChild = node.leftId ? nodes.find((n) => n.id === node.leftId) : null;
      const rightChild = node.rightId ? nodes.find((n) => n.id === node.rightId) : null;

      let res = '';
      if (leftChild) {
        res += `<line x1="${node.x}" y1="${node.y}" x2="${leftChild.x}" y2="${leftChild.y}" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round" />`;
      }
      if (rightChild) {
        res += `<line x1="${node.x}" y1="${node.y}" x2="${rightChild.x}" y2="${rightChild.y}" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round" />`;
      }
      return res;
    })
    .join('');

  // 节点渲染
  const nodesHtml = nodes
    .map((node) => {
      const isCurrent = node.id === currentNodeId;
      const isDuplicate = duplicateRoots.includes(node.id);
      const serial = subtreeSerialMap[node.id];

      let fill = 'rgba(30, 41, 59, 0.92)';
      let stroke = 'rgba(255, 255, 255, 0.28)';
      let textColor = '#f8fafc';
      let filter = 'none';

      if (isDuplicate) {
        fill = 'rgba(16, 185, 129, 0.35)';
        stroke = '#10b981';
        textColor = '#34d399';
        filter = 'drop-shadow(0 0 8px rgba(16,185,129,0.5))';
      }
      if (isCurrent) {
        fill = 'rgba(56, 189, 248, 0.45)';
        stroke = '#38bdf8';
        textColor = '#38bdf8';
        filter = 'drop-shadow(0 0 10px rgba(56,189,248,0.7))';
      }

      return `
      <g style="filter: ${filter};">
        <circle cx="${node.x}" cy="${node.y}" r="22" fill="${fill}" stroke="${stroke}" stroke-width="${isCurrent || isDuplicate ? 3 : 1.5}" />
        <text x="${node.x}" y="${node.y + 5}" font-size="14" font-weight="700" fill="${textColor}" text-anchor="middle" font-family="system-ui, sans-serif">${node.val}</text>
        ${
          serial
            ? `<text x="${node.x}" y="${node.y + 36}" font-size="9.5" fill="#94a3b8" text-anchor="middle" font-family="monospace">${
                serial.length > 14 ? serial.substring(0, 13) + '..' : serial
              }</text>`
            : ''
        }
        ${
          isDuplicate
            ? `<text x="${node.x}" y="${node.y - 28}" font-size="10" fill="#34d399" font-weight="700" text-anchor="middle">★ 重复根</text>`
            : ''
        }
      </g>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
      <div style="position: absolute; top: 12px; right: 16px; display: flex; gap: 14px; font-size: 0.8rem; background: rgba(15,23,42,0.6); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
        <span style="color: #38bdf8; display: flex; align-items: center; gap: 4px;">● 当前遍历点</span>
        <span style="color: #34d399; display: flex; align-items: center; gap: 4px;">★ 重复子树根</span>
      </div>
      <svg viewBox="0 0 500 320" style="width: 100%; max-height: 340px; overflow: visible;">
        ${linesHtml}
        ${nodesHtml}
      </svg>
    </div>
  `;
}

// ============================================================
// Card 2 序列签名频次表 / UID 编码表 (与标题和徽章绝对对齐)
// ============================================================
export function renderDuplicateSubtreesCard2(container: HTMLElement, step: DuplicateSubtreeStep): void {
  const { stageId, serialCountMap, duplicateRoots, nodes, tripletMap, uidCountMap, nodeUidMap, stackFrames } = step;

  if (stageId === 'stage2') {
    // Stage 2: 三元组 UID 编码表
    const entries = Object.entries(tripletMap || {}).map(([triplet, uid]) => {
      const count = uidCountMap?.[uid] || 0;
      const isDupe = count >= 2;
      return `
        <div style="
          padding: 6px 10px;
          background: ${isDupe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 6, 23, 0.4)'};
          border: 1px solid ${isDupe ? '#10b981' : 'rgba(255, 255, 255, 0.08)'};
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: monospace;
          font-size: 0.8rem;
        ">
          <span style="color: #cbd5e1;">(${triplet}) &rarr; <strong style="color: #38bdf8;">UID #${uid}</strong></span>
          <span style="font-weight: 700; color: ${isDupe ? '#34d399' : '#94a3b8'};">频次: ${count} ${isDupe ? '🎯' : ''}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; font-weight: 600; color: #f1f5f9;">
          <span>📋 三元组 (val, leftUID, rightUID) 编码表</span>
          <span style="font-size: 0.76rem; color: #94a3b8;">共 ${Object.keys(tripletMap || {}).length} 种形态</span>
        </div>
        <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 6px; background: rgba(2, 6, 23, 0.5); border-radius: 8px;">
          ${entries.length ? entries.join('') : '<div style="color:#64748b; font-size:0.8rem; text-align:center; padding:12px;">暂无记录</div>'}
        </div>
        <div style="padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.82rem;">
          <div style="font-weight: 600; color: #34d399; margin-bottom: 2px;">🎯 已捕获重复子树根节点:</div>
          <div style="color: #f1f5f9; font-weight: 700;">
            ${duplicateRoots.length ? duplicateRoots.map((id) => `[节点 ${nodes.find((n) => n.id === id)?.val} (UID:#${nodeUidMap?.[id]})]`).join('、') : '<span style="color:#94a3b8; font-weight:normal;">尚未检测到重复</span>'}
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (stageId === 'stage3') {
    // Stage 3: 显式后序栈与频次表
    const stackItems = (stackFrames || []).map((id) => {
      const node = nodes.find((n) => n.id === id);
      return `<span style="background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">${node?.val ?? id}</span>`;
    });

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
        <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 0.85rem; font-weight: 600; color: #f1f5f9; margin-bottom: 6px;">🥞 显式迭代栈帧 (Explicit Stack):</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${stackItems.length ? stackItems.join('') : '<span style="color:#64748b; font-size:0.8rem;">(空栈)</span>'}
          </div>
        </div>
        <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 6px; background: rgba(2, 6, 23, 0.5); border-radius: 8px;">
          <div style="font-size: 0.82rem; font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">📋 序列签名频次统计:</div>
          ${Object.entries(serialCountMap).map(([serial, count]) => `
            <div style="padding: 5px 8px; background: ${count >= 2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.4)'}; border: 1px solid ${count >= 2 ? '#10b981' : 'rgba(255,255,255,0.06)'}; border-radius: 6px; font-size: 0.78rem; display: flex; justify-content: space-between; font-family: monospace;">
              <span style="color: #cbd5e1; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">"${serial}"</span>
              <span style="color: ${count >= 2 ? '#34d399' : '#94a3b8'}; font-weight: 700;">频次: ${count} ${count >= 2 ? '🎯' : ''}</span>
            </div>
          `).join('') || '<div style="color:#64748b; font-size:0.8rem; text-align:center; padding:10px;">暂无记录</div>'}
        </div>
        <div style="padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.82rem;">
          <div style="font-weight: 600; color: #34d399; margin-bottom: 2px;">🎯 已捕获重复子树根节点:</div>
          <div style="color: #f1f5f9; font-weight: 700;">
            ${duplicateRoots.length ? duplicateRoots.map((id) => `[节点 ${nodes.find((n) => n.id === id)?.val}]`).join('、') : '<span style="color:#94a3b8; font-weight:normal;">尚未检测到重复</span>'}
          </div>
        </div>
      </div>
    `;
    return;
  }

  // 默认 Stage 1: 序列签名频次表
  const hashMapEntries = Object.entries(serialCountMap).map(([serial, count]) => {
    const isDupe = count >= 2;
    return `
      <div style="
        padding: 6px 10px;
        background: ${isDupe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 6, 23, 0.4)'};
        border: 1px solid ${isDupe ? '#10b981' : 'rgba(255, 255, 255, 0.08)'};
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: monospace;
        font-size: 0.8rem;
      ">
        <span style="color: #cbd5e1; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">"${serial}"</span>
        <span style="font-weight: 700; color: ${isDupe ? '#34d399' : '#94a3b8'};">频次: ${count} ${isDupe ? '🎯' : ''}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; font-weight: 600; color: #f1f5f9;">
        <span>📋 序列签名频次表 (Hash Table)</span>
        <span style="font-size: 0.76rem; color: #94a3b8;">共 ${Object.keys(serialCountMap).length} 种形态</span>
      </div>
      <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 6px; background: rgba(2, 6, 23, 0.5); border-radius: 8px;">
        ${hashMapEntries.length ? hashMapEntries.join('') : '<div style="color:#64748b; font-size:0.8rem; text-align:center; padding:12px;">暂无序列记录</div>'}
      </div>
      <div style="padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.82rem;">
        <div style="font-weight: 600; color: #34d399; margin-bottom: 2px;">🎯 已捕获重复子树根节点:</div>
        <div style="color: #f1f5f9; font-weight: 700;">
          ${duplicateRoots.length ? duplicateRoots.map((id) => `[节点 ${nodes.find((n) => n.id === id)?.val} (ID:${id})]`).join('、') : '<span style="color:#94a3b8; font-weight:normal;">尚未检测到重复</span>'}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// ============================================================
registerDeclarativeAlgorithm({
  id: 'find-duplicate-subtrees',
  name: '寻找重复的子树',
  category: 'tree',
  learningGoal: '掌握二叉树自底向上后序遍历子树序列化判定图同构，深度理解三元组 (val, leftUID, rightUID) 的 O(N) 整数哈希压缩原理',
  aliases: ['leetcode-652', 'find-duplicate-subtrees'],
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 经典后序序列化',
      shortName: '后序序列化',
      card2Title: '序列签名频次表 (Hash Table)',
      card2Desc: '自底向上字符串哈希序列频次统计',
      codeLanguages: FIND_DUPLICATE_SUBTREES_STAGE1_CODES,
      generateSteps: (rawInputs) => {
        const preset = rawInputs.treePreset || 'default';
        if (preset === 'default') {
          return buildDuplicateSubtreesStage1Steps();
        }
        const treeArr = parseTreeArray(rawInputs.treeInput, [1, 2, 3, 4, null, 2, 4, null, null, 4]);
        const root = buildTreeFromArr(treeArr);
        return buildDuplicateSubtreesStage1Steps(root);
      },
    },
    {
      id: 'stage2',
      name: 'Stage 2: 三元组 UID 压缩',
      shortName: '三元组UID',
      card2Title: '三元组 UID 编码表 (O(N))',
      card2Desc: '三元组 (val, leftUID, rightUID) 映射与频次统计',
      codeLanguages: FIND_DUPLICATE_SUBTREES_STAGE2_CODES,
      generateSteps: (rawInputs) => {
        const preset = rawInputs.treePreset || 'default';
        if (preset === 'default') {
          return buildDuplicateSubtreesStage2Steps();
        }
        const treeArr = parseTreeArray(rawInputs.treeInput, [1, 2, 3, 4, null, 2, 4, null, null, 4]);
        const root = buildTreeFromArr(treeArr);
        return buildDuplicateSubtreesStage2Steps(root);
      },
    },
    {
      id: 'stage3',
      name: 'Stage 3: 显式单调栈迭代',
      shortName: '单调栈迭代',
      card2Title: '显式后序栈与频次统计',
      card2Desc: '模拟调用栈压栈出栈与后序状态记录',
      codeLanguages: FIND_DUPLICATE_SUBTREES_STAGE3_CODES,
      generateSteps: (rawInputs) => {
        const preset = rawInputs.treePreset || 'default';
        if (preset === 'default') {
          return buildDuplicateSubtreesStage3Steps();
        }
        const treeArr = parseTreeArray(rawInputs.treeInput, [1, 2, 3, 4, null, 2, 4, null, null, 4]);
        const root = buildTreeFromArr(treeArr);
        return buildDuplicateSubtreesStage3Steps(root);
      },
    },
  ],
  inputs: [
    {
      id: 'treePreset',
      label: '预设案例',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: '经典重复: [1,2,3,4,null,2,4,null,null,4]', value: 'default' },
        { label: '对称重复: [2, 1, 1]', value: 'symmetric' },
        { label: '多层重复: [2, 2, 2, 3, null, 3, null]', value: 'multi-level' },
        { label: '无重复子树: [1, 2, 3]', value: 'unique' },
      ],
    },
    {
      id: 'treeInput',
      label: '自定义二叉树层序数组',
      type: 'text',
      defaultValue: '[1, 2, 3, 4, null, 2, 4, null, null, 4]',
      placeholder: '例如: [1,2,3,4,null,2,4,null,null,4]',
    },
  ],
  card2Title: '序列签名频次表 / UID 编码表',
  card2Desc: '子树形态哈希签名与重复根节点收集池',
  problemHtml: FIND_DUPLICATE_SUBTREES_PROBLEM_HTML,
  analysisHtml: FIND_DUPLICATE_SUBTREES_ANALYSIS_HTML,
  renderCanvas: (container: HTMLElement, step: any) => {
    renderDuplicateSubtreesCanvas(container, step as DuplicateSubtreeStep);
  },
  renderCustomMetrics: (container: HTMLElement, step: any) => {
    renderDuplicateSubtreesCard2(container, step as DuplicateSubtreeStep);
  },
});
