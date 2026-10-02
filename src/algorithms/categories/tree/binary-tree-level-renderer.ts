/**
 * 二叉树层序遍历可视化器 (Binary Tree Level Order Traversal · LeetCode 102 / Class 036 Code01)
 * 采用顶级声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 * 融合旧版本输入交互与稳定树画布，融入左神 Class 036 讲义与四语言代码精准联动
 *
 * 多阶段演化体系 (Multi-Stage Evolution):
 *   Stage 1: 标准 Queue 队列逐层批处理 — 经典 size 快照划分，单队列 O(N) 时间与 O(W) 宽度
 *   Stage 2: 静态数组模拟队列 — 左神 Class 036 招牌极致优化，l/r 双指针与全局静态连续内存
 *   Stage 3: 哈希表辅助层级映射 — 左神 Class 036 基础对比组 (反面教材)，展示节点键值开销
 *   Stage 4: 递归 DFS 分层收集 — 深度优先前序遍历，按 depth 参数直接定位层级
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  BINARY_TREE_LEVEL_PROBLEM_HTML,
  BINARY_TREE_LEVEL_ANALYSIS_HTML,
} from './binary-tree-level-problem-content';
import {
  LEVEL_ORDER_STAGE1_CODE,
  LEVEL_ORDER_STAGE1_LINES,
  LEVEL_ORDER_STAGE2_CODE,
  LEVEL_ORDER_STAGE2_LINES,
  LEVEL_ORDER_STATIC_ARRAY_CODE,
  LEVEL_ORDER_STATIC_ARRAY_LINES,
  LEVEL_ORDER_HASH_MAP_CODE,
  LEVEL_ORDER_HASH_MAP_LINES,
} from './binary-tree-level-stage-codes';

// ============================================================
// 通用步骤与状态接口契约 (Domain Step Contract)
// ============================================================
export interface BTLStaticQueueState {
  array: (number | null)[];
  l: number;
  r: number;
  windowSize: number;
}

export interface BTLHashMapState {
  entries: { nodeVal: number; level: number }[];
  currentQueriedNode?: number | null;
  currentQueriedLevel?: number | null;
}

export interface BTLStep {
  tree: TreeNode | null;
  current: number | null;
  levelIndex: number;
  levelSize: number;
  queue: number[];
  currentLevel: number[];
  result: number[][];
  decision: string;
  action: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  scope?: Record<string, any>;
  metrics?: Record<string, string | number>;

  /** Stage 1 & 2 & 3: 辅助高亮节点 */
  secondaryNodes?: number[];
  visitedNodes?: number[];

  /** Stage 2 专属：静态数组队列状态 */
  staticQueueState?: BTLStaticQueueState;

  /** Stage 3 专属：哈希表层级状态 */
  hashMapState?: BTLHashMapState;

  /** Stage 4 专属：DFS 递归调用栈 */
  callStack?: string[];
  activeNodeId?: string;
  treeRoot?: any;
}

// ============================================================
// 表现层抽象复用组件 (Presentation Abstractions)
// ============================================================

/** 统一标准指标字典生成器 */
function makeMetrics(lvl: number, qLen: number, totalCols: number): Record<string, string | number> {
  return {
    'cur-level': `第 ${lvl} 层`,
    'queue-size': qLen,
    'total-collected': `${totalCols} 层`,
    'metric-cur-level': `第 ${lvl} 层`,
    'metric-queue-size': qLen,
    'metric-total-collected': `${totalCols} 层`,
  };
}

/** 统一外壳容器组件：包含缓冲器卡片与已收集层序结果集卡片（无缝对接顶层框架） */
function renderLevelOrderMetricsShell(step: BTLStep, bufferHtml: string): string {
  const layersHtml = step.result.length > 0
    ? step.result.map((layer, idx) => `
        <div style="display: flex; align-items: center; gap: 6px; padding: 2px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
          <span style="font-size: 10.5px; font-weight: 700; color: #166534;">第 ${idx} 层:</span>
          <span style="font-size: 11px; font-family: monospace; color: #15803d; font-weight: 600;">[${layer.join(', ')}]</span>
        </div>`).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待收集第一层...</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 10px; padding: 6px 0;">
      ${bufferHtml}
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
          <span>📦</span> 已收集层序结果集 ans:
        </span>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${layersHtml}
        </div>
      </div>
    </div>
  `;
}

/** 缓冲器呈现器 1：标准 FIFO 队列管道流 */
function renderQueueBufferHtml(queue: number[]): string {
  const chips = queue.length > 0
    ? queue.map((v, idx) => `
        <div style="display: flex; align-items: center;">
          <span style="padding: 3px 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>
          ${idx < queue.length - 1 ? '<span style="color: #94a3b8; font-size: 10px; margin: 0 4px;">➔</span>' : ''}
        </div>`).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空 (Empty)</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
        <span style="display: flex; align-items: center; gap: 4px;"><span>🥞</span> BFS 队列管道流 (队首 ➔ 队尾):</span>
        <span style="color: #2563eb; font-size: 10px; font-weight: 600;">当前大小: ${queue.length}</span>
      </span>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; min-height: 38px;">
        ${chips}
      </div>
    </div>
  `;
}

