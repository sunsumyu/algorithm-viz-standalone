/**
 * 最长回文子序列 LPS (LeetCode 516) - 声明式 4-Card 顶层模型驱动渲染器
 * 遵循 universal-dp-refactoring 黄金基准规范：
 * - 确立双向模式驱动 (modes: forward 顺推 / reverse 逆推)
 * - 严格上三角半矩阵与单字符对角线基底
 * - 空间压缩一维滚动与 leftDown (pre) 寄存器暂存
 * - 支持 Stage 1~4 全阶段多语言代码与行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_067_PROBLEMS } from './dp-067-problem-content';
import { RecursionTreeAdapter } from '../../../../core/renderers/recursion-tree-adapter';
import { cloneStateDepTree } from '../../../../core/strategies/tree-clone';
import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
import { captureScope } from '../../../../core/strategies/scope-capture';
import type { UniversalTreeNode } from '../../../../core/universal-stage-engine';
import type { IStrictRecursionStep, IStrictDpStage1Spec, IStrictMemoStep } from '../../../../core/strategies/strict-stage-contracts';
import {
  LPS_STAGE1_CODE_LANGUAGES,
  LPS_STAGE2_CODE_LANGUAGES,
  LPS_STAGE3_CODE_LANGUAGES,
  LPS_STAGE4_CODE_LANGUAGES,
  LPS_STAGE1_FORWARD_CODE_LANGUAGES,
  LPS_STAGE2_FORWARD_CODE_LANGUAGES,
  LPS_STAGE3_REVERSE_CODE_LANGUAGES,
  LPS_STAGE4_REVERSE_CODE_LANGUAGES,
  getDp067Anchor,
  type ResolvedLineTarget,
} from './dp-067-stage-codes';
import {
  renderRecursionCard1,
  renderMemoCard1,
  renderMemoGridCard,
  renderDp2DCard1,
  renderDp2DCard2,
  renderSpaceOptCard2,
  renderStage1GridCard,
  renderLcsCard2CompoundView,
  DpCellDep,
} from './dp-067-shared';

export function parseLpsInputs(inputs: Record<string, any>) {
  const s = String(inputs?.['input-s'] || 'bbbab').trim();
  return { s };
}

// ==========================================
// 1. Stage 1: 区间暴力递归
// ==========================================

export interface LpsRecStep extends IStrictRecursionStep {
  currentCall: string;
  l: number;
  r: number;
  curL?: number;
  curR?: number;
  callStack: Array<any>;
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  s: string;
  metrics?: Record<string, any>;
  treeRoot: UniversalTreeNode;
  activeNodeId: string;
  activeTrail: string[];
  activeStack?: string[];
  visitedMap?: Record<string, { val?: number; isMatch?: boolean }>;
}

export function buildLpsStage1Steps(inputs: Record<string, any>, mode?: string): LpsRecStep[] {
  const { s } = parseLpsInputs(inputs);
  const isForward = mode === 'forward';
  const steps: LpsRecStep[] = [];
  const stack: Array<{ label: string; l: number; r: number }> = [];

  let nodeIdCounter = 0;
  const rootTreeNode: UniversalTreeNode = {
    id: `node-${++nodeIdCounter}`,
    r: 0,
    c: s.length - 1,
    val: `f(0, ${s.length - 1})`,
    status: 'current',
    children: [],
  };

  const linesReverse = {
    entry: getDp067Anchor(1, 'longest-palindromic-subsequence', 'entry'),
    enter: getDp067Anchor(1, 'longest-palindromic-subsequence', 'enter'),
    base1: getDp067Anchor(1, 'longest-palindromic-subsequence', 'base1'),
    base2: getDp067Anchor(1, 'longest-palindromic-subsequence', 'base2'),
    match: getDp067Anchor(1, 'longest-palindromic-subsequence', 'match'),
    mismatch: getDp067Anchor(1, 'longest-palindromic-subsequence', 'mismatch'),
  };

  const linesForward = {
    entry: getDp067Anchor(1, 'longest-palindromic-subsequence', 'entry'),
    enter: getDp067Anchor(1, 'longest-palindromic-subsequence', 'enter'),
    base1: getDp067Anchor(1, 'longest-palindromic-subsequence', 'base1'),
    base2: getDp067Anchor(1, 'longest-palindromic-subsequence', 'base2'),
    match: getDp067Anchor(1, 'longest-palindromic-subsequence', 'match'),
    mismatch: getDp067Anchor(1, 'longest-palindromic-subsequence', 'mismatch'),
  };

  const lines = isForward ? linesForward : linesReverse;
  const funcName = isForward ? 'lps1Forward' : 'lps1';

  const activeTrailCoords: string[] = [];
  const visitedMap: Record<string, { val?: number; isMatch?: boolean }> = {};

  const pushStep = (st: Partial<LpsRecStep> & {
    currentCall: string;
    l: number;
    r: number;
    decision: string;
    message: string;
    log: string;
    codeLine: ResolvedLineTarget;
    s: string;
    callStack: Array<any>;
    treeNode?: UniversalTreeNode;
  }) => {
    const curL = st.curL ?? st.l ?? 0;
    const curR = st.curR ?? st.r ?? 0;
    const activeNodeId = st.treeNode?.id || rootTreeNode.id;
    const stepObj: LpsRecStep = {
      currentCall: st.currentCall,
      l: st.l,
      r: st.r,
      curL,
      curR,
      callStack: st.callStack,
      decision: st.decision,
      message: st.message,
      log: st.log,
      codeLine: st.codeLine,
      s: st.s,
      metrics: st.metrics,
      i: curL,
      j: curR,
      activeTrail: [...activeTrailCoords],
      activeStack: [...activeTrailCoords],
      treeRoot: cloneStateDepTree(rootTreeNode) || rootTreeNode,
      activeNodeId,
      visitedMap: { ...visitedMap },
    };
    steps.push(stepObj);
  };

  // Step 0: 主函数入口
  pushStep({
    currentCall: `${funcName}("${s}")`,
    l: 0,
    r: s.length - 1,
    curL: 0,
    curR: s.length - 1,
    callStack: [],
    decision: `主函数入口：${isForward ? '顺推' : '逆推'}求解 "${s}" 的最长回文子序列`,
    message: `调用辅助递归函数 f(0, ${s.length - 1})，从全串范围展开`,
    log: `| 📥 进入 ${funcName}: s="${s}" (len=${s.length})`,
    codeLine: lines.entry,
    s,
    metrics: { 'metric-interval': `[0, ${s.length - 1}]`, 'metric-status': '函数入口' },
    treeNode: rootTreeNode,
  });

  function f(l: number, r: number, parentNode?: UniversalTreeNode, edgeLabel?: string): number {
    const currentCoord = `${l},${r}`;
    activeTrailCoords.push(currentCoord);
    stack.push({ label: `f(${l}, ${r})`, l, r });

    const currentNode: UniversalTreeNode = parentNode
      ? {
          id: `node-${++nodeIdCounter}`,
          r: l,
          c: r,
          val: `f(${l}, ${r})`,
          edgeLabel,
          status: 'current',
          children: [],
        }
      : rootTreeNode;

    if (parentNode) {
      parentNode.children.push(currentNode);
    }

    const depth = activeTrailCoords.length;
    const indent = '| '.repeat(Math.max(0, depth - 1));

    pushStep({
      currentCall: `f(${l}, ${r})`,
      l,
      r,
      curL: l,
      curR: r,
      callStack: [...stack],
      decision: `探查区间 s[${l}..${r}] ("${s.slice(l, r + 1)}")`,
      message: `区间两端字符: s[${l}]='${s[l]}', s[${r}]='${s[r]}'`,
      log: `${indent}📥 进入 f(${l}, ${r}) [探查区间 "${s.slice(l, r + 1)}"]`,
      codeLine: lines.enter,
      s,
      metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-status': '区间递归' },
      treeNode: currentNode,
    });

    // 越界基底
    if (l > r) {
      currentNode.status = 'base';
      currentNode.tag = '0';
      pushStep({
        currentCall: `f(${l}, ${r})`,
        l,
        r,
        curL: Math.min(l, s.length - 1),
        curR: Math.max(0, r),
        callStack: [...stack],
        decision: `Base Case 越界：l > r (${l} > ${r}) 空区间贡献 0`,
        message: '空区间长度为 0',
        log: `${indent}⚡ [越界拦截] l > r: return 0`,
        codeLine: lines.base1,
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-ans': '0' },
        treeNode: currentNode,
      });
      activeTrailCoords.pop();
      stack.pop();
      return 0;
    }

    // 单字符基底
    if (l === r) {
      currentNode.status = 'base';
      currentNode.tag = '1';
      visitedMap[`${l},${r}`] = { val: 1, isMatch: true };
      pushStep({
        currentCall: `f(${l}, ${r})`,
        l,
        r,
        curL: l,
        curR: r,
        callStack: [...stack],
        decision: `Base Case 单字符：区间 [${l}, ${l}] ('${s[l]}') 自身为长度为 1 的回文`,
        message: 'l == r，返回 1',
        log: `${indent}🟢 [单字符基底] l==r ('${s[l]}'): return 1`,
        codeLine: lines.base1,
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-ans': '1' },
        treeNode: currentNode,
      });
      activeTrailCoords.pop();
      stack.pop();
      return 1;
    }

    // 两字符基底特判 (保持与代码一致)
    if (l === r - 1) {
      const same = s[l] === s[r];
      const ans = same ? 2 : 1;
      currentNode.status = same ? 'match' : 'visited';
      currentNode.tag = `${ans}`;
      visitedMap[`${l},${r}`] = { val: ans, isMatch: same };
      pushStep({
        currentCall: `f(${l}, ${r})`,
        l,
        r,
        curL: l,
        curR: r,
        callStack: [...stack],
        decision: `Base Case 双字符：[${l}, ${r}] 字符${same ? '相同返回 2' : '不同返回 1'}`,
        message: `s[${l}]='${s[l]}' 与 s[${r}]='${s[r]}'`,
        log: `${indent}${same ? '✨' : '⚠️'} [双字符基底] "${s[l]}${s[r]}": return ${ans}`,
        codeLine: lines.base2,
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-ans': `${ans}` },
        treeNode: currentNode,
      });
      activeTrailCoords.pop();
      stack.pop();
      return ans;
    }

    // 两端字符匹配
    if (s[l] === s[r]) {
      currentNode.status = 'match';
      const inner = f(l + 1, r - 1, currentNode, `='${s[l]}'`);
      const ans = 2 + inner;
      currentNode.tag = `${ans}`;
      visitedMap[`${l},${r}`] = { val: ans, isMatch: true };
      pushStep({
        currentCall: `f(${l}, ${r})`,
        l,
        r,
        curL: l,
        curR: r,
        callStack: [...stack],
        decision: `✨ 两端匹配: s[${l}] == s[${r}] ('${s[l]}')！共同作为回文外层，LPS = 2 + f(${l + 1}, ${r - 1}) = ${ans}`,
        message: `向内收缩区间探查 [${l + 1}, ${r - 1}] 并增加贡献 2`,
        log: `${indent}✨ [首尾匹配] 2 + f(${l + 1}, ${r - 1}) = ${ans}`,
        codeLine: lines.match,
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-ans': `${ans}` },
        treeNode: currentNode,
      });
      activeTrailCoords.pop();
      stack.pop();
      return ans;
    } else {
      // 两端字符不匹配：分叉探索
      const left = f(l + 1, r, currentNode, `舍左 s[${l}]`);
      const right = f(l, r - 1, currentNode, `舍右 s[${r}]`);
      const ans = Math.max(left, right);
      currentNode.tag = `${ans}`;
      currentNode.status = 'visited';
      visitedMap[`${l},${r}`] = { val: ans };
      pushStep({
        currentCall: `f(${l}, ${r})`,
        l,
        r,
        curL: l,
        curR: r,
        callStack: [...stack],
        decision: `两端不同: s[${l}]('${s[l]}') != s[${r}]('${s[r]}')，取 max(舍左=${left}, 舍右=${right}) = ${ans}`,
        message: `比较两端各放弃一个字符后的最大回文子序列`,
        log: `${indent}🔀 [分支汇聚] max(舍左=${left}, 舍右=${right}) = ${ans}`,
        codeLine: lines.mismatch,
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-ans': `${ans}` },
        treeNode: currentNode,
      });
      activeTrailCoords.pop();
      stack.pop();
      return ans;
    }
  }

  f(0, s.length - 1);
  return steps;
}

// ==========================================
// 2. Stage 2: 记忆化搜索
// ==========================================

export interface LpsMemoStep extends IStrictMemoStep {
  currentCall: string;
  l: number;
  r: number;
  curL?: number;
  curR?: number;
  i: number;
  j: number;
  callStack: Array<any>;
  activeTrail: string[];
  activeStack?: string[];
  memoHit: boolean;
  hitCount: number;
  missCount: number;
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  memoGrid: number[][];
  cachedVal?: number;
  s: string;
  metrics?: Record<string, any>;
  treeRoot: UniversalTreeNode;
  activeNodeId: string;
}

export function buildLpsStage2Steps(inputs: Record<string, any>, mode?: string): LpsMemoStep[] {
  const { s } = parseLpsInputs(inputs);
  const isForward = mode === 'forward';
  const n = s.length;
  const steps: LpsMemoStep[] = [];
  const memo: number[][] = Array.from({ length: n }, () => new Array(n).fill(-1));
  let hitCount = 0;
  let missCount = 0;
  const stack: Array<{ l: number; r: number }> = [];

  let nodeIdCounter = 0;
  const rootTreeNode: UniversalTreeNode = {
    id: `node-${++nodeIdCounter}`,
    r: 0,
    c: n - 1,
    val: `f(0, ${n - 1})`,
    status: 'current',
    children: [],
  };

  const linesForward = {
    entry: getDp067Anchor(2, 'lps-forward', 'entry'),
    outOfBounds: getDp067Anchor(2, 'lps-forward', 'outOfBounds'),
    baseSingle: getDp067Anchor(2, 'lps-forward', 'baseSingle'),
    cacheHit: getDp067Anchor(2, 'lps-forward', 'cacheHit'),
    match: getDp067Anchor(2, 'lps-forward', 'match'),
    mismatch: getDp067Anchor(2, 'lps-forward', 'mismatch'),
  };

  const linesReverse = {
    entry: getDp067Anchor(2, 'longest-palindromic-subsequence', 'entry'),
    outOfBounds: getDp067Anchor(2, 'longest-palindromic-subsequence', 'outOfBounds'),
    baseSingle: getDp067Anchor(2, 'longest-palindromic-subsequence', 'baseSingle'),
    cacheHit: getDp067Anchor(2, 'longest-palindromic-subsequence', 'cacheHit'),
    match: getDp067Anchor(2, 'longest-palindromic-subsequence', 'match'),
    mismatch: getDp067Anchor(2, 'longest-palindromic-subsequence', 'mismatch'),
  };

  const lines = isForward ? linesForward : linesReverse;
  const funcName = isForward ? 'lps2Forward' : 'lps2';

  const activeTrailCoords: string[] = [];

  const pushStep = (st: Partial<LpsMemoStep> & {
    currentCall: string;
    l: number;
    r: number;
    decision: string;
    message: string;
    log: string;
    codeLine: ResolvedLineTarget;
    s: string;
    callStack: Array<any>;
    memoGrid: number[][];
    memoHit: boolean;
    hitCount: number;
    missCount: number;
    treeNode?: UniversalTreeNode;
  }) => {
    const curL = st.curL ?? st.l ?? 0;
    const curR = st.curR ?? st.r ?? 0;
    const activeNodeId = st.treeNode?.id || rootTreeNode.id;
    const stepObj: LpsMemoStep = {
      currentCall: st.currentCall,
      l: st.l,
      r: st.r,
      curL,
      curR,
      callStack: st.callStack,
      decision: st.decision,
      message: st.message,
      log: st.log,
      codeLine: st.codeLine,
      s: st.s,
      metrics: st.metrics,
      i: curL,
      j: curR,
      memoGrid: st.memoGrid,
      memoHit: st.memoHit,
      hitCount: st.hitCount,
      missCount: st.missCount,
      cachedVal: st.cachedVal,
      activeTrail: [...activeTrailCoords],
      activeStack: [...activeTrailCoords],
      treeRoot: cloneStateDepTree(rootTreeNode) || rootTreeNode,
      activeNodeId,
    };
    steps.push(stepObj);
  };

  // 1. 入口步骤
  pushStep({
    currentCall: `${funcName}("${s}")`,
    l: 0,
    r: n - 1,
    curL: 0,
    curR: n - 1,
    callStack: [],
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `主函数入口：初始化 ${n}×${n} 上三角备忘录矩阵 memo 并发起调用 f(0, ${n - 1})`,
    message: `以 memo[l][r] 缓存各区间的最长回文子序列长度，避免重叠子问题重复计算`,
    log: `| 📥 进入 ${funcName}("${s}"): 初始化 ${n}×${n} 上三角备忘录`,
    codeLine: lines.entry,
    memoGrid: snapshotGrid2D(memo),
    s,
    metrics: { 'metric-interval': `[0, ${n - 1}]`, 'metric-status': '函数入口', 'metric-hits': '0', 'metric-misses': '0' },
    treeNode: rootTreeNode,
  });

  function fMemo(l: number, r: number, parentNode?: UniversalTreeNode, edgeLabel?: string): number {
    stack.push({ l, r });
    activeTrailCoords.push(`${l},${r}`);

    const currentNode: UniversalTreeNode = parentNode
      ? {
          id: `node-${++nodeIdCounter}`,
          r: l,
          c: r,
          val: `f(${l}, ${r})`,
          edgeLabel,
          status: 'current',
          children: [],
        }
      : rootTreeNode;

    if (parentNode) {
      parentNode.children.push(currentNode);
    }

    const depth = activeTrailCoords.length;
    const indent = '| '.repeat(Math.max(0, depth - 1));

    // 越界基底：l > r
    if (l > r) {
      currentNode.status = 'base';
      currentNode.tag = '0';
      pushStep({
        currentCall: `f(${l}, ${r})`,
        l: Math.min(l, n - 1),
        r: Math.max(0, r),
        curL: Math.min(l, n - 1),
        curR: Math.max(0, r),
        callStack: [...stack],
        memoHit: false,
        hitCount,
        missCount,
        cachedVal: 0,
        decision: `越界基底 l > r (${l} > ${r})：空区间返回 0`,
        message: `左右指针交叉，已无有效字符，最长回文子序列长度为 0`,
        log: `${indent}⚡ [越界拦截] l > r: return 0`,
        codeLine: lines.outOfBounds,
        memoGrid: snapshotGrid2D(memo),
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-status': '越界返回 0', 'metric-hits': `${hitCount}`, 'metric-misses': `${missCount}` },
        treeNode: currentNode,
      });
      activeTrailCoords.pop();
      stack.pop();
      return 0;
    }

    // 单字符基底：l === r
    if (l === r) {
      if (memo[l][l] === -1) {
        memo[l][l] = 1;
      }
      currentNode.status = 'base';
      currentNode.tag = '1';
      pushStep({
        currentCall: `f(${l}, ${l})`,
        l,
        r: l,
        curL: l,
        curR: l,
        callStack: [...stack],
        memoHit: false,
        hitCount,
        missCount,
        cachedVal: 1,
        decision: `单字符基底 l == r (${l})：字符 '${s[l]}' 天然构成长度 1 的回文`,
        message: `命中基底条件，直接写入 memo[${l}][${l}] = 1 并返回`,
        log: `${indent}🟢 [单字符基底] memo[${l}][${l}] = 1`,
        codeLine: lines.baseSingle,
        memoGrid: snapshotGrid2D(memo),
        s,
        metrics: { 'metric-interval': `[${l}, ${l}]`, 'metric-status': '单字符基底', 'metric-hits': `${hitCount}`, 'metric-misses': `${missCount}` },
        treeNode: currentNode,
      });
      activeTrailCoords.pop();
      stack.pop();
      return 1;
    }

    // 检查缓存命中：遇重复子问题直接剪枝！
    if (memo[l][r] !== -1) {
      hitCount++;
      currentNode.status = 'pruned';
      currentNode.tag = `🎯 命中 ${memo[l][r]}`;
      pushStep({
        currentCall: `f(${l}, ${r})`,
        l,
        r,
        curL: l,
        curR: r,
        callStack: [...stack],
        memoHit: true,
        hitCount,
        missCount,
        cachedVal: memo[l][r],
        decision: `🎯 命中备忘录: memo[${l}][${r}] = ${memo[l][r]}`,
        message: `区间 [${l}, ${r}] 此前已求解过，直接 O(1) 复用缓存结果立即剪枝！`,
        log: `${indent}🎯 [剪枝命中] memo[${l}][${r}] = ${memo[l][r]} (累计剪枝 ${hitCount} 次)`,
        codeLine: lines.cacheHit,
        memoGrid: snapshotGrid2D(memo),
        s,
        metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-status': '命中剪枝', 'metric-hits': `${hitCount}`, 'metric-misses': `${missCount}` },
        treeNode: currentNode,
      });
      activeTrailCoords.pop();
      stack.pop();
      return memo[l][r];
    }

    // 未命中：展开递归求解
    missCount++;
    pushStep({
      currentCall: `f(${l}, ${r})`,
      l,
      r,
      curL: l,
      curR: r,
      callStack: [...stack],
      memoHit: false,
      hitCount,
      missCount,
      decision: `⚠️ 未命中备忘录: 首次探查区间 [${l}, ${r}] (端点 '${s[l]}' vs '${s[r]}')`,
      message: s[l] === s[r]
        ? `两端字符相等 s[${l}] == s[${r}] ('${s[l]}')，将递归内层 f(${l + 1}, ${r - 1}) 并 +2`
        : `两端字符不等 s[${l}]('${s[l]}') != s[${r}]('${s[r]}')，将分叉探查舍左与舍右`,
      log: `${indent}⚠️ [首次探查] memo[${l}][${r}] 未命中，展开子问题`,
      codeLine: s[l] === s[r] ? lines.match : lines.mismatch,
      memoGrid: snapshotGrid2D(memo),
      s,
      metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-status': '未命中探查', 'metric-hits': `${hitCount}`, 'metric-misses': `${missCount}` },
      treeNode: currentNode,
    });

    let res = 0;
    if (s[l] === s[r]) {
      currentNode.status = 'match';
      res = 2 + fMemo(l + 1, r - 1, currentNode, `='${s[l]}'`);
    } else {
      currentNode.status = 'visited';
      const leftSub = fMemo(l + 1, r, currentNode, `舍左 s[${l}]`);
      const rightSub = fMemo(l, r - 1, currentNode, `舍右 s[${r}]`);
      res = Math.max(leftSub, rightSub);
    }

    memo[l][r] = res;
    currentNode.tag = `${res}`;
    pushStep({
      currentCall: `f(${l}, ${r})`,
      l,
      r,
      curL: l,
      curR: r,
      callStack: [...stack],
      memoHit: false,
      hitCount,
      missCount,
      cachedVal: res,
      decision: `💾 计算完成存入备忘录: memo[${l}][${r}] = ${res}`,
      message: `区间 [${l}, ${r}] 的最长回文子序列长度为 ${res}，已安全缓存`,
      log: `${indent}💾 [缓存落盘] memo[${l}][${r}] = ${res}`,
      codeLine: s[l] === s[r] ? lines.match : lines.mismatch,
      memoGrid: snapshotGrid2D(memo),
      s,
      metrics: { 'metric-interval': `[${l}, ${r}]`, 'metric-status': '写入备忘录', 'metric-hits': `${hitCount}`, 'metric-misses': `${missCount}` },
      treeNode: currentNode,
    });

    activeTrailCoords.pop();
    stack.pop();
    return res;
  }

  fMemo(0, n - 1);

  // 最终步骤
  pushStep({
    currentCall: `f(0, ${n - 1}) 求解完毕`,
    l: 0,
    r: n - 1,
    curL: 0,
    curR: n - 1,
    callStack: [],
    memoHit: false,
    hitCount,
    missCount,
    cachedVal: memo[0][n - 1],
    decision: `🏆 记忆化搜索完成！最长回文子序列长度为 memo[0][${n - 1}] = ${memo[0][n - 1]}`,
    message: `总共剪枝命中 ${hitCount} 次，成功规避大量冗余子树计算`,
    log: `| 🏆 记忆化搜索全量完成: 最终 LPS 长度 memo[0][${n - 1}] = ${memo[0][n - 1]}, 剪枝命中 ${hitCount} 次`,
    codeLine: lines.entry,
    memoGrid: snapshotGrid2D(memo),
    s,
    metrics: { 'metric-interval': `[0, ${n - 1}]`, 'metric-status': '求解完成', 'metric-hits': `${hitCount}`, 'metric-misses': `${missCount}` },
    treeNode: rootTreeNode,
  });

  return steps;
}

// ==========================================
// 3. Stage 3: 严格区间 DP 半三角表
// ==========================================

export interface Lps2DStep {
  curL: number;
  curR: number;
  l?: number;
  r?: number;
  len?: number;
  n?: number;
  scope?: Record<string, any>;
  currentCell: string;
  currentVal: number;
  dpTable: (number | null)[][];
  depCells: DpCellDep[];
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  s: string;
  metrics?: Record<string, any>;
  treeRoot?: UniversalTreeNode;
  activeNodeId?: string;
}

function buildLpsStage3Tree(
  l: number,
  r: number,
  currentVal: number | string,
  kind: 'init' | 'base' | 'match' | 'diff' | 'done',
  s: string,
  dp: (number | null)[][],
  downVal?: number,
  leftVal?: number
): { treeRoot: UniversalTreeNode; activeNodeId: string } {
  const rootId = `node-stage3-${l}-${r}`;

  if (kind === 'init') {
    return {
      treeRoot: {
        id: rootId,
        r: l,
        c: r,
        val: `dp[${l}][${r}] 待计算`,
        status: 'current',
        children: [],
      },
      activeNodeId: rootId,
    };
  }

  if (kind === 'base') {
    return {
      treeRoot: {
        id: rootId,
        r: l,
        c: r,
        val: `dp[${l}][${r}] = 1 ('${s[l]}')`,
        status: 'base',
        tag: '单字符基底',
        children: [],
      },
      activeNodeId: rootId,
    };
  }

  if (kind === 'match') {
    const innerL = l + 1;
    const innerR = r - 1;
    const innerVal = innerL <= innerR ? (dp[innerL]?.[innerR] ?? 0) : 0;
    const childId = `node-stage3-${innerL}-${innerR}`;
    return {
      treeRoot: {
        id: rootId,
        r: l,
        c: r,
        val: `dp[${l}][${r}] = ${currentVal}`,
        status: 'current',
        tag: `匹配 '${s[l]}'=='${s[r]}'`,
        children: [
          {
            id: childId,
            r: innerL,
            c: innerR,
            edgeLabel: '+2 扩展',
            val: `dp[${innerL}][${innerR}] = ${innerVal}`,
            status: 'visited',
            children: [],
          },
        ],
      },
      activeNodeId: rootId,
    };
  }

  if (kind === 'diff') {
    const dVal = downVal ?? (dp[l + 1]?.[r] ?? 0);
    const lVal = leftVal ?? (dp[l]?.[r - 1] ?? 0);
    const isDownWin = dVal >= lVal;
    return {
      treeRoot: {
        id: rootId,
        r: l,
        c: r,
        val: `dp[${l}][${r}] = ${currentVal}`,
        status: 'current',
        tag: `max(${dVal}, ${lVal})`,
        children: [
          {
            id: `node-stage3-${l + 1}-${r}`,
            r: l + 1,
            c: r,
            edgeLabel: '下方舍左',
            val: `dp[${l + 1}][${r}] = ${dVal}${isDownWin ? ' 🌟' : ''}`,
            status: isDownWin ? 'visited' : 'pruned',
            children: [],
          },
          {
            id: `node-stage3-${l}-${r - 1}`,
            r: l,
            c: r - 1,
            edgeLabel: '左方舍右',
            val: `dp[${l}][${r - 1}] = ${lVal}${!isDownWin ? ' 🌟' : ''}`,
            status: !isDownWin ? 'visited' : 'pruned',
            children: [],
          },
        ],
      },
      activeNodeId: rootId,
    };
  }

  return {
    treeRoot: {
      id: rootId,
      r: l,
      c: r,
      val: `dp[0][${s.length - 1}] = ${currentVal} 🏆`,
      status: 'visited',
      tag: '全局最优解',
      children: [],
    },
    activeNodeId: rootId,
  };
}

export function buildLpsStage3Steps(inputs: Record<string, any>, mode?: string): Lps2DStep[] {
  const { s } = parseLpsInputs(inputs);
  const isReverse = mode === 'reverse';
  const n = s.length;
  const steps: Lps2DStep[] = [];
  const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

  const linesForward = {
    entry: getDp067Anchor(3, 'lps-forward', 'entry'),
    alloc: getDp067Anchor(3, 'lps-forward', 'alloc'),
    outerLoop: getDp067Anchor(3, 'lps-forward', 'outerLoop'),
    initDiag: getDp067Anchor(3, 'lps-forward', 'initDiag'),
    len2Check: getDp067Anchor(3, 'lps-forward', 'len2Check'),
    len2Match: getDp067Anchor(3, 'lps-forward', 'len2Match'),
    len2Mismatch: getDp067Anchor(3, 'lps-forward', 'len2Mismatch'),
    innerLoop: getDp067Anchor(3, 'lps-forward', 'innerLoop'),
    match: getDp067Anchor(3, 'lps-forward', 'match'),
    mismatch: getDp067Anchor(3, 'lps-forward', 'mismatch'),
    return: getDp067Anchor(3, 'lps-forward', 'return'),
  };

  const linesReverse = {
    entry: getDp067Anchor(3, 'longest-palindromic-subsequence', 'entry'),
    alloc: getDp067Anchor(3, 'longest-palindromic-subsequence', 'alloc'),
    initDiag: getDp067Anchor(3, 'longest-palindromic-subsequence', 'initDiag'),
    lenLoop: getDp067Anchor(3, 'longest-palindromic-subsequence', 'lenLoop'),
    lLoop: getDp067Anchor(3, 'longest-palindromic-subsequence', 'lLoop'),
    calcR: getDp067Anchor(3, 'longest-palindromic-subsequence', 'calcR'),
    match: getDp067Anchor(3, 'longest-palindromic-subsequence', 'match'),
    mismatch: getDp067Anchor(3, 'longest-palindromic-subsequence', 'mismatch'),
    return: getDp067Anchor(3, 'longest-palindromic-subsequence', 'return'),
  };

  if (!isReverse) {
    // -------------------------------------------------------------
    // 顺推模式 (自底向上，逐行递推)：l 从 n - 1 到 0
    // -------------------------------------------------------------

    // 0. 函数入口帧
    steps.push({
      curL: n - 1,
      curR: n - 1,
      currentCell: `s="${s}"`,
      currentVal: 0,
      dpTable: snapshotGrid2D(dp),
      depCells: [],
      decision: `主函数入口：lps3("${s}")，输入串长 n = ${n}`,
      message: '准备采用区间 DP 二维表自底向上逐行递推求解最长回文子序列',
      log: `enter lps3("${s}")`,
      codeLine: linesForward.entry,
      s,
      metrics: { 'metric-status': '函数入口', 'metric-val': '-' },
    });

    // 1. 分配状态表
    steps.push({
      curL: n - 1,
      curR: n - 1,
      currentCell: `dp[${n - 1}][${n - 1}]`,
      currentVal: 0,
      dpTable: snapshotGrid2D(dp),
      depCells: [],
      decision: `分配 ${n}×${n} 半三角状态表，准备自底向上 (l: ${n - 1} -> 0) 逐行递推`,
      message: '区间 DP 只需定义在主对角线及上半三角 (l <= r)，下半三角越界无效',
      log: 'alloc dp table',
      codeLine: linesForward.alloc,
      s,
      metrics: { 'metric-status': '内存分配', 'metric-val': '-' },
    });

    for (let l = n - 1; l >= 0; l--) {
      // 1. 外层循环头：固定行 l
      steps.push({
        curL: l,
        curR: l,
        currentCell: `l = ${l}`,
        currentVal: 0,
        dpTable: snapshotGrid2D(dp),
        depCells: [],
        decision: `外层循环判定：for l = ${l}；l >= 0 成立 (倒序行遍历，当前字符 '${s[l]}')`,
        message: `自底向上计算行 l = ${l}，确保后续推导所需的下方行 l+1 已全部计算完毕`,
        log: `for l = ${l} (l >= 0) -> true`,
        codeLine: linesForward.outerLoop,
        s,
        metrics: { 'metric-status': `外层循环 l=${l}`, 'metric-val': '-' },
      });

      // 2. 初始化单字符对角线 dp[l][l] = 1
      dp[l][l] = 1;
      steps.push({
        curL: l,
        curR: l,
        currentCell: `dp[${l}][${l}]`,
        currentVal: 1,
        dpTable: snapshotGrid2D(dp),
        depCells: [],
        decision: `单字符基底：dp[${l}][${l}] = 1 (字符 '${s[l]}')`,
        message: `单字符子串 '${s[l]}' 天然构成长度为 1 的回文串`,
        log: `dp[${l}][${l}] = 1`,
        codeLine: linesForward.initDiag,
        s,
        metrics: { 'metric-status': '单字符基底', 'metric-val': '1' },
      });

      // 3. 双字符特判：先高亮 if (l + 1 < n) 条件行
      if (l + 1 < n) {
        steps.push({
          curL: l,
          curR: l + 1,
          currentCell: `l+1 < ${n}`,
          currentVal: 1,
          dpTable: snapshotGrid2D(dp),
          depCells: [],
          decision: `双字符特判条件检测：if (l + 1 = ${l + 1} < ${n}) 成立！进入相邻两字符判定`,
          message: `右侧存在相邻字符 '${s[l + 1]}'，准备比较两字符是否相等`,
          log: `if (l + 1 < ${n}) -> true`,
          codeLine: linesForward.len2Check,
          s,
          metrics: { 'metric-status': '双字符条件成立', 'metric-val': '-' },
        });

        const isMatch2 = s[l] === s[l + 1];
        const val2 = isMatch2 ? 2 : 1;
        dp[l][l + 1] = val2;

        if (isMatch2) {
          // 高亮匹配赋值行：if (str[l] == str[l + 1]) dp[l][l + 1] = 2;
          steps.push({
            curL: l,
            curR: l + 1,
            currentCell: `dp[${l}][${l + 1}]`,
            currentVal: 2,
            dpTable: snapshotGrid2D(dp),
            depCells: [
              { r: l, c: l, label: `单字符 [${l}][${l}]`, color: 'rgba(99, 102, 241, 0.25)' },
              { r: l + 1, c: l + 1, label: `单字符 [${l + 1}][${l + 1}]`, color: 'rgba(99, 102, 241, 0.25)' },
            ],
            decision: `✨ 相邻两字符匹配：s[${l}] == s[${l + 1}] ('${s[l]}')！执行 dp[${l}][${l + 1}] = 2`,
            message: `两端字符相同，直接构成长度为 2 的回文子串`,
            log: `dp[${l}][${l + 1}] = 2`,
            codeLine: linesForward.len2Match,
            s,
            metrics: { 'metric-status': '相邻双字符匹配', 'metric-val': '2' },
          });
        } else {
          // 高亮不匹配赋值行：else dp[l][l + 1] = 1;
          steps.push({
            curL: l,
            curR: l + 1,
            currentCell: `dp[${l}][${l + 1}]`,
            currentVal: 1,
            dpTable: snapshotGrid2D(dp),
            depCells: [
              { r: l, c: l, label: `单字符 [${l}][${l}]`, color: 'rgba(99, 102, 241, 0.25)' },
              { r: l + 1, c: l + 1, label: `单字符 [${l + 1}][${l + 1}]`, color: 'rgba(99, 102, 241, 0.25)' },
            ],
            decision: `⚠️ 相邻两字符不等：s[${l}] ('${s[l]}') != s[${l + 1}] ('${s[l + 1]}')，执行 else dp[${l}][${l + 1}] = 1`,
            message: `两端字符不同，相邻双字符的最长回文子序列长度为 1`,
            log: `dp[${l}][${l + 1}] = 1`,
            codeLine: linesForward.len2Mismatch,
            s,
            metrics: { 'metric-status': '相邻双字符不等', 'metric-val': '1' },
          });
        }
      } else {
        // l + 1 >= n 边界判断帧：高亮 if (l + 1 < n) 说明条件不成立
        steps.push({
          curL: l,
          curR: l,
          currentCell: `l+1 >= ${n}`,
          currentVal: 1,
          dpTable: snapshotGrid2D(dp),
          depCells: [],
          decision: `双字符特判条件检测：if (l + 1 = ${l + 1} < ${n}) 不成立！`,
          message: `当前行 l = ${l} 已是字符串最后一位，无右侧字符，跳过双字符特判`,
          log: `if (l + 1 < ${n}) -> false (越界跳过)`,
          codeLine: linesForward.len2Check,
          s,
          metrics: { 'metric-status': '双字符条件不成立', 'metric-val': '-' },
        });
      }

      // 4. 内层循环：光标无论如何都必须跳到 innerLoop 行判定！
      if (l + 2 >= n) {
        // 条件不成立跳过
        steps.push({
          curL: l,
          curR: l,
          currentCell: `r = ${l + 2} >= ${n}`,
          currentVal: 0,
          dpTable: snapshotGrid2D(dp),
          depCells: [],
          decision: `内层循环检测：for r = ${l + 2}；r < ${n} (${l + 2} < ${n}) 不成立！`,
          message: `右端点初值 r=${l + 2} 已越界 (>= ${n})，无需考察长度 >= 3 的区间，跳过内层循环`,
          log: `for r = ${l + 2} (r < ${n}) -> false`,
          codeLine: linesForward.innerLoop,
          s,
          metrics: { 'metric-status': '内层循环不成立跳过', 'metric-val': '-' },
        });
      } else {
        // 条件成立进入
        steps.push({
          curL: l,
          curR: l + 2,
          currentCell: `r = ${l + 2}`,
          currentVal: 0,
          dpTable: snapshotGrid2D(dp),
          depCells: [],
          decision: `内层循环启动：for r = ${l + 2}；r < ${n} 成立，准备由左至右推导`,
          message: `开始推导行 l=${l} 上区间长度 >= 3 的各子串 s[${l}..r]`,
          log: `for r = ${l + 2} (r < ${n}) -> true`,
          codeLine: linesForward.innerLoop,
          s,
          metrics: { 'metric-status': `内层循环启动 r=${l + 2}`, 'metric-val': '-' },
        });

        for (let r = l + 2; r < n; r++) {
          if (r > l + 2) {
            // 后续迭代递增判定
            steps.push({
              curL: l,
              curR: r,
              currentCell: `r = ${r}`,
              currentVal: 0,
              dpTable: snapshotGrid2D(dp),
              depCells: [],
              decision: `内层循环迭代：for r = ${r}；r < ${n} 成立，推导区间 [${l}, ${r}]`,
              message: `右端点扩展至 r = ${r} (字符 '${s[r]}')`,
              log: `for r = ${r} (r < ${n}) -> true`,
              codeLine: linesForward.innerLoop,
              s,
              metrics: { 'metric-status': `内层循环 r=${r}`, 'metric-val': '-' },
            });
          }

          if (s[l] === s[r]) {
            const innerVal = dp[l + 1][r - 1] as number;
            // Phase A: 探查/比较
            steps.push({
              curL: l,
              curR: r,
              currentCell: `dp[${l}][${r}]`,
              currentVal: 2 + innerVal,
              dpTable: snapshotGrid2D(dp),
              depCells: [
                { r: l + 1, c: r - 1, label: `左下内层子串 [${l + 1}][${r - 1}] = ${innerVal}`, color: 'rgba(16, 185, 129, 0.35)' },
              ],
              decision: `比较端点字符：s[${l}] ('${s[l]}') == s[${r}] ('${s[r]}') 匹配！`,
              message: `两端字符相等，状态向内收缩，依赖左下方单元格 dp[${l + 1}][${r - 1}] (${innerVal})`,
              log: `compare s[${l}] == s[${r}] -> match`,
              codeLine: linesForward.match,
              s,
              metrics: { 'metric-status': '端点匹配探查', 'metric-val': `${2 + innerVal}` },
            });

            // Phase B: 落盘
            dp[l][r] = 2 + innerVal;
            steps.push({
              curL: l,
              curR: r,
              currentCell: `dp[${l}][${r}]`,
              currentVal: dp[l][r] as number,
              dpTable: snapshotGrid2D(dp),
              depCells: [
                { r: l + 1, c: r - 1, label: `左下内层子串 [${l + 1}][${r - 1}] = ${innerVal}`, color: 'rgba(16, 185, 129, 0.45)' },
              ],
              decision: `✨ 转移落盘：dp[${l}][${r}] = 2 + dp[${l + 1}][${r - 1}] = 2 + ${innerVal} = ${dp[l][r]}`,
              message: `首尾两端各扩展 1 个回文字符 (+2)，加上内层最长回文子序列长度`,
              log: `dp[${l}][${r}] = ${dp[l][r]}`,
              codeLine: linesForward.match,
              s,
              metrics: { 'metric-status': '对角线落盘', 'metric-val': `${dp[l][r]}` },
            });
          } else {
            const down = dp[l + 1][r] as number;
            const left = dp[l][r - 1] as number;
            const maxVal = Math.max(down, left);

            // Phase A: 探查/比较
            steps.push({
              curL: l,
              curR: r,
              currentCell: `dp[${l}][${r}]`,
              currentVal: maxVal,
              dpTable: snapshotGrid2D(dp),
              depCells: [
                { r: l + 1, c: r, label: `下方 [${l + 1}][${r}] = ${down} (舍弃 s[${l}])`, color: 'rgba(129, 140, 248, 0.35)' },
                { r: l, c: r - 1, label: `左方 [${l}][${r - 1}] = ${left} (舍弃 s[${r}])`, color: 'rgba(56, 189, 248, 0.35)' },
              ],
              decision: `比较端点字符：s[${l}] ('${s[l]}') != s[${r}] ('${s[r]}') 不匹配`,
              message: `端点不同无法同时加入回文串，需对比舍弃左端(下方=${down})与舍弃右端(左方=${left})`,
              log: `compare s[${l}] != s[${r}] -> mismatch`,
              codeLine: linesForward.mismatch,
              s,
              metrics: { 'metric-status': '择优探查', 'metric-val': `${maxVal}` },
            });

            // Phase B: 落盘
            dp[l][r] = maxVal;
            steps.push({
              curL: l,
              curR: r,
              currentCell: `dp[${l}][${r}]`,
              currentVal: dp[l][r] as number,
              dpTable: snapshotGrid2D(dp),
              depCells: [
                { r: l + 1, c: r, label: `下方 [${l + 1}][${r}] = ${down}`, color: 'rgba(129, 140, 248, 0.45)' },
                { r: l, c: r - 1, label: `左方 [${l}][${r - 1}] = ${left}`, color: 'rgba(56, 189, 248, 0.45)' },
              ],
              decision: `转移落盘：dp[${l}][${r}] = max(下=${down}, 左=${left}) = ${dp[l][r]}`,
              message: `在下方与左方中取较大值 ${dp[l][r]} 作为当前区间的最优解`,
              log: `dp[${l}][${r}] = ${dp[l][r]}`,
              codeLine: linesForward.mismatch,
              s,
              metrics: { 'metric-status': '择优落盘', 'metric-val': `${dp[l][r]}` },
            });
          }
        }

        // 内层循环跑完退出
        steps.push({
          curL: l,
          curR: n - 1,
          currentCell: `r = ${n} >= ${n}`,
          currentVal: 0,
          dpTable: snapshotGrid2D(dp),
          depCells: [],
          decision: `内层循环判定：r 递增至 ${n}；r < ${n} (${n} < ${n}) 不成立！`,
          message: `已处理完行 l = ${l} 上所有右端点，内层循环结束`,
          log: `for r = ${n} (r < ${n}) -> false (inner loop end)`,
          codeLine: linesForward.innerLoop,
          s,
          metrics: { 'metric-status': '内层循环退出', 'metric-val': '-' },
        });
      }
    }

    // 外层循环结束判定
    steps.push({
      curL: 0,
      curR: n - 1,
      currentCell: `l = -1 < 0`,
      currentVal: 0,
      dpTable: snapshotGrid2D(dp),
      depCells: [],
      decision: `外层循环判定：l 递减至 -1；l >= 0 不成立！`,
      message: '所有行（l: n-1 -> 0）的状态已全部自底向上递推计算完毕，退出外层循环',
      log: `for l = -1 (l >= 0) -> false (outer loop end)`,
      codeLine: linesForward.outerLoop,
      s,
      metrics: { 'metric-status': '外层循环退出', 'metric-val': '-' },
    });


    // 最终步骤：返回 dp[0][n - 1]
    steps.push({
      curL: 0,
      curR: n - 1,
      currentCell: `dp[0][${n - 1}]`,
      currentVal: dp[0][n - 1] as number,
      dpTable: snapshotGrid2D(dp),
      depCells: [],
      decision: `🏆 半三角填表完成！全串 [0, ${n - 1}] 最长回文子序列长度为 dp[0][${n - 1}] = ${dp[0][n - 1]}`,
      message: '右上角单元格汇聚全串全局最优解',
      log: `return dp[0][${n - 1}] = ${dp[0][n - 1]}`,
      codeLine: linesForward.return,
      s,
      metrics: { 'metric-status': '求解完成', 'metric-val': `${dp[0][n - 1]}` },
    });
  } else {
    // -------------------------------------------------------------
    // 逆推视角模式：区间长度 len 从 2 到 n
    // -------------------------------------------------------------

    // 0. 函数入口帧
    steps.push({
      curL: 0,
      curR: 0,
      currentCell: `s="${s}"`,
      currentVal: 0,
      dpTable: snapshotGrid2D(dp),
      depCells: [],
      decision: `主函数入口：lps3Reverse("${s}") (逆推视角：区间长度由 2 至 ${n} 扩展)`,
      message: '逆推视角按区间长度 len 由小到大斜向逐条对角线推导',
      log: `enter lps3Reverse("${s}")`,
      codeLine: linesReverse.entry,
      s,
      metrics: { 'metric-status': '函数入口', 'metric-val': '-' },
    });

    // 1. 分配状态表
    steps.push({
      curL: 0,
      curR: 0,
      currentCell: `dp[0][0]`,
      currentVal: 0,
      dpTable: snapshotGrid2D(dp),
      depCells: [],
      decision: `分配 ${n}×${n} 半三角状态表`,
      message: '区间 DP 只需定义在主对角线及上半三角 (l <= r)，下半三角越界无效',
      log: 'alloc dp table (reverse)',
      codeLine: linesReverse.alloc,
      s,
      metrics: { 'metric-status': '内存分配', 'metric-val': '-' },
    });

    // 2. 初始化对角线单字符
    for (let i = 0; i < n; i++) {
      dp[i][i] = 1;
      steps.push({
        curL: i,
        curR: i,
        l: i,
        r: i,
        len: 1,
        n,
        scope: captureScope({ n, len: 1, l: i, r: i, i, s, dpTable: dp }),
        currentCell: `dp[${i}][${i}]`,
        currentVal: 1,
        dpTable: snapshotGrid2D(dp),
        depCells: [],
        decision: `初始化对角线单字符基底：dp[${i}][${i}] = 1 (字符 '${s[i]}')`,
        message: `单字符子串天然构成长度为 1 的回文串`,
        log: `init diag dp[${i}][${i}] = 1`,
        codeLine: linesReverse.initDiag,
        s,
        metrics: { 'metric-status': '主对角线初始化', 'metric-val': '1' },
      });
    }

    // 3. len = 2 .. n
    for (let len = 2; len <= n; len++) {
      steps.push({
        curL: 0,
        curR: len - 1,
        l: 0,
        r: len - 1,
        len,
        n,
        scope: captureScope({ n, len, l: 0, r: len - 1, s, dpTable: dp }),
        currentCell: `len = ${len}`,
        currentVal: 0,
        dpTable: snapshotGrid2D(dp),
        depCells: [],
        decision: `外层循环迭代：for len = ${len} (区间长度从 2 扩展至 ${n})`,
        message: `按斜向对角线推进，先求所有长度为 ${len} 的子问题最优解`,
        log: `for len = ${len} (len <= ${n})`,
        codeLine: linesReverse.lenLoop,
        s,
        metrics: { 'metric-status': `外层长度 len=${len}`, 'metric-val': '-' },
      });

      for (let l = 0; l <= n - len; l++) {
        const r = l + len - 1;

        steps.push({
          curL: l,
          curR: r,
          l,
          r,
          len,
          n,
          scope: captureScope({ n, len, l, r, s, dpTable: dp }),
          currentCell: `l = ${l}`,
          currentVal: 0,
          dpTable: snapshotGrid2D(dp),
          depCells: [],
          decision: `内层循环：考察起点 l = ${l}，计算右端点 r = l + len - 1 = ${r}`,
          message: `推导子区间 [${l}, ${r}] ("${s.slice(l, r + 1)}")`,
          log: `for l = ${l} -> r = ${r}`,
          codeLine: linesReverse.lLoop,
          s,
          metrics: { 'metric-status': `起点 l=${l}`, 'metric-val': '-' },
        });

        if (s[l] === s[r]) {
          const innerVal = l + 1 <= r - 1 ? (dp[l + 1][r - 1] as number) : 0;
          // Phase A: Probe
          steps.push({
            curL: l,
            curR: r,
            l,
            r,
            len,
            n,
            scope: captureScope({ n, len, l, r, s, dpTable: dp }),
            currentCell: `dp[${l}][${r}]`,
            currentVal: 2 + innerVal,
            dpTable: snapshotGrid2D(dp),
            depCells: [
              { r: l + 1, c: r - 1, label: `左下内层子串 [${l + 1}][${r - 1}] = ${innerVal}`, color: 'rgba(16, 185, 129, 0.35)' },
            ],
            decision: `长度 len=${len}：s[${l}] ('${s[l]}') == s[${r}] ('${s[r]}') 匹配！`,
            message: `端点字符相同，依赖左下角内层子串 dp[${l + 1}][${r - 1}] (${innerVal})`,
            log: `compare match s[${l}] == s[${r}]`,
            codeLine: linesReverse.match,
            s,
            metrics: { 'metric-status': `长度${len}匹配探查`, 'metric-val': `${2 + innerVal}` },
          });

          // Phase B: Assign
          dp[l][r] = 2 + innerVal;
          steps.push({
            curL: l,
            curR: r,
            l,
            r,
            len,
            n,
            scope: captureScope({ n, len, l, r, s, dpTable: dp }),
            currentCell: `dp[${l}][${r}]`,
            currentVal: dp[l][r] as number,
            dpTable: snapshotGrid2D(dp),
            depCells: [
              { r: l + 1, c: r - 1, label: `左下内层子串 [${l + 1}][${r - 1}] = ${innerVal}`, color: 'rgba(16, 185, 129, 0.45)' },
            ],
            decision: `✨ 转移落盘：dp[${l}][${r}] = 2 + dp[${l + 1}][${r - 1}] = 2 + ${innerVal} = ${dp[l][r]}`,
            message: `两端匹配，回文长度由内层子串 +2 扩展`,
            log: `dp[${l}][${r}] = ${dp[l][r]}`,
            codeLine: linesReverse.match,
            s,
            metrics: { 'metric-status': `长度${len}落盘`, 'metric-val': `${dp[l][r]}` },
          });
        } else {
          const down = dp[l + 1][r] as number;
          const left = dp[l][r - 1] as number;
          const maxVal = Math.max(down, left);

          // Phase A: Probe
          steps.push({
            curL: l,
            curR: r,
            l,
            r,
            len,
            n,
            scope: captureScope({ n, len, l, r, s, dpTable: dp }),
            currentCell: `dp[${l}][${r}]`,
            currentVal: maxVal,
            dpTable: snapshotGrid2D(dp),
            depCells: [
              { r: l + 1, c: r, label: `下方 [${l + 1}][${r}] = ${down}`, color: 'rgba(129, 140, 248, 0.35)' },
              { r: l, c: r - 1, label: `左方 [${l}][${r - 1}] = ${left}`, color: 'rgba(56, 189, 248, 0.35)' },
            ],
            decision: `长度 len=${len}：s[${l}] ('${s[l]}') != s[${r}] ('${s[r]}') 不匹配`,
            message: `对比舍弃左端(下方=${down})与舍弃右端(左方=${left})两种子方案`,
            log: `compare mismatch s[${l}] != s[${r}]`,
            codeLine: linesReverse.mismatch,
            s,
            metrics: { 'metric-status': `长度${len}择优探查`, 'metric-val': `${maxVal}` },
          });

          // Phase B: Assign
          dp[l][r] = maxVal;
          steps.push({
            curL: l,
            curR: r,
            l,
            r,
            len,
            n,
            scope: captureScope({ n, len, l, r, s, dpTable: dp }),
            currentCell: `dp[${l}][${r}]`,
            currentVal: dp[l][r] as number,
            dpTable: snapshotGrid2D(dp),
            depCells: [
              { r: l + 1, c: r, label: `下方 [${l + 1}][${r}] = ${down}`, color: 'rgba(129, 140, 248, 0.45)' },
              { r: l, c: r - 1, label: `左方 [${l}][${r - 1}] = ${left}`, color: 'rgba(56, 189, 248, 0.45)' },
            ],
            decision: `转移落盘：dp[${l}][${r}] = max(下=${down}, 左=${left}) = ${dp[l][r]}`,
            message: `在下方与左方中取较大值 ${dp[l][r]} 落盘`,
            log: `dp[${l}][${r}] = ${dp[l][r]}`,
            codeLine: linesReverse.mismatch,
            s,
            metrics: { 'metric-status': `长度${len}落盘`, 'metric-val': `${dp[l][r]}` },
          });
        }
      }

      // 内层循环 l 退出
      steps.push({
        curL: n - len,
        curR: n - 1,
        l: n - len + 1,
        len,
        n,
        scope: captureScope({ n, len, l: n - len + 1, s, dpTable: dp }),
        currentCell: `l = ${n - len + 1} > ${n - len}`,
        currentVal: 0,
        dpTable: snapshotGrid2D(dp),
        depCells: [],
        decision: `内层循环结束：起点 l = ${n - len + 1} > ${n - len}，当前长度 len=${len} 的所有子串已求解完毕`,
        message: `退出 l 循环，准备进入下一条对角线`,
        log: `for l = ${n - len + 1} -> false (l loop done)`,
        codeLine: linesReverse.lLoop,
        s,
        metrics: { 'metric-status': `长度${len}推导完成`, 'metric-val': '-' },
      });
    }

    // 外层循环 len 退出
    steps.push({
      curL: 0,
      curR: n - 1,
      len: n + 1,
      n,
      scope: captureScope({ n, len: n + 1, s, dpTable: dp }),
      currentCell: `len = ${n + 1} > ${n}`,
      currentVal: 0,
      dpTable: snapshotGrid2D(dp),
      depCells: [],
      decision: `外层循环结束：len = ${n + 1} > ${n}，所有区间长度的子问题均已求解完毕`,
      message: '退出 len 循环，准备返回最终全局最优解',
      log: `for len = ${n + 1} -> false (len loop done)`,
      codeLine: linesReverse.lenLoop,
      s,
      metrics: { 'metric-status': '逆推全表填表完成', 'metric-val': '-' },
    });

    // Final step
    steps.push({
      curL: 0,
      curR: n - 1,
      currentCell: `dp[0][${n - 1}]`,
      currentVal: dp[0][n - 1] as number,
      dpTable: snapshotGrid2D(dp),
      depCells: [],
      decision: `🏆 逆推填表完成！全串 [0, ${n - 1}] 最长回文子序列长度为 dp[0][${n - 1}] = ${dp[0][n - 1]}`,
      message: '右上角单元格汇聚全串全局最优解',
      log: `return dp[0][${n - 1}] = ${dp[0][n - 1]}`,
      codeLine: linesReverse.return,
      s,
      metrics: { 'metric-status': '求解完成', 'metric-val': `${dp[0][n - 1]}` },
    });
  }

  // 为阶段 3 步骤自动装配状态转移拓扑决策树 (treeRoot)
  for (let idx = 0; idx < steps.length; idx++) {
    const step = steps[idx];
    if (step.treeRoot) continue;

    const l = step.curL ?? 0;
    const r = step.curR ?? 0;
    const currentVal = step.currentVal ?? 0;

    if (idx === steps.length - 1) {
      const doneTree = buildLpsStage3Tree(0, n - 1, dp[0][n - 1] ?? currentVal, 'done', s, dp);
      step.treeRoot = doneTree.treeRoot;
      step.activeNodeId = doneTree.activeNodeId;
    } else if (l === r) {
      const baseTree = buildLpsStage3Tree(l, r, 1, 'base', s, dp);
      step.treeRoot = baseTree.treeRoot;
      step.activeNodeId = baseTree.activeNodeId;
    } else if (l < r) {
      if (s[l] === s[r]) {
        const innerVal = l + 1 <= r - 1 ? (dp[l + 1]?.[r - 1] ?? 0) : 0;
        const matchTree = buildLpsStage3Tree(l, r, currentVal || (2 + innerVal), 'match', s, dp);
        step.treeRoot = matchTree.treeRoot;
        step.activeNodeId = matchTree.activeNodeId;
      } else {
        const downVal = l + 1 < n ? (dp[l + 1]?.[r] ?? 0) : 0;
        const leftVal = r - 1 >= 0 ? (dp[l]?.[r - 1] ?? 0) : 0;
        const diffTree = buildLpsStage3Tree(l, r, currentVal || Math.max(downVal, leftVal), 'diff', s, dp, downVal, leftVal);
        step.treeRoot = diffTree.treeRoot;
        step.activeNodeId = diffTree.activeNodeId;
      }
    } else {
      const initTree = buildLpsStage3Tree(0, n - 1, 0, 'init', s, dp);
      step.treeRoot = initTree.treeRoot;
      step.activeNodeId = initTree.activeNodeId;
    }
  }

  return steps;
}

// ==========================================
// 4. Stage 4: 空间压缩 + leftDown 暂存器
// ==========================================

export interface LpsSpaceOptStep {
  curL: number;
  curR: number;
  dp: number[];
  leftDown: number;
  decision: string;
  message: string;
  log: string;
  codeLine: ResolvedLineTarget;
  s: string;
  metrics?: Record<string, any>;
}

export function buildLpsStage4Steps(inputs: Record<string, any>, mode?: string): LpsSpaceOptStep[] {
  const { s } = parseLpsInputs(inputs);
  const isReverse = mode === 'reverse';
  const n = s.length;
  const steps: LpsSpaceOptStep[] = [];
  const dp = new Array(n).fill(0);

  const linesForward = {
    entry: getDp067Anchor(4, 'longest-palindromic-subsequence', 'entry'),
    allocDp: getDp067Anchor(4, 'longest-palindromic-subsequence', 'allocDp'),
    baseDiag: getDp067Anchor(4, 'longest-palindromic-subsequence', 'baseDiag'),
    initLeftDown: getDp067Anchor(4, 'longest-palindromic-subsequence', 'initLeftDown'),
    backup: getDp067Anchor(4, 'longest-palindromic-subsequence', 'backup'),
    match: getDp067Anchor(4, 'longest-palindromic-subsequence', 'match'),
    mismatch: getDp067Anchor(4, 'longest-palindromic-subsequence', 'mismatch'),
    shiftLeftDown: getDp067Anchor(4, 'longest-palindromic-subsequence', 'shiftLeftDown'),
    returnAns: getDp067Anchor(4, 'longest-palindromic-subsequence', 'returnAns'),
  };

  const linesReverse = { ...linesForward };
  const lines = isReverse ? linesReverse : linesForward;

  steps.push({
    curL: n - 1,
    curR: n - 1,
    dp: [...dp],
    leftDown: 0,
    decision: `主函数入口：${isReverse ? '逆推视角' : '顺推'}空间优化 lps4("${s}")`,
    message: `利用一维压缩数组从底向上 (l: ${n - 1} -> 0) 逆序推导，空间仅需 O(N)`,
    log: `enter lps4`,
    codeLine: lines.entry,
    s,
    metrics: { 'metric-space': `O(${n})`, 'metric-leftDown': '0' },
  });

  steps.push({
    curL: n - 1,
    curR: n - 1,
    dp: [...dp],
    leftDown: 0,
    decision: `初始化压缩一维数组: int[] dp = new int[${n}]`,
    message: `使用 leftDown 变量暂存被覆盖前的左下角对角线数据`,
    log: `alloc dp[${n}]`,
    codeLine: lines.allocDp,
    s,
    metrics: { 'metric-space': `O(${n})`, 'metric-leftDown': '0' },
  });

  for (let l = n - 1; l >= 0; l--) {
    dp[l] = 1;
    let leftDown = 0;

    steps.push({
      curL: l,
      curR: l,
      dp: [...dp],
      leftDown,
      decision: `第 l=${l} 行开始：单字符初始化 dp[${l}] = 1，重置 leftDown = 0`,
      message: `区间 [${l}, ${l}] 字符 '${s[l]}' 自身构成长度为 1 的回文`,
      log: `l=${l} init diag dp[${l}]=1, leftDown=0`,
      codeLine: lines.baseDiag,
      s,
      metrics: { 'metric-space': `dp[${l}]=1`, 'metric-leftDown': `${leftDown}` },
    });

    for (let r = l + 1; r < n; r++) {
      const backup = dp[r];
      steps.push({
        curL: l,
        curR: r,
        dp: [...dp],
        leftDown,
        decision: `准备更新 dp[${r}] (当前对应区间 [${l}, ${r}])。暂存原 dp[${r}]=${backup} 至 backup`,
        message: `原 dp[${r}] 代表下方 dp[${l + 1}][${r}]，其值将在下一列更新中充当 leftDown`,
        log: `backup dp[${r}]=${backup}`,
        codeLine: lines.backup,
        s,
        metrics: { 'metric-space': `backup=${backup}`, 'metric-leftDown': `${leftDown}` },
      });

      if (s[l] === s[r]) {
        dp[r] = 2 + leftDown;
        steps.push({
          curL: l,
          curR: r,
          dp: [...dp],
          leftDown,
          decision: `✨ 字符相等 s[${l}] == s[${r}] ('${s[l]}')！dp[${r}] = 2 + leftDown(${leftDown}) = ${dp[r]}`,
          message: `利用暂存的左下角数据完成对角线转移`,
          log: `dp[${r}] = 2 + ${leftDown} = ${dp[r]}`,
          codeLine: lines.match,
          s,
          metrics: { 'metric-space': `dp[${r}]=${dp[r]}`, 'metric-leftDown': `${leftDown}` },
        });
      } else {
        const downVal = dp[r];
        const leftVal = dp[r - 1];
        dp[r] = Math.max(downVal, leftVal);
        steps.push({
          curL: l,
          curR: r,
          dp: [...dp],
          leftDown,
          decision: `字符不等 s[${l}] != s[${r}]。dp[${r}] = max(下=${downVal}, 左=${leftVal}) = ${dp[r]}`,
          message: `未覆盖的 dp[${r}] 代表正下方，刚更新的 dp[${r - 1}] 代表正左方`,
          log: `dp[${r}] = max(${downVal}, ${leftVal}) = ${dp[r]}`,
          codeLine: lines.mismatch,
          s,
          metrics: { 'metric-space': `dp[${r}]=${dp[r]}`, 'metric-leftDown': `${leftDown}` },
        });
      }

      leftDown = backup;
      steps.push({
        curL: l,
        curR: r,
        dp: [...dp],
        leftDown,
        decision: `移动寄存器：leftDown = backup (${backup})，为计算下一列 [${l}, ${r + 1}] 做准备`,
        message: `当前列的下方旧值转化为下一列的左下方旧值`,
        log: `leftDown = ${backup}`,
        codeLine: lines.shiftLeftDown,
        s,
        metrics: { 'metric-space': `dp[${r}]=${dp[r]}`, 'metric-leftDown': `${leftDown}` },
      });
    }
  }

  steps.push({
    curL: 0,
    curR: n - 1,
    dp: [...dp],
    leftDown: 0,
    decision: `🏆 一维滚动压缩求解完成！全串最长回文子序列长度为 dp[${n - 1}] = ${dp[n - 1]}`,
    message: '仅使用 O(N) 空间与 1 个辅助变量完成全部计算',
    log: `return dp[${n - 1}] = ${dp[n - 1]}`,
    codeLine: lines.returnAns,
    s,
    metrics: { 'metric-space': 'O(N) 空间', 'metric-val': `${dp[n - 1]}` },
  });

  return steps;
}

// ==========================================
// 5. 声明式注册与可视化挂载
// ==========================================

const { template, Visualizer } = registerDeclarativeAlgorithm<any>({
  id: 'longest-palindromic-subsequence',
  name: '最长回文子序列 (LPS)',
  category: 'dynamic-programming',
  description: '左程云算法讲解067 Code04：LeetCode 516 最长回文子序列，区间DP经典半三角矩阵与 leftDown 空间压缩',
  icon: '🪞',
  difficulty: 2,
  levelOrder: 104,
  learningGoal: '理解区间DP的定义、自底向上填表顺序的必然性以及 leftDown 暂存器在对角线压缩中的关键作用',
  badge: {
    mode: '区间 DP · 半三角矩阵',
    complexity: 'O(N^2) · O(N) 空间',
  },
  primaryVisual: {
    title: '🪞 字符串回文对称区间雷达',
    render: (container, step) => {
      const curL = step.curL ?? step.l ?? 0;
      const curR = step.curR ?? step.r ?? (step.s ? step.s.length - 1 : 0);
      renderIntervalView(container, step.s, curL, curR);
    },
  },
  auxiliaryVisual: {
    title: '📈 半三角状态矩阵与 leftDown 暂存',
    desc: '展示区间从单字符向外扩展、自底向上递推以及一维空间压缩技巧',
    render: (container, step) => {
      const curR = step.curR ?? step.r ?? 0;
      const dpArr = step.dp || [step.currentVal || 0];
      renderSpaceOptCard2(
        container,
        `一维滚动数组 dp[0..${dpArr.length - 1}]`,
        dpArr,
        curR,
        'leftDown',
        step.leftDown ?? 0,
        (step.s || '').split('')
      );
    },
  },
  legend: [
    { label: '首尾字符匹配', color: '#10b981' },
    { label: '当前区间端点', color: '#38bdf8' },
    { label: '区间外字符', color: '#475569' },
  ],
  inputs: [
    { id: 'input-s', label: '字符串 s:', type: 'text', defaultValue: 'bbbab', width: '140px' },
  ],
  presets: [
    { label: 'LeetCode 样例 1 ("bbbab" Ans=4)', values: { 'input-s': 'bbbab' } },
    { label: 'LeetCode 样例 2 ("cbbd" Ans=2)', values: { 'input-s': 'cbbd' } },
    { label: '回文串 ("racecar" Ans=7)', values: { 'input-s': 'racecar' } },
  ],
  metrics: [
    { id: 'metric-interval', label: '当前区间', color: '#38bdf8' },
    { id: 'metric-status', label: '状态', color: '#10b981' },
  ],
  codeLanguages: DP_067_PROBLEMS['longest-palindromic-subsequence'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['longest-palindromic-subsequence'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['longest-palindromic-subsequence'].analysisHtml,

  modes: [
    { id: 'forward', label: '顺推' },
    { id: 'reverse', label: '逆推' },
  ],
  defaultMode: 'forward',
  defaultStage: 'stage-1',
  buildSteps: buildLpsStage1Steps,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^N)',
      theme: 'bg-blue',
      badge: {
        mode: '区间模型 · 暴力递归',
        complexity: 'O(2^N) · O(N) 栈深',
      },
      card1Title: '🎯 上三角区间递归探索网格 (l, r)',
      card2Title: '🌿 递归搜索调用树 与 🪞 字符串区间首尾探查',
      card2Desc: '展现实时 DFS 调用分支，首尾匹配向内收缩，不匹配时分叉探查舍左与舍右；支持一键切换字符比对卡片。',
      legend: [
        { label: '首尾字符匹配 (+2)', color: '#10b981' },
        { label: '单字符基底 (1)', color: '#0284c7' },
        { label: '待探查', color: '#94a3b8' },
      ],
      metrics: [
        { id: 'metric-interval', label: '当前区间', color: '#38bdf8' },
        { id: 'metric-status', label: '状态', color: '#10b981' },
      ],
      codeLanguages: LPS_STAGE1_FORWARD_CODE_LANGUAGES,
      modeCodeLanguages: {
        forward: LPS_STAGE1_FORWARD_CODE_LANGUAGES,
        reverse: LPS_STAGE1_CODE_LANGUAGES,
      },
      has3D: true,
      buildSteps: (inputs: Record<string, any>, mode?: string) => buildLpsStage1Steps(inputs, mode),
      renderCanvas: (container, step, extra) => {
        const curL = step.curL ?? step.l ?? 0;
        const curR = step.curR ?? step.r ?? 0;
        renderStage1GridCard(
          container,
          'LPS 上三角递归探索网格 (l, r)',
          step.s.length,
          step.s.length,
          curL,
          curR,
          step.s.split(''),
          step.s.split(''),
          extra?.is3DMode,
          step,
          {
            modelId: 'longest-palindromic-subsequence',
            isUpperTriangle: true,
            cornerLabel: 'l \\ r',
          }
        );
      },
      renderCustomMetrics: (container, step) => {
        renderLcsCard2CompoundView(
          container,
          (treeBox) => RecursionTreeAdapter.renderRecursionTree(treeBox, step.treeRoot, step.activeNodeId, false),
          (strBox) => renderIntervalView(strBox, step.s, step.curL ?? step.l ?? 0, step.curR ?? step.r ?? 0)
        );
      },
      primaryVisual: {
        title: '🎯 上三角区间递归探索网格 (l, r)',
        render: (container, step, extra) => {
          const curL = step.curL ?? step.l ?? 0;
          const curR = step.curR ?? step.r ?? 0;
          renderStage1GridCard(
            container,
            'LPS 上三角递归探索网格 (l, r)',
            step.s.length,
            step.s.length,
            curL,
            curR,
            step.s.split(''),
            step.s.split(''),
            extra?.is3DMode,
            step,
            {
              modelId: 'longest-palindromic-subsequence',
              isUpperTriangle: true,
              cornerLabel: 'l \\ r',
            }
          );
        },
      },
      auxiliaryVisual: {
        title: '🌿 递归搜索调用树 与 🪞 字符串区间首尾探查',
        desc: '展现实时 DFS 调用分支，首尾匹配向内收缩，不匹配时分叉探查舍左与舍右；支持一键切换字符比对卡片。',
        render: (container, step) => {
          renderLcsCard2CompoundView(
            container,
            (treeBox) => RecursionTreeAdapter.renderRecursionTree(treeBox, step.treeRoot, step.activeNodeId, false),
            (strBox) => renderIntervalView(strBox, step.s, step.curL ?? step.l ?? 0, step.curR ?? step.r ?? 0)
          );
        },
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N^2)',
      theme: 'bg-blue',
      badge: {
        mode: '区间模型 · 上三角备忘录',
        complexity: 'O(N^2) · O(N^2) 空间',
      },
      card1Title: '🎯 2D 备忘录矩阵 memo[l][r] (上三角)',
      card2Title: '💾 记忆化搜索剪枝树 与 📊 缓存命中探查',
      card2Desc: '遇重复子问题直接命中缓存并剪枝回溯，杜绝指数级爆炸；支持一键切换诊断卡片。',
      legend: [
        { label: '缓存命中 (Hit)', color: '#10b981' },
        { label: '未命中算值 (Miss)', color: '#ef4444' },
        { label: '未计算 (-1)', color: '#94a3b8' },
      ],
      metrics: [
        { id: 'metric-interval', label: '当前探查区间', color: '#38bdf8' },
        { id: 'metric-status', label: '状态', color: '#10b981' },
        { id: 'metric-hits', label: '剪枝命中数', color: '#10b981' },
        { id: 'metric-misses', label: '展开未命中', color: '#ef4444' },
      ],
      codeLanguages: LPS_STAGE2_FORWARD_CODE_LANGUAGES,
      modeCodeLanguages: {
        forward: LPS_STAGE2_FORWARD_CODE_LANGUAGES,
        reverse: LPS_STAGE2_CODE_LANGUAGES,
      },
      has3D: true,
      buildSteps: (inputs: Record<string, any>, mode?: string) => buildLpsStage2Steps(inputs, mode),
      renderCanvas: (container, step, extra) => {
        const curL = step.curL ?? step.l ?? 0;
        const curR = step.curR ?? step.r ?? 0;
        renderMemoGridCard(
          container,
          'LPS 上三角备忘录 memo[l][r]',
          step.memoGrid,
          curL,
          curR,
          step.s.split(''),
          step.s.split(''),
          extra?.is3DMode,
          step,
          {
            modelId: 'longest-palindromic-subsequence',
            isUpperTriangle: true,
            cornerLabel: 'l \\ r',
          }
        );
      },
      renderCustomMetrics: (container, step) => {
        renderLcsCard2CompoundView(
          container,
          (treeBox) => RecursionTreeAdapter.renderRecursionTree(treeBox, step.treeRoot, step.activeNodeId, true),
          (memoBox) => renderMemoCard1(
            memoBox,
            step.currentCall,
            step.memoHit,
            step.hitCount,
            step.missCount,
            step.decision,
            step.message,
            step.cachedVal
          )
        );
      },
      primaryVisual: {
        title: '🎯 2D 备忘录矩阵 memo[l][r] (上三角)',
        render: (container, step, extra) => {
          const curL = step.curL ?? step.l ?? 0;
          const curR = step.curR ?? step.r ?? 0;
          renderMemoGridCard(
            container,
            'LPS 上三角备忘录 memo[l][r]',
            step.memoGrid,
            curL,
            curR,
            step.s.split(''),
            step.s.split(''),
            extra?.is3DMode,
            step,
            {
              modelId: 'longest-palindromic-subsequence',
              isUpperTriangle: true,
              cornerLabel: 'l \\ r',
            }
          );
        },
      },
      auxiliaryVisual: {
        title: '💾 记忆化搜索剪枝树 与 📊 缓存命中探查',
        desc: '遇重复子问题直接命中缓存并剪枝回溯，杜绝指数级爆炸；支持一键切换诊断卡片。',
        render: (container, step) => {
          renderLcsCard2CompoundView(
            container,
            (treeBox) => RecursionTreeAdapter.renderRecursionTree(treeBox, step.treeRoot, step.activeNodeId, true),
            (memoBox) => renderMemoCard1(
              memoBox,
              step.currentCall,
              step.memoHit,
              step.hitCount,
              step.missCount,
              step.decision,
              step.message,
              step.cachedVal
            )
          );
        },
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 严格区间 DP 半三角表',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N^2)',
      theme: 'bg-emerald',
      badge: {
        mode: '区间模型 · 自底向上半三角表',
        complexity: 'O(N^2) · O(N^2)',
      },
      legend: [
        { label: '当前填表 dp[l][r]', color: '#10b981' },
        { label: '依赖前驱单元格', color: '#6366f1' },
        { label: '已计算', color: '#64748b' },
      ],
      metrics: [
        { id: 'metric-status', label: '状态', color: '#10b981' },
        { id: 'metric-val', label: '当前计算值', color: '#f59e0b' },
      ],
      codeLanguages: LPS_STAGE3_CODE_LANGUAGES,
      modeCodeLanguages: {
        forward: LPS_STAGE3_CODE_LANGUAGES,
        reverse: LPS_STAGE3_REVERSE_CODE_LANGUAGES,
      },
      buildSteps: (inputs: Record<string, any>, mode?: string) => buildLpsStage3Steps(inputs, mode),
      primaryVisual: {
        title: '📊 严格半三角状态表 dp[l][r]',
        render: (container, step) => {
          renderDp2DCard2(
            container,
            '半三角二维状态表 dp[l][r]',
            step.dpTable,
            step.curL,
            step.curR,
            step.depCells.map((d: DpCellDep) => ({ r: d.r, c: d.c })),
            step.s.split(''),
            step.s.split(''),
            undefined,
            {
              modelId: 'longest-palindromic-subsequence',
              isUpperTriangle: true,
              cornerLabel: 'l \\ r',
            }
          );
        },
      },
      auxiliaryVisual: {
        title: '📐 状态转移推导与区间扩展',
        desc: '展示区间长度 len 由小到大向外扩展的严格半三角填表推导',
        render: (container, step) => {
          renderDp2DCard1(
            container,
            step.currentCell,
            step.currentVal,
            step.depCells,
            step.decision,
            step.message,
            step.treeRoot,
            step.activeNodeId
          );
        },
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间压缩',
      shortName: '空间优化',
      num: 4,
      timeBadge: 'O(N) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '区间模型 · leftDown 寄存器暂存优化',
        complexity: 'O(N^2) · O(N) 空间',
      },
      legend: [
        { label: '当前更新 dp[r]', color: '#f59e0b' },
        { label: 'leftDown 暂存器', color: '#6366f1' },
        { label: '历史一维值', color: '#0284c7' },
      ],
      metrics: [
        { id: 'metric-space', label: '一维压缩状态', color: '#38bdf8' },
        { id: 'metric-leftDown', label: 'leftDown 寄存器', color: '#f59e0b' },
      ],
      codeLanguages: LPS_STAGE4_CODE_LANGUAGES,
      modeCodeLanguages: {
        forward: LPS_STAGE4_CODE_LANGUAGES,
        reverse: LPS_STAGE4_REVERSE_CODE_LANGUAGES,
      },
      buildSteps: (inputs: Record<string, any>, mode?: string) => buildLpsStage4Steps(inputs, mode),
      primaryVisual: {
        title: '🪞 字符串回文对称区间雷达',
        render: (container, step) => {
          renderIntervalView(container, step.s, step.curL, step.curR);
        },
      },
      auxiliaryVisual: {
        title: '📈 空间压缩一维向量与 leftDown 暂存器',
        render: (container, step) => {
          renderSpaceOptCard2(
            container,
            `一维滚动数组 dp[0..${step.dp.length - 1}]`,
            step.dp,
            step.curR,
            'leftDown',
            step.leftDown,
            step.s.split('')
          );
        },
      },
    },
  ],
});

function renderIntervalView(
  container: HTMLElement,
  s: string,
  curL: number,
  curR: number
): void {
  if (!container || !s) return;
  const chars = s.split('').map((ch, idx) => {
    const isL = idx === curL;
    const isR = idx === curR;
    const inInterval = idx >= curL && idx <= curR;

    let bg = '#ffffff';
    let border = '1px solid #e2e8f0';
    let textCol = '#64748b';
    let shadow = 'none';

    if (isL || isR) {
      bg = '#e0f2fe';
      border = '2px solid #0284c7';
      textCol = '#0369a1';
      shadow = '0 2px 6px rgba(2, 132, 199, 0.15)';
    } else if (inInterval) {
      bg = '#f0fdf4';
      border = '1.5px solid #bbf7d0';
      textCol = '#166534';
    }

    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      ">
        <span style="font-size: 10px; font-family: monospace; font-weight: 700; color: ${isL || isR ? '#0284c7' : '#94a3b8'};">
          ${isL && isR ? 'L=R' : isL ? 'L' : isR ? 'R' : `${idx}`}
        </span>
        <div style="
          padding: 8px 14px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 15px;
          font-weight: 800;
          background: ${bg};
          border: ${border};
          color: ${textCol};
          box-shadow: ${shadow};
          min-width: 32px;
          text-align: center;
        ">${ch}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 480px;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">当前探查区间 [${curL}, ${curR}]</span>
        <span style="font-size: 11px; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 9999px; font-family: monospace; font-weight: 700;">跨度: ${Math.max(0, curR - curL + 1)}</span>
      </div>
      <div style="display: flex; gap: 8px; overflow-x: auto; max-width: 100%; padding: 6px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        ${chars}
      </div>
    </div>
  `;
}

export const LongestPalindromicSubsequenceVisualizer = Visualizer;
