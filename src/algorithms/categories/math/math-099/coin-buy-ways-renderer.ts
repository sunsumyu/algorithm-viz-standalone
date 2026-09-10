/**
 * 硬币购物方案数 (Coin Buy Ways) - 声明式教学级沙盘渲染器
 * 核心原理：完全背包预处理无限制方案 + 16状态子集奇减偶加容斥原理
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { COIN_BUY_WAYS_CODES, COIN_BUY_WAYS_LINES } from './math-099-stage-codes';
import { Math099Step, renderIeFlow } from './math-099-shared';

export interface CoinBuyStep extends Math099Step {
  c: number[];
  d: number[];
  s: number;
}

export function buildCoinBuySteps(
  c: number[],
  d: number[],
  s: number
): CoinBuyStep[] {
  const steps: CoinBuyStep[] = [];
  const lines = COIN_BUY_WAYS_LINES;

  // 1. 完全背包预处理 dp
  const maxS = s + 10;
  const dp: number[] = new Array(maxS + 1).fill(0);
  dp[0] = 1;
  for (let i = 0; i < 4; i++) {
    for (let j = c[i]; j <= maxS; j++) {
      dp[j] += dp[j - c[i]];
    }
  }

  // Step 0: 入口
  steps.push({
    c: [...c],
    d: [...d],
    s,
    decision: `主函数入口：4种硬币面额 [${c.join(', ')}]，数量限制 [${d.join(', ')}]，求支付总金额 s=${s} 的方案数`,
    message: '利用完全背包预处理出无限制方案数，随后枚举 2^4=16 种超额状态进行容斥计算',
    log: `enter buyWays(s=${s})`,
    codeLine: lines.entry,
    metrics: { '支付金额 s': `${s}`, '硬币面额': `[${c.join(',')}]`, '数量限制': `[${d.join(',')}]` },
  });

  // Step 1: 初始化答案
  let ans = 0;
  const ieSubsets: { mask: number; cost: number; sign: number; ways: number }[] = [];

  steps.push({
    c: [...c],
    d: [...d],
    s,
    decision: '初始化方案数累加器：long ans = 0',
    message: '准备遍历 0 ~ 15 共 16 个超限二进制状态 mask',
    log: 'init ans = 0',
    codeLine: lines.initAns,
    metrics: { '初始 ans': '0' },
  });

  // Step 2: 容斥状态遍历
  for (let mask = 0; mask < 16; mask++) {
    let cost = 0;
    let bits = 0;

    for (let i = 0; i < 4; i++) {
      if (((mask >> i) & 1) === 1) {
        bits++;
        cost += (d[i] + 1) * c[i];
      }
    }

    const sign = bits % 2 === 1 ? -1 : 1;
    const ways = s >= cost ? dp[s - cost] : 0;

    if (s >= cost) {
      if (bits % 2 === 1) ans -= ways;
      else ans += ways;
    }

    ieSubsets.push({ mask, cost, sign, ways });

    steps.push({
      c: [...c],
      d: [...d],
      s,
      ieSubsets: [...ieSubsets],
      decision: `考察 Mask #${mask.toString(2).padStart(4, '0')} (选中 ${bits} 种硬币强制超额)：所需溢出金额 cost=${cost}，剩余金额 ${s - cost >= 0 ? s - cost : '不足'} ➔ 方案数=${ways} (${sign > 0 ? '+偶加' : '-奇减'})`,
      message: `当前容斥净累计 ans = ${ans}`,
      log: `mask=${mask}, bits=${bits}, cost=${cost}, ways=${ways}, ans=${ans}`,
      codeLine: lines.applyIE,
      metrics: { '当前 Mask': mask.toString(2).padStart(4, '0'), '溢出金额': `${cost}`, '累计方案 ans': `${ans}` },
    });
  }

  // Step 3: 收敛返回
  steps.push({
    c: [...c],
    d: [...d],
    s,
    ieSubsets: [...ieSubsets],
    finalValue: ans,
    decision: `🎉 容斥计算完成！在硬币数量限制下，支付 ${s} 的合法方案总数严格为 ${ans} 种！`,
    message: '收敛返回',
    log: `return buyWays = ${ans}`,
    codeLine: lines.returnAns,
    metrics: { '最终方案数': `${ans}` },
  });

  return steps;
}

export const coinBuyWaysVisualizer = registerDeclarativeAlgorithm<CoinBuyStep>({
  id: 'coin-buy-ways-099',
  name: '硬币购物方案数 (Coin Buy Ways)',
  category: 'math',
  icon: '🪙',
  difficulty: 3,
  levelOrder: 995,
  learningGoal: '掌握完全背包预处理与 2^k 状态子集容斥原理（奇减偶加）化解有限背包的妙法',
  problemHtml: MATH_099_PROBLEMS.coinBuyWays.html,
  analysisHtml: MATH_099_PROBLEMS.coinBuyWays.html,
  inputs: [
    {
      id: 'input-s',
      label: '支付总金额 s',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 1000,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: COIN_BUY_WAYS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const s = Math.max(1, parseInt(String(inputs?.['input-s'] ?? '10'), 10) || 10);
    const c = [1, 2, 5, 10];
    const d = [3, 2, 3, 1];
    return buildCoinBuySteps(c, d, s);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CoinBuyStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 容斥流水线看板
    if (step.ieSubsets) {
      renderIeFlow(root, step.ieSubsets, step.finalValue ?? 0);
    }

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
