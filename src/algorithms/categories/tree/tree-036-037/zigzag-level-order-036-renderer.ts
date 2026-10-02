/**
 * 二叉树锯齿形层序遍历可视化器 (Zigzag Level Order Traversal · LeetCode 103 / Class 036 Code02)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 *
 * 核心多阶段演化体系 (Multi-Stage Evolution):
 *   Stage 1: 标准双端队列 / isReverse 标志法 (Queue + Deque/isReverse flag · 经典 BFS 出队解耦)
 *   Stage 2: 静态数组模拟队列 (Static Array Queue · 左神 Class 036 招牌双向读指针极致优化，零 GC 连续内存)
 *   Stage 3: 递归 DFS 深度映射分层收集 (Depth-Indexed DFS with level % 2 collection · 深度与广度对偶)
 */

import { parseTreeArray } from '../../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from '../tree-template';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
  renderQueuePipeline,
} from './tree-036-037-shared';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  ZIGZAG_STAGE1_CODE,
  ZIGZAG_STAGE1_LINES,
  ZIGZAG_STAGE2_STATIC_ARRAY_CODE,
  ZIGZAG_STAGE2_STATIC_ARRAY_LINES,
  ZIGZAG_STAGE3_DFS_CODE,
  ZIGZAG_STAGE3_DFS_LINES,
} from './zigzag-level-order-036-stage-codes';

// ============================================================
// 通用步骤与状态接口契约 (Domain Step Contract)
// ============================================================
export interface ZigzagStaticQueueState {
  array: (number | null)[];
  l: number;
  r: number;
  windowSize: number;
  isReverse: boolean;
  readingIndex?: number;
}

export interface ZigzagStep {
  tree: TreeNode | null;
  current: number | null;
  levelIndex: number;
  levelSize: number;
  isReverse: boolean;
  queue: number[];
  currentLevel: number[];
  result: number[][];
  decision: string;
  action: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };

  /** 辅助高亮节点 */
  secondaryNodes?: number[];
  visitedNodes?: number[];

  /** Stage 2 专属：静态连续内存队列状态 */
  staticQueueState?: ZigzagStaticQueueState;

  /** Stage 3 专属：DFS 递归调用栈 */
  callStack?: string[];

  // Legacy Tree036Step 兼容
  activeNodeId?: number | null;
  secondaryNodeId?: number | null;
  extraData?: Record<string, any>;
}

// ============================================================
// 表现层辅助呈现组件 (Presentation Helpers)
// ============================================================
function makeZigzagMetrics(lvl: number, qLen: number, totalCols: number, isRev: boolean): Record<string, string | number> {
  return {
    'cur-level': `第 ${lvl} 层`,
    'queue-size': qLen,
    'total-collected': `${totalCols} 层`,
    'current-dir': isRev ? '从右向左 ⬅️' : '从左向右 ➡️',
    'metric-cur-level': `第 ${lvl} 层`,
    'metric-queue-size': qLen,
    'metric-total-collected': `${totalCols} 层`,
  };
}

/** 统一外壳容器组件：包含缓冲器卡片与已收集锯齿折返层序结果集 */
function renderZigzagMetricsShell(step: ZigzagStep, bufferHtml: string): string {
  const layersHtml = step.result.length > 0
    ? step.result.map((layer, idx) => {
        const isOdd = idx % 2 === 1;
        return `
        <div style="display: flex; align-items: center; gap: 6px; padding: 2px 8px; background: ${isOdd ? '#eff6ff' : '#f0fdf4'}; border: 1px solid ${isOdd ? '#bfdbfe' : '#bbf7d0'}; border-radius: 6px;">
          <span style="font-size: 10.5px; font-weight: 700; color: ${isOdd ? '#1e40af' : '#166534'};">第 ${idx} 层 (${isOdd ? '⬅️ 逆序' : '➡️ 顺序'}):</span>
          <span style="font-size: 11px; font-family: monospace; color: ${isOdd ? '#2563eb' : '#15803d'}; font-weight: 600;">[${layer.join(', ')}]</span>
        </div>`;
      }).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待收集第一层...</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 10px; padding: 6px 0;">
      ${bufferHtml}
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
          <span>📦</span> 锯齿折返结果集 ans (之字形交替):
        </span>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${layersHtml}
        </div>
      </div>
    </div>
  `;
}

/** 缓冲器 1：Stage 1 标准队列与双端收集缓冲区 */
function renderStage1BufferHtml(queue: number[], currentLevel: number[], isReverse: boolean): string {
  const qChips = queue.length > 0
    ? queue.map((v) => `<span style="padding: 2px 7px; background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600;">${v}</span>`).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空</span>';

  const levelChips = currentLevel.length > 0
    ? currentLevel.map((v) => `<span style="padding: 2px 7px; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600;">${v}</span>`).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">本层尚无收集</span>';

  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
          <span>🥞</span> FIFO 主队列 (左 ➔ 右):
        </span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 32px; align-items: center;">
          ${qChips}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
          <span>🔄</span> 本层双端收集 (方向: ${isReverse ? '<span style="color:#dc2626;font-weight:700;">⬅️ 头插 addFirst</span>' : '<span style="color:#16a34a;font-weight:700;">➡️ 尾插 addLast</span>'}):
        </span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 32px; align-items: center;">
          ${levelChips}
        </div>
      </div>
    </div>
  `;
}

