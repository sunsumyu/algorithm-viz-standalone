/**
 * 欧几里得翻硬币博弈 (Coin Flip Game SG) - 声明式教学级沙盘渲染器
 * 核心原理：翻硬币博弈分解定理，多硬币综合 SG 值为所有正面硬币位置独立 SG 值的异或和
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { COIN_FLIP_CODES, COIN_FLIP_LINES } from './game-096-stage-codes';
import {
  Game096Step,
  renderBitwiseXorBoard,
  renderPlayerBanner,
} from './game-096-shared';

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
    codeLine: lines.returnAns,
    metrics: { '全局异或和': `${xorSum}`, '终局判定': isFirstWin ? '先手胜 (true)' : '先手负 (false)' },
  });

  return steps;
}

export const coinFlipGameVisualizer = registerDeclarativeAlgorithm<CoinFlipStep>({
  id: 'coin-flip-game-sg-096',
  name: '翻硬币博弈 SG 分解 (Coin Flip Game)',
  category: 'game',
  icon: '🪙',
  difficulty: 3,
  levelOrder: 965,
  learningGoal: '掌握翻硬币博弈独立可加性与 Turning Turtles 正面朝上位置 SG 异或合成',
  problemHtml: GAME_096_PROBLEMS.coinFlipGameSg.html,
  analysisHtml: GAME_096_PROBLEMS.coinFlipGameSg.html,
  inputs: [
    {
      id: 'input-coins',
      label: '硬币状态序列 (0/1，逗号隔开)',
      type: 'text',
      defaultValue: '1, 0, 1, 1, 0, 1',
      placeholder: '例如 1, 0, 1, 1, 0, 1',
    },
  ],
  codeLanguages: COIN_FLIP_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-coins'] ?? '1, 0, 1, 1, 0, 1');
    const coins = raw
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => n === 0 || n === 1);
    return buildCoinFlipSteps(coins.length > 0 ? coins : [1, 0, 1, 1, 0, 1]);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CoinFlipStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部 Banner
    const statusText = step.isFirstWin === undefined
      ? `扫描硬币 #${step.curIdx + 1}...`
      : step.isFirstWin
      ? `正面硬币异或和 X=${step.xorSum} != 0 ➔ 先手必胜`
      : '正面硬币异或和 X=0 ➔ 先手必败';
    const formulaText = `XOR(${step.faceUpSgs.join(' ^ ') || '0'}) = ${step.xorSum}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 硬币行展示
    const coinsBox = document.createElement('div');
    coinsBox.style.cssText = 'display: flex; gap: 10px; justify-content: center; align-items: center; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto;';

    step.coins.forEach((c, idx) => {
      const isCur = step.curIdx === idx;
      const isHead = c === 1;

      const col = document.createElement('div');
      col.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 4px;';

      const coinCircle = document.createElement('div');
      coinCircle.style.cssText = `
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: monospace;
        font-size: 16px;
        font-weight: 800;
        background: ${isHead ? '#fef08a' : '#e2e8f0'};
        border: 2px solid ${isCur ? '#3b82f6' : isHead ? '#ca8a04' : '#94a3b8'};
        color: ${isHead ? '#854d0e' : '#64748b'};
        box-shadow: ${isCur ? '0 0 0 3px rgba(59,130,246,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'};
        transition: all 0.2s ease;
      `;
      coinCircle.textContent = isHead ? '正' : '反';
      col.appendChild(coinCircle);

      const label = document.createElement('div');
      label.style.cssText = 'font-size: 10px; font-weight: 700; color: #64748b; font-family: monospace;';
      label.textContent = `#${idx + 1}`;
      col.appendChild(label);

      const sgTag = document.createElement('div');
      sgTag.style.cssText = `font-size: 9px; font-family: monospace; font-weight: 700; color: ${isHead ? '#2563eb' : '#94a3b8'};`;
      sgTag.textContent = `SG=${idx + 1}`;
      col.appendChild(sgTag);

      coinsBox.appendChild(col);
    });
    root.appendChild(coinsBox);

    // 3. 正面硬币异或看板
    if (step.faceUpSgs.length > 0) {
      renderBitwiseXorBoard(root, step.faceUpSgs, step.xorSum ?? 0);
    }

    stageContainer.appendChild(root);
  },
});
