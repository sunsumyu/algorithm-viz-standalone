/**
 * 左程云算法通关课 Class 065: 八数码难题 (Eight Puzzle · 洛谷 P1379)
 * 3x3 棋盘滑动，逆序对奇偶性剪枝与曼哈顿距离启发式 A* 搜索
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_065_PROBLEMS } from './graph-065-problem-content';
import {
  EIGHT_PUZZLE_065_CODES,
  EIGHT_PUZZLE_065_LINES,
} from './graph-065-stage-codes';
import { Graph065StepBase, renderEightPuzzleGrid } from './graph-065-shared';

export interface EightPuzzleStep extends Graph065StepBase {
  boardStr: string;
  targetStr: string;
  curG: number;
  curH: number;
  curF: number;
  openSetSize: number;
  invCount?: number;
  isSolvable?: boolean;
  ansStep?: number;
}

const PRESETS_DATA: Record<string, string> = {
  one_step: '123084765',
  two_steps: '123840765',
  luogu_sample: '283104765',
  unsolvable_parity: '123804756',
};

const TARGET = '123804765';

// 3x3 中 9 个位置的合法移动邻居
const MOVES: number[][] = [
  [1, 3],
  [0, 2, 4],
  [1, 5],
  [0, 4, 6],
  [1, 3, 5, 7],
  [2, 4, 8],
  [3, 7],
  [4, 6, 8],
  [5, 7],
];

// 数字 0~8 在 target "123804765" 中的行列坐标
const TARGET_R = [1, 0, 0, 0, 1, 2, 2, 2, 1];
const TARGET_C = [1, 0, 1, 2, 2, 2, 1, 0, 0];

function calcEightH(s: string): number {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const v = s.charCodeAt(i) - 48;
    if (v !== 0) {
      sum += Math.abs(Math.floor(i / 3) - TARGET_R[v]) + Math.abs((i % 3) - TARGET_C[v]);
    }
  }
  return sum;
}

function countInversions(s: string): number {
  let inv = 0;
  for (let i = 0; i < 9; i++) {
    if (s[i] === '0') continue;
    for (let j = i + 1; j < 9; j++) {
      if (s[j] !== '0' && s[i] > s[j]) {
        inv++;
      }
    }
  }
  return inv;
}

export function buildEightPuzzle065Steps(presetKey: string = 'two_steps'): EightPuzzleStep[] {
  const start = PRESETS_DATA[presetKey] || PRESETS_DATA.two_steps;
  const target = TARGET;
  const steps: EightPuzzleStep[] = [];
  const lines = EIGHT_PUZZLE_065_LINES;

  const startH = calcEightH(start);
  const startInv = countInversions(start);
  const targetInv = countInversions(target);
  const solvable = (startInv & 1) === (targetInv & 1);

  // Step 0: 入口纯净帧
  steps.push({
    boardStr: start,
    targetStr: target,
    curG: 0,
    curH: startH,
    curF: startH,
    openSetSize: 1,
    invCount: startInv,
    status: 'init',
    line: lines.entry.javascript,
    message: `🚀 初始化八数码难题：初始布局 "${start}"，洛谷经典目标 "${target}"。初始曼哈顿估价 h = ${startH}。`,
    explanation: '左神点拨：3x3 棋盘共有 9!/2 = 181,440 种可达状态。首先通过逆序对奇偶性检查可解性，再用 A* 算法定向剪枝加速。',
    metrics: { '当前布局': start, '逆序对数': startInv, '初始估价 h': startH, '综合 f': startH },
  });

  // Step 1: 逆序对奇偶剪枝校验
  steps.push({
    boardStr: start,
    targetStr: target,
    curG: 0,
    curH: startH,
    curF: startH,
    openSetSize: 1,
    invCount: startInv,
    isSolvable: solvable,
    status: 'check',
    line: lines.invCheck.javascript,
    message: solvable
      ? `✅ 逆序对奇偶性校验通过：当前逆序对 ${startInv} 与目标逆序对 ${targetInv} 同奇偶，该棋盘必定有解！`
      : `🚫 逆序对奇偶性异性冲突：当前逆序对 ${startInv} 与目标逆序对 ${targetInv} 奇偶不同，数学证明绝对无解，触发瞬时剪枝！`,
    explanation: '在 3x3 网格中，空格左右滑动不改变逆序对；空格上下滑动越过 2 个数字，逆序对变化为 0 或 ±2，奇偶性恒不变。',
    metrics: { '初始逆序对': startInv, '目标逆序对': targetInv, '奇偶判定': solvable ? '同奇偶' : '异奇偶' },
  });

  if (!solvable) {
    steps.push({
      boardStr: start,
      targetStr: target,
      curG: 0,
      curH: startH,
      curF: startH,
      openSetSize: 0,
      invCount: startInv,
      isSolvable: false,
      status: 'unsolvable',
      ansStep: -1,
      line: lines.noSolution.javascript,
      message: `🚫 八数码无解剪枝生效：初始布局与目标不在同一置换群，直接返回 -1！`,
      explanation: '无需耗费任何广搜时间，直接完成无解判定。',
      metrics: { '最终结果': -1, '状态': '无解剪枝完毕' },
    });
    return steps;
  }

  if (start === target) {
    steps.push({
      boardStr: start,
      targetStr: target,
      curG: 0,
      curH: 0,
      curF: 0,
      openSetSize: 1,
      invCount: startInv,
      isSolvable: true,
      status: 'reach',
      ansStep: 0,
      line: lines.reachTarget.javascript,
      message: `🎉 初始布局即为目标布局，所需移动步数为 0！`,
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
  }

  const pq: Node[] = [{ f: startH, g: 0, h: startH, s: start }];
  const dist = new Map<string, number>([[start, 0]]);

  // Step 2: 起点入堆
  steps.push({
    boardStr: start,
    targetStr: target,
    curG: 0,
    curH: startH,
    curF: startH,
    openSetSize: pq.length,
    invCount: startInv,
    isSolvable: true,
    status: 'search',
    line: lines.initHeap.javascript,
    message: `📥 起始状态压入小根堆：综合代价 f = ${startH}，波前就绪。`,
    metrics: { '波前容量': 1, '当前最优 f': startH },
  });

  let reached = false;
  let maxIters = 120; // 保护上限

  while (pq.length > 0 && maxIters-- > 0) {
    pq.sort((a, b) => a.f - b.f);
    const cur = pq.shift()!;

    steps.push({
      boardStr: cur.s,
      targetStr: target,
      curG: cur.g,
      curH: cur.h,
      curF: cur.f,
      openSetSize: pq.length,
      status: 'expand',
      line: lines.pollMin.javascript,
      message: `🔍 弹出最优状态 "${cur.s}"：已走 g = ${cur.g}，启发距离 h = ${cur.h}，综合 f = ${cur.f}。`,
      metrics: { '展开状态': cur.s, '步数 g': cur.g, '启发 h': cur.h, '波前容量': pq.length },
    });

    if (cur.s === target) {
      reached = true;
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
        message: `🎉 达成八数码目标状态 "${target}"！全局最少移动步数为 ${cur.g} 步！`,
        explanation: 'A* 曼哈顿启发式定向收敛完成，搜索树规模比无向 BFS 缩减超 90%！',
        metrics: { '最终步数': cur.g, '状态': '求解完毕' },
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
      const nxtS = arr.join('');
      const nxtG = cur.g + 1;
      const nxtH = calcEightH(nxtS);
      const nxtF = nxtG + nxtH;

      if (nxtG < (dist.get(nxtS) ?? Infinity)) {
        dist.set(nxtS, nxtG);
        pq.push({ f: nxtF, g: nxtG, h: nxtH, s: nxtS });

        steps.push({
          boardStr: nxtS,
          targetStr: target,
          curG: nxtG,
          curH: nxtH,
          curF: nxtF,
          openSetSize: pq.length,
          status: 'search',
          line: lines.relaxDist.javascript,
          message: `🔄 空格 0 与相邻方块 #${nxt} 对调：生成新棋盘 "${nxtS}" (g=${nxtG}, h=${nxtH}, f=${nxtF})。`,
          metrics: { '新状态': nxtS, '步数 g': nxtG, '启发 h': nxtH, '综合 f': nxtF },
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
      message: `🚫 在当前步数预算内未达目标或无解。`,
      metrics: { '最终结果': -1, '状态': '未达目标' },
    });
  }

  return steps;
}

registerDeclarativeAlgorithm({
  id: 'eight-puzzle-065',
  name: '八数码难题 (A* 逆序对剪枝)',
  category: 'graph',
  difficulty: '困难',
  description: '左程云 Class 065 Code03：3x3 棋盘滑动，逆序对奇偶可解性判定与曼哈顿距离启发式 A* 搜索 (洛谷 P1379)',
  aliases: ['class065-code03', 'eight-puzzle-065', 'eight-puzzle-1379', 'luogu-p1379', 'eight-puzzle-class065'],
  problemHtml: GRAPH_065_PROBLEMS['eight-puzzle-065'].problemHtml,
  analysisHtml: GRAPH_065_PROBLEMS['eight-puzzle-065'].complexityHtml,
  codeLanguages: EIGHT_PUZZLE_065_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'two_steps',
      options: [
        { label: '单步解开用例 "123084765"', value: 'one_step' },
        { label: '两步解开用例 "123840765"', value: 'two_steps' },
        { label: '洛谷经典用例 "283104765"', value: 'luogu_sample' },
        { label: '逆序对奇偶无解剪枝 "123804756"', value: 'unsolvable_parity' },
      ],
    },
  ],
  presets: [
    { label: '单步解开用例 "123084765"', values: { preset: 'one_step' } },
    { label: '两步解开用例 "123840765"', values: { preset: 'two_steps' } },
    { label: '洛谷经典用例 "283104765"', values: { preset: 'luogu_sample' } },
    { label: '逆序对奇偶无解剪枝 "123804756"', values: { preset: 'unsolvable_parity' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildEightPuzzle065Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: EightPuzzleStep) => {
    container.innerHTML = renderEightPuzzleGrid({
      boardStr: step.boardStr,
      targetStr: step.targetStr,
      curG: step.curG,
      curH: step.curH,
      curF: step.curF,
      invCount: step.invCount,
      isSolvable: step.isSolvable,
    });
  },
});