/** 缓冲器 2：Stage 2 静态连续数组 queue[MAXN] 与 l/r 双指针监视器 */
function renderStage2BufferHtml(state?: ZigzagStaticQueueState): string {
  if (!state) return '';
  const { array, l, r, isReverse, readingIndex } = state;
  const maxDisplay = Math.max(r + 2, 8);
  const cells: string[] = [];

  for (let i = 0; i < maxDisplay; i++) {
    const val = i < array.length ? array[i] : null;
    const isInside = i >= l && i < r;
    const isCurrentRead = readingIndex !== undefined && i === readingIndex;
    const isL = i === l;
    const isR = i === r;

    let bg = '#ffffff';
    let borderColor = '#e2e8f0';
    let textColor = '#64748b';

    if (isCurrentRead) {
      bg = '#fef3c7';
      borderColor = '#f59e0b';
      textColor = '#b45309';
    } else if (isInside) {
      bg = '#e0f2fe';
      borderColor = '#7dd3fc';
      textColor = '#0369a1';
    }

    const pointerTags: string[] = [];
    if (isL) pointerTags.push('<span style="color:#ea580c;font-weight:800;">l</span>');
    if (isR) pointerTags.push('<span style="color:#2563eb;font-weight:800;">r</span>');

    cells.push(`
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 32px;">
        <div style="height: 14px; font-size: 9.5px; font-weight: 700; font-family: monospace;">
          ${pointerTags.join('/')}
        </div>
        <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${borderColor}; border-radius: 6px; font-size: 11.5px; font-family: monospace; font-weight: 700; color: ${textColor};">
          ${val !== null && val !== undefined ? val : '—'}
        </div>
        <div style="font-size: 9px; color: #94a3b8; font-family: monospace; margin-top: 1px;">
          [${i}]
        </div>
      </div>
    `);
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <div style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
        <span style="display: flex; align-items: center; gap: 4px;"><span>🏎️</span> 静态数组 queue[MAXN] 连续内存 (Class 036 招牌零 GC):</span>
        <span style="color: #0284c7; font-size: 10px; font-weight: 600;">
          [l=${l}, r=${r}) 窗口大小: ${r - l} | 读取方向: ${isReverse ? '⬅️ 逆序从 r-1 倒扫到 l' : '➡️ 顺序从 l 顺扫到 r-1'}
        </span>
      </div>
      <div style="display: flex; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; overflow-x: auto;">
        ${cells.join('')}
      </div>
    </div>
  `;
}

/** 缓冲器 3：Stage 3 DFS 递归调用栈 */
function renderStage3BufferHtml(callStack?: string[]): string {
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
        <span>📚</span> DFS 递归调用栈 (深度映射: 奇数层头插 / 偶数层尾插):
      </span>
      <div style="display: flex; flex-direction: column; gap: 3px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; max-height: 120px; overflow-y: auto;">
        ${stackHtml}
      </div>
    </div>
  `;
}

/** 统一画布渲染 */
function renderZigzagCanvasForStep(container: HTMLElement, step: ZigzagStep, primaryColor: string = '#fbbf24'): void {
  const collected = new Set<number>([
    ...step.result.flat(),
    ...(step.visitedNodes || []),
  ]);

  if (step.current != null) {
    collected.delete(step.current);
  }

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
    secondaryColor: '#60a5fa',
    visitedColor: '#34d399',
  });
}

