/**
 * 左程云算法通关课 Class 065: 滑动谜题 Step Compiler
 */

import { SLIDING_PUZZLE_065_LINES } from './graph-065-stage-codes';
import { Graph065StepBase } from './graph-065-shared';

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
  const dist = new Map<string, number>();
  dist.set(start, 0);

  let reached = false;
  let iterCount = 0;
  const MAX_ITERS = 500;

  while (pq.length > 0 && iterCount++ < MAX_ITERS) {
    pq.sort((a, b) => a.f - b.f || a.h - b.h);
    const cur = pq.shift()!;

    if (cur.s === target) {
      reached = true;
      steps.push({
        boardStr: cur.s,
        targetStr: target,
        curG: cur.g,
        curH: 0,
        curF: cur.g,
        openSetSize: pq.length,
        swappedIndices: cur.swapped,
        status: 'reach',
        ansStep: cur.g,
        line: lines.reachTarget.javascript,
        message: `🎯 命中目标状态 "${target}"！耗费最少步数 g = ${cur.g}。`,
        explanation: 'A* 算法首次从优先队列弹出目标状态时，由于启发函数 h 满足可容性 (曼哈顿距离 <= 真实步数)，保证此时 g 值绝对最优！',
        metrics: { '最终步数': cur.g, '搜索轮次': iterCount, '状态': '已达成' },
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
