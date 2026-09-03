import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';

export interface CoinType {
  val: number;
  cnt: number;
  strategy: '01' | 'unbounded' | 'bounded-window';
}

export interface CoinsChangeKindsStep {
  coinIndex: number;
  mod: number;
  j: number;
  dp: boolean[];
  totalKinds: number;
  targetM: number;
  coins: CoinType[];
  status: 'init' | 'coin' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number;
}

export function buildCoinsChangeKindsSteps(inputs: Record<string, any>): CoinsChangeKindsStep[] {
  const m = Math.max(0, parseInt(inputs['input-m'], 10) || 0);
  const parseList = (str: string) =>
    (str || '')
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

  const valList = parseList(inputs['input-vals']);
  const cntList = parseList(inputs['input-cnts']);

  const n = Math.min(valList.length, cntList.length);
  const steps: CoinsChangeKindsStep[] = [];

  const coins: CoinType[] = [];
  for (let i = 0; i < n; i++) {
    const v = valList[i];
    const c = cntList[i];
    coins.push({
      val: v,
      cnt: c,
      strategy: c === 1 ? '01' : v * c >= m ? 'unbounded' : 'bounded-window',
    });
  }

  const dp = new Array(m + 1).fill(false);
  dp[0] = true;

  const countKinds = (arr: boolean[]) => {
    let count = 0;
    for (let j = 1; j <= m; j++) {
      if (arr[j]) count++;
    }
    return count;
  };

  const makeStep = (p: Partial<CoinsChangeKindsStep>): CoinsChangeKindsStep => ({
    coinIndex: p.coinIndex ?? -1,
    mod: p.mod ?? -1,
    j: p.j ?? 0,
    dp: [...(p.dp ?? dp)],
    totalKinds: p.totalKinds ?? countKinds(dp),
    targetM: m,
    coins: [...coins],
    status: p.status ?? 'update',
    message: p.message ?? '',
    log: p.log ?? '',
    codeLine: p.codeLine ?? 4,
  });

  steps.push(
    makeStep({
      status: 'init',
      message: `💰 初始化找零沙盘：目标金额上限 m=${m}，共有 ${n} 种面值货币。`,
      log: `init: m=${m}, n=${n}`,
      codeLine: 4,
    })
  );

  if (n === 0 || m === 0) {
    steps.push(
      makeStep({
        status: 'done',
        message: '🏁 目标金额为 0 或无货币可用，可找零种类为 0。',
        log: 'done: kinds=0',
        codeLine: 40,
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const coin = coins[i];
    const v = coin.val;
    const c = coin.cnt;

    steps.push(
      makeStep({
        coinIndex: i,
        status: 'coin',
        message: `🪙 考察货币 #${i + 1} (面值=${v}, 数量=${c})：满足分支【${
          coin.strategy === '01' ? '01背包倒序' : coin.strategy === 'unbounded' ? '完全背包正序' : '多重背包布尔滑窗'
        }】。`,
        log: `coin #${i + 1}: val=${v}, cnt=${c}, strategy=${coin.strategy}`,
        codeLine: coin.strategy === '01' ? 7 : coin.strategy === 'unbounded' ? 12 : 18,
      })
    );

    if (coin.strategy === '01') {
      for (let j = m; j >= v; j--) {
        if (dp[j - v] && !dp[j]) {
          dp[j] = true;
          steps.push(
            makeStep({
              coinIndex: i,
              j,
              dp: [...dp],
              status: 'update',
              message: `✨ 金额 j=${j}：使用 1 张货币 #${i + 1} 成功找零！`,
              log: `dp[${j}]=true via 01 knapsack`,
              codeLine: 9,
            })
          );
        }
      }
    } else if (coin.strategy === 'unbounded') {
      for (let j = v; j <= m; j++) {
        if (dp[j - v] && !dp[j]) {
          dp[j] = true;
          steps.push(
            makeStep({
              coinIndex: i,
              j,
              dp: [...dp],
              status: 'update',
              message: `✨ 金额 j=${j}：货币充足视为完全背包正序累加成功找零！`,
              log: `dp[${j}]=true via unbounded knapsack`,
              codeLine: 14,
            })
          );
        }
      }
    } else {
      // 多重背包布尔窗口优化
      for (let mod = 0; mod < v; mod++) {
        let trueCnt = 0;
        for (let j = m - mod, sz = 0; j >= 0 && sz <= c; j -= v, sz++) {
          if (dp[j]) trueCnt++;
        }
        for (let j = m - mod, l = j - v * (c + 1); j >= 1; j -= v, l -= v) {
          if (dp[j]) {
            trueCnt--;
          } else {
            if (trueCnt > 0) {
              dp[j] = true;
              steps.push(
                makeStep({
                  coinIndex: i,
                  mod,
                  j,
                  dp: [...dp],
                  status: 'update',
                  message: `✨ 金额 j=${j} (同余链 mod=${mod})：布尔滑窗内存在 ${trueCnt} 个可行前驱，判定 dp[${j}]=true 找零成功！`,
                  log: `dp[${j}]=true via boolean sliding window`,
                  codeLine: 28,
                })
              );
            }
          }
          if (l >= 0 && dp[l]) {
            trueCnt++;
          }
        }
      }
    }
  }

  const finalKinds = countKinds(dp);

  steps.push(
    makeStep({
      coinIndex: -1,
      mod: -1,
      j: m,
      status: 'done',
      totalKinds: finalKinds,
      message: `🎉 找零可行性分析完毕！在 1..${m} 的金额范围内，共有 ${finalKinds} 种钱数能够成功找零！`,
      log: `done: totalKinds=${finalKinds}`,
      codeLine: 40,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<CoinsChangeKindsStep>({
  id: 'coins-change-kinds',
  name: '能成功找零的钱数种类 (POJ 1742 混合窗口优化)',
  category: 'dynamic-programming',
  badge: {
    mode: '混合背包 · 布尔滑窗优化',
    complexity: 'O(N · M) · O(M)',
  },
  card1Title: '🪙 货币面值与分支策略 (01 / 完全 / 布尔滑窗自适应分流)',
  card2Title: '📊 可行性向量 dp[1..M] (绿色表示可成功找零)',
  inputs: [
    { id: 'input-m', label: '上限 m:', type: 'number', defaultValue: 10, width: '55px' },
    { id: 'input-vals', label: '面值 vals:', type: 'text', defaultValue: '1, 2, 4', width: '110px' },
    { id: 'input-cnts', label: '张数 cnts:', type: 'text', defaultValue: '2, 1, 1', width: '110px' },
  ],
  presets: [
    {
      label: 'POJ 经典样例 (m=10, vals=[1,2,4], cnts=[2,1,1], Ans=8种)',
      values: { 'input-m': 10, 'input-vals': '1, 2, 4', 'input-cnts': '2, 1, 1' },
    },
    {
      label: '完全充裕货币 (m=15, vals=[3,5], cnts=[10,10], Ans=10种)',
      values: { 'input-m': 15, 'input-vals': '3, 5', 'input-cnts': '10, 10' },
    },
  ],
  metrics: [
    { id: 'metric-target-m', label: '金额上限 M', color: '#94a3b8' },
    { id: 'metric-cur-coin', label: '当前考察货币', color: '#f59e0b' },
    { id: 'metric-branch-strategy', label: '采用分支策略', color: '#8b5cf6' },
    { id: 'metric-total-kinds', label: '可找零钱数种类', color: '#10b981' },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['coins-change-kinds'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['coins-change-kinds'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['coins-change-kinds'].analysisHtml,
  buildSteps: buildCoinsChangeKindsSteps,
  renderCustomStep: (step, { container, updateMetric }) => {
    updateMetric('metric-target-m', `${step.targetM}`);
    updateMetric('metric-cur-coin', step.coinIndex >= 0 ? `货币 #${step.coinIndex + 1}` : '—');
    if (step.coinIndex >= 0 && step.coins[step.coinIndex]) {
      const s = step.coins[step.coinIndex].strategy;
      updateMetric('metric-branch-strategy', s === '01' ? '01背包倒序' : s === 'unbounded' ? '完全背包正序' : '布尔滑窗多重背包');
    } else {
      updateMetric('metric-branch-strategy', '—');
    }
    updateMetric('metric-total-kinds', `${step.totalKinds} 种`);

    const coinsHtml = step.coins
      .map((c, idx) => {
        const isCur = idx === step.coinIndex;
        const tag = c.strategy === '01' ? '🎯 01背包' : c.strategy === 'unbounded' ? '♾️ 完全' : '🪟 布尔滑窗';
        return `
          <div style="background:${isCur ? '#1e293b' : '#0f172a'}; border:1px solid ${
          isCur ? '#f59e0b' : '#334155'
        }; border-radius:6px; padding:6px 10px; min-width:95px; flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; font-weight:700; color:${isCur ? '#f59e0b' : '#fbbf24'};">货币 #${idx + 1}</span>
              <span style="font-size:9px; background:#78350f; color:#fde68a; padding:1px 4px; border-radius:3px;">${tag}</span>
            </div>
            <div style="font-size:12px; color:#f8fafc; margin-top:2px;">💵 面值: <b>${c.val}</b></div>
            <div style="font-size:10px; color:#94a3b8;">📦 拥有: <b>${c.cnt}</b> 张</div>
          </div>
        `;
      })
      .join('');

    const dpCells = step.dp.slice(1)
      .map((ok, idx) => {
        const money = idx + 1;
        const isTarget = money === step.j;
        return `
          <div style="flex:1; min-width:28px; background:${isTarget ? '#2563eb' : ok ? '#065f46' : '#1e293b'};
                      border:1px solid ${isTarget ? '#60a5fa' : ok ? '#34d399' : '#334155'}; border-radius:4px;
                      padding:4px 2px; text-align:center;">
            <div style="font-size:9px; color:#94a3b8;">${money}</div>
            <div style="font-size:11px; font-weight:700; color:${ok ? '#4ade80' : '#64748b'};">${ok ? 'T' : 'F'}</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width:100%; display:flex; flex-direction:column; gap:8px; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">货币储备资产库</div>
        <div style="display:flex; gap:6px; overflow-x:auto; background:#0b1329; padding:6px; border-radius:6px;">
          ${coinsHtml}
        </div>
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">找零金额可行性向量 dp[1..${step.targetM}] (T=可找零, F=不可找零)</div>
        <div style="display:flex; gap:3px; overflow-x:auto; background:#0b1329; padding:6px; border-radius:6px;">
          ${dpCells}
        </div>
      </div>
    `;
  },
});

export const CoinsChangeKindsVisualizer = Visualizer;

registerAlgorithm({
  id: 'coins-change-kinds',
  name: '能成功找零的钱数种类 (POJ 1742 混合窗口优化)',
  viewId: 'algo-coins-change-kinds-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code05：POJ 1742 找零硬币，混合背包三路分支与布尔窗口滑块统计平摊 O(1) 状态转移',
  icon: '💰',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 94,
  learningGoal: '掌握混合背包的工程条件分流思想、布尔可行性问题的窗口滑块优化技巧',
});
