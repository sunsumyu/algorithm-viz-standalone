/**
 * 三堆石子取斐波那契数 SG 博弈 (Three Stones Pick Fibonacci) Step Compiler
 * 核心原理：单堆转移集合由斐波那契数限定，三堆局势通过 SG 异或合成
 */

import { THREE_STONES_FIB_LINES } from '../../../algorithms/categories/game/game-096/game-096-stage-codes';
import { Game096Step } from '../../../algorithms/categories/game/game-096/game-096-shared';

export interface ThreeStonesFibStep extends Game096Step {
  n1: number;
  n2: number;
  n3: number;
  maxN: number;
  fibs: number[];
  sg1: number;
  sg2: number;
  sg3: number;
}

export function buildThreeStonesFibSteps(
  n1: number,
  n2: number,
  n3: number
): ThreeStonesFibStep[] {
  const steps: ThreeStonesFibStep[] = [];
  const lines = THREE_STONES_FIB_LINES;

  const maxN = Math.max(n1, n2, n3);

  // 1. 生成斐波那契数转移集合
  const fibs = [1, 2];
  while (true) {
    const nextF = fibs[fibs.length - 1] + fibs[fibs.length - 2];
    if (nextF > Math.max(maxN, 2)) break;
    fibs.push(nextF);
  }

  // Step 0: 入口
  steps.push({
    n1,
    n2,
    n3,
    maxN,
    fibs,
    sg1: 0,
    sg2: 0,
    sg3: 0,
    xorSum: 0,
    decision: `主函数入口：接收三堆石子 (${n1}, ${n2}, ${n3})，每步只能取斐波那契数颗`,
    message: `合法单次取法集合 F = [${fibs.join(', ')}]，准备按 mex 算子递推单堆 SG 函数`,
    log: `enter threeStonesFib(n1=${n1}, n2=${n2}, n3=${n3})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '三堆规模': `(${n1}, ${n2}, ${n3})`, '最大堆 maxN': `${maxN}` },
  });

  // Step 1: 确定最大堆规模 maxN
  steps.push({
    n1,
    n2,
    n3,
    maxN,
    fibs,
    sg1: 0,
    sg2: 0,
    sg3: 0,
    xorSum: 0,
    decision: `确定最大打表上限：maxN = max(${n1}, ${n2}, ${n3}) = ${maxN}`,
    message: `仅需自底向上计算单堆 SG(0..${maxN})，即可查表得到三堆各自的 SG 值`,
    log: `maxN = ${maxN}`,
    line: lines.findMaxN.javascript,
    codeLine: lines.findMaxN,
    metrics: { '打表长度': `${maxN + 1}` },
  });

  // Step 2: 递推单堆 SG 函数
  const sg = new Array(maxN + 1).fill(0);
  for (let i = 1; i <= maxN; i++) {
    const appear = new Set<number>();
    for (const f of fibs) {
      if (f <= i) {
        appear.add(sg[i - f]);
      }
    }
    let mex = 0;
    while (appear.has(mex)) mex++;
    sg[i] = mex;
  }

  const sg1 = sg[n1];
  const sg2 = sg[n2];
  const sg3 = sg[n3];

  steps.push({
    n1,
    n2,
    n3,
    maxN,
    fibs,
    sgTable: [...sg],
    sg1,
    sg2,
    sg3,
    xorSum: 0,
    decision: `完成单堆 SG 函数构建：SG(0..${maxN}) = [${sg.join(', ')}]`,
    message: `查表得到各堆 SG 值：SG(${n1})=${sg1}, SG(${n2})=${sg2}, SG(${n3})=${sg3}`,
    log: `sg1=${sg1}, sg2=${sg2}, sg3=${sg3}`,
    line: lines.buildSg.javascript,
    codeLine: lines.buildSg,
    metrics: { [`SG(${n1})`]: `${sg1}`, [`SG(${n2})`]: `${sg2}`, [`SG(${n3})`]: `${sg3}` },
  });

  // Step 3: 异或和计算
  const xorSum = sg1 ^ sg2 ^ sg3;
  const isFirstWin = xorSum !== 0;

  steps.push({
    n1,
    n2,
    n3,
    maxN,
    fibs,
    sgTable: [...sg],
    sg1,
    sg2,
    sg3,
    xorSum,
    isFirstWin,
    decision: `计算三堆总 SG 异或和：xorSum = SG(${n1}) ^ SG(${n2}) ^ SG(${n3}) = ${sg1} ^ ${sg2} ^ ${sg3} = ${xorSum}`,
    message: isFirstWin ? `异或和 ${xorSum} != 0，复合游戏处于非平衡态` : '异或和为 0，复合游戏处于对称平衡态',
    log: `xorSum = ${xorSum}`,
    line: lines.computeXor.javascript,
    codeLine: lines.computeXor,
    metrics: { '总异或和': `${xorSum}`, '状态属性': isFirstWin ? 'N-position (必胜)' : 'P-position (必败)' },
  });

  // Step 4: 终局返回
  steps.push({
    n1,
    n2,
    n3,
    maxN,
    fibs,
    sgTable: [...sg],
    sg1,
    sg2,
    sg3,
    xorSum,
    isFirstWin,
    decision: isFirstWin
      ? `🎉 最终结论：xorSum=${xorSum} != 0 ➔ 先手必胜！返回 true`
      : '💀 最终结论：xorSum=0 ➔ 先手必败！返回 false',
    message: isFirstWin
      ? '先手必能找到某一堆，拿走某个斐波那契数的石子，将全局异或和削至 0 留给后手！'
      : '后手掌握全局必胜反制策略',
    log: `return xorSum != 0 => ${isFirstWin}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '终局判定': isFirstWin ? '先手胜 (true)' : '先手负 (false)' },
  });

  return steps;
}
