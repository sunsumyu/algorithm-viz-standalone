/**
 * 双堆巴什博弈与 SG 矩阵 (Two Stones Bash Game) Step Compiler
 * 核心原理：独立游戏 SG 定理，SG(n1, n2) = SG(n1) ^ SG(n2) = (n1 % (m+1)) ^ (n2 % (m+1))
 */

import { TWO_STONES_BASH_LINES } from '../../../algorithms/categories/game/game-096/game-096-stage-codes';
import { Game096Step } from '../../../algorithms/categories/game/game-096/game-096-shared';

export interface TwoStonesBashStep extends Game096Step {
  n1: number;
  n2: number;
  m: number;
  sg1: number;
  sg2: number;
  xorSum: number;
}

export function buildTwoStonesBashSteps(n1: number, n2: number, m: number): TwoStonesBashStep[] {
  const steps: TwoStonesBashStep[] = [];
  const lines = TWO_STONES_BASH_LINES;

  // Step 0: 入口
  steps.push({
    n1,
    n2,
    m,
    sg1: 0,
    sg2: 0,
    xorSum: 0,
    decision: `主函数入口：接收双堆参数 (n1=${n1}, n2=${n2})，单次拿取上限 m=${m}`,
    message: '两堆石子各自为独立巴什博弈，总局势 SG 值为两堆各自 SG 值的异或',
    log: `enter twoStonesBash(n1=${n1}, n2=${n2}, m=${m})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '第一堆 n1': `${n1}`, '第二堆 n2': `${n2}`, '单次上限 m': `${m}` },
  });

  // Step 1: 计算第一堆 SG
  const sg1 = n1 % (m + 1);
  steps.push({
    n1,
    n2,
    m,
    sg1,
    sg2: 0,
    xorSum: 0,
    decision: `计算第一堆的 SG 值：sg1 = n1 % (m + 1) = ${n1} % (${m} + 1) = ${sg1}`,
    message: `第一堆的单堆博弈能力等价于 SG 值 ${sg1}`,
    log: `sg1 = ${n1} % ${m + 1} = ${sg1}`,
    line: lines.computeSg1.javascript,
    codeLine: lines.computeSg1,
    metrics: { 'sg1': `${sg1}` },
  });

  // Step 2: 计算第二堆 SG
  const sg2 = n2 % (m + 1);
  steps.push({
    n1,
    n2,
    m,
    sg1,
    sg2,
    xorSum: 0,
    decision: `计算第二堆的 SG 值：sg2 = n2 % (m + 1) = ${n2} % (${m} + 1) = ${sg2}`,
    message: `第二堆的单堆博弈能力等价于 SG 值 ${sg2}`,
    log: `sg2 = ${n2} % ${m + 1} = ${sg2}`,
    line: lines.computeSg2.javascript,
    codeLine: lines.computeSg2,
    metrics: { 'sg1': `${sg1}`, 'sg2': `${sg2}` },
  });

  // Step 3: SG 异或合成与胜负返回
  const xorSum = sg1 ^ sg2;
  const isFirstWin = xorSum !== 0;

  steps.push({
    n1,
    n2,
    m,
    sg1,
    sg2,
    xorSum,
    isFirstWin,
    decision: isFirstWin
      ? `🎉 复合判定：SG(总) = sg1 ^ sg2 = ${sg1} ^ ${sg2} = ${xorSum} != 0 ➔ 先手必胜！返回 true`
      : `💀 复合判定：SG(总) = sg1 ^ sg2 = ${sg1} ^ ${sg2} = 0 ➔ 局势完全对称平衡，先手必败！返回 false`,
    message: isFirstWin
      ? `两堆石子模 ${m + 1} 余数不同 (sg1=${sg1}, sg2=${sg2})，先手总能把余数较大的一堆调整为与另一堆相等，使总异或和变为 0 甩给对手！`
      : `两堆石子模 ${m + 1} 余数相等 (均为 ${sg1})，对手可以完全模仿先手在另一堆的操作，先手必败！`,
    log: `return (${sg1} ^ ${sg2}) != 0 => ${isFirstWin}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '全局 SG 异或和': `${xorSum}`, '终局判定': isFirstWin ? '先手胜 (true)' : '先手负 (false)' },
  });

  return steps;
}
