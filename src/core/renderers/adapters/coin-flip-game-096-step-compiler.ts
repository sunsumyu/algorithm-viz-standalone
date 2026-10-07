/**
 * 欧几里得翻硬币博弈 (Coin Flip Game SG) Step Compiler
 * 核心原理：翻硬币博弈分解定理，多硬币综合 SG 值为所有正面硬币位置独立 SG 值的异或和
 */

import { COIN_FLIP_LINES } from '../../../algorithms/categories/game/game-096/game-096-stage-codes';
import { Game096Step } from '../../../algorithms/categories/game/game-096/game-096-shared';

export interface CoinFlipStep extends Game096Step {
  coins: number[];
  curIdx: number;
  faceUpIndices: number[];
  faceUpSgs: number[];
}

// 经典翻硬币博弈：单硬币处于位置 i (1-based) 时的独立 SG 值为 i
function getSingleCoinSG(idx: number): number {
  return idx + 1; // 1-based index
}

export function buildCoinFlipSteps(coinsInput: number[]): CoinFlipStep[] {
  const steps: CoinFlipStep[] = [];
  const lines = COIN_FLIP_LINES;
  const coins = [...coinsInput];

  // Step 0: 入口
  steps.push({
    coins: [...coins],
    curIdx: -1,
    faceUpIndices: [],
    faceUpSgs: [],
    xorSum: 0,
    decision: `主函数入口：接收硬币序列 [${coins.join(', ')}] (1 代表正面朝上，0 代表反面)`,
    message: '翻硬币博弈满足独立可加性，总局势 SG 值为所有正面硬币独立 SG 值的异或和',
    log: `enter coinFlipGame(coins=[${coins.join(', ')}])`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    metrics: { '硬币数': `${coins.length}`, '正面硬币数': `${coins.filter(c => c === 1).length}` },
  });

  // Step 1: 初始化 xorSum
  let xorSum = 0;
  const faceUpIndices: number[] = [];
  const faceUpSgs: number[] = [];

  steps.push({
    coins: [...coins],
    curIdx: -1,
    faceUpIndices: [],
    faceUpSgs: [],
    xorSum: 0,
    decision: '初始化异或和：int xorSum = 0',
    message: '准备顺序扫描硬币序列，提取正面朝上位置',
    log: 'init xorSum = 0',
    line: lines.initXor.javascript,
    codeLine: lines.initXor,
    metrics: { '当前 xorSum': '0' },
  });

  // Step 2: 循环遍历
  for (let i = 0; i < coins.length; i++) {
    const isHead = coins[i] === 1;
    const singleSg = getSingleCoinSG(i);

    steps.push({
      coins: [...coins],
      curIdx: i,
      faceUpIndices: [...faceUpIndices],
      faceUpSgs: [...faceUpSgs],
      xorSum,
      decision: `扫描第 ${i + 1} 枚硬币 (位置下标 ${i})：状态为 ${isHead ? '🟡 正面朝上 (1)' : '⚪ 反面朝下 (0)'}`,
      message: isHead ? `该位置单硬币 SG 值为 ${singleSg}，将累加进异或和` : '反面朝下不参与 SG 贡献，直接跳过',
      log: `scan coin #${i + 1}: ${isHead ? 'HEAD' : 'TAIL'}`,
      line: lines.loopHeader.javascript,
      codeLine: lines.loopHeader,
      metrics: { '当前位置': `#${i + 1}`, '硬币状态': isHead ? '正面' : '反面' },
    });

    if (isHead) {
      const prevXor = xorSum;
      xorSum ^= singleSg;
      faceUpIndices.push(i + 1);
      faceUpSgs.push(singleSg);

      steps.push({
        coins: [...coins],
        curIdx: i,
        faceUpIndices: [...faceUpIndices],
        faceUpSgs: [...faceUpSgs],
        xorSum,
        decision: `异或累加正面硬币：xorSum = ${prevXor} ^ SG(#${i + 1}) = ${prevXor} ^ ${singleSg} = ${xorSum}`,
        message: `当前正面硬币集合位置: [${faceUpIndices.join(', ')}]`,
        log: `xorSum = ${prevXor} ^ ${singleSg} = ${xorSum}`,
        line: lines.accumulate.javascript,
        codeLine: lines.accumulate,
        metrics: { '当前 xorSum': `${xorSum}`, '已计入正面数': `${faceUpIndices.length}` },
      });
    }
  }

  // Step 3: 返回最终结果
  const isFirstWin = xorSum !== 0;
  steps.push({
    coins: [...coins],
    curIdx: -1,
    faceUpIndices: [...faceUpIndices],
    faceUpSgs: [...faceUpSgs],
    xorSum,
    isFirstWin,
    decision: isFirstWin
      ? `🎉 翻硬币终局判定：xorSum=${xorSum} != 0 ➔ 先手必胜！返回 true`
      : '💀 翻硬币终局判定：xorSum=0 ➔ 先手必败！返回 false',
    message: isFirstWin
      ? '先手必能翻转某枚正面硬币及其左侧对应硬币，将全局异或和恢复为 0！'
      : '后手掌握全局反制权',
    log: `return xorSum != 0 => ${isFirstWin}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { '全局异或和': `${xorSum}`, '终局判定': isFirstWin ? '先手胜 (true)' : '先手负 (false)' },
  });

  return steps;
}
