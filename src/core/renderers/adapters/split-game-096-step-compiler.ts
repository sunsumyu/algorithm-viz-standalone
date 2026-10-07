/**
 * 分裂石子游戏 SG 函数复合 (Split Game SG) Step Compiler
 * 核心原理：一分为二裂变博弈，单状态 SG(x) = mex{ SG(y) ^ SG(z) | y + z = x }
 */

import { SPLIT_GAME_LINES } from '../../../algorithms/categories/game/game-096/game-096-stage-codes';
import { Game096Step } from '../../../algorithms/categories/game/game-096/game-096-shared';

export interface SplitGameStep extends Game096Step {
  n: number;
  splitDetails?: { y: number; z: number; xor: number }[];
}

export function buildSplitGameSteps(n: number): SplitGameStep[] {
  const steps: SplitGameStep[] = [];
  const lines = SPLIT_GAME_LINES;

  const sg = new Array(n + 1).fill(0);

  // Step 0: 入口
  steps.push({
    n,
    sgTable: [...sg],
    curIdx: 0,
    decision: `主函数入口：准备推导石子分裂博弈 SG(0..${n})`,
    message: '一堆石子 x (x>=2) 可裂变为两堆 (y, z)，总 SG 值为 SG(y) ^ SG(z)，单状态值为所有分裂异或值的 mex',
    log: `enter getSplitSG(n=${n})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '目标石子规模 n': `${n}`, 'SG(1)': '0 (无法再分裂)' },
  });

  // Step 1: 内存分配与边界
  steps.push({
    n,
    sgTable: [...sg],
    curIdx: 0,
    decision: `初始化数组：int[] sg = new int[${n + 1}]，基底 SG(0)=0, SG(1)=0`,
    message: '只有 1 颗石子时无法继续分裂，属于终局必败态 SG(1)=0',
    log: 'allocate sg array',
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { 'SG(0)': '0', 'SG(1)': '0' },
  });

  // Step 2: 循环递推 2 ~ n
  for (let i = 2; i <= n; i++) {
    const appear = new Set<number>();
    const splitDetails: { y: number; z: number; xor: number }[] = [];

    // 外层循环
    steps.push({
      n,
      sgTable: [...sg],
      curIdx: i,
      decision: `考察状态 x=${i}：准备枚举所有将其分为两堆 (y, z) 的方案`,
      message: `y 的范围为 1 ~ ${Math.floor(i / 2)}，对应 z = ${i} - y`,
      log: `compute SG(${i})`,
      line: lines.outerLoop.javascript,
      codeLine: lines.outerLoop,
      metrics: { '当前目标 x': `${i}` },
    });

    // 枚举分裂
    for (let y = 1; y <= Math.floor(i / 2); y++) {
      const z = i - y;
      const xorVal = sg[y] ^ sg[z];
      appear.add(xorVal);
      splitDetails.push({ y, z, xor: xorVal });
    }

    steps.push({
      n,
      sgTable: [...sg],
      curIdx: i,
      splitDetails: [...splitDetails],
      appearSet: Array.from(appear),
      decision: `分裂方案枚举：x=${i} ➔ ${splitDetails.map(d => `(${d.y}, ${d.z}) [XOR=${sg[d.y]}^${sg[d.z]}=${d.xor}]`).join(' | ')}`,
      message: `分裂异或值集合: {${Array.from(appear).join(', ')}}，准备取 mex`,
      log: `split combinations for ${i}: ${splitDetails.map(d => `${d.y}+${d.z}=>${d.xor}`).join(',')}`,
      line: lines.innerSplit.javascript,
      codeLine: lines.innerSplit,
      metrics: { '有效分裂方案数': `${splitDetails.length}`, '异或值集合': `{${Array.from(appear).join(',')}}` },
    });

    // 计算 mex
    let mex = 0;
    while (appear.has(mex)) mex++;
    sg[i] = mex;

    steps.push({
      n,
      sgTable: [...sg],
      curIdx: i,
      splitDetails: [...splitDetails],
      appearSet: Array.from(appear),
      computedMex: mex,
      decision: `计算 mex 得到 SG(${i}) = mex{${Array.from(appear).join(', ')}} = ${mex}`,
      message: `写入表格 sg[${i}] = ${mex}`,
      log: `sg[${i}] = ${mex}`,
      line: lines.computeMex.javascript,
      codeLine: lines.computeMex,
      metrics: { [`SG(${i})`]: `${mex}` },
    });
  }

  // Step 3: 收敛返回
  const isFirstWin = sg[n] > 0;
  steps.push({
    n,
    sgTable: [...sg],
    curIdx: n,
    isFirstWin,
    decision: `🎉 推导完成！整个分裂博弈 SG 表: [${sg.join(', ')}]。当前目标 SG(${n}) = ${sg[n]} ➔ ${isFirstWin ? '先手必胜 (SG>0)' : '先手必败 (SG=0)'}`,
    message: '算法成功收敛，揭示游戏裂变与子博弈异或复合规律',
    log: `done split SG, result=${isFirstWin}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { [`SG(${n})`]: `${sg[n]}`, '最终结论': isFirstWin ? '先手胜 (true)' : '先手负 (false)' },
  });

  return steps;
}
