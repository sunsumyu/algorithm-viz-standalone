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
import { RecursionTreeAdapter } from '../../../../core/renderers/recursion-tree-adapter';
import { ThreeRecursionStackAdapter } from '../../../../core/renderers/three-recursion-stack-adapter';
import { SequenceAlignmentPresenter } from '../../../../core/renderers/sequence-alignment-adapter';
import {
  LCS_STAGE1_CODE_LANGUAGES,
  LCS_STAGE2_CODE_LANGUAGES,
  LCS_STAGE3_CODE_LANGUAGES,
  LCS_STAGE4_CODE_LANGUAGES,
  LCS_STAGE1_FORWARD_CODE_LANGUAGES,
  LCS_STAGE2_FORWARD_CODE_LANGUAGES,
  LCS_STAGE3_FORWARD_CODE_LANGUAGES,
} from './dp-067-stage-codes';
import type { StepVar } from '../../../../core/interfaces';
import {
  renderRecursionCard1,
  renderMemoCard1,
  renderMemoGridCard,
  renderDp2DCard1,
  renderDp2DCard2,
  renderSpaceOptCard2,
  renderStage1GridCard,
  renderStage4RollingGridCard,
  renderLcsCard2CompoundView,
  makeLcsStage1Vars,
  makeLcsStage2Vars,
  makeLcsStage3Vars,
  makeLcsStage4Vars,
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
  vars?: StepVar[];
  activeTrail?: string[];
  visitedMap?: Record<string, { val: number; status: 'visited' | 'base' | 'match'; isMatch?: boolean }>;
  matchedIndices1?: number[];
  matchedIndices2?: number[];
}