/** 缓冲器呈现器 2：静态数组模拟队列 (连续物理槽位 + l/r 双指针) */
function renderStaticArrayBufferHtml(state?: BTLStaticQueueState): string {
  if (!state) return '';
  const { array, l, r, windowSize } = state;
  const maxSlots = Math.min(array.length, 10);
  const slotsHtml = [];

  for (let i = 0; i < maxSlots; i++) {
    const val = array[i];
    const isL = i === l;
    const isR = i === r;
    const inWindow = i >= l && i < r;

    let bg = '#ffffff';
    let border = '#e2e8f0';
    let text = '#94a3b8';

    if (inWindow) {
      bg = '#dbeafe';
      border = '#3b82f6';
      text = '#1d4ed8';
    } else if (i < l) {
      bg = '#f1f5f9';
      border = '#cbd5e1';
      text = '#64748b';
    }

    slotsHtml.push(`
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <div style="font-size: 9px; font-family: monospace; color: #64748b;">[${i}]</div>
        <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${border}; border-radius: 6px; font-weight: 700; font-size: 12px; color: ${text}; font-family: monospace;">
          ${val != null ? val : '·'}
        </div>
        <div style="display: flex; gap: 2px; min-height: 14px;">
          ${isL ? '<span style="font-size: 9px; padding: 0 3px; background: #ef4444; color: #fff; border-radius: 3px; font-weight: 700;">l</span>' : ''}
          ${isR ? '<span style="font-size: 9px; padding: 0 3px; background: #10b981; color: #fff; border-radius: 3px; font-weight: 700;">r</span>' : ''}
        </div>
      </div>
    `);
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <div style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
        <span style="display: flex; align-items: center; gap: 4px;"><span>⚡</span> 静态数组 queue[MAXN] (l/r 双指针游标):</span>
        <span style="color: #059669; font-size: 10.5px; font-family: monospace; font-weight: 600;">size = r - l = ${r} - ${l} = ${windowSize}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; padding: 8px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; overflow-x: auto;">
        ${slotsHtml.join('')}
        ${array.length > maxSlots ? '<span style="color: #94a3b8; font-size: 11px; margin-left: 4px;">...</span>' : ''}
      </div>
    </div>
  `;
}

/** 缓冲器呈现器 3：哈希表键值映射表 (节点 ➔ 层号) */
function renderHashMapBufferHtml(state?: BTLHashMapState): string {
  if (!state) return '';
  const { entries, currentQueriedNode, currentQueriedLevel } = state;

  const chips = entries.length > 0
    ? entries.map((item) => {
        const isCurrent = item.nodeVal === currentQueriedNode;
        return `
          <div style="display: flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${isCurrent ? '#fef3c7' : '#ffffff'}; border: 1px solid ${isCurrent ? '#f59e0b' : '#e2e8f0'}; border-radius: 6px; font-size: 11px; font-family: monospace;">
            <span style="font-weight: 700; color: ${isCurrent ? '#b45309' : '#1e293b'};">Node(${item.nodeVal})</span>
            <span style="color: #94a3b8;">➔</span>
            <span style="color: #2563eb; font-weight: 600;">L${item.level}</span>
          </div>
        `;
      }).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">哈希表尚未填充</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <div style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
        <span style="display: flex; align-items: center; gap: 4px;"><span>🗺️</span> HashMap&lt;TreeNode, Integer&gt; 层级映射 (反面教材):</span>
        <span style="color: #ea580c; font-size: 10px; font-weight: 600;">键值数量: ${entries.length}</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; max-height: 100px; overflow-y: auto;">
        ${chips}
      </div>
    </div>
  `;
}

/** 缓冲器呈现器 4：DFS 递归调用栈 */
function renderDfsStackBufferHtml(callStack?: string[]): string {
  const stackHtml = callStack && callStack.length > 0
    ? callStack.map((entry, idx) => `
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 10px; color: #94a3b8; font-family: monospace; min-width: 18px; text-align: right;">${idx}</span>
          <span style="padding: 3px 8px; background: ${idx === callStack.length - 1 ? '#fef3c7' : '#f1f5f9'}; border: 1px solid ${idx === callStack.length - 1 ? '#f59e0b' : '#e2e8f0'}; color: ${idx === callStack.length - 1 ? '#92400e' : '#475569'}; border-radius: 6px; font-size: 11px; font-weight: 600; font-family: monospace;">${entry}</span>
        </div>`).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">调用栈为空</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
        <span>📚</span> DFS 递归调用栈 (栈底 → 栈顶):
      </span>
      <div style="display: flex; flex-direction: column; gap: 3px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; max-height: 120px; overflow-y: auto;">
        ${stackHtml}
      </div>
    </div>
  `;
}

// ============================================================
// Stage 1 步进生成器: 标准 Queue 逐层批处理 (LeetCode 102 / Class 036 基准)
// ============================================================
export function buildBTLSteps(root: TreeNode | null): BTLStep[] {
  const steps: BTLStep[] = [];
  const result: number[][] = [];
  const L = LEVEL_ORDER_STAGE2_LINES;

  // Step 0: 算法入口与空树边界特判
  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: [],
    metrics: makeMetrics(0, root ? 1 : 0, 0),
    decision: '函数入口：检查根节点状态',
    action: 'init',
    message: root ? `接收到二叉树，根节点值为 ${root.val}，准备初始化层序队列。` : '空树，直接返回空列表 []。',
    log: root ? `levelOrder(root: ${root.val})` : 'levelOrder(root: null) -> []',
    codeLine: root ? L.entry : L.empty,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      metrics: makeMetrics(0, 0, 0),
      decision: '特判返回：二叉树为空',
      action: 'done',
      message: '✅ 根节点为 null，层序遍历直接收敛返回 []。',
      log: 'if (root == null) -> true, return []',
      codeLine: L.empty,
    });
    return steps;
  }

  // Step 1: 根节点入队
  const queue: TreeNode[] = [root];
  steps.push({
    tree: root,
    current: root.val,
    levelIndex: 0,
    levelSize: 1,
    queue: [root.val],
    currentLevel: [],
    result: [],
    metrics: makeMetrics(0, 1, 0),
    decision: `根节点 ${root.val} 进队`,
    action: 'init',
    message: `初始化层序队列：将根节点 ${root.val} 压入队列头部，queue = [${root.val}]。`,
    log: `queue.offer(${root.val})`,
    codeLine: L.init,
  });

  let levelIdx = 0;

  while (queue.length > 0) {
    const size = queue.length;
    const currentLevel: number[] = [];
    const qSnapshot = queue.map((n) => n.val);

    // Step 2a: while 循环判定
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: [...qSnapshot],
      currentLevel: [],
      result: result.map((l) => [...l]),
      metrics: makeMetrics(levelIdx, size, result.length),
      decision: `while (!queue.isEmpty()) 判定成立`,
      action: 'start-level',
      message: `检测到队列非空 (包含 ${size} 个节点)，进入本轮层序处理循环。`,
      log: `while (!queue.isEmpty()): true (size=${size})`,
      codeLine: L.whileCondition,
    });

    // Step 2b: 锁定当前层大小
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: [...qSnapshot],
      currentLevel: [],
      result: result.map((l) => [...l]),
      metrics: makeMetrics(levelIdx, size, result.length),
      decision: `锁定第 ${levelIdx} 层规模 (int size = ${size})`,
      action: 'calc-size',
      message: `固定当前层大小 size = ${size}。即使后续子节点入队，本轮也仅处理这 ${size} 个节点。`,
      log: `int size = queue.size() -> ${size}`,
      codeLine: L.calcSize,
    });

    // Step 2c: 初始化当前层结果容器
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: [...qSnapshot],
      currentLevel: [],
      result: result.map((l) => [...l]),
      metrics: makeMetrics(levelIdx, size, result.length),
      decision: `初始化第 ${levelIdx} 层列表: level = new ArrayList<>()`,
      action: 'init-level',
      message: `新建列表容器，准备按从左到右顺序收集本层 ${size} 个节点的数值。`,
      log: `List<Integer> level = new ArrayList<>()`,
      codeLine: L.initLevel,
    });

    for (let i = 0; i < size; i++) {
      // Step 3a: for 循环条件检查 (成立)
      steps.push({
        tree: root,
        current: queue[0]?.val ?? null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: queue.map((n) => n.val),
        currentLevel: [...currentLevel],
        result: result.map((l) => [...l]),
        metrics: makeMetrics(levelIdx, queue.length, result.length),
        decision: `for 循环: 检查 i=${i} < size=${size} (成立)`,
        action: 'for-loop-check',
        message: `内层计数器 i=${i} 小于本层总数 size=${size}，开始处理当前层第 ${i + 1} 个节点。`,
        log: `for (int i=${i}; i < ${size}; i++) -> true`,
        codeLine: L.forLoopCheck,
      });

      const node = queue.shift()!;

      // Step 3b: 弹出队头节点
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: levelIdx,
        levelSize: size,
        queue: queue.map((n) => n.val),
        currentLevel: [...currentLevel],
        result: result.map((l) => [...l]),
        metrics: makeMetrics(levelIdx, queue.length, result.length),
        decision: `节点 ${node.val} 出队: node = queue.poll()`,
        action: 'poll-node',
        message: `从队列弹出队头节点 ${node.val}。`,
        log: `node = queue.poll() -> ${node.val}`,
        codeLine: L.pollNode,
      });

      // Step 3c: 收集节点值
      currentLevel.push(node.val);
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: levelIdx,
        levelSize: size,
        queue: queue.map((n) => n.val),
        currentLevel: [...currentLevel],
        result: result.map((l) => [...l]),
        metrics: makeMetrics(levelIdx, queue.length, result.length),
        decision: `收录节点值: level.add(${node.val})`,
        action: 'collect-val',
        message: `将节点 ${node.val} 的值存入第 ${levelIdx} 层列表：[${currentLevel.join(', ')}]。`,
        log: `level.add(${node.val}) -> [${currentLevel.join(', ')}]`,
        codeLine: L.collectVal,
      });

      // Step 3d: if (node.left != null) 左右孩子检查与入队
      if (node.left) {
        queue.push(node.left);
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: queue.map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((l) => [...l]),
          metrics: makeMetrics(levelIdx, queue.length, result.length),
          decision: `左孩子入队: queue.offer(${node.left.val})`,
          action: 'enqueue-left',
          message: `节点 ${node.val} 的左孩子 ${node.left.val} 压入队尾，成为下一层候选。`,
          log: `if (node.left != null) -> true, queue.offer(${node.left.val})`,
          codeLine: L.enqueueLeft,
        });
      } else {
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: queue.map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((l) => [...l]),
          metrics: makeMetrics(levelIdx, queue.length, result.length),
          decision: `左孩子为空: if (node.left != null) 为假，跳过入队`,
          action: 'check-left-null',
          message: `节点 ${node.val} 没有左孩子 (null)，跳过入队。`,
          log: `if (node.left != null) -> false (null)`,
          codeLine: L.checkLeftChild,
        });
      }

      if (node.right) {
        queue.push(node.right);
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: queue.map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((l) => [...l]),
          metrics: makeMetrics(levelIdx, queue.length, result.length),
          decision: `右孩子入队: queue.offer(${node.right.val})`,
          action: 'enqueue-right',
          message: `节点 ${node.val} 的右孩子 ${node.right.val} 压入队尾，成为下一层候选。`,
          log: `if (node.right != null) -> true, queue.offer(${node.right.val})`,
          codeLine: L.enqueueRight,
        });
      } else {
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: queue.map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((l) => [...l]),
          metrics: makeMetrics(levelIdx, queue.length, result.length),
          decision: `右孩子为空: if (node.right != null) 为假，跳过入队`,
          action: 'check-right-null',
          message: `节点 ${node.val} 没有右孩子 (null)，跳过入队。`,
          log: `if (node.right != null) -> false (null)`,
          codeLine: L.checkRightChild,
        });
      }
    }

    // Step 4a: for 循环退出判定 (i === size 为假，退出 for 循环)
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: queue.map((n) => n.val),
      currentLevel: [...currentLevel],
      result: result.map((l) => [...l]),
      metrics: makeMetrics(levelIdx, queue.length, result.length),
      decision: `for 循环结束: i=${size} < size=${size} (为假退出)`,
      action: 'for-loop-exit',
      message: `当前层所有 ${size} 个节点已全部遍历完毕，退出内层 for 循环。`,
      log: `for (int i=${size}; i < ${size}; i++) -> false, 循环结束`,
      codeLine: L.forLoopExit,
    });

    result.push([...currentLevel]);

    // Step 4b: 当前层收集完毕 ans.add(level)
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: queue.map((n) => n.val),
      currentLevel: [...currentLevel],
      result: result.map((l) => [...l]),
      metrics: makeMetrics(levelIdx, queue.length, result.length),
      decision: `第 ${levelIdx} 层收集完成: ans.add(level)`,
      action: 'end-level',
      message: `第 ${levelIdx} 层所有 ${size} 个节点已全部出队完成：[${currentLevel.join(', ')}]，追加至全局结果集 ans。`,
      log: `ans.add([${currentLevel.join(', ')}])`,
      codeLine: L.endLevel,
    });

    levelIdx++;
  }

  // Step 5: while 循环退出判定
  steps.push({
    tree: root,
    current: null,
    levelIndex: levelIdx,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: result.map((l) => [...l]),
    metrics: makeMetrics(levelIdx, 0, result.length),
    decision: 'while (!queue.isEmpty()) 为假，队列为空退出循环',
    action: 'while-exit',
    message: 'BFS 队列已空，所有层级节点处理完毕，退出 while 循环。',
    log: 'while (!queue.isEmpty()) -> false (empty)',
    codeLine: L.whileExit,
  });

  // Step 6: 收敛返回最终结果
  steps.push({
    tree: root,
    current: null,
    levelIndex: levelIdx,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: result.map((l) => [...l]),
    metrics: makeMetrics(levelIdx, 0, result.length),
    decision: '层序遍历全部完成',
    action: 'done',
    message: `🎉 层序遍历收敛结束！共收集 ${result.length} 层，返回最终二维数组: ${JSON.stringify(result)}。`,
    log: `return ans: ${JSON.stringify(result)}`,
    codeLine: L.done,
  });

  return steps;
}

// ============================================================
// Stage 2 步进生成器: 静态数组模拟队列 (Class 036 招牌极致优化)
// ============================================================
export function buildStaticArrayLevelOrderSteps(root: TreeNode | null): BTLStep[] {
  const steps: BTLStep[] = [];
  const result: number[][] = [];
  const L = LEVEL_ORDER_STATIC_ARRAY_LINES;

  // 模拟静态连续数组
  const staticArray: (TreeNode | null)[] = [];
  let l = 0;
  let r = 0;

  function getStaticQueueSnapshot(): BTLStaticQueueState {
    return {
      array: staticArray.map((n) => (n ? n.val : null)),
      l,
      r,
      windowSize: r - l,
    };
  }

  // Step 0: 入口
  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: [],
    staticQueueState: getStaticQueueSnapshot(),
    scope: { l: 0, r: 0, size: 0 },
    metrics: makeMetrics(0, root ? 1 : 0, 0),
    decision: '入口：levelOrder(root) — 静态数组队列模式',
    action: 'main-entry',
    message: root
      ? `接收到二叉树，根节点为 ${root.val}。采用左神 Class 036 招牌静态数组模拟队列加速。`
      : '空树，直接返回空列表 []。',
    log: root ? `levelOrder(root: ${root.val})` : 'levelOrder(root: null) -> []',
    codeLine: root ? L.entry : L.guardEmpty,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l: 0, r: 0, size: 0 },
      metrics: makeMetrics(0, 0, 0),
      decision: '空树特判返回',
      action: 'done',
      message: '✅ root 为空，直接返回 []。',
      log: 'if (root == null) -> true, return ans',
      codeLine: L.guardEmpty,
    });
    return steps;
  }

  // Step 1a: 双指针复位 l = r = 0
  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: [],
    staticQueueState: getStaticQueueSnapshot(),
    scope: { l: 0, r: 0, size: 0 },
    metrics: makeMetrics(0, 0, 0),
    decision: '重置静态数组指针: l = r = 0',
    action: 'init-pointers',
    message: '静态队列初始化：将头部读指针 l 与尾部写指针 r 重置为 0，建立空有效窗口 [0, 0)。',
    log: 'l = r = 0',
    codeLine: L.initPointers,
  });

  // Step 1b: 根节点写入队尾 queue[r++] = root
  staticArray[r++] = root;

  steps.push({
    tree: root,
    current: root.val,
    levelIndex: 0,
    levelSize: 1,
    queue: [root.val],
    currentLevel: [],
    result: [],
    staticQueueState: getStaticQueueSnapshot(),
    scope: { l: 0, r: 1, size: 1 },
    metrics: makeMetrics(0, 1, 0),
    decision: `根节点压入静态数组: queue[0] = ${root.val}, r 变为 1`,
    action: 'init-static-queue',
    message: `将根节点写入 queue[0]，写指针 r 推进变为 1。当前有效窗口为 [0, 1)。`,
    log: `queue[r++] = root (${root.val}), l=0, r=1`,
    codeLine: L.initQueue,
  });

  let levelIdx = 0;

  // 外层 while 循环
  while (l < r) {
    const size = r - l;
    const currentLevel: number[] = [];

    // Step 2a: while (l < r) 循环判定（成立）
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: staticArray.slice(l, r).map((n) => n!.val),
      currentLevel: [],
      result: result.map((x) => [...x]),
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l, r, size },
      metrics: makeMetrics(levelIdx, size, result.length),
      decision: `while (l < r) 成立 [l=${l}, r=${r})，开始处理第 ${levelIdx} 层`,
      action: 'while-check',
      message: `读写指针尚未相遇 (l=${l} < r=${r})，静态队列内有待处理节点，进入本层循环。`,
      log: `while (l < r): ${l} < ${r} (true)`,
      codeLine: L.whileCondition,
    });

    // Step 2b: int size = r - l; 锁定当前层大小
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: staticArray.slice(l, r).map((n) => n!.val),
      currentLevel: [],
      result: result.map((x) => [...x]),
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l, r, size },
      metrics: makeMetrics(levelIdx, size, result.length),
      decision: `锁定本层大小: size = r - l = ${r} - ${l} = ${size}`,
      action: 'calc-size',
      message: `指针区间有效 [l=${l}, r=${r})，计算当前层节点总数 size = ${size}。准备在连续内存中推进 l 指针。`,
      log: `int size = r - l -> ${size}`,
      codeLine: L.calcSize,
    });

    // Step 2c: 初始化当前层结果容器 List<Integer> list = new ArrayList<>();
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: staticArray.slice(l, r).map((n) => n!.val),
      currentLevel: [],
      result: result.map((x) => [...x]),
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l, r, size },
      metrics: makeMetrics(levelIdx, size, result.length),
      decision: `初始化第 ${levelIdx} 层列表: list = new ArrayList<>()`,
      action: 'init-level',
      message: `为第 ${levelIdx} 层分配容器 list，准备按序收集本层节点数值。`,
      log: `List<Integer> list = new ArrayList<>()`,
      codeLine: L.initLevel,
    });

    // 内层 for 循环
    for (let i = 0; i < size; i++) {
      // Step 3a: for (int i = 0; i < size; i++) 循环判定（成立）
      steps.push({
        tree: root,
        current: staticArray[l]?.val ?? null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: staticArray.slice(l, r).map((n) => n!.val),
        currentLevel: [...currentLevel],
        result: result.map((x) => [...x]),
        staticQueueState: getStaticQueueSnapshot(),
        scope: { l, r, size, i },
        metrics: makeMetrics(levelIdx, r - l, result.length),
        decision: `for 循环: 检查 i=${i} < size=${size} (成立)`,
        action: 'for-loop-check',
        message: `内层计数器 i=${i} 小于本层总数 size=${size}，开始处理当前层的第 ${i + 1} 个节点。`,
        log: `for (int i=${i}; i < ${size}; i++) -> true`,
        codeLine: L.forLoopCheck,
      });

      // Step 3b: TreeNode cur = queue[l++]; 出队
      const cur = staticArray[l++]!;
      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: levelIdx,
        levelSize: size,
        queue: staticArray.slice(l, r).map((n) => n!.val),
        currentLevel: [...currentLevel],
        result: result.map((x) => [...x]),
        staticQueueState: getStaticQueueSnapshot(),
        scope: { l: l - 1, r, size, cur: cur.val, i },
        metrics: makeMetrics(levelIdx, r - l, result.length),
        decision: `出队: cur = queue[${l - 1}] (${cur.val})，l 推进到 ${l}`,
        action: 'poll-node',
        message: `从连续内存槽位 [${l - 1}] 读取节点 ${cur.val}，读指针 l 向前滑动至 ${l}。`,
        log: `cur = queue[${l - 1}] (${cur.val}), l=${l}`,
        codeLine: L.pollNode,
      });

      // Step 3c: list.add(cur.val); 写入当前层列表
      currentLevel.push(cur.val);
      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: levelIdx,
        levelSize: size,
        queue: staticArray.slice(l, r).map((n) => n!.val),
        currentLevel: [...currentLevel],
        result: result.map((x) => [...x]),
        staticQueueState: getStaticQueueSnapshot(),
        scope: { l, r, size, cur: cur.val, i },
        metrics: makeMetrics(levelIdx, r - l, result.length),
        decision: `收集数值: list.add(${cur.val})`,
        action: 'collect-val',
        message: `将节点 ${cur.val} 的值存入本层列表：[${currentLevel.join(', ')}]。`,
        log: `list.add(${cur.val}) -> [${currentLevel.join(', ')}]`,
        codeLine: L.collectVal,
      });

      // Step 3d: if (cur.left != null) 左孩子检查与入队
      if (cur.left) {
        staticArray[r++] = cur.left;
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: staticArray.slice(l, r).map((n) => n!.val),
          currentLevel: [...currentLevel],
          result: result.map((x) => [...x]),
          staticQueueState: getStaticQueueSnapshot(),
          scope: { l, r, size, cur: cur.val },
          metrics: makeMetrics(levelIdx, r - l, result.length),
          decision: `左孩子存在: if (cur.left != null) 成立，queue[${r - 1}] = ${cur.left.val}`,
          action: 'enqueue-left',
          message: `节点 ${cur.val} 的左孩子 ${cur.left.val} 写入槽位 [${r - 1}]，写指针 r 推进至 ${r}。`,
          log: `if (cur.left != null) -> true, queue[r++] = ${cur.left.val} (r=${r})`,
          codeLine: L.enqueueLeft,
        });
      } else {
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: staticArray.slice(l, r).map((n) => n!.val),
          currentLevel: [...currentLevel],
          result: result.map((x) => [...x]),
          staticQueueState: getStaticQueueSnapshot(),
          scope: { l, r, size, cur: cur.val },
          metrics: makeMetrics(levelIdx, r - l, result.length),
          decision: `左孩子为空: if (cur.left != null) 为假，跳过入队`,
          action: 'check-left-null',
          message: `节点 ${cur.val} 没有左孩子 (null)，跳过左孩子入队。`,
          log: `if (cur.left != null) -> false (null)`,
          codeLine: L.checkLeftChild,
        });
      }

      // Step 3e: if (cur.right != null) 右孩子检查与入队
      if (cur.right) {
        staticArray[r++] = cur.right;
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: staticArray.slice(l, r).map((n) => n!.val),
          currentLevel: [...currentLevel],
          result: result.map((x) => [...x]),
          staticQueueState: getStaticQueueSnapshot(),
          scope: { l, r, size, cur: cur.val },
          metrics: makeMetrics(levelIdx, r - l, result.length),
          decision: `右孩子存在: if (cur.right != null) 成立，queue[${r - 1}] = ${cur.right.val}`,
          action: 'enqueue-right',
          message: `节点 ${cur.val} 的右孩子 ${cur.right.val} 写入槽位 [${r - 1}]，写指针 r 推进至 ${r}。`,
          log: `if (cur.right != null) -> true, queue[r++] = ${cur.right.val} (r=${r})`,
          codeLine: L.enqueueRight,
        });
      } else {
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: staticArray.slice(l, r).map((n) => n!.val),
          currentLevel: [...currentLevel],
          result: result.map((x) => [...x]),
          staticQueueState: getStaticQueueSnapshot(),
          scope: { l, r, size, cur: cur.val },
          metrics: makeMetrics(levelIdx, r - l, result.length),
          decision: `右孩子为空: if (cur.right != null) 为假，跳过入队`,
          action: 'check-right-null',
          message: `节点 ${cur.val} 没有右孩子 (null)，跳过右孩子入队。`,
          log: `if (cur.right != null) -> false (null)`,
          codeLine: L.checkRightChild,
        });
      }
    }

    // Step 4a: for 循环结束判定 (i === size 为假，退出 for 循环)
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: staticArray.slice(l, r).map((n) => n!.val),
      currentLevel: [...currentLevel],
      result: result.map((x) => [...x]),
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l, r, size, i: size },
      metrics: makeMetrics(levelIdx, r - l, result.length),
      decision: `for 循环结束: i=${size} < size=${size} (为假退出)`,
      action: 'for-loop-exit',
      message: `当前层所有 ${size} 个节点已全部遍历完毕，退出内层 for 循环。`,
      log: `for (int i=${size}; i < ${size}; i++) -> false, 循环结束`,
      codeLine: L.forLoopExit,
    });

    // Step 4b: ans.add(list); 本层收集落盘
    result.push([...currentLevel]);
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: staticArray.slice(l, r).map((n) => n!.val),
      currentLevel: [...currentLevel],
      result: result.map((x) => [...x]),
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l, r, size },
      metrics: makeMetrics(levelIdx, r - l, result.length),
      decision: `第 ${levelIdx} 层收集完成: ans.add(list)`,
      action: 'end-level',
      message: `第 ${levelIdx} 层收集完成：[${currentLevel.join(', ')}]，追加至全局结果集 ans。`,
      log: `ans.add([${currentLevel.join(', ')}])`,
      codeLine: L.endLevel,
    });

    levelIdx++;
  }

  // Step 5: while (l < r) 收敛退出判定（l === r 为假退出）
  steps.push({
    tree: root,
    current: null,
    levelIndex: levelIdx,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: result.map((x) => [...x]),
    staticQueueState: getStaticQueueSnapshot(),
    scope: { l, r, size: 0 },
    metrics: makeMetrics(levelIdx, 0, result.length),
    decision: `while (l < r) 退出判定: l=${l} < r=${r} 为假`,
    action: 'while-exit',
    message: `读写指针相遇 (l === r === ${l})，静态数组内已无未处理节点，退出 while 循环。`,
    log: `while (l < r): ${l} < ${r} -> false, 队列为空退出`,
    codeLine: L.whileExit,
  });

  // Final Step: return ans;
  steps.push({
    tree: root,
    current: null,
    levelIndex: levelIdx,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: result.map((x) => [...x]),
    staticQueueState: getStaticQueueSnapshot(),
    scope: { l, r, size: 0 },
    metrics: makeMetrics(levelIdx, 0, result.length),
    decision: '静态数组层序遍历收敛完成',
    action: 'done',
    message: `🎉 静态数组模拟队列全部出队完毕 (l === r === ${l})！返回结果集: ${JSON.stringify(result)}。`,
    log: `return ans: ${JSON.stringify(result)}`,
    codeLine: L.done,
  });

  return steps;
}

// ============================================================
// Stage 3 步进生成器: 哈希表辅助层级映射 (Class 036 基础对比 / 初学误区)
// ============================================================
export function buildHashMapLevelOrderSteps(root: TreeNode | null): BTLStep[] {
  const steps: BTLStep[] = [];
  const result: number[][] = [];
  const L = LEVEL_ORDER_HASH_MAP_LINES;

  const queue: TreeNode[] = [];
  const levels = new Map<TreeNode, number>();
  const mapEntries: { nodeVal: number; level: number }[] = [];

  function getHashMapSnapshot(currentQueriedNode?: number | null, currentQueriedLevel?: number | null): BTLHashMapState {
    return {
      entries: [...mapEntries],
      currentQueriedNode,
      currentQueriedLevel,
    };
  }

  // Step 0: 入口
  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: [],
    hashMapState: getHashMapSnapshot(),
    metrics: makeMetrics(0, root ? 1 : 0, 0),
    decision: '入口：levelOrder(root) — 哈希表辅助模式',
    action: 'main-entry',
    message: root
      ? `接收到二叉树，根节点为 ${root.val}。采用新手常见的 Queue + HashMap 记录层级映射。`
      : '空树，直接返回空列表 []。',
    log: root ? `levelOrder(root: ${root.val})` : 'levelOrder(root: null) -> []',
    codeLine: root ? L.entry : L.guardEmpty,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      hashMapState: getHashMapSnapshot(),
      metrics: makeMetrics(0, 0, 0),
      decision: '空树特判返回',
      action: 'done',
      message: '✅ root 为空，直接返回 []。',
      log: 'if (root == null) -> true, return ans',
      codeLine: L.guardEmpty,
    });
    return steps;
  }

  // Step 1a: 根节点入队 queue.add(root)
  queue.push(root);
  steps.push({
    tree: root,
    current: root.val,
    levelIndex: 0,
    levelSize: 1,
    queue: [root.val],
    currentLevel: [],
    result: [],
    hashMapState: getHashMapSnapshot(),
    metrics: makeMetrics(0, 1, 0),
    decision: `根节点入队: queue.add(${root.val})`,
    action: 'init-queue',
    message: `将根节点 ${root.val} 压入队列头部，queue = [${root.val}]。`,
    log: `queue.add(${root.val})`,
    codeLine: L.initQueue,
  });

  // Step 1b: 记录根节点初始层级 levels.put(root, 0)
  levels.set(root, 0);
  mapEntries.push({ nodeVal: root.val, level: 0 });

  steps.push({
    tree: root,
    current: root.val,
    levelIndex: 0,
    levelSize: 1,
    queue: [root.val],
    currentLevel: [],
    result: [],
    hashMapState: getHashMapSnapshot(root.val, 0),
    metrics: makeMetrics(0, 1, 0),
    decision: `记录根节点层级: levels.put(${root.val}, 0)`,
    action: 'init-map',
    message: `在哈希表中绑定根节点深度映射：${root.val} ➔ 0。`,
    log: `levels.put(${root.val}, 0)`,
    codeLine: L.initLevelMap,
  });

  while (queue.length > 0) {
    // Step 2: while 循环头检查
    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: queue.length,
      queue: queue.map((n) => n.val),
      currentLevel: [],
      result: result.map((x) => [...x]),
      hashMapState: getHashMapSnapshot(),
      metrics: makeMetrics(result.length, queue.length, result.length),
      decision: `while (!queue.isEmpty()) 成立，队列尚余 ${queue.length} 个节点`,
      action: 'while-check',
      message: `队列非空，准备弹出一个节点并通过哈希表反查其层级。`,
      log: `while (!queue.isEmpty()): true (size=${queue.length})`,
      codeLine: L.whileCondition,
    });

    const cur = queue.shift()!;

    // Step 3: 出队
    steps.push({
      tree: root,
      current: cur.val,
      levelIndex: 0,
      levelSize: queue.length,
      queue: queue.map((n) => n.val),
      currentLevel: [],
      result: result.map((x) => [...x]),
      hashMapState: getHashMapSnapshot(cur.val),
      metrics: makeMetrics(result.length, queue.length, result.length),
      decision: `从队列弹出节点 cur = ${cur.val}`,
      action: 'poll-node',
      message: `弹出节点 ${cur.val}，接下来必须在哈希表中寻找其所属层级。`,
      log: `cur = queue.poll() -> ${cur.val}`,
      codeLine: L.pollNode,
    });

    // Step 4: 查哈希表获取 level
    const level = levels.get(cur)!;

    steps.push({
      tree: root,
      current: cur.val,
      levelIndex: level,
      levelSize: queue.length,
      queue: queue.map((n) => n.val),
      currentLevel: [],
      result: result.map((x) => [...x]),
      hashMapState: getHashMapSnapshot(cur.val, level),
      metrics: makeMetrics(level, queue.length, result.length),
      decision: `查表: int level = levels.get(${cur.val}) -> ${level}`,
      action: 'query-level',
      message: `从 HashMap 中命中节点 ${cur.val} 的层级为 ${level}。左神指出：每次出队都要查哈希表，效率显著逊色于按层快照！`,
      log: `levels.get(${cur.val}) -> ${level}`,
      codeLine: L.queryLevel,
    });

    // Step 5: 检查是否需要新建层
    if (result.length === level) {
      result.push([]);
      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(cur.val, level),
        metrics: makeMetrics(level, queue.length, result.length),
        decision: `ans.size() == ${level}，新建第 ${level} 层列表`,
        action: 'new-level',
        message: `结果集层数恰等于当前节点层级 ${level}，创建新的空列表准备收录。`,
        log: `ans.add(new ArrayList<>()) // 第 ${level} 层`,
        codeLine: L.checkNewLevel,
      });
    }

    // Step 6: 加入对应层
    result[level].push(cur.val);

    steps.push({
      tree: root,
      current: cur.val,
      levelIndex: level,
      levelSize: queue.length,
      queue: queue.map((n) => n.val),
      currentLevel: [...result[level]],
      result: result.map((x) => [...x]),
      hashMapState: getHashMapSnapshot(cur.val, level),
      metrics: makeMetrics(level, queue.length, result.length),
      decision: `ans.get(${level}).add(${cur.val})`,
      action: 'add-val',
      message: `将节点 ${cur.val} 追加到第 ${level} 层列表，当前第 ${level} 层为 [${result[level].join(', ')}]。`,
      log: `ans.get(${level}).add(${cur.val})`,
      codeLine: L.addVal,
    });

    // Step 7: 左右孩子入队并写入 levels
    if (cur.left) {
      queue.push(cur.left);
      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [...result[level]],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(cur.left.val),
        metrics: makeMetrics(level, queue.length, result.length),
        decision: `左孩子入队: queue.add(${cur.left.val})`,
        action: 'enqueue-left',
        message: `将左孩子 ${cur.left.val} 压入队列。`,
        log: `if (cur.left != null) -> true, queue.add(${cur.left.val})`,
        codeLine: L.enqueueLeft,
      });

      levels.set(cur.left, level + 1);
      mapEntries.push({ nodeVal: cur.left.val, level: level + 1 });
      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [...result[level]],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(cur.left.val, level + 1),
        metrics: makeMetrics(level, queue.length, result.length),
        decision: `记录左孩子层级: levels.put(${cur.left.val}, ${level + 1})`,
        action: 'record-left-level',
        message: `在哈希表中追加记录左孩子映射: ${cur.left.val} ➔ ${level + 1}。`,
        log: `levels.put(${cur.left.val}, ${level + 1})`,
        codeLine: L.recordLeftLevel,
      });
    } else {
      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [...result[level]],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(cur.val, level),
        metrics: makeMetrics(level, queue.length, result.length),
        decision: '左孩子为空: if (cur.left != null) 为假',
        action: 'check-left-null',
        message: `节点 ${cur.val} 没有左孩子 (null)，跳过入队。`,
        log: 'if (cur.left != null) -> false (null)',
        codeLine: L.checkLeftChild,
      });
    }

    if (cur.right) {
      queue.push(cur.right);
      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [...result[level]],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(cur.right.val),
        metrics: makeMetrics(level, queue.length, result.length),
        decision: `右孩子入队: queue.add(${cur.right.val})`,
        action: 'enqueue-right',
        message: `将右孩子 ${cur.right.val} 压入队列。`,
        log: `if (cur.right != null) -> true, queue.add(${cur.right.val})`,
        codeLine: L.enqueueRight,
      });

      levels.set(cur.right, level + 1);
      mapEntries.push({ nodeVal: cur.right.val, level: level + 1 });
      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [...result[level]],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(cur.right.val, level + 1),
        metrics: makeMetrics(level, queue.length, result.length),
        decision: `记录右孩子层级: levels.put(${cur.right.val}, ${level + 1})`,
        action: 'record-right-level',
        message: `在哈希表中追加记录右孩子映射: ${cur.right.val} ➔ ${level + 1}。`,
        log: `levels.put(${cur.right.val}, ${level + 1})`,
        codeLine: L.recordRightLevel,
      });
    } else {
      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [...result[level]],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(cur.val, level),
        metrics: makeMetrics(level, queue.length, result.length),
        decision: '右孩子为空: if (cur.right != null) 为假',
        action: 'check-right-null',
        message: `节点 ${cur.val} 没有右孩子 (null)，跳过入队。`,
        log: 'if (cur.right != null) -> false (null)',
        codeLine: L.checkRightChild,
      });
    }
  }

  // Step 8: while 循环退出
  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: result.map((x) => [...x]),
    hashMapState: getHashMapSnapshot(),
    metrics: makeMetrics(result.length, 0, result.length),
    decision: 'while (!queue.isEmpty()) 为假，队列为空退出循环',
    action: 'while-exit',
    message: '哈希表辅助队列已空，退出 while 循环。',
    log: 'while (!queue.isEmpty()) -> false (empty)',
    codeLine: L.whileExit,
  });

  // Final Step: 收尾完成
  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: result.map((x) => [...x]),
    hashMapState: getHashMapSnapshot(),
    metrics: makeMetrics(result.length, 0, result.length),
    decision: '哈希表层序遍历完成',
    action: 'done',
    message: `🎉 遍历完成！哈希表共记录了 ${mapEntries.length} 次键值映射，返回二维结果集: ${JSON.stringify(result)}。`,
    log: `return ans: ${JSON.stringify(result)}`,
    codeLine: L.done,
  });

  return steps;
}

