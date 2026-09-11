/**
 * 能成功找零的钱数种类 (POJ 1742 混合窗口优化) - 声明式 4-Card 沙盘渲染器
 * 核心：混合背包三路分支 (c=1 -> 01, v*c>=m -> 完全, 其它 -> 布尔滑块滑动更新)，平摊 O(1)
 * 架构重构：引入四语言代码联动、双层沙盘与实时找零面值覆盖舱
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import {
  COINS_CHANGE_STAGE1_CODE_LANGUAGES,
  COINS_CHANGE_STAGE2_CODE_LANGUAGES,
  COINS_CHANGE_STAGE3_CODE_LANGUAGES,
} from './knapsack-075-stage-codes';
import {
  buildCoinsChangeRecursionSteps,
  buildCoinsChangeMemoSteps,
  buildCoinsChange2DSteps,
} from './bounded-knapsack-stage-evolution';
import {
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from '../../../../core/renderers/special-stage-cards';


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
  status: 'init' | 'coin' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function parseCoinsChangeInputs(inputs: Record<string, any>) {
  const m = Math.max(0, parseInt(inputs['input-m'], 10) || 0);
  const parseList = (str: string) =>
    (str || '')
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

  const valList = parseList(inputs['input-vals']);
  const cntList = parseList(inputs['input-cnts']);
  return { m, valList, cntList };
}

export function buildCoinsChangeKindsSteps(inputs: Record<string, any>): CoinsChangeKindsStep[] {
  const { m, valList, cntList } = parseCoinsChangeInputs(inputs);

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

  const lines = {
    initDp: { java: 3, cpp: 3, python: 3, javascript: 3 },
    coinLoop: { java: 5, cpp: 5, python: 5, javascript: 5 },
    strategy01: { java: 6, cpp: 6, python: 7, javascript: 7 },
    strategyUnbounded: { java: 8, cpp: 8, python: 10, javascript: 9 },
    strategyWindow: { java: 10, cpp: 10, python: 13, javascript: 11 },
    returnAns: { java: 24, cpp: 24, python: 26, javascript: 27 },
  };

  const dp = new Array(m + 1).fill(false);
  dp[0] = true;

  const countKinds = (arr: boolean[]) => {
    let count = 0;
    for (let j = 1; j <= m; j++) {
      if (arr[j]) count++;
    }
    return count;
  };

  const makeStep = (data: Partial<CoinsChangeKindsStep> & {
    status: CoinsChangeKindsStep['status'];
    message: string;
    log: string;
  }): CoinsChangeKindsStep => {
    const coinIdx = data.coinIndex ?? -1;
    const modVal = data.mod ?? -1;
    const jVal = data.j ?? -1;
    const curTotal = data.totalKinds ?? countKinds(dp);

    let stratStr = '—';
    if (coinIdx >= 0 && coins[coinIdx]) {
      const s = coins[coinIdx].strategy;
      stratStr = s === '01' ? '01背包倒序' : s === 'unbounded' ? '完全背包正序' : '布尔滑窗多重背包';
    }

    return {
      coinIndex: coinIdx,
      mod: modVal,
      j: jVal,
      dp: [...dp],
      totalKinds: curTotal,
      targetM: m,
      coins: [...coins],
      status: data.status,
      message: data.message,
      log: data.log,
      codeLine: data.codeLine,
      metrics: {
        'metric-target-m': `${m} 元`,
        'metric-cur-coin': coinIdx >= 0 ? `货币 #${coinIdx + 1}` : '—',
        'metric-branch-strategy': stratStr,
        'metric-total-kinds': `${curTotal} 种`,
      },
    };
  };

  steps.push(
    makeStep({
      status: 'init',
      message: `💰 初始化找零沙盘：目标上限金额 m=${m}，dp[0]=true，共有 ${n} 种可用货币。`,
      log: `init: m=${m}, n=${n}`,
      codeLine: lines.initDp,
    })
  );

  if (n === 0 || m === 0) {
    steps.push(
      makeStep({
        j: 0,
        status: 'done',
        message: '🏁 上限金额为 0 或无可用硬币，能找零的金额种类为 0。',
        log: 'done: kinds=0',
        codeLine: lines.returnAns,
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
        message: `🪙 考察货币 #${i + 1} (面值=${v} 元，拥有=${c} 张)：进入分支判定。`,
        log: `coin #${i + 1}: v=${v}, c=${c}`,
        codeLine: lines.coinLoop,
      })
    );

    if (coin.strategy === '01') {
      // 01 背包倒序
      steps.push(
        makeStep({
          coinIndex: i,
          status: 'check',
          message: `🎯 判定为单张 01 背包 (c=1)：倒序枚举容量 j 从 ${m} 到 ${v}。`,
          log: `strategy: 01 knapsack for coin #${i + 1}`,
          codeLine: lines.strategy01,
        })
      );

      for (let j = m; j >= v; j--) {
        if (dp[j - v] && !dp[j]) {
          dp[j] = true;
          steps.push(
            makeStep({
              coinIndex: i,
              j,
              status: 'update',
              message: `✨ 解锁新金额：利用面值 ${v} 元成功凑出金额 ${j} 元！`,
              log: `dp[${j}] = true`,
              codeLine: lines.strategy01,
            })
          );
        }
      }
    } else if (coin.strategy === 'unbounded') {
      // 完全背包正序
      steps.push(
        makeStep({
          coinIndex: i,
          status: 'check',
          message: `♾️ 判定为充裕完全背包 (v·c=${v * c} >= m=${m})：正序枚举容量 j 从 ${v} 到 ${m}。`,
          log: `strategy: unbounded knapsack for coin #${i + 1}`,
          codeLine: lines.strategyUnbounded,
        })
      );

      for (let j = v; j <= m; j++) {
        if (dp[j - v] && !dp[j]) {
          dp[j] = true;
          steps.push(
            makeStep({
              coinIndex: i,
              j,
              status: 'update',
              message: `✨ 解锁新金额：利用充裕面值 ${v} 累加凑出金额 ${j} 元！`,
              log: `dp[${j}] = true`,
              codeLine: lines.strategyUnbounded,
            })
          );
        }
      }
    } else {
      // 布尔滑窗优化
      steps.push(
        makeStep({
          coinIndex: i,
          status: 'check',
          message: `🪟 判定为多重背包 (c=${c})：采用同余余数模 ${v} 布尔滑块计数，平摊 O(1) 转移！`,
          log: `strategy: boolean window for coin #${i + 1}`,
          codeLine: lines.strategyWindow,
        })
      );

      for (let mod = 0; mod < v; mod++) {
        let trueCnt = 0;
        for (let j = m - mod, sz = 0; j >= 0 && sz <= c; j -= v, sz++) {
          if (dp[j]) trueCnt++;
        }

        for (let j = m - mod, l = j - v * (c + 1); j >= 1; j -= v, l -= v) {
          if (dp[j]) {
            trueCnt--;
          } else if (trueCnt > 0) {
            dp[j] = true;
            steps.push(
              makeStep({
                coinIndex: i,
                mod,
                j,
                status: 'update',
                message: `✨ 布尔滑窗命中：当前窗口内存在真值 (trueCnt=${trueCnt})，成功解锁金额 ${j} 元！`,
                log: `dp[${j}] = true via boolean window`,
                codeLine: lines.strategyWindow,
              })
            );
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
      j: m,
      totalKinds: finalKinds,
      status: 'done',
      message: `🎉 找零种类统计完毕！在 1..${m} 元金额范围内，使用现有货币共能凑出 ${finalKinds} 种不同金额！`,
      log: `done: totalKinds=${finalKinds}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<CoinsChangeKindsStep | any>({
  id: 'coins-change-kinds',
  name: '能成功找零的钱数种类 (POJ 1742 混合窗口优化)',
  category: 'dynamic-programming',
  badge: {
    mode: '混合背包 · 布尔滑窗优化',
    complexity: 'O(N · M) · O(M)',
  },
  card1Title: '🪙 货币储备资产库与找零面值解锁仓',
  card2Title: '📊 找零金额可行性向量 dp[1..M]',
  card2Desc: '展示 01背包、完全背包与布尔滑窗根据货币面值与数量的自适应分流推演',
  legend: [
    { label: '不可凑出金额 (False)', color: '#475569' },
    { label: '可成功凑出金额 (True)', color: '#10b981' },
    { label: '当前正在考察金额 j', color: '#38bdf8' },
  ],
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
  defaultStage: 'stage-4',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(Π(c_i+1))',
      theme: 'bg-rose',
      badge: {
        mode: '找零种类 · 暴力递归判定',
        complexity: 'O(Π(c_i+1)) · O(N) 栈深',
      },
      card1Title: '🌲 找零可行性枚举决策树',
      card2Title: '🔄 递归调用栈与监控',
      codeLanguages: COINS_CHANGE_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { m, valList, cntList } = parseCoinsChangeInputs(inputs);
        return buildCoinsChangeRecursionSteps(m, valList, cntList);
      },
      renderCanvas: (container, step) => {
        const infoHtml = `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px;">
            <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:4px;">${step.decision}</div>
            <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
          </div>
        `;
        renderSpecialRecursionCard1(container, {
          title: step.i < step.n ? `正在决策货币 #${step.i + 1}` : '所有货币枚举完成',
          callStack: step.callStack || [],
          customInfoHtml: infoHtml,
        });
      },
      renderCustomMetrics: (container, step) => {
        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:8px; align-items:center; justify-content:center; height:100%; padding:16px; box-sizing:border-box;">
            <div style="font-size:13px; font-weight:700; color:#f43f5e;">🪙 找零递归调用开销监控</div>
            <div style="display:flex; gap:16px; margin-top:8px;">
              <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
                <div style="font-size:11px; color:#64748b;">当前调用深度</div>
                <div style="font-size:20px; font-weight:800; color:#fbbf24;">${step.callStack?.length ?? 0}</div>
              </div>
              <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
                <div style="font-size:11px; color:#64748b;">剩余待凑金额</div>
                <div style="font-size:20px; font-weight:800; color:#38bdf8;">${step.remCap ?? 0} 元</div>
              </div>
            </div>
            <div style="font-size:11px; color:#64748b; text-align:center; max-width:320px; margin-top:6px;">
              暴力搜索每种货币使用 0..c[i] 张的分支组合，在无备忘录时呈现组合爆炸。
            </div>
          </div>
        `;
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N · M)',
      theme: 'bg-blue',
      badge: {
        mode: '找零种类 · 记忆化搜索',
        complexity: 'O(N · M · c) · O(N · M) 备忘录',
      },
      card1Title: '💾 找零备忘录探查 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存矩阵 memo[i][rem]',
      codeLanguages: COINS_CHANGE_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { m, valList, cntList } = parseCoinsChangeInputs(inputs);
        return buildCoinsChangeMemoSteps(m, valList, cntList);
      },
      renderCanvas: (container, step) =>
        renderSpecialMemoCard1(container, {
          stateStr: `checkMemo(i=${step.i}, rem=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container, step) =>
        renderSpecialMemoCard2(container, {
          title: '找零备忘录 memo[i][rem] (1=True, 0=False)',
          memo: step.memoGrid,
          curI: step.i,
          curJ: step.remCap,
        }),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N · M · c)',
      theme: 'bg-emerald',
      badge: {
        mode: '找零种类 · 严格二维布尔 DP',
        complexity: 'O(N · M · c) · O(N · M)',
      },
      card1Title: '📐 找零可行性转移推导',
      card2Title: '📊 严格二维状态表 dp[i][j]',
      codeLanguages: COINS_CHANGE_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { m, valList, cntList } = parseCoinsChangeInputs(inputs);
        return buildCoinsChange2DSteps(m, valList, cntList);
      },
      renderCanvas: (container, step) =>
        renderSpecial2DCard1(container, {
          cellName: `dp[${step.curI}][${step.curJ}]`,
          cellValStr: `${step.dpTable?.[step.curI]?.[step.curJ] === 1 ? 'True (可凑出)' : 'False (不可凑出)'}`,
          depCells: step.depCells || [],
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container, step) =>
        renderSpecial2DCard2(container, {
          title: '严格二维状态表 dp[i][j] (1=True, 0=False)',
          dp: step.dpTable,
          curI: step.curI,
          curJ: step.curJ,
          depCells: (step.depCells || []).map((d: any) => ({ r: d.r, c: d.c })),
        }),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间与滑块优化',
      shortName: '滑块优化',
      num: 4,
      timeBadge: 'O(N · M) 极限',
      theme: 'bg-amber',
      badge: {
        mode: '混合背包 · 三路分流 + 布尔滑块平摊 O(1)',
        complexity: 'O(N · M) · O(M)',
      },
      card1Title: '🪙 货币储备资产库与找零面值解锁仓',
      card2Title: '📊 找零金额可行性向量 dp[1..M]',
      codeLanguages: KNAPSACK_075_PROBLEMS['coins-change-kinds'].codeLanguages,
      buildSteps: buildCoinsChangeKindsSteps,
      renderCanvas: (container, step) => {
        const ratio = Math.min(100, Math.round((step.totalKinds / Math.max(1, step.targetM)) * 100));

        const coinsHtml = step.coins
          .map((c: any, idx: number) => {
            const isCur = idx === step.coinIndex;
            const tag = c.strategy === '01' ? '🎯 01背包' : c.strategy === 'unbounded' ? '♾️ 完全' : '🪟 布尔滑窗';
            return `
              <div style="background:${isCur ? 'rgba(30, 27, 75, 0.7)' : 'rgba(241, 245, 249, 0.9)'}; border:1.5px solid ${
              isCur ? '#f59e0b' : '#334155'
            }; border-radius:6px; padding:6px 10px; min-width:110px; flex:1; max-width:180px; display:flex; flex-direction:column; gap:3px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:11px; font-weight:700; color:${isCur ? '#f59e0b' : '#fbbf24'};">货币 #${idx + 1}</span>
                  <span style="font-size:9px; background:#78350f; color:#fde68a; padding:1px 4px; border-radius:3px;">${tag}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
                  <span style="color:#374151;">面值: <b style="color:#38bdf8;">${c.val} 元</b></span>
                  <span style="color:#374151;">拥有: <b>${c.cnt} 张</b></span>
                </div>
              </div>
            `;
          })
          .join('');

        const solvedList: number[] = [];
        for (let j = 1; j <= step.targetM; j++) {
          if (step.dp[j]) solvedList.push(j);
        }

        const solvedTagsHtml = solvedList.length > 0
          ? solvedList.map((val) => `
              <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:4px; padding:2px 6px; font-size:10.5px; color:#a7f3d0; font-weight:700;">
                ${val} 元
              </div>
            `).join('')
          : `<span style="color:#64748b; font-size:11px;">(暂未凑出任何金额)</span>`;

        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
              <div style="font-size:12px; color:#64748b; font-weight:700;">🪙 货币储备资产库 (01 / 完全 / 布尔滑窗自适应分流)</div>
              <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
                金额上限 M: <b style="color:#38bdf8;">${step.targetM}</b> 元
              </div>
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
              ${coinsHtml}
            </div>

            <!-- 底部实时找零解锁舱 -->
            <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11.5px; font-weight:800; color:#374151;">💰 已解锁可找零金额种类</span>
                <div style="display:flex; gap:16px; font-size:11px;">
                  <span>解锁种类: <b style="color:#10b981;">${step.totalKinds}</b> / ${step.targetM} 种 (${ratio}%)</span>
                </div>
              </div>

              <div style="width:100%; height:8px; background:#e8f0fe; border-radius:4px; overflow:hidden;">
                <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #38bdf8, #10b981); transition:width 0.25s ease;"></div>
              </div>

              <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
                <span style="color:#64748b; font-size:10.5px; min-width:65px;">可找零金额:</span>
                ${solvedTagsHtml}
              </div>
            </div>
          </div>
        `;
      },
      renderCustomMetrics: (container, step) => {
        const cells = step.dp.slice(1).map((ok: any, idx: number) => {
          const money = idx + 1;
          const isCur = step.j === money;
          const bg = isCur ? '#0284c7' : ok ? '#065f46' : '#1e293b';
          const border = isCur ? '#38bdf8' : ok ? '#34d399' : '#334155';
          const color = ok ? '#34d399' : '#64748b';
          return `
            <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:30px; padding:3px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
              <span style="font-size:8px; color:#64748b;">${money}元</span>
              <span style="font-size:10.5px; font-weight:700; color:${color};">${ok ? 'T' : 'F'}</span>
            </div>
          `;
        });

        container.innerHTML = `
          <div style="width:100%; height:100%; display:flex; flex-direction:column; padding:2px 4px; box-sizing:border-box; flex:1; min-height:0; overflow:hidden;">
            <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:700; flex-shrink:0;">找零金额可行性向量 dp[1..${step.targetM}] (T=可找零, F=不可找零)</div>
            <div style="display:flex; flex-wrap:wrap; align-content:flex-start; flex:1; min-height:0; overflow-y:auto; gap:2px; background:#f1f5f9; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
              ${cells.join('')}
            </div>
          </div>
        `;
      },
    },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['coins-change-kinds'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['coins-change-kinds'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['coins-change-kinds'].analysisHtml,
  buildSteps: buildCoinsChangeKindsSteps,
  renderCanvas: (container, step) => {
    const ratio = Math.min(100, Math.round((step.totalKinds / Math.max(1, step.targetM)) * 100));

    const coinsHtml = step.coins
      .map((c: any, idx: number) => {
        const isCur = idx === step.coinIndex;
        const tag = c.strategy === '01' ? '🎯 01背包' : c.strategy === 'unbounded' ? '♾️ 完全' : '🪟 布尔滑窗';
        return `
          <div style="background:${isCur ? 'rgba(30, 27, 75, 0.7)' : 'rgba(241, 245, 249, 0.9)'}; border:1.5px solid ${
          isCur ? '#f59e0b' : '#334155'
        }; border-radius:6px; padding:6px 10px; min-width:110px; flex:1; max-width:180px; display:flex; flex-direction:column; gap:3px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; font-weight:700; color:${isCur ? '#f59e0b' : '#fbbf24'};">货币 #${idx + 1}</span>
              <span style="font-size:9px; background:#78350f; color:#fde68a; padding:1px 4px; border-radius:3px;">${tag}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
              <span style="color:#374151;">面值: <b style="color:#38bdf8;">${c.val} 元</b></span>
              <span style="color:#374151;">拥有: <b>${c.cnt} 张</b></span>
            </div>
          </div>
        `;
      })
      .join('');

    const solvedList: number[] = [];
    for (let j = 1; j <= step.targetM; j++) {
      if (step.dp[j]) solvedList.push(j);
    }

    const solvedTagsHtml = solvedList.length > 0
      ? solvedList.map((val) => `
          <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:4px; padding:2px 6px; font-size:10.5px; color:#a7f3d0; font-weight:700;">
            ${val} 元
          </div>
        `).join('')
      : `<span style="color:#64748b; font-size:11px;">(暂未凑出任何金额)</span>`;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
          <div style="font-size:12px; color:#64748b; font-weight:700;">🪙 货币储备资产库 (01 / 完全 / 布尔滑窗自适应分流)</div>
          <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
            金额上限 M: <b style="color:#38bdf8;">${step.targetM}</b> 元
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${coinsHtml}
        </div>

        <!-- 底部实时找零解锁舱 -->
        <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#374151;">💰 已解锁可找零金额种类</span>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>解锁种类: <b style="color:#10b981;">${step.totalKinds}</b> / ${step.targetM} 种 (${ratio}%)</span>
            </div>
          </div>

          <div style="width:100%; height:8px; background:#e8f0fe; border-radius:4px; overflow:hidden;">
            <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #38bdf8, #10b981); transition:width 0.25s ease;"></div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
            <span style="color:#64748b; font-size:10.5px; min-width:65px;">可找零金额:</span>
            ${solvedTagsHtml}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const cells = step.dp.slice(1).map((ok: boolean, idx: number) => {
      const money = idx + 1;
      const isCur = step.j === money;
      const bg = isCur ? '#0284c7' : ok ? '#065f46' : '#1e293b';
      const border = isCur ? '#38bdf8' : ok ? '#34d399' : '#334155';
      const color = ok ? '#34d399' : '#64748b';
      return `
        <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:30px; padding:3px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
          <span style="font-size:8px; color:#64748b;">${money}元</span>
          <span style="font-size:10.5px; font-weight:700; color:${color};">${ok ? 'T' : 'F'}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width:100%; height:100%; display:flex; flex-direction:column; padding:2px 4px; box-sizing:border-box; flex:1; min-height:0; overflow:hidden;">
        <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:700; flex-shrink:0;">找零金额可行性向量 dp[1..${step.targetM}] (T=可找零, F=不可找零)</div>
        <div style="display:flex; flex-wrap:wrap; align-content:flex-start; flex:1; min-height:0; overflow-y:auto; gap:2px; background:#f1f5f9; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
          ${cells.join('')}
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