// ============================================================
// Stage 1: 标准双端队列 / isReverse 标志法 (Queue + Deque BFS)
// ============================================================
export function buildZigzagQueueSteps(root: TreeNode | null): ZigzagStep[] {
  const steps: ZigzagStep[] = [];
  const result: number[][] = [];
  const L = ZIGZAG_STAGE1_LINES;

  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    isReverse: false,
    queue: [],
    currentLevel: [],
    result: [],
    metrics: makeZigzagMetrics(0, root ? 1 : 0, 0, false),
    decision: '算法启动：检查根节点状态',
    action: 'init',
    message: root
      ? `接收到二叉树，根节点为 ${root.val}。初始化 Queue 并设置方向标志 isReverse = false (首层从左到右)。`
      : '空树，直接返回空结果 []。',
    log: root ? `zigzagLevelOrder(root: ${root.val}), isReverse = false` : 'zigzagLevelOrder(root: null) -> []',
    codeLine: root ? L.entry : L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      isReverse: false,
      queue: [],
      currentLevel: [],
      result: [],
      metrics: makeZigzagMetrics(0, 0, 0, false),
      decision: '特判返回：树为空',
      action: 'done',
      message: '✅ 树为空，直接收敛返回 []。',
      log: 'if (root == null) return []',
      codeLine: L.entry,
    });
    return steps;
  }

  const queue: TreeNode[] = [root];
  let isReverse = false;
  let levelIdx = 0;

  steps.push({
    tree: root,
    current: root.val,
    levelIndex: 0,
    levelSize: 1,
    isReverse: false,
    queue: [root.val],
    currentLevel: [],
    result: [],
    metrics: makeZigzagMetrics(0, 1, 0, false),
    decision: '根节点入队',
    action: 'offer',
    message: `根节点 ${root.val} 入队，初始方向为从左至右 (isReverse = false)。`,
    log: `queue.offer(${root.val})`,
    codeLine: L.initQueue,
  });

  while (queue.length > 0) {
    const size = queue.length;
    const currentLevel: number[] = [];
    levelIdx++;

    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      isReverse,
      queue: queue.map((n) => n.val),
      currentLevel: [],
      result: result.map((r) => [...r]),
      metrics: makeZigzagMetrics(levelIdx, size, result.length, isReverse),
      decision: `锁定第 ${levelIdx - 1} 层 (大小: ${size})，方向: ${isReverse ? '从右向左 ⬅️' : '从左向右 ➡️'}`,
      action: 'snapshot',
      message: `第 ${levelIdx - 1} 层固定含有 ${size} 个节点，收集方向: ${isReverse ? '【从右向左 (addFirst)】' : '【从左向右 (addLast)】'}。`,
      log: `while(!queue.isEmpty()): level=${levelIdx - 1}, size=${size}, isReverse=${isReverse}`,
      codeLine: L.loopLevel,
    });

    for (let i = 0; i < size; i++) {
      const cur = queue.shift()!;

      if (!isReverse) {
        currentLevel.push(cur.val);
      } else {
        currentLevel.unshift(cur.val);
      }

      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: levelIdx,
        levelSize: size,
        isReverse,
        queue: queue.map((n) => n.val),
        currentLevel: [...currentLevel],
        result: result.map((r) => [...r]),
        metrics: makeZigzagMetrics(levelIdx, queue.length, result.length, isReverse),
        decision: `弹出节点 ${cur.val} 并${isReverse ? '头插' : '尾插'}收集`,
        action: 'poll-collect',
        message: `从队列头部弹出节点 ${cur.val}，根据方向执行 ${isReverse ? 'addFirst(头插)' : 'addLast(尾插)'}，当前层内容: [${currentLevel.join(', ')}]。`,
        log: `${isReverse ? 'level.addFirst' : 'level.addLast'}(${cur.val})`,
        codeLine: isReverse ? L.collectAddFirst : L.collectAddLast,
      });

      if (cur.left) {
        queue.push(cur.left);
      }
      if (cur.right) {
        queue.push(cur.right);
      }

      if (cur.left || cur.right) {
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: levelIdx,
          levelSize: size,
          isReverse,
          queue: queue.map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((r) => [...r]),
          metrics: makeZigzagMetrics(levelIdx, queue.length, result.length, isReverse),
          decision: `节点 ${cur.val} 左右子节点正常入队`,
          action: 'push-children',
          message: `节点 ${cur.val} 的子节点${cur.left ? ` 左(${cur.left.val})` : ''}${cur.right ? ` 右(${cur.right.val})` : ''} 依然严格保持从左到右入队，下一层拓扑结构不受当前收集方向影响。`,
          log: `queue.offer children of ${cur.val}`,
          codeLine: L.pushChildren,
        });
      }
    }

    result.push([...currentLevel]);
    isReverse = !isReverse;

    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: 0,
      isReverse,
      queue: queue.map((n) => n.val),
      currentLevel: [],
      result: result.map((r) => [...r]),
      metrics: makeZigzagMetrics(levelIdx, queue.length, result.length, isReverse),
      decision: `第 ${levelIdx - 1} 层收集完成，反转方向`,
      action: 'toggle-reverse',
      message: `第 ${levelIdx - 1} 层完成: [${currentLevel.join(', ')}] 入账！翻转方向标志 isReverse 切换为 ${isReverse} (下一层为 ${isReverse ? '从右向左 ⬅️' : '从左向右 ➡️'})。`,
      log: `ans.add(level); isReverse = !isReverse -> ${isReverse}`,
      codeLine: L.reverseToggle,
    });
  }

  steps.push({
    tree: root,
    current: null,
    levelIndex: levelIdx,
    levelSize: 0,
    isReverse,
    queue: [],
    currentLevel: [],
    result: result.map((r) => [...r]),
    metrics: makeZigzagMetrics(levelIdx, 0, result.length, isReverse),
    decision: '锯齿形层序遍历完成',
    action: 'done',
    message: `🎉 锯齿形层序遍历圆满完成！共收集 ${result.length} 层之字形结果: ${JSON.stringify(result)}。`,
    log: `return ans: ${JSON.stringify(result)}`,
    codeLine: L.returnAns,
  });

  return steps;
}