export function buildLcsStage1ForwardSteps(inputs: Record<string, any>): LcsRecStep[] {
  const { s1, s2 } = parseLcsInputs(inputs);
  const steps: LcsRecStep[] = [];
  const stack: Array<{ label: string }> = [];

  let nodeIdCounter = 0;
  const rootTreeNode: LcsTreeNode = {
    id: `node-${++nodeIdCounter}`,
    r: 0,
    c: 0,
    val: 'f(0,0)',
    status: 'current',
    children: [],
  };

  const lines = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    callEntry: { java: 5, cpp: 3, python: 11, javascript: 11 },
    fEntry: { java: 7, cpp: 5, python: 2, javascript: 2 },
    baseCheck: { java: 8, cpp: 6, python: 3, javascript: 3 },
    baseReturn: { java: 9, cpp: 7, python: 4, javascript: 4 },
    charCheck: { java: 11, cpp: 9, python: 5, javascript: 5 },
    diagMatchCall: { java: 12, cpp: 10, python: 6, javascript: 6 },
    branchDownCall: { java: 14, cpp: 12, python: 7, javascript: 7 },
    branchRightCall: { java: 15, cpp: 13, python: 8, javascript: 8 },
    combineMaxReturn: { java: 16, cpp: 14, python: 9, javascript: 9 },
  };

  const activeTrailCoords: string[] = [];
  const visitedMap: Record<string, { val: number; status: 'visited' | 'base' | 'match'; isMatch?: boolean }> = {};
  const currentMatched1: number[] = [];
  const currentMatched2: number[] = [];

  const pushStep = (st: LcsRecStep) => {
    if (!st.vars) {
      st.vars = makeLcsStage1Vars({ i: st.i, j: st.j, s1, s2 });
    }
    st.activeTrail = [...activeTrailCoords];
    st.visitedMap = { ...visitedMap };
    if (!st.matchedIndices1) {
      st.matchedIndices1 = [...currentMatched1];
    }
    if (!st.matchedIndices2) {
      st.matchedIndices2 = [...currentMatched2];
    }
    steps.push(st);
  };

  // Step 0: 主函数签名入口
  pushStep({
    currentCall: `lcs1Forward("${s1}", "${s2}")`,
    i: 0,
    j: 0,
    callStack: [],
    decision: `主函数入口：顺推求解 "${s1}" 与 "${s2}" 的最长公共子序列`,
    message: `从字符串首部 f(0,0) 开始向右下顺推探索，两字符串长度分别为 ${s1.length} 与 ${s2.length}`,
    log: `| 📥 进入 lcs1Forward: s1="${s1}", s2="${s2}"`,
    codeLine: lines.entry,
    s1,
    s2,
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: '0', type: 'number' },
      { name: 'j', value: '0', type: 'number' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  // Step 1: 启动辅助递归函数
  pushStep({
    currentCall: `f(0, 0)`,
    i: 0,
    j: 0,
    callStack: [],
    decision: `执行调用：return f(a, b, 0, 0)`,
    message: `传入首部索引 i=0 与 j=0 启动顺推探索求解`,
    log: `| 🚀 执行 return f(a, b, i=0, j=0) 启动顺推探索`,
    codeLine: lines.callEntry,
    s1,
    s2,
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: '0', type: 'number' },
      { name: 'j', value: '0', type: 'number' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  let callCount = 0;

  function fForward(i: number, j: number, parentNode?: LcsTreeNode, edgeLabel?: string): number {
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

    // 1. 函数入口栈帧
    stack.push({ label: `f(${i}, ${j})` });
    activeTrailCoords.push(`${i},${j}`);
    pushStep({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      callStack: [...stack],
      decision: `进入栈帧：f(i=${i}, j=${j})`,
      message: `考察后缀子串 s1[${i}..] 与 s2[${j}..] 的公共子序列`,
      log: `${indent}▶️ 进入 f(i=${i}, j=${j}) [第 ${callCount} 次调用]`,
      codeLine: lines.fEntry,
      s1,
      s2,
      vars: makeLcsStage1Vars({ i, j, s1, s2 }),
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    const isBase = i >= s1.length || j >= s2.length;

    // 2a. 边界检查帧
    pushStep({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      callStack: [...stack],
      decision: isBase
        ? `边界判定：${i >= s1.length ? `i=${i}>=len(s1)` : `j=${j}>=len(s2)`}，触发边界基底拦截`
        : `边界检查通过：i=${i} < ${s1.length} 且 j=${j} < ${s2.length}`,
      message: isBase
        ? `任一字符串已耗尽达到尾部，无法继续构成公共字符，准备返回 0`
        : `未达到串尾基底，继续执行后续字符比对`,
      log: isBase
        ? `${indent}🛡️ 【边界检查】f(i=${i}, j=${j}) 触碰边界 (${i >= s1.length ? `i=${i}>=${s1.length}` : `j=${j}>=${s2.length}`})`
        : `${indent}🛡️ 【边界检查】f(i=${i}, j=${j}) 索引有效 (i<len1 && j<len2)`,
      codeLine: lines.baseCheck,
      s1,
      s2,
      vars: makeLcsStage1Vars({ i, j, s1, s2, isBase, ans: isBase ? 0 : undefined }),
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    if (isBase) {
      currentNode.status = 'base';
      currentNode.tag = '🛡️越界';
      currentNode.val = `f(${i},${j})=0`;
      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `边界返回：return 0`,
        message: `后缀空串公共子序列长度为 0，向上层回溯`,
        log: `${indent}🛑 【边界返回】f(i=${i}, j=${j}) 达到空串基底，return 0`,
        codeLine: lines.baseReturn,
        s1,
        s2,
        vars: makeLcsStage1Vars({ i, j, s1, s2, isBase: true, ans: 0 }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      visitedMap[`${i},${j}`] = { val: 0, status: 'base', isMatch: false };
      activeTrailCoords.pop();
      stack.pop();
      return 0;
    }

    // 3. 字符比对帧
    const c1 = s1[i];
    const c2 = s2[j];
    const isMatch = c1 === c2;
    pushStep({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      callStack: [...stack],
      decision: `字符比对：s1[${i}]('${c1}') 与 s2[${j}]('${c2}')`,
      message: isMatch
        ? `✨ 两字符相同 ('${c1}' == '${c2}')！触发右下深入递归`
        : `两字符不同 ('${c1}' != '${c2}')，必须分别分叉探索忽略 s1[${i}] 或 s2[${j}]`,
      log: isMatch
        ? `${indent}🔍 【字符比较】f(i=${i}, j=${j}) s1[${i}]('${c1}') == s2[${j}]('${c2}')，匹配成功！`
        : `${indent}🔍 【字符比较】f(i=${i}, j=${j}) s1[${i}]('${c1}') != s2[${j}]('${c2}')，不匹配`,
      codeLine: lines.charCheck,
      s1,
      s2,
      vars: makeLcsStage1Vars({ i, j, s1, s2, isMatch }),
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    if (isMatch) {
      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `触发对角线深入递归：调用 1 + f(i=${i + 1}, j=${j + 1})`,
        message: `将首字符 '${c1}' 纳入 LCS (+1)，向右下方顺推缩小后缀规模`,
        log: `${indent}↘️ 【右下深入递归】f(i=${i}, j=${j}) 字符相同，深入探索子问题 f(i=${i + 1}, j=${j + 1})`,
        codeLine: lines.diagMatchCall,
        s1,
        s2,
        vars: makeLcsStage1Vars({ i, j, s1, s2, isMatch: true }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });

      currentMatched1.push(i);
      currentMatched2.push(j);
      const sub = fForward(i + 1, j + 1, currentNode, `↘️'${c1}'`);
      currentMatched1.pop();
      currentMatched2.pop();
      const ans = 1 + sub;
      currentNode.status = 'visited';
      currentNode.tag = `✨${ans}`;
      currentNode.val = `f(${i},${j})=${ans}`;

      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `对角线匹配返回：1 + f(${i + 1}, ${j + 1}) = 1 + ${sub} = ${ans}`,
        message: `字符 '${c1}' 贡献度为 1，加上子问题最优结果 ${sub}，总长为 ${ans}`,
        log: `${indent}↩️ 【匹配返回】f(i=${i}, j=${j}) 归纳结果 1 + ${sub} = ${ans}，return ${ans}`,
        codeLine: lines.diagMatchCall,
        s1,
        s2,
        vars: makeLcsStage1Vars({ i, j, s1, s2, isMatch: true, ans }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      visitedMap[`${i},${j}`] = { val: ans, status: 'match', isMatch: true };
      activeTrailCoords.pop();
      stack.pop();
      return ans;
    } else {
      // 分支 1：向下（忽略 s1[i]）
      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `分支 1 探索：调用 p1 = f(i=${i + 1}, j=${j})`,
        message: `假设 s1[${i}]('${c1}') 不在 LCS 中，将其舍弃并向下探索子问题`,
        log: `${indent}⬇️ 【向下分支】f(i=${i}, j=${j}) 忽略 s1[${i}]('${c1}')，深入探索子问题 f(i=${i + 1}, j=${j})`,
        codeLine: lines.branchDownCall,
        s1,
        s2,
        vars: makeLcsStage1Vars({ i, j, s1, s2, isMatch: false }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const p1 = fForward(i + 1, j, currentNode, '⬇️下');

      // 分支 2：向右（忽略 s2[j]）
      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `分支 2 探索：调用 p2 = f(i=${i}, j=${j + 1})`,
        message: `假设 s2[${j}]('${c2}') 不在 LCS 中，将其舍弃并向右探索子问题`,
        log: `${indent}➡️ 【向右分支】f(i=${i}, j=${j}) 忽略 s2[${j}]('${c2}')，深入探索子问题 f(i=${i}, j=${j + 1})`,
        codeLine: lines.branchRightCall,
        s1,
        s2,
        vars: makeLcsStage1Vars({ i, j, s1, s2, isMatch: false }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const p2 = fForward(i, j + 1, currentNode, '➡️右');

      // 汇聚比较
      const ans = Math.max(p1, p2);
      currentNode.status = 'visited';
      currentNode.tag = `🔀${ans}`;
      currentNode.val = `f(${i},${j})=${ans}`;

      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        callStack: [...stack],
        decision: `分支汇聚取优：max(向下p1=${p1}, 向右p2=${p2}) = ${ans}`,
        message: `在舍弃 s1[${i}] 与舍弃 s2[${j}] 两路独立决策中取最大收益并返回`,
        log: `${indent}↩️ 【分支汇总】f(i=${i}, j=${j}) 取 max(p1=${p1}, p2=${p2}) = ${ans}，return ${ans}`,
        codeLine: lines.combineMaxReturn,
        s1,
        s2,
        vars: makeLcsStage1Vars({ i, j, s1, s2, isMatch: false, ans }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      visitedMap[`${i},${j}`] = { val: ans, status: 'visited', isMatch: false };
      activeTrailCoords.pop();
      stack.pop();
      return ans;
    }
  }

  const finalAns = fForward(0, 0);

  // 最终完成单步
  pushStep({
    currentCall: `lcs1Forward("${s1}", "${s2}")`,
    i: 0,
    j: 0,
    callStack: [],
    decision: `🎉 顺推暴力递归求解完成！最长公共子序列长度 = ${finalAns}`,
    message: `全部后缀分支比对搜索完毕，全局最大匹配长度为 ${finalAns}`,
    log: `| ✅ 【计算收敛】全局最长公共子序列顺推求解完毕，最终答案: ${finalAns}`,
    codeLine: lines.callEntry,
    s1,
    s2,
    metrics: { 'metric-ans': `${finalAns}` },
    vars: [
      { name: 'ans', value: `${finalAns}`, type: 'number' },
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  return steps;
}

export function buildLcsStage1Steps(inputs: Record<string, any>, mode?: string): LcsRecStep[] {
  if (mode === 'forward') {
    return buildLcsStage1ForwardSteps(inputs);
  }
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

  const activeTrailCoords: string[] = [];
  const visitedMap: Record<string, { val: number; status: 'visited' | 'base' | 'match'; isMatch?: boolean }> = {};
  const currentMatched1: number[] = [];
  const currentMatched2: number[] = [];

  const pushStep = (st: LcsRecStep) => {
    if (!st.vars) {
      st.vars = makeLcsStage1Vars({ i: st.i, j: st.j, s1, s2 });
    }
    st.activeTrail = [...activeTrailCoords];
    st.visitedMap = { ...visitedMap };
    if (!st.matchedIndices1) {
      st.matchedIndices1 = [...currentMatched1];
    }
    if (!st.matchedIndices2) {
      st.matchedIndices2 = [...currentMatched2];
    }
    steps.push(st);
  };

  // Step 0: 主函数签名入口
  pushStep({
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
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: `${s1.length - 1}`, type: 'number' },
      { name: 'j', value: `${s2.length - 1}`, type: 'number' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  // Step 1: 启动辅助递归函数
  pushStep({
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
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: `${s1.length - 1}`, type: 'number' },
      { name: 'j', value: `${s2.length - 1}`, type: 'number' },
    ],
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

    const gridKey = `${Math.max(0, i + 1)},${Math.max(0, j + 1)}`;

    // 1. 函数签名帧 (Callee Entry Frame)
    stack.push({ label: `f(${i}, ${j})` });
    activeTrailCoords.push(gridKey);
    pushStep({
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
    pushStep({
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
      pushStep({
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
      visitedMap[gridKey] = { val: 0, status: 'base', isMatch: false };
      activeTrailCoords.pop();
      stack.pop();
      return 0;
    }

    // 3. 字符比对帧 (Char Check Frame)
    const c1 = s1[i];
    const c2 = s2[j];
    const isMatch = c1 === c2;
    pushStep({
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
      pushStep({
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

      currentMatched1.push(i);
      currentMatched2.push(j);
      const sub = f(i - 1, j - 1, currentNode, `↖️'${c1}'`);
      currentMatched1.pop();
      currentMatched2.pop();
      const ans = 1 + sub;
      currentNode.status = 'visited';
      currentNode.tag = `↖️${ans}`;
      currentNode.val = `f(${i},${j})=${ans}`;

      // 4b. 对角线分支返回步 (Return Frame)
      pushStep({
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
      visitedMap[gridKey] = { val: ans, status: 'match', isMatch: true };
      activeTrailCoords.pop();
      stack.pop();
      return ans;
    } else {
      // 5a. 分支 1 探索步：向上（忽略 s1[i]）(Caller Frame)
      pushStep({
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
      pushStep({
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
        vars: makeLcsStage1Vars({ i, j, s1, s2, isMatch: false }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const p2 = f(i, j - 1, currentNode, '⬅️左');

      // 5c. 汇聚比较返回步 (Combine Return Frame)
      const ans = Math.max(p1, p2);
      currentNode.status = 'visited';
      currentNode.tag = `🔀${ans}`;
      currentNode.val = `f(${i},${j})=${ans}`;

      pushStep({
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
        vars: makeLcsStage1Vars({ i, j, s1, s2, isMatch: false, ans }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      visitedMap[gridKey] = { val: ans, status: 'visited', isMatch: false };
      activeTrailCoords.pop();
      stack.pop();
      return ans;
    }
  }

  const finalAns = f(s1.length - 1, s2.length - 1);

  // 最终完成单步：展示全局完整递归树与最终最优解
  pushStep({
    currentCall: `lcs1("${s1}", "${s2}")`,
    i: s1.length - 1,
    j: s2.length - 1,
    callStack: [],
    decision: `🎉 暴力递归求解完成！最长公共子序列长度 = ${finalAns}`,
    message: `全部子问题决策分支探索与回溯汇聚结束，根节点汇聚得到全局最优解 LCS = ${finalAns}`,
    log: `| 🎯 暴力递归求解结束: 全局最优解 LCS("${s1}", "${s2}") = ${finalAns}`,
    codeLine: lines.entry,
    s1,
    s2,
    metrics: { 'metric-ans': `${finalAns}` },
    vars: [
      { name: 'ans', value: `${finalAns}`, type: 'number' },
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

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
  vars?: StepVar[];
}

export function buildLcsStage2ForwardSteps(inputs: Record<string, any>): LcsMemoStep[] {
  const { s1, s2 } = parseLcsInputs(inputs);
  const n = s1.length;
  const m = s2.length;
  const steps: LcsMemoStep[] = [];
  const memo: number[][] = Array.from({ length: n }, () => new Array(m).fill(-1));
  let hitCount = 0;
  let missCount = 0;

  let nodeIdCounter = 0;
  const rootTreeNode: LcsTreeNode = {
    id: `memo-node-${++nodeIdCounter}`,
    r: 0,
    c: 0,
    val: 'f(0,0)',
    status: 'current',
    children: [],
  };

  const lines2 = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    allocMemo: { java: 4, cpp: 4, python: 4, javascript: 4 },
    callEntry: { java: 5, cpp: 5, python: 12, javascript: 12 },
    fEntry: { java: 7, cpp: 7, python: 5, javascript: 5 },
    baseCheck: { java: 8, cpp: 8, python: 6, javascript: 6 },
    memoCheck: { java: 9, cpp: 9, python: 7, javascript: 7 },
    charCheck: { java: 10, cpp: 10, python: 8, javascript: 8 },
    diagMatchCall: { java: 11, cpp: 11, python: 9, javascript: 9 },
    branchDownCall: { java: 13, cpp: 13, python: 10, javascript: 10 },
    branchRightCall: { java: 14, cpp: 14, python: 11, javascript: 11 },
    combineReturn: { java: 16, cpp: 16, python: 13, javascript: 13 },
  };

  const pushStep = (st: LcsMemoStep) => {
    if (!st.vars) {
      st.vars = makeLcsStage2Vars({
        i: st.i,
        j: st.j,
        s1,
        s2,
        memoVal: st.i >= 0 && st.i < n && st.j >= 0 && st.j < m ? memo[st.i][st.j] : undefined,
        hit: st.memoHit,
      });
    }
    steps.push(st);
  };

  // Step 0: 主函数入口
  pushStep({
    currentCall: `lcs2Forward("${s1}", "${s2}")`,
    i: 0,
    j: 0,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `主函数入口：顺推记忆化搜索求解 "${s1}" 与 "${s2}" 的 LCS`,
    message: `准备利用 ${n}×${m} 备忘录矩阵自首部向右下顺推探索剪枝`,
    log: `| 📥 进入 lcs2Forward: s1="${s1}", s2="${s2}"`,
    codeLine: lines2.entry,
    memoGrid: memo.map((r) => [...r]),
    s1,
    s2,
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: '0', type: 'number' },
      { name: 'j', value: '0', type: 'number' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  // Step 1: 备忘录分配
  pushStep({
    currentCall: `memo[${n}][${m}]`,
    i: 0,
    j: 0,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: '初始化备忘录 memo 矩阵为 -1 (代表所有后缀状态尚未求解)',
    message: '分配 O(N×M) 状态缓存，后续重复子问题将直接 O(1) 命中并剪枝',
    log: `| 📋 分配并初始化 memo[${n}][${m}] 为 -1`,
    codeLine: lines2.allocMemo,
    memoGrid: memo.map((r) => [...r]),
    s1,
    s2,
    vars: [
      { name: 'memo[0][0]', value: '-1', type: 'number' },
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  // Step 2: 启动顺推递归入口
  pushStep({
    currentCall: `f(0, 0, memo)`,
    i: 0,
    j: 0,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `启动顺推递归探索：调用 f(a, b, i=0, j=0, memo)`,
    message: `从两字符串首字符位置开始顺推搜索`,
    log: `| 🚀 启动顺推记忆化递归 f(0, 0, memo)`,
    codeLine: lines2.callEntry,
    memoGrid: memo.map((r) => [...r]),
    s1,
    s2,
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: '0', type: 'number' },
      { name: 'j', value: '0', type: 'number' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  let callCount = 0;

  function fForward(i: number, j: number, parentNode?: LcsTreeNode, edgeLabel?: string): number {
    if (steps.length > 600) return 0;
    callCount++;

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

    // 入口步
    pushStep({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: `探查状态：f(i=${i}, j=${j})`,
      message: `探查后缀 s1[${i}..] 与 s2[${j}..]`,
      log: `| ▶️ 进入 f(i=${i}, j=${j})`,
      codeLine: lines2.fEntry,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      vars: makeLcsStage2Vars({ i, j, s1, s2 }),
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    const isBase = i >= n || j >= m;
    if (isBase) {
      currentNode.status = 'base';
      currentNode.tag = '🛡️越界';
      currentNode.val = `f(${i},${j})=0`;
      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        decision: '达到边界基底：任一字符串已耗尽，return 0',
        message: '空串公共子序列长度恒为 0，向上回溯',
        log: `| 🛑 【边界基底】f(i=${i}, j=${j}) 触碰边界，return 0`,
        codeLine: lines2.baseCheck,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        vars: makeLcsStage2Vars({ i, j, s1, s2, ans: 0 }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      return 0;
    }

    // 缓存命中检查
    if (memo[i][j] !== -1) {
      hitCount++;
      const cached = memo[i][j];
      currentNode.status = 'pruned';
      currentNode.tag = `🎯Hit=${cached}`;
      currentNode.val = `f(${i},${j})=${cached}`;
      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        memoHit: true,
        hitCount,
        missCount,
        cachedVal: cached,
        decision: `🎯 命中备忘录缓存：memo[${i}][${j}] = ${cached}！直接剪枝返回`,
        message: `子问题 (${i}, ${j}) 此前已被计算过，直接复用缓存并剪枝整个子树`,
        log: `| 🎯 【缓存命中】memo[${i}][${j}] = ${cached}，剪枝返回！`,
        codeLine: lines2.memoCheck,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        vars: makeLcsStage2Vars({ i, j, s1, s2, memoVal: cached, hit: true, ans: cached }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      return cached;
    }

    missCount++;
    const c1 = s1[i];
    const c2 = s2[j];
    const isMatch = c1 === c2;

    pushStep({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: `⚠️ 未命中缓存 (Miss)：开始比较 s1[${i}]('${c1}') 与 s2[${j}]('${c2}')`,
      message: isMatch
        ? `两字符匹配 ('${c1}' == '${c2}')，深入右下对角线`
        : `两字符不同 ('${c1}' != '${c2}')，向下与向右分叉探索`,
      log: `| ⚠️ 【未命中】首次计算 f(i=${i}, j=${j})，进行字符比较`,
      codeLine: lines2.charCheck,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      vars: makeLcsStage2Vars({ i, j, s1, s2, memoVal: -1, hit: false }),
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    let ans: number;
    if (isMatch) {
      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        decision: `对角线深入：1 + f(i=${i + 1}, j=${j + 1}, memo)`,
        message: `公共字符 '${c1}' 纳入 LCS (+1)，向右下顺推深入`,
        log: `| ↘️ 顺推深入: 1 + f(${i + 1}, ${j + 1})`,
        codeLine: lines2.diagMatchCall,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        vars: makeLcsStage2Vars({ i, j, s1, s2, hit: false }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });

      const sub = fForward(i + 1, j + 1, currentNode, `↘️'${c1}'`);
      ans = 1 + sub;
    } else {
      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        decision: `分支 1：向下探索 f(i=${i + 1}, j=${j}, memo)`,
        message: `忽略 s1[${i}]，深入向下子问题`,
        log: `| ⬇️ 向下分支: f(${i + 1}, ${j})`,
        codeLine: lines2.branchDownCall,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        vars: makeLcsStage2Vars({ i, j, s1, s2, hit: false }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const p1 = fForward(i + 1, j, currentNode, '⬇️下');

      pushStep({
        currentCall: `f(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        decision: `分支 2：向右探索 f(i=${i}, j=${j + 1}, memo)`,
        message: `忽略 s2[${j}]，深入向右子问题`,
        log: `| ➡️ 向右分支: f(${i}, ${j + 1})`,
        codeLine: lines2.branchRightCall,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        vars: makeLcsStage2Vars({ i, j, s1, s2, hit: false }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const p2 = fForward(i, j + 1, currentNode, '➡️右');

      ans = Math.max(p1, p2);
    }

    // 存入备忘录并返回
    memo[i][j] = ans;
    currentNode.status = 'visited';
    currentNode.tag = `💾${ans}`;
    currentNode.val = `f(${i},${j})=${ans}`;

    pushStep({
      currentCall: `f(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: `💾 存入备忘录：memo[${i}][${j}] = ${ans} 并返回`,
      message: `子问题 (${i}, ${j}) 计算完毕，缓存结果为 ${ans}，返回上层`,
      log: `| 💾 【回填缓存】memo[${i}][${j}] = ${ans}，return ${ans}`,
      codeLine: lines2.combineReturn,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      vars: makeLcsStage2Vars({ i, j, s1, s2, memoVal: ans, hit: false, ans }),
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    return ans;
  }

  const finalAns = fForward(0, 0);

  // 最终完成单步
  pushStep({
    currentCall: `lcs2Forward("${s1}", "${s2}")`,
    i: 0,
    j: 0,
    memoHit: false,
    hitCount,
    missCount,
    cachedVal: finalAns,
    decision: `🎉 顺推记忆化搜索完成！最长公共子序列长度 = ${finalAns}`,
    message: `全部子问题搜索与剪枝回溯结束，全局最终解: ${finalAns}`,
    log: `| ✅ 顺推记忆化搜索结束: 命中 ${hitCount} 次，计算 ${missCount} 次，最终最优解 = ${finalAns}`,
    codeLine: lines2.entry,
    memoGrid: memo.map((r) => [...r]),
    s1,
    s2,
    vars: [
      { name: 'ans', value: `${finalAns}`, type: 'number' },
      { name: 'hitCount', value: `${hitCount}`, type: 'number' },
      { name: 'missCount', value: `${missCount}`, type: 'number' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  return steps;
}

export function buildLcsStage2Steps(inputs: Record<string, any>, mode?: string): LcsMemoStep[] {
  if (mode === 'forward') {
    return buildLcsStage2ForwardSteps(inputs);
  }
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

  const pushStep = (st: LcsMemoStep) => {
    if (!st.vars) {
      st.vars = makeLcsStage2Vars({
        i: st.i,
        j: st.j,
        s1,
        s2,
        memoVal: st.i >= 0 && st.i <= n && st.j >= 0 && st.j <= m ? memo[st.i][st.j] : undefined,
        hit: st.memoHit,
      });
    }
    steps.push(st);
  };

  // Step 0: 主函数入口
  pushStep({
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
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: `${n}`, type: 'number' },
      { name: 'j', value: `${m}`, type: 'number' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  // Step 1: 分配 memo 矩阵
  pushStep({
    currentCall: `lcs2("${s1}", "${s2}")`,
    i: n,
    j: m,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `分配并初始化备忘录：int[][] memo = new int[${n + 1}][${m + 1}] 全部为 -1`,
    message: '全部元素置为 -1，标识所有子问题处于未求解状态',
    log: `| 📋 分配并初始化 memo[${n + 1}][${m + 1}] 为 -1`,
    codeLine: lines2.allocMemo,
    memoGrid: memo.map((r) => [...r]),
    s1,
    s2,
    vars: [
      { name: 'memo[0][0]', value: '-1', type: 'number' },
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

  // Step 2: 启动递归调用主入口
  pushStep({
    currentCall: `f(${n}, ${m}, memo)`,
    i: n,
    j: m,
    memoHit: false,
    hitCount: 0,
    missCount: 0,
    decision: `启动辅助记忆化递归函数：return f(s1, s2, i=${n}, j=${m}, memo)`,
    message: `自顶向下进入递归核心过程，当前考察最大规模问题 (${n}, ${m})`,
    log: `| 🚀 执行 return f(s1, s2, i=${n}, j=${m}, memo) 启动记忆化递归`,
    codeLine: lines2.callEntry,
    memoGrid: memo.map((r) => [...r]),
    s1,
    s2,
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: `${n}`, type: 'number' },
      { name: 'j', value: `${m}`, type: 'number' },
    ],
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

    // 1. 函数签名帧 (Callee Entry Frame)
    stack.push({ label: `f(${i}, ${j})` });
    pushStep({
      currentCall: `fMemo(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: `进入栈帧：f(i=${i}, j=${j}, memo)`,
      message: `考察前缀子串 s1[0..${i - 1}] 与 s2[0..${j - 1}]`,
      log: `${indent}▶️ 进入 f(i=${i}, j=${j}) [第 ${callCount} 次调用]`,
      codeLine: lines2.fEntry,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      vars: makeLcsStage2Vars({ i, j, s1, s2 }),
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    const isBase = i === 0 || j === 0;

    // 2a. 边界检查帧 (Base Condition Check)
    if (isBase) {
      currentNode.status = 'base';
      currentNode.tag = '🛡️0';
      currentNode.val = `f(${i},${j})=0`;
    }
    pushStep({
      currentCall: `fMemo(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: isBase
        ? `边界判定：${i === 0 ? 'i == 0' : 'j == 0'}，触发边界基底拦截`
        : `边界检查通过：i=${i} > 0 且 j=${j} > 0`,
      message: isBase
        ? `任一前缀长度为 0 时公共子序列长度恒为 0，准备返回 0`
        : `未达到空串基底，继续检查备忘录缓存`,
      log: isBase
        ? `${indent}🛡️ 【边界检查】f(i=${i}, j=${j}) 触碰边界 (${i === 0 ? 'i==0' : 'j==0'})`
        : `${indent}🛡️ 【边界检查】f(i=${i}, j=${j}) 索引有效 (i>0 && j>0)`,
      codeLine: lines2.baseCheck,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      vars: makeLcsStage2Vars({ i, j, s1, s2, ans: isBase ? 0 : undefined }),
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    if (isBase) {
      // 2b. 边界返回帧 (Guard Return Frame)
      pushStep({
        currentCall: `fMemo(${i}, ${j})`,
        i,
        j,
        memoHit: false,
        hitCount,
        missCount,
        decision: `边界返回：return 0`,
        message: `空串公共子序列长度为 0，向上层回溯`,
        log: `${indent}🛑 【边界返回】f(i=${i}, j=${j}) 达到空串基底，return 0`,
        codeLine: lines2.baseReturn,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        vars: makeLcsStage2Vars({ i, j, s1, s2, ans: 0 }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      stack.pop();
      return 0;
    }

    // 3a. 备忘录缓存探查帧 (Memo Cache Lookup Frame)
    const isHit = memo[i][j] !== -1;
    pushStep({
      currentCall: `fMemo(${i}, ${j})`,
      i,
      j,
      memoHit: isHit,
      hitCount,
      missCount,
      cachedVal: isHit ? memo[i][j] : undefined,
      decision: isHit
        ? `🎯 备忘录缓存命中：memo[${i}][${j}] = ${memo[i][j]}！准备直接剪枝返回`
        : `⚠️ 备忘录缓存未命中：memo[${i}][${j}] == -1，首次访问该状态，准备深入计算`,
      message: isHit
        ? `重复子问题 (${i}, ${j}) 已被此前分支计算，无需再次展开递归`
        : `首次遇到子问题 (${i}, ${j})，必须继续向下展开计算并保存缓存`,
      log: isHit
        ? `${indent}🎯 【缓存命中】f(i=${i}, j=${j}) memo[${i}][${j}] = ${memo[i][j]}，触发剪枝！`
        : `${indent}⚠️ 【缓存未命中】f(i=${i}, j=${j}) memo[${i}][${j}] == -1，继续计算`,
      codeLine: lines2.memoCheck,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      vars: makeLcsStage2Vars({ i, j, s1, s2, memoVal: memo[i][j], hit: isHit, ans: isHit ? memo[i][j] : undefined }),
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    if (isHit) {
      // 3b. 缓存剪枝返回帧 (Pruned Return Frame)
      hitCount++;
      const cached = memo[i][j];
      currentNode.status = 'pruned';
      currentNode.tag = `🎯${cached}`;
      currentNode.val = `f(${i},${j})=${cached}`;

      pushStep({
        currentCall: `fMemo(${i}, ${j})`,
        i,
        j,
        memoHit: true,
        hitCount,
        missCount,
        cachedVal: cached,
        decision: `🎯 缓存直接返回：return memo[${i}][${j}] = ${cached}`,
        message: `剪除整个递归子树，O(1) 立即返回已缓存结果 ${cached}`,
        log: `${indent}↩️ 【剪枝返回】f(i=${i}, j=${j}) 直接返回缓存值 ${cached}`,
        codeLine: lines2.memoHitReturn,
        memoGrid: memo.map((r) => [...r]),
        s1,
        s2,
        vars: makeLcsStage2Vars({ i, j, s1, s2, memoVal: cached, hit: true, ans: cached }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      stack.pop();
      return cached;
    }

    missCount++;
    let res = 0;

    // 4. 字符比对帧 (Character Comparison Frame)
    const c1 = s1[i - 1];
    const c2 = s2[j - 1];
    const isMatch = c1 === c2;
    pushStep({
      currentCall: `fMemo(${i}, ${j})`,
      i,
      j,
      memoHit: false,
      hitCount,
      missCount,
      decision: `比对末尾字符：s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}')`,
      message: isMatch
        ? `✨ 两字符相同 ('${c1}' == '${c2}')！触发对角线递归并累加 1`
        : `两字符不同 ('${c1}' != '${c2}')，分叉探索向上与向左子问题`,
      log: isMatch
        ? `${indent}🔍 【字符比较】f(i=${i}, j=${j}) s1[${i - 1}]('${c1}') == s2[${j - 1}]('${c2}')，匹配成功！`
        : `${indent}🔍 【字符比较】f(i=${i}, j=${j}) s1[${i - 1}]('${c1}') != s2[${j - 1}]('${c2}')，不匹配`,
      codeLine: lines2.charCheck,
      memoGrid: memo.map((r) => [...r]),
      s1,
      s2,
      vars: makeLcsStage2Vars({ i, j, s1, s2, memoVal: -1, hit: false }),
      treeRoot: cloneLcsTree(rootTreeNode),
      activeNodeId: currentNode.id,
    });

    if (isMatch) {
      // 5a. 对角线调用 (Caller Frame)
      pushStep({
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
        vars: makeLcsStage2Vars({ i, j, s1, s2, hit: false }),
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
      pushStep({
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
        vars: makeLcsStage2Vars({ i, j, s1, s2, memoVal: res, hit: false, ans: res }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
    } else {
      // 6a. 向上分支 (Caller Frame)
      pushStep({
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
        vars: makeLcsStage2Vars({ i, j, s1, s2, hit: false }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
      const p1 = fMemo(i - 1, j, currentNode, '⬆️上');

      // 6b. 向左分支 (Caller Frame)
      pushStep({
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
        vars: makeLcsStage2Vars({ i, j, s1, s2, hit: false }),
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
      pushStep({
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
        vars: makeLcsStage2Vars({ i, j, s1, s2, memoVal: res, hit: false, ans: res }),
        treeRoot: cloneLcsTree(rootTreeNode),
        activeNodeId: currentNode.id,
      });
    }

    stack.pop();
    return res;
  }

  const finalAns = fMemo(n, m);

  // 最终完成单步：展示带备忘录剪枝的完整递归树与全局统计
  pushStep({
    currentCall: `lcs2("${s1}", "${s2}")`,
    i: n,
    j: m,
    memoHit: false,
    hitCount,
    missCount,
    cachedVal: finalAns,
    decision: `🎉 记忆化搜索求解完成！最长公共子序列长度 = ${finalAns}`,
    message: `依托 ${n + 1}×${m + 1} 备忘录剪枝，消除全部重叠子问题，根节点得出全局最优解 LCS = ${finalAns}`,
    log: `| 🎯 记忆化搜索结束: 全局最优解 LCS("${s1}", "${s2}") = ${finalAns} (命中剪枝 ${hitCount} 次，计算 ${missCount} 次)`,
    codeLine: lines2.entry,
    memoGrid: memo.map((r) => [...r]),
    s1,
    s2,
    vars: [
      { name: 'ans', value: `${finalAns}`, type: 'number' },
      { name: 'hitCount', value: `${hitCount}`, type: 'number' },
      { name: 'missCount', value: `${missCount}`, type: 'number' },
    ],
    treeRoot: cloneLcsTree(rootTreeNode),
    activeNodeId: rootTreeNode.id,
  });

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
  vars?: StepVar[];
}

/**
 * 阶段 3: 构造多层级状态依赖拓扑展开树 (State Dependency Topological Tree)
 * 递归展开当前目标单元格 dp[targetI][targetJ] 的前驱依赖链，展示 DP 状态的有向无环拓扑关系 (DAG 展开)
 */
export function buildLcsStateDepTree(
  targetI: number,
  targetJ: number,
  dp: number[][],
  s1: string,
  s2: string,
  isMatch?: boolean,
  isCalculated = false,
  maxExpandDepth = 2,
  direction: 'forward' | 'reverse' = 'reverse'
): LcsTreeNode {
  if (direction === 'forward') {
    const n = s1.length;
    const m = s2.length;
    if (targetI >= n || targetJ >= m) {
      return {
        id: `dp-${targetI}-${targetJ}`,
        r: targetI,
        c: targetJ,
        val: `dp[${targetI}][${targetJ}] = 0`,
        status: 'base',
        tag: '🛡️边界基底',
        children: [],
      };
    }
    const c1 = s1[targetI];
    const c2 = s2[targetJ];
    const curVal = isCalculated ? dp[targetI][targetJ] : '?';
    const matchFlag = isMatch !== undefined ? isMatch : c1 === c2;

    const rootNode: LcsTreeNode = {
      id: `dp-${targetI}-${targetJ}`,
      r: targetI,
      c: targetJ,
      val: `dp[${targetI}][${targetJ}] = ${curVal}`,
      status: 'current',
      tag: isCalculated
        ? matchFlag
          ? '↘️对角线(+1)'
          : '🔀下右择大'
        : matchFlag
        ? '✨字符匹配待转移'
        : '⚠️字符不同待择优',
      children: [],
    };

    function expandForwardPredecessor(
      r: number,
      c: number,
      edgeLabel: string,
      tag: string | undefined,
      status: 'visited' | 'normal' | 'base',
      pathId: string,
      currentDepth: number
    ): LcsTreeNode {
      if (r >= n || c >= m) {
        return {
          id: `${pathId}-dp-${r}-${c}`,
          r,
          c,
          val: `dp[${r}][${c}] = 0`,
          edgeLabel,
          status: 'base',
          tag: '🛡️边界基底',
          children: [],
        };
      }
      const val = dp[r][c];
      const node: LcsTreeNode = {
        id: `${pathId}-dp-${r}-${c}`,
        r,
        c,
        val: `dp[${r}][${c}] = ${val}`,
        edgeLabel,
        status,
        tag,
        children: [],
      };
      if (currentDepth < maxExpandDepth) {
        const charA = s1[r];
        const charB = s2[c];
        if (charA === charB) {
          node.children.push(
            expandForwardPredecessor(
              r + 1,
              c + 1,
              `↘️'${charA}'(+1)`,
              '右下前驱',
              'visited',
              `${pathId}-diag`,
              currentDepth + 1
            )
          );
        } else {
          const down = dp[r + 1]?.[c] ?? 0;
          const right = dp[r]?.[c + 1] ?? 0;
          const downGreater = down >= right;
          node.children.push(
            expandForwardPredecessor(
              r + 1,
              c,
              `⬇️下(舍'${charA}')`,
              downGreater ? '👑大' : undefined,
              downGreater ? 'visited' : 'normal',
              `${pathId}-down`,
              currentDepth + 1
            ),
            expandForwardPredecessor(
              r,
              c + 1,
              `➡️右(舍'${charB}')`,
              !downGreater ? '👑大' : undefined,
              !downGreater ? 'visited' : 'normal',
              `${pathId}-right`,
              currentDepth + 1
            )
          );
        }
      }
      return node;
    }

    if (matchFlag) {
      rootNode.children.push(
        expandForwardPredecessor(
          targetI + 1,
          targetJ + 1,
          `↘️匹配('${c1}'=='${c2}') +1`,
          isCalculated ? '👑+1贡献源' : '待转移',
          'visited',
          'root-diag',
          1
        )
      );
    } else {
      const downVal = dp[targetI + 1]?.[targetJ] ?? 0;
      const rightVal = dp[targetI]?.[targetJ + 1] ?? 0;
      const isDownGreater = downVal >= rightVal;
      rootNode.children.push(
        expandForwardPredecessor(
          targetI + 1,
          targetJ,
          `⬇️下方(舍弃'${c1}')`,
          isCalculated ? (isDownGreater ? '👑较大胜出' : '🥈次优') : '下方候选',
          isCalculated && isDownGreater ? 'visited' : 'normal',
          'root-down',
          1
        ),
        expandForwardPredecessor(
          targetI,
          targetJ + 1,
          `➡️向右(舍弃'${c2}')`,
          isCalculated ? (!isDownGreater ? '👑较大胜出' : '🥈次优') : '右方候选',
          isCalculated && !isDownGreater ? 'visited' : 'normal',
          'root-right',
          1
        )
      );
    }

    return rootNode;
  }

  if (targetI === 0 || targetJ === 0) {
    const baseTag =
      targetI === 0 && targetJ === 0
        ? '🛡️双空串基底'
        : targetI === 0
        ? '🛡️s1为空基底'
        : '🛡️s2为空基底';
    return {
      id: `dp-${targetI}-${targetJ}`,
      r: targetI,
      c: targetJ,
      val: `dp[${targetI}][${targetJ}] = 0`,
      status: 'base',
      tag: baseTag,
      children: [],
    };
  }

  const c1 = s1[targetI - 1];
  const c2 = s2[targetJ - 1];
  const curVal = isCalculated ? dp[targetI][targetJ] : '?';
  const matchFlag = isMatch !== undefined ? isMatch : c1 === c2;

  const rootNode: LcsTreeNode = {
    id: `dp-${targetI}-${targetJ}`,
    r: targetI,
    c: targetJ,
    val: `dp[${targetI}][${targetJ}] = ${curVal}`,
    status: 'current',
    tag: isCalculated
      ? matchFlag
        ? '↖️对角线(+1)'
        : '🔀上左择大'
      : matchFlag
      ? '✨字符匹配待转移'
      : '⚠️字符不同待择优',
    children: [],
  };

  function expandPredecessor(
    r: number,
    c: number,
    edgeLabel: string,
    tag: string | undefined,
    status: 'visited' | 'normal' | 'base',
    pathId: string,
    currentDepth: number
  ): LcsTreeNode {
    // 边界基底
    if (r === 0 || c === 0) {
      return {
        id: `${pathId}-dp-${r}-${c}`,
        r,
        c,
        val: `dp[${r}][${c}] = 0`,
        edgeLabel,
        status: 'base',
        tag: '🛡️边界基底',
        children: [],
      };
    }

    const val = dp[r][c];
    const node: LcsTreeNode = {
      id: `${pathId}-dp-${r}-${c}`,
      r,
      c,
      val: `dp[${r}][${c}] = ${val}`,
      edgeLabel,
      status,
      tag,
      children: [],
    };

    // 若未达到最大展开深度，则继续向下挖掘次级前驱
    if (currentDepth < maxExpandDepth) {
      const charA = s1[r - 1];
      const charB = s2[c - 1];
      const prevMatched = charA === charB;

      if (prevMatched) {
        node.children.push(
          expandPredecessor(
            r - 1,
            c - 1,
            `↖️'${charA}'(+1)`,
            '对角前驱',
            'visited',
            `${pathId}-diag`,
            currentDepth + 1
          )
        );
      } else {
        const up = dp[r - 1][c];
        const left = dp[r][c - 1];
        const upGreater = up >= left;
        node.children.push(
          expandPredecessor(
            r - 1,
            c,
            `⬆️上(舍'${charA}')`,
            upGreater ? '👑大' : undefined,
            upGreater ? 'visited' : 'normal',
            `${pathId}-up`,
            currentDepth + 1
          )
        );
        node.children.push(
          expandPredecessor(
            r,
            c - 1,
            `⬅️左(舍'${charB}')`,
            !upGreater ? '👑大' : undefined,
            !upGreater ? 'visited' : 'normal',
            `${pathId}-left`,
            currentDepth + 1
          )
        );
      }
    }

    return node;
  }

  // 展开第 1 层前驱 (Depth 1)
  if (matchFlag) {
    const diagChild = expandPredecessor(
      targetI - 1,
      targetJ - 1,
      `↖️匹配('${c1}'=='${c2}') +1`,
      isCalculated ? '👑+1贡献源' : '待转移',
      'visited',
      `root-diag`,
      1
    );
    rootNode.children.push(diagChild);
  } else {
    const upVal = dp[targetI - 1][targetJ];
    const leftVal = dp[targetI][targetJ - 1];
    const isUpGreater = upVal >= leftVal;

    const upChild = expandPredecessor(
      targetI - 1,
      targetJ,
      `⬆️上方(舍弃'${c1}')`,
      isCalculated ? (isUpGreater ? '👑较大胜出' : '🥈次优') : '上方候选',
      isCalculated && isUpGreater ? 'visited' : 'normal',
      `root-up`,
      1
    );

    const leftChild = expandPredecessor(
      targetI,
      targetJ - 1,
      `⬅️向左(舍弃'${c2}')`,
      isCalculated ? (!isUpGreater ? '👑较大胜出' : '🥈次优') : '左方候选',
      isCalculated && !isUpGreater ? 'visited' : 'normal',
      `root-left`,
      1
    );

    rootNode.children.push(upChild, leftChild);
  }

  return rootNode;
}

/** 兼容旧版调用的别名导出 */
export const buildLcs2DDepTree = buildLcsStateDepTree;

export function buildLcsStage3ForwardSteps(inputs: Record<string, any>): Lcs2DStep[] {
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

  const pushStep = (st: Lcs2DStep) => {
    if (!st.vars) {
      st.vars = makeLcsStage3Vars({
        i: st.curI,
        j: st.curJ,
        s1,
        s2,
        val: st.currentVal,
      });
    }
    steps.push(st);
  };

  // Step 0: 函数入口
  pushStep({
    curI: 0,
    curJ: 0,
    currentCell: 'lcs3Forward',
    currentVal: 0,
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: `主函数入口：lcs3Forward("${s1}", "${s2}")`,
    message: `准备利用 ${n + 1}×${m + 1} 后缀二维表自底向上倒序填表 (求解 dp[0][0])`,
    log: `| 📥 进入 lcs3Forward: s1="${s1}", s2="${s2}"`,
    codeLine: lines3.entry,
    s1,
    s2,
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: '0', type: 'number' },
      { name: 'j', value: '0', type: 'number' },
    ],
    treeRoot: buildLcsStateDepTree(0, 0, dp, s1, s2, false, false, 2, 'forward'),
    activeNodeId: 'dp-0-0',
  });

  // Step 1: 表分配与边界初始化
  pushStep({
    curI: n,
    curJ: m,
    currentCell: `dp[${n}][${m}]`,
    currentVal: 0,
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: '初始化第 n 行与第 m 列为 0 (后缀空串基底)',
    message: 'dp[n][j] 与 dp[i][m] 代表后缀空串与任何串的 LCS 均为 0',
    log: `| 📋 分配二维 DP 表: dp[${n + 1}][${m + 1}] 全部初始为 0`,
    codeLine: lines3.allocDp,
    s1,
    s2,
    vars: [
      { name: 'dp[n][m]', value: '0', type: 'number' },
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
    ],
    treeRoot: buildLcsStateDepTree(n, m, dp, s1, s2, false, true, 2, 'forward'),
    activeNodeId: `dp-${n}-${m}`,
  });

  for (let i = n - 1; i >= 0; i--) {
    const c1 = s1[i];

    pushStep({
      curI: i,
      curJ: m,
      currentCell: `dp[${i}][${m}]`,
      currentVal: 0,
      dpTable: dp.map((r) => [...r]),
      depCells: [],
      decision: `外层倒序遍历第 ${i} 行 (i=${i}, 字符 '${c1}')`,
      message: `固定 s1[${i}]('${c1}')，内层倒序考察 s2 的每个字符`,
      log: `| 🔄 外层倒序遍历: i=${i}, 当前字符 s1[${i}]='${c1}'`,
      codeLine: lines3.loopI,
      s1,
      s2,
      vars: makeLcsStage3Vars({ i, j: m, s1, s2, val: 0 }),
      treeRoot: buildLcsStateDepTree(i, m, dp, s1, s2, false, true, 2, 'forward'),
      activeNodeId: `dp-${i}-${m}`,
    });

    for (let j = m - 1; j >= 0; j--) {
      const c2 = s2[j];
      const isMatch = c1 === c2;

      pushStep({
        curI: i,
        curJ: j,
        currentCell: `dp[${i}][${j}]`,
        currentVal: dp[i][j],
        dpTable: dp.map((r) => [...r]),
        depCells: [],
        decision: `内层倒序处理第 ${j} 列 (j=${j}, 字符 '${c2}')`,
        message: `考察后缀子问题 dp[${i}][${j}]: "${s1.slice(i)}" 与 "${s2.slice(j)}"`,
        log: `|   🔄 内层倒序遍历: j=${j}, 当前字符 s2[${j}]='${c2}'`,
        codeLine: lines3.loopJ,
        s1,
        s2,
        vars: makeLcsStage3Vars({ i, j, s1, s2, val: dp[i][j] }),
        treeRoot: buildLcsStateDepTree(i, j, dp, s1, s2, isMatch, false, 2, 'forward'),
        activeNodeId: `dp-${i}-${j}`,
      });

      // 字符比对
      pushStep({
        curI: i,
        curJ: j,
        currentCell: `dp[${i}][${j}]`,
        currentVal: dp[i][j],
        dpTable: dp.map((r) => [...r]),
        depCells: [],
        decision: isMatch
          ? `✨ 字符匹配成功：s1[${i}]('${c1}') == s2[${j}]('${c2}')`
          : `🔍 字符不匹配：s1[${i}]('${c1}') != s2[${j}]('${c2}')`,
        message: isMatch
          ? `字符相同！沿右下方对角线转移：dp[${i}][${j}] = 1 + dp[${i + 1}][${j + 1}]`
          : `字符不同！双向择优：dp[${i}][${j}] = max(dp[${i + 1}][${j}], dp[${i}][${j + 1}])`,
        log: isMatch
          ? `|   ✨ [字符比对] s1[${i}] == s2[${j}] ('${c1}')，触发右下对角线转移`
          : `|   🔍 [字符比对] s1[${i}] != s2[${j}] ('${c1}' != '${c2}')，触发下右择大`,
        codeLine: lines3.checkChar,
        s1,
        s2,
        vars: makeLcsStage3Vars({ i, j, s1, s2, val: dp[i][j], isMatch }),
        treeRoot: buildLcsStateDepTree(i, j, dp, s1, s2, isMatch, false, 2, 'forward'),
        activeNodeId: `dp-${i}-${j}`,
      });

      if (isMatch) {
        const diagVal = dp[i + 1][j + 1];
        dp[i][j] = 1 + diagVal;
        const depCells: DpCellDep[] = [
          { r: i + 1, c: j + 1, label: `↘️dp[${i + 1}][${j + 1}]=${diagVal}`, color: '#10b981' },
        ];

        pushStep({
          curI: i,
          curJ: j,
          currentCell: `dp[${i}][${j}] = ${dp[i][j]}`,
          currentVal: dp[i][j],
          dpTable: dp.map((r) => [...r]),
          depCells,
          decision: `对角线状态转移：1 + dp[${i + 1}][${j + 1}] = 1 + ${diagVal} = ${dp[i][j]}`,
          message: `纳入公共字符 '${c1}' (+1)，状态从右下角 (${i + 1}, ${j + 1}) 成功转移`,
          log: `|   ↘️ [状态转移] dp[${i}][${j}] = 1 + dp[${i + 1}][${j + 1}](${diagVal}) = ${dp[i][j]}`,
          codeLine: lines3.diagMatch,
          s1,
          s2,
          vars: makeLcsStage3Vars({ i, j, s1, s2, val: dp[i][j], isMatch: true, diag: diagVal }),
          treeRoot: buildLcsStateDepTree(i, j, dp, s1, s2, true, true, 2, 'forward'),
          activeNodeId: `dp-${i}-${j}`,
        });
      } else {
        const downVal = dp[i + 1][j];
        const rightVal = dp[i][j + 1];
        dp[i][j] = Math.max(downVal, rightVal);
        const depCells: DpCellDep[] = [
          { r: i + 1, c: j, label: `⬇️dp[${i + 1}][${j}]=${downVal}`, color: '#6366f1' },
          { r: i, c: j + 1, label: `➡️dp[${i}][${j + 1}]=${rightVal}`, color: '#f59e0b' },
        ];

        pushStep({
          curI: i,
          curJ: j,
          currentCell: `dp[${i}][${j}] = ${dp[i][j]}`,
          currentVal: dp[i][j],
          dpTable: dp.map((r) => [...r]),
          depCells,
          decision: `下右择优决策：max(⬇️${downVal}, ➡️${rightVal}) = ${dp[i][j]}`,
          message: `舍弃 s1[${i}] 或 s2[${j}]，选择带来更大公共子序列长度的后继分支`,
          log: `|   🔀 [分支择优] dp[${i}][${j}] = max(下:${downVal}, 右:${rightVal}) = ${dp[i][j]}`,
          codeLine: lines3.branchMax,
          s1,
          s2,
          vars: makeLcsStage3Vars({ i, j, s1, s2, val: dp[i][j], isMatch: false, up: downVal, left: rightVal }),
          treeRoot: buildLcsStateDepTree(i, j, dp, s1, s2, false, true, 2, 'forward'),
          activeNodeId: `dp-${i}-${j}`,
        });
      }
    }
  }

  // 最终完成单步
  pushStep({
    curI: 0,
    curJ: 0,
    currentCell: `dp[0][0] = ${dp[0][0]}`,
    currentVal: dp[0][0],
    dpTable: dp.map((r) => [...r]),
    depCells: [],
    decision: `🎉 顺推后缀二维表递推完成！全局最优解 dp[0][0] = ${dp[0][0]}`,
    message: `全部单元格倒序推导完毕，首部全局答案提取自左上角 dp[0][0] = ${dp[0][0]}`,
    log: `| 🏁 顺推二维 DP 计算完成，返回 dp[0][0] = ${dp[0][0]}`,
    codeLine: lines3.returnAns,
    s1,
    s2,
    vars: [
      { name: 'ans', value: `${dp[0][0]}`, type: 'number' },
      { name: 'dp[0][0]', value: `${dp[0][0]}`, type: 'number' },
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
    ],
    treeRoot: buildLcsStateDepTree(0, 0, dp, s1, s2, s1[0] === s2[0], true, 2, 'forward'),
    activeNodeId: 'dp-0-0',
  });

  return steps;
}

export function buildLcsStage3Steps(inputs: Record<string, any>, mode?: string): Lcs2DStep[] {
  if (mode === 'forward') {
    return buildLcsStage3ForwardSteps(inputs);
  }
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

  const pushStep = (st: Lcs2DStep) => {
    if (!st.vars) {
      st.vars = makeLcsStage3Vars({
        i: st.curI,
        j: st.curJ,
        s1,
        s2,
        val: st.currentVal,
      });
    }
    steps.push(st);
  };

  // Step 0: 函数入口
  pushStep({
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
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: '0', type: 'number' },
      { name: 'j', value: '0', type: 'number' },
    ],
    treeRoot: buildLcs2DDepTree(0, 0, dp, s1, s2),
    activeNodeId: 'dp-0-0',
  });

  // Step 1: 表分配
  pushStep({
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
    vars: [
      { name: 'dp[0][0]', value: '0', type: 'number' },
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
    ],
    treeRoot: buildLcs2DDepTree(0, 0, dp, s1, s2),
    activeNodeId: 'dp-0-0',
  });

  for (let i = 1; i <= n; i++) {
    const c1 = s1[i - 1];

    pushStep({
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
      vars: makeLcsStage3Vars({ i, j: 0, s1, s2, val: 0 }),
      treeRoot: buildLcs2DDepTree(i, 0, dp, s1, s2),
      activeNodeId: `dp-${i}-0`,
    });

    for (let j = 1; j <= m; j++) {
      const c2 = s2[j - 1];
      const isMatch = c1 === c2;

      pushStep({
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
        vars: makeLcsStage3Vars({ i, j, s1, s2, val: dp[i][j] }),
        treeRoot: buildLcs2DDepTree(i, j, dp, s1, s2, isMatch, false),
        activeNodeId: `dp-${i}-${j}`,
      });

      // 字符比对
      pushStep({
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
        vars: makeLcsStage3Vars({ i, j, s1, s2, val: dp[i][j], isMatch }),
        treeRoot: buildLcs2DDepTree(i, j, dp, s1, s2, isMatch, false),
        activeNodeId: `dp-${i}-${j}`,
      });

      if (isMatch) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        pushStep({
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
          vars: makeLcsStage3Vars({ i, j, s1, s2, val: dp[i][j], isMatch: true, diag: dp[i - 1][j - 1] }),
          treeRoot: buildLcs2DDepTree(i, j, dp, s1, s2, true, true),
          activeNodeId: `dp-${i}-${j}`,
        });
      } else {
        const up = dp[i - 1][j];
        const left = dp[i][j - 1];
        dp[i][j] = Math.max(up, left);
        pushStep({
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
          vars: makeLcsStage3Vars({ i, j, s1, s2, val: dp[i][j], isMatch: false, up, left }),
          treeRoot: buildLcs2DDepTree(i, j, dp, s1, s2, false, true),
          activeNodeId: `dp-${i}-${j}`,
        });
      }
    }
  }

  pushStep({
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
    vars: [
      { name: 'ans', value: `${dp[n][m]}`, type: 'number' },
      { name: 'dp[n][m]', value: `${dp[n][m]}`, type: 'number' },
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
    ],
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
  dpGrid?: number[][];
  vars?: StepVar[];
}

export function buildLcsStage4Steps(inputs: Record<string, any>): LcsSpaceOptStep[] {
  const { s1, s2 } = parseLcsInputs(inputs);
  const n = s1.length;
  const m = s2.length;
  const steps: LcsSpaceOptStep[] = [];
  const dp = new Array(m + 1).fill(0);
  const fullGrid: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

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

  const pushStep = (s: Omit<LcsSpaceOptStep, 'dpGrid'>) => {
    const vars = s.vars || makeLcsStage4Vars({
      i: s.curI,
      j: s.curJ,
      s1,
      s2,
      dpVal: s.curJ >= 0 && s.curJ < s.dp.length ? s.dp[s.curJ] : undefined,
      leftUp: s.leftUp,
    });
    steps.push({
      ...s,
      vars,
      dpGrid: fullGrid.map((r) => [...r]),
    });
  };

  pushStep({
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
    vars: [
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
      { name: 'i', value: '0', type: 'number' },
      { name: 'j', value: '0', type: 'number' },
    ],
  });

  pushStep({
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
    vars: [
      { name: 'dp[0]', value: '0', type: 'number' },
      { name: 'leftUp', value: '0', type: 'number' },
      { name: 's1', value: `"${s1}"`, type: 'string' },
      { name: 's2', value: `"${s2}"`, type: 'string' },
    ],
  });

  for (let i = 1; i <= n; i++) {
    let leftUp = 0;
    const c1 = s1[i - 1];

    pushStep({
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
      vars: makeLcsStage4Vars({ i, j: 0, s1, s2, leftUp: 0 }),
    });

    pushStep({
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
      vars: makeLcsStage4Vars({ i, j: 0, s1, s2, leftUp: 0 }),
    });

    for (let j = 1; j <= m; j++) {
      const c2 = s2[j - 1];

      pushStep({
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
        vars: makeLcsStage4Vars({ i, j, s1, s2, dpVal: dp[j], leftUp }),
      });

      // 细粒度步骤 1: 暂存旧值
      const backup = dp[j];
      pushStep({
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
        vars: makeLcsStage4Vars({ i, j, s1, s2, dpVal: dp[j], leftUp, backup }),
      });

      // 字符比对
      const isMatch = c1 === c2;
      pushStep({
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
        vars: makeLcsStage4Vars({ i, j, s1, s2, dpVal: dp[j], leftUp, backup, isMatch }),
      });

      // 细粒度步骤 2: 转移计算
      if (isMatch) {
        dp[j] = leftUp + 1;
        fullGrid[i][j] = dp[j];
        pushStep({
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
          vars: makeLcsStage4Vars({ i, j, s1, s2, dpVal: dp[j], leftUp, backup, isMatch }),
        });
      } else {
        dp[j] = Math.max(dp[j], dp[j - 1]);
        fullGrid[i][j] = dp[j];
        pushStep({
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
          vars: makeLcsStage4Vars({ i, j, s1, s2, dpVal: dp[j], leftUp, backup, isMatch }),
        });
      }

      // 细粒度步骤 3: 寄存器推移
      leftUp = backup;
      pushStep({
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
        vars: makeLcsStage4Vars({ i, j, s1, s2, dpVal: dp[j], leftUp, backup }),
      });
    }
  }

  pushStep({
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
    vars: [
      { name: 'ans', value: `${dp[m]}`, type: 'number' },
      { name: 'dp[m]', value: `${dp[m]}`, type: 'number' },
      { name: 'i', value: `${n}`, type: 'number' },
      { name: 'j', value: `${m}`, type: 'number' },
    ],
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
  metrics: [],
  codeLanguages: DP_067_PROBLEMS['longest-common-subsequence'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['longest-common-subsequence'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['longest-common-subsequence'].analysisHtml,
  modes: [
    { id: 'forward', label: '顺推 (从首开始)' },
    { id: 'reverse', label: '逆推 (从尾开始)' },
  ],
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
      card1Title: '🔤 双串字符对齐与比较 (text1 × text2)',
      card2Title: '🌿 递归搜索调用树 (Recursive Call Tree)',
      card2Desc: '展现实时 DFS 调用分支，字符匹配沿对角线探查，不匹配时分裂为向左与向上子问题。',
      legend: [
        { label: '当前比对字符', color: '#0284c7' },
        { label: '字符匹配 (+1)', color: '#16a34a' },
        { label: '待探查', color: '#94a3b8' },
      ],
      codeLanguages: LCS_STAGE1_FORWARD_CODE_LANGUAGES,
      modeCodeLanguages: {
        reverse: LCS_STAGE1_CODE_LANGUAGES,
        forward: LCS_STAGE1_FORWARD_CODE_LANGUAGES,
      },
      has3D: true,
      buildSteps: buildLcsStage1Steps,
      renderCanvas: (container, step, extra) => {
        const isForward = Boolean(step.currentCall?.toLowerCase().includes('forward'));
        const gridI = isForward ? step.i : Math.max(0, step.i + 1);
        const gridJ = isForward ? step.j : Math.max(0, step.j + 1);
        renderStage1GridCard(
          container,
          'LCS 递归探索网格 (i, j)',
          step.s1.length + 1,
          step.s2.length + 1,
          gridI,
          gridJ,
          ['Ø', ...step.s1.split('')],
          ['Ø', ...step.s2.split('')],
          extra?.is3DMode,
          step
        );
      },
      renderCustomMetrics: (container, step) => {
        renderLcsCard2CompoundView(
          container,
          (treeBox) => RecursionTreeAdapter.renderRecursionTree(treeBox, step.treeRoot, step.activeNodeId, false),
          (strBox) => renderStringAlignment(strBox, step.s1, step.s2, step.i, step.j, step.matchedIndices1, step.matchedIndices2),
          (stackBox) =>
            ThreeRecursionStackAdapter.getInstance().render(stackBox, {
              treeRoot: step.treeRoot,
              activeNodeId: step.activeNodeId,
              currentCall: step.currentCall,
              i: step.i,
              j: step.j,
              s1: step.s1,
              s2: step.s2,
              vars: step.vars,
              callStack: step.callStack,
            })
        );
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
      card1Title: '🎯 2D 备忘录矩阵 memo[i][j]',
      card2Title: '💾 记忆化搜索剪枝树 与 🔤 双字符串比对',
      card2Desc: '遇重复子问题直接命中缓存并剪枝回溯，杜绝指数级爆炸；支持一键切换字符比对卡片。',
      legend: [
        { label: '缓存命中 (Hit)', color: '#10b981' },
        { label: '未命中算值 (Miss)', color: '#ef4444' },
        { label: '未计算 (-1)', color: '#94a3b8' },
      ],
      codeLanguages: LCS_STAGE2_FORWARD_CODE_LANGUAGES,
      modeCodeLanguages: {
        reverse: LCS_STAGE2_CODE_LANGUAGES,
        forward: LCS_STAGE2_FORWARD_CODE_LANGUAGES,
      },
      has3D: true,
      buildSteps: buildLcsStage2Steps,
      renderCanvas: (container, step, extra) => {
        renderMemoGridCard(
          container,
          'LCS 备忘录 memo[i][j]',
          step.memoGrid,
          step.i,
          step.j,
          ['Ø', ...step.s1.split('')],
          ['Ø', ...step.s2.split('')],
          extra?.is3DMode
        );
      },
      renderCustomMetrics: (container, step) => {
        renderLcsCard2CompoundView(
          container,
          (treeBox) => RecursionTreeAdapter.renderRecursionTree(treeBox, step.treeRoot, step.activeNodeId, true),
          (strBox) => renderStringAlignment(strBox, step.s1, step.s2, step.i, step.j, step.matchedIndices1, step.matchedIndices2),
          (stackBox) =>
            ThreeRecursionStackAdapter.getInstance().render(stackBox, {
              treeRoot: step.treeRoot,
              activeNodeId: step.activeNodeId,
              currentCall: step.currentCall,
              i: step.i,
              j: step.j,
              s1: step.s1,
              s2: step.s2,
              vars: step.vars,
              callStack: step.callStack,
            })
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
        mode: '双串样本对应模型 · 状态依赖拓扑树',
        complexity: 'O(N×M) · O(N×M)',
      },
      card1Title: '📊 严格二维状态表 dp[i][j]',
      card2Title: '🌲 状态依赖拓扑展开树 与 🔤 双字符串比对',
      card2Desc: '基于 DAG 拓扑反向展开当前格点的直接前驱与次级依赖链路；支持一键切换双串比对视图。',
      legend: [
        { label: '当前填表单元格', color: '#10b981' },
        { label: '依赖前驱单元格', color: '#6366f1' },
        { label: '已计算', color: '#64748b' },
      ],
      codeLanguages: LCS_STAGE3_FORWARD_CODE_LANGUAGES,
      modeCodeLanguages: {
        reverse: LCS_STAGE3_CODE_LANGUAGES,
        forward: LCS_STAGE3_FORWARD_CODE_LANGUAGES,
      },
      has3D: true,
      buildSteps: buildLcsStage3Steps,
      renderCanvas: (container, step, extra) => {
        renderDp2DCard2(
          container,
          '二维状态表 dp[i][j]',
          step.dpTable,
          step.curI,
          step.curJ,
          step.depCells.map((d: DpCellDep) => ({ r: d.r, c: d.c })),
          ['Ø', ...step.s1.split('')],
          ['Ø', ...step.s2.split('')],
          extra?.is3DMode
        );
      },
      renderCustomMetrics: (container, step) => {
        renderLcsCard2CompoundView(
          container,
          (treeBox) => RecursionTreeAdapter.renderRecursionTree(treeBox, step.treeRoot, step.activeNodeId, false),
          (strBox) => renderStringAlignment(strBox, step.s1, step.s2, step.curI, step.curJ),
          (stackBox) =>
            ThreeRecursionStackAdapter.getInstance().render(stackBox, {
              treeRoot: step.treeRoot,
              activeNodeId: step.activeNodeId,
              currentCall: `dp[${step.curI}][${step.curJ}]`,
              i: step.curI,
              j: step.curJ,
              s1: step.s1,
              s2: step.s2,
              vars: step.vars,
            })
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
      card1Title: '⚡ 空间压缩切片滚动沙盘 dp[j]',
      card2Title: '📈 空间压缩一维向量 与 🔤 双字符串比对',
      card2Desc: '利用一维滚动数组与 leftUp 寄存器暂存历史状态；支持一键切换双字符串字符比对。',
      legend: [
        { label: '当前滚动行', color: '#f59e0b' },
        { label: 'leftUp 暂存格', color: '#8b5cf6' },
        { label: '已回收历史行', color: '#94a3b8' },
      ],
      codeLanguages: LCS_STAGE4_CODE_LANGUAGES,
      has3D: true,
      buildSteps: buildLcsStage4Steps,
      renderCanvas: (container, step, extra) => {
        const fullGrid = step.dpGrid || [step.dp];
        renderStage4RollingGridCard(
          container,
          '空间压缩切片滚动',
          fullGrid,
          step.curI,
          step.curJ,
          step.leftUp,
          ['Ø', ...step.s1.split('')],
          ['Ø', ...step.s2.split('')],
          extra?.is3DMode
        );
      },
      renderCustomMetrics: (container, step) => {
        renderLcsCard2CompoundView(
          container,
          (subBox) => {
            renderSpaceOptCard2(
              subBox,
              `一维滚动数组 dp[0..${step.dp.length - 1}]`,
              step.dp,
              step.curJ,
              'leftUp',
              step.leftUp,
              ['Ø', ...step.s2.split('')]
            );
          },
          (subBox) => {
            renderStringAlignment(subBox, step.s1, step.s2, step.curI - 1, step.curJ - 1);
          },
          (stackBox) =>
            ThreeRecursionStackAdapter.getInstance().render(stackBox, {
              currentCall: `dp[${step.curJ}]`,
              i: step.curI,
              j: step.curJ,
              s1: step.s1,
              s2: step.s2,
              vars: step.vars,
            })
        );
      },
    },
  ],
  renderCanvas: (container, step) => {
    renderStringAlignment(container, step.s1, step.s2, step.i, step.j);
  },
  renderCustomMetrics: (container, step) => {
    RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId, false);
  },
});

function renderStringAlignment(
  container: HTMLElement,
  s1: string,
  s2: string,
  curI: number,
  curJ: number,
  matchedIndices1?: number[],
  matchedIndices2?: number[]
): void {
  SequenceAlignmentPresenter.render(container, {
    s1,
    s2,
    curI,
    curJ,
    matchedIndices1,
    matchedIndices2,
  });
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
