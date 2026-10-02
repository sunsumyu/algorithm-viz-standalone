/**
 * 完全二叉树检验 (Completeness of Binary Tree · LeetCode 958 / Class 036 Code05)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 *
 * 核心多阶段演化体系:
 *   Stage 1: 标准 Queue + 左神两大铁律 (Queue BFS + Leaf Flag · 经典集合)
 *   Stage 2: 静态数组模拟队列 (Static Array Queue · 左神 Class 036 招牌零 GC)
 *   Stage 3: 空节点哨兵单调性校验 (Null Sentinel Queue · 紧凑排布无空隙)
 */

import { parseTreeArray } from '../../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr } from '../tree-template';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  COMPLETENESS_STAGE1_CODE,
  COMPLETENESS_STAGE1_LINES,
  COMPLETENESS_STAGE2_STATIC_ARRAY_CODE,
  COMPLETENESS_STAGE2_STATIC_ARRAY_LINES,
  COMPLETENESS_STAGE3_SENTINEL_CODE,
  COMPLETENESS_STAGE3_SENTINEL_LINES,
} from './completeness-binary-tree-036-stage-codes';

// ============================================================
// 类型契约与状态定义 (Domain Step Contract)
// ============================================================
export interface Completeness036StaticQueueState {
  array: (number | string)[];
  l: number;
  r: number;
  windowSize: number;
  leaf: boolean;
}

export interface Completeness036Step {
  tree: TreeNode | null;
  current: number | null;
  queue: (number | string)[];
  leaf: boolean;
  isValid: boolean | null; // null: 判定中, true: 合格, false: 违规
  violationReason?: string;
  decision: string;
  action: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };

  /** 正在考察的孩子节点对 */
  childrenCheck?: { left: number | null; right: number | null };

  /** Stage 2 静态数组状态 */
  staticQueueState?: Completeness036StaticQueueState;

  /** Stage 3 哨兵状态 */
  sentinelState?: { reachedNull: boolean; queue: (string | number)[] };

  // Legacy Tree036Step 兼容
  activeNodeId?: number | null;
  secondaryNodeId?: number | null;
}

function makeCompletenessMetrics(
  curVal: number | null,
  leaf: boolean,
  isValid: boolean | null,
  violationReason?: string
): Record<string, string | number> {
  const resultStr = isValid === true ? 'TRUE (合格完全二叉树)' : isValid === false ? 'FALSE (违规)' : '校验中...';
  return {
    'cur-node': curVal !== null ? `${curVal}` : '—',
    'leaf-status': leaf ? '⚡ 警戒生效 (后序必须全叶)' : '未触发 (正常双全)',
    'rule1-status': violationReason?.includes('有右无左') ? '❌ 违规' : '✓ 合格',
    'rule2-status': violationReason?.includes('非叶子') ? '❌ 违规' : (leaf ? '⚡ 严格执行中' : '✓ 待命中'),
    'judge-res': resultStr,
    '当前节点': curVal !== null ? curVal : '—',
    'leaf 状态': leaf ? 'TRUE' : 'false',
    '判定结果': resultStr,
  };
}

// ============================================================
// 表现层辅助呈现组件 (Presentation Helpers)
// ============================================================
function renderCompletenessMetricsShell(step: Completeness036Step, bufferHtml: string): string {
  const isErr = step.isValid === false;
  const isOk = step.isValid === true;
  const bannerBg = isErr ? '#fef2f2' : isOk ? '#f0fdf4' : '#eff6ff';
  const bannerBorder = isErr ? '#fecaca' : isOk ? '#bbf7d0' : '#bfdbfe';
  const bannerColor = isErr ? '#b91c1c' : isOk ? '#15803d' : '#1d4ed8';

  const statusText = isErr
    ? `❌ 校验失败：${step.violationReason || '违反完全二叉树排布准则'}`
    : isOk
    ? '✅ 校验通过：整棵树满足左神两大铁律，判定为合法的完全二叉树 (CBT)！'
    : `🔍 正在校验节点 ${step.current ?? '—'} (leaf = ${step.leaf ? 'TRUE' : 'false'})`;

  return `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 6px 0;">
      <div style="padding: 8px 12px; background: ${bannerBg}; border: 1.5px solid ${bannerBorder}; border-radius: 8px; font-size: 11.5px; font-weight: 700; color: ${bannerColor}; display: flex; align-items: center; justify-content: space-between;">
        <span>${statusText}</span>
        <span style="font-family: monospace; font-size: 11px; padding: 2px 6px; background: rgba(255,255,255,0.7); border-radius: 4px;">
          ${isOk ? 'Accepted' : isErr ? 'Rejected' : 'Checking'}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px;">
          <strong style="color: #334155;">铁律 1 (有右无左):</strong>
          <span style="color: ${step.violationReason?.includes('有右无左') ? '#dc2626' : '#16a34a'}; font-weight: 600; margin-left: 4px;">
            ${step.violationReason?.includes('有右无左') ? '❌ 发生违规' : '✓ 严格合规'}
          </span>
        </div>
        <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px;">
          <strong style="color: #334155;">铁律 2 (断点全叶):</strong>
          <span style="color: ${step.violationReason?.includes('非叶子') ? '#dc2626' : step.leaf ? '#d97706' : '#64748b'}; font-weight: 600; margin-left: 4px;">
            ${step.violationReason?.includes('非叶子') ? '❌ 发生违规' : step.leaf ? '⚡ 警戒已开启' : '未触发'}
          </span>
        </div>
      </div>

      ${bufferHtml}
    </div>
  `;
}

