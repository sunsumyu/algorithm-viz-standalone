import { HighlightTarget } from '../../code-panel';

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
