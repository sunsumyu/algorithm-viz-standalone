/**
 * 最长公共子序列 LCS (LeetCode 1143) - 声明式 4-Card 沙盘渲染器
 * 核心：双串样本对应模型、严格对角线依赖与 leftUp 空间压缩暂存
 * 涵盖：
 * 阶段 1: 暴力递归 f(i, j)
 * 阶段 2: 记忆化搜索 memo[i][j]
 * 阶段 3: 严格二维表 dp[i][j]
 * 阶段 4: 空间压缩 dp[j] + leftUp 暂存寄存器
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { DP_067_PROBLEMS } from './dp-067-problem-content';
import {
  LCS_STAGE1_CODE_LANGUAGES,
  LCS_STAGE2_CODE_LANGUAGES,
  LCS_STAGE3_CODE_LANGUAGES,
  LCS_STAGE4_CODE_LANGUAGES,
} from './dp-067-stage-codes';
import {
  renderRecursionCard1,
  renderMemoCard1,
  renderMemoGridCard,
  renderDp2DCard1,
  renderDp2DCard2,
  renderSpaceOptCard2,
  DpCellDep,
} from './dp-067-shared';

export function parseLcsInputs(inputs: Record<string, any>) {
  const s1 = String(inputs?.['input-s1'] || 'abcde').trim();
  const s2 = String(inputs?.['input-s2'] || 'ace').trim();
  return { s1, s2 };
}

// ==========================================
// 1. Stage 1: 暴力递归
// ==========================================

export interface LcsTreeNode {
  id: string;
  r: number;
  c: number;
  val: string;
  edgeLabel?: string;
  status: string;
  tag?: string;
  children: LcsTreeNode[];
}

export function cloneLcsTree(node: LcsTreeNode | null): LcsTreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    r: node.r,
    c: node.c,
    val: node.val,
    edgeLabel: node.edgeLabel,
    status: node.status,
    tag: node.tag,
    children: (node.children || []).map((c) => cloneLcsTree(c)!),
  };
}

export interface LcsRecStep {
  currentCall: string;
  i: number;
  j: number;
  callStack: Array<{ label: string }>;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  s1: string;
  s2: string;
  metrics?: Record<string, any>;
  treeRoot?: LcsTreeNode | null;
  activeNodeId?: string;
}

export function buildLcsStage1Steps(inputs: Record<string, any>): LcsRecStep[] {
  const { s1, s2 } = parseLcsInputs(inputs);
  const steps: LcsRecStep[] = [];
  const stack: Array<{ label: string }> = [];

  let nodeIdCounter = 0;
  const rootTreeNode: LcsTreeNode = {
    id: `node-${++nodeIdCounter}`,
    r: s1.length - 1,
    c: s2.length - 1,
    val: `f(${s1.length - 1},${s2.length - 1})`,
    status: 'current',
    children: [],
  };

  const lines = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    callEntry: { java: 5, cpp: 3, python: 10, javascript: 12 },
    fEntry: { java: 7, cpp: 5, python: 3, javascript: 3 },
    baseCheck: { java: 8, cpp: 6, python: 4, javascript: 4 },
    baseReturn: { java: 9, cpp: 7, python: 5, javascript: 5 },
    charCheck: { java: 11, cpp: 9, python: 6, javascript: 7 },
    diagMatchCall: { java: 12, cpp: 10, python: 7, javascript: 8 },
    branchUpCall: { java: 14, cpp: 12, python: 8, javascript: 10 },
    branchLeftCall: { java: 15, cpp: 13, python: 9, javascript: 11 },
    combineMaxReturn: { java: 16, cpp: 14, python: 10, javascript: 12 },
  };

  // Step 0: 主函数签名入口
  steps.push({
    currentCall: `lcs1("${s1}", "${s2}")`,
    i: s1.length - 1,
    j: s2.length - 1,
    callStack: [],
    decision: `主函数入口：求解 "${s1}" 与 "${s2}" 的最长公共子序列`,
    message: `准备计算长度，两字符串长度分别为 ${s1.length} 与 ${s2.length}`,
    log: `| 📥 进入 lcs1: s1="${s1}", s2="${s2}"`,
    codeLine: lines.entry,
    s1,
    s2,
    metrics: { 'metric-pos': `len(s1)=${s1.length}, len(s2)=${s2.length}`, 'metric-status': '主函数入口' },
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  // Step 1: 启动辅助递归函数
  steps.push({
    currentCall: `f(${s1.length - 1}, ${s2.length - 1})`,
    i: s1.length - 1,
    j: s2.length - 1,
    callStack: [],
    decision: `执行调用：return f(a, b, s1.len-1, s2.len-1)`,
    message: `传入末尾索引 i=${s1.length - 1} 与 j=${s2.length - 1} 启动递归求解`,
    log: `| 🚀 执行 return f(a, b, i=${s1.length - 1}, j=${s2.length - 1}) 启动递归`,
    codeLine: lines.callEntry,
    s1,
    s2,
    metrics: { 'metric-pos': `i=${s1.length - 1}, j=${s2.length - 1}`, 'metric-status': '启动递归' },
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  let callCount = 0;

  function f(i: number, j: number, parentNode?: LcsTreeNode, edgeLabel?: string): number {
    if (steps.length > 500) return 0;
    callCount++;
    const indent = '| '.repeat(stack.length + 1);

    let currentNode: LcsTreeNode;
    if (!parentNode) {
      currentNode = rootTreeNode;
    } else {
      currentNode = {
        id: `node-${++nodeIdCounter}`,
        r: i,
        c: j,
        val: `f(${i},${j})`,
        edgeLabel,
        status: 'current',
        children: [],
      };
      parentNode.children.push(currentNode);
    }

    // 1. 函数签名帧 (Callee Entry Frame)
    stack.push({ label: `f(${i}, ${j})` });
    steps.push({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      callStack: [...stack],
      decision: `进入递归函数 f(i=${i}, j=${j})`,
      message: `探查子串 s1[0..${i}]("${s1.slice(0, Math.max(0, i + 1))}") 与 s2[0..${j}]("${s2.slice(0, Math.max(0, j + 1))}")`,
      log: `${indent}📥 进入 f(i=${i}, j=${j}) [调用 #${callCount}]`,
      codeLine: lines.fEntry,
      s1,
      s2,
      metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '递归入口' },
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    // 2. 边界检查帧 (Guard Check Frame)
    const isBase = i < 0 || j < 0;
    if (isBase) {
      currentNode.status = 'base';
      currentNode.tag = '🛡️0';
      currentNode.val = `f(${i},${j})=0`;
    }
    steps.push({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      callStack: [...stack],
      decision: isBase
        ? `边界特判：达到空串基底 (${i < 0 ? `i=${i}<0` : `j=${j}<0`})`
        : `边界检查：i=${i} >= 0 且 j=${j} >= 0，索引均合法`,
      message: isBase
        ? `任一字符串已耗尽，无法构成任何公共字符，准备返回 0`
        : `索引未越界，未达到空串基底，继续执行字符比对`,
      log: isBase
        ? `${indent}🛡️ 【边界检查】f(i=${i}, j=${j}) 索引越界 (${i < 0 ? `i=${i}<0` : `j=${j}<0`})`
        : `${indent}🛡️ 【边界检查】f(i=${i}, j=${j}) 索引有效 (i>=0 && j>=0)`,
      codeLine: lines.baseCheck,
      s1,
      s2,
      metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': isBase ? '边界拦截' : '边界有效' },
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    if (isBase) {
      // 2b. 边界返回帧 (Guard Return Frame)
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `边界返回：return 0`,
        message: `空串公共子序列长度为 0，向上层回溯`,
        log: `${indent}🛑 【边界返回】f(i=${i}, j=${j}) 达到空串基底，return 0`,
        codeLine: lines.baseReturn,
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '边界返回 0', 'metric-ans': '0' },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      stack.pop();
      return 0;
    }

    // 3. 字符比对帧 (Char Check Frame)
    const c1 = s1[i];
    const c2 = s2[j];
    const isMatch = c1 === c2;
    steps.push({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      callStack: [...stack],
      decision: `字符比对：s1[${i}]('${c1}') 与 s2[${j}]('${c2}')`,
      message: isMatch
        ? `✨ 两字符相同 ('${c1}' == '${c2}')！触发对角线缩小两边规模`
        : `两字符不同 ('${c1}' != '${c2}')，必须分别分叉尝试忽略其中一串末尾字符`,
      log: isMatch
        ? `${indent}🔍 【字符比较】f(i=${i}, j=${j}) s1[${i}]('${c1}') == s2[${j}]('${c2}')，匹配成功！`
        : `${indent}🔍 【字符比较】f(i=${i}, j=${j}) s1[${i}]('${c1}') != s2[${j}]('${c2}')，不匹配`,
      codeLine: lines.charCheck,
      s1,
      s2,
      metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': isMatch ? '匹配成功' : '字符不匹配' },
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    if (isMatch) {
      // 4a. 对角线分支探索步 (Caller Frame)
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `触发对角线递归：调用 1 + f(i=${i - 1}, j=${j - 1})`,
        message: `将公共字符 '${c1}' 纳入 LCS (+1)，向左上对角线缩小双串规模`,
        log: `${indent}↖️ 【对角线递归】f(i=${i}, j=${j}) 字符相同，深入探索子问题 f(i=${i - 1}, j=${j - 1})`,
        codeLine: lines.diagMatchCall,
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '对角线递归' },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });

      const sub = f(i - 1, j - 1, currentNode, `↖️'${c1}'`);
      const ans = 1 + sub;
      currentNode.status = 'visited';
      currentNode.tag = `↖️${ans}`;
      currentNode.val = `f(${i},${j})=${ans}`;

      // 4b. 对角线分支返回步 (Return Frame)
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `对角线计算完成：1 + f(${i - 1}, ${j - 1}) = 1 + ${sub} = ${ans}`,
        message: `公共字符 '${c1}' 累加子问题最优解 ${sub}，得到本层结果 ${ans}，向上返回`,
        log: `${indent}↩️ 【对角线返回】f(i=${i}, j=${j}) 得到 1 + f(${i - 1}, ${j - 1}) = 1 + ${sub} = ${ans}，return ${ans}`,
        codeLine: lines.diagMatchCall,
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '对角线返回', 'metric-ans': `${ans}` },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      stack.pop();
      return ans;
    } else {
      // 5a. 分支 1 探索步：向上（忽略 s1[i]）(Caller Frame)
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `分支 1 探索：调用 p1 = f(i=${i - 1}, j=${j})`,
        message: `假设 s1[${i}]('${c1}') 不在 LCS 中，将其舍弃并向上探索子问题`,
        log: `${indent}⬆️ 【向上分支】f(i=${i}, j=${j}) 忽略 s1[${i}]('${c1}')，深入探索子问题 f(i=${i - 1}, j=${j})`,
        codeLine: lines.branchUpCall,
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '向上分支探索' },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const p1 = f(i - 1, j, currentNode, '⬆️上');

      // 5b. 分支 2 探索步：向左（忽略 s2[j]）(Caller Frame)
      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `分支 2 探索：调用 p2 = f(i=${i}, j=${j - 1})`,
        message: `假设 s2[${j}]('${c2}') 不在 LCS 中，将其舍弃并向左探索子问题`,
        log: `${indent}⬅️ 【向左分支】f(i=${i}, j=${j}) 忽略 s2[${j}]('${c2}')，深入探索子问题 f(i=${i}, j=${j - 1})`,
        codeLine: lines.branchLeftCall,
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '向左分支探索' },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const p2 = f(i, j - 1, currentNode, '⬅️左');

      // 5c. 汇聚比较返回步 (Combine Return Frame)
      const ans = Math.max(p1, p2);
      currentNode.status = 'visited';
      currentNode.tag = `🔀${ans}`;
      currentNode.val = `f(${i},${j})=${ans}`;

      steps.push({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `分支汇聚取优：max(向上p1=${p1}, 向左p2=${p2}) = ${ans}`,
        message: `在舍弃 s1[${i}] 与舍弃 s2[${j}] 两路独立决策中取最大收益并返回`,
        log: `${indent}↩️ 【分支汇总】f(i=${i}, j=${j}) 取 max(p1=${p1}, p2=${p2}) = ${ans}，return ${ans}`,
        codeLine: lines.combineMaxReturn,
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '分支汇聚', 'metric-ans': `${ans}` },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      stack.pop();
      return ans;
    }
  }

  f(s1.length - 1, s2.length - 1);
  return steps;
}

// ==========================================
// 2. Stage 2: 记忆化搜索
// ==========================================

export interface LcsMemoStep {
  currentCall: string;
  i: number;
  j: number;
  memoHit: boolean;
  hitCount: number;
  missCount: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  memoGrid: number[][];
  cachedVal?: number;
  s1: string;
  s2: string;
  metrics?: Record<string, any>;
  treeRoot?: LcsTreeNode | null;
  activeNodeId?: string;
}

export function buildLcsStage2Steps(inputs: Record<string, any>): LcsMemoStep[] {
  const { s1, s2 } = parseLcsInputs(inputs);
  const n = s1.length;
  const m = s2.length;
  const steps: LcsMemoStep[] = [];
  const memo: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(-1));
  const stack: Array<{ label: string }> = [];
  let hitCount = 0;
  let missCount = 0;
  let callCount = 0;

  let nodeIdCounter = 0;
  const rootTreeNode: LcsTreeNode = {
    id: `memo-node-${++nodeIdCounter}`,
    r: n,
    c: m,
    val: `f(${n},${m})`,
    status: 'current',
    children: [],
  };

  const lines2 = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    allocMemo: { java: 4, cpp: 4, python: 4, javascript: 4 },
    callEntry: { java: 6, cpp: 5, python: 17, javascript: 18 },
    fEntry: { java: 8, cpp: 7, python: 5, javascript: 5 },
    baseCheck: { java: 9, cpp: 8, python: 6, javascript: 6 },
    baseReturn: { java: 10, cpp: 9, python: 7, javascript: 7 },
    memoCheck: { java: 12, cpp: 11, python: 8, javascript: 9 },
    memoHitReturn: { java: 13, cpp: 12, python: 9, javascript: 10 },
    charCheck: { java: 15, cpp: 14, python: 10, javascript: 12 },
    diagMatchCall: { java: 16, cpp: 15, python: 11, javascript: 13 },
    branchUpCall: { java: 18, cpp: 17, python: 13, javascript: 15 },
    branchLeftCall: { java: 19, cpp: 18, python: 14, javascript: 16 },
    combineStoreReturn: { java: 20, cpp: 19, python: 15, javascript: 17 },
  };

  // Step 0: 主函数入口
  steps.push({
    currentCall: `lcs2("${s1}", "${s2}")`,
    i: n,
    j: m,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `主函数入口：lcs2("${s1}", "${s2}")`,
    message: `准备利用 ${n + 1}×${m + 1} 备忘录消除重叠子问题`,
    log: `| 📥 进入 lcs2: s1="${s1}", s2="${s2}"`,
    codeLine: lines2.entry,
    memoGrid: memo.map((r) => [...r]),
    s1,
    s2,
    metrics: { 'metric-status': '主函数入口', 'metric-hits': '0' },
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  // Step 1: 分配 memo 矩阵
  steps.push({
    currentCall: `lcs2("${s1}", "${s2}")`,
    i: n,
    j: m,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `初始化备忘录：int[][] memo = new int[${n + 1}][${m + 1}], 全部填入 -1`,
    message: `-1 代表该子问题尚未求解，>=0 代表已缓存的最优值`,
    log: `| 📋 分配并初始化 memo[${n + 1}][${m + 1}] = -1`,
    codeLine: lines2.allocMemo,
    memoGrid: memo.map((r) => [...r]),
    s1,
    s2,
    metrics: { 'metric-status': '初始化备忘录', 'metric-hits': '0' },
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  // Step 2: 启动递归
  steps.push({
    currentCall: `f(${n}, ${m})`,
    i: n,
    j: m,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `执行调用：return f(s1, s2, n=${n}, m=${m}, memo)`,
    message: `以完整长度 n=${n} 与 m=${m} 启动带备忘录的深度递归`,
    log: `| 🚀 执行 return f(s1, s2, i=${n}, j=${m}, memo) 启动记忆化搜索`,
    codeLine: lines2.callEntry,
    memoGrid: memo.map((r) => [...r]),
    s1,
    s2,
    metrics: { 'metric-pos': `i=${n}, j=${m}`, 'metric-status': '启动搜索' },
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  function fMemo(i: number, j: number, parentNode?: LcsTreeNode, edgeLabel?: string): number {
    if (steps.length > 500) return 0;
    callCount++;
    const indent = '| '.repeat(stack.length + 1);

    let currentNode: LcsTreeNode;
    if (!parentNode) {
      currentNode = rootTreeNode;
    } else {
      currentNode = {
        id: `memo-node-${++nodeIdCounter}`,
        r: i,
        c: j,
        val: `f(${i},${j})`,
        edgeLabel,
        status: 'current',
        children: [],
      };
      parentNode.children.push(currentNode);
    }

    // 1. 函数签名帧
    stack.push({ label: `f(${i}, ${j})` });
    steps.push({
      currentCall: `fMemo(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: `进入递归函数 f(i=${i}, j=${j})`,
      message: `考察长度为 ${i} 的前缀 "${s1.slice(0, i)}" 与长度为 ${j} 的前缀 "${s2.slice(0, j)}"`,
      log: `${indent}📥 进入 f(i=${i}, j=${j}) [调用 #${callCount}]`,
      codeLine: lines2.fEntry,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '递归入口' },
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    // 2. 边界检查
    const isBase = i === 0 || j === 0;
    if (isBase) {
      currentNode.status = 'base';
      currentNode.tag = '🛡️0';
      currentNode.val = `f(${i},${j})=0`;
    }
    steps.push({
      currentCall: `fMemo(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: isBase
        ? `边界特判：空串基底 (i=${i}==0 || j=${j}==0)`
        : `边界检查：i=${i} > 0 且 j=${j} > 0，有效子问题`,
      message: isBase ? `空串基底无需查备忘录，直接返回 0` : `非边界，准备检查备忘录缓存`,
      log: isBase
        ? `${indent}🛡️ 【边界检查】f(i=${i}, j=${j}) 达到空串基底 (${i === 0 ? 'i=0' : 'j=0'})`
        : `${indent}🛡️ 【边界检查】f(i=${i}, j=${j}) 索引有效 (i>0 && j>0)`,
      codeLine: lines2.baseCheck,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': isBase ? '边界拦截' : '边界有效' },
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    if (isBase) {
      steps.push({
        currentCall: `fMemo(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        cachedVal: 0,
        decision: `边界返回：return 0`,
        message: `空串无法提供任何公共字符，返回 0`,
        log: `${indent}🛑 【边界返回】f(i=${i}, j=${j}) return 0`,
        codeLine: lines2.baseReturn,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '边界返回 0', 'metric-ans': '0' },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      stack.pop();
      return 0;
    }

    // 3. 检查备忘录
    const isHit = memo[i][j] !== -1;
    if (isHit) {
      currentNode.status = 'pruned';
      currentNode.tag = `🎯命中=${memo[i][j]}`;
      currentNode.val = `f(${i},${j})=${memo[i][j]}`;
    }
    steps.push({
      currentCall: `fMemo(${i}, ${j})`,
      i,
      j,
      memoHit: isHit,
      hitCount,
      missCount,
      cachedVal: isHit ? memo[i][j] : undefined,
      decision: isHit
        ? `🎯 备忘录命中：memo[${i}][${j}] = ${memo[i][j]}！`
        : `⚠️ 备忘录未命中：memo[${i}][${j}] == -1，首次访问该状态`,
      message: isHit
        ? `子问题 (${i}, ${j}) 此前已计算完毕，直接读取缓存剪枝！`
        : `子问题 (${i}, ${j}) 从未计算，必须继续向下展开递归`,
      log: isHit
        ? `${indent}🎯 【缓存命中】f(i=${i}, j=${j}) memo[${i}][${j}]=${memo[i][j]}，直接剪枝！`
        : `${indent}🔍 【查备忘录】f(i=${i}, j=${j}) memo[${i}][${j}]=-1 (Miss)，展开计算`,
      codeLine: lines2.memoCheck,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': isHit ? '命中剪枝' : '未命中计算' },
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    if (isHit) {
      hitCount++;
      steps.push({
        currentCall: `fMemo(${i}, ${j})`,
        i,
        j,
        memoHit: true,
        hitCount,
        missCount,
        cachedVal: memo[i][j],
        decision: `读取缓存并直接返回：return memo[${i}][${j}] (${memo[i][j]})`,
        message: `剪枝生效！避免了其下方整棵庞大的递归树展开`,
        log: `${indent}↩️ 【命中返回】f(i=${i}, j=${j}) return memo[${i}][${j}] = ${memo[i][j]}`,
        codeLine: lines2.memoHitReturn,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '命中返回', 'metric-hits': `${hitCount}`, 'metric-ans': `${memo[i][j]}` },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      stack.pop();
      return memo[i][j];
    }

    missCount++;

    // 4. 字符比对
    const c1 = s1[i - 1];
    const c2 = s2[j - 1];
    const isMatch = c1 === c2;
    steps.push({
      currentCall: `fMemo(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: `字符比对：s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}')`,
      message: isMatch
        ? `✨ 两字符相同 ('${c1}' == '${c2}')！触发对角线记忆化递归`
        : `两字符不同 ('${c1}' != '${c2}')，分叉尝试忽略其中一串末尾字符`,
      log: isMatch
        ? `${indent}🔍 【字符比较】f(i=${i}, j=${j}) s1[${i - 1}]('${c1}') == s2[${j - 1}]('${c2}')，匹配成功！`
        : `${indent}🔍 【字符比较】f(i=${i}, j=${j}) s1[${i - 1}]('${c1}') != s2[${j - 1}]('${c2}')，不匹配`,
      codeLine: lines2.charCheck,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': isMatch ? '匹配成功' : '字符不匹配', 'metric-misses': `${missCount}` },
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    let res = 0;
    if (isMatch) {
      // 5a. 对角线调用 (Caller Frame)
      steps.push({
        currentCall: `fMemo(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        decision: `触发对角线递归：调用 1 + f(i=${i - 1}, j=${j - 1})`,
        message: `当前字符 '${c1}' 匹配 (+1)，递归求解缩小规模后的子问题`,
        log: `${indent}↖️ 【对角线递归】f(i=${i}, j=${j}) 字符相同，深入探索子问题 f(i=${i - 1}, j=${j - 1})`,
        codeLine: lines2.diagMatchCall,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '对角线递归' },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const sub = fMemo(i - 1, j - 1, currentNode, `↖️'${c1}'`);
      res = 1 + sub;
      memo[i][j] = res;
      currentNode.status = 'visited';
      currentNode.tag = `💾${res}`;
      currentNode.val = `f(${i},${j})=${res}`;

      // 5b. 写入备忘录并返回
      steps.push({
        currentCall: `fMemo(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        cachedVal: res,
        decision: `💾 存入备忘录并返回：memo[${i}][${j}] = 1 + f(${i - 1}, ${j - 1}) = ${res}`,
        message: `子问题 (${i}, ${j}) 求解完成并存入备忘录供后续复用，向上返回 ${res}`,
        log: `${indent}💾 【记忆存入】f(i=${i}, j=${j}) memo[${i}][${j}] = 1 + ${sub} = ${res}，return ${res}`,
        codeLine: lines2.diagMatchCall,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '写入备忘录', 'metric-ans': `${res}` },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
    } else {
      // 6a. 向上分支 (Caller Frame)
      steps.push({
        currentCall: `fMemo(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        decision: `分支 1 探索：调用 p1 = f(i=${i - 1}, j=${j})`,
        message: `忽略 s1[${i - 1}]('${c1}')，探索子问题 f(${i - 1}, ${j})`,
        log: `${indent}⬆️ 【向上分支】f(i=${i}, j=${j}) 忽略 s1[${i - 1}]('${c1}')，深入探索子问题 f(i=${i - 1}, j=${j})`,
        codeLine: lines2.branchUpCall,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '向上分支探索' },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const p1 = fMemo(i - 1, j, currentNode, '⬆️上');

      // 6b. 向左分支 (Caller Frame)
      steps.push({
        currentCall: `fMemo(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        decision: `分支 2 探索：调用 p2 = f(i=${i}, j=${j - 1})`,
        message: `忽略 s2[${j - 1}]('${c2}')，探索子问题 f(${i}, ${j - 1})`,
        log: `${indent}⬅️ 【向左分支】f(i=${i}, j=${j}) 忽略 s2[${j - 1}]('${c2}')，深入探索子问题 f(i=${i}, j=${j - 1})`,
        codeLine: lines2.branchLeftCall,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '向左分支探索' },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const p2 = fMemo(i, j - 1, currentNode, '⬅️左');

      res = Math.max(p1, p2);
      memo[i][j] = res;
      currentNode.status = 'visited';
      currentNode.tag = `💾${res}`;
      currentNode.val = `f(${i},${j})=${res}`;

      // 6c. 存入备忘录并返回
      steps.push({
        currentCall: `fMemo(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        cachedVal: res,
        decision: `💾 分支汇聚存入备忘录：memo[${i}][${j}] = max(p1=${p1}, p2=${p2}) = ${res}`,
        message: `取两路决策较大值存入备忘录，向上返回 ${res}`,
        log: `${indent}💾 【记忆存入】f(i=${i}, j=${j}) memo[${i}][${j}] = max(${p1}, ${p2}) = ${res}，return ${res}`,
        codeLine: lines2.combineStoreReturn,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '写入备忘录', 'metric-ans': `${res}` },
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
    }

    stack.pop();
    return res;
  }

  fMemo(n, m);
  return steps;
}

// ==========================================
// 3. Stage 3: 严格二维表递推
// ==========================================

export interface Lcs2DStep {
  curI: number;
  curJ: number;
  currentCell: string;
  currentVal: number;
  dpTable: number[][];
  depCells: DpCellDep[];
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  s1: string;
  s2: string;
  metrics?: Record<string, any>;
  treeRoot?: LcsTreeNode | null;
  activeNodeId?: string;
}

export function buildLcs2DDepTree(
  i: number,
  j: number,
  dp: number[][],
  s1: string,
  s2: string,
  isMatch?: boolean,
  isCalculated = false
): LcsTreeNode {
  if (i === 0 || j === 0) {
    return {
      id: `dp-${i}-${j}`,
      r: i,
      c: j,
      val: `dp[${i}][${j}] = 0`,
      status: 'base',
      tag: '🛡️边界基底',
      children: [],
    };
  }
  const c1 = s1[i - 1];
  const c2 = s2[j - 1];
  const curVal = isCalculated ? dp[i][j] : (dp[i][j] > 0 ? dp[i][j] : '?');
  const rootNode: LcsTreeNode = {
    id: `dp-${i}-${j}`,
    r: i,
    c: j,
    val: `dp[${i}][${j}] = ${curVal}`,
    status: 'current',
    tag: isCalculated
      ? (isMatch ? '↖️对角线(+1)' : '🔀择大转移')
      : (isMatch ? '↖️字符匹配' : '🔍字符不匹配'),
    children: [],
  };

  if (isMatch) {
    const diagVal = dp[i - 1][j - 1];
    rootNode.children.push({
      id: `dp-${i - 1}-${j - 1}`,
      r: i - 1,
      c: j - 1,
      val: `dp[${i - 1}][${j - 1}] = ${diagVal}`,
      edgeLabel: `↖️字符相同('${c1}') +1`,
      status: 'visited',
      tag: `+1贡献`,
      children: [],
    });
  } else {
    const upVal = dp[i - 1][j];
    const leftVal = dp[i][j - 1];
    const isUpGreater = upVal >= leftVal;
    rootNode.children.push({
      id: `dp-${i - 1}-${j}`,
      r: i - 1,
      c: j,
      val: `dp[${i - 1}][${j}] = ${upVal}`,
      edgeLabel: `⬆️上方(排除'${c1}')`,
      status: isCalculated && isUpGreater ? 'visited' : 'normal',
      tag: isCalculated && isUpGreater ? '👑较大' : undefined,
      children: [],
    });
    rootNode.children.push({
      id: `dp-${i}-${j - 1}`,
      r: i,
      c: j - 1,
      val: `dp[${i}][${j - 1}] = ${leftVal}`,
      edgeLabel: `⬅️向左(排除'${c2}')`,
      status: isCalculated && !isUpGreater ? 'visited' : 'normal',
      tag: isCalculated && !isUpGreater ? '👑较大' : undefined,
      children: [],
    });
  }
  return rootNode;
}

export function buildLcsStage3Steps(inputs: Record<string, any>): Lcs2DStep[] {
  const { s1, s2 } = parseLcsInputs(inputs);
  const n = s1.length;
  const m = s2.length;
  const steps: Lcs2DStep[] = [];
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  const lines3 = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    allocDp: { java: 4, cpp: 4, python: 4, javascript: 4 },
    loopI: { java: 5, cpp: 5, python: 5, javascript: 5 },
    loopJ: { java: 6, cpp: 6, python: 6, javascript: 6 },
    checkChar: { java: 7, cpp: 7, python: 7, javascript: 7 },
    diagMatch: { java: 8, cpp: 8, python: 8, javascript: 8 },
    branchMax: { java: 10, cpp: 10, python: 10, javascript: 10 },
    returnAns: { java: 14, cpp: 14, python: 11, javascript: 14 },
  };

  // Step 0: 函数入口
  steps.push({
    curI: 0,
    curJ: 0,
    currentCell: 'lcs3',
    currentVal: 0,
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: `主函数入口：lcs3("${s1}", "${s2}")`,
    message: `准备利用 ${n + 1}×${m + 1} 严格二维表自底向上填表`,
    log: `| 📥 进入 lcs3: s1="${s1}", s2="${s2}"`,
    codeLine: lines3.entry,
    s1,
    s2,
    metrics: { 'metric-status': '函数入口' },
    treeRoot: buildLcs2DDepTree(0, 0, dp, s1, s2),
    activeNodeId: 'dp-0-0',
  });

  // Step 1: 表分配
  steps.push({
    curI: 0,
    curJ: 0,
    currentCell: 'dp[0][0]',
    currentVal: 0,
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: '初始化第 0 行与第 0 列为 0（空串基底）',
    message: 'dp[0][j] 与 dp[i][0] 代表空串与任何串的 LCS 均为 0',
    log: '| 📋 分配二维 DP 表: dp[' + (n + 1) + '][' + (m + 1) + '] 全部初始为 0',
    codeLine: lines3.allocDp,
    s1,
    s2,
    metrics: { 'metric-status': '边界分配' },
    treeRoot: buildLcs2DDepTree(0, 0, dp, s1, s2),
    activeNodeId: 'dp-0-0',
  });

  for (let i = 1; i <= n; i++) {
    const c1 = s1[i - 1];

    steps.push({
      curI: i,
      curJ: 0,
      currentCell: `dp[${i}][0]`,
      currentVal: 0,
      dpTable: dp.map((r) => [...r]),
      depCells: [],
      decision: `外层循环进入第 ${i} 行 (i=${i}, 字符 '${c1}')`,
      message: `固定 s1[${i - 1}]('${c1}')，内层遍历 s2 的每个字符`,
      log: `| 🔄 外层遍历: i=${i}, 当前字符 s1[${i - 1}]='${c1}'`,
      codeLine: lines3.loopI,
      s1,
      s2,
      metrics: { 'metric-pos': `i=${i}, j=0`, 'metric-status': '外层行循环' },
      treeRoot: buildLcs2DDepTree(i, 0, dp, s1, s2),
      activeNodeId: `dp-${i}-0`,
    });

    for (let j = 1; j <= m; j++) {
      const c2 = s2[j - 1];
      const isMatch = c1 === c2;

      steps.push({
        curI: i,
        curJ: j,
        currentCell: `dp[${i}][${j}]`,
        currentVal: dp[i][j],
        dpTable: dp.map((r) => [...r]),
        depCells: [],
        decision: `内层循环处理第 ${j} 列 (j=${j}, 字符 '${c2}')`,
        message: `考察子问题 dp[${i}][${j}]: "${s1.slice(0, i)}" 与 "${s2.slice(0, j)}"`,
        log: `|   🔄 内层遍历: j=${j}, 当前字符 s2[${j - 1}]='${c2}'`,
        codeLine: lines3.loopJ,
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '内层列循环' },
        treeRoot: buildLcs2DDepTree(i, j, dp, s1, s2, isMatch, false),
        activeNodeId: `dp-${i}-${j}`,
      });

      // 字符比对
      steps.push({
        curI: i,
        curJ: j,
        currentCell: `dp[${i}][${j}]`,
        currentVal: dp[i][j],
        dpTable: dp.map((r) => [...r]),
        depCells: [],
        decision: `字符比对：s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}')`,
        message: isMatch
          ? `✨ 字符匹配 ('${c1}' == '${c2}')！状态将由左上对角线 dp[${i - 1}][${j - 1}] + 1 转移而来`
          : `字符不匹配 ('${c1}' != '${c2}')，状态将由上方 dp[${i - 1}][${j}] 与左方 dp[${i}][${j - 1}] 择大转移`,
        log: `|   🔍 比较字符: s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}'): ${isMatch ? '匹配成功' : '不匹配'}`,
        codeLine: lines3.checkChar,
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': isMatch ? '字符匹配' : '字符不匹配' },
        treeRoot: buildLcs2DDepTree(i, j, dp, s1, s2, isMatch, false),
        activeNodeId: `dp-${i}-${j}`,
      });

      if (isMatch) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        steps.push({
          curI: i,
          curJ: j,
          currentCell: `dp[${i}][${j}]`,
          currentVal: dp[i][j],
          dpTable: dp.map((r) => [...r]),
          depCells: [
            {
              r: i - 1,
              c: j - 1,
              label: `左上角对角线 [${i - 1}][${j - 1}]`,
              color: 'rgba(16, 185, 129, 0.25)',
            },
          ],
          decision: `✨ 字符匹配转移：dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = 1 + ${dp[i - 1][j - 1]} = ${dp[i][j]}`,
          message: `两串末尾字符相同，公共字符数在左上对角线基础上 +1`,
          log: `|   ↖️ 对角线转移: dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = ${dp[i][j]}`,
          codeLine: lines3.diagMatch,
          s1,
          s2,
          metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '对角线转移', 'metric-val': `${dp[i][j]}` },
          treeRoot: buildLcs2DDepTree(i, j, dp, s1, s2, true, true),
          activeNodeId: `dp-${i}-${j}`,
        });
      } else {
        const up = dp[i - 1][j];
        const left = dp[i][j - 1];
        dp[i][j] = Math.max(up, left);
        steps.push({
          curI: i,
          curJ: j,
          currentCell: `dp[${i}][${j}]`,
          currentVal: dp[i][j],
          dpTable: dp.map((r) => [...r]),
          depCells: [
            { r: i - 1, c: j, label: `上方 [${i - 1}][${j}]`, color: 'rgba(129, 140, 248, 0.2)' },
            { r: i, c: j - 1, label: `左方 [${i}][${j - 1}]`, color: 'rgba(56, 189, 248, 0.2)' },
          ],
          decision: `字符不匹配转移：dp[${i}][${j}] = max(上方=${up}, 左方=${left}) = ${dp[i][j]}`,
          message: `末尾字符不同，取上方与左方两者最优值填入当前格`,
          log: `|   ⬅️⬆️ 上左择优: dp[${i}][${j}] = max(上=${up}, 左=${left}) = ${dp[i][j]}`,
          codeLine: lines3.branchMax,
          s1,
          s2,
          metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-status': '上左择优', 'metric-val': `${dp[i][j]}` },
          treeRoot: buildLcs2DDepTree(i, j, dp, s1, s2, false, true),
          activeNodeId: `dp-${i}-${j}`,
        });
      }
    }
  }

  steps.push({
    curI: n,
    curJ: m,
    currentCell: `dp[${n}][${m}]`,
    currentVal: dp[n][m],
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: `🎉 二维表填表完成！最终 LCS 长度 = dp[${n}][${m}] = ${dp[n][m]}`,
    message: `全部单元格自底向上递推结束，右下角单元格即为全局最优解`,
    log: `| 🎯 填表完成: 全局最长公共子序列长度为 dp[${n}][${m}] = ${dp[n][m]}`,
    codeLine: lines3.returnAns,
    s1,
    s2,
    metrics: { 'metric-pos': `i=${n}, j=${m}`, 'metric-status': '递推完成', 'metric-val': `${dp[n][m]}` },
    treeRoot: buildLcs2DDepTree(n, m, dp, s1, s2, s1[n - 1] === s2[m - 1], true),
    activeNodeId: `dp-${n}-${m}`,
  });

  return steps;
}

// ==========================================
// 4. Stage 4: 空间压缩 + leftUp 暂存寄存器
// ==========================================

export interface LcsSpaceOptStep {
  curI: number;
  curJ: number;
  dp: number[];
  leftUp: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  s1: string;
  s2: string;
  metrics?: Record<string, any>;
}

export function buildLcsStage4Steps(inputs: Record<string, any>): LcsSpaceOptStep[] {
  const { s1, s2 } = parseLcsInputs(inputs);
  const n = s1.length;
  const m = s2.length;
  const steps: LcsSpaceOptStep[] = [];
  const dp = new Array(m + 1).fill(0);

  const lines4 = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    allocDp: { java: 4, cpp: 4, python: 4, javascript: 4 },
    loopI: { java: 5, cpp: 5, python: 5, javascript: 5 },
    initLeftUp: { java: 6, cpp: 6, python: 6, javascript: 6 },
    loopJ: { java: 7, cpp: 7, python: 7, javascript: 7 },
    backup: { java: 8, cpp: 8, python: 8, javascript: 8 },
    checkMatch: { java: 9, cpp: 9, python: 9, javascript: 9 },
    diagMatch: { java: 10, cpp: 10, python: 10, javascript: 10 },
    mismatchMax: { java: 12, cpp: 12, python: 12, javascript: 12 },
    shiftLeftUp: { java: 14, cpp: 14, python: 13, javascript: 14 },
    returnAns: { java: 17, cpp: 17, python: 14, javascript: 17 },
  };

  steps.push({
    curI: 0,
    curJ: 0,
    dp: [...dp],
    leftUp: 0,
    decision: `主函数入口：lcs4("${s1}", "${s2}")`,
    message: `利用一维滚动数组与 leftUp 对角线寄存器，将空间复杂度降至 O(M)`,
    log: `| 📥 进入 lcs4: s1="${s1}", s2="${s2}"`,
    codeLine: lines4.entry,
    s1,
    s2,
    metrics: { 'metric-space': `O(${m})`, 'metric-leftUp': '0' },
  });

  steps.push({
    curI: 0,
    curJ: 0,
    dp: [...dp],
    leftUp: 0,
    decision: `初始化压缩一维数组: int[] dp = new int[${m + 1}] 全部为 0`,
    message: `dp[j] 初始全为 0，代表空串边界`,
    log: `| 📋 分配一维滚动数组: dp[${m + 1}] = 0`,
    codeLine: lines4.allocDp,
    s1,
    s2,
    metrics: { 'metric-space': `O(${m})`, 'metric-leftUp': '0' },
  });

  for (let i = 1; i <= n; i++) {
    let leftUp = 0;
    const c1 = s1[i - 1];

    steps.push({
      curI: i,
      curJ: 0,
      dp: [...dp],
      leftUp: 0,
      decision: `外层循环处理第 ${i} 行 (i=${i}, 字符 '${c1}')`,
      message: `固定字符 s1[${i - 1}]，内层逐列滚动更新`,
      log: `| 🔄 处理第 ${i} 行: i=${i}, s1[${i - 1}]='${c1}'`,
      codeLine: lines4.loopI,
      s1,
      s2,
      metrics: { 'metric-pos': `i=${i}, j=0`, 'metric-leftUp': '0' },
    });

    steps.push({
      curI: i,
      curJ: 0,
      dp: [...dp],
      leftUp: 0,
      decision: `每行行首初始化左上角寄存器：leftUp = 0`,
      message: `每行首列的左上角为空串对应，故 leftUp 置 0`,
      log: `| 💾 行首初始化: leftUp = 0 (代表 dp[${i - 1}][0])`,
      codeLine: lines4.initLeftUp,
      s1,
      s2,
      metrics: { 'metric-pos': `i=${i}, j=0`, 'metric-leftUp': '0' },
    });

    for (let j = 1; j <= m; j++) {
      const c2 = s2[j - 1];

      steps.push({
        curI: i,
        curJ: j,
        dp: [...dp],
        leftUp,
        decision: `内层循环处理第 ${j} 列 (j=${j}, 字符 '${c2}')`,
        message: `准备对 dp[${j}] 执行细粒度三步走（暂存旧值 ➔ 转移计算 ➔ 寄存器推移）`,
        log: `|   🔄 处理列 j=${j}: s2[${j - 1}]='${c2}'`,
        codeLine: lines4.loopJ,
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-leftUp': `${leftUp}` },
      });

      // 细粒度步骤 1: 暂存旧值
      const backup = dp[j];
      steps.push({
        curI: i,
        curJ: j,
        dp: [...dp],
        leftUp,
        decision: `1. 暂存旧值：int backup = dp[${j}] (${backup})`,
        message: `在覆盖 dp[${j}] 之前将其暂存入 backup，它将作为下一列计算时的左上角对角线`,
        log: `|   💾 【暂存旧值】backup = dp[${j}] (${backup})，为下轮对角线留底`,
        codeLine: lines4.backup,
        s1,
        s2,
        metrics: { 'metric-space': `O(${m})`, 'metric-leftUp': `${leftUp}` },
      });

      // 字符比对
      const isMatch = c1 === c2;
      steps.push({
        curI: i,
        curJ: j,
        dp: [...dp],
        leftUp,
        decision: `比对字符：s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}')`,
        message: isMatch
          ? `✨ 两字符相同 ('${c1}' == '${c2}')！将使用 leftUp(${leftUp}) + 1 更新`
          : `两字符不同 ('${c1}' != '${c2}')，将取旧值 backup(${backup}) 与前项 dp[${j - 1}] 较大值`,
        log: `|   🔍 【字符比对】s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}'): ${isMatch ? '匹配' : '不匹配'}`,
        codeLine: lines4.checkMatch,
        s1,
        s2,
        metrics: { 'metric-pos': `i=${i}, j=${j}`, 'metric-leftUp': `${leftUp}` },
      });

      // 细粒度步骤 2: 转移计算
      if (isMatch) {
        dp[j] = leftUp + 1;
        steps.push({
          curI: i,
          curJ: j,
          dp: [...dp],
          leftUp,
          decision: `2. 转移计算：✨ 字符匹配！dp[${j}] = leftUp + 1 = ${leftUp} + 1 = ${dp[j]}`,
          message: `利用暂存的左上角 leftUp(${leftUp}) 完成状态转移`,
          log: `|   ↖️ 【对角线转移】dp[${j}] = leftUp + 1 = ${leftUp} + 1 = ${dp[j]}`,
          codeLine: lines4.diagMatch,
          s1,
          s2,
          metrics: { 'metric-space': `O(${m})`, 'metric-leftUp': `${leftUp}`, 'metric-ans': `${dp[j]}` },
        });
      } else {
        dp[j] = Math.max(dp[j], dp[j - 1]);
        steps.push({
          curI: i,
          curJ: j,
          dp: [...dp],
          leftUp,
          decision: `2. 转移计算：不匹配。dp[${j}] = max(旧值${backup}, 左侧${dp[j - 1]}) = ${dp[j]}`,
          message: `旧值 backup 代表上方 dp[i-1][j]，前项 dp[j-1] 代表左方，取较大值`,
          log: `|   ⬅️⬆️ 【上左选优】dp[${j}] = max(旧值=${backup}, 左侧=${dp[j - 1]}) = ${dp[j]}`,
          codeLine: lines4.mismatchMax,
          s1,
          s2,
          metrics: { 'metric-space': `O(${m})`, 'metric-leftUp': `${leftUp}`, 'metric-ans': `${dp[j]}` },
        });
      }

      // 细粒度步骤 3: 寄存器推移
      leftUp = backup;
      steps.push({
        curI: i,
        curJ: j,
        dp: [...dp],
        leftUp,
        decision: `3. 寄存器推移：leftUp = backup (${backup})`,
        message: `将暂存的旧值赋予 leftUp，为下一列 j=${j + 1} 的对角线依赖做好准备`,
        log: `|   ⏩ 【寄存器推移】leftUp = backup (${backup})，推移至下一列对角线`,
        codeLine: lines4.shiftLeftUp,
        s1,
        s2,
        metrics: { 'metric-space': `O(${m})`, 'metric-leftUp': `${leftUp}` },
      });
    }
  }

  steps.push({
    curI: n,
    curJ: m,
    dp: [...dp],
    leftUp: 0,
    decision: `🎉 空间压缩计算完毕！LCS 最终长度 = dp[${m}] = ${dp[m]}`,
    message: `全部状态遍历完成，成功将空间复杂度降至 O(min(N, M))`,
    log: `| 🎯 空间压缩求解完成: 最终 LCS 长度 dp[${m}] = ${dp[m]}`,
    codeLine: lines4.returnAns,
    s1,
    s2,
    metrics: { 'metric-space': `O(${m})`, 'metric-ans': `${dp[m]}` },
  });

  return steps;
}

// ==========================================
// 5. 声明式 Visualizer
// ==========================================

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'longest-common-subsequence',
  name: '最长公共子序列 (LCS)',
  category: 'dynamic-programming',
  badge: {
    mode: '双串样本对应模型 · 对角线依赖',
    complexity: 'O(N×M) · O(min(N,M))',
  },
  card1Title: '🔤 双字符串动态指针与对齐舱',
  card2Title: '📈 动态规划状态推导表与向量',
  card2Desc: '展示双串匹配推导、对角线转移以及 leftUp 寄存器暂存机制',
  legend: [
    { label: '字符匹配', color: '#10b981' },
    { label: '字符不匹配', color: '#64748b' },
    { label: '当前考察位置', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-s1', label: '字符串 1:', type: 'text', defaultValue: 'abcde', width: '110px' },
    { id: 'input-s2', label: '字符串 2:', type: 'text', defaultValue: 'ace', width: '110px' },
  ],
  presets: [
    { label: 'LeetCode 样例 1 ("abcde", "ace" Ans=3)', values: { 'input-s1': 'abcde', 'input-s2': 'ace' } },
    { label: '全匹配样例 ("abc", "abc" Ans=3)', values: { 'input-s1': 'abc', 'input-s2': 'abc' } },
    { label: '无重叠样例 ("abc", "def" Ans=0)', values: { 'input-s1': 'abc', 'input-s2': 'def' } },
  ],
  metrics: [
    { id: 'metric-pos', label: '当前指针', color: '#38bdf8' },
    { id: 'metric-status', label: '状态', color: '#10b981' },
    { id: 'metric-leftUp', label: 'leftUp 寄存器', color: '#f59e0b' },
  ],
  codeLanguages: DP_067_PROBLEMS['longest-common-subsequence'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['longest-common-subsequence'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['longest-common-subsequence'].analysisHtml,
  defaultStage: 'stage-1',
  buildSteps: buildLcsStage1Steps,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^(N+M))',
      theme: 'bg-blue',
      badge: {
        mode: '双串模型 · 暴力递归',
        complexity: 'O(2^(N+M)) · O(N+M) 栈深',
      },
      card1Title: '🌿 递归分支展开树与调用栈',
      card2Title: '🔤 双串字符对齐与比较',
      legend: [
        { label: '当前探查分支', color: '#2563eb' },
        { label: '已访问分支', color: '#10b981' },
        { label: '已剪枝/边界', color: '#94a3b8' },
      ],
      codeLanguages: LCS_STAGE1_CODE_LANGUAGES,
      buildSteps: buildLcsStage1Steps,
      renderCanvas: (container, step) => {
        renderRecursionCard1(
          container,
          step.currentCall,
          step.callStack,
          `<div style="font-size:12px; font-weight:700; color:#0284c7;">${step.decision}</div>
           <div style="font-size:11px; color:#64748b; margin-top:2px;">${step.message}</div>`,
          step.treeRoot,
          step.activeNodeId
        );
      },
      renderCustomMetrics: (container, step) => {
        renderStringAlignment(container, step.s1, step.s2, step.i, step.j);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N×M)',
      theme: 'bg-blue',
      badge: {
        mode: '双串模型 · 记忆化搜索',
        complexity: 'O(N×M) · O(N×M) 备忘录',
      },
      card1Title: '💾 记忆化剪枝树与缓存诊断',
      card2Title: '🎯 2D 备忘录矩阵 memo[i][j]',
      legend: [
        { label: '缓存命中 (Hit)', color: '#10b981' },
        { label: '未命中算值 (Miss)', color: '#ef4444' },
        { label: '未计算 (-1)', color: '#94a3b8' },
      ],
      codeLanguages: LCS_STAGE2_CODE_LANGUAGES,
      buildSteps: buildLcsStage2Steps,
      renderCanvas: (container, step) => {
        renderMemoCard1(
          container,
          step.currentCall,
          step.memoHit,
          step.hitCount,
          step.missCount,
          step.decision,
          step.message,
          step.cachedVal,
          step.treeRoot,
          step.activeNodeId
        );
      },
      renderCustomMetrics: (container, step) => {
        renderMemoGridCard(
          container,
          'LCS 备忘录 memo[i][j]',
          step.memoGrid,
          step.i,
          step.j,
          ['Ø', ...step.s1.split('')],
          ['Ø', ...step.s2.split('')]
        );
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 严格二维表',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N×M)',
      theme: 'bg-emerald',
      badge: {
        mode: '双串模型 · 严格二维表递推',
        complexity: 'O(N×M) · O(N×M)',
      },
      card1Title: '📐 状态转移推导与前驱依赖树',
      card2Title: '📊 严格二维状态表 dp[i][j]',
      legend: [
        { label: '当前填表单元格', color: '#10b981' },
        { label: '依赖前驱单元格', color: '#6366f1' },
        { label: '已计算', color: '#64748b' },
      ],
      codeLanguages: LCS_STAGE3_CODE_LANGUAGES,
      buildSteps: buildLcsStage3Steps,
      renderCanvas: (container, step) => {
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
      renderCustomMetrics: (container, step) => {
        renderDp2DCard2(
          container,
          '二维状态表 dp[i][j]',
          step.dpTable,
          step.curI,
          step.curJ,
          step.depCells.map((d: DpCellDep) => ({ r: d.r, c: d.c })),
          ['Ø', ...step.s1.split('')],
          ['Ø', ...step.s2.split('')]
        );
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间压缩',
      shortName: '空间优化',
      num: 4,
      timeBadge: 'O(min(N,M)) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '双串模型 · leftUp 寄存器暂存优化',
        complexity: 'O(N×M) · O(M) 空间',
      },
      card1Title: '🔤 双字符串动态指针与对齐舱',
      card2Title: '📈 空间压缩一维向量与 leftUp 暂存器',
      legend: [
        { label: '当前更新 dp[j]', color: '#f59e0b' },
        { label: 'leftUp 暂存器', color: '#6366f1' },
        { label: '历史一维值', color: '#0284c7' },
      ],
      codeLanguages: LCS_STAGE4_CODE_LANGUAGES,
      buildSteps: buildLcsStage4Steps,
      renderCanvas: (container, step) => {
        renderStringAlignment(container, step.s1, step.s2, step.curI - 1, step.curJ - 1);
      },
      renderCustomMetrics: (container, step) => {
        renderSpaceOptCard2(
          container,
          `一维滚动数组 dp[0..${step.dp.length - 1}]`,
          step.dp,
          step.curJ,
          'leftUp',
          step.leftUp,
          ['Ø', ...step.s2.split('')]
        );
      },
    },
  ],
  renderCanvas: (container, step) => {
    renderStringAlignment(container, step.s1, step.s2, step.curI - 1, step.curJ - 1);
  },
  renderCustomMetrics: (container, step) => {
    renderSpaceOptCard2(
      container,
      `一维滚动数组 dp[0..${step.dp.length - 1}]`,
      step.dp,
      step.curJ,
      'leftUp',
      step.leftUp,
      ['Ø', ...step.s2.split('')]
    );
  },
});

function renderStringAlignment(
  container: HTMLElement,
  s1: string,
  s2: string,
  curI: number,
  curJ: number
): void {
  if (!container) return;
  const s1Spans = s1.split('').map((char, idx) => {
    const isCur = idx === curI;
    return `
      <div style="
        padding: 8px 12px;
        font-family: monospace;
        font-size: 15px;
        font-weight: 700;
        background: ${isCur ? '#e0f2fe' : '#ffffff'};
        color: ${isCur ? '#0284c7' : '#475569'};
        border: ${isCur ? '2px solid #0284c7' : '1px solid #e2e8f0'};
        border-radius: 8px;
        box-shadow: ${isCur ? '0 2px 6px rgba(2, 132, 199, 0.15)' : 'none'};
        text-align: center;
        min-width: 32px;
      ">${char}</div>
    `;
  }).join('');

  const s2Spans = s2.split('').map((char, idx) => {
    const isCur = idx === curJ;
    return `
      <div style="
        padding: 8px 12px;
        font-family: monospace;
        font-size: 15px;
        font-weight: 700;
        background: ${isCur ? '#dcfce7' : '#ffffff'};
        color: ${isCur ? '#166534' : '#475569'};
        border: ${isCur ? '2px solid #16a34a' : '1px solid #e2e8f0'};
        border-radius: 8px;
        box-shadow: ${isCur ? '0 2px 6px rgba(22, 163, 74, 0.15)' : 'none'};
        text-align: center;
        min-width: 32px;
      ">${char}</div>
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
      <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 440px; background: #f8fafc; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <div style="font-size: 12px; font-weight: 600; color: #334155; display: flex; justify-content: space-between;">
          <span>字符串 1 (行维度 text1)</span>
          <span style="color: #64748b; font-family: monospace;">长度 ${s1.length} | 当前索引: ${curI >= 0 ? curI : '未选'}</span>
        </div>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding: 2px;">${s1Spans}</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 440px; background: #f8fafc; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <div style="font-size: 12px; font-weight: 600; color: #334155; display: flex; justify-content: space-between;">
          <span>字符串 2 (列维度 text2)</span>
          <span style="color: #64748b; font-family: monospace;">长度 ${s2.length} | 当前索引: ${curJ >= 0 ? curJ : '未选'}</span>
        </div>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding: 2px;">${s2Spans}</div>
      </div>
    </div>
  `;
}

export const LongestCommonSubsequenceVisualizer = Visualizer;

registerAlgorithm({
  id: 'longest-common-subsequence',
  name: '最长公共子序列 (LCS)',
  viewId: 'algo-longest-common-subsequence-view',
  category: 'dynamic-programming',
  description: '左程云算法讲解067 Code03：LeetCode 1143 最长公共子序列，经典双串对角线依赖与 leftUp 寄存器暂存优化',
  icon: '🔀',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 103,
  learningGoal: '掌握双串样本对应模型的分类讨论，理解对角线依赖在空间压缩中需要 leftUp 暂存器的本质原因',
});