/** 缓冲器 1：Stage 1 标准队列与左右孩子双全检查 */
function renderStage1QueueBufferHtml(step: Completeness036Step): string {
  const chips = step.queue.length > 0
    ? step.queue.map((v) => `<span style="padding: 2px 7px; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600;">Node ${v}</span>`).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空</span>';

  const ch = step.childrenCheck;
  const lText = ch?.left !== null && ch?.left !== undefined ? `#${ch.left}` : '<span style="color:#94a3b8;">null</span>';
  const rText = ch?.right !== null && ch?.right !== undefined ? `#${ch.right}` : '<span style="color:#94a3b8;">null</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px;">
        <span style="color: #475569;">当前考察节点左右孩子:</span>
        <span style="font-family: monospace; font-weight: 700; color: #0f172a;">left: ${lText} | right: ${rText}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">🥞 FIFO 节点队列:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 32px; align-items: center;">
          ${chips}
        </div>
      </div>
    </div>
  `;
}

/** 缓冲器 2：Stage 2 静态数组连续内存条 */
function renderStage2StaticArrayBufferHtml(state?: Completeness036StaticQueueState): string {
  if (!state) return '';
  const { array, l, r, leaf } = state;
  const maxDisplay = Math.min(Math.max(r + 2, 8), 14);
  const cells: string[] = [];

  for (let i = 0; i < maxDisplay; i++) {
    const val = i < array.length && array[i] != null ? array[i] : '—';
    const isInside = i >= l && i < r;
    const isL = i === l;
    const isR = i === r;

    let bg = '#ffffff';
    let borderColor = '#e2e8f0';
    let textColor = '#64748b';

    if (isInside) {
      bg = '#e0f2fe';
      borderColor = '#7dd3fc';
      textColor = '#0369a1';
    }

    let ptrLabel = '&nbsp;';
    if (isL && isR) ptrLabel = '<span style="color:#ef4444; font-weight:800; font-size:9.5px;">l/r</span>';
    else if (isL) ptrLabel = '<span style="color:#0284c7; font-weight:800; font-size:9.5px;">l↓</span>';
    else if (isR) ptrLabel = '<span style="color:#10b981; font-weight:800; font-size:9.5px;">r↓</span>';

    cells.push(`
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <div style="height: 12px; line-height: 12px; font-size: 9px; font-family: monospace;">${ptrLabel}</div>
        <div style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${borderColor}; border-radius: 6px; font-family: monospace; font-size: 11.5px; font-weight: 700; color: ${textColor};">
          ${val}
        </div>
        <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">[${i}]</span>
      </div>
    `);
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #92400e;">左神静态连续数组 queue[MAXN]:</span>
        <span style="font-size: 12px; font-weight: 700; color: #b45309; font-family: monospace;">
          [l=${l}, r=${r}) | 待检: ${Math.max(0, r - l)} | leaf: ${leaf ? 'TRUE ⚡' : 'false'}
        </span>
      </div>
      <div style="display: flex; gap: 6px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto;">
        ${cells.join('')}
      </div>
    </div>
  `;
}