// ============================================================
// Stage 4 步进生成器: 递归 DFS 分层收集
// ============================================================
interface DFSRecursionNode {
  id: string;
  label: string;
  children: DFSRecursionNode[];
  edgeLabel?: string;
  status?: 'active' | 'done' | 'pruned';
  tag?: string;
}

export function buildDFSLevelOrderSteps(root: TreeNode | null): BTLStep[] {
  const steps: BTLStep[] = [];
  const result: number[][] = [];
  const callStack: string[] = [];
  const L = LEVEL_ORDER_STAGE1_LINES;

  let recursionTree: DFSRecursionNode | null = null;
  const nodeMap = new Map<string, DFSRecursionNode>();

  function getTreeSnapshot(): DFSRecursionNode | null {
    if (!recursionTree) return null;
    return JSON.parse(JSON.stringify(recursionTree));
  }

  // Step 0: 主函数入口
  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: [],
    callStack: [],
    metrics: makeMetrics(0, 0, 0),
    decision: '主函数入口：levelOrder(root)',
    action: 'main-entry',
    message: root
      ? `接收到二叉树，根节点值为 ${root.val}，准备通过递归 DFS 逐层收集节点。`
      : '空树，直接返回空列表 []。',
    log: root ? `levelOrder(root: ${root.val})` : 'levelOrder(root: null) -> []',
    codeLine: L.mainEntry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      callStack: [],
      metrics: makeMetrics(0, 0, 0),
      decision: '空树直接返回',
      action: 'done',
      message: '✅ 根节点为 null，直接返回空列表 []。',
      log: 'return []',
      codeLine: L.returnRes,
    });
    return steps;
  }

  // Step 1: 初始化结果集
  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: [],
    callStack: [],
    metrics: makeMetrics(0, 0, 0),
    decision: '初始化结果集 res = []',
    action: 'init-res',
    message: '声明空的二维列表 res，准备按 depth 分层收集节点值。',
    log: 'List<List<Integer>> res = new ArrayList<>()',
    codeLine: L.initRes,
  });

  let callCounter = 0;

  function dfs(node: TreeNode | null, depth: number, parentId: string | null, direction: string): void {
    callCounter++;
    const callId = `call-${callCounter}`;
    const nodeLabel = node ? `${node.val}` : 'null';
    const stackEntry = `dfs(${nodeLabel}, ${depth})`;

    const treeNode: DFSRecursionNode = {
      id: callId,
      label: node ? `dfs(${node.val}, ${depth})` : `dfs(null, ${depth})`,
      children: [],
      edgeLabel: direction,
      status: 'active',
    };
    nodeMap.set(callId, treeNode);

    if (!recursionTree) {
      recursionTree = treeNode;
    } else if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId)!.children.push(treeNode);
    }

    callStack.push(stackEntry);

    // DFS 函数入口帧
    steps.push({
      tree: root,
      current: node?.val ?? null,
      levelIndex: depth,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: result.map((l) => [...l]),
      callStack: [...callStack],
      activeNodeId: callId,
      treeRoot: getTreeSnapshot(),
      metrics: makeMetrics(depth, callStack.length, result.length),
      decision: `📥 进入 dfs(node=${nodeLabel}, depth=${depth})`,
      action: 'dfs-entry',
      message: `递归进入 dfs(node=${nodeLabel}, depth=${depth})${direction ? `，来自父节点的${direction}` : ''}。`,
      log: `📥 进入 ${stackEntry} [调用 #${callCounter}]`,
      codeLine: L.dfsEntry,
    });

    // Null guard
    if (!node) {
      steps.push({
        tree: root,
        current: null,
        levelIndex: depth,
        levelSize: 0,
        queue: [],
        currentLevel: [],
        result: result.map((l) => [...l]),
        callStack: [...callStack],
        activeNodeId: callId,
        treeRoot: getTreeSnapshot(),
        metrics: makeMetrics(depth, callStack.length, result.length),
        decision: `🛑 空节点拦截：node == null`,
        action: 'null-guard',
        message: `node 为 null，触发基底条件，立即返回。`,
        log: `🛑 null guard -> return`,
        codeLine: L.nullGuard,
      });

      treeNode.status = 'pruned';
      treeNode.tag = 'null';
      callStack.pop();
      return;
    }

    // Check if need to add new level
    if (depth === result.length) {
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: depth,
        levelSize: 0,
        queue: [],
        currentLevel: [],
        result: result.map((l) => [...l]),
        callStack: [...callStack],
        activeNodeId: callId,
        treeRoot: getTreeSnapshot(),
        metrics: makeMetrics(depth, callStack.length, result.length),
        decision: `depth(${depth}) == res.size(${result.length})，需要创建新层`,
        action: 'depth-check-new',
        message: `当前深度 ${depth} 等于结果集层数 ${result.length}，说明首次到达该层，创建新的空列表。`,
        log: `if (depth == res.size()) -> true, 新建第 ${depth} 层`,
        codeLine: L.depthCheck,
      });

      result.push([]);

      steps.push({
        tree: root,
        current: node.val,
        levelIndex: depth,
        levelSize: 0,
        queue: [],
        currentLevel: [],
        result: result.map((l) => [...l]),
        callStack: [...callStack],
        activeNodeId: callId,
        treeRoot: getTreeSnapshot(),
        metrics: makeMetrics(depth, callStack.length, result.length),
        decision: `创建第 ${depth} 层空列表`,
        action: 'new-level',
        message: `成功创建第 ${depth} 层：res = ${JSON.stringify(result)}。`,
        log: `res.add(new ArrayList<>()) // 第 ${depth} 层`,
        codeLine: L.newLevel,
      });
    } else {
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: depth,
        levelSize: 0,
        queue: [],
        currentLevel: [],
        result: result.map((l) => [...l]),
        callStack: [...callStack],
        activeNodeId: callId,
        treeRoot: getTreeSnapshot(),
        metrics: makeMetrics(depth, callStack.length, result.length),
        decision: `depth(${depth}) < res.size(${result.length})，第 ${depth} 层已存在`,
        action: 'depth-check-exist',
        message: `当前深度 ${depth} 小于结果集层数 ${result.length}，该层列表已存在，直接追加。`,
        log: `if (depth == res.size()) -> false, 第 ${depth} 层已存在`,
        codeLine: L.depthCheck,
      });
    }

    result[depth].push(node.val);

    steps.push({
      tree: root,
      current: node.val,
      levelIndex: depth,
      levelSize: 0,
      queue: [],
      currentLevel: [...result[depth]],
      result: result.map((l) => [...l]),
      callStack: [...callStack],
      activeNodeId: callId,
      treeRoot: getTreeSnapshot(),
      metrics: makeMetrics(depth, callStack.length, result.length),
      decision: `节点 ${node.val} 装入第 ${depth} 层`,
      action: 'add-val',
      message: `将节点值 ${node.val} 追加到第 ${depth} 层列表：[${result[depth].join(', ')}]。`,
      log: `res.get(${depth}).add(${node.val}) -> [${result[depth].join(', ')}]`,
      codeLine: L.addVal,
    });

    const leftLabel = node.left ? `${node.left.val}` : 'null';
    steps.push({
      tree: root,
      current: node.val,
      levelIndex: depth,
      levelSize: 0,
      queue: [],
      currentLevel: [...result[depth]],
      result: result.map((l) => [...l]),
      callStack: [...callStack],
      activeNodeId: callId,
      treeRoot: getTreeSnapshot(),
      metrics: makeMetrics(depth, callStack.length, result.length),
      decision: `🌳 探索左子树 dfs(${leftLabel}, ${depth + 1})`,
      action: 'dfs-left-call',
      message: `从节点 ${node.val} 出发，递归探索左子树：dfs(node.left=${leftLabel}, depth=${depth + 1})。`,
      log: `⬇️ 调用 dfs(${leftLabel}, ${depth + 1}) // 左子树`,
      codeLine: L.dfsLeft,
    });

    dfs(node.left, depth + 1, callId, '左子树');

    const rightLabel = node.right ? `${node.right.val}` : 'null';
    steps.push({
      tree: root,
      current: node.val,
      levelIndex: depth,
      levelSize: 0,
      queue: [],
      currentLevel: [...result[depth]],
      result: result.map((l) => [...l]),
      callStack: [...callStack],
      activeNodeId: callId,
      treeRoot: getTreeSnapshot(),
      metrics: makeMetrics(depth, callStack.length, result.length),
      decision: `🌳 探索右子树 dfs(${rightLabel}, ${depth + 1})`,
      action: 'dfs-right-call',
      message: `从节点 ${node.val} 出发，递归探索右子树：dfs(node.right=${rightLabel}, depth=${depth + 1})。`,
      log: `➡️ 调用 dfs(${rightLabel}, ${depth + 1}) // 右子树`,
      codeLine: L.dfsRight,
    });

    dfs(node.right, depth + 1, callId, '右子树');

    treeNode.status = 'done';
    treeNode.tag = `✓`;
    callStack.pop();
  }

  // Step 2: 启动 DFS
  steps.push({
    tree: root,
    current: root.val,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: [],
    callStack: [],
    metrics: makeMetrics(0, 0, 0),
    decision: '调用 dfs(root, 0, res) 启动递归',
    action: 'call-dfs',
    message: `从根节点 ${root.val} 出发，以 depth=0 启动递归 DFS 分层收集。`,
    log: `dfs(root=${root.val}, 0, res)`,
    codeLine: L.callDfs,
  });

  dfs(root, 0, null, '');

  // Final: 收敛返回
  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: result.map((l) => [...l]),
    callStack: [],
    treeRoot: getTreeSnapshot(),
    metrics: makeMetrics(result.length, 0, result.length),
    decision: '递归 DFS 遍历全部完成',
    action: 'done',
    message: `🎉 递归 DFS 层序收集完成！共收集 ${result.length} 层，返回最终二维数组: ${JSON.stringify(result)}。`,
    log: `return res: ${JSON.stringify(result)}`,
    codeLine: L.returnRes,
  });

  return steps;
}

