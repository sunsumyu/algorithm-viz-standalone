/**
 * 有依赖的背包(模版) (洛谷 P1064 金明的预算方案) - 声明式 4-Card 沙盘渲染器
 * 核心：主件 + 至多2个附件展开为 4 种互斥方案的分组背包
 * 架构重构：引入四语言代码联动、主附组合双层沙盘与实时预算载荷舱
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  DEPENDENT_KNAPSACK_PROBLEM_HTML,
  DEPENDENT_KNAPSACK_ANALYSIS_HTML,
  DEPENDENT_KNAPSACK_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import { renderKnapsackDpMatrix } from '../../../../core/renderers/knapsack-sandbox-stage';

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

  const lines = {
    init: { java: 7, cpp: 13, python: 3, javascript: 3 },
    groupLoop: { java: 8, cpp: 14, python: 4, javascript: 4 },
    capLoop: { java: 12, cpp: 19, python: 10, javascript: 10 },
    updateDp: { java: 13, cpp: 21, python: 11, javascript: 11 },
    returnAns: { java: 26, cpp: 33, python: 19, javascript: 19 },
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
      codeLine: lines.init,
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
      message: `🎉 金明的预算方案推演完毕！在总预算 ${N} 下，各主附件互斥组合经分组背包求解，最大满足度总值为 ${dp[N]}！`,
      log: `done: maxVal=${dp[N]}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<DependentKnapsackStep>({
  id: 'dependent-knapsack-standard',
  name: '有依赖的背包模版 (金明的预算方案)',
  category: 'dynamic-programming',
  badge: {
    mode: '有依赖背包 · 主件附件互斥转分组',
    complexity: 'O(M · N) · O(N)',
  },
  card1Title: '主件与归属附件展开方案及实时预算载荷舱',
  card2Title: '分组背包收益 DP 向量 dp[0..N]',
  card2Desc: '展示主件与至多 2 个附件展开为 4 种互斥组合并按组内互斥 01 背包倒序转移过程',
  legend: [
    { label: '未选方案', color: '#475569' },
    { label: '当前考察组/方案', color: '#f59e0b' },
    { label: '带来更优更新', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-budget',
      label: '总预算 N',
      type: 'number',
      defaultValue: 1000,
      width: '70px',
    },
    {
      id: 'input-m',
      label: '物品总数 M',
      type: 'number',
      defaultValue: 5,
      width: '50px',
    },
    {
      id: 'input-items',
      label: '物品列表 (价格, 满意度乘积, 所属主件q; 分号分隔)',
      type: 'text',
      defaultValue: '800, 1600, 0; 400, 1200, 1; 300, 900, 1; 400, 1200, 0; 200, 400, 4',
      width: '240px',
    },
  ],
  presets: [
    {
      label: '洛谷经典案例 (N=1000, M=5, 主件1含2附件, 主件4含1附件, Ans=2200)',
      values: {
        'input-budget': 1000,
        'input-m': 5,
        'input-items': '800, 1600, 0; 400, 1200, 1; 300, 900, 1; 400, 1200, 0; 200, 400, 4',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-group', label: '当前考察主件组', color: '#f59e0b' },
    { id: 'metric-cur-budget', label: '当前预算 j', color: '#38bdf8' },
    { id: 'metric-chosen-combo', label: '本轮选中方案', color: '#10b981' },
    { id: 'metric-max-profit', label: '最大满足度收益', color: '#a855f7' },
  ],
  codeLanguages: DEPENDENT_KNAPSACK_CODE_LANGUAGES,
  problemHtml: DEPENDENT_KNAPSACK_PROBLEM_HTML,
  analysisHtml: DEPENDENT_KNAPSACK_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const budget = parseInt(inputs['input-budget'] || '1000', 10);
    const m = parseInt(inputs['input-m'] || '5', 10);
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

    return buildDependentKnapsackSteps(budget, m, rawItems);
  },
  renderCanvas: (container, step) => {
    const combosHtml = step.combos.length > 0
      ? step.combos
          .map((cb) => {
            const isChosen = step.chosenCombo.includes(cb.label);
            let bg = 'rgba(15, 23, 42, 0.6)';
            let border = '#334155';
            let badge = '<span style="color:#64748b; font-size:9px;">备选组合</span>';

            if (isChosen) {
              bg = 'rgba(6, 95, 70, 0.4)';
              border = '#10b981';
              badge = '<span style="background:#059669; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 本步最优</span>';
            }

            return `
              <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 12px; min-width:130px; flex:1; max-width:200px; display:flex; flex-direction:column; gap:3px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:11px; font-weight:700; color:#cbd5e1;">${cb.label}</span>
                  ${badge}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-top:2px;">
                  <span style="color:#94a3b8;">耗资: <b style="color:#38bdf8;">${cb.cost}</b></span>
                  <span style="color:#10b981;">满足度: <b>+${cb.val}</b></span>
                </div>
              </div>
            `;
          })
          .join('')
      : `<span style="color:#64748b; font-size:11px;">(当前无展开方案或已决策完毕)</span>`;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:8px;">
          <div style="font-size:12px; color:#94a3b8; font-weight:700;">🛍️ 主件及其归属附件展开方案 (至多 4 种互斥组合)</div>
          <div style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
            当前考察预算: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.dp.length - 1}
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${combosHtml}
        </div>

        <!-- 底部实时预算载荷舱 -->
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">🛍️ 金明预算载荷舱</span>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>当前决策组合: <b style="color:#10b981;">${step.chosenCombo}</b></span>
              <span>累计满足度: <b style="color:#f59e0b;">${step.maxVal}</b></span>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    renderKnapsackDpMatrix(container, {
      ...step,
      items: [],
      currentGroupItems: [],
      selectedItems: [],
      groupIndex: step.groupIndex,
      itemIndex: -1,
    }, `分组背包收益 DP 向量 dp[0..${step.dp.length - 1}]`);
  },
});

export const DependentKnapsackVisualizer = Visualizer;

registerAlgorithm({
  id: 'dependent-knapsack-standard',
  name: '有依赖的背包模版 (金明的预算方案)',
  viewId: 'algo-dependent-knapsack-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code05：洛谷 P1064 金明的预算方案，主件附件组合展开为互斥分组背包求解',
  icon: '🛍️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 81,
  learningGoal: '掌握主附件组合向分组背包的转化思想，深刻体会至多2个附件常数展开的工程设计',
});
