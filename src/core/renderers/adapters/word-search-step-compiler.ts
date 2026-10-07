/**
 * 单词搜索 (LeetCode 79) - 状态推演与步进编译器
 * Step Compiler: 纯计算与无后效性反例推演、原地回溯及首尾词频剪枝优化
 */

import { captureScope } from '../../strategies/scope-capture';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';
import type { HighlightTarget } from '../../code-panel';
import { getDp067Anchor } from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-stage-codes';

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
  codeLine: HighlightTarget;
  callStack?: Array<{ label: string }>;
  metrics?: Record<string, any>;
  wordReversed?: boolean;
  scope?: Record<string, any>;
}

export function createWordSearchStepsArray(): [WordSearchStep[], WordSearchStep[]] {
  const rawSteps: WordSearchStep[] = [];
  const steps: WordSearchStep[] = new Proxy(rawSteps, {
    get(target, prop, receiver) {
      if (prop === 'push') {
        return (...items: WordSearchStep[]) => {
          for (const item of items) {
            if (!item.scope) {
              item.scope = captureScope({
                i: item.i,
                j: item.j,
                k: item.k,
                matchedLen: item.matchedLen,
                status: item.status,
                word: item.word,
                pathLen: item.path?.length,
                char: item.board?.[item.i]?.[item.j],
              });
            }
          }
          return target.push(...items);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
  return [steps, rawSteps];
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
// 1. Stage 1: 暴力回溯搜索 (带 visited 标记)
// ==========================================

export function buildWordSearchStage1Steps(inputs: Record<string, any>): WordSearchStep[] {
  const { board: origBoard, word } = parseWordSearchInputs(inputs);
  const m = origBoard.length;
  const n = origBoard[0].length;
  const [steps, rawSteps] = createWordSearchStepsArray();
  const curBoard = snapshotGrid2D(origBoard);
  const visited: boolean[][] = Array.from({ length: m }, () => new Array(n).fill(false));
  const path: Array<[number, number]> = [];
  const stack: Array<{ label: string }> = [];

  const lines = {
    entry: getDp067Anchor(1, 'word-search', 'entry'),
    dimensions: getDp067Anchor(1, 'word-search', 'dimensions'),
    allocVisited: getDp067Anchor(1, 'word-search', 'allocVisited'),
    outerI: getDp067Anchor(1, 'word-search', 'outerI'),
    outerJ: getDp067Anchor(1, 'word-search', 'outerJ'),
    callDfs: getDp067Anchor(1, 'word-search', 'callDfs'),
    returnFalse: getDp067Anchor(1, 'word-search', 'returnFalse'),
    dfsEntry: getDp067Anchor(1, 'word-search', 'dfsEntry'),
    checkTargetFound: getDp067Anchor(1, 'word-search', 'checkTargetFound'),
    checkBounds: getDp067Anchor(1, 'word-search', 'checkBounds'),
    checkVisitedOrMismatch: getDp067Anchor(1, 'word-search', 'checkVisitedOrMismatch'),
    markVisited: getDp067Anchor(1, 'word-search', 'markVisited'),
    branchDown: getDp067Anchor(1, 'word-search', 'branchDown'),
    branchUp: getDp067Anchor(1, 'word-search', 'branchUp'),
    branchRight: getDp067Anchor(1, 'word-search', 'branchRight'),
    branchLeft: getDp067Anchor(1, 'word-search', 'branchLeft'),
    backtrackRestore: getDp067Anchor(1, 'word-search', 'backtrackRestore'),
    returnResult: getDp067Anchor(1, 'word-search', 'returnResult'),
  };

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: snapshotGrid2D(curBoard),
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

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: snapshotGrid2D(curBoard),
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

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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

    if (k === word.length) {
      found = true;
      steps.push({
        i,
        j,
        k,
        board: snapshotGrid2D(curBoard),
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

    if (i < 0 || i >= m || j < 0 || j >= n) {
      steps.push({
        i,
        j,
        k,
        board: snapshotGrid2D(curBoard),
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

    if (visited[i][j] || curBoard[i][j] !== word[k]) {
      const isVis = visited[i][j];
      const reason = isVis ? '已被当前路径访问过' : `'${curBoard[i][j]}' != '${word[k]}'`;
      steps.push({
        i,
        j,
        k,
        board: snapshotGrid2D(curBoard),
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

    stack.push({ label: `dfs(${i}, ${j}, k=${k}['${word[k]}'])` });
    path.push([i, j]);
    visited[i][j] = true;
    const originChar = curBoard[i][j];
    curBoard[i][j] = '#';

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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
        board: snapshotGrid2D(curBoard),
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

    visited[i][j] = false;
    curBoard[i][j] = originChar;
    path.pop();
    stack.pop();

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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

  for (let i = 0; i < m && !found; i++) {
    steps.push({
      i,
      j: -1,
      k: 0,
      board: snapshotGrid2D(curBoard),
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
        board: snapshotGrid2D(curBoard),
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
        board: snapshotGrid2D(curBoard),
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
          board: snapshotGrid2D(curBoard),
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
      board: snapshotGrid2D(curBoard),
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

  return rawSteps;
}

// ==========================================
// 2. Stage 2: 错误记忆化尝试（反例剖析）
// ==========================================

export function buildWordSearchStage2Steps(inputs: Record<string, any>): WordSearchStep[] {
  const { board: origBoard, word } = parseWordSearchInputs(inputs);
  const [steps, rawSteps] = createWordSearchStepsArray();
  const curBoard = snapshotGrid2D(origBoard);

  const lines2 = {
    entry: getDp067Anchor(2, 'word-search', 'entry'),
    allocMemo: getDp067Anchor(2, 'word-search', 'allocMemo'),
    outerI: getDp067Anchor(2, 'word-search', 'outerI'),
    outerJ: getDp067Anchor(2, 'word-search', 'outerJ'),
    callDfs: getDp067Anchor(2, 'word-search', 'callDfs'),
    returnFalse: getDp067Anchor(2, 'word-search', 'returnFalse'),
    dfsEntry: getDp067Anchor(2, 'word-search', 'dfsEntry'),
    checkTarget: getDp067Anchor(2, 'word-search', 'checkTarget'),
    checkBounds: getDp067Anchor(2, 'word-search', 'checkBounds'),
    checkMemo: getDp067Anchor(2, 'word-search', 'checkMemo'),
    markZero: getDp067Anchor(2, 'word-search', 'markZero'),
    branchDown: getDp067Anchor(2, 'word-search', 'branchDown'),
    branchRight: getDp067Anchor(2, 'word-search', 'branchRight'),
    restore: getDp067Anchor(2, 'word-search', 'restore'),
    writeMemo: getDp067Anchor(2, 'word-search', 'writeMemo'),
  };

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
    word,
    matchedLen: 1,
    path: [[0, 0], [1, 1]],
    status: 'match',
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
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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

  return rawSteps;
}

// ==========================================
// 3. Stage 3: 标准原地修改现场恢复 (DFS + Backtracking)
// ==========================================

export function buildWordSearchStage3Steps(inputs: Record<string, any>): WordSearchStep[] {
  const { board: origBoard, word } = parseWordSearchInputs(inputs);
  const m = origBoard.length;
  const n = origBoard[0].length;
  const [steps, rawSteps] = createWordSearchStepsArray();
  const curBoard = snapshotGrid2D(origBoard);
  const path: Array<[number, number]> = [];
  const stack: Array<{ label: string }> = [];

  const lines3 = {
    entry: getDp067Anchor(3, 'word-search', 'entry'),
    toCharArray: getDp067Anchor(3, 'word-search', 'toCharArray'),
    outerI: getDp067Anchor(3, 'word-search', 'outerI'),
    outerJ: getDp067Anchor(3, 'word-search', 'outerJ'),
    callDfs: getDp067Anchor(3, 'word-search', 'callDfs'),
    returnFalse: getDp067Anchor(3, 'word-search', 'returnFalse'),
    dfsEntry: getDp067Anchor(3, 'word-search', 'dfsEntry'),
    checkTargetFound: getDp067Anchor(3, 'word-search', 'checkTargetFound'),
    checkBoundsAndMismatch: getDp067Anchor(3, 'word-search', 'checkBoundsAndMismatch'),
    saveTmpChar: getDp067Anchor(3, 'word-search', 'saveTmpChar'),
    markZero: getDp067Anchor(3, 'word-search', 'markZero'),
    branchDown: getDp067Anchor(3, 'word-search', 'branchDown'),
    branchUp: getDp067Anchor(3, 'word-search', 'branchUp'),
    branchRight: getDp067Anchor(3, 'word-search', 'branchRight'),
    branchLeft: getDp067Anchor(3, 'word-search', 'branchLeft'),
    restoreTmpChar: getDp067Anchor(3, 'word-search', 'restoreTmpChar'),
    returnResult: getDp067Anchor(3, 'word-search', 'returnResult'),
  };

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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

    if (k === word.length) {
      found = true;
      steps.push({
        i,
        j,
        k,
        board: snapshotGrid2D(curBoard),
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

    if (i < 0 || i >= m || j < 0 || j >= n || curBoard[i][j] !== word[k]) {
      const isOob = i < 0 || i >= m || j < 0 || j >= n;
      const reason = isOob ? '越界' : (curBoard[i][j] === '#' ? '已占位访问' : `'${curBoard[i][j]}' != '${word[k]}'`);
      steps.push({
        i,
        j,
        k,
        board: snapshotGrid2D(curBoard),
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

    const originChar = curBoard[i][j];
    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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

    curBoard[i][j] = '#';
    path.push([i, j]);
    stack.push({ label: `dfs3(${i}, ${j}, k=${k}['${word[k]}'])` });

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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
        board: snapshotGrid2D(curBoard),
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

    curBoard[i][j] = originChar;
    path.pop();
    stack.pop();

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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
      board: snapshotGrid2D(curBoard),
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
        board: snapshotGrid2D(curBoard),
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
        board: snapshotGrid2D(curBoard),
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
          board: snapshotGrid2D(curBoard),
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
      board: snapshotGrid2D(curBoard),
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

  return rawSteps;
}

// ==========================================
// 4. Stage 4: 首尾词频反转剪枝优化 (Heuristic Direction Pruning)
// ==========================================

export function buildWordSearchStage4Steps(inputs: Record<string, any>): WordSearchStep[] {
  const { board: origBoard, word } = parseWordSearchInputs(inputs);
  const m = origBoard.length;
  const n = origBoard[0].length;
  const [steps, rawSteps] = createWordSearchStepsArray();
  const curBoard = snapshotGrid2D(origBoard);
  const path: Array<[number, number]> = [];
  const stack: Array<{ label: string }> = [];

  const lines4 = {
    entry: getDp067Anchor(4, 'word-search', 'entry'),
    allocCount: getDp067Anchor(4, 'word-search', 'allocCount'),
    countBoard: getDp067Anchor(4, 'word-search', 'countBoard'),
    toChars: getDp067Anchor(4, 'word-search', 'toChars'),
    checkFreq: getDp067Anchor(4, 'word-search', 'checkFreq'),
    compareEnds: getDp067Anchor(4, 'word-search', 'compareEnds'),
    reverseWord: getDp067Anchor(4, 'word-search', 'reverseWord'),
    outerI: getDp067Anchor(4, 'word-search', 'outerI'),
    outerJ: getDp067Anchor(4, 'word-search', 'outerJ'),
    callDfs: getDp067Anchor(4, 'word-search', 'callDfs'),
    returnFalse: getDp067Anchor(4, 'word-search', 'returnFalse'),
    dfsEntry: getDp067Anchor(4, 'word-search', 'dfsEntry'),
    baseSuccess: getDp067Anchor(4, 'word-search', 'baseSuccess'),
    boundsCheck: getDp067Anchor(4, 'word-search', 'boundsCheck'),
    saveChar: getDp067Anchor(4, 'word-search', 'saveChar'),
    markZero: getDp067Anchor(4, 'word-search', 'markZero'),
    branchDown: getDp067Anchor(4, 'word-search', 'branchDown'),
    branchUp: getDp067Anchor(4, 'word-search', 'branchUp'),
    branchRight: getDp067Anchor(4, 'word-search', 'branchRight'),
    branchLeft: getDp067Anchor(4, 'word-search', 'branchLeft'),
    restore: getDp067Anchor(4, 'word-search', 'restore'),
    returnFound: getDp067Anchor(4, 'word-search', 'returnFound'),
  };

  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: snapshotGrid2D(curBoard),
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

  const count = new Array(128).fill(0);
  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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

  let effectiveWord = word;
  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: snapshotGrid2D(curBoard),
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
    board: snapshotGrid2D(curBoard),
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

  const shouldReverse = tailFreq < headFreq;
  steps.push({
    i: -1,
    j: -1,
    k: 0,
    board: snapshotGrid2D(curBoard),
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

  if (shouldReverse) {
    effectiveWord = word.split('').reverse().join('');
    steps.push({
      i: -1,
      j: -1,
      k: 0,
      board: snapshotGrid2D(curBoard),
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

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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

    if (k === effectiveWord.length) {
      found = true;
      steps.push({
        i,
        j,
        k,
        board: snapshotGrid2D(curBoard),
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

    if (i < 0 || i >= m || j < 0 || j >= n || curBoard[i][j] !== effectiveWord[k]) {
      const isOob = i < 0 || i >= m || j < 0 || j >= n;
      const reason = isOob ? '越界' : (curBoard[i][j] === '#' ? '已占位访问' : `'${curBoard[i][j]}' != '${effectiveWord[k]}'`);
      steps.push({
        i,
        j,
        k,
        board: snapshotGrid2D(curBoard),
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

    const originChar = curBoard[i][j];
    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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

    curBoard[i][j] = '#';
    path.push([i, j]);
    stack.push({ label: `dfs4(${i}, ${j}, k=${k}['${effectiveWord[k]}'])` });

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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
        board: snapshotGrid2D(curBoard),
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

    curBoard[i][j] = originChar;
    path.pop();
    stack.pop();

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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

    steps.push({
      i,
      j,
      k,
      board: snapshotGrid2D(curBoard),
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
      board: snapshotGrid2D(curBoard),
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
        board: snapshotGrid2D(curBoard),
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
        board: snapshotGrid2D(curBoard),
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
          board: snapshotGrid2D(curBoard),
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
      board: snapshotGrid2D(curBoard),
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

  return rawSteps.map((s) => ({
    ...s,
    originalWord: s.originalWord ?? word,
    wordReversed: s.wordReversed ?? shouldReverse,
  }));
}