// ============================================================
// 画布渲染适配 (Tree Canvas Renderers)
// ============================================================
function renderTreeCanvasForStep(container: HTMLElement, step: BTLStep, primaryColor: string = '#fbbf24'): void {
  // 收集全量已完成访问的节点集合（包含此前所有层收集的结果与当前层已录入结果）
  const collected = new Set<number>([
    ...step.result.flat(),
    ...step.currentLevel,
    ...(step.visitedNodes || []),
  ]);

  // 如果当前步骤有处于活跃焦点的节点，从已完成集合中排除以确保呈现活跃主高亮
  if (step.current != null) {
    collected.delete(step.current);
  }

  // 待访问队列中的节点（如果在队列中，不作为已访问呈现）
  const queueSet = new Set<number>(step.queue || []);
  queueSet.forEach((val) => {
    if (step.current !== val) {
      collected.delete(val);
    }
  });

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.current,
    secondaryHighlightedNodes: step.queue,
    visitedNodes: Array.from(collected),
    primaryColor,
    secondaryColor: '#60a5fa', // 队列待访问蓝色
    visitedColor: '#34d399',   // 当前层已访问绿色，并在最后几步和收敛完成态持续常驻保持！
  });
}

// ============================================================
// 输入参数解析辅助
// ============================================================
function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 9, 20, null, null, 15, 7';
  const arr = parseTreeArray(raw, [3, 9, 20, null, null, 15, 7]);
  return buildTree(arr);
}