// ============================================================
// Stage 2: 静态数组模拟队列 (Class 036 招牌双向读指针极致优化)
// ============================================================
export function buildZigzagStaticArraySteps(root: TreeNode | null): ZigzagStep[] {
  const steps: ZigzagStep[] = [];
  const result: number[][] = [];
  const L = ZIGZAG_STAGE2_STATIC_ARRAY_LINES;

  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    isReverse: false,
    queue: [],
    currentLevel: [],
    result: [],
    staticQueueState: { array: [], l: 0, r: 0, windowSize: 0, isReverse: false },
    metrics: makeZigzagMetrics(0, root ? 1 : 0, 0, false),
    decision: '静态数组初始化：分配连续内存',
    action: 'init',
    message: root
      ? `左神 Class 036 极致优化：使用连续内存 queue[MAXN] 与双指针 l=0, r=0。直接在连续内存上根据方向双向读取！`
      : '空树特判，直接返回 []。',
    log: root ? `staticQueue: l=0, r=0, MAXN=2001` : 'root == null -> []',
    codeLine: L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      isReverse: false,
      queue: [],
      currentLevel: [],
      result: [],
      staticQueueState: { array: [], l: 0, r: 0, windowSize: 0, isReverse: false },
      metrics: makeZigzagMetrics(0, 0, 0, false),
      decision: '特判返回：树为空',
      action: 'done',
      message: '✅ 树为空，直接收敛返回 []。',
      log: 'if (root == null) return []',
      codeLine: L.entry,
    });
    return steps;
  }

  const staticArray: TreeNode[] = [];
  let l = 0;
  let r = 0;
  staticArray[r++] = root;
  let isReverse = false;
  let levelIdx = 0;

  steps.push({
    tree: root,
    current: root.val,
    levelIndex: 0,
    levelSize: 1,
    isReverse: false,
    queue: [root.val],
    currentLevel: [],
    result: [],
    staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: 1, isReverse: false },
    metrics: makeZigzagMetrics(0, 1, 0, false),
    decision: '根节点写入连续内存 queue[0]',
    action: 'push-static',
    message: `根节点 ${root.val} 写入 queue[r++] (l=0, r=1)，零 GC 分配！`,
    log: `queue[r++] = root(val: ${root.val}), l=0, r=1`,
    codeLine: L.initPointers,
  });

  while (l < r) {
    const size = r - l;
    const currentLevel: number[] = [];
    levelIdx++;

    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      isReverse,
      queue: staticArray.slice(l, r).map((n) => n.val),
      currentLevel: [],
      result: result.map((arr) => [...arr]),
      staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: size, isReverse },
      metrics: makeZigzagMetrics(levelIdx, size, result.length, isReverse),
      decision: `第 ${levelIdx - 1} 层窗口锁定 [l=${l}, r=${r})，大小 ${size}`,
      action: 'lock-window',
      message: `连续内存窗口锁定 [${l}, ${r})，包含 ${size} 个节点。读取策略: ${isReverse ? '【逆序读取 i: r-1 ➔ l】' : '【顺序读取 i: l ➔ r-1】'}，无需额外 Deque！`,
      log: `while(l < r): l=${l}, r=${r}, size=${size}, isReverse=${isReverse}`,
      codeLine: L.loopLevel,
    });

    // 根据反向标志直接在静态连续数组上进行顺向或逆向切片收集
    if (!isReverse) {
      for (let i = l; i < l + size; i++) {
        const val = staticArray[i].val;
        currentLevel.push(val);
        steps.push({
          tree: root,
          current: val,
          levelIndex: levelIdx,
          levelSize: size,
          isReverse,
          queue: staticArray.slice(l, r).map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((arr) => [...arr]),
          staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: size, isReverse, readingIndex: i },
          metrics: makeZigzagMetrics(levelIdx, size, result.length, isReverse),
          decision: `顺向读取 queue[${i}] = ${val}`,
          action: 'forward-read',
          message: `isReverse = false: 顺向指针移动到 index=${i}，直接读取数值 ${val} 加入当前层。`,
          log: `for(i=l..l+size): queue[${i}]=${val}`,
          codeLine: L.forwardCollect,
        });
      }
    } else {
      for (let i = l + size - 1; i >= l; i--) {
        const val = staticArray[i].val;
        currentLevel.push(val);
        steps.push({
          tree: root,
          current: val,
          levelIndex: levelIdx,
          levelSize: size,
          isReverse,
          queue: staticArray.slice(l, r).map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((arr) => [...arr]),
          staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: size, isReverse, readingIndex: i },
          metrics: makeZigzagMetrics(levelIdx, size, result.length, isReverse),
          decision: `逆向读取 queue[${i}] = ${val}`,
          action: 'backward-read',
          message: `isReverse = true: 逆向指针从末尾倒扫到 index=${i}，直接读取数值 ${val} 加入当前层（完全消除 Deque.addFirst 的数组搬移）！`,
          log: `for(i=l+size-1..l): queue[${i}]=${val}`,
          codeLine: L.backwardCollect,
        });
      }
    }

    // 下一层孩子节点依次入队
    for (let i = 0; i < size; i++) {
      const node = staticArray[l++];
      const pushLeft = node.left;
      const pushRight = node.right;

      if (pushLeft) {
        staticArray[r++] = pushLeft;
      }
      if (pushRight) {
        staticArray[r++] = pushRight;
      }

      if (pushLeft || pushRight) {
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: levelIdx,
          levelSize: size,
          isReverse,
          queue: staticArray.slice(l, r).map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((arr) => [...arr]),
          staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l, isReverse },
          metrics: makeZigzagMetrics(levelIdx, r - l, result.length, isReverse),
          decision: `节点 ${node.val} 出窗 (l++), 子节点入连续内存 (r++)`,
          action: 'advance-pointers',
          message: `node = queue[l++] (${node.val}) 弹出窗口。子节点${pushLeft ? ` 左(${pushLeft.val})` : ''}${pushRight ? ` 右(${pushRight.val})` : ''} 写入末尾 queue[r++]，更新后 l=${l}, r=${r}。`,
          log: `l++ -> ${l}, r updated to ${r}`,
          codeLine: L.pushChildren,
        });
      }
    }

    result.push([...currentLevel]);
    isReverse = !isReverse;

    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: 0,
      isReverse,
      queue: staticArray.slice(l, r).map((n) => n.val),
      currentLevel: [],
      result: result.map((arr) => [...arr]),
      staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l, isReverse },
      metrics: makeZigzagMetrics(levelIdx, r - l, result.length, isReverse),
      decision: `第 ${levelIdx - 1} 层收集完成，反转方向`,
      action: 'toggle-reverse',
      message: `第 ${levelIdx - 1} 层收集完成！翻转方向标志 isReverse = ${isReverse}。下一层窗口为 [${l}, ${r})。`,
      log: `ans.add(level); isReverse = !isReverse -> ${isReverse}`,
      codeLine: L.reverseToggle,
    });
  }

  steps.push({
    tree: root,
    current: null,
    levelIndex: levelIdx,
    levelSize: 0,
    isReverse,
    queue: [],
    currentLevel: [],
    result: result.map((arr) => [...arr]),
    staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: 0, isReverse },
    metrics: makeZigzagMetrics(levelIdx, 0, result.length, isReverse),
    decision: '静态数组锯齿形层序遍历完成',
    action: 'done',
    message: `🎉 静态数组模拟队列遍历完成！l=${l}, r=${r}，双指针完全闭合，共收集 ${result.length} 层: ${JSON.stringify(result)}。`,
    log: `return ans: ${JSON.stringify(result)}`,
    codeLine: L.returnAns,
  });

  return steps;
}

