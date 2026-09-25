/**
 * 左程云算法通关课 Class 065: 滑动谜题 (Sliding Puzzle · LeetCode 773)
 * 2x3 网格状态空间与曼哈顿距离启发式 A* 搜索
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_065_PROBLEMS } from './graph-065-problem-content';
import {
  SLIDING_PUZZLE_065_CODES,
  SLIDING_PUZZLE_065_LINES,
} from './graph-065-stage-codes';
import { Graph065StepBase, renderSlidingGrid } from './graph-065-shared';

export interface SlidingPuzzleStep extends Graph065StepBase {
  boardStr: string;
  targetStr: string;
  curG: number;
  curH: number;
  curF: number;
  openSetSize: number;
  swappedIndices?: [number, number];
  ansStep?: number;
}

const PRESETS_DATA: Record<string, string> = {
  one_step: '123405',
  standard_5_steps: '412503',
  three_steps: '123045',
  unsolvable: '123540',
};

const MOVES = [
  [1, 3],
  [0, 2, 4],
  [1, 5],
  [0, 4],
  [1, 3, 5],
  [2, 4],
];

function calcH(s: string): number {
  let res = 0;
  for (let i = 0; i < 6; i++) {
    const v = s.charCodeAt(i) - 48;
    if (v !== 0) {
      const tr = Math.floor((v - 1) / 3);
      const tc = (v - 1) % 3;
      res += Math.abs(Math.floor(i / 3) - tr) + Math.abs((i % 3) - tc);
    }
  }
  return res;
}

export function buildSlidingPuzzle065Steps(presetKey: string = 'standard_5_steps'): SlidingPuzzleStep[] {
  const start = PRESETS_DATA[presetKey] || PRESETS_DATA.standard_5_steps;
  const target = '123450';
  const steps: SlidingPuzzleStep[] = [];
  const lines = SLIDING_PUZZLE_065_LINES;

  const startH = calcH(start);

  // Step 0: 入口纯净帧
  steps.push({
    boardStr: start,
    targetStr: target,
    curG: 0,
    curH: startH,
    curF: startH,
    openSetSize: 1,
    status: 'init',
    line: lines.entry.javascript,
    message: `🚀 初始化滑动谜题：初始布局 "${start}"，目标布局 "${target}"。计算初始曼哈顿估价值 h = ${startH}。`,
    explanation: '左神点拨：将 2x3 棋盘序列化为长度 6 的字符串。A* 估价函数 f = g + h，其中 g 为已走步数，h 为各非零方块到目标槽位的曼哈顿距离之和。',
    metrics: { '当前状态': start, '已移动 g': 0, '估价 h': startH, '综合 f=g+h': startH },
  });

  if (start === target) {
    steps.push({
      boardStr: start,
      targetStr: target,
      curG: 0,
      curH: 0,
      curF: 0,
      openSetSize: 1,
      status: 'reach',
      ansStep: 0,
      line: lines.reachTarget.javascript,
      message: `🎉 初始状态即为目标状态！最少移动步数为 0。`,
      metrics: { '最终步数': 0, '状态': '求解完毕' },
    });
    return steps;
  }

  // A* 优先队列
  interface Node {
    f: number;
    g: number;
    h: number;
    s: string;
    parent?: string;
    swapped?: [number, number];
  }

  const pq: Node[] = [{ f: startH, g: 0, h: startH, s: start }];
  const dist = new Map<string, number>([[start, 0]]);

  // Step 1: 起点入堆
  steps.push({
    boardStr: start,
    targetStr: target,
    curG: 0,
    curH: startH,
    curF: startH,
    openSetSize: pq.length,
    status: 'search',
    line: lines.initHeap.javascript,
    message: `📥 起点进入优先队列小根堆：综合代价 f = ${startH}，波前容量 = 1。`,
    explanation: 'A* 算法始终从小根堆中弹出 f 最小的状态进行扩展。',
    metrics: { '当前队列容量': 1, '当前最优 f': startH },
  });

  let reached = false;
  let finalSteps = -1;
  let maxIters = 120; // 保护上限

  while (pq.length > 0 && maxIters-- > 0) {
    pq.sort((a, b) => a.f - b.f);
    const cur = pq.shift()!;

    // 步骤：弹出当前最优状态
    steps.push({
      boardStr: cur.s,
      targetStr: target,
      curG: cur.g,
      curH: cur.h,
      curF: cur.f,
      openSetSize: pq.length,
      swappedIndices: cur.swapped,
      status: 'expand',
      line: lines.pollMin.javascript,
      message: `🔍 弹出最优状态 "${cur.s}"：已走 g = ${cur.g}，启发距离 h = ${cur.h}，综合 f = ${cur.f}。`,
      explanation: '该状态综合估价最低，最具探索潜力。开始寻找空格 0 的相邻可交换位置。',
      metrics: { '展开状态': cur.s, '累计步数 g': cur.g, '剩余启发 h': cur.h, '波前容量': pq.length },
    });

    if (cur.s === target) {
      reached = true;
      finalSteps = cur.g;
      steps.push({
        boardStr: cur.s,
        targetStr: target,
        curG: cur.g,
        curH: 0,
        curF: cur.g,
        openSetSize: pq.length,
        status: 'reach',
        ansStep: cur.g,
        line: lines.reachTarget.javascript,
        message: `🎉 成功解开滑动谜题！达成目标状态 "${target}"，最少移动步数为 ${cur.g} 步！`,
        explanation: '因曼哈顿距离具备可采纳性 (Admissible)，A* 首次从优先队列弹出目标状态时必为全局最优解！',
        metrics: { '最终步数': cur.g, '目标状态': target, '状态': '求解完毕' },
      });
      break;
    }

    if (cur.g > (dist.get(cur.s) ?? Infinity)) {
      continue;
    }

    const z = cur.s.indexOf('0');
    for (const nxt of MOVES[z]) {
      const arr = cur.s.split('');
      [arr[z], arr[nxt]] = [arr[nxt], arr[z]];
      const nxtStr = arr.join('');
      const nxtG = cur.g + 1;
      const nxtH = calcH(nxtStr);
      const nxtF = nxtG + nxtH;

      if (nxtG < (dist.get(nxtStr) ?? Infinity)) {
        dist.set(nxtStr, nxtG);
        pq.push({ f: nxtF, g: nxtG, h: nxtH, s: nxtStr, swapped: [z, nxt] });

        steps.push({
          boardStr: nxtStr,
          targetStr: target,
          curG: nxtG,
          curH: nxtH,
          curF: nxtF,
          openSetSize: pq.length,
          swappedIndices: [z, nxt],
          status: 'search',
          line: lines.relaxDist.javascript,
          message: `🔄 滑动方块 #${nxt} 至空格 #${z}：产生新状态 "${nxtStr}" (g=${nxtG}, h=${nxtH}, f=${nxtF})，加入优先队列！`,
          explanation: `0 从位置 ${z} 移动到 ${nxt}，启发式距离 h 动态更新为 ${nxtH}。`,
          metrics: { '新状态': nxtStr, '步数 g': nxtG, '曼哈顿 h': nxtH, '综合 f': nxtF },
        });
      }
    }
  }

  if (!reached) {
    steps.push({
      boardStr: start,
      targetStr: target,
      curG: 0,
      curH: startH,
      curF: startH,
      openSetSize: 0,
      status: 'unsolvable',
      ansStep: -1,
      line: lines.noSolution.javascript,
      message: `🚫 搜索空间穷尽：棋盘 "${start}" 无法通过有限滑动达到目标状态 "${target}"，返回 -1。`,
      explanation: '在 2x3 滑动谜题中，若逆序对奇偶性不可达，则不存在任何解法。',
      metrics: { '求解结果': -1, '状态': '无解' },
    });
  }

  return steps;
}

registerDeclarativeAlgorithm({
  id: 'sliding-puzzle-065',
  name: '滑动谜题 (A* 启发式搜索)',
  category: 'graph',
  difficulty: '困难',
  description: '左程云 Class 065 Code02：2x3 网格滑动谜题，曼哈顿距离启发函数 h 与 A* 优先队列定向加速寻路 (LeetCode 773)',
  aliases: ['sliding-puzzle-773', 'leetcode-773', 'sliding-puzzle-class065'],
  problemHtml: GRAPH_065_PROBLEMS['sliding-puzzle-065'].problemHtml,
  analysisHtml: GRAPH_065_PROBLEMS['sliding-puzzle-065'].complexityHtml,
  codeLanguages: SLIDING_PUZZLE_065_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'standard_5_steps',
      options: [
        { label: '标准 5 步用例 "412503"', value: 'standard_5_steps' },
        { label: '单步解开用例 "123405"', value: 'one_step' },
        { label: '三步解开用例 "123045"', value: 'three_steps' },
        { label: '无解反例用例 "123540"', value: 'unsolvable' },
      ],
    },
  ],
  presets: [
    { label: '标准 5 步用例 "412503"', values: { preset: 'standard_5_steps' } },
    { label: '单步解开用例 "123405"', values: { preset: 'one_step' } },
    { label: '三步解开用例 "123045"', values: { preset: 'three_steps' } },
    { label: '无解反例用例 "123540"', values: { preset: 'unsolvable' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildSlidingPuzzle065Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: SlidingPuzzleStep) => {
    container.innerHTML = renderSlidingGrid({
      boardStr: step.boardStr,
      targetStr: step.targetStr,
      curG: step.curG,
      curH: step.curH,
      curF: step.curF,
      swappedIndices: step.swappedIndices,
    });
  },
});