/** 缓冲器 3：Stage 3 空节点哨兵单调队列监视器 */
function renderStage3SentinelBufferHtml(step: Completeness036Step): string {
  const state = step.sentinelState;
  if (!state) return '';
  const { reachedNull, queue } = state;

  const chips = queue.length > 0
    ? queue.map((v) => {
        const isN = v === 'null';
        const bg = isN ? '#f1f5f9' : '#dbeafe';
        const border = isN ? '#cbd5e1' : '#bfdbfe';
        const text = isN ? '#94a3b8' : '#1e40af';
        return `<span style="padding: 2px 7px; background: ${bg}; color: ${text}; border: 1px solid ${border}; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600;">${v}</span>`;
      }).join('')
    : '<span style="color:#94a3b8; font-size:11px;">队列已清空</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: ${reachedNull ? '#fffbeb' : '#f0fdf4'}; border: 1px solid ${reachedNull ? '#fde68a' : '#bbf7d0'}; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: ${reachedNull ? '#92400e' : '#166534'};">空哨兵触发状态 reachedNull:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: ${reachedNull ? '#b45309' : '#15803d'};">
          ${reachedNull ? '⚡ 已遇到首个 null (后方绝不能再有节点)' : '尚未遇到 null'}
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">🧱 含 null 哨兵全量展开队列:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 36px; align-items: center;">
          ${chips}
        </div>
      </div>
    </div>
  `;
}

/** 统一画布呈现 */
function renderCompletenessCanvasForStep(container: HTMLElement, step: Completeness036Step, primaryColor: string = '#0284c7'): void {
  const isErr = step.isValid === false;
  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.current,
    secondaryHighlightedNodes: step.queue.filter((q): q is number => typeof q === 'number'),
    visitedNodes: [],
    primaryColor: isErr ? '#ef4444' : primaryColor,
    secondaryColor: '#38bdf8',
    visitedColor: '#34d399',
  });
}

// ============================================================
// Stage 1 步骤生成器: 标准 Queue + 左神两大铁律 (Queue BFS + Leaf Flag)
// ============================================================
export function buildCompletenessQueueSteps(root: TreeNode | null): Completeness036Step[] {
  const steps: Completeness036Step[] = [];
  const L = COMPLETENESS_STAGE1_LINES;

  steps.push({
    tree: root,
    current: null,
    queue: [],
    leaf: false,
    isValid: null,
    decision: '开启完全二叉树 (CBT) 校验',
    action: 'init',
    message: root
      ? `完全二叉树两大铁律：1. 任何节点有右无左直接判错；2. 一旦遇到孩子不双全，后续必须全为叶子！`
      : '空树特判，空树是合法的完全二叉树，直接返回 true。',
    log: root ? `isCompleteTree(root = ${root.val}), leaf = false` : 'root == null -> true',
    metrics: makeCompletenessMetrics(null, false, root ? null : true),
    codeLine: root ? L.entry : L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      queue: [],
      leaf: false,
      isValid: true,
      decision: '特判返回：空树为合法完全二叉树',
      action: 'done',
      message: '树为空，返回 true。',
      log: 'root == null -> return true',
      metrics: makeCompletenessMetrics(null, false, true),
      codeLine: L.entry,
    });
    return steps;
  }

  const queue: TreeNode[] = [root];
  let leaf = false;

  steps.push({
    tree: root,
    current: root.val,
    queue: [root.val],
    leaf: false,
    isValid: null,
    decision: `根节点 ${root.val} 入队，初始 leaf = false`,
    action: 'init-queue',
    message: `根节点 ${root.val} 入队，准备开启层序遍历。`,
    log: `queue.offer(${root.val}), leaf = false`,
    metrics: makeCompletenessMetrics(root.val, false, null),
    codeLine: L.initQueue,
  });

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const l = cur.left;
    const r = cur.right;

    steps.push({
      tree: root,
      current: cur.val,
      queue: queue.map((n) => n.val),
      leaf,
      isValid: null,
      childrenCheck: { left: l?.val ?? null, right: r?.val ?? null },
      decision: `出队节点 ${cur.val} 并核验左右孩子`,
      action: 'poll',
      message: `弹出节点 ${cur.val}，左孩子: ${l ? l.val : 'null'}，右孩子: ${r ? r.val : 'null'}。`,
      log: `cur = ${cur.val}, left = ${l?.val ?? 'null'}, right = ${r?.val ?? 'null'}, leaf = ${leaf}`,
      metrics: makeCompletenessMetrics(cur.val, leaf, null),
      codeLine: L.pollNode,
    });

    // 铁律 2 检验: 如果 leaf 已触发，但当前节点含有孩子，直接判错
    if (leaf && (l != null || r != null)) {
      const err = `节点 ${cur.val} 含有孩子节点，违反【断点后全部必须为叶子】铁律！`;
      steps.push({
        tree: root,
        current: cur.val,
        queue: queue.map((n) => n.val),
        leaf,
        isValid: false,
        violationReason: '断点后出现非叶子节点',
        childrenCheck: { left: l?.val ?? null, right: r?.val ?? null },
        decision: `❌ 违规判定：${err}`,
        action: 'error-leaf',
        message: `🚨 ${err} 判定失败，立即返回 false！`,
        log: `violation: leaf=true but node ${cur.val} has children -> return false`,
        metrics: makeCompletenessMetrics(cur.val, leaf, false, '断点后出现非叶子节点'),
        codeLine: L.checkLeafViolate,
      });
      return steps;
    }

    // 铁律 1 检验: 有右无左直接判错
    if (l == null && r != null) {
      const err = `节点 ${cur.val} 缺失左孩子却有右孩子 ${r.val}，违反【有右无左直接判伪】铁律！`;
      steps.push({
        tree: root,
        current: cur.val,
        queue: queue.map((n) => n.val),
        leaf,
        isValid: false,
        violationReason: '有右无左违规',
        childrenCheck: { left: null, right: r.val },
        decision: `❌ 违规判定：${err}`,
        action: 'error-right-without-left',
        message: `🚨 ${err} 判定失败，立即返回 false！`,
        log: `violation: node ${cur.val} has right ${r.val} but no left -> return false`,
        metrics: makeCompletenessMetrics(cur.val, leaf, false, '有右无左违规'),
        codeLine: L.checkNoLeftHasRight,
      });
      return steps;
    }

    // 孩子入队
    if (l != null) queue.push(l);
    if (r != null) queue.push(r);

    if (l != null || r != null) {
      steps.push({
        tree: root,
        current: cur.val,
        queue: queue.map((n) => n.val),
        leaf,
        isValid: null,
        childrenCheck: { left: l?.val ?? null, right: r?.val ?? null },
        decision: `合规子节点入队: ${[l?.val, r?.val].filter((x) => x !== undefined).join(', ')}`,
        action: 'push-children',
        message: `节点 ${cur.val} 的有效孩子入队等待后续层次校验。`,
        log: `push: ${[l?.val, r?.val].filter((x) => x !== undefined).join(', ')}`,
        metrics: makeCompletenessMetrics(cur.val, leaf, null),
        codeLine: L.pushChildren,
      });
    }

    // 铁律 2 触发点: 遇到首个孩子不双全节点
    if (l == null || r == null) {
      if (!leaf) {
        leaf = true;
        steps.push({
          tree: root,
          current: cur.val,
          queue: queue.map((n) => n.val),
          leaf: true,
          isValid: null,
          childrenCheck: { left: l?.val ?? null, right: r?.val ?? null },
          decision: `⚡ 触发叶子状态警戒 (leaf = true)`,
          action: 'leaf-trigger',
          message: `节点 ${cur.val} 孩子不双全！完全二叉树紧凑边界已到达，后续队列中所有节点必须全部为叶子节点！`,
          log: `leaf triggered at node ${cur.val} (left: ${l?.val ?? 'null'}, right: ${r?.val ?? 'null'})`,
          metrics: makeCompletenessMetrics(cur.val, true, null),
          codeLine: L.leafTrigger,
        });
      }
    }
  }

  steps.push({
    tree: root,
    current: null,
    queue: [],
    leaf,
    isValid: true,
    decision: '完全二叉树校验通过，返回 true',
    action: 'done',
    message: '🎉 整棵树完全满足左神两大铁律，判定为合法的完全二叉树！返回 true。',
    log: 'return true (Valid Complete Binary Tree)',
    metrics: makeCompletenessMetrics(null, leaf, true),
    codeLine: L.returnTrue,
  });

  return steps;
}

// ============================================================
// Stage 2 步骤生成器: 静态数组模拟队列 (Static Array Queue · Class 036 招牌零 GC)
// ============================================================
export function buildCompletenessStaticArraySteps(root: TreeNode | null): Completeness036Step[] {
  const steps: Completeness036Step[] = [];
  const L = COMPLETENESS_STAGE2_STATIC_ARRAY_LINES;

  steps.push({
    tree: root,
    current: null,
    queue: [],
    leaf: false,
    isValid: null,
    staticQueueState: { array: [], l: 0, r: 0, windowSize: 0, leaf: false },
    decision: '左神 Class 036 招牌优化：分配静态连续内存 queue[MAXN]',
    action: 'init',
    message: root
      ? `左神 Class 036 招牌零 GC 连续内存队列：使用 queue[MAXN] 与双指针 l=0, r=0。配合两大铁律极速检验！`
      : '空树特判，直接返回 true。',
    log: root ? 'staticQueue: l=0, r=0, MAXN=2001, leaf=false' : 'root == null -> true',
    metrics: makeCompletenessMetrics(null, false, root ? null : true),
    codeLine: root ? L.entry : L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      queue: [],
      leaf: false,
      isValid: true,
      staticQueueState: { array: [], l: 0, r: 0, windowSize: 0, leaf: false },
      decision: '特判返回：空树为合法完全二叉树',
      action: 'done',
      message: '树为空，直接返回 true。',
      log: 'root == null -> return true',
      metrics: makeCompletenessMetrics(null, false, true),
      codeLine: L.entry,
    });
    return steps;
  }

  const queue: (TreeNode | null)[] = [];
  let l = 0;
  let r = 0;
  queue[r++] = root;
  let leaf = false;

  const getStaticState = (): Completeness036StaticQueueState => ({
    array: queue.map((n) => (n ? n.val : '—')),
    l,
    r,
    windowSize: Math.max(0, r - l),
    leaf,
  });

  steps.push({
    tree: root,
    current: root.val,
    queue: [root.val],
    leaf: false,
    isValid: null,
    staticQueueState: getStaticState(),
    decision: '根节点入静态数组: queue[r++] = root',
    action: 'offer-root',
    message: `根节点 ${root.val} 写入静态槽位 queue[0]，r 指针增至 1。`,
    log: `queue[0]=${root.val}, r=1, leaf=false`,
    metrics: makeCompletenessMetrics(root.val, false, null),
    codeLine: L.offerRoot,
  });

  while (l < r) {
    const cur = queue[l++]!;
    const left = cur.left;
    const right = cur.right;

    steps.push({
      tree: root,
      current: cur.val,
      queue: queue.slice(l, r).map((n) => n!.val),
      leaf,
      isValid: null,
      childrenCheck: { left: left?.val ?? null, right: right?.val ?? null },
      staticQueueState: getStaticState(),
      decision: `读取 queue[l++] -> ${cur.val} 并校验孩子`,
      action: 'poll',
      message: `l 游标推进读取节点 ${cur.val}，考察其左孩子 (${left?.val ?? 'null'}) 与右孩子 (${right?.val ?? 'null'})。`,
      log: `cur = queue[${l - 1}](${cur.val}), l=${l}`,
      metrics: makeCompletenessMetrics(cur.val, leaf, null),
      codeLine: L.pollNode,
    });

    if (leaf && (left != null || right != null)) {
      steps.push({
        tree: root,
        current: cur.val,
        queue: queue.slice(l, r).map((n) => n!.val),
        leaf,
        isValid: false,
        violationReason: '断点后出现非叶子节点',
        childrenCheck: { left: left?.val ?? null, right: right?.val ?? null },
        staticQueueState: getStaticState(),
        decision: `❌ 违规：leaf 状态下节点 ${cur.val} 仍含有孩子！`,
        action: 'error-leaf',
        message: `🚨 节点 ${cur.val} 含有子节点，违反断点后必须全为叶子铁律！返回 false。`,
        log: `violation: leaf=true and node ${cur.val} has children -> return false`,
        metrics: makeCompletenessMetrics(cur.val, leaf, false, '断点后出现非叶子节点'),
        codeLine: L.checkLeafViolate,
      });
      return steps;
    }

    if (left == null && right != null) {
      steps.push({
        tree: root,
        current: cur.val,
        queue: queue.slice(l, r).map((n) => n!.val),
        leaf,
        isValid: false,
        violationReason: '有右无左违规',
        childrenCheck: { left: null, right: right.val },
        staticQueueState: getStaticState(),
        decision: `❌ 违规：节点 ${cur.val} 有右无左！`,
        action: 'error-right-without-left',
        message: `🚨 节点 ${cur.val} 缺失左孩子却存在右孩子 ${right.val}，直接判定 false！`,
        log: `violation: node ${cur.val} has right ${right.val} but no left -> return false`,
        metrics: makeCompletenessMetrics(cur.val, leaf, false, '有右无左违规'),
        codeLine: L.checkNoLeftHasRight,
      });
      return steps;
    }

    if (left != null) {
      queue[r++] = left;
      steps.push({
        tree: root,
        current: cur.val,
        queue: queue.slice(l, r).map((n) => n!.val),
        leaf,
        isValid: null,
        staticQueueState: getStaticState(),
        decision: `左孩子入静态数组: queue[r++] = ${left.val}`,
        action: 'push-left',
        message: `左孩子 ${left.val} 写入槽位 queue[${r - 1}]，r 增至 ${r}。`,
        log: `queue[${r - 1}]=${left.val}, r=${r}`,
        metrics: makeCompletenessMetrics(cur.val, leaf, null),
        codeLine: L.pushLeft,
      });
    }

    if (right != null) {
      queue[r++] = right;
      steps.push({
        tree: root,
        current: cur.val,
        queue: queue.slice(l, r).map((n) => n!.val),
        leaf,
        isValid: null,
        staticQueueState: getStaticState(),
        decision: `右孩子入静态数组: queue[r++] = ${right.val}`,
        action: 'push-right',
        message: `右孩子 ${right.val} 写入槽位 queue[${r - 1}]，r 增至 ${r}。`,
        log: `queue[${r - 1}]=${right.val}, r=${r}`,
        metrics: makeCompletenessMetrics(cur.val, leaf, null),
        codeLine: L.pushRight,
      });
    }

    if (left == null || right == null) {
      if (!leaf) {
        leaf = true;
        steps.push({
          tree: root,
          current: cur.val,
          queue: queue.slice(l, r).map((n) => n!.val),
          leaf: true,
          isValid: null,
          staticQueueState: getStaticState(),
          decision: '⚡ 静态数组队列触发 leaf = true 警戒',
          action: 'leaf-trigger',
          message: `节点 ${cur.val} 不双全，开启 leaf 警戒，后续静态数组中的所有待检节点必须全为叶子！`,
          log: `leaf triggered at node ${cur.val}`,
          metrics: makeCompletenessMetrics(cur.val, true, null),
          codeLine: L.leafTrigger,
        });
      }
    }
  }

  steps.push({
    tree: root,
    current: null,
    queue: [],
    leaf,
    isValid: true,
    staticQueueState: getStaticState(),
    decision: '静态数组全部检验完毕，返回 true',
    action: 'done',
    message: '🎉 静态数组模拟队列全部通过检验 (l == r)！判定为合法的完全二叉树。',
    log: 'return true (Valid CBT)',
    metrics: makeCompletenessMetrics(null, leaf, true),
    codeLine: L.returnTrue,
  });

  return steps;
}

// ============================================================
// Stage 3 步骤生成器: 空节点哨兵单调性校验 (Null Sentinel Queue)
// ============================================================
export function buildCompletenessSentinelSteps(root: TreeNode | null): Completeness036Step[] {
  const steps: Completeness036Step[] = [];
  const L = COMPLETENESS_STAGE3_SENTINEL_LINES;

  steps.push({
    tree: root,
    current: null,
    queue: [],
    leaf: false,
    isValid: null,
    sentinelState: { reachedNull: false, queue: [] },
    decision: '空节点哨兵层序单调性校验',
    action: 'init',
    message: root
      ? `单调性原理：将 null 同样作为占位符入队。完全二叉树的层序遍历序列中，一旦遇到第一个 null，后续绝对不能再出现任何非空节点！`
      : '空树特判，直接返回 true。',
    log: root ? `sentinelQueue(root = ${root.val}), reachedNull = false` : 'root == null -> true',
    metrics: makeCompletenessMetrics(null, false, root ? null : true),
    codeLine: root ? L.entry : L.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      queue: [],
      leaf: false,
      isValid: true,
      sentinelState: { reachedNull: false, queue: [] },
      decision: '特判返回：空树为合法的完全二叉树',
      action: 'done',
      message: '树为空，直接返回 true。',
      log: 'root == null -> return true',
      metrics: makeCompletenessMetrics(null, false, true),
      codeLine: L.entry,
    });
    return steps;
  }

  const queue: (TreeNode | null)[] = [root];
  let reachedNull = false;

  const getSentinelView = () => queue.map((n) => (n ? n.val : 'null'));

  steps.push({
    tree: root,
    current: root.val,
    queue: [root.val],
    leaf: false,
    isValid: null,
    sentinelState: { reachedNull: false, queue: getSentinelView() },
    decision: '根节点入队，reachedNull = false',
    action: 'init-queue',
    message: `根节点 ${root.val} 入队，队列初始化完毕。`,
    log: `queue.offer(${root.val}), reachedNull = false`,
    metrics: makeCompletenessMetrics(root.val, false, null),
    codeLine: L.initQueue,
  });

  while (queue.length > 0) {
    const cur = queue.shift()!;

    if (cur === null) {
      if (!reachedNull) {
        reachedNull = true;
        steps.push({
          tree: root,
          current: null,
          queue: getSentinelView(),
          leaf: true,
          isValid: null,
          sentinelState: { reachedNull: true, queue: getSentinelView() },
          decision: '⚡ 出队首个空占位符 null：开启 reachedNull = true',
          action: 'trigger-null',
          message: '首次在出队时遇到 null！完全二叉树全部实体节点已出队完毕，后续队列中绝对禁止再有非空节点！',
          log: 'cur == null -> reachedNull = true',
          metrics: makeCompletenessMetrics(null, true, null),
          codeLine: L.triggerNull,
        });
      }
    } else {
      if (reachedNull) {
        const err = `在遇到 null 之后，竟然又弹出了非空节点 ${cur.val}！二叉树紧凑排布出现中间断层空隙！`;
        steps.push({
          tree: root,
          current: cur.val,
          queue: getSentinelView(),
          leaf: true,
          isValid: false,
          violationReason: '紧凑排布中存在空隙断层',
          sentinelState: { reachedNull: true, queue: getSentinelView() },
          decision: `❌ 单调性违规判定：${err}`,
          action: 'error-gap',
          message: `🚨 ${err} 判定失败，立即返回 false！`,
          log: `violation: reachedNull=true but popped node ${cur.val} -> return false`,
          metrics: makeCompletenessMetrics(cur.val, true, false, '紧凑排布中存在空隙断层'),
          codeLine: L.checkGapViolate,
        });
        return steps;
      }

      steps.push({
        tree: root,
        current: cur.val,
        queue: getSentinelView(),
        leaf: reachedNull,
        isValid: null,
        childrenCheck: { left: cur.left?.val ?? null, right: cur.right?.val ?? null },
        sentinelState: { reachedNull, queue: getSentinelView() },
        decision: `出队非空节点 ${cur.val} 并将其左右孩子(含null)入队`,
        action: 'poll',
        message: `出队节点 ${cur.val}，左右孩子 (${cur.left?.val ?? 'null'}, ${cur.right?.val ?? 'null'}) 无论是否为空均压入队列末尾。`,
        log: `cur = ${cur.val}, push (${cur.left?.val ?? 'null'}, ${cur.right?.val ?? 'null'})`,
        metrics: makeCompletenessMetrics(cur.val, reachedNull, null),
        codeLine: L.pollNode,
      });

      queue.push(cur.left);
      queue.push(cur.right);

      steps.push({
        tree: root,
        current: cur.val,
        queue: getSentinelView(),
        leaf: reachedNull,
        isValid: null,
        childrenCheck: { left: cur.left?.val ?? null, right: cur.right?.val ?? null },
        sentinelState: { reachedNull, queue: getSentinelView() },
        decision: `左右孩子入队完毕: [${cur.left?.val ?? 'null'}, ${cur.right?.val ?? 'null'}]`,
        action: 'push-both',
        message: `队列长度更新为 ${queue.length}。`,
        log: `queue size = ${queue.length}`,
        metrics: makeCompletenessMetrics(cur.val, reachedNull, null),
        codeLine: L.pushBothChildren,
      });
    }
  }

  steps.push({
    tree: root,
    current: null,
    queue: [],
    leaf: true,
    isValid: true,
    sentinelState: { reachedNull, queue: [] },
    decision: '单调性队列检验全部通过，返回 true',
    action: 'done',
    message: '🎉 队列中在首个 null 之后全部为 null，毫无断层，判定为合法的完全二叉树！返回 true。',
    log: 'return true (Valid CBT by Monotonicity)',
    metrics: makeCompletenessMetrics(null, true, true),
    codeLine: L.returnTrue,
  });

  return steps;
}

// ============================================================
// 辅助解析与默认用例
// ============================================================
function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.tree ?? '1, 2, 3, 4, 5, 6';
  const arr = parseTreeArray(raw, [1, 2, 3, 4, 5, 6]);
  return buildTreeFromArr(arr);
}

/** Legacy 兼容包装函数 */
export function buildCompleteness036Steps(): Completeness036Step[] {
  const root = parseAndBuild();
  return buildCompletenessQueueSteps(root);
}

// ============================================================
// 声明式算法注册中心配置 (Declarative Algorithm Visualizer)
// ============================================================
export const completenessBinaryTree036Visualizer = registerDeclarativeAlgorithm<Completeness036Step>({
  id: 'tree-036-completeness-binary-tree',
  aliases: ['leetcode-958', 'completeness-of-binary-tree', 'tree-036-code05'],
  name: '完全二叉树检验 (Class 036)',
  category: 'tree',
  icon: '🛡️',
  difficulty: 2,
  levelOrder: 3608,
  learningGoal: '深入领会左神完全二叉树两大铁律：有右无左直接判伪、出现缺孩子节点后后续必须全部为叶子',
  problemHtml: TREE_036_037_PROBLEMS.completenessBinaryTree036.html,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 标准 Queue + 左神两大铁律',
      shortName: '两大铁律',
      num: 1,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '广度优先 · 左神两大铁律与叶子警戒标志',
        complexity: 'O(n) · O(w) 队列状态机',
      },
      card1Title: '🛡️ 二叉树拓扑与状态机校验沙盘',
      card2Title: '⚖️ 状态机监视器与左神两大铁律核验看板',
      codeLanguages: COMPLETENESS_STAGE1_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildCompletenessQueueSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: Completeness036Step) => renderCompletenessCanvasForStep(container, step, '#10b981'),
      renderCustomMetrics: (container: HTMLElement, step: Completeness036Step) => {
        container.innerHTML = renderCompletenessMetricsShell(step, renderStage1QueueBufferHtml(step));
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 静态数组模拟队列 (Class 036 招牌)',
      shortName: '静态数组',
      num: 2,
      timeBadge: 'O(n) · 零GC',
      theme: 'bg-amber' as const,
      badge: {
        mode: '层次遍历 · 连续内存双指针模拟队列',
        complexity: 'O(n) · O(w) 常数极优',
      },
      card1Title: '⚡ 静态连续数组队列拓扑沙盘',
      card2Title: '🏎️ 连续内存 queue[MAXN] 与双指针监视器',
      codeLanguages: COMPLETENESS_STAGE2_STATIC_ARRAY_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildCompletenessStaticArraySteps(root);
      },
      renderCanvas: (container: HTMLElement, step: Completeness036Step) => renderCompletenessCanvasForStep(container, step, '#f59e0b'),
      renderCustomMetrics: (container: HTMLElement, step: Completeness036Step) => {
        container.innerHTML = renderCompletenessMetricsShell(step, renderStage2StaticArrayBufferHtml(step.staticQueueState));
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 空节点哨兵单调性校验 (紧凑排布无空隙)',
      shortName: '哨兵单调队列',
      num: 3,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-blue' as const,
      badge: {
        mode: '广度优先 · 遇空后无非空单调性检验',
        complexity: 'O(n) · O(w) 哨兵队列',
      },
      card1Title: '🧱 空哨兵队列探索与断层空隙检测沙盘',
      card2Title: '🔍 空节点哨兵单调队列监视器',
      codeLanguages: COMPLETENESS_STAGE3_SENTINEL_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildCompletenessSentinelSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: Completeness036Step) => renderCompletenessCanvasForStep(container, step, '#3b82f6'),
      renderCustomMetrics: (container: HTMLElement, step: Completeness036Step) => {
        container.innerHTML = renderCompletenessMetricsShell(step, renderStage3SentinelBufferHtml(step));
      },
    },
  ],

  // Fallback
  codeLanguages: COMPLETENESS_STAGE1_CODE,
  buildSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildCompletenessQueueSteps(root);
  },
  generateSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildCompletenessQueueSteps(root);
  },
  renderCanvas: (container, step) => {
    renderCompletenessCanvasForStep(container, step, '#10b981');
  },

  inputs: [
    {
      id: 'tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5, 6',
      width: '160px',
    },
  ],
  presets: [
    {
      label: '合法完全二叉树 (6 节点)',
      values: {
        tree: '1, 2, 3, 4, 5, 6',
      },
      description: '满树紧凑排布，判定通过',
    },
    {
      label: '有右无左违规案例',
      values: {
        tree: '1, 2, 3, null, 4',
      },
      description: '节点 2 缺失左孩子却有右孩子 4，直接判定 false',
    },
    {
      label: '断点后出现非叶子违规',
      values: {
        tree: '1, 2, 3, 4, 5, null, 7',
      },
      description: '断点后节点 3 含有孩子 7，违反全叶铁律',
    },
  ],
});