// ============================================================
// Stage 3: 递归 DFS 深度映射分层收集 (Depth-Indexed DFS)
// ============================================================
export function buildZigzagDfsSteps(root: TreeNode | null): ZigzagStep[] {
  const steps: ZigzagStep[] = [];
  const result: number[][] = [];
  const callStack: string[] = [];
  const L = ZIGZAG_STAGE3_DFS_LINES;

  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    isReverse: false,
    queue: [],
    currentLevel: [],
    result: [],
    callStack: ['dfs(root, 0, ans)'],
    metrics: makeZigzagMetrics(0, 0, 0, false),
    decision: 'DFS 递归分层启动：前序遍历深度映射',
    action: 'init',
    message: root
      ? `启动递归 DFS：通过函数参数 level 记录深度。当 level == ans.size() 时创建新层，偶数层尾插、奇数层头插！`
      : '空树特判，直接返回空结果 []。',
    log: root ? `dfs(root: ${root.val}, level: 0)` : 'dfs(root: null) -> []',
    codeLine: L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      isReverse: false,
      queue: [],
      currentLevel: [],
      result: [],
      callStack: [],
      metrics: makeZigzagMetrics(0, 0, 0, false),
      decision: '特判返回：树为空',
      action: 'done',
      message: '✅ 树为空，直接收敛返回 []。',
      log: 'root == null -> return []',
      codeLine: L.entry,
    });
    return steps;
  }

  function dfs(node: TreeNode | null, level: number): void {
    if (!node) {
      steps.push({
        tree: root,
        current: null,
        levelIndex: level,
        levelSize: 0,
        isReverse: level % 2 === 1,
        queue: [],
        currentLevel: [],
        result: result.map((r) => [...r]),
        callStack: [...callStack, `dfs(null, ${level})`],
        metrics: makeZigzagMetrics(level, 0, result.length, level % 2 === 1),
        decision: `到达空节点 null，直接返回`,
        action: 'base-case',
        message: `node 为 null，触发递归基（Base Case），返回上一层调用栈。`,
        log: `dfs(null, ${level}) -> return`,
        codeLine: L.dfsBase,
      });
      return;
    }

    callStack.push(`dfs(${node.val}, L${level})`);

    // 发现全新层
    if (level === result.length) {
      result.push([]);
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: level,
        levelSize: 1,
        isReverse: level % 2 === 1,
        queue: [],
        currentLevel: [],
        result: result.map((r) => [...r]),
        callStack: [...callStack],
        metrics: makeZigzagMetrics(level, 0, result.length, level % 2 === 1),
        decision: `发现第 ${level} 层首个节点，初始化新层`,
        action: 'new-layer',
        message: `level (${level}) == ans.size() (${result.length - 1})，创建第 ${level} 层列表。`,
        log: `ans.add(new LinkedList<>()); // level ${level}`,
        codeLine: L.newLevel,
      });
    }

    const isOdd = level % 2 === 1;
    if (!isOdd) {
      result[level].push(node.val);
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: level,
        levelSize: result[level].length,
        isReverse: false,
        queue: [],
        currentLevel: [...result[level]],
        result: result.map((r) => [...r]),
        callStack: [...callStack],
        metrics: makeZigzagMetrics(level, 0, result.length, false),
        decision: `偶数层 ${level} 顺序收集: 尾插 ${node.val}`,
        action: 'even-collect',
        message: `level ${level} 为偶数 (从左到右 ➡️)，执行 ans[${level}].addLast(${node.val})。当前层: [${result[level].join(', ')}]。`,
        log: `ans.get(${level}).addLast(${node.val})`,
        codeLine: L.evenCollect,
      });
    } else {
      result[level].unshift(node.val);
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: level,
        levelSize: result[level].length,
        isReverse: true,
        queue: [],
        currentLevel: [...result[level]],
        result: result.map((r) => [...r]),
        callStack: [...callStack],
        metrics: makeZigzagMetrics(level, 0, result.length, true),
        decision: `奇数层 ${level} 逆序收集: 头插 ${node.val}`,
        action: 'odd-collect',
        message: `level ${level} 为奇数 (从右向左 ⬅️)，执行 ans[${level}].addFirst(${node.val})。当前层: [${result[level].join(', ')}]。`,
        log: `ans.get(${level}).addFirst(${node.val})`,
        codeLine: L.oddCollect,
      });
    }

    // 递归左子树
    if (node.left) {
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: level,
        levelSize: result[level].length,
        isReverse: isOdd,
        queue: [],
        currentLevel: [...result[level]],
        result: result.map((r) => [...r]),
        callStack: [...callStack],
        metrics: makeZigzagMetrics(level, 0, result.length, isOdd),
        decision: `递归探索左子树 ${node.left.val} (level + 1)`,
        action: 'recur-left',
        message: `深入节点 ${node.val} 的左子树 ${node.left.val}，深度参数递增为 level = ${level + 1}。`,
        log: `dfs(${node.left.val}, ${level + 1})`,
        codeLine: L.recurLeft,
      });
    }
    dfs(node.left, level + 1);

    // 递归右子树
    if (node.right) {
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: level,
        levelSize: result[level].length,
        isReverse: isOdd,
        queue: [],
        currentLevel: [...result[level]],
        result: result.map((r) => [...r]),
        callStack: [...callStack],
        metrics: makeZigzagMetrics(level, 0, result.length, isOdd),
        decision: `递归探索右子树 ${node.right.val} (level + 1)`,
        action: 'recur-right',
        message: `深入节点 ${node.val} 的右子树 ${node.right.val}，深度参数递增为 level = ${level + 1}。`,
        log: `dfs(${node.right.val}, ${level + 1})`,
        codeLine: L.recurRight,
      });
    }
    dfs(node.right, level + 1);

    callStack.pop();
  }

  dfs(root, 0);

  steps.push({
    tree: root,
    current: null,
    levelIndex: result.length,
    levelSize: 0,
    isReverse: false,
    queue: [],
    currentLevel: [],
    result: result.map((r) => [...r]),
    callStack: [],
    metrics: makeZigzagMetrics(result.length, 0, result.length, false),
    decision: '递归 DFS 锯齿形层序遍历完成',
    action: 'done',
    message: `🎉 DFS 递归收集全部完成！递归深度自动映射出完整之字形结果: ${JSON.stringify(result)}。`,
    log: `return ans: ${JSON.stringify(result)}`,
    codeLine: L.returnAns,
  });

  return steps;
}