// ============================================================
// 声明式算法注册 — 4 阶段完整演化体系 (Class 036 集大成者)
// ============================================================
export const binaryTreeLevelVisualizer = registerDeclarativeAlgorithm<BTLStep>({
  id: 'binary-tree-level',
  aliases: ['tree-036-level-order'],
  name: '二叉树的层序遍历',
  category: 'tree',
  icon: '🥞',
  badge: {
    mode: 'BFS 队列逐层收集',
    complexity: 'O(n) · O(w)',
  },
  card1Title: '📊 二叉树拓扑与遍历沙盘',
  card2Title: '🧭 遍历状态与分层结果监视器',
  card2Desc: '当前处理节点、缓冲数据结构与已收集层序二维数组',
  legend: [
    { label: '当前活跃节点', color: '#fbbf24' },
    { label: '当前层已访问', color: '#34d399' },
    { label: '队列待访问', color: '#60a5fa' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      width: '180px',
      placeholder: '3, 9, 20, null...',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1 (标准平衡树)',
      values: { 'input-tree': '3, 9, 20, null, null, 15, 7' },
      description: '经典分层二叉树',
    },
    {
      label: '满二叉树 (3层完备)',
      values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7' },
      description: '每层节点全部饱满',
    },
    {
      label: '单链左倾斜树',
      values: { 'input-tree': '1, 2, null, 3, null, 4' },
      description: '退化为单链表，每层仅一个节点',
    },
    {
      label: '轴对称二叉树',
      values: { 'input-tree': '1, 2, 2, 3, 4, 4, 3' },
      description: '左右子树严格对称',
    },
    {
      label: '单节点二叉树',
      values: { 'input-tree': '1' },
      description: '仅包含根节点',
    },
  ],
  metrics: [
    { id: 'cur-level', label: '当前所在层', color: '#2563eb' },
    { id: 'queue-size', label: 'BFS 队列大小', color: '#f59e0b' },
    { id: 'total-collected', label: '已收集层数', color: '#16a34a' },
  ],
  problemHtml: BINARY_TREE_LEVEL_PROBLEM_HTML,
  analysisHtml: BINARY_TREE_LEVEL_ANALYSIS_HTML,

  // ========================
  // 多阶段演化配置 (Class 036 四段式体系)
  // ========================
  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 标准 Queue 队列',
      shortName: 'Queue队列',
      num: 1,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '层序遍历 · Queue 队列逐层出队',
        complexity: 'O(n) · O(w) 队列宽度',
      },
      card1Title: '📊 二叉树拓扑与 BFS 遍历沙盘',
      card2Title: '🧭 标准 FIFO 队列与分层结果监视器',
      codeLanguages: LEVEL_ORDER_STAGE2_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildBTLSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: BTLStep) => renderTreeCanvasForStep(container, step, '#fbbf24'),
      renderCustomMetrics: (container: HTMLElement, step: BTLStep) => {
        container.innerHTML = renderLevelOrderMetricsShell(step, renderQueueBufferHtml(step.queue));
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 哈希表记录层级 (新手对比)',
      shortName: '哈希表对比',
      num: 2,
      timeBadge: 'O(n) · 劣质',
      theme: 'bg-purple' as const,
      badge: {
        mode: '层序遍历 · Queue + HashMap 映射',
        complexity: 'O(n) · O(n) 常数较大',
      },
      card1Title: '🗺️ 二叉树拓扑与哈希表映射沙盘',
      card2Title: '⚠️ HashMap&lt;TreeNode, Integer&gt; 状态监视器',
      codeLanguages: LEVEL_ORDER_HASH_MAP_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildHashMapLevelOrderSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: BTLStep) => renderTreeCanvasForStep(container, step, '#c084fc'),
      renderCustomMetrics: (container: HTMLElement, step: BTLStep) => {
        container.innerHTML = renderLevelOrderMetricsShell(step, renderHashMapBufferHtml(step.hashMapState));
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 静态数组模拟队列 (Class 036)',
      shortName: '静态数组',
      num: 3,
      timeBadge: 'O(n) · 零GC',
      theme: 'bg-blue' as const,
      badge: {
        mode: '层序遍历 · 静态数组双指针模拟队列',
        complexity: 'O(n) · O(w) 常数极优',
      },
      card1Title: '⚡ 静态数组模拟队列拓扑沙盘',
      card2Title: '🏎️ 连续内存 queue[MAXN] 与 l/r 双指针监视器',
      codeLanguages: LEVEL_ORDER_STATIC_ARRAY_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildStaticArrayLevelOrderSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: BTLStep) => renderTreeCanvasForStep(container, step, '#38bdf8'),
      renderCustomMetrics: (container: HTMLElement, step: BTLStep) => {
        container.innerHTML = renderLevelOrderMetricsShell(step, renderStaticArrayBufferHtml(step.staticQueueState));
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 递归 DFS 分层收集',
      shortName: '递归DFS',
      num: 4,
      timeBadge: 'O(n) · O(h)',
      theme: 'bg-amber' as const,
      badge: {
        mode: '层序遍历 · 递归 DFS 深度映射',
        complexity: 'O(n) · O(h) 栈深',
      },
      card1Title: '🌳 二叉树拓扑与 DFS 递归探索沙盘',
      card2Title: '📚 DFS 递归调用栈与分层收集监视器',
      codeLanguages: LEVEL_ORDER_STAGE1_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildDFSLevelOrderSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: BTLStep) => renderTreeCanvasForStep(container, step, '#f97316'),
      renderCustomMetrics: (container: HTMLElement, step: BTLStep) => {
        container.innerHTML = renderLevelOrderMetricsShell(step, renderDfsStackBufferHtml(step.callStack));
      },
    },
  ],

  // Legacy fallback: 向后兼容
  codeLanguages: LEVEL_ORDER_STAGE2_CODE,
  generateSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildBTLSteps(root);
  },
  buildSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildBTLSteps(root);
  },
  renderCanvas: (container, step) => {
    renderTreeCanvasForStep(container, step, '#fbbf24');

    const root = container.closest('#algo-binary-tree-level-view') || container.parentElement;
    if (root) {
      const lvlEl = root.querySelector('#metric-cur-level');
      const qEl = root.querySelector('#metric-queue-size');
      const totEl = root.querySelector('#metric-total-collected');

      if (lvlEl) lvlEl.textContent = `第 ${step.levelIndex} 层`;
      if (qEl) qEl.textContent = `${step.queue.length}`;
      if (totEl) totEl.textContent = `${step.result.length} 层`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = renderLevelOrderMetricsShell(step, renderQueueBufferHtml(step.queue));
      }
    }
  },
});