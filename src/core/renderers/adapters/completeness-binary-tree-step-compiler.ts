/**
 * 完全二叉树检验核心步进编译器 (Completeness of Binary Tree Step Compiler)
 * LeetCode 958 / Class 036 Code05
 * 遵循 Matt Pocock 深模块哲学与纯领域逻辑分层架构
 */

import { parseTreeArray } from '../../input-primitives';
import { HighlightTarget } from '../../step-visualizer';
import { TreeNode, buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  COMPLETENESS_STAGE1_LINES,
  COMPLETENESS_STAGE2_STATIC_ARRAY_LINES,
  COMPLETENESS_STAGE3_SENTINEL_LINES,
} from '../../../algorithms/categories/tree/tree-036-037/completeness-binary-tree-036-stage-codes';

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

export function makeCompletenessMetrics(
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
    'rule2-status': violationReason?.includes('非叶子') ? '❌ 违规' : leaf ? '⚡ 严格执行中' : '✓ 待命中',
    'judge-res': resultStr,
    '当前节点': curVal !== null ? curVal : '—',
    'leaf 状态': leaf ? 'TRUE' : 'false',
    '判定结果': resultStr,
  };
}

// ============================================================
// 辅助解析与构建
// ============================================================
export function parseAndBuildCompletenessTree(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.tree ?? '1, 2, 3, 4, 5, 6';
  const arr = parseTreeArray(raw, [1, 2, 3, 4, 5, 6]);
  return buildTreeFromArr(arr);
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

/** Legacy 兼容包装函数 */
export function buildCompleteness036Steps(): Completeness036Step[] {
  const root = parseAndBuildCompletenessTree();
  return buildCompletenessQueueSteps(root);
}