// ============================================================
// 输入参数解析辅助
// ============================================================
function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['tree'] || inputs?.['input-tree'] || '3, 9, 20, null, null, 15, 7';
  const arr = parseTreeArray(raw, [3, 9, 20, null, null, 15, 7]);
  return buildTree(arr);
}

// ============================================================
// Legacy 向后兼容导出 (供 tree-036-037.test.ts 直接断言)
// ============================================================
const DEFAULT_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3 },
  { id: 2, val: 9, left: null, right: null },
  { id: 3, val: 20, left: 4, right: 5 },
  { id: 4, val: 15, left: null, right: null },
  { id: 5, val: 7, left: null, right: null },
];

export function buildZigzag036Steps(treeRaw?: string): Tree036Step[] {
  const root = parseAndBuild({ tree: treeRaw });
  const modernSteps = buildZigzagQueueSteps(root);

  // 转换为 Tree036Step 格式兼容现有单测
  return modernSteps.map((s) => ({
    codeLine: s.codeLine as any,
    decision: s.decision,
    message: s.message,
    log: s.log,
    activeNodeId: s.current,
    queue: s.queue.filter((v): v is number => v !== null),
    metrics: s.metrics as any,
    statusBadge: s.decision.includes('完成')
      ? { text: '完成', type: 'success' }
      : { text: s.action, type: 'info' },
    extraData: { treeNodes: DEFAULT_TREE_NODES },
  }));
}

function renderLegacyZigzagCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || DEFAULT_TREE_NODES;
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px; gap: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
      ${step.queue ? renderQueuePipeline(step.queue, '主层序队列 (保持左->右)') : ''}
    </div>
  `;
}

// ============================================================
// 声明式算法注册 — 3 阶段完整演化体系 (Class 036 Code02 集大成者)
// ============================================================
export const zigzagLevelOrder036Visualizer = registerDeclarativeAlgorithm<ZigzagStep>({
  id: 'tree-036-zigzag-level-order',
  name: '二叉树锯齿形层序遍历 (Class 036)',
  aliases: ['zigzag-level-order', 'binary-tree-zigzag-level-order-traversal', 'leetcode-103'],
  category: 'tree',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 3602,
  learningGoal: '掌握标准队列与双端队列/方向标志结合的锯齿形层序遍历技巧，理解出队顺序与收集顺序解耦的设计',
  problemHtml: TREE_036_037_PROBLEMS.zigzagLevelOrder036.html,

  inputs: [
    {
      id: 'tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      width: '180px',
      placeholder: '3, 9, 20, null, null, 15, 7',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1 (三层折返)',
      values: { tree: '3, 9, 20, null, null, 15, 7' },
      description: '经典之字形三层折返: [3] -> [20, 9] -> [15, 7]',
    },
    {
      label: '满二叉树 (完备三层)',
      values: { tree: '1, 2, 3, 4, 5, 6, 7' },
      description: '全满节点锯齿形: [1] -> [3, 2] -> [4, 5, 6, 7]',
    },
    {
      label: '链状偏斜二叉树',
      values: { tree: '1, 2, null, 3, null' },
      description: '单侧链状退化结构',
    },
    {
      label: '单节点二叉树',
      values: { tree: '1' },
      description: '仅包含根节点',
    },
  ],
  metrics: [
    { id: 'cur-level', label: '当前所在层', color: '#2563eb' },
    { id: 'queue-size', label: '队列/窗口规模', color: '#f59e0b' },
    { id: 'total-collected', label: '已收集层数', color: '#16a34a' },
  ],

  // ========================
  // 多阶段演化配置 (Class 036 三段式体系)
  // ========================
  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 双端队列 / isReverse 标志法',
      shortName: '双端队列',
      num: 1,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '锯齿形层序 · isReverse 标志头尾插法',
        complexity: 'O(n) · O(w) 队列宽度',
      },
      card1Title: '📊 二叉树拓扑与双端收集沙盘',
      card2Title: '🧭 FIFO 队列与当前层双端收集监视器',
      codeLanguages: ZIGZAG_STAGE1_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildZigzagQueueSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: ZigzagStep) => renderZigzagCanvasForStep(container, step, '#fbbf24'),
      renderCustomMetrics: (container: HTMLElement, step: ZigzagStep) => {
        container.innerHTML = renderZigzagMetricsShell(step, renderStage1BufferHtml(step.queue, step.currentLevel, step.isReverse));
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 静态数组模拟队列 (Class 036)',
      shortName: '静态数组',
      num: 2,
      timeBadge: 'O(n) · 零GC',
      theme: 'bg-blue' as const,
      badge: {
        mode: '锯齿形层序 · 静态连续内存双向读指针',
        complexity: 'O(n) · O(w) 常数极优',
      },
      card1Title: '⚡ 静态数组模拟队列拓扑沙盘',
      card2Title: '🏎️ 连续内存 queue[MAXN] 与 l/r 双指针监视器',
      codeLanguages: ZIGZAG_STAGE2_STATIC_ARRAY_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildZigzagStaticArraySteps(root);
      },
      renderCanvas: (container: HTMLElement, step: ZigzagStep) => renderZigzagCanvasForStep(container, step, '#38bdf8'),
      renderCustomMetrics: (container: HTMLElement, step: ZigzagStep) => {
        container.innerHTML = renderZigzagMetricsShell(step, renderStage2BufferHtml(step.staticQueueState));
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 递归 DFS 深度映射',
      shortName: '递归DFS',
      num: 3,
      timeBadge: 'O(n) · O(h)',
      theme: 'bg-amber' as const,
      badge: {
        mode: '锯齿形层序 · DFS 递归深度奇偶头尾插',
        complexity: 'O(n) · O(h) 栈深',
      },
      card1Title: '🌳 二叉树拓扑与 DFS 递归探索沙盘',
      card2Title: '📚 DFS 递归调用栈与深度映射监视器',
      codeLanguages: ZIGZAG_STAGE3_DFS_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildZigzagDfsSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: ZigzagStep) => renderZigzagCanvasForStep(container, step, '#f97316'),
      renderCustomMetrics: (container: HTMLElement, step: ZigzagStep) => {
        container.innerHTML = renderZigzagMetricsShell(step, renderStage3BufferHtml(step.callStack));
      },
    },
  ],

  // Legacy fallback
  codeLanguages: ZIGZAG_STAGE1_CODE,
  buildSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildZigzagQueueSteps(root);
  },
  generateSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildZigzagQueueSteps(root);
  },
  renderCanvas: (container, step) => {
    renderZigzagCanvasForStep(container, step, '#fbbf24');
  },
});
