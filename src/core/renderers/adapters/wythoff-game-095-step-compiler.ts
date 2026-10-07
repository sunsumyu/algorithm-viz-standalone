/**
 * 威佐夫博弈 (Wythoff Game) StepCompiler
 * 核心原理：黄金分割比 phi = (sqrt(5)+1)/2，两堆差值 k = b - a，奇异局势 ak = floor(k * phi)
 */

import { WYTHOFF_GAME_LINES } from '../../../algorithms/categories/game/game-095/game-095-stage-codes';
import { Game095Step } from '../../../algorithms/categories/game/game-095/game-095-shared';

export interface WythoffStep extends Game095Step {
  a: number;
  b: number;
  k: number;
  phi: number;
  ak: number;
  bk: number;
  isColdPosition: boolean;
  winningMove?: string;
}

export function buildWythoffSteps(origA: number, origB: number): WythoffStep[] {
  const steps: WythoffStep[] = [];
  const lines = WYTHOFF_GAME_LINES;

  let a = origA;
  let b = origB;
  const phi = (Math.sqrt(5) + 1) / 2;

  // Step 0: 入口
  steps.push({
    a,
    b,
    k: Math.abs(b - a),
    phi,
    ak: 0,
    bk: 0,
    isColdPosition: false,
    piles: [a, b],
    decision: `主函数入口：接收两堆石子 (${a}, ${b})`,
    message: '玩家可从一堆中拿任意颗，或从两堆中拿相同颗。最后拿光者胜。利用黄金分割比奇异局势判定',
    log: `enter wythoff(a=${a}, b=${b})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '第一堆 a': `${a}`, '第二堆 b': `${b}` },
  });

  // Step 1: 归一化排序 a <= b
  if (a > b) {
    const t = a;
    a = b;
    b = t;
    steps.push({
      a,
      b,
      k: b - a,
      phi,
      ak: 0,
      bk: 0,
      isColdPosition: false,
      piles: [a, b],
      decision: `归一化两堆：保证 a <= b ➔ 调整为 (${a}, ${b})`,
      message: '方便按差值统一计算奇异局势编号 k',
      log: `swap a and b => (${a}, ${b})`,
      line: lines.swapMin.javascript,
      codeLine: lines.swapMin,
      metrics: { '规范化 a': `${a}`, '规范化 b': `${b}` },
    });
  }

  // Step 2: 计算差值 k
  const k = b - a;
  steps.push({
    a,
    b,
    k,
    phi,
    ak: 0,
    bk: 0,
    isColdPosition: false,
    piles: [a, b],
    decision: `计算两堆石子差值：k = b - a = ${b} - ${a} = ${k}`,
    message: `第 ${k} 个奇异局势 (先手必败态) 的基底差值必须为 ${k}`,
    log: `k = ${b} - ${a} = ${k}`,
    line: lines.diffK.javascript,
    codeLine: lines.diffK,
    metrics: { '两堆差值 k': `${k}` },
  });

  // Step 3: 计算黄金分割对应理论值 ak
  const ak = Math.floor(k * phi);
  const bk = ak + k;
  const isColdPosition = a === ak;
  const isFirstWin = !isColdPosition;

  // 构造必胜决策说明
  let winningMove = '';
  if (isFirstWin) {
    if (a < ak) {
      winningMove = `当前 a=${a} != ak=${ak}。先手可通过一步操作（如从两堆中同时取走相同石子，或从某堆取走多余石子）将局势转为已知奇异局势！`;
    } else {
      winningMove = `先手可从第二堆中拿走 ${b - bk} 颗石子，使其变为第 ${k} 奇异局势 (${ak}, ${bk})，必胜！`;
    }
  }

  steps.push({
    a,
    b,
    k,
    phi,
    ak,
    bk,
    isColdPosition,
    piles: [a, b],
    winningMove,
    decision: `计算第 ${k} 奇异局势：ak = floor(k * phi) = floor(${k} * 1.61803...) = ${ak}，对应理论局势 (${ak}, ${bk})`,
    message: `对比实际较小堆 a=${a} 与理论奇异堆 ak=${ak}`,
    log: `compute ak=floor(${k}*phi)=${ak}, bk=${bk}`,
    line: lines.computeAk.javascript,
    codeLine: lines.computeAk,
    metrics: { '理论 ak': `${ak}`, '理论 bk': `${bk}`, '实际 a': `${a}` },
  });

  // Step 4: 返回
  steps.push({
    a,
    b,
    k,
    phi,
    ak,
    bk,
    isColdPosition,
    isFirstWin,
    piles: [a, b],
    winningMove,
    decision: isColdPosition
      ? `💀 判定结论：(${a}, ${b}) 恰好是第 ${k} 个奇异局势！先手必败，返回 false`
      : `🎉 判定结论：(${a}, ${b}) 不是奇异局势 (a=${a} != ak=${ak})！先手必胜，返回 true`,
    message: isColdPosition
      ? '处于奇异局势时，无论先手怎么取，后手总能重新将其恢复为某个较小的奇异局势，直到取光'
      : winningMove,
    log: `return a != ak => ${isFirstWin}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '是否奇异局势': isColdPosition ? '是 (必败)' : '否 (必胜)', '终局判定': isFirstWin ? '先手胜' : '先手负' },
  });

  return steps;
}
