/**
 * 单词搜索 (LeetCode 79) - 声明式 4-Card 沙盘渲染器
 * 核心教学反例：为什么不能直接改动态规划？——深入辨析无后效性
 * 涵盖：
 * 阶段 1: 暴力回溯搜索 (未加剪枝)
 * 阶段 2: 错误记忆化尝试反例剖析 (展示为何无后效性破坏导致记忆化失效)
 * 阶段 3: 标准原地修改现场恢复 (DFS + Backtracking)
 * 阶段 4: 首尾词频统计反转剪枝优化 (Heuristic Direction Pruning)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { DP_067_PROBLEMS } from './dp-067-problem-content';
import {
  WORD_SEARCH_STAGE1_CODE_LANGUAGES,
  WORD_SEARCH_STAGE2_CODE_LANGUAGES,
  WORD_SEARCH_STAGE3_CODE_LANGUAGES,
  WORD_SEARCH_STAGE4_CODE_LANGUAGES,
} from './dp-067-stage-codes';
import { renderRecursionCard1 } from './dp-067-shared';

export interface WordSearchStep {
  i: number;
  j: number;
  k: number;
  board: string[][];
  word: string;
  originalWord?: string;
  matchedLen: number;
  path: Array<[number, number]>;
  status: 'start' | 'match' | 'mismatch' | 'backtrack' | 'found' | 'prune' | 'conflict';
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  callStack?: Array<{ label: string }>;
  metrics?: Record<string, any>;
  wordReversed?: boolean;
}

export function parseWordSearchInputs(inputs: Record<string, any>) {
  let board: string[][] = [
    ['A', 'B', 'C', 'E'],
    ['S', 'F', 'C', 'S'],
    ['A', 'D', 'E', 'E'],
  ];
  const rawBoard = inputs?.['input-board'];
  if (rawBoard) {
    try {
      const parsed = JSON.parse(String(rawBoard));
      if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
        board = parsed;
      }
    } catch {
      // fallback
    }
  }
  const word = String(inputs?.['input-word'] || 'ABCCED').trim();
  return { board, word };
}

// ==========================================
// ==========================================
// 1. Stage 1: 暴力回溯搜索 (带 visited 标记)
// ==========================================

export function buildWordSearchStage1Steps(inputs: Record<string, any>): WordSearchStep[] {
  const { board: origBoard, word } = parseWordSearchInputs(inputs);
  const m = origBoard.length;
  const n = origBoard[0].length;
  const steps: WordSearchStep[] = [];
  const curBoard = origBoard.map((r) => [...r]);
  const visited: boolean[][] = Array.from({ length: m }, () => new Array(n).fill(false));
  const path: Array<[number, number]> = [];
  const stack: Array<{ label: string }> = [];

  const lines = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    dimensions: { java: 3, cpp: 3, python: 3, javascript: 3 },
    allocVisited: { java: 4, cpp: 4, python: 4, javascript: 4 },
    outerI: { java: 5, cpp: 5, python: 5, javascript: 5 },
    outerJ: { java: 6, cpp: 6, python: 6, javascript: 6 },
    callDfs: { java: 7, cpp: 7, python: 7, javascript: 7 },
    returnFalse: { java: 10, cpp: 10, python: 10, javascript: 10 },
    dfsEntry: { java: 12, cpp: 12, python: 12, javascript: 12 },
    checkTargetFound: { java: 13, cpp: 13, python: 13, javascript: 13 },
    checkBounds: { java: 14, cpp: 14, python: 14, javascript: 14 },
    checkVisitedOrMismatch: { java: 15, cpp: 15, python: 15, javascript: 15 },
    markVisited: { java: 16, cpp: 16, python: 16, javascript: 16 },
    branchDown: { java: 17, cpp: 17, python: 17, javascript: 17 },
    branchUp: { java: 18, cpp: 18, python: 18, javascript: 18 },
    branchRight: { java: 19, cpp: 19, python: 19, javascript: 19 },
    branchLeft: { java: 20, cpp: 20, python: 20, javascript: 20 },
    backtrackRestore: { java: 21, cpp: 21, python: 21, javascript: 21 },
    returnResult: { java: 22, cpp: 22, python: 22, javascript: 22 },
  };

  // Step 0: 函数入口
  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 0,
    path: [],
    status: 'start',
    decision: `主函数入口：exist1(board, word="${word}")`,
    message: `网格大小为 ${m}×${n}，目标单词长度为 ${word.length}`,
    log: `| 📥 进入 exist1: 网格大小 ${m}×${n}, 目标 "${word}"`,
    codeLine: lines.entry,
    metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '函数入口' },
  });

  // Step 1: 分配 visited
  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 0,
    path: [],
    status: 'start',
    decision: `初始化访问标记表 visited[${m}][${n}] = false`,
    message: `防止在同一个单词搜索路径中重复踏入同一单元格`,
    log: `| 📋 初始化 visited 访问标记表 (${m}×${n})`,
    codeLine: lines.allocVisited,
    metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '分配访问标记' },
  });

  let found = false;
  let callCount = 0;

  function dfs(i: number, j: number, k: number): boolean {
    if (found || steps.length > 500) return true;
    callCount++;
    const indent = '| '.repeat(k + 1);

    // Line 12: dfs entry
    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: k,
      path: [...path],
      status: 'start',
      decision: `进入递归 dfs1(i=${i}, j=${j}, k=${k})`,
      message: `探查当前字符是否与 word[${k}]('${word[k] || ''}') 匹配`,
      log: `${indent}📥 进入 dfs1(i=${i}, j=${j}, k=${k}) [顺推调用 #${callCount}]`,
      codeLine: lines.dfsEntry,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': 'DFS 入口' },
    });

    // Line 13: checkTargetFound
    if (k === word.length) {
      found = true;
      steps.push({
        i,
        j,
        k,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: k,
        path: [...path],
        status: 'found',
        decision: `🎉 成功完全匹配单词 "${word}"！`,
        message: `k == ${word.length}，已匹配全部字符，返回 true`,
        log: `${indent}🎉 【完全匹配】dfs1(i=${i}, j=${j}, k=${k}) 已匹配目标单词全部字符，return true!`,
        codeLine: lines.checkTargetFound,
        callStack: [...stack],
        metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': '完全匹配' },
      });
      return true;
    }

    // Line 14: checkBounds
    if (i < 0 || i >= m || j < 0 || j >= n) {
      steps.push({
        i,
        j,
        k,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: k,
        path: [...path],
        status: 'mismatch',
        decision: `坐标 (${i}, ${j}) 越界，返回 false`,
        message: `超出网格 ${m}×${n} 范围`,
        log: `${indent}🌊 【越界触水拦截】dfs1(i=${i}, j=${j}, k=${k}) 跳入边界深水河流！立即弹回，return false`,
        codeLine: lines.checkBounds,
        callStack: [...stack],
        metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': '越界阻断' },
      });
      return false;
    }

    // Line 15: checkVisitedOrMismatch
    if (visited[i][j] || curBoard[i][j] !== word[k]) {
      const isVis = visited[i][j];
      const reason = isVis ? '已被当前路径访问过' : `'${curBoard[i][j]}' != '${word[k]}'`;
      steps.push({
        i,
        j,
        k,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: k,
        path: [...path],
        status: 'mismatch',
        decision: `字符不匹配或已访问: board[${i}][${j}] (${reason})，返回 false`,
        message: `无法推进目标字符 '${word[k]}'`,
        log: isVis
          ? `${indent}🚫 【已访问阻断】dfs1(i=${i}, j=${j}, k=${k}) 该格已被当前路径占用，return false`
          : `${indent}🚫 【字符失配阻断】dfs1(i=${i}, j=${j}, k=${k}) board[${i}][${j}]('${curBoard[i][j]}') != '${word[k]}'，return false`,
        codeLine: lines.checkVisitedOrMismatch,
        callStack: [...stack],
        metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': '字符不匹配' },
      });
      return false;
    }

    // Line 16: markVisited
    stack.push({ label: `dfs(${i}, ${j}, k=${k}['${word[k]}'])` });
    path.push([i, j]);
    visited[i][j] = true;
    const originChar = curBoard[i][j];
    curBoard[i][j] = '#';

    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: k + 1,
      path: [...path],
      status: 'match',
      decision: `字符匹配成功！board[${i}][${j}] == '${word[k]}'`,
      message: `标记 visited[${i}][${j}] = true，继续四向探索`,
      log: `${indent}✅ 【字符匹配】dfs1(i=${i}, j=${j}, k=${k}) board[${i}][${j}] == '${word[k]}'，标记锁定现场`,
      codeLine: lines.markVisited,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k + 1} / ${word.length}`, 'metric-status': '匹配推进' },
    });

    // Lines 17-20: 逐一四向分支调用探索 (下、上、右、左独立高亮)
    const dirList = [
      { name: 'down', label: '向下', di: 1, dj: 0, icon: '⬇️', line: lines.branchDown },
      { name: 'up', label: '向上', di: -1, dj: 0, icon: '⬆️', line: lines.branchUp },
      { name: 'right', label: '向右', di: 0, dj: 1, icon: '➡️', line: lines.branchRight },
      { name: 'left', label: '向左', di: 0, dj: -1, icon: '⬅️', line: lines.branchLeft },
    ];
    for (const d of dirList) {
      const nextI = i + d.di;
      const nextJ = j + d.dj;
      const nextK = k + 1;

      steps.push({
        i,
        j,
        k,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: k + 1,
        path: [...path],
        status: 'start',
        decision: `执行 ${d.name} = dfs1(b, w, ${nextI}, ${nextJ}, ${nextK}, vis)，向${d.label}探索`,
        message: `准备进入 dfs1(i=${nextI}, j=${nextJ}, k=${nextK})`,
        log: `${indent}${d.icon} 执行 ${d.name} = dfs1(${nextI}, ${nextJ}, ${nextK})，准备深入探索`,
        codeLine: d.line,
        callStack: [...stack],
        metrics: { 'metric-matched': `${k + 1} / ${word.length}`, 'metric-status': `${d.label}探索` },
      });

      if (dfs(nextI, nextJ, nextK)) {
        return true;
      }
    }

    // Line 19: backtrackRestore
    visited[i][j] = false;
    curBoard[i][j] = originChar;
    path.pop();
    stack.pop();

    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: k,
      path: [...path],
      status: 'backtrack',
      decision: `回溯现场恢复: visited[${i}][${j}] = false, 恢复字符 '${originChar}'`,
      message: `当前分支无法走通，撤销占用并退回上一层调用`,
      log: `${indent}↩️ 【回溯恢复】dfs1(i=${i}, j=${j}, k=${k}) visited[${i}][${j}] = false, 恢复现场字符 '${originChar}'`,
      codeLine: lines.backtrackRestore,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': '回溯恢复' },
    });

    // Line 20: returnResult
    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: k,
      path: [...path],
      status: 'backtrack',
      decision: `dfs1(${i}, ${j}) 四向皆失败，返回 false`,
      message: `本次路径搜索终结`,
      log: `${indent}❌ 【分支失败】dfs1(i=${i}, j=${j}, k=${k}) 四向探索均无解，return false`,
      codeLine: lines.returnResult,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': '返回 false' },
    });

    return false;
  }

  // 外层循环枚举起点 (展示探索起点，保证一行一步)
  for (let i = 0; i < m && !found; i++) {
    steps.push({
      i,
      j: -1,
      k: 0,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: 0,
      path: [],
      status: 'start',
      decision: `外层行循环枚举: i = ${i}`,
      message: `考察第 ${i} 行各列`,
      log: `| 🔍 考察外层起点: 第 i=${i} 行各列`,
      codeLine: lines.outerI,
      metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': `枚举 i=${i}` },
    });

    for (let j = 0; j < n && !found; j++) {
      steps.push({
        i,
        j,
        k: 0,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: 0,
        path: [],
        status: 'start',
        decision: `内层列循环枚举: j = ${j}，当前单元格 (${i}, ${j}) = '${curBoard[i][j]}'`,
        message: `检查该单元格是否能作为单词 "${word}" 的起点`,
        log: `| 🎯 检查单元格 (i=${i}, j=${j}) ['${curBoard[i][j]}'] 是否能作为起点`,
        codeLine: lines.outerJ,
        metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': `考察 (${i},${j})` },
      });

      steps.push({
        i,
        j,
        k: 0,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: 0,
        path: [],
        status: 'start',
        decision: `调用 dfs1(board, word, i=${i}, j=${j}, k=0, visited)`,
        message: `发起以 (${i}, ${j}) 为起点的深度优先搜索`,
        log: `| ⬇️ 执行 start = dfs1(${i}, ${j}, 0)，准备深入探索`,
        codeLine: lines.callDfs,
        metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '调用 DFS' },
      });

      if (dfs(i, j, 0)) {
        steps.push({
          i,
          j,
          k: word.length,
          board: curBoard.map((r) => [...r]),
          word,
          matchedLen: word.length,
          path: [...path],
          status: 'found',
          decision: `dfs1 返回 true！if (dfs1(...)) 命中，主函数返回 true`,
          message: `已成功在网格中找到单词 "${word}"`,
          log: `| 🏆 成功找到单词 "${word}"！主函数返回 true`,
          codeLine: lines.callDfs,
          metrics: { 'metric-matched': `${word.length} / ${word.length}`, 'metric-status': '匹配成功' },
        });
        return steps;
      }
    }
  }

  if (!found) {
    steps.push({
      i: -1,
      j: -1,
      k: 0,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: 0,
      path: [],
      status: 'prune',
      decision: `全部起点枚举完毕，未找到单词 "${word}"，返回 false`,
      message: `网格中不存在该单词`,
      log: `| 🏁 全部起点尝试完毕，未找到单词 "${word}"，返回 false`,
      codeLine: lines.returnFalse,
      metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '未找到' },
    });
  }

  return steps;
}

// ==========================================
// 2. Stage 2: 错误记忆化尝试（反例剖析）
// ==========================================

export function buildWordSearchStage2Steps(inputs: Record<string, any>): WordSearchStep[] {
  const { board: origBoard, word } = parseWordSearchInputs(inputs);
  const steps: WordSearchStep[] = [];
  const curBoard = origBoard.map((r) => [...r]);

  const lines2 = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    allocMemo: { java: 3, cpp: 3, python: 3, javascript: 3 },
    outerI: { java: 4, cpp: 4, python: 4, javascript: 4 },
    outerJ: { java: 5, cpp: 5, python: 5, javascript: 5 },
    callDfs: { java: 6, cpp: 6, python: 6, javascript: 6 },
    returnFalse: { java: 9, cpp: 9, python: 9, javascript: 9 },
    dfsEntry: { java: 11, cpp: 11, python: 11, javascript: 11 },
    checkTarget: { java: 12, cpp: 12, python: 12, javascript: 12 },
    checkBounds: { java: 13, cpp: 13, python: 13, javascript: 13 },
    checkMemo: { java: 14, cpp: 14, python: 14, javascript: 14 },
    markZero: { java: 15, cpp: 15, python: 15, javascript: 15 },
    branchDown: { java: 16, cpp: 16, python: 16, javascript: 16 },
    branchRight: { java: 17, cpp: 17, python: 17, javascript: 17 },
    restore: { java: 18, cpp: 18, python: 18, javascript: 18 },
    writeMemo: { java: 19, cpp: 19, python: 19, javascript: 19 },
  };

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 0,
    path: [],
    status: 'start',
    decision: '主函数入口：existMemoWrong(board, word)',
    message: '很多初学者试图将单词搜索改造成动态规划，尝试引入 memo[i][j][k]',
    log: '| ⚠️ 反例教学入口: 探究为何 memo[i][j][k] 破坏无后效性',
    codeLine: lines2.entry,
    metrics: { 'metric-status': '反例教学剖析' },
  });

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 0,
    path: [],
    status: 'start',
    decision: '尝试分配三维备忘录 memo[M][N][WordLen]',
    message: '意图记忆：从 (i, j) 出发匹配 word[k..] 是否能够成功',
    log: '| 📋 尝试分配三维备忘录 memo[M][N][WordLen]',
    codeLine: lines2.allocMemo,
    metrics: { 'metric-status': '分配错误备忘录' },
  });

  steps.push({
    i: 0,
    j: 0,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 1,
    path: [[0, 0]],
    status: 'match',
    decision: '外层循环枚举 i=0, j=0，调用 dfsMemo(b, w, 0, 0, 0, memo)',
    message: '【路径 A】从 (0, 0) 起始探查，占用 (0, 0) 并向后深入',
    log: '| 📥 进入 dfsMemo(i=0, j=0, k=0) [顺推调用 #1 (路径 A 起步)]',
    codeLine: lines2.callDfs,
    metrics: { 'metric-status': '路径 A 探查' },
  });

  steps.push({
    i: 1,
    j: 1,
    k: 1,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 1,
    path: [[0, 0], [1, 1]],
    status: 'match',
    decision: '路径 A 途经 (1, 1)，检查 memo[1][1][1] == null (未命中)',
    message: '首次到达 (1, 1)，继续向下递归',
    log: '|   🔍 dfsMemo(i=1, j=1, k=1) 探查至 (1, 1)，检查 memo[1][1][1] (未命中)',
    codeLine: lines2.checkMemo,
    metrics: { 'metric-status': '备忘录未命中' },
  });

  steps.push({
    i: 1,
    j: 1,
    k: 1,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 1,
    path: [[0, 0], [1, 1]],
    status: 'match',
    decision: '路径 A 在 (1, 1) 处原地占位，向前递归探查',
    message: 'char tmp = b[1][1]; b[1][1] = 0;',
    log: '|   🔒 【原地打标】dfsMemo(i=1, j=1, k=1) 在 (1, 1) 原地打标占位 b[1][1] = 0',
    codeLine: lines2.markZero,
    metrics: { 'metric-status': '原地打标' },
  });

  steps.push({
    i: 1,
    j: 1,
    k: 1,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 1,
    path: [[0, 0], [1, 1]],
    status: 'explore',
    decision: '⬇️ 尝试向下分支 dfsMemo(b, w, 2, 1, 2, memo)',
    message: '路径 A 尝试向下探索下一个字符',
    log: '|   ⬇️ 【向下分支】dfsMemo(i=1, j=1) 尝试向下探查',
    codeLine: lines2.branchDown,
    metrics: { 'metric-status': '向下探查' },
  });

  steps.push({
    i: 1,
    j: 1,
    k: 1,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 1,
    path: [[0, 0]],
    status: 'backtrack',
    decision: '路径 A 深入探查受阻（因为 (0, 0) 已被自身路径占用而无法回头借道），返回 false',
    message: '恢复现场：b[1][1] = tmp;',
    log: '|   ↩️ 【回溯恢复】dfsMemo(i=1, j=1, k=1) 因 (0, 0) 被自身占用受阻，还原现场 b[1][1]',
    codeLine: lines2.restore,
    metrics: { 'metric-status': '回溯恢复' },
  });

  steps.push({
    i: 1,
    j: 1,
    k: 1,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 1,
    path: [],
    status: 'conflict',
    decision: '⚠️ 致命污染：memo[1][1][1] = false; return false;',
    message: '备忘录错误地记录了 memo[1][1][1] = false！它完全忽略了这个失败是因为【路径 A 自己占用了 (0,0)】！',
    log: '|   💥 【致命污染】dfsMemo(i=1, j=1, k=1) 写入 memo[1][1][1] = false (脏缓存污染!)',
    codeLine: lines2.writeMemo,
    metrics: { 'metric-status': '❌ 无后效性被破坏 (脏缓存污染)' },
  });

  steps.push({
    i: 1,
    j: 0,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 1,
    path: [[1, 0]],
    status: 'match',
    decision: '【路径 B】从不同起点 (1, 0) 走来，完全没有占用 (0, 0)！',
    message: '路径 B 探索到了同一坐标 (1, 1)，准备寻求通向 (0, 0) 的正确解',
    log: '| 📥 进入 dfsMemo(i=1, j=0, k=0) [顺推调用 #2 (路径 B 起步，未占用 (0, 0))]',
    codeLine: lines2.callDfs,
    metrics: { 'metric-status': '路径 B 探查' },
  });

  steps.push({
    i: 1,
    j: 1,
    k: 1,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 2,
    path: [[1, 0], [1, 1]],
    status: 'conflict',
    decision: '💥 假阴性错误爆发！if (memo[1][1][1] != null) 命中 false 直接返回！',
    message: '路径 B 读取了路径 A 留下的脏缓存，被无辜剪枝！原本可以通过 (0,0) 完成的匹配被判失败！',
    log: '|   ⚡ 【脏缓存命中】dfsMemo(i=1, j=1, k=1) 错误命中 memo[1][1][1] = false，导致可行解惨遭误杀！',
    codeLine: lines2.checkMemo,
    metrics: { 'metric-status': '❌ 假阴性剪枝灾难' },
  });

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 0,
    path: [],
    status: 'prune',
    decision: '📌 理论定论：无后效性彻底被破坏，本题绝对无法直接用动态规划/记忆化！',
    message: '“未来能走什么路径”严重依赖于“过去走过了哪些格子”（历史路径禁区）。因此只能使用回溯搜索 + 现场恢复！',
    log: '| 📌 理论定论: 无后效性遭破坏，必须使用回溯 + 现场恢复',
    codeLine: lines2.returnFalse,
    metrics: { 'metric-status': '确立算法边界' },
  });

  return steps;
}

// ==========================================
// 3. Stage 3: 标准原地修改现场恢复 (DFS + Backtracking)
// ==========================================

export function buildWordSearchStage3Steps(inputs: Record<string, any>): WordSearchStep[] {
  const { board: origBoard, word } = parseWordSearchInputs(inputs);
  const m = origBoard.length;
  const n = origBoard[0].length;
  const steps: WordSearchStep[] = [];
  const curBoard = origBoard.map((r) => [...r]);
  const path: Array<[number, number]> = [];
  const stack: Array<{ label: string }> = [];

  const lines3 = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    toCharArray: { java: 3, cpp: 3, python: 3, javascript: 3 },
    outerI: { java: 4, cpp: 4, python: 4, javascript: 4 },
    outerJ: { java: 5, cpp: 5, python: 5, javascript: 5 },
    callDfs: { java: 6, cpp: 6, python: 6, javascript: 6 },
    returnFalse: { java: 9, cpp: 9, python: 9, javascript: 9 },
    dfsEntry: { java: 11, cpp: 11, python: 11, javascript: 11 },
    checkTargetFound: { java: 12, cpp: 12, python: 12, javascript: 12 },
    checkBoundsAndMismatch: { java: 13, cpp: 13, python: 13, javascript: 13 },
    saveTmpChar: { java: 14, cpp: 14, python: 14, javascript: 14 },
    markZero: { java: 15, cpp: 15, python: 15, javascript: 15 },
    branchDown: { java: 16, cpp: 16, python: 16, javascript: 16 },
    branchUp: { java: 17, cpp: 17, python: 17, javascript: 17 },
    branchRight: { java: 18, cpp: 18, python: 18, javascript: 18 },
    branchLeft: { java: 19, cpp: 19, python: 19, javascript: 19 },
    restoreTmpChar: { java: 20, cpp: 20, python: 20, javascript: 20 },
    returnResult: { java: 21, cpp: 21, python: 21, javascript: 21 },
  };

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 0,
    path: [],
    status: 'start',
    decision: `主函数入口: exist3(board, word="${word}")`,
    message: `采用原地打标（置 0 占位），省去 visited 矩阵的 O(M×N) 额外空间开销`,
    log: `| 📥 进入 exist3: 原地标记法, 目标 "${word}"`,
    codeLine: lines3.entry,
    metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '函数入口' },
  });

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 0,
    path: [],
    status: 'start',
    decision: `将字符串 "${word}" 转换为字符数组 w`,
    message: `加速后续下标随机访问`,
    log: `| 🔤 转换字符串为字符数组 char[] w`,
    codeLine: lines3.toCharArray,
    metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '字符数组化' },
  });

  let found = false;
  let callCount3 = 0;

  function dfs3(i: number, j: number, k: number): boolean {
    if (found || steps.length > 500) return true;
    callCount3++;
    const indent = '| '.repeat(k + 1);

    // Line 11: dfs3 entry
    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: k,
      path: [...path],
      status: 'start',
      decision: `进入 dfs3(b, w, i=${i}, j=${j}, k=${k})`,
      message: `探查坐标 (${i}, ${j})`,
      log: `${indent}📥 进入 dfs3(i=${i}, j=${j}, k=${k}) [顺推调用 #${callCount3}]`,
      codeLine: lines3.dfsEntry,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': 'DFS 入口' },
    });

    // Line 12: check target found
    if (k === word.length) {
      found = true;
      steps.push({
        i,
        j,
        k,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: k,
        path: [...path],
        status: 'found',
        decision: `🎉 成功完全匹配单词 "${word}"！`,
        message: `k == ${word.length}，返回 true`,
        log: `${indent}🎉 【完全匹配】dfs3(i=${i}, j=${j}, k=${k}) 已成功拼出目标单词全部字符，return true!`,
        codeLine: lines3.checkTargetFound,
        callStack: [...stack],
        metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': '匹配成功' },
      });
      return true;
    }

    // Line 13: check bounds and mismatch
    if (i < 0 || i >= m || j < 0 || j >= n || curBoard[i][j] !== word[k]) {
      const isOob = i < 0 || i >= m || j < 0 || j >= n;
      const reason = isOob ? '越界' : (curBoard[i][j] === '#' ? '已占位访问' : `'${curBoard[i][j]}' != '${word[k]}'`);
      steps.push({
        i,
        j,
        k,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: k,
        path: [...path],
        status: 'mismatch',
        decision: `边界特判或字符不匹配: (${reason})，返回 false`,
        message: `未能匹配目标字符 '${word[k]}'`,
        log: isOob
          ? `${indent}🌊 【越界触水拦截】dfs3(i=${i}, j=${j}, k=${k}) 跳入边界深水河流！立即弹回，return false`
          : `${indent}🚫 【字符失配/已占位】dfs3(i=${i}, j=${j}, k=${k}) board[${i}][${j}] (${reason})，return false`,
        codeLine: lines3.checkBoundsAndMismatch,
        callStack: [...stack],
        metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': '不匹配阻断' },
      });
      return false;
    }

    // Line 14: save tmp char
    const originChar = curBoard[i][j];
    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: k + 1,
      path: [...path],
      status: 'match',
      decision: `暂存原字符: char tmp = b[${i}][${j}] ('${originChar}')`,
      message: `为回溯恢复现场准备备份`,
      log: `${indent}💾 【现场备份】dfs3(i=${i}, j=${j}, k=${k}) 暂存原字符 tmp = b[${i}][${j}] ('${originChar}')`,
      codeLine: lines3.saveTmpChar,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k + 1} / ${word.length}`, 'metric-status': '备份现场' },
    });

    // Line 15: in-place mark zero
    curBoard[i][j] = '#';
    path.push([i, j]);
    stack.push({ label: `dfs3(${i}, ${j}, k=${k}['${word[k]}'])` });

    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: k + 1,
      path: [...path],
      status: 'match',
      decision: `原地打标占位: b[${i}][${j}] = 0 (标记为已占用)`,
      message: `空间节省至 O(1)，无额外辅助表格`,
      log: `${indent}🔒 【原地打标】dfs3(i=${i}, j=${j}, k=${k}) b[${i}][${j}] = 0 占位防重复踏入`,
      codeLine: lines3.markZero,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k + 1} / ${word.length}`, 'metric-status': '原地打标' },
    });

    // Lines 16-19: 逐一四向分支调用探索 (下、上、右、左独立高亮)
    const dirList = [
      { name: 'down', label: '向下', di: 1, dj: 0, icon: '⬇️', line: lines3.branchDown },
      { name: 'up', label: '向上', di: -1, dj: 0, icon: '⬆️', line: lines3.branchUp },
      { name: 'right', label: '向右', di: 0, dj: 1, icon: '➡️', line: lines3.branchRight },
      { name: 'left', label: '向左', di: 0, dj: -1, icon: '⬅️', line: lines3.branchLeft },
    ];
    for (const d of dirList) {
      const nextI = i + d.di;
      const nextJ = j + d.dj;
      const nextK = k + 1;

      steps.push({
        i,
        j,
        k,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: k + 1,
        path: [...path],
        status: 'start',
        decision: `执行 ${d.name} = dfs3(b, w, ${nextI}, ${nextJ}, ${nextK})，向${d.label}探索`,
        message: `准备进入 dfs3(i=${nextI}, j=${nextJ}, k=${nextK})`,
        log: `${indent}${d.icon} 执行 ${d.name} = dfs3(${nextI}, ${nextJ}, ${nextK})，准备深入探索`,
        codeLine: d.line,
        callStack: [...stack],
        metrics: { 'metric-matched': `${k + 1} / ${word.length}`, 'metric-status': `${d.label}探索` },
      });

      if (dfs3(nextI, nextJ, nextK)) {
        return true;
      }
    }

    // Line 18: restore tmp char
    curBoard[i][j] = originChar;
    path.pop();
    stack.pop();

    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: k,
      path: [...path],
      status: 'backtrack',
      decision: `回溯现场恢复: b[${i}][${j}] = tmp ('${originChar}')`,
      message: `四方均未找到完整匹配，恢复该格子原始字符`,
      log: `${indent}↩️ 【回溯恢复】dfs3(i=${i}, j=${j}, k=${k}) b[${i}][${j}] = '${originChar}' 现场还原`,
      codeLine: lines3.restoreTmpChar,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': '现场恢复' },
    });

    // Line 19: return found
    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: k,
      path: [...path],
      status: 'backtrack',
      decision: `返回搜索结果: return false`,
      message: `当前路径失效，回退至上一级调用`,
      log: `${indent}❌ 【分支失败】dfs3(i=${i}, j=${j}, k=${k}) 四向无解，return false`,
      codeLine: lines3.returnResult,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k} / ${word.length}`, 'metric-status': '返回 false' },
    });

    return false;
  }

  for (let i = 0; i < m && !found; i++) {
    steps.push({
      i,
      j: -1,
      k: 0,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: 0,
      path: [],
      status: 'start',
      decision: `外层行循环枚举: i = ${i}`,
      message: `准备考察第 ${i} 行各个列`,
      log: `| 🔍 考察外层起点: 第 i=${i} 行各列`,
      codeLine: lines3.outerI,
      metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': `枚举 i=${i}` },
    });

    for (let j = 0; j < n && !found; j++) {
      steps.push({
        i,
        j,
        k: 0,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: 0,
        path: [],
        status: 'start',
        decision: `内层列循环枚举: j = ${j}，当前格子 (${i}, ${j}) = '${curBoard[i][j]}'`,
        message: `尝试以 (${i}, ${j}) 为首字母展开搜索`,
        log: `| 🎯 检查单元格 (i=${i}, j=${j}) ['${curBoard[i][j]}'] 是否能作为起点`,
        codeLine: lines3.outerJ,
        metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': `考察 (${i},${j})` },
      });

      steps.push({
        i,
        j,
        k: 0,
        board: curBoard.map((r) => [...r]),
        word,
        matchedLen: 0,
        path: [],
        status: 'start',
        decision: `调用 dfs3(board, w, i=${i}, j=${j}, k=0)`,
        message: `检查是否能从 (${i}, ${j}) 匹配全词`,
        log: `| ⬇️ 执行 start = dfs3(${i}, ${j}, 0)，准备深入探索`,
        codeLine: lines3.callDfs,
        metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '调用 DFS3' },
      });

      if (dfs3(i, j, 0)) {
        steps.push({
          i,
          j,
          k: word.length,
          board: curBoard.map((r) => [...r]),
          word,
          matchedLen: word.length,
          path: [...path],
          status: 'found',
          decision: `dfs3 返回 true！if (dfs3(...)) 命中，主函数返回 true`,
          message: `成功完成匹配，返回 true`,
          log: `| 🏆 成功找到单词 "${word}"！主函数返回 true`,
          codeLine: lines3.callDfs,
          metrics: { 'metric-matched': `${word.length} / ${word.length}`, 'metric-status': '匹配成功' },
        });
        return steps;
      }
    }
  }

  if (!found) {
    steps.push({
      i: -1,
      j: -1,
      k: 0,
      board: curBoard.map((r) => [...r]),
      word,
      matchedLen: 0,
      path: [],
      status: 'prune',
      decision: `全图枚举完毕均未走通，返回 false`,
      message: `网格中不存在该单词`,
      log: `| 🏁 全图枚举完毕，未找到单词 "${word}"，返回 false`,
      codeLine: lines3.returnFalse,
      metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '未找到' },
    });
  }

  return steps;
}

// ==========================================
// 4. Stage 4: 首尾词频反转剪枝优化 (Heuristic Direction Pruning)
// ==========================================

export function buildWordSearchStage4Steps(inputs: Record<string, any>): WordSearchStep[] {
  const { board: origBoard, word } = parseWordSearchInputs(inputs);
  const m = origBoard.length;
  const n = origBoard[0].length;
  const steps: WordSearchStep[] = [];
  const curBoard = origBoard.map((r) => [...r]);
  const path: Array<[number, number]> = [];
  const stack: Array<{ label: string }> = [];

  const lines4 = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    allocCount: { java: 3, cpp: 3, python: 3, javascript: 3 },
    countBoard: { java: 4, cpp: 4, python: 4, javascript: 4 },
    toChars: { java: 5, cpp: 5, python: 5, javascript: 5 },
    checkFreq: { java: 6, cpp: 6, python: 6, javascript: 6 },
    compareEnds: { java: 7, cpp: 7, python: 7, javascript: 7 },
    reverseWord: { java: 8, cpp: 8, python: 8, javascript: 8 },
    outerI: { java: 10, cpp: 10, python: 10, javascript: 10 },
    outerJ: { java: 11, cpp: 11, python: 11, javascript: 11 },
    callDfs: { java: 12, cpp: 12, python: 12, javascript: 12 },
    returnFalse: { java: 15, cpp: 15, python: 15, javascript: 15 },
    dfsEntry: { java: 17, cpp: 17, python: 17, javascript: 17 },
    baseSuccess: { java: 18, cpp: 18, python: 18, javascript: 18 },
    boundsCheck: { java: 19, cpp: 19, python: 19, javascript: 19 },
    saveChar: { java: 20, cpp: 20, python: 20, javascript: 20 },
    markZero: { java: 21, cpp: 21, python: 21, javascript: 21 },
    branchDown: { java: 22, cpp: 22, python: 22, javascript: 22 },
    branchUp: { java: 23, cpp: 23, python: 23, javascript: 23 },
    branchRight: { java: 24, cpp: 24, python: 24, javascript: 24 },
    branchLeft: { java: 25, cpp: 25, python: 25, javascript: 25 },
    restore: { java: 26, cpp: 26, python: 26, javascript: 26 },
    returnFound: { java: 27, cpp: 27, python: 27, javascript: 27 },
  };

  // Line 2: entry
  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 0,
    path: [],
    status: 'prune',
    decision: `词频剪枝与反向搜索优化入口: exist4(board, word="${word}")`,
    message: `开启两大致命剪枝优化：1. 字母频次不足直接秒拒；2. 首尾频次启发式倒序`,
    log: `| 📥 进入 exist4: 频次统计与首尾倒序启发剪枝, 目标 "${word}"`,
    codeLine: lines4.entry,
    metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '词频剪枝分析' },
  });

  // Line 3: alloc count
  const count = new Array(128).fill(0);
  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 0,
    path: [],
    status: 'start',
    decision: `分配 ASCII 频次统计数组: int[] count = new int[128]`,
    message: `准备统计整张网格中每个字符出现的总次数`,
    log: `| 📋 分配 ASCII 频次表 count[128]`,
    codeLine: lines4.allocCount,
    metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '分配频次表' },
  });

  // Line 4: count board
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      count[origBoard[r][c].charCodeAt(0)]++;
    }
  }
  const headChar = word[0];
  const tailChar = word[word.length - 1];
  const headFreq = count[headChar.charCodeAt(0)];
  const tailFreq = count[tailChar.charCodeAt(0)];

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word,
    matchedLen: 0,
    path: [],
    status: 'start',
    decision: `遍历整张网格统计字符频次: '${headChar}'=${headFreq}次, '${tailChar}'=${tailFreq}次`,
    message: `for (char[] row : board) for (char c : row) count[c]++;`,
    log: `| 📊 统计全网格频次: 首字符'${headChar}'=${headFreq}次, 尾字符'${tailChar}'=${tailFreq}次`,
    codeLine: lines4.countBoard,
    metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '统计字符频次' },
  });

  // Line 5: toChars
  let effectiveWord = word;
  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word: effectiveWord,
    matchedLen: 0,
    path: [],
    status: 'start',
    decision: `将目标单词转换为字符数组: char[] w = word.toCharArray()`,
    message: `当前目标单词 "${effectiveWord}"`,
    log: `| 🔤 转换单词为字符数组 char[] w = "${effectiveWord}"`,
    codeLine: lines4.toChars,
    metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '转换字符数组' },
  });

  // Line 6: checkFreq
  let sufficient = true;
  const tempCount = [...count];
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i);
    tempCount[code]--;
    if (tempCount[code] < 0) {
      sufficient = false;
      break;
    }
  }

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word: effectiveWord,
    matchedLen: 0,
    path: [],
    status: sufficient ? 'start' : 'prune',
    decision: sufficient
      ? `词频充足性检验通过：网格内各字母保有量满足单词需求`
      : `⚠️ 字母不足剪枝：网格中缺少构成单词所需的字母，秒拒返回 false！`,
    message: `for (char c : w) if (--count[c] < 0) return false;`,
    log: sufficient
      ? `| ✅ 频次校验通过: 网格内各字母满足拼写需求`
      : `| 🚫 字母保有量不足，直接剪枝秒拒! return false`,
    codeLine: lines4.checkFreq,
    metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': sufficient ? '词频充足' : '字母不足秒拒' },
  });

  if (!sufficient) {
    return steps.map((s) => ({
      ...s,
      originalWord: s.originalWord ?? word,
      wordReversed: false,
    }));
  }

  // Line 7: compareEnds
  const shouldReverse = tailFreq < headFreq;
  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: curBoard.map((r) => [...r]),
    word: effectiveWord,
    matchedLen: 0,
    path: [],
    status: 'prune',
    decision: `比较首尾字符频次: count['${tailChar}'](${tailFreq}) < count['${headChar}'](${headFreq}) => ${shouldReverse}`,
    message: shouldReverse
      ? `尾字母 '${tailChar}' 在网格中数量更少！从较少出现的字母开始搜索能极大削减搜索分支！`
      : `首字母 '${headChar}' 频次不高于尾字母，保持正向`,
    log: shouldReverse
      ? `| ⚡ 发现尾字符 '${tailChar}'(${tailFreq}次) < 首字符 '${headChar}'(${headFreq}次)，触发倒序搜索`
      : `| ➡️ 首字符频次不高于尾字符，保持正序搜索`,
    codeLine: lines4.compareEnds,
    metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': shouldReverse ? '触发倒序优化' : '保持正向' },
  });

  // Line 8: reverseWord if needed
  if (shouldReverse) {
    effectiveWord = word.split('').reverse().join('');
    steps.push({
      i: -1,
      j: -1,
      k: 0,
      board: curBoard.map((r) => [...r]),
      word: effectiveWord,
      matchedLen: 0,
      path: [],
      status: 'prune',
      decision: `✨ 执行单词翻转: "${word}" ➔ "${effectiveWord}" 进行反向搜索！`,
      message: `搜索 "${effectiveWord}" 与 "${word}" 完全等价，但搜索树规模指数级降低`,
      log: `| 🔄 单词完成翻转: "${word}" ➔ "${effectiveWord}"`,
      codeLine: lines4.reverseWord,
      wordReversed: true,
      metrics: { 'metric-matched': `0 / ${word.length}`, 'metric-status': '已倒序反转' },
    });
  }

  let found = false;
  let callCount4 = 0;

  function dfs4(i: number, j: number, k: number): boolean {
    if (found || steps.length > 500) return true;
    callCount4++;
    const indent = '| '.repeat(k + 1);

    // Line 17: dfsEntry
    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word: effectiveWord,
      matchedLen: k,
      path: [...path],
      status: 'start',
      decision: `进入 dfs4(board, w, i=${i}, j=${j}, k=${k})`,
      message: `考察是否匹配目标字符 '${effectiveWord[k] || ''}'`,
      log: `${indent}📥 进入 dfs4(i=${i}, j=${j}, k=${k}) [顺推调用 #${callCount4}]`,
      codeLine: lines4.dfsEntry,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k} / ${effectiveWord.length}`, 'metric-status': 'DFS 入口' },
    });

    // Line 18: baseSuccess
    if (k === effectiveWord.length) {
      found = true;
      steps.push({
        i,
        j,
        k,
        board: curBoard.map((r) => [...r]),
        word: effectiveWord,
        matchedLen: k,
        path: [...path],
        status: 'found',
        decision: `🎉 成功完全匹配单词 "${effectiveWord}"！`,
        message: `k == ${effectiveWord.length}，已匹配全部字符，返回 true`,
        log: `${indent}🎉 【完全匹配】dfs4(i=${i}, j=${j}, k=${k}) 已成功拼出目标单词全部字符，return true!`,
        codeLine: lines4.baseSuccess,
        callStack: [...stack],
        metrics: { 'metric-matched': `${k} / ${effectiveWord.length}`, 'metric-status': '完全匹配' },
      });
      return true;
    }

    // Line 19: boundsCheck
    if (i < 0 || i >= m || j < 0 || j >= n || curBoard[i][j] !== effectiveWord[k]) {
      const isOob = i < 0 || i >= m || j < 0 || j >= n;
      const reason = isOob ? '越界' : (curBoard[i][j] === '#' ? '已占位访问' : `'${curBoard[i][j]}' != '${effectiveWord[k]}'`);
      steps.push({
        i,
        j,
        k,
        board: curBoard.map((r) => [...r]),
        word: effectiveWord,
        matchedLen: k,
        path: [...path],
        status: 'mismatch',
        decision: `边界特判或字符不匹配: (${reason})，返回 false`,
        message: `当前格子无法接续匹配 '${effectiveWord[k]}'`,
        log: isOob
          ? `${indent}🌊 【越界触水拦截】dfs4(i=${i}, j=${j}, k=${k}) 跳入边界深水河流！立即弹回，return false`
          : `${indent}🚫 【字符失配/已占位】dfs4(i=${i}, j=${j}, k=${k}) board[${i}][${j}] (${reason})，return false`,
        codeLine: lines4.boundsCheck,
        callStack: [...stack],
        metrics: { 'metric-matched': `${k} / ${effectiveWord.length}`, 'metric-status': '不匹配阻断' },
      });
      return false;
    }

    // Line 20: saveChar
    const originChar = curBoard[i][j];
    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word: effectiveWord,
      matchedLen: k + 1,
      path: [...path],
      status: 'match',
      decision: `匹配成功！暂存原字符: char tmp = b[${i}][${j}] ('${originChar}')`,
      message: `为回溯恢复现场准备备份`,
      log: `${indent}💾 【现场备份】dfs4(i=${i}, j=${j}, k=${k}) 暂存原字符 tmp = b[${i}][${j}] ('${originChar}')`,
      codeLine: lines4.saveChar,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k + 1} / ${effectiveWord.length}`, 'metric-status': '暂存现场' },
    });

    // Line 21: markZero
    curBoard[i][j] = '#';
    path.push([i, j]);
    stack.push({ label: `dfs4(${i}, ${j}, k=${k}['${effectiveWord[k]}'])` });

    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word: effectiveWord,
      matchedLen: k + 1,
      path: [...path],
      status: 'match',
      decision: `原地占位打标: b[${i}][${j}] = 0`,
      message: `将坐标 (${i}, ${j}) 标记为已访问`,
      log: `${indent}🔒 【原地打标】dfs4(i=${i}, j=${j}, k=${k}) b[${i}][${j}] = 0 占位防重复踏入`,
      codeLine: lines4.markZero,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k + 1} / ${effectiveWord.length}`, 'metric-status': '原地打标' },
    });

    // Lines 22-25: 逐一四向分支调用探索 (下、上、右、左独立高亮)
    const dirList = [
      { name: 'down', label: '向下', di: 1, dj: 0, icon: '⬇️', line: lines4.branchDown },
      { name: 'up', label: '向上', di: -1, dj: 0, icon: '⬆️', line: lines4.branchUp },
      { name: 'right', label: '向右', di: 0, dj: 1, icon: '➡️', line: lines4.branchRight },
      { name: 'left', label: '向左', di: 0, dj: -1, icon: '⬅️', line: lines4.branchLeft },
    ];
    for (const d of dirList) {
      const nextI = i + d.di;
      const nextJ = j + d.dj;
      const nextK = k + 1;

      steps.push({
        i,
        j,
        k,
        board: curBoard.map((r) => [...r]),
        word: effectiveWord,
        matchedLen: k + 1,
        path: [...path],
        status: 'start',
        decision: `执行 ${d.name} = dfs4(b, w, ${nextI}, ${nextJ}, ${nextK})，向${d.label}探索`,
        message: `准备进入 dfs4(i=${nextI}, j=${nextJ}, k=${nextK})`,
        log: `${indent}${d.icon} 执行 ${d.name} = dfs4(${nextI}, ${nextJ}, ${nextK})，准备深入探索`,
        codeLine: d.line,
        callStack: [...stack],
        metrics: { 'metric-matched': `${k + 1} / ${effectiveWord.length}`, 'metric-status': `${d.label}探索` },
      });

      if (dfs4(nextI, nextJ, nextK)) {
        return true;
      }
    }

    // Line 24: restore
    curBoard[i][j] = originChar;
    path.pop();
    stack.pop();

    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word: effectiveWord,
      matchedLen: k,
      path: [...path],
      status: 'backtrack',
      decision: `四方均失败，回溯恢复现场: b[${i}][${j}] = tmp ('${originChar}')`,
      message: `撤销占位，回退至上一级调用`,
      log: `${indent}↩️ 【回溯恢复】dfs4(i=${i}, j=${j}, k=${k}) b[${i}][${j}] = '${originChar}' 现场还原`,
      codeLine: lines4.restore,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k} / ${effectiveWord.length}`, 'metric-status': '回溯恢复' },
    });

    // Line 25: returnFound
    steps.push({
      i,
      j,
      k,
      board: curBoard.map((r) => [...r]),
      word: effectiveWord,
      matchedLen: k,
      path: [...path],
      status: 'backtrack',
      decision: `返回搜索结果: return false`,
      message: `当前路径失效`,
      log: `${indent}❌ 【分支失败】dfs4(i=${i}, j=${j}, k=${k}) 四向无解，return false`,
      codeLine: lines4.returnFound,
      callStack: [...stack],
      metrics: { 'metric-matched': `${k} / ${effectiveWord.length}`, 'metric-status': '返回 false' },
    });

    return false;
  }

  for (let i = 0; i < m && !found; i++) {
    steps.push({
      i,
      j: -1,
      k: 0,
      board: curBoard.map((r) => [...r]),
      word: effectiveWord,
      matchedLen: 0,
      path: [],
      status: 'start',
      decision: `外层行枚举: i = ${i}`,
      message: `考察第 i=${i} 行各个列作为起点`,
      log: `| 🔍 考察外层起点: 第 i=${i} 行各列`,
      codeLine: lines4.outerI,
      metrics: { 'metric-matched': `0 / ${effectiveWord.length}`, 'metric-status': `枚举 i=${i}` },
    });

    for (let j = 0; j < n && !found; j++) {
      steps.push({
        i,
        j,
        k: 0,
        board: curBoard.map((r) => [...r]),
        word: effectiveWord,
        matchedLen: 0,
        path: [],
        status: 'start',
        decision: `内层列枚举: j = ${j}，当前格子 (i=${i}, j=${j}) = '${curBoard[i][j]}'`,
        message: `比较是否与起始目标字符 '${effectiveWord[0]}' 相符`,
        log: `| 🎯 检查单元格 (i=${i}, j=${j}) ['${curBoard[i][j]}'] 是否匹配起始字符 '${effectiveWord[0]}'`,
        codeLine: lines4.outerJ,
        metrics: { 'metric-matched': `0 / ${effectiveWord.length}`, 'metric-status': `考察 (${i},${j})` },
      });

      steps.push({
        i,
        j,
        k: 0,
        board: curBoard.map((r) => [...r]),
        word: effectiveWord,
        matchedLen: 0,
        path: [],
        status: 'start',
        decision: `调用 dfs4(board, w, i=${i}, j=${j}, 0)`,
        message: `从 (i=${i}, j=${j}) 开始搜索`,
        log: `| ⬇️ 执行 start = dfs4(${i}, ${j}, 0)，准备深入探索`,
        codeLine: lines4.callDfs,
        metrics: { 'metric-matched': `0 / ${effectiveWord.length}`, 'metric-status': '调用 DFS4' },
      });

      if (dfs4(i, j, 0)) {
        steps.push({
          i,
          j,
          k: effectiveWord.length,
          board: curBoard.map((r) => [...r]),
          word: effectiveWord,
          matchedLen: effectiveWord.length,
          path: [...path],
          status: 'found',
          decision: `dfs4 返回 true！if (dfs4(...)) 命中，主函数返回 true`,
          message: `成功在网格中找到目标单词！`,
          log: `| 🏆 成功找到单词 "${effectiveWord}"！主函数返回 true`,
          codeLine: lines4.callDfs,
          metrics: { 'metric-matched': `${effectiveWord.length} / ${effectiveWord.length}`, 'metric-status': '匹配成功' },
        });
        return steps;
      }
    }
  }

  if (!found) {
    steps.push({
      i: -1,
      j: -1,
      k: 0,
      board: curBoard.map((r) => [...r]),
      word: effectiveWord,
      matchedLen: 0,
      path: [],
      status: 'prune',
      decision: `全图枚举完毕均未走通，返回 false`,
      message: `网格中不存在该单词`,
      log: `| 🏁 全图枚举完毕，未找到单词 "${effectiveWord}"，返回 false`,
      codeLine: lines4.returnFalse,
      metrics: { 'metric-matched': `0 / ${effectiveWord.length}`, 'metric-status': '未找到' },
    });
  }

  return steps.map((s) => ({
    ...s,
    originalWord: s.originalWord ?? word,
    wordReversed: s.wordReversed ?? shouldReverse,
  }));
}

// ==========================================
// 5. 声明式 Visualizer
// ==========================================

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'word-search',
  name: '单词搜索 (LeetCode 79)',
  category: 'dynamic-programming',
  badge: {
    mode: '回溯反例辨析 · 启发式剪枝',
    complexity: 'O(M×N×3^L) · O(L) 栈深',
  },
  card1Title: '🔤 字符网格地图与实时足迹',
  card2Title: '🔬 无后效性反例与剪枝监视器',
  card2Desc: '阐释动态规划的前提假设，辨析为什么本题无法转为记忆化/DP',
  legend: [
    { label: '匹配成功', color: '#10b981' },
    { label: '当前访问', color: '#38bdf8' },
    { label: '回溯现场恢复', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-board',
      label: '网格',
      type: 'text',
      defaultValue: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]',
      width: '240px',
    },
    {
      id: 'input-word',
      label: '目标单词',
      type: 'text',
      defaultValue: 'ABCCED',
      width: '90px',
    },
  ],
  presets: [
    {
      label: '经典案例 1 (ABCCED, 返回 true)',
      values: {
        'input-board': '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]',
        'input-word': 'ABCCED',
      },
    },
    {
      label: '经典案例 2 (SEE, 返回 true)',
      values: {
        'input-board': '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]',
        'input-word': 'SEE',
      },
    },
  ],
  metrics: [
    { id: 'metric-matched', label: '匹配进度', color: '#10b981' },
    { id: 'metric-status', label: '搜索状态', color: '#38bdf8' },
  ],
  codeLanguages: DP_067_PROBLEMS['word-search'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['word-search'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['word-search'].analysisHtml,
  defaultStage: 'stage-1',
  buildSteps: buildWordSearchStage1Steps,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力回溯',
      shortName: '回溯',
      num: 1,
      timeBadge: 'O(M×N×4^L)',
      theme: 'bg-blue',
      badge: {
        mode: '回溯搜索 · 深度优先',
        complexity: 'O(M×N×4^L) · O(L)',
      },
      card1Title: '🔤 字符网格与搜索路径地图',
      card2Title: '📚 DFS 递归调用栈与状态',
      card2Desc: '基于 DFS 回溯搜索，按上下左右探查匹配单词字符',
      legend: [
        { label: '当前探查', color: '#3b82f6' },
        { label: '已匹配路径', color: '#10b981' },
        { label: '待探查字符', color: '#94a3b8' },
      ],
      codeLanguages: WORD_SEARCH_STAGE1_CODE_LANGUAGES,
      buildSteps: buildWordSearchStage1Steps,
      renderCanvas: (container, step) => {
        renderBoardGrid(container, step.board, step.i, step.j, step.path);
      },
      renderCustomMetrics: (container, step) => {
        renderRecursionCard1(
          container,
          `dfs(${step.i}, ${step.j}, k=${step.k})`,
          step.callStack || [],
          `<div style="font-size:12px; font-weight:700; color:#0f172a;">${step.decision}</div>
           <div style="font-size:11px; color:#64748b; margin-top:3px;">${step.message}</div>`
        );
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化反例剖析',
      shortName: '无后效性反例',
      num: 2,
      timeBadge: '破坏无后效性',
      theme: 'bg-red',
      badge: {
        mode: 'DP 反例教学 · 无后效性',
        complexity: '无法转 DP',
      },
      legend: [
        { label: '状态冲突', color: '#ef4444' },
        { label: '当前探查', color: '#3b82f6' },
        { label: '未走字符', color: '#94a3b8' },
      ],
      card1Title: '🔤 字符网格与状态冲突点',
      card2Title: '⚠️ 无后效性破坏反例剖析',
      card2Desc: '阐释动态规划的前提假设，辨析为什么本题无法转为记忆化/DP',
      codeLanguages: WORD_SEARCH_STAGE3_CODE_LANGUAGES,
      buildSteps: buildWordSearchStage2Steps,
      renderCanvas: (container, step) => {
        renderBoardGrid(container, step.board, step.i, step.j, step.path);
      },
      renderCustomMetrics: (container, step) => {
        container.innerHTML = `
          <div style="padding:4px; display:flex; flex-direction:column; gap:8px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; height:100%; box-sizing:border-box; overflow-y:auto;">
            <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 14px;">
              <div style="font-size:12.5px; font-weight:800; color:#b91c1c;">${step.decision}</div>
              <div style="font-size:11px; color:#991b1b; margin-top:4px; line-height:1.5;">${step.message}</div>
            </div>
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px 14px; font-size:11px; color:#1e3a8a; line-height:1.6; flex:1;">
              <b style="color:#1d4ed8; font-size:11.5px;">💡 左程云核心语录：</b><br/>
              “动态规划能成立的前提是【无后效性】。如果以后的过程还要受到【之前具体怎么走过来的】影响，这就叫有后效性。单词搜索中哪些格子被用过了，就是最典型的后效性！”
            </div>
          </div>
        `;
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 原地现场恢复',
      shortName: '现场恢复',
      num: 3,
      timeBadge: 'O(M×N×3^L)',
      theme: 'bg-emerald',
      badge: {
        mode: '原地回溯 · 0 额外空间标记',
        complexity: 'O(M×N×3^L) · O(L) 栈深',
      },
      legend: [
        { label: '当前探查', color: '#3b82f6' },
        { label: '标记走过', color: '#f59e0b' },
        { label: '现场恢复', color: '#10b981' },
      ],
      card1Title: '🔤 字符网格与回溯状态',
      card2Title: '🔄 原地标记与回溯现场还原',
      card2Desc: '将访问过的格子临时改为 # 占位，递归退出时恢复原字符',
      codeLanguages: WORD_SEARCH_STAGE2_CODE_LANGUAGES,
      buildSteps: buildWordSearchStage3Steps,
      renderCanvas: (container, step) => {
        renderBoardGrid(container, step.board, step.i, step.j, step.path);
      },
      renderCustomMetrics: (container, step) => {
        renderRecursionCard1(
          container,
          `dfs(${step.i}, ${step.j}, k=${step.k})`,
          step.callStack || [],
          `<div style="font-size:12px; font-weight:700; color:#0f172a;">${step.decision}</div>
           <div style="font-size:11px; color:#64748b; margin-top:3px;">${step.message}</div>`
        );
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 首尾词频剪枝优化',
      shortName: '词频优化',
      num: 4,
      timeBadge: '最优剪枝',
      theme: 'bg-amber',
      badge: {
        mode: '启发式频次统计 · 首尾翻转',
        complexity: '大幅剪除无效搜索分支',
      },
      legend: [
        { label: '当前探查', color: '#3b82f6' },
        { label: '已匹配路径', color: '#10b981' },
        { label: '首尾剪枝', color: '#f59e0b' },
      ],
      card1Title: '🔤 字符网格与路径跟踪',
      card2Title: '📈 首尾词频启发式剪枝监控',
      card2Desc: '统计目标单词首尾字符在网格中的出现频次，反转搜索起点降低分支数',
      codeLanguages: WORD_SEARCH_STAGE4_CODE_LANGUAGES,
      buildSteps: buildWordSearchStage4Steps,
      renderCanvas: (container, step) => {
        renderBoardGrid(container, step.board, step.i, step.j, step.path);
      },
      renderCustomMetrics: (container, step) => {
        renderPruneDashboard(container, step);
      },
    },
  ],
  renderCanvas: (container, step) => {
    renderBoardGrid(container, step.board, step.i, step.j, step.path);
  },
  renderCustomMetrics: (container, step) => {
    renderPruneDashboard(container, step);
  },
});

function renderBoardGrid(
  container: HTMLElement,
  board: string[][],
  activeI: number,
  activeJ: number,
  path: Array<[number, number]>
): void {
  if (!container) return;
  const rows = board.length;
  const cols = board[0]?.length || 0;

  const cellsHtml = board.map((row, r) => {
    const tds = row.map((char, c) => {
      const isCur = r === activeI && c === activeJ;
      const pathIdx = path.findIndex(([pr, pc]) => pr === r && pc === c);
      const inPath = pathIdx >= 0;

      let bg = '#ffffff';
      let textCol = '#1e293b';
      let border = '1.5px solid #cbd5e1';
      let shadow = '0 1px 2px rgba(0,0,0,0.04)';
      let extra = '';

      if (isCur) {
        bg = '#dbeafe';
        textCol = '#1d4ed8';
        border = '2px solid #3b82f6';
        shadow = '0 4px 10px rgba(59, 130, 246, 0.25)';
        extra = 'transform: scale(1.08); z-index: 10;';
      } else if (inPath) {
        bg = '#ecfdf5';
        textCol = '#047857';
        border = '1.5px solid #10b981';
        shadow = '0 1px 3px rgba(16, 185, 129, 0.15)';
      } else if (char === '#') {
        bg = '#f1f5f9';
        textCol = '#94a3b8';
        border = '1.5px dashed #cbd5e1';
      }

      return `
        <td style="
          padding: 8px 14px;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: 800;
          background: ${bg};
          color: ${textCol};
          border: ${border};
          border-radius: 8px;
          min-width: 44px;
          min-height: 44px;
          box-shadow: ${shadow};
          transition: all 0.15s ease;
          position: relative;
          ${extra}
        ">
          <div>${char === '#' ? '🚫' : char}</div>
          ${inPath ? `<div style="font-size:9px; font-weight:700; color:#065f46; background:#d1fae5; border-radius:4px; padding:0 3px; margin-top:2px;">#${pathIdx + 1}</div>` : ''}
        </td>
      `;
    }).join('');

    return `<tr>${tds}</tr>`;
  }).join('');

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      box-sizing: border-box;
      overflow: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">网格规模: <strong style="color: #0f172a;">${rows} × ${cols}</strong></span>
        <span style="font-size: 11px; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 8px; border-radius: 10px; font-family: 'JetBrains Mono', monospace;">已锁定路径: ${path.length} 步</span>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 8px 0;">
        <table style="border-spacing: 8px; border-collapse: separate;">
          <tbody>
            ${cellsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderPruneDashboard(container: HTMLElement, step: WordSearchStep): void {
  if (!container) return;
  const origWord = step.originalWord || step.word;
  const isReversed = Boolean(step.wordReversed || (step.originalWord && step.originalWord !== step.word));

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 6px;
      box-sizing: border-box;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 600; color: #64748b;">用户输入原目标:</span>
          <span style="font-size: 12px; font-weight: 700; color: #1e293b; font-family: 'JetBrains Mono', monospace;">"${origWord}"</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 5px; border-top: 1px dashed #e2e8f0;">
          <span style="font-size: 11px; font-weight: 600; color: ${isReversed ? '#d97706' : '#059669'};">
            ${isReversed ? '⚡ 启发式倒序优化 (尾频更少 ➔ 倒序搜索):' : '✨ 实际搜索匹配序列 (保持正序):'}
          </span>
          <span style="font-size: 13px; font-weight: 800; color: ${isReversed ? '#d97706' : '#059669'}; font-family: 'JetBrains Mono', monospace;">"${step.word}"</span>
        </div>
      </div>

      <div style="
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      ">
        <div style="font-size: 11px; font-weight: 700; color: #2563eb;">🎯 搜索动态决策与启发式分析</div>
        <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.4;">${step.decision}</div>
        <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-top: 2px;">${step.message}</div>
      </div>
    </div>
  `;
}

export const WordSearchVisualizer = Visualizer;

registerAlgorithm({
  id: 'word-search',
  name: '单词搜索 (LeetCode 79)',
  viewId: 'algo-word-search-view',
  category: 'dynamic-programming',
  description: '左程云算法讲解067 Code02：LeetCode 79 单词搜索，无后效性反例深度辨析与启发式剪枝',
  icon: '🔍',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 102,
  learningGoal: '理解无后效性是动态规划的核心前提，掌握带回溯的现场恢复与首尾字符频次剪枝优化',
});
