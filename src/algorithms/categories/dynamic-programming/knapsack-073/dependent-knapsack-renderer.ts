/**
 * 有依赖的背包(模版) (洛谷 P1064 金明的预算方案) - 声明式 4-Card 沙盘渲染器
 * 核心：主件 + 至多2个附件展开为 4 种互斥方案的分组背包
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  DEPENDENT_KNAPSACK_PROBLEM_HTML,
  DEPENDENT_KNAPSACK_ANALYSIS_HTML,
  DEPENDENT_KNAPSACK_CODE_LANGUAGES,
} from './knapsack-073-problem-content';

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
  status: 'init' | 'group' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number;
  metrics?: Record<string, any>;
}

export function buildDependentKnapsackSteps(
  budget: number,
  m: number,
  rawItems: (DependentItem | null)[]
): DependentKnapsackStep[] {
  const steps: DependentKnapsackStep[] = [];
  const N = Math.max(0, budget);
  const dp = new Array(N + 1).fill(0);

  // 1. 构建主件与附件关系
  const isKing = new Array(m + 1).fill(false);
  const fans: number[][] = Array.from({ length: m + 1 }, () => []);

  for (let i = 1; i <= m; i++) {
    const it = rawItems[i];
    if (!it) continue;
    if (it.q === 0) {
      isKing[i] = true;
    } else {
      fans[it.q].push(i);
    }
  }

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

  // 初始化
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
      message: `🛍️ 初始化金明的预算方案：总预算 N=${N}，商品数 M=${m}。建立主件与归属附件树形关系。`,
      log: `init: budget=${N}, items=${m}`,
      codeLine: 8,
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
        codeLine: 11,
      })
    );

    // 倒序枚举预算容量
    for (let j = N; j >= c0; j--) {
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
            message: `✨ 容量 j=${j}：选择【${bestComboLabel}】获得更高收益！dp[${j}] 增至 ${dp[j]}。`,
            log: `update: dp[${j}] = ${dp[j]} via ${bestComboLabel}`,
            codeLine: 13,
          })
        );
      }
    }
  }

  // 完成
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
      message: `🎉 金明的预算规划完成！在总预算 N=${N} 下，能获得的最大总收益为 ${dp[N]}！`,
      log: `done: maxVal=${dp[N]}`,
      codeLine: 24,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<DependentKnapsackStep>({
  id: 'dependent-knapsack-standard',
  name: '有依赖的背包模版 (金明的预算方案)',
  category: 'dynamic-programming',
  badge: {
    mode: '有依赖背包 · 分组背包转化',
    complexity: 'O(N · M) · O(N)',
  },
  card1Title: '🛒 主件-附件拓扑与组合方案透视',
  card2Title: '📊 分组背包收益向量 dp[j] 监视器',
  card2Desc: '展示每个主件组至多 4 种互斥购买方案的倒序更新演化',
  legend: [
    { label: '主件商品 (King)', color: '#f59e0b' },
    { label: '归属附件 (Fan)', color: '#38bdf8' },
    { label: '最优互斥组合', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-budget',
      label: '金明总预算 N',
      type: 'number',
      defaultValue: 1000,
      width: '70px',
    },
    {
      id: 'input-items-json',
      label: '商品清单 JSON (花费, 价值, 归属q)',
      type: 'text',
      defaultValue:
        '[[800,1600,0],[400,2000,1],[400,1200,0],[400,800,3]]',
      width: '260px',
    },
  ],
  presets: [
    {
      label: '金明预算典例 (N=1000, 4商品, Ans=2000)',
      values: {
        'input-budget': 1000,
        'input-items-json':
          '[[800,1600,0],[400,2000,1],[400,1200,0],[400,800,3]]',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-group', label: '当前主件组', color: '#f59e0b' },
    { id: 'metric-cur-budget', label: '当前容量 j', color: '#38bdf8' },
    { id: 'metric-chosen-combo', label: '采用的组合方案', color: '#10b981' },
    { id: 'metric-max-profit', label: '当前最大收益', color: '#a855f7' },
  ],
  codeLanguages: DEPENDENT_KNAPSACK_CODE_LANGUAGES,
  problemHtml: DEPENDENT_KNAPSACK_PROBLEM_HTML,
  analysisHtml: DEPENDENT_KNAPSACK_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const n = parseInt(inputs['input-budget'] || '1000', 10);
    let rawArr: [number, number, number][] = [];
    try {
      rawArr = JSON.parse(
        inputs['input-items-json'] ||
          '[[800,1600,0],[400,2000,1],[400,1200,0],[400,800,3]]'
      );
    } catch {
      rawArr = [
        [800, 1600, 0],
        [400, 2000, 1],
        [400, 1200, 0],
        [400, 800, 3],
      ];
    }
    const items: (DependentItem | null)[] = [null];
    rawArr.forEach(([cost, val, q]) => items.push({ cost, val, q }));
    return buildDependentKnapsackSteps(n, rawArr.length, items);
  },
  renderCanvas: (container, step) => {
    const comboCards = step.combos
      .map((cb) => {
        const isSelected = step.chosenCombo.includes(cb.label);
        const bg = isSelected ? '#064e3b' : '#1e293b';
        const border = isSelected ? '#10b981' : '#334155';
        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:6px; padding:6px 10px; font-size:11px; text-align:center;">
            <div style="font-weight:700; color:#e2e8f0;">${cb.label}</div>
            <div style="color:#94a3b8; margin:2px 0;">花费: ¥${cb.cost}</div>
            <div style="color:#10b981; font-weight:800;">收益: ${cb.val}</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; width:100%; height:100%; justify-content:center; align-items:center; background:#0f172a; padding:12px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">当前主件组互斥方案展开 (Group Combos)</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${comboCards || '<span style="color:#64748b; font-size:11px;">暂无展开组</span>'}
        </div>
        <div style="margin-top:6px; font-size:11px; color:#cbd5e1;">
          状态决策: <span style="color:#10b981; font-weight:800;">${step.chosenCombo}</span>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    // 渲染最近区间采样或末尾
    const len = step.dp.length;
    const cells = step.dp.slice(Math.max(0, len - 20)).map((val, relIdx) => {
      const actualIdx = Math.max(0, len - 20) + relIdx;
      const isCur = step.j === actualIdx;
      const bg = isCur ? '#0284c7' : '#1e293b';
      const border = isCur ? '#38bdf8' : '#334155';
      const color = val > 0 ? '#10b981' : '#64748b';
      return `
        <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:44px; padding:3px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
          <span style="font-size:8px; color:#94a3b8;">${actualIdx}</span>
          <span style="font-size:11px; font-weight:700; color:${color};">${val}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">分组背包 DP 收益向量 dp[0..${len - 1}] (后 20 个单位展示)</div>
        <div style="display:flex; flex-wrap:wrap; max-height:100px; overflow-y:auto; gap:2px; background:#0b1329; padding:6px; border-radius:6px;">
          ${cells.join('')}
        </div>
      </div>
    `;
  },
});

export const DependentKnapsackVisualizer = Visualizer;

registerAlgorithm({
  id: 'dependent-knapsack-standard',
  name: '有依赖的背包模版 (金明的预算方案)',
  viewId: 'algo-dependent-knapsack-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code05：洛谷 P1064 金明的预算方案，每个主件至多 2 个附件展开为 4 种互斥组合的分组背包',
  icon: '🛒',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 81,
  learningGoal: '掌握主附件拓扑依赖向组内互斥状态的展开技巧、分组背包倒序枚举与最优组合择优决策',
});

