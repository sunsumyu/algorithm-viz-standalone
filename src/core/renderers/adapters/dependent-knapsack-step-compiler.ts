/**
 * 有依赖的背包(模版) (洛谷 P1064 金明的预算方案 / 左程云 Class 073 Code05)
 * Step Compiler: 将主附件至多 4 种互斥组合转化为分组背包步进推演
 */

import type { HighlightTarget } from '../../code-panel';

export interface DependentItem {
  cost: number;
  val: number;
  q: number; // 0 为主件，非0为所属主件编号
}

export interface DependentKnapsackStep {
  groupIndex: number;
  mainId: number;
  j: number;
  dp: number[];
  maxVal: number;
  combos: { label: string; cost: number; val: number }[];
  chosenCombo: string;
  status: 'init' | 'group' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function parseDependentKnapsackInputs(inputs: Record<string, any>): {
  budget: number;
  m: number;
  rawItems: (DependentItem | null)[];
} {
  const budget = parseInt(String(inputs['input-budget'] || '1000'), 10);
  const m = parseInt(String(inputs['input-m'] || '5'), 10);
  const rawItems: (DependentItem | null)[] = new Array(m + 1).fill(null);

  const parts = String(inputs['input-items'] || '')
    .split(';')
    .map((s: string) => s.trim())
    .filter(Boolean);

  for (let i = 0; i < parts.length && i < m; i++) {
    const nums = parts[i]
      .split(',')
      .map((x: string) => parseInt(x.trim(), 10))
      .filter((n: number) => !isNaN(n));
    if (nums.length >= 3) {
      rawItems[i + 1] = { cost: nums[0], val: nums[1], q: nums[2] };
    }
  }

  return { budget, m, rawItems };
}

export function buildDependentKnapsackSteps(
  budget: number,
  m: number,
  rawItems: (DependentItem | null)[]
): DependentKnapsackStep[] {
  const steps: DependentKnapsackStep[] = [];
  const N = Math.max(0, budget);
  const dp = new Array(N + 1).fill(0);

  const lines = {
    init: { java: 7, cpp: 8, python: 1, javascript: 2 },
    parseRelation: { java: 9, cpp: 11, python: 4, javascript: 4 },
    initDp: { java: 8, cpp: 15, python: 3, javascript: 3 },
    groupLoop: { java: 9, cpp: 16, python: 4, javascript: 4 },
    capLoop: { java: 13, cpp: 21, python: 10, javascript: 10 },
    updateDp: { java: 14, cpp: 23, python: 11, javascript: 11 },
    returnAns: { java: 27, cpp: 35, python: 18, javascript: 24 },
  };

  function makeStep(data: Omit<DependentKnapsackStep, 'metrics'>): DependentKnapsackStep {
    const mainStr = data.mainId > 0 ? `#${data.mainId} 主件组` : '—';
    const jStr = data.j >= 0 ? `${data.j}` : '—';
    return {
      ...data,
      metrics: {
        'metric-cur-group': mainStr,
        'metric-cur-budget': jStr,
        'metric-chosen-combo': data.chosenCombo || '—',
        'metric-max-profit': `${data.maxVal}`,
      },
    };
  }

  // 1. 初始化入口
  steps.push(
    makeStep({
      groupIndex: -1,
      mainId: -1,
      j: -1,
      dp: [...dp],
      maxVal: 0,
      combos: [],
      chosenCombo: '无',
      status: 'init',
      message: `🛍️ 初始化金明的预算方案：总预算 N=${N}，商品数 M=${m}。`,
      log: `init: budget=${N}, items=${m}`,
      codeLine: lines.init,
    })
  );

  // 2. 构建主件与附件归属关系
  const isKing = new Array(m + 1).fill(false);
  const fans: number[][] = Array.from({ length: m + 1 }, () => []);

  for (let i = 1; i <= m; i++) {
    const it = rawItems[i];
    if (!it) continue;
    if (it.q === 0) {
      isKing[i] = true;
      steps.push(
        makeStep({
          groupIndex: -1,
          mainId: i,
          j: -1,
          dp: [...dp],
          maxVal: 0,
          combos: [],
          chosenCombo: '主件',
          status: 'init',
          message: `👑 识别商品 #${i} 为【主件】(价格=${it.cost}, 重要度=${it.val})，可挂载至多两个附件。`,
          log: `parse: item #${i} is king`,
          codeLine: lines.parseRelation,
        })
      );
    } else {
      fans[it.q].push(i);
      steps.push(
        makeStep({
          groupIndex: -1,
          mainId: it.q,
          j: -1,
          dp: [...dp],
          maxVal: 0,
          combos: [],
          chosenCombo: '附件',
          status: 'init',
          message: `📎 识别商品 #${i} 为【附件】(归属主件 #${it.q}, 价格=${it.cost}, 重要度=${it.val})。`,
          log: `parse: item #${i} is fan of king #${it.q}`,
          codeLine: lines.parseRelation,
        })
      );
    }
  }

  // 3. DP 数组初始化
  steps.push(
    makeStep({
      groupIndex: -1,
      mainId: -1,
      j: -1,
      dp: [...dp],
      maxVal: 0,
      combos: [],
      chosenCombo: '无',
      status: 'init',
      message: `📊 初始化 DP 数组大小为 ${N + 1}，dp[0..${N}] 初始全为 0。准备开启分组背包决策。`,
      log: `initDp: size=${N + 1}`,
      codeLine: lines.initDp,
    })
  );

  let groupCount = 0;
  for (let i = 1; i <= m; i++) {
    if (!isKing[i]) continue;
    groupCount++;
    const mainIt = rawItems[i]!;
    const c0 = mainIt.cost;
    const v0 = mainIt.val;
    const f = fans[i];
    const f1Id = f.length >= 1 ? f[0] : -1;
    const f2Id = f.length >= 2 ? f[1] : -1;
    const f1 = f1Id !== -1 ? rawItems[f1Id] : null;
    const f2 = f2Id !== -1 ? rawItems[f2Id] : null;

    // 展开 4 种互斥方案
    const combos: { label: string; cost: number; val: number }[] = [
      { label: `仅主件 #${i}`, cost: c0, val: v0 },
    ];
    if (f1) {
      combos.push({ label: `主件 #${i} + 附1 #${f1Id}`, cost: c0 + f1.cost, val: v0 + f1.val });
    }
    if (f2) {
      combos.push({ label: `主件 #${i} + 附2 #${f2Id}`, cost: c0 + f2.cost, val: v0 + f2.val });
    }
    if (f1 && f2) {
      combos.push({
        label: `主件 #${i} + 附1 #${f1Id} + 附2 #${f2Id}`,
        cost: c0 + f1.cost + f2.cost,
        val: v0 + f1.val + f2.val,
      });
    }

    steps.push(
      makeStep({
        groupIndex: groupCount,
        mainId: i,
        j: -1,
        dp: [...dp],
        maxVal: dp[N],
        combos: [...combos],
        chosenCombo: '待决策',
        status: 'group',
        message: `📦 考察第 ${groupCount} 组（主件 #${i}，附件数 ${f.length}）：展开至多 4 种互斥购买方案，转为分组背包决策。`,
        log: `group #${i}: ${combos.map((c) => `${c.label}(花费${c.cost},收益${c.val})`).join(' | ')}`,
        codeLine: lines.groupLoop,
      })
    );

    // 倒序枚举预算容量
    for (let j = N; j >= c0; j--) {
      steps.push(
        makeStep({
          groupIndex: groupCount,
          mainId: i,
          j,
          dp: [...dp],
          maxVal: dp[N],
          combos: [...combos],
          chosenCombo: '试算中',
          status: 'check',
          message: `⏳ 倒序枚举预算：当前预算 j=${j} >= 主件基础花费 ${c0}。`,
          log: `cap loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      let bestComboLabel = '保持上一阶段';
      let bestVal = dp[j];

      for (const cb of combos) {
        if (j >= cb.cost) {
          const candidate = dp[j - cb.cost] + cb.val;
          if (candidate > bestVal) {
            bestVal = candidate;
            bestComboLabel = cb.label;
          }
        }
      }

      if (bestVal > dp[j]) {
        dp[j] = bestVal;
        steps.push(
          makeStep({
            groupIndex: groupCount,
            mainId: i,
            j,
            dp: [...dp],
            maxVal: dp[N],
            combos: [...combos],
            chosenCombo: bestComboLabel,
            status: 'update',
            message: `✨ 预算 j=${j}：选择【${bestComboLabel}】获得更高收益！dp[${j}] 增至 ${dp[j]}。`,
            log: `update: dp[${j}] = ${dp[j]} via ${bestComboLabel}`,
            codeLine: lines.updateDp,
          })
        );
      }
    }
  }

  // 4. 完成终态
  steps.push(
    makeStep({
      groupIndex: groupCount,
      mainId: -1,
      j: N,
      dp: [...dp],
      maxVal: dp[N],
      combos: [],
      chosenCombo: '决策完成',
      status: 'done',
      message: `🎉 金明的预算方案推演完毕！在总预算 ${N} 下，各主附件互斥组合经分组背包求解，最大满足度总值为 ${dp[N]}！`,
      log: `done: maxVal=${dp[N]}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}
