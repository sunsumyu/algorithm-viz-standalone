/**
 * 左程云算法通关课 Class 062: 单词接龙 II (Word Ladder II · LeetCode 126)
 * BFS 层次最短路建图 + DFS 回溯输出全部最短路径
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import {
  WORD_LADDER_II_062_CODES,
  WORD_LADDER_II_062_LINES,
} from './graph-062-stage-codes';
import { Graph062StepBase } from './graph-062-shared';

export interface WordLadderIIStep extends Graph062StepBase {
  beginWord: string;
  endWord: string;
  curWord: string;
  activePath?: string[];
  distMap: Record<string, number>;
  dagEdges: Array<{ from: string; to: string }>;
  foundPaths: string[][];
  stage: 'bfs_dag' | 'dfs_backtrack' | 'done';
}

function getWordNeighbors(word: string, dict: Set<string>): string[] {
  const neighbors: string[] = [];
  const chars = word.split('');
  for (let i = 0; i < chars.length; i++) {
    const old = chars[i];
    for (let c = 97; c <= 122; c++) {
      const ch = String.fromCharCode(c);
      if (ch === old) continue;
      chars[i] = ch;
      const cand = chars.join('');
      if (dict.has(cand)) neighbors.push(cand);
    }
    chars[i] = old;
  }
  return neighbors;
}

export function buildWordLadderII062Steps(preset: string = 'classic_hit_cog'): WordLadderIIStep[] {
  const steps: WordLadderIIStep[] = [];
  const lines = WORD_LADDER_II_062_LINES;

  let beginWord: string;
  let endWord: string;
  let wordList: string[];

  if (preset === 'impossible') {
    beginWord = 'hit';
    endWord = 'cog';
    wordList = ['hot', 'dot', 'dog', 'lot', 'log'];
  } else {
    // classic
    beginWord = 'hit';
    endWord = 'cog';
    wordList = ['hot', 'dot', 'dog', 'lot', 'log', 'cog'];
  }

  const dict = new Set<string>(wordList);
  const dist: Record<string, number> = { [beginWord]: 0 };
  const nexts: Record<string, string[]> = {};
  for (const w of wordList) nexts[w] = [];
  nexts[beginWord] = [];

  const dagEdges: Array<{ from: string; to: string }> = [];
  const foundPaths: string[][] = [];

  // Step 0: 入口
  steps.push({
    beginWord,
    endWord,
    curWord: beginWord,
    distMap: { ...dist },
    dagEdges: [],
    foundPaths: [],
    stage: 'bfs_dag',
    decision: '算法启动：两阶段经典框架 (BFS 分层建图 + DFS 回溯全解)',
    message: `起点词 "${beginWord}"，终点词 "${endWord}"，字典规模 ${wordList.length}。严禁盲目复制路径，采用层次距离 DAG 建图。`,
    log: `enter findLadders: begin="${beginWord}", end="${endWord}"`,
    codeLine: lines.entry,
    metrics: { '起点': beginWord, '终点': endWord, '阶段': '阶段 1 (BFS 建图)', '当前最短路径数': 0 },
    statusBadge: { text: '两阶段启动', type: 'info' },
  });

  if (!dict.has(endWord)) {
    steps.push({
      beginWord,
      endWord,
      curWord: beginWord,
      distMap: { ...dist },
      dagEdges: [],
      foundPaths: [],
      stage: 'done',
      decision: '字典不包含终点单词：直接返回空列表',
      message: `终点单词 "${endWord}" 不在字典中，无法转换，返回空集合。`,
      log: 'endWord not in dictionary -> return []',
      codeLine: lines.entry,
      metrics: { '合法性检测': '失败', '终点状态': '不在字典', '返回路径数': 0 },
      statusBadge: { text: '无解空集', type: 'warning' },
    });
    return steps;
  }

  // 阶段 1: BFS 建图
  const queue: string[] = [beginWord];
  steps.push({
    beginWord,
    endWord,
    curWord: beginWord,
    distMap: { ...dist },
    dagEdges: [],
    foundPaths: [],
    stage: 'bfs_dag',
    decision: '初始化 BFS 层次队列：起点 "hit" 入队，dist["hit"] = 0',
    message: '将起点词放入队列，准备逐层向外计算每个词的最短层数。',
    log: `enqueue beginWord "${beginWord}" with dist=0`,
    codeLine: lines.initBfsQueue,
    metrics: { '当前波前词': beginWord, '层数距离': 0, '搜索队列规模': 1 },
    statusBadge: { text: '起点就绪', type: 'info' },
  });

  let found = false;

  while (queue.length > 0 && !found) {
    const size = queue.length;

    for (let i = 0; i < size; i++) {
      const cur = queue.shift()!;
      const curD = dist[cur];

      steps.push({
        beginWord,
        endWord,
        curWord: cur,
        distMap: { ...dist },
        dagEdges: [...dagEdges],
        foundPaths: [],
        stage: 'bfs_dag',
        decision: `探查词 "${cur}" (层次 ${curD})，枚举单个字符变换的所有字典邻居`,
        message: `从 "${cur}" 出发，尝试 26 个字母替换，匹配字典中的合法后续词。`,
        log: `pop word "${cur}", dist=${curD}`,
        codeLine: lines.bfsLevelLoop,
        metrics: { '当前展开词': cur, '当前层数': curD, '已构建 DAG 边数': dagEdges.length },
        statusBadge: { text: `展开 "${cur}"`, type: 'info' },
      });

      const nxtWords = getWordNeighbors(cur, dict);
      for (const nxt of nxtWords) {
        if (dist[nxt] === undefined) {
          dist[nxt] = curD + 1;
          queue.push(nxt);

          steps.push({
            beginWord,
            endWord,
            curWord: nxt,
            distMap: { ...dist },
            dagEdges: [...dagEdges],
            foundPaths: [],
            stage: 'bfs_dag',
            decision: `首次访问词 "${nxt}"，确定最短层数距离为 ${curD + 1} 并入队`,
            message: `发现单词 "${nxt}"，记录 dist["${nxt}"] = ${curD + 1}。`,
            log: `discover word "${nxt}", dist=${curD + 1}`,
            codeLine: lines.expandWordTransitions,
            metrics: { '新词': nxt, '最短距离': curD + 1, '入队待处理': queue.length },
            statusBadge: { text: `发现 "${nxt}" (深 ${curD + 1})`, type: 'info' },
          });
        }

        if (dist[nxt] === curD + 1) {
          nexts[cur].push(nxt);
          dagEdges.push({ from: cur, to: nxt });

          steps.push({
            beginWord,
            endWord,
            curWord: nxt,
            distMap: { ...dist },
            dagEdges: [...dagEdges],
            foundPaths: [],
            stage: 'bfs_dag',
            decision: `构建 DAG 最短路有向边：${cur} -> ${nxt}`,
            message: `满足严格最短路条件 (dist[${nxt}] == dist[${cur}] + 1)，在 DAG 中连边。`,
            log: `build DAG edge: ${cur} -> ${nxt}`,
            codeLine: lines.buildDAGGEdge,
            metrics: { '有向边': `${cur} -> ${nxt}`, '有效层级跨度': '恰好 +1' },
            statusBadge: { text: `建边 ${cur}→${nxt}`, type: 'info' },
          });
        }

        if (nxt === endWord) {
          found = true;
        }
      }
    }
  }

  // 阶段 2: DFS 回溯
  steps.push({
    beginWord,
    endWord,
    curWord: beginWord,
    distMap: { ...dist },
    dagEdges: [...dagEdges],
    foundPaths: [],
    stage: 'dfs_backtrack',
    decision: '阶段 2 启动：沿着构建好的无环有向图 (DAG) 启动 DFS 回溯',
    message: '从起点 "hit" 出发，沿最短路径有向边深度优先搜集所有到达 "cog" 的完整转换序列。',
    log: 'start DFS backtrack along DAG',
    codeLine: lines.startDfsBacktrack,
    metrics: { '当前阶段': '阶段 2 (DFS 回溯)', '目标深度': dist[endWord] ?? '无', 'DAG 总边数': dagEdges.length },
    statusBadge: { text: 'DFS 回溯启动', type: 'info' },
  });

  function dfs(curr: string, currentPath: string[]) {
    if (curr === endWord) {
      foundPaths.push([...currentPath]);
      steps.push({
        beginWord,
        endWord,
        curWord: curr,
        activePath: [...currentPath],
        distMap: { ...dist },
        dagEdges: [...dagEdges],
        foundPaths: foundPaths.map((p) => [...p]),
        stage: 'dfs_backtrack',
        decision: `收集到完整最短转换路径 #${foundPaths.length}：[ ${currentPath.join(' -> ')} ]`,
        message: `成功到达终点 "${endWord}"！该路径长度为 ${currentPath.length}，已记入全局答案。`,
        log: `path found: ${currentPath.join(' -> ')}`,
        codeLine: lines.startDfsBacktrack,
        metrics: { '新捕获路径': currentPath.join('→'), '累计收集路径数': foundPaths.length },
        statusBadge: { text: `路径 #${foundPaths.length} 达成`, type: 'success' },
      });
      return;
    }

    const nxtList = nexts[curr] || [];
    for (const nxt of nxtList) {
      if (dist[nxt] === dist[curr] + 1) {
        currentPath.push(nxt);
        dfs(nxt, currentPath);
        currentPath.pop();
      }
    }
  }

  if (found) {
    dfs(beginWord, [beginWord]);
  }

  // 终态步骤
  steps.push({
    beginWord,
    endWord,
    curWord: endWord,
    distMap: { ...dist },
    dagEdges: [...dagEdges],
    foundPaths: foundPaths.map((p) => [...p]),
    stage: 'done',
    decision: `算法执行完毕：共发现 ${foundPaths.length} 条全局最短转换序列`,
    message: `利用 BFS 建图 + DFS 回溯的经典双阶段架构，既保证了路径绝对最短，又彻底消除了无谓的冗余拷贝。`,
    log: `findLadders complete -> total ${foundPaths.length} shortest paths`,
    codeLine: lines.returnAllShortestPaths,
    metrics: { '最短序列长度': (dist[endWord] ?? -1) + 1, '最短路径条数': foundPaths.length, '两阶段架构': 'BFS+DFS' },
    statusBadge: { text: `共 ${foundPaths.length} 条最短路径`, type: 'success' },
  });

  return steps;
}

export const wordLadderII062Visualizer = registerDeclarativeAlgorithm<WordLadderIIStep>({
  id: 'word-ladder-ii-062',
  aliases: ['word-ladder-ii', 'word-ladder-126'],
  name: '单词接龙 II (Word Ladder II · Class 062)',
  category: 'graph',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 6206,
  learningGoal: '掌握经典大厂压轴两阶段解法：BFS分层最短路构建前驱DAG图 + DFS无损回溯输出所有最短全路径',
  problemHtml: GRAPH_062_PROBLEMS.wordLadderII062.html,
  codeLanguages: WORD_LADDER_II_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '词表预设用例',
      type: 'select',
      defaultValue: 'classic_hit_cog',
      options: [
        { label: '经典用例：hit -> cog (存在 2 条最短路)', value: 'classic_hit_cog' },
        { label: '缺少终点词：hit -> cog (0 条路径)', value: 'impossible' },
      ],
    },
  ],
  presets: [
    { label: 'hit -> cog 经典双最短路', values: { preset: 'classic_hit_cog' } },
    { label: '缺少终点词不可达用例', values: { preset: 'impossible' } },
  ],
  generateSteps: (inputs) => buildWordLadderII062Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    // 渲染分层 DAG 节点与捕获的路径列表
    const pathsHtml = step.foundPaths.length > 0
      ? step.foundPaths
          .map(
            (p, idx) => `
              <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                background: #ecfdf5;
                border: 1px solid #10b981;
                border-radius: 6px;
                font-family: monospace;
                font-size: 11.5px;
                font-weight: 700;
                color: #065f46;
              ">
                <span>路径 ${idx + 1}:</span>
                <span>${p.join(' ➔ ')}</span>
              </div>
            `
          )
          .join('')
      : '<span style="color: #94a3b8; font-size: 12px;">(尚未捕获到完整路径)</span>';

    const edgePills = step.dagEdges
      .slice(0, 10)
      .map(
        (e) => `
          <span style="
            padding: 3px 8px;
            background: #eff6ff;
            border: 1px solid #3b82f6;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            font-weight: 700;
            color: #1e40af;
          ">
            ${e.from} ➔ ${e.to}
          </span>
        `
      )
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; min-height: 280px; align-items: center; justify-content: center; padding: 14px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 560px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #475569; font-weight: 700;">最短路有向无环图 (DAG 有向边):</span>
            <span style="font-size: 10.5px; color: #0284c7; font-weight: 700;">累计边数: ${step.dagEdges.length}</span>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${edgePills || '<span style="color: #94a3b8; font-size: 11px;">等待建立最短路有向边...</span>'}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 560px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 16px;">
          <span style="font-size: 11px; color: #15803d; font-weight: 800;">已收集的最短转换序列 (DFS 全解):</span>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${pathsHtml}
          </div>
        </div>
      </div>
    `;
  },
});
